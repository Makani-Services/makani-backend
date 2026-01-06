// pusher.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import config from 'src/config';
const sgMail = require('@sendgrid/mail');

interface MailOptions {
  from: string;
  to: any;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any;
}
@Injectable()
export class EmailService {
  constructor() {
    /*
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: +config.mail.port,
      secure: config.mail.secure, // true for 465, false for other ports
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
    */
  }

  async sendEmail(mailOptions: MailOptions): Promise<boolean> {
    sgMail.setApiKey(config.mail.pass);
    try {
      await sgMail.send(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error.response.body);
      return false;
    }
  }

  // async sendEmail(mailOptions: object): Promise<boolean> {
  //   try {
  //     const info = await this.transporter.sendMail(mailOptions);
  //     console.log('Message sent: %s', info.messageId);
  //     return true;
  //   } catch (error) {
  //     console.error('Error sending email:', error);
  //     return false;
  //   }
  // }
}
