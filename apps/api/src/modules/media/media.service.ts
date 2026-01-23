import { randomBytes } from 'crypto';
import { join, extname, resolve, normalize } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';
import prisma from '../../config/database';
import env from '../../config/env';
import { validateAndNormalizeFolder } from '../../utils/file-validation';

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
  async uploadFile(file: UploadedFile, folder?: string): Promise<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl: string | null;
    folder: string | null;
    createdAt: Date;
  }> {
    try {
      // Валидация и нормализация folder (защита от path traversal)
      let normalizedFolder: string | undefined;
      if (folder) {
        normalizedFolder = validateAndNormalizeFolder(folder, this.uploadDir);
      }

      // Генерация уникального имени файла
      const fileExtension = extname(file.originalName);
      const randomName = randomBytes(16).toString('hex');
      const filename = `${randomName}${fileExtension}`;
      
      const folderPath = normalizedFolder ? join(this.uploadDir, normalizedFolder) : this.uploadDir;
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }

      const filePath = join(folderPath, filename);
      
      // Проверка размера buffer перед сохранением
      if (file.size > env.MAX_FILE_SIZE) {
        throw new Error(`Файл слишком большой. Максимальный размер: ${Math.round(env.MAX_FILE_SIZE / 1024 / 1024)}MB`);
      }
      
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

          thumbnailUrl = normalizedFolder 
            ? `${env.PUBLIC_UPLOAD_URL}/${normalizedFolder}/${thumbnailFilename}`
            : `${env.PUBLIC_UPLOAD_URL}/${thumbnailFilename}`;
        } catch {
          // Ошибка генерации thumbnail не критична - продолжаем без него
          // Не логируем детали ошибки для безопасности
          thumbnailUrl = null;
        }
      }

      const url = normalizedFolder 
        ? `${env.PUBLIC_UPLOAD_URL}/${normalizedFolder}/${filename}`
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
          folder: normalizedFolder || null,
        },
      });

      return media;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка загрузки файла: ${errorMessage}`);
    }
  }

  /**
   * Получить список медиафайлов
   */
  async getMediaFiles(folder?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    // Валидация folder если передан
    let normalizedFolder: string | undefined;
    if (folder) {
      normalizedFolder = validateAndNormalizeFolder(folder, this.uploadDir);
    }

    const where: { folder?: string } = {};
    if (normalizedFolder) {
      where.folder = normalizedFolder;
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
    let folderPath: string;
    if (media.folder) {
      // Валидируем folder перед использованием (защита от path traversal)
      const normalizedFolder = validateAndNormalizeFolder(media.folder, this.uploadDir);
      folderPath = join(this.uploadDir, normalizedFolder);
    } else {
      folderPath = this.uploadDir;
    }
    
    const filePath = join(folderPath, media.filename);
    
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    // Удаление thumbnail если есть
    if (media.thumbnailUrl) {
      const thumbnailFilename = media.thumbnailUrl.split('/').pop();
      if (thumbnailFilename) {
        const thumbnailPath = join(folderPath, thumbnailFilename);
        // Проверяем существование файла перед удалением
        if (existsSync(thumbnailPath)) {
          try {
            unlinkSync(thumbnailPath);
          } catch (error: unknown) {
            // Игнорируем ошибки удаления thumbnail (не критично)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Ошибка удаления thumbnail: ${errorMessage}`);
          }
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

