import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import {
  UpdateSettingInput,
  UpdateSettingsInput,
  GetSettingsQuery,
} from './settings.schema';

export class SettingsService {
  /**
   * Получить публичные настройки
   */
  async getPublicSettings() {
    const cacheKey = 'settings:public';

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const settings = await prisma.setting.findMany({
      where: {
        group: { in: ['contacts', 'social', 'design'] },
      },
    });

    const result = settings.reduce((acc, setting) => {
      let value: any = setting.value;
      
      // Преобразование типов
      if (setting.type === 'number') {
        value = Number(value);
      } else if (setting.type === 'boolean') {
        value = value === 'true';
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch {
          value = setting.value;
        }
      }

      acc[setting.key] = value;
      return acc;
    }, {} as Record<string, any>);

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(result)); // 1 час
    }

    return result;
  }

  /**
   * Получить все настройки (админ)
   */
  async getAllSettings(query: GetSettingsQuery) {
    const where: Prisma.SettingWhereInput = {};

    if (query.group) {
      where.group = query.group;
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: [
        { group: 'asc' },
        { key: 'asc' },
      ],
    });

    return settings.map((setting) => {
      let value: any = setting.value;

      if (setting.type === 'number') {
        value = Number(value);
      } else if (setting.type === 'boolean') {
        value = value === 'true';
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch {
          value = setting.value;
        }
      }

      return {
        ...setting,
        value,
      };
    });
  }

  /**
   * Получить настройку по ключу
   */
  async getSettingByKey(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    let value: any = setting.value;

    if (setting.type === 'number') {
      value = Number(value);
    } else if (setting.type === 'boolean') {
      value = value === 'true';
    } else if (setting.type === 'json') {
      try {
        value = JSON.parse(value);
      } catch {
        value = setting.value;
      }
    }

    return {
      ...setting,
      value,
    };
  }

  /**
   * Создать или обновить настройку
   */
  async upsertSetting(input: UpdateSettingInput) {
    const { key, value, type, group } = input;

    let stringValue = value;
    if (type === 'json') {
      stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    } else if (type === 'boolean') {
      stringValue = String(value);
    } else if (type === 'number') {
      stringValue = String(value);
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: {
        value: stringValue,
        type,
        group,
      },
      create: {
        key,
        value: stringValue,
        type,
        group,
      },
    });

    await this.invalidateSettingsCache();

    return setting;
  }

  /**
   * Обновить несколько настроек
   */
  async updateSettings(input: UpdateSettingsInput) {
    const results = await Promise.all(
      input.map((setting) => this.upsertSetting(setting))
    );

    return results;
  }

  /**
   * Инвалидация кеша настроек
   */
  private async invalidateSettingsCache() {
    if (!redis) return;

    const keys = await redis.keys('settings:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new SettingsService();

