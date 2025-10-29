# CSV Import API Documentation

## Endpoint: POST /api/leads/import-csv

Импортирует лиды из CSV файла в систему.

### Параметры запроса

**Content-Type:** `multipart/form-data`

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| file | File | Да | CSV файл с данными лидов |
| workspaceId | string | Да | UUID рабочего пространства |
| companyTypeId | string | Нет | UUID типа компании |
| responsibleId | string | Нет | UUID ответственного пользователя |

### Формат CSV файла

CSV файл должен содержать следующие столбцы. Заголовки могут находиться в любой строке файла (система автоматически найдет строку с заголовками):

1. **Название компании** - обязательное поле
2. **Сайт компании** - необязательное поле (значение "-" игнорируется)
3. **Телефон компании** - необязательное поле (значение "-" игнорируется)
4. **Почта** - необязательное поле (должен быть валидный email, значение "-" игнорируется)

**Особенности:**
- Поддерживаются пустые строки в начале файла
- Поддерживаются дополнительные столбцы (например, номера строк)
- Корректно обрабатываются значения в кавычках
- Значения "-" считаются пустыми и игнорируются

### Пример CSV файла

```csv
,,,,
,Название компании,Сайт компании,Телефон компании,Почта
1,Яндекс,-,"8(800)234-24-80, 7(343)385-01-00",
2,Точка Банк,https://tochka.com,8(800)600-46-57,
3,Мотив,https://motivtelecom.ru,,promo@motivtelecom.ru
```

### Ответ

```json
{
  "totalRows": 3,
  "successCount": 2,
  "errorCount": 1,
  "errors": [
    "Row 3: Invalid email format"
  ],
  "createdLeadIds": [
    "uuid1",
    "uuid2"
  ]
}
```

### Поля ответа

| Поле | Тип | Описание |
|------|-----|----------|
| totalRows | number | Общее количество строк в CSV |
| successCount | number | Количество успешно импортированных лидов |
| errorCount | number | Количество строк с ошибками |
| errors | string[] | Массив описаний ошибок |
| createdLeadIds | string[] | Массив UUID созданных лидов |

### Возможные ошибки

- **400 Bad Request** - Неверный формат CSV файла
- **400 Bad Request** - Отсутствуют обязательные столбцы
- **404 Not Found** - Тип компании не найден
- **401 Unauthorized** - Отсутствует авторизация
- **403 Forbidden** - Недостаточно прав доступа

### Требования к правам доступа

Для использования этого endpoint требуется разрешение `leadManage`.

### Пример использования с curl

```bash
# Импорт с обязательными параметрами (только workspaceId)
curl -X POST \
  http://localhost:3000/api/leads/import-csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@BAZA - Лист1.csv" \
  -F "workspaceId=uuid-of-workspace"

# Импорт с дополнительными параметрами
curl -X POST \
  http://localhost:3000/api/leads/import-csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@BAZA - Лист1.csv" \
  -F "workspaceId=uuid-of-workspace" \
  -F "companyTypeId=uuid-of-company-type" \
  -F "responsibleId=uuid-of-responsible-user"
```
