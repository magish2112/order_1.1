import { FastifyRequest, FastifyReply } from 'fastify';
import settingsService from './settings.service';
import {
  updateSettingSchema,
  updateSettingsSchema,
  getSettingsQuerySchema,
} from './settings.schema';

export class SettingsController {
  async getPublicSettings(request: FastifyRequest, reply: FastifyReply) {
    const settings = await settingsService.getPublicSettings();

    return reply.status(200).send({
      success: true,
      data: settings,
    });
  }

  async getAllSettings(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getSettingsQuerySchema.parse(request.query);
    const settings = await settingsService.getAllSettings(query);

    return reply.status(200).send({
      success: true,
      data: settings,
    });
  }

  async getSettingByKey(
    request: FastifyRequest<{ Params: { key: string } }>,
    reply: FastifyReply
  ) {
    const { key } = request.params;
    const setting = await settingsService.getSettingByKey(key);

    if (!setting) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Настройка не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: setting,
    });
  }

  async updateSetting(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = updateSettingSchema.parse(request.body);
    const setting = await settingsService.upsertSetting(validated);

    return reply.status(200).send({
      success: true,
      data: setting,
    });
  }

  async updateSettings(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = updateSettingsSchema.parse(request.body);
    const settings = await settingsService.updateSettings(validated);

    return reply.status(200).send({
      success: true,
      data: settings,
    });
  }

  async uploadLogo(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // Проверяем, что запрос является multipart
    if (!request.isMultipart()) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Запрос должен содержать multipart/form-data',
      });
    }

    try {
      const data = await request.file({
        limits: {
          fileSize: 5242880, // 5MB
        },
      });

      if (!data) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Файл не предоставлен',
        });
      }

      // Проверяем, что это изображение
      if (!data.mimetype.startsWith('image/')) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Разрешена загрузка только изображений',
        });
      }

      const buffer = await data.toBuffer();

      // Сохраняем логотип напрямую в папку (без записи в таблицу media)
      const { randomBytes } = await import('crypto');
      const { join, extname, resolve } = await import('path');
      const { existsSync, mkdirSync, writeFileSync } = await import('fs');
      const env = (await import('../../config/env')).default;

      // Определяем путь к папке для логотипов
      const uploadDir = env.UPLOAD_DIR || './uploads';
      const logoDir = uploadDir.startsWith('/') || uploadDir.match(/^[A-Z]:/) 
        ? join(uploadDir, 'logo') 
        : resolve(process.cwd(), uploadDir, 'logo');

      // Создаем директорию если не существует
      if (!existsSync(logoDir)) {
        mkdirSync(logoDir, { recursive: true });
      }

      // Генерируем имя файла (всегда logo с расширением, перезаписывается при новой загрузке)
      const fileExtension = extname(data.filename || 'logo');
      const filename = `logo${fileExtension}`;
      
      // Удаляем старый логотип если существует (с любым расширением)
      const { readdirSync, unlinkSync } = await import('fs');
      try {
        const files = readdirSync(logoDir);
        files.forEach(file => {
          if (file.startsWith('logo.')) {
            unlinkSync(join(logoDir, file));
          }
        });
      } catch (err) {
        // Игнорируем ошибки при удалении
      }
      
      const filePath = join(logoDir, filename);

      // Сохраняем файл
      writeFileSync(filePath, buffer);

      // Формируем URL для доступа к файлу
      const logoUrl = `${env.PUBLIC_UPLOAD_URL}/logo/${filename}`;

      // Сохраняем URL логотипа в настройках (в базе данных)
      const setting = await settingsService.upsertSetting({
        key: 'logo',
        value: logoUrl,
        type: 'string',
        group: 'design',
      });

      return reply.status(200).send({
        success: true,
        data: {
          logoUrl,
          setting,
        },
      });
    } catch (error: any) {
      if (error.code === 'FST_REQ_FILE_TOO_LARGE' || error.statusCode === 413) {
        return reply.status(413).send({
          statusCode: 413,
          error: 'Payload Too Large',
          message: 'Размер файла превышает допустимый (5MB)',
        });
      }
      
      throw error;
    }
  }
}

export default new SettingsController();

