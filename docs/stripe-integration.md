# Menufique — Intégration Stripe

## Vue d'ensemble

Stripe gère toute la monétisation : abonnements, paiements, factures, portail client.

## Produits Stripe à créer

### Dans le Dashboard Stripe, créer :

**Produit** : "Menufique Pro"

**Prix (Prices)** :
- `price_pro_monthly` : 9,00 €/mois, récurrence mensuelle
- `price_pro_yearly` : 81,00 €/an, récurrence annuelle (= -25% vs mensuel)

## Flux de paiement — Checkout

```
1. Utilisateur clique "Passer à Pro" (dashboard ou paywall)
2. Frontend → POST /api/stripe/checkout { priceId }
3. Backend :
   a. Vérifie si l'utilisateur a déjà un stripeCustomerId
   b. Sinon, crée un Customer Stripe (stripe.customers.create)
   c. Crée une Checkout Session (stripe.checkout.sessions.create)
   d. Retourne l'URL de checkout
4. Frontend redirige vers Stripe Checkout
5. Utilisateur paye
6. Stripe envoie webhook checkout.session.completed
7. Backend met à jour User.plan = PRO + stocke subscriptionId
8. Utilisateur redirigé vers /dashboard?upgrade=success
```

### Code backend — Création de session

```typescript
// POST /api/stripe/checkout
import { stripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const { priceId } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });

  // Créer ou réutiliser le Customer Stripe
  let customerId = user!.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user!.email,
      metadata: { userId: user!.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user!.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Créer la Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=cancel`,
    metadata: { userId: user!.id },
  });

  return Response.json({ data: { checkoutUrl: checkoutSession.url } });
}
```

## Webhooks Stripe

### Configuration
- URL du webhook : `https://menufique.com/api/stripe/webhooks`
- Événements à écouter :
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

### Code backend — Webhook handler

```typescript
// POST /api/stripe/webhooks
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return Response.json({ error: 'Signature invalide' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'PRO',
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'FREE', stripeSubscriptionId: null },
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      // Envoyer un email de notification via Resend
      // await sendPaymentFailedEmail(invoice.customer_email);
      break;
    }
  }

  return Response.json({ received: true });
}
```

## Portail client Stripe

Permet à l'utilisateur de gérer son abonnement sans quitter Menufique :
- Changer de plan (mensuel ↔ annuel)
- Mettre à jour sa carte bancaire
- Consulter ses factures
- Annuler son abonnement

```typescript
// POST /api/stripe/portal
export async function POST(req: Request) {
  const session = await getServerSession();
  const user = await prisma.user.findUnique({ where: { email: session!.user!.email! } });

  if (!user?.stripeCustomerId) {
    return Response.json({ error: 'Pas d\'abonnement actif' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return Response.json({ data: { portalUrl: portalSession.url } });
}
```

## Gestion des limites par plan

```typescript
// lib/plan-limits.ts
export const PLAN_LIMITS = {
  FREE: {
    maxMenus: 1,
    availableTemplates: ['classic', 'minimal'],
    canCustomizeColors: false,
    canCustomizeFonts: false,
    canUploadLogo: false,
    pdfHasWatermark: true,
  },
  PRO: {
    maxMenus: Infinity,
    availableTemplates: ['classic', 'minimal', 'bistrot', 'elegant', 'modern'],
    canCustomizeColors: true,
    canCustomizeFonts: true,
    canUploadLogo: true,
    pdfHasWatermark: false,
  },
} as const;
```

## Variables d'environnement Stripe

```env
STRIPE_SECRET_KEY=sk_test_...          # Clé secrète (backend uniquement)
STRIPE_PUBLISHABLE_KEY=pk_test_...     # Clé publique (frontend)
STRIPE_WEBHOOK_SECRET=whsec_...        # Secret de vérification webhook
STRIPE_PRICE_PRO_MONTHLY=price_...     # ID du prix mensuel
STRIPE_PRICE_PRO_YEARLY=price_...      # ID du prix annuel
```

## Checklist de test Stripe

- [ ] Paiement carte test (4242 4242 4242 4242) → plan passe en PRO
- [ ] Webhook checkout.session.completed reçu et traité
- [ ] Portail client accessible et fonctionnel
- [ ] Annulation d'abonnement → plan repasse en FREE
- [ ] Paiement échoué → email de notification envoyé
- [ ] Changement mensuel → annuel fonctionne
- [ ] Vérification signature webhook (rejeter les faux webhooks)
