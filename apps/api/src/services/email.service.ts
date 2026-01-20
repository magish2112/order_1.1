import nodemailer from 'nodemailer';
import env from '../config/env';
import pino from 'pino';

const logger = pino();

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (
      env.SMTP_HOST &&
      env.SMTP_PORT &&
      env.SMTP_USER &&
      env.SMTP_PASS &&
      env.SMTP_FROM
    ) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      logger.info('📧 Email service initialized');
    } else {
      logger.warn(
        '⚠️ Email service not configured. Check SMTP_* environment variables'
      );
    }
  }

  /**
   * Отправить уведомление о новой заявке администратору
   */
  async sendRequestNotification(request: any) {
    if (!this.transporter) {
      logger.warn('❌ Email service not configured');
      return;
    }

    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

      await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to: adminEmail,
        subject: `📋 Новая заявка: ${request.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; margin-bottom: 20px;">🔔 Новая заявка от клиента</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold; color: #666; width: 30%;">Имя:</td>
                  <td style="padding: 12px; color: #333;">${request.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold; color: #666;">Телефон:</td>
                  <td style="padding: 12px; color: #333;">
                    <a href="tel:${request.phone}" style="color: #0066cc; text-decoration: none;">${request.phone}</a>
                  </td>
                </tr>
                ${
                  request.email
                    ? `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold; color: #666;">Email:</td>
                  <td style="padding: 12px; color: #333;">
                    <a href="mailto:${request.email}" style="color: #0066cc; text-decoration: none;">${request.email}</a>
                  </td>
                </tr>
                `
                    : ''
                }
                ${
                  request.source
                    ? `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold; color: #666;">Источник:</td>
                  <td style="padding: 12px; color: #333;">${request.source}</td>
                </tr>
                `
                    : ''
                }
                ${
                  request.message
                    ? `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold; color: #666; vertical-align: top;">Сообщение:</td>
                  <td style="padding: 12px; color: #333;">${request.message}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 12px; font-weight: bold; color: #666;">Дата:</td>
                  <td style="padding: 12px; color: #333;">${new Date(
                    request.createdAt
                  ).toLocaleString('ru-RU')}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #0066cc; text-align: center;">
                <a href="${process.env.ADMIN_URL || 'http://localhost:3001'}/requests" 
                   style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                  Просмотреть заявку
                </a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>Это автоматическое письмо. Пожалуйста, не отвечайте на него.</p>
            </div>
          </div>
        `,
      });

      logger.info(`✅ Request notification sent to ${adminEmail}`);
    } catch (error) {
      logger.error({ error }, '❌ Error sending request notification');
    }
  }

  /**
   * Отправить подтверждение клиенту о получении заявки
   */
  async sendRequestConfirmation(email: string, name: string) {
    if (!this.transporter) {
      logger.warn('❌ Email service not configured');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to: email,
        subject: 'Мы получили вашу заявку! ✓',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; margin-bottom: 10px;">Спасибо, ${name}! 👋</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Мы получили вашу заявку и благодарим вас за проявленный интерес к нашим услугам.
              </p>
              
              <div style="background-color: #f0f7ff; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #0066cc;">
                <p style="color: #0066cc; font-weight: bold; margin: 0 0 10px 0;">📞 Что дальше?</p>
                <p style="color: #333; margin: 0; line-height: 1.6;">
                  Наш менеджер свяжется с вами в ближайшее время для уточнения деталей и подготовки расчёта. 
                  Обычно это занимает 1-24 часа.
                </p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; font-weight: bold; margin: 0 0 10px 0;">⏱️ Важно!</p>
                <p style="color: #333; margin: 0; line-height: 1.6;">
                  Убедитесь, что ваш номер телефона правильный, чтобы менеджер смог вас найти.
                </p>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 20px;">
                С уважением,<br/>
                Команда компании 🏢
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>Это автоматическое письмо. Пожалуйста, не отвечайте на него.</p>
            </div>
          </div>
        `,
      });

      logger.info(`✅ Confirmation email sent to ${email}`);
    } catch (error) {
      logger.error({ error }, '❌ Error sending confirmation email');
    }
  }

  /**
   * Проверить доступность Email сервиса
   */
  isConfigured(): boolean {
    return this.transporter !== null;
  }
}

export default new EmailService();
