const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Generate a 6-digit numeric OTP
function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Send OTP email using Resend API (works on Render free tier)
async function sendOTPEmail(to, otp, purpose = 'verification') {
  try {
    console.log('📧 sendOTPEmail called for:', to);
    
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️ RESEND_API_KEY not set, falling back to Ethereal for testing');
      return await sendOTPEmailFallback(to, otp, purpose);
    }
    
    const resend = new Resend(apiKey);
    // MUST use Resend's default sender OR a verified domain
    const from = 'LIVRINI <onboarding@resend.dev>';
    const subject = purpose === 'reset' ? 'Votre code de réinitialisation LIVRINI' : 'Votre code de vérification LIVRINI';
    
    console.log('📧 Using Resend API');
    console.log('📧 From:', from);
    console.log('📧 To:', to);
    
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#222;">
          <p>Bonjour,</p>
          <p>Voici votre code <strong>${purpose === 'reset' ? 'de réinitialisation' : 'de vérification'}</strong> pour LIVRINI :</p>
          <p style="font-size:22px;font-weight:700;margin:12px 0;">${otp}</p>
          <p>Ce code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez ce message.</p>
          <p>Merci,<br/>L'équipe LIVRINI</p>
        </div>
      `
    });
    
    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ Email sent successfully! ID:', data.id);
    return { info: data };
    
  } catch (err) {
    console.error('❌ sendOTPEmail error:', err.message);
    throw err;
  }
}

// Fallback using Ethereal for development/testing
async function sendOTPEmailFallback(to, otp, purpose = 'verification') {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  
  const subject = purpose === 'reset' ? 'Votre code de réinitialisation LIVRINI' : 'Votre code de vérification LIVRINI';
  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#222;">
      <p>Bonjour,</p>
      <p>Voici votre code <strong>${purpose === 'reset' ? 'de réinitialisation' : 'de vérification'}</strong> pour LIVRINI :</p>
      <p style="font-size:22px;font-weight:700;margin:12px 0;">${otp}</p>
      <p>Ce code expire dans 10 minutes.</p>
      <p>Merci,<br/>L'équipe LIVRINI</p>
    </div>
  `;
  
  const info = await transporter.sendMail({
    from: 'LIVRINI <test@ethereal.email>',
    to,
    subject,
    html
  });
  
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log('📧 Ethereal preview URL:', previewUrl);
  return { previewUrl, info };
}

// Send welcome email
async function sendWelcomeEmail(to, firstName = '') {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️ RESEND_API_KEY not set, skipping welcome email');
      return { info: null };
    }
    
    const resend = new Resend(apiKey);
    // MUST use Resend's default sender OR a verified domain
    const from = 'LIVRINI <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: 'Bienvenue sur LIVRINI',
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#222;">
          <p>Bonjour ${firstName || ''},</p>
          <p>Bienvenue sur LIVRINI ! Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
          <p>Bon shopping,<br/>L'équipe LIVRINI</p>
        </div>
      `
    });
    
    if (error) {
      console.error('❌ Welcome email error:', error);
      return { info: null };
    }
    
    console.log('✅ Welcome email sent! ID:', data.id);
    return { info: data };
    
  } catch (err) {
    console.error('sendWelcomeEmail error:', err.message);
    return { info: null };
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};
