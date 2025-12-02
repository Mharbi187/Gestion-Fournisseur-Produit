// Generate a 6-digit numeric OTP
function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Send OTP email using Brevo API (free tier allows any recipient)
async function sendOTPEmail(to, otp, purpose = 'verification') {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    
    if (!apiKey) {
      console.error('BREVO_API_KEY is not configured');
      return { info: null, error: 'BREVO_API_KEY not configured' };
    }
    
    if (!senderEmail) {
      console.error('BREVO_SENDER_EMAIL is not configured');
      return { info: null, error: 'BREVO_SENDER_EMAIL not configured' };
    }
    
    console.log(`Sending OTP email to: ${to} from: ${senderEmail}`);
    
    const SibApiV3Sdk = require('@getbrevo/brevo');
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    
    const subject = purpose === 'reset' ? 'Votre code de réinitialisation LIVRINI' : 'Votre code de vérification LIVRINI';
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = `
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#222;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#059669;margin:0;">LIVRINI</h1>
        </div>
        <p>Bonjour,</p>
        <p>Voici votre code <strong>${purpose === 'reset' ? 'de réinitialisation' : 'de vérification'}</strong> :</p>
        <div style="background:#f0fdf4;border:2px solid #059669;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
          <p style="font-size:32px;font-weight:700;margin:0;letter-spacing:8px;color:#059669;">${otp}</p>
        </div>
        <p style="color:#666;">Ce code expire dans <strong>10 minutes</strong>.</p>
        <p style="color:#666;">Si vous n'avez pas demandé ce code, ignorez ce message.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
        <p style="color:#999;font-size:12px;text-align:center;">L'équipe LIVRINI</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: 'LIVRINI', email: senderEmail };
    sendSmtpEmail.to = [{ email: to }];
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', result.messageId);
    return { info: result };
  } catch (error) {
    console.error('Brevo email error:', error.message || error);
    return { info: null, error: error.message || 'Email sending failed' };
  }
}

// Send welcome email
async function sendWelcomeEmail(to, firstName = '') {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
      return { info: null };
    }
    
    const SibApiV3Sdk = require('@getbrevo/brevo');
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@livrini.com';
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Bienvenue sur LIVRINI';
    sendSmtpEmail.htmlContent = `
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#222;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#059669;margin:0;">LIVRINI</h1>
        </div>
        <p>Bonjour ${firstName || ''},</p>
        <p>Bienvenue sur <strong>LIVRINI</strong> ! Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
        <p>Vous pouvez maintenant profiter de tous nos services de livraison.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
        <p style="color:#999;font-size:12px;text-align:center;">Bon shopping,<br/>L'équipe LIVRINI</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: 'LIVRINI', email: senderEmail };
    sendSmtpEmail.to = [{ email: to }];
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { info: result };
    
  } catch (err) {
    return { info: null };
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};
