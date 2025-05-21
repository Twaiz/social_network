import { ConfigService } from '@nestjs/config';
import { sendEmail } from '@shared';

export const sendEmailChangePassword = async (
  configService: ConfigService,
  email: string,
  fullName: string,
  token: string,
): Promise<void> => {
  const confirmationUrl = `https://social-network.com/confirm-new-password?token=${token}`;

  const htmlContent = `
    <p>Здравствуйте, ${fullName}!</p>
    <p>Вы запросили смену password.</p>
    <p>Если вы действительно хотите изменить свой адрес, пожалуйста, подтвердите действие, перейдя по следующей ссылке:</p>
    <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
    <p>Ссылка действительна в течение 24 часов.</p>
    <p><strong>Если вы не запрашивали изменение, просто проигнорируйте это письмо!</strong></p>
  `;

  await sendEmail(
    configService,
    'Подтверждение изменения пароля',
    htmlContent,
    email,
  );
};
