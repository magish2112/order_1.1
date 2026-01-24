import { describe, it, expect } from 'vitest';
import {
  isValidMimeType,
  isValidExtension,
  validateAndNormalizeFolder,
  isValidFileSize,
} from '../../src/utils/file-validation';

describe('file-validation', () => {
  describe('isValidMimeType', () => {
    it('разрешает разрешённые MIME-типы', () => {
      expect(isValidMimeType('image/jpeg')).toBe(true);
      expect(isValidMimeType('image/jpg')).toBe(true);
      expect(isValidMimeType('image/png')).toBe(true);
      expect(isValidMimeType('image/gif')).toBe(true);
      expect(isValidMimeType('image/webp')).toBe(true);
      expect(isValidMimeType('application/pdf')).toBe(true);
    });

    it('приводит к нижнему регистру', () => {
      expect(isValidMimeType('IMAGE/JPEG')).toBe(true);
      expect(isValidMimeType('Application/PDF')).toBe(true);
    });

    it('отклоняет запрещённые MIME-типы', () => {
      expect(isValidMimeType('application/x-msdownload')).toBe(false); // .exe
      expect(isValidMimeType('application/x-php')).toBe(false);
      expect(isValidMimeType('text/html')).toBe(false);
      expect(isValidMimeType('application/javascript')).toBe(false);
    });
  });

  describe('isValidExtension', () => {
    it('разрешает разрешённые расширения', () => {
      expect(isValidExtension('photo.jpg')).toBe(true);
      expect(isValidExtension('photo.jpeg')).toBe(true);
      expect(isValidExtension('img.PNG')).toBe(true);
      expect(isValidExtension('doc.pdf')).toBe(true);
    });

    it('отклоняет запрещённые расширения', () => {
      expect(isValidExtension('virus.exe')).toBe(false);
      expect(isValidExtension('script.php')).toBe(false);
      expect(isValidExtension('run.sh')).toBe(false);
    });
  });

  describe('validateAndNormalizeFolder', () => {
    const baseDir = process.platform === 'win32' ? 'C:\\uploads' : '/tmp/uploads';

    it('принимает безопасные относительные пути', () => {
      expect(validateAndNormalizeFolder('projects', baseDir)).toBe('projects');
      const r = validateAndNormalizeFolder('articles/2024', baseDir);
      expect(r).toMatch(/articles/);
      expect(r).toMatch(/2024/);
    });

    it('выбрасывает при path traversal (..)', () => {
      expect(() => validateAndNormalizeFolder('../../../etc', baseDir)).toThrow('Недопустимый путь к папке');
      expect(() => validateAndNormalizeFolder('..', baseDir)).toThrow('Недопустимый путь к папке');
      expect(() => validateAndNormalizeFolder('a/../../etc', baseDir)).toThrow('Недопустимый путь к папке');
    });
  });

  describe('isValidFileSize', () => {
    it('принимает размер в пределах лимита', () => {
      expect(isValidFileSize(100, 1000)).toBe(true);
      expect(isValidFileSize(1000, 1000)).toBe(true);
    });

    it('отклоняет нулевой и отрицательный размер', () => {
      expect(isValidFileSize(0, 1000)).toBe(false);
      expect(isValidFileSize(-1, 1000)).toBe(false);
    });

    it('отклоняет размер больше лимита', () => {
      expect(isValidFileSize(1001, 1000)).toBe(false);
    });
  });
});
