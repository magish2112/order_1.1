import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatDate, slugify } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('должен объединять классы', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('должен обрабатывать условные классы', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });

    it('должен обрабатывать undefined и null', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
    });
  });

  describe('formatPrice', () => {
    it('должен форматировать число как цену в рублях', () => {
      expect(formatPrice(1000)).toContain('1');
      expect(formatPrice(1000)).toContain('000');
    });

    it('должен форматировать строку как цену', () => {
      expect(formatPrice('1500')).toContain('1');
      expect(formatPrice('1500')).toContain('500');
    });

    it('должен обрабатывать большие числа', () => {
      const result = formatPrice(1000000);
      expect(result).toBeTruthy();
    });
  });

  describe('formatDate', () => {
    it('должен форматировать дату в русском формате', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('января');
    });

    it('должен форматировать строку даты', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(result).toContain('2024');
    });
  });

  describe('slugify', () => {
    it('должен создавать slug из текста', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('должен удалять специальные символы', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('должен обрабатывать кириллицу (удаляет нелатинские символы)', () => {
      // slugify удаляет нелатинские символы, поэтому кириллица будет удалена
      const result = slugify('Привет Мир');
      expect(result).toBe('');
    });

    it('должен удалять множественные пробелы', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('должен удалять пробелы в начале и конце', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world');
    });
  });
});

