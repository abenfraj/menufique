# Epic 13 — Emails transactionnels

**Priorité** : High
**Agent principal** : Dev
**Dépendances** : Resend API key configurée

## Contexte
Implémenter les emails transactionnels via Resend pour les événements clés du parcours utilisateur.

---

## Story 13.1 — Setup Resend + templates de base
**Points** : 3
**Agent** : Dev

### Description
Configurer le client Resend et créer les templates HTML d'email avec le branding Menufique (palette orange).

### Critères d'acceptation
- [ ] Client Resend initialisé dans `src/lib/email.ts`
- [ ] Template de base HTML responsive (header logo, footer, palette orange)
- [ ] Fonction helper `sendEmail({ to, subject, template, data })` réutilisable
- [ ] Gestion d'erreurs avec fallback silencieux (l'email ne doit jamais bloquer le flow principal)

---

## Story 13.2 — Email de bienvenue
**Points** : 2
**Agent** : Dev

### Description
Envoyer un email de bienvenue à l'inscription avec les prochaines étapes.

### Critères d'acceptation
- [ ] Email envoyé automatiquement après inscription réussie
- [ ] Contenu : bienvenue + lien vers le dashboard + 3 étapes pour créer son premier menu
- [ ] Fonctionne pour inscription email/password ET Google OAuth
- [ ] Texte en français, ton chaleureux

---

## Story 13.3 — Email de reset password
**Points** : 2
**Agent** : Dev

### Description
Email avec lien sécurisé pour réinitialiser le mot de passe.

### Critères d'acceptation
- [ ] Token unique avec expiration (1h)
- [ ] Lien vers `/reset-password?token=xxx`
- [ ] Template clair avec bouton CTA
- [ ] Page de reset fonctionnelle (nouveau mot de passe + confirmation)

---

## Story 13.4 — Email de confirmation d'abonnement Pro
**Points** : 1
**Agent** : Dev

### Description
Email de confirmation après upgrade vers le plan Pro via Stripe.

### Critères d'acceptation
- [ ] Déclenché par le webhook Stripe `checkout.session.completed`
- [ ] Contenu : confirmation + récapitulatif du plan + lien portail Stripe
- [ ] Texte en français

---

## Story 13.5 — Email de partage de menu
**Points** : 2
**Agent** : Dev

### Description
Permettre au restaurateur d'envoyer son menu par email (à lui-même ou à un tiers).

### Critères d'acceptation
- [ ] Bouton "Partager par email" sur le dashboard du menu
- [ ] Modal avec champ email destinataire
- [ ] Email contient : lien public du menu + QR code en pièce jointe ou inline
- [ ] Rate limiting : max 10 emails/jour par utilisateur
