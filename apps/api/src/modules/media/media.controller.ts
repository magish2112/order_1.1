import { FastifyRequest, FastifyReply } from 'fastify';
import mediaService, { UploadedFile } from './media.service';
import { isValidMimeType, isValidExtension, isValidFileSize } from '../../utils/file-validation';
import env from '../../config/env';

export class MediaController {
  async uploadFile(
    request: FastifyRequest<{ Querystring: { folder?: string } }>,
    reply: FastifyReply
  ) {
    try {
      // Получаем файл с ограничением размера
      const data = await request.file({
        limits: {
          fileSize: env.MAX_FILE_SIZE,
        },
      });

      if (!data) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Файл не предоставлен',
        });
      }

      // Проверяем MIME-тип ДО чтения buffer
      if (!isValidMimeType(data.mimetype)) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WebP) и PDF',
        });
      }

      // Проверяем расширение файла
      const filename = data.filename || 'unknown';
      if (!isValidExtension(filename)) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Недопустимое расширение файла',
        });
      }

      const buffer = await data.toBuffer();
      
      // Проверяем размер файла после чтения
      if (!isValidFileSize(buffer.length, env.MAX_FILE_SIZE)) {
        return reply.status(413).send({
          statusCode: 413,
          error: 'Payload Too Large',
          message: `Файл слишком большой. Максимальный размер: ${Math.round(env.MAX_FILE_SIZE / 1024 / 1024)}MB`,
        });
      }
      
      const file: UploadedFile = {
        filename,
        originalName: filename,
        mimeType: data.mimetype,
        size: buffer.length,
        buffer,
      };

      const media = await mediaService.uploadFile(file, request.query.folder);

      return reply.status(201).send({
        success: true,
        data: media,
      });
    } catch (error: unknown) {
      request.log.error(error, 'Error uploading file');
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки файла';
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: errorMessage,
      });
    }
  }

  async getMediaFiles(
    request: FastifyRequest<{ 
      Querystring: { folder?: string; page?: number; limit?: number } 
    }>,
    reply: FastifyReply
  ) {
    const { folder, page = 1, limit = 50 } = request.query;
    const result = await mediaService.getMediaFiles(folder, page, limit);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getMediaById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const media = await mediaService.getMediaById(id);

    if (!media) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Медиафайл не найден',
      });
    }

    return reply.status(200).send({
      success: true,
      data: media,
    });
  }

  async deleteMedia(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await mediaService.deleteMedia(id);

    return reply.status(200).send({
      success: true,
      message: 'Медиафайл удален',
    });
  }
}

export default new MediaController();

