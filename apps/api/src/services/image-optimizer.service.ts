import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import env from '../config/env'

interface OptimizeOptions {
  folder: 'projects' | 'articles' | 'team' | 'services' | 'logo'
  subfolder?: string
  createVariants?: boolean
  quality?: number
}

interface ImageVariant {
  path: string
  url: string
  width: number
  height: number
  size: number
}

interface ImageVariants {
  thumbnail: ImageVariant
  medium: ImageVariant
  large: ImageVariant
  original?: ImageVariant
}

/**
 * Сервис оптимизации изображений
 * - Конвертация в WebP
 * - Генерация нескольких размеров
 * - Автоматическое сжатие
 */
export class ImageOptimizerService {
  private readonly uploadDir: string
  private readonly publicUrl: string

  // Размеры для генерации
  private readonly sizes = {
    thumbnail: { width: 400, quality: 80 },
    medium: { width: 1200, quality: 85 },
    large: { width: 1920, quality: 85 },
  }

  constructor() {
    this.uploadDir = env.UPLOAD_DIR || './uploads'
    this.publicUrl = env.PUBLIC_UPLOAD_URL || '/uploads'
  }

  /**
   * Оптимизировать и сохранить изображение с разными размерами
   */
  async optimizeAndSave(
    fileBuffer: Buffer,
    originalName: string,
    options: OptimizeOptions
  ): Promise<ImageVariants> {
    const { folder, subfolder, quality } = options

    // Создаем уникальную папку для хранения вариантов изображения
    const folderHash = subfolder || crypto.randomBytes(8).toString('hex')
    const targetDir = path.join(this.uploadDir, folder, folderHash)
    
    // Создаем директорию если не существует
    await fs.mkdir(targetDir, { recursive: true })

    // Получаем метаданные оригинального изображения
    const image = sharp(fileBuffer)
    const metadata = await image.metadata()

    console.log(`📸 Оптимизация изображения: ${originalName} (${metadata.width}x${metadata.height})`)

    const variants: Partial<ImageVariants> = {}

    // Генерируем варианты изображений
    for (const [sizeName, config] of Object.entries(this.sizes)) {
      const fileName = `${sizeName}.webp`
      const filePath = path.join(targetDir, fileName)

      try {
        // Оптимизация и конвертация в WebP
        const resizedBuffer = await sharp(fileBuffer)
          .resize(config.width, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .webp({
            quality: quality || config.quality,
            effort: 6, // Максимальное сжатие (0-6)
          })
          .toBuffer()

        // Получаем метаданные результата
        const resizedImage = sharp(resizedBuffer)
        const resizedMetadata = await resizedImage.metadata()

        // Сохраняем на диск
        await fs.writeFile(filePath, resizedBuffer)

        const relativeUrl = `${this.publicUrl}/${folder}/${folderHash}/${fileName}`

        variants[sizeName as keyof ImageVariants] = {
          path: filePath,
          url: relativeUrl,
          width: resizedMetadata.width || 0,
          height: resizedMetadata.height || 0,
          size: resizedBuffer.length,
        }

        console.log(`  ✅ ${sizeName}: ${resizedMetadata.width}x${resizedMetadata.height} (${this.formatBytes(resizedBuffer.length)})`)
      } catch (error) {
        console.error(`  ❌ Ошибка создания ${sizeName}:`, error)
        throw new Error(`Ошибка оптимизации изображения (${sizeName})`)
      }
    }

    // Проверяем что все варианты созданы
    if (!variants.thumbnail || !variants.medium || !variants.large) {
      throw new Error('Не удалось создать все варианты изображения')
    }

    return variants as ImageVariants
  }

  /**
   * Оптимизировать одно изображение (для лого, аватаров)
   */
  async optimizeSingle(
    fileBuffer: Buffer,
    fileName: string,
    options: { folder: string; maxWidth?: number; quality?: number }
  ): Promise<ImageVariant> {
    const { folder, maxWidth = 1200, quality = 85 } = options

    const targetDir = path.join(this.uploadDir, folder)
    await fs.mkdir(targetDir, { recursive: true })

    const name = `${path.parse(fileName).name}.webp`
    const filePath = path.join(targetDir, name)

    // Оптимизация
    const optimizedBuffer = await sharp(fileBuffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality, effort: 6 })
      .toBuffer()

    const metadata = await sharp(optimizedBuffer).metadata()
    await fs.writeFile(filePath, optimizedBuffer)

    return {
      path: filePath,
      url: `${this.publicUrl}/${folder}/${name}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: optimizedBuffer.length,
    }
  }

  /**
   * Удалить папку с изображениями
   */
  async deleteFolder(folder: string, subfolder: string): Promise<void> {
    const targetDir = path.join(this.uploadDir, folder, subfolder)
    
    try {
      await fs.rm(targetDir, { recursive: true, force: true })
      console.log(`🗑️  Удалена папка: ${targetDir}`)
    } catch (error) {
      console.error(`❌ Ошибка удаления папки ${targetDir}:`, error)
      // Не выбрасываем ошибку - продолжаем работу
    }
  }

  /**
   * Удалить одно изображение
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
      console.log(`🗑️  Удален файл: ${filePath}`)
    } catch (error) {
      console.error(`❌ Ошибка удаления файла ${filePath}:`, error)
    }
  }

  /**
   * Получить размер папки в байтах
   */
  async getFolderSize(folder: string): Promise<number> {
    const targetDir = path.join(this.uploadDir, folder)
    let totalSize = 0

    const getSize = async (dir: string): Promise<void> => {
      try {
        const files = await fs.readdir(dir, { withFileTypes: true })
        
        for (const file of files) {
          const filePath = path.join(dir, file.name)
          
          if (file.isDirectory()) {
            await getSize(filePath)
          } else {
            const stats = await fs.stat(filePath)
            totalSize += stats.size
          }
        }
      } catch (error) {
        // Папка не существует или нет доступа
      }
    }

    await getSize(targetDir)
    return totalSize
  }

  /**
   * Получить статистику хранилища
   */
  async getStorageStats(): Promise<{
    projects: { count: number; size: number; sizeMB: number }
    articles: { count: number; size: number; sizeMB: number }
    team: { count: number; size: number; sizeMB: number }
    services: { count: number; size: number; sizeMB: number }
    total: { size: number; sizeMB: number; sizeGB: number }
  }> {
    const folders = ['projects', 'articles', 'team', 'services']
    const stats: any = {}

    for (const folder of folders) {
      const targetDir = path.join(this.uploadDir, folder)
      
      try {
        const items = await fs.readdir(targetDir)
        const size = await this.getFolderSize(folder)
        
        stats[folder] = {
          count: items.length,
          size,
          sizeMB: Math.round(size / 1024 / 1024 * 100) / 100,
        }
      } catch {
        stats[folder] = { count: 0, size: 0, sizeMB: 0 }
      }
    }

    const totalSize = Object.values(stats).reduce((sum: number, item: any) => sum + item.size, 0)

    stats.total = {
      size: totalSize,
      sizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      sizeGB: Math.round(totalSize / 1024 / 1024 / 1024 * 100) / 100,
    }

    return stats
  }

  /**
   * Форматировать размер в человекочитаемый формат
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }
}

export const imageOptimizer = new ImageOptimizerService()
