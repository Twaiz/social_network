import { Transporter } from 'nodemailer';

export const sendEmailConfirmation = async (
  transporter: Transporter,
  token: string,
  email: string,
): Promise<void> => {
  const url = `https://social-network.com/confirm-email?token=${token}`;

  const htmlContent = `
    <p>Привет!</p>
    <p>Вы получили это письмо, потому что кто-то использовал ваш адрес электронной почты для регистрации на нашем сайте.</p>
    <p>Если это были не вы, просто проигнорируйте это письмо, и ничего не произойдёт. Если же вы хотите подтвердить свой адрес, перейдите по следующей ссылке:</p>
    <p><a href="${url}">${url}</a></p>
    <p>Эта ссылка будет действительна 24 часа.</p>
    <p>С уважением, команда вашего сайта.</p>
  `;

  await transporter.sendMail({
    to: email,
    subject: 'Подтверждение email',
    html: htmlContent,
  });
};
