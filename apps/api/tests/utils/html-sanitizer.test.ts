import { describe, it, expect } from 'vitest';
import { sanitizeHtml, isValidUrl } from '../../src/utils/html-sanitizer';

describe('html-sanitizer', () => {
  describe('sanitizeHtml', () => {
    it('удаляет script теги', () => {
      const html = '<p>OK</p><script>alert(1)</script><span>text</span>';
      expect(sanitizeHtml(html)).not.toMatch(/<script/);
      expect(sanitizeHtml(html)).not.toMatch(/alert\(1\)/);
    });

    it('удаляет event handlers (onclick, onerror)', () => {
      expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).not.toMatch(/onerror/);
      expect(sanitizeHtml('<a href="#" onclick="evil()">x</a>')).not.toMatch(/onclick/);
    });

    it('удаляет javascript: в href', () => {
      const html = '<a href="javascript:alert(1)">x</a>';
      expect(sanitizeHtml(html)).not.toMatch(/javascript:/);
    });

    it('удаляет iframe, embed, object', () => {
      expect(sanitizeHtml('<iframe src="evil"></iframe>')).not.toMatch(/<iframe/);
      expect(sanitizeHtml('<embed src="x">')).not.toMatch(/<embed/);
      expect(sanitizeHtml('<object data="x"></object>')).not.toMatch(/<object/);
    });

    it('удаляет style теги и атрибут style', () => {
      expect(sanitizeHtml('<style>body{}</style>')).not.toMatch(/<style/);
      expect(sanitizeHtml('<p style="color:red">x</p>')).not.toMatch(/style\s*=/);
    });

    it('возвращает пустую строку для не-строки или пустой', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as unknown as string)).toBe('');
    });

    it('оставляет безопасный контент', () => {
      const html = '<p>Hello <strong>world</strong></p><ul><li>a</li></ul>';
      expect(sanitizeHtml(html)).toContain('Hello');
      expect(sanitizeHtml(html)).toContain('world');
    });
  });

  describe('isValidUrl', () => {
    it('принимает http и https', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://a.b')).toBe(true);
    });

    it('принимает относительные пути', () => {
      expect(isValidUrl('/path')).toBe(true);
      expect(isValidUrl('./x')).toBe(true);
      expect(isValidUrl('../y')).toBe(true);
    });

    it('отклоняет javascript: и data:text/html', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      // isValidUrl не фильтрует data: — это делает sanitizeHtml; isValidUrl для href. data: не http/https и не relative
      expect(isValidUrl('data:text/html,<script>')).toBe(false);
    });

    it('отклоняет пустую и не-строку', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null as unknown as string)).toBe(false);
    });
  });
});
