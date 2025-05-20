import { ConfigService } from '@nestjs/config';
import { sendEmail } from '@shared';

export const sendEmailChangeConfirm = async (
  configService: ConfigService,
  oldEmail: string,
  newEmail: string,
  fullName: string,
): Promise<void> => {
  const htmlContent = `
    <p>Здравствуйте, ${fullName}!</p>
    <p>Мы рады сообщить, что ваш email был успешно изменён.</p>
    <p><strong>Старый email:</strong> ${oldEmail}</p>
    <p><strong>Новый email:</strong> ${newEmail}</p>
    <p>Теперь все уведомления и письма будут приходить на новый адрес.</p>
    <p><strong>Если вы не совершали это изменение, пожалуйста, немедленно свяжитесь со службой поддержки.</strong></p>
  `;

  await sendEmail(
    configService,
    'Подтверждение смены email',
    htmlContent,
    oldEmail,
  );

  await sendEmail(
    configService,
    'Подтверждение смены email',
    htmlContent,
    newEmail,
  );
};
