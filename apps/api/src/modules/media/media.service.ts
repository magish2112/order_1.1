import { randomBytes } from 'crypto';
import { join, extname, resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';
import prisma from '../../config/database';
import env from '../../config/env';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export class MediaService {
  private uploadDir: string;

  constructor() {
    // Используем абсолютный путь для надежности
    const uploadDir = env.UPLOAD_DIR || './uploads';
    this.uploadDir = uploadDir.startsWith('/') || uploadDir.match(/^[A-Z]:/) 
      ? uploadDir 
      : resolve(process.cwd(), uploadDir);
    
    // Создаем директорию если не существует
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Загрузить файл
   */
  async uploadFile(file: UploadedFile, folder?: string): Promise<any> {
    try {
      // Генерация уникального имени файла
      const fileExtension = extname(file.originalName);
      const randomName = randomBytes(16).toString('hex');
      const filename = `${randomName}${fileExtension}`;
      
      const folderPath = folder ? join(this.uploadDir, folder) : this.uploadDir;
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }

      const filePath = join(folderPath, filename);
      
      // Сохранение файла
      writeFileSync(filePath, file.buffer);

      // Генерация thumbnail для изображений
      let thumbnailUrl: string | null = null;
      if (file.mimeType.startsWith('image/')) {
        try {
          const thumbnailFilename = `${randomName}_thumb.jpg`;
          const thumbnailPath = join(folderPath, thumbnailFilename);
          
          await sharp(file.buffer)
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

          thumbnailUrl = folder 
            ? `${env.PUBLIC_UPLOAD_URL}/${folder}/${thumbnailFilename}`
            : `${env.PUBLIC_UPLOAD_URL}/${thumbnailFilename}`;
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          // Продолжаем без thumbnail
        }
      }

      const url = folder 
        ? `${env.PUBLIC_UPLOAD_URL}/${folder}/${filename}`
        : `${env.PUBLIC_UPLOAD_URL}/${filename}`;

      // Сохранение в БД
      const media = await prisma.media.create({
        data: {
          filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url,
          thumbnailUrl,
          folder: folder || null,
        },
      });

      return media;
    } catch (error: any) {
      console.error('Error in uploadFile:', error);
      throw new Error(`Ошибка загрузки файла: ${error?.message || 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получить список медиафайлов
   */
  async getMediaFiles(folder?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (folder) {
      where.folder = folder;
    }

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить медиафайл по ID
   */
  async getMediaById(id: string) {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    return media;
  }

  /**
   * Удалить медиафайл
   */
  async deleteMedia(id: string) {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new Error('Медиафайл не найден');
    }

    // Удаление файла с диска
    const folderPath = media.folder 
      ? join(this.uploadDir, media.folder) 
      : this.uploadDir;
    const filePath = join(folderPath, media.filename);
    
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    // Удаление thumbnail если есть
    if (media.thumbnailUrl) {
      const thumbnailFilename = media.thumbnailUrl.split('/').pop();
      if (thumbnailFilename) {
        const thumbnailPath = join(folderPath, thumbnailFilename);
        if (existsSync(thumbnailPath)) {
          unlinkSync(thumbnailPath);
        }
      }
    }

    // Удаление из БД
    await prisma.media.delete({
      where: { id },
    });

    return { success: true };
  }
}

export default new MediaService();

