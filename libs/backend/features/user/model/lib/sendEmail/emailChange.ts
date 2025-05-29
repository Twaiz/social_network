import { ConfigService } from '@nestjs/config';
import { sendEmail } from '@shared';

export const emailChange = async (
  configService: ConfigService,
  changeEmailToken: string,
  currentEmail: string,
  newEmail: string,
  fullName: string,
): Promise<void> => {
  const confirmationUrl = `https://social-network.com/confirm-changed-email?token=${changeEmailToken}`;

  const htmlContent = `
  <p>Здравствуйте, ${fullName}!</p>
  <p>Вы запросили смену email на <strong>${newEmail}</strong>.</p>
  <p>Если вы действительно хотите изменить свой адрес, пожалуйста, подтвердите действие, перейдя по следующей ссылке:</p>
  <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
  <p>Ссылка действительна в течение 24 часов.</p>
  <p><strong>Если вы не запрашивали изменение, просто проигнорируйте это письмо!</strong></p>
`;

  await sendEmail(
    configService,
    'Подтверждение изменения email',
    htmlContent,
    currentEmail,
  );
};
