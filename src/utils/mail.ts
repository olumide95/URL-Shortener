import nodemailer from 'nodemailer';

interface IMail {
  to: string;
  subject: string;
  message: string;
}

export class MailService {
  async send({ to, subject, message }: IMail): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GOOGLE_MAIL_APP_EMAIL,
          pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.GOOGLE_MAIL_APP_EMAIL,
        to,
        subject,
        html: message,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('error sending email ', error);
      return false;
    }
  }
}
