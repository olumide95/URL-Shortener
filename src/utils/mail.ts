import nodemailer from 'nodemailer';

interface IMail {
  to: string;
  subject: string;
  message: string;
}

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GOOGLE_MAIL_APP_EMAIL,
          pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
        },
      });
    } catch (error) {
      console.error('error intialising email service', error);
    }
  }

  async sendMail({ to, subject, message }: IMail): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.GOOGLE_MAIL_APP_EMAIL,
        to,
        subject,
        html: message,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('error sending email ', error);
      return false;
    }
  }

  static async send({ to, subject, message }: IMail): Promise<boolean> {
    const instance = new MailService();
    return instance.sendMail({ to, subject, message });
  }
}
