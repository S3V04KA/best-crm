import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  async sendProposal(options: {
    to: string;
    subject: string;
    user: string;
    pass: string;
    text?: string;
    html?: string;
    attachment?: { filename: string; content: Buffer };
  }) {
    const def: SMTPTransport.Options = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: options.user,
        pass: options.pass,
      },
    };

    const transporter = createTransport(def, def);

    const info = await transporter.sendMail({
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachment
        ? [
            {
              filename: options.attachment.filename,
              content: options.attachment.content,
            },
          ]
        : [],
    });
    return { messageId: info.messageId };
  }
}
