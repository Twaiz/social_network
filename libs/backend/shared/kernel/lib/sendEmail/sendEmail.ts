import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export const sendEmail = async (
  configService: ConfigService,
  subject: string,
  htmlContent: string,
  email: string,
): Promise<void> => {
  //TODO - решить что-то с mailtrap и вообще отправкой писем на почту. Щас у нас лимит по отправки, значит надо придумать что-то другое.
  const transporter = nodemailer.createTransport({
    host: configService.get<string>('MAIL_HOST'),
    port: configService.get<number>('MAIL_PORT'),
    auth: {
      user: configService.get<string>('MAIL_USERNAME'),
      pass: configService.get<string>('MAIL_PASSWORD'),
    },
  });

  await transporter.sendMail({
    to: email,
    subject,
    html: htmlContent,
  });
};
