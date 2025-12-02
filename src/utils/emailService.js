const nodemailer = require('nodemailer');

// Generate a 6-digit numeric OTP
function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Create transporter using environment SMTP config or Ethereal test account
async function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    // Use Gmail service for simplicity
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });
  }

  // Fallback to Ethereal for development/testing
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

  // attach the test account info so callers can log preview URL
  transporter.__testAccount = testAccount;
  return transporter;
}

// Send OTP email
async function sendOTPEmail(to, otp, purpose = 'verification') {
  try {
    console.log('📧 sendOTPEmail called for:', to);
    console.log('📧 SMTP_USER configured:', !!process.env.SMTP_USER);
    console.log('📧 SMTP_PASS configured:', !!process.env.SMTP_PASS);
    
    const transporter = await createTransporter();
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@livrini.com';
    const subject = purpose === 'reset' ? 'Votre code de réinitialisation LIVRINI' : 'Votre code de vérification LIVRINI';
    
    console.log('📧 From:', from);
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    const html = `
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#222;">
        <p>Bonjour,</p>
        <p>Voici votre code <strong>${purpose === 'reset' ? 'de réinitialisation' : 'de vérification'}</strong> pour LIVRINI :</p>
        <p style="font-size:22px;font-weight:700;margin:12px 0;">${otp}</p>
        <p>Ce code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez ce message.</p>
        <p>Merci,<br/>L'équipe LIVRINI</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
    
    console.log('📧 Email sent successfully! MessageId:', info.messageId);

    // If using Ethereal, log and return the preview URL for debugging
    if (transporter.__testAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Ethereal preview URL:', previewUrl);
      return { previewUrl, info };
    }

    console.log('📧 Gmail email delivered!');
    return { info };
  } catch (err) {
    console.error('❌ sendOTPEmail error:', err.message);
    console.error('❌ Full error:', err);
    throw err;
  }
}

// Send welcome email (simple)
async function sendWelcomeEmail(to, firstName = '') {
  try {
    const transporter = await createTransporter();
    const from = process.env.FROM_EMAIL || 'no-reply@livrini.com';
    const subject = 'Bienvenue sur LIVRINI';
    const html = `
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#222;">
        <p>Bonjour ${firstName || ''},</p>
        <p>Bienvenue sur LIVRINI ! Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
        <p>Bon shopping,<br/>L'équipe LIVRINI</p>
      </div>
    `;

    const info = await transporter.sendMail({ from, to, subject, html });

    if (transporter.__testAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Ethereal preview URL (welcome):', previewUrl);
      return { previewUrl, info };
    }

    return { info };
  } catch (err) {
    console.error('sendWelcomeEmail error:', err);
    throw err;
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  createTransporter
};
