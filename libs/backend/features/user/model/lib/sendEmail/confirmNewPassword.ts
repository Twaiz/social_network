import { ConfigService } from '@nestjs/config';
import { sendEmail } from '@shared';

export const confirmNewPassword = async (
  configService: ConfigService,
  email: string,
  fullName: string,
): Promise<void> => {
  const htmlContent = `
    <p>Здравствуйте, ${fullName}!</p>
    <p>Ваш пароль был успешно изменён.</p>
    <p>Если вы не выполняли это действие, немедленно свяжитесь со службой поддержки для обеспечения безопасности вашей учётной записи.</p>
  `;

  await sendEmail(
    configService,
    'Подтверждение изменения пароля',
    htmlContent,
    email,
  );
};
