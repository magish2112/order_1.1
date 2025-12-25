# Changelog API

## Изменения согласно REVIEW_AND_FIXES.md

### Добавлено

1. **Модуль статистики (`/api/v1/stats`)**
   - `GET /api/v1/stats/homepage` - статистика для Hero секции (счетчики достижений)
     - Возвращает: количество проектов, сотрудников, отзывов, лет опыта
   - `GET /api/v1/admin/stats/dashboard` - статистика для админ-панели
     - Общая статистика заявок, проектов, статей, сотрудников
     - Статистика по статусам заявок
     - Последние заявки
   - `GET /api/v1/admin/stats/views` - статистика просмотров

2. **Улучшения модуля отзывов**
   - Отзывы теперь включают информацию о связанном проекте
   - В ответе API возвращаются: title, slug, coverImage, afterImages, location проекта
   - Это позволяет фронтенду показывать отзывы с превью проектов

3. **Улучшения модуля заявок**
   - Добавлен отдельный endpoint для заказа звонка (`POST /api/v1/requests/callback`)
   - Автоматически устанавливается `source='callback'` для отслеживания источника
   - Поддержка модальных окон для заказа звонка

4. **Улучшения модуля сотрудников**
   - Улучшена фильтрация по отделам (department)
   - Поддержка слайдеров команды с разделением по отделам (Дизайнеры/Прорабы)

### Исправлено

- Исправлена структура ответа API для отзывов с проектами
- Улучшена обработка source в заявках

### API Endpoints

#### Публичные:
- `GET /api/v1/stats/homepage` - счетчики для Hero секции

#### Административные:
- `GET /api/v1/admin/stats/dashboard` - статистика dashboard
- `GET /api/v1/admin/stats/views` - статистика просмотров
- `GET /api/v1/admin/stats/requests` - статистика заявок (уже был, улучшен)

### Примеры использования

#### Получить счетчики для Hero:
```bash
GET /api/v1/stats/homepage
Response: {
  "success": true,
  "data": {
    "projects": 150,
    "employees": 45,
    "reviews": 320,
    "yearsExperience": 10
  }
}
```

#### Получить отзывы с проектами:
```bash
GET /api/v1/reviews?projectId=xxx
Response: {
  "success": true,
  "data": [
    {
      "id": "...",
      "authorName": "Иван Иванов",
      "content": "...",
      "rating": 5,
      "project": {
        "id": "...",
        "title": "Ремонт квартиры в Москва Сити",
        "slug": "remont-kvartiry-moskva-siti",
        "coverImage": "...",
        "afterImages": [...],
        "location": "Москва Сити"
      }
    }
  ]
}
```

#### Заказ звонка через модальное окно:
```bash
POST /api/v1/requests/callback
Body: {
  "name": "Иван",
  "phone": "+7 (999) 123-45-67",
  "contactMethod": "phone" // или "telegram", "whatsapp"
}
```

