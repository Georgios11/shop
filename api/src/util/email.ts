import nodemailer, { Transporter } from 'nodemailer';
import { smtpUsername, smtpPassword } from './secrets'; // Assuming these are coming from secrets
import { EmailData } from '../types';

/**
 * Sends an email using NodeMailer and Gmail SMTP.
 *
 * @param {EmailData} emailData - The data needed to send the email.
 */
const sendEmailWithNodeMailer = async (emailData: EmailData): Promise<void> => {
  try {
    // Create the transporter for nodemailer
    const transporter: Transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS is used (STARTTLS)
      auth: {
        user: smtpUsername, // Imported from secrets
        pass: smtpPassword, // Imported from secrets
      },
      tls: {
        rejectUnauthorized: false, // Optional: Allow unauthorized certificates (useful for local testing)
      },
    });

    // Define the email options
    const mailOptions = {
      from: smtpUsername, // The email sender
      to: emailData.email, // Recipient email
      subject: emailData.subject, // Subject line
      html: emailData.html, // HTML content for the email
    };

    // Send the email using async/await
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.response);
  } catch (error) {
    console.error('Problem sending email:', error);
  }
};

export default sendEmailWithNodeMailer;
