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
}

export default new SettingsController();

