import { ConfigService } from '@nestjs/config';
import { sendEmail } from '@shared';

export const confirmEmail = async (
  configService: ConfigService,
  email: string,
  token: string,
  fullName: string,
): Promise<void> => {
  const url = `https://social-network.com/confirm-email?token=${token}`;

  const htmlContent = `
  <p>Здравствуйте, ${fullName}!</p>
  <p>Вы получили это письмо, потому что кто-то использовал ваш адрес электронной почты для регистрации на нашем сайте.</p>
  <p><strong>Если это были не вы, пожалуйста, проигнорируйте это письмо — никаких действий предпринимать не нужно.</strong></p>
  <p>Если вы хотите подтвердить свой email, пожалуйста, перейдите по следующей ссылке:</p>
  <p><a href="${url}">${url}</a></p>
  <p>Срок действия ссылки — 24 часа.</p>
`;

  await sendEmail(configService, 'Подтверждение email', htmlContent, email);
};
