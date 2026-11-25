# Фронтенд: Расчет энергопотребления видеонаблюдения (Доп. задание: Индексы в БД)

Ветка: `indexes` (репозиторий `cctv-energy-frontend`, от ветки `frontend-pwa`).

## Что добавлено в доп. задании
1. **Пагинация каталога («Плитка»)**:
   - Перегенерирован OpenAPI-клиент `src/api/Api.ts` под пагинированный ответ `{ total, page, limit, data }`.
   - Компонент `src/components/Pagination.tsx` на `React-Bootstrap Pagination` с окном из 5 видимых страниц вокруг текущей (`First`, `Prev`, `Ellipsis`, `Next`, `Last`).
   - В `camerasSlice.ts` хранятся `currentPage`, `limit` (`12`), `total` и фильтр `appliedPower` с синхронизацией URL `?power=...&page=...`.
   - Над сеткой выводится строка «Найдено моделей: N. Страница P из M.».
2. **Лента в Redis на 100 случайных неповторяющихся карточек**:
   - Новый слайс `src/slices/feedBatchSlice.ts` + хранение идентификатора сессии в `sessionStorage` (`src/modules/feedSession.ts`).
   - Первая порция из 100 карточек загружается из `GET /api/cameras/feed/batch` при запуске приложения в `App.tsx` (и обновляется при входе/выходе).
   - На странице «Лента» выводится порядковый номер `№ N`. Переход кнопкой «Следующий» по карточкам 1–99 происходит мгновенно в Redux без запросов к серверу; после 100-й карточки запрашивается новая порция (`?refresh=true`) с продолжением нумерации (`101..200`).

## Команды запуска и проверки
```bash
npm install
npm run generate-api   # при запущенном indexes-backend на :8000
npm run dev            # http://localhost:5173
npm run build
npm test
```
