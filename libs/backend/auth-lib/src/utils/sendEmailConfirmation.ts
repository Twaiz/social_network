import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export const sendEmailConfirmation = async (
  configService: ConfigService,
  token: string,
  email: string,
): Promise<void> => {
  const url = `https://social-network.com/confirm-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: configService.get<string>('MAIL_HOST'),
    port: configService.get<number>('MAIL_PORT'),
    secure: configService.get<string>('MAIL_SECURE') === 'TRUE',
    auth: {
      user: configService.get<string>('MAIL_USER'),
      pass: configService.get<string>('MAIL_PASS'),
    },
  });

  const htmlContent = `
    <p>Привет!</p>
    <p>Вы получили это письмо, потому что кто-то использовал ваш адрес электронной почты для регистрации на нашем сайте.</p>
    <p>Если это были не вы, просто проигнорируйте это письмо, и ничего не произойдёт. Если же вы хотите подтвердить свой адрес, перейдите по следующей ссылке:</p>
    <p><a href="${url}">${url}</a></p>
    <p>Эта ссылка будет действительна 24 часа.</p>
  `;

  await transporter.sendMail({
    to: email,
    subject: 'Подтверждение email',
    html: htmlContent,
  });
};
