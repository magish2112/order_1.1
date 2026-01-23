import prisma from '../../config/database';
import redis from '../../config/redis';
import { transformCalculatorConfig, stringifyJsonObject } from '../../utils/json-fields';
import { CalculateInput, UpdateCalculatorConfigInput } from './calculator.schema';

export class CalculatorService {
  /**
   * Получить конфигурацию калькулятора
   */
  async getConfig() {
    const cacheKey = 'calculator:config';

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const config = await prisma.calculatorConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      // Возвращаем значения по умолчанию
      return {
        basePriceCosmetic: 5000,
        basePriceCapital: 8000,
        basePriceDesign: 12000,
        basePriceElite: 18000,
        coefficients: {
          newBuilding: 0.9,
          secondary: 1.0,
          house: 1.2,
        },
      };
    }

    // Преобразуем JSON поля (работает для SQLite и PostgreSQL)
    const transformedConfig = transformCalculatorConfig(config);

    const result = {
      basePriceCosmetic: Number(transformedConfig.basePriceCosmetic),
      basePriceCapital: Number(transformedConfig.basePriceCapital),
      basePriceDesign: Number(transformedConfig.basePriceDesign),
      basePriceElite: Number(transformedConfig.basePriceElite),
      coefficients: transformedConfig.coefficients as Record<string, number>,
    };

    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(result)); // 1 час
    }

    return result;
  }

  /**
   * Обновить конфигурацию калькулятора
   */
  async updateConfig(input: UpdateCalculatorConfigInput) {
    const existingConfig = await prisma.calculatorConfig.findFirst({
      where: { isActive: true },
    });

    let config;
    if (existingConfig) {
      // Преобразуем coefficients в JSON (для SQLite) или оставляем как есть (для PostgreSQL)
      const data: Partial<{
        name?: string;
        basePriceCosmetic?: number;
        basePriceCapital?: number;
        basePriceDesign?: number;
        basePriceElite?: number;
        coefficients?: unknown;
        isActive?: boolean;
      }> = { ...input };
      if (data.coefficients !== undefined) {
        data.coefficients = stringifyJsonObject(data.coefficients);
      }

      config = await prisma.calculatorConfig.update({
        where: { id: existingConfig.id },
        data,
      });
    } else {
      config = await prisma.calculatorConfig.create({
        data: {
          name: input.name || 'Основная конфигурация',
          basePriceCosmetic: input.basePriceCosmetic || 5000,
          basePriceCapital: input.basePriceCapital || 8000,
          basePriceDesign: input.basePriceDesign || 12000,
          basePriceElite: input.basePriceElite || 18000,
          coefficients: stringifyJsonObject(input.coefficients || {
            newBuilding: 0.9,
            secondary: 1.0,
            house: 1.2,
          }),
          isActive: input.isActive !== undefined ? input.isActive : true,
        },
      });
    }

    // Инвалидация кеша
    if (redis) {
      await redis.del('calculator:config');
    }

    return transformCalculatorConfig(config);
  }

  /**
   * Рассчитать стоимость
   */
  async calculate(input: CalculateInput) {
    const config = await this.getConfig();

    // Базовая цена за м² в зависимости от типа ремонта
    let basePrice: number;
    switch (input.repairType) {
      case 'cosmetic':
        basePrice = config.basePriceCosmetic;
        break;
      case 'capital':
        basePrice = config.basePriceCapital;
        break;
      case 'design':
        basePrice = config.basePriceDesign;
        break;
      case 'elite':
        basePrice = config.basePriceElite;
        break;
      default:
        basePrice = config.basePriceCosmetic;
    }

    // Коэффициент типа жилья
    const housingCoefficient = config.coefficients[input.housingType] || 1.0;
    
    // Коэффициент типа помещения
    const propertyCoefficient = config.coefficients[input.propertyType] || 1.0;

    // Базовая стоимость
    let totalPrice = basePrice * input.area * housingCoefficient * propertyCoefficient;

    // Дополнительные коэффициенты в зависимости от количества комнат
    const roomsCoefficient = this.getRoomsCoefficient(input.rooms);
    totalPrice *= roomsCoefficient;

    // Дополнительные услуги (упрощенный расчет, можно расширить)
    const additionalServicesPrice = input.additionalServices.length * (totalPrice * 0.1);
    totalPrice += additionalServicesPrice;

    // Срок выполнения в днях (примерная оценка)
    const duration = this.calculateDuration(input.area, input.repairType, input.rooms);

    return {
      price: Math.round(totalPrice),
      pricePerSquareMeter: Math.round(totalPrice / input.area),
      duration,
      breakdown: {
        basePrice: Math.round(basePrice * input.area),
        housingCoefficient,
        propertyCoefficient,
        roomsCoefficient,
        additionalServicesPrice: Math.round(additionalServicesPrice),
      },
    };
  }

  /**
   * Коэффициент в зависимости от количества комнат
   */
  private getRoomsCoefficient(rooms: number): number {
    if (rooms === 1) return 1.0;
    if (rooms === 2) return 1.1;
    if (rooms === 3) return 1.2;
    if (rooms === 4) return 1.3;
    return 1.4; // 5+ комнат
  }

  /**
   * Расчет срока выполнения в днях
   */
  private calculateDuration(area: number, repairType: string, rooms: number): number {
    let baseDays = 30; // Базовый срок 30 дней

    // Зависимость от площади
    baseDays += Math.floor(area / 10); // +1 день на каждые 10 м²

    // Зависимость от типа ремонта
    switch (repairType) {
      case 'cosmetic':
        baseDays = Math.floor(baseDays * 0.5);
        break;
      case 'capital':
        baseDays = Math.floor(baseDays * 1.5);
        break;
      case 'design':
        baseDays = Math.floor(baseDays * 1.8);
        break;
      case 'elite':
        baseDays = Math.floor(baseDays * 2.2);
        break;
    }

    // Зависимость от количества комнат
    baseDays += rooms * 5;

    return Math.max(baseDays, 14); // Минимум 14 дней
  }
}

export default new CalculatorService();

