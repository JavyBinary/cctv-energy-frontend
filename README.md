# Фронтенд-приложение: Каталог и Лента камер видеонаблюдения (ЛР6)

## 1. Общие сведения
- **Дисциплина**: Проектирование систем и продуктовая веб-разработка (РИП).
- **Модуль**: 2.
- **Лабораторная работа №6**: Внедрение Redux Toolkit, Redux Thunk, Axios, кодогенерации OpenAPI (Swagger) и интеграция с веб-сервисом FastAPI + MinIO S3.
- **Студент**: Чоботов Л.К., группа ИУ5-51Б.
- **Ветка Git**: `frontend-redux` (продолжение ветки `frontend-react` из ЛР5).
- **Тема 9**: Расчет энергопотребления системы видеонаблюдения (`cameras`).

---

## 2. Стек технологий и архитектура
- **Фреймворк**: React 18 + TypeScript 5 + Vite 5
- **UI-библиотека**: React-Bootstrap 2 + Bootstrap 5
- **Маршрутизация**: React Router DOM v6 (`BrowserRouter`, `Routes`, `Route`)
- **Управление состоянием**: Redux Toolkit (`configureStore`, `createSlice`, `createAsyncThunk`) + `react-redux` (`Provider`, `useSelector`, `useDispatch`).
- **Сетевое взаимодействие и CORS**:
  - Vite Proxy (`vite.config.ts`): `/api` → `http://127.0.0.1:8000` (FastAPI), `/media` → `http://127.0.0.1:9000` (MinIO S3), `/static` → `http://127.0.0.1:8000`.
  - Кодогенерация клиента из OpenAPI (`npm run generate-api` → `src/api/Api.ts`) на базе `Axios` для домена услуг `cameras` через `createAsyncThunk`.
  - Запросы авторизации/выхода (`/api/users/login`, `/api/users/logout`) выполняются напрямую через `authAxios` (`withCredentials: true`) без `thunk` и кодогенерации.
  - При недоступности бэкенда для гостя срабатывает автоматический fallback на локальные моки (`CAMERAS_MOCK`).
  - Состояние авторизации не хранится в `localStorage` (сессия поддерживается `HttpOnly`-кукой `session_id`).

---

## 3. Страницы приложения (все 4 страницы активны по ролям)
1. **«Плитка» (`CameraCatalogPage`, `/` и `/catalog`)**:
   - Форма фильтрации по мощности (`PowerFilter`: ползунок `0.0–15.0 Вт`, кнопка «Найти» через `onSubmit`). Выбранный порог хранится в Redux (`camerasSlice`) и сохраняется при переходе между страницами.
   - Кнопка «Удалить» отображается только авторизованному создателю (`isAuthenticated && is_creator === 1`) и удаляет запись через `DELETE /api/cameras/{id}`.
2. **«Лента» (`CameraFeedPage`, `/feed` и `/feed/:id`)**:
   - Загрузка текущей и следующей камеры (`GET /api/cameras/feed?next=true`) через Redux Thunk.
   - Кнопка лайка для авторизованного пользователя вызывает `POST /api/cameras/{id}/like` (для гостя перенаправляет на `/login`).
3. **«Добавление» (`CameraCreatePage`, `/create`)** — доступна после входа:
   - Шаг 1 (нет черновика): выбор фото и видео (загрузка в MinIO S3), поле `Название модели`, кнопка **«Далее»** (`POST /api/cameras`).
   - Шаг 2 (активный черновик): предпросмотр загруженных медиа, поля `Название модели`, `Потребляемая мощность (Вт)`, `Разрешение`, `Описание`, кнопка **«Опубликовать»** (`PUT /api/cameras/{id}/publish`).
4. **«Вход / Выход» (`LoginPage`, `/login`)**:
   - Авторизация по логину и паролю (`POST /api/users/login`) с установкой сессионной куки.
   - После входа в `BottomNavBar` пункт «Войти» заменяется на «Выход (<username>)», при нажатии сбрасывается сессия и фильтр мощности.

---

## 4. Команды запуска
```bash
npm install
npm run generate-api   # при запущенном бэкенде на :8000
npm run dev            # http://localhost:5173
npm run build
npm test
```
