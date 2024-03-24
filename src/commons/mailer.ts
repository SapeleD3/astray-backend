import nodemailer from 'nodemailer';

export class EmailService {
  transporter;

  constructor() {
    const auth = {
      user: process.env.TRANSPORT_EMAIL, // Your email address
      pass: process.env.TRANSPORT_PASSWORD, // Your email password or app-specific password
    };

    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services or SMTP details here
      auth,
    });
  }

  async sendMail({
    to,
    subject = 'Hello World',
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const mailOptions = {
      from: 'astray@gmail.com', // Sender's email address
      to, // Recipient's email address
      subject,
      html,
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
}
