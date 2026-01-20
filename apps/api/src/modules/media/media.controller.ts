import { FastifyRequest, FastifyReply } from 'fastify';
import mediaService, { UploadedFile } from './media.service';

export class MediaController {
  async uploadFile(
    request: FastifyRequest<{ Querystring: { folder?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Файл не предоставлен',
        });
      }

      const buffer = await data.toBuffer();
      
      const file: UploadedFile = {
        filename: data.filename || 'unknown',
        originalName: data.filename || 'unknown',
        mimeType: data.mimetype,
        size: buffer.length,
        buffer,
      };

      const media = await mediaService.uploadFile(file, request.query.folder);

      return reply.status(201).send({
        success: true,
        data: media,
      });
    } catch (error: any) {
      request.log.error(error, 'Error uploading file');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: error?.message || 'Ошибка загрузки файла',
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

