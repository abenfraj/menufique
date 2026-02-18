import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "Menufique <noreply@menufique.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Base HTML layout
// ---------------------------------------------------------------------------
function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Menufique</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#FF6B35;padding:28px 40px;text-align:center;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                🍽️ Menufique
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f0ea;padding:20px 40px;text-align:center;border-top:1px solid #f0e0d0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Menufique — Tous droits réservés<br/>
                <a href="${APP_URL}" style="color:#FF6B35;text-decoration:none;">menufique.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Reusable button component
// ---------------------------------------------------------------------------
function emailButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${href}" style="display:inline-block;background:#FF6B35;color:#ffffff;font-weight:700;font-size:16px;padding:14px 36px;border-radius:8px;text-decoration:none;">
      ${label}
    </a>
  </div>`;
}

// ---------------------------------------------------------------------------
// sendEmail helper
// ---------------------------------------------------------------------------
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  // Silently fail if no API key — don't block the main flow
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY manquant — email non envoyé:", subject);
    return;
  }

  try {
    await getResend().emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Log but never throw — emails are non-critical
    console.error("[email] Erreur lors de l'envoi:", JSON.stringify(err, null, 2));
  }
}

// ---------------------------------------------------------------------------
// Template: Bienvenue
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail(to: string, name?: string | null): Promise<void> {
  const firstName = name?.split(" ")[0] ?? "là";
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1A1A2E;">
      Bienvenue sur Menufique ! 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:16px;color:#4b5563;line-height:1.6;">
      Bonjour ${firstName},<br/><br/>
      Votre compte est prêt. Vous pouvez maintenant créer votre premier menu professionnel en quelques minutes.
    </p>
    <div style="background:#FFF8F2;border-left:4px solid #FF6B35;padding:20px 24px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-weight:700;color:#1A1A2E;font-size:15px;">Vos 3 premières étapes :</p>
      <ol style="margin:0;padding-left:20px;color:#4b5563;font-size:15px;line-height:2;">
        <li>Renseignez les informations de votre restaurant</li>
        <li>Créez votre menu et ajoutez vos plats</li>
        <li>Choisissez un template et téléchargez votre PDF</li>
      </ol>
    </div>
    ${emailButton(`${APP_URL}/dashboard`, "Créer mon premier menu")}
    <p style="margin:0;font-size:14px;color:#9ca3af;text-align:center;">
      Des questions ? Répondez directement à cet email, nous sommes là pour vous aider.
    </p>
  `);

  await sendEmail({ to, subject: "Bienvenue sur Menufique 🍽️", html });
}

// ---------------------------------------------------------------------------
// Template: Reset password
// ---------------------------------------------------------------------------
export async function sendResetPasswordEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1A1A2E;">
      Réinitialisation du mot de passe
    </h1>
    <p style="margin:0 0 24px;font-size:16px;color:#4b5563;line-height:1.6;">
      Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    </p>
    ${emailButton(resetUrl, "Réinitialiser mon mot de passe")}
    <div style="background:#fef3c7;border:1px solid #f59e0b;padding:14px 18px;border-radius:8px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#92400e;">
        ⏳ Ce lien est valable <strong>1 heure</strong> uniquement. Après ce délai, vous devrez refaire une demande.
      </p>
    </div>
    <p style="margin:0;font-size:14px;color:#9ca3af;text-align:center;">
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
    </p>
    <hr style="border:none;border-top:1px solid #f0e0d0;margin:24px 0;" />
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      Ou copiez ce lien dans votre navigateur :<br/>
      <span style="color:#FF6B35;word-break:break-all;">${resetUrl}</span>
    </p>
  `);

  await sendEmail({ to, subject: "Réinitialisation de votre mot de passe Menufique", html });
}

// ---------------------------------------------------------------------------
// Template: Confirmation abonnement Pro
// ---------------------------------------------------------------------------
export async function sendProConfirmationEmail(
  to: string,
  name?: string | null
): Promise<void> {
  const firstName = name?.split(" ")[0] ?? "là";
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1A1A2E;">
      Vous êtes maintenant Pro ! ⭐
    </h1>
    <p style="margin:0 0 24px;font-size:16px;color:#4b5563;line-height:1.6;">
      Félicitations ${firstName} ! Votre abonnement <strong>Menufique Pro</strong> est actif.
    </p>
    <div style="background:#FFF8F2;border:2px solid #FF6B35;padding:24px;border-radius:12px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-weight:700;color:#1A1A2E;font-size:16px;">Ce qui est maintenant disponible :</p>
      <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:15px;line-height:2;">
        <li>✅ Menus illimités</li>
        <li>✅ Tous les templates (Classic, Minimal, Bistrot, Modern, Elegant)</li>
        <li>✅ PDF sans watermark</li>
        <li>✅ Logo personnalisé</li>
        <li>✅ Couleurs et polices personnalisées</li>
        <li>✅ Support prioritaire</li>
      </ul>
    </div>
    ${emailButton(`${APP_URL}/dashboard`, "Accéder à mon espace Pro")}
    <p style="margin:0;font-size:14px;color:#9ca3af;text-align:center;">
      Gérez votre abonnement à tout moment depuis votre tableau de bord.<br/>
      <a href="${APP_URL}/dashboard/billing" style="color:#FF6B35;">Gérer mon abonnement</a>
    </p>
  `);

  await sendEmail({ to, subject: "Votre abonnement Menufique Pro est actif ⭐", html });
}

// ---------------------------------------------------------------------------
// Template: Partage de menu par email
// ---------------------------------------------------------------------------
export async function sendMenuShareEmail(
  to: string,
  restaurantName: string,
  menuName: string,
  menuUrl: string,
  fromName?: string | null
): Promise<void> {
  const sender = fromName ?? restaurantName;
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#1A1A2E;">
      ${sender} vous partage son menu 🍽️
    </h1>
    <p style="margin:0 0 24px;font-size:16px;color:#4b5563;line-height:1.6;">
      Découvrez le menu <strong>${menuName}</strong> de <strong>${restaurantName}</strong> en cliquant sur le lien ci-dessous.
    </p>
    ${emailButton(menuUrl, "Voir le menu")}
    <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;text-align:center;">
      Ou scannez le QR code directement au restaurant.
    </p>
    <hr style="border:none;border-top:1px solid #f0e0d0;margin:24px 0;" />
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
      Vous recevez cet email car un menu vous a été partagé via Menufique.<br/>
      <span style="color:#FF6B35;word-break:break-all;">${menuUrl}</span>
    </p>
  `);

  await sendEmail({
    to,
    subject: `${restaurantName} vous partage son menu 🍽️`,
    html,
  });
}
