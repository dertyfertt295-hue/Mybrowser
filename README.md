# MapLibre Navigator

Крепкая стартовая основа кастомного навигатора на открытом стекe: **MapLibre GL JS** для карты, **OpenFreeMap** для стилей/тайлов и **GraphHopper Directions API** для поиска адресов и маршрутов.

## Возможности

- интерактивная карта MapLibre GL JS;
- бесплатный публичный стиль OpenFreeMap `liberty` без отдельного token;
- определение местоположения пользователя через Geolocation API и MapLibre Geolocate Control;
- поиск адресов и мест через GraphHopper Geocoding API;
- построение автомобильного маршрута через GraphHopper Routing API;
- отображение линии маршрута, маркеров старта/финиша, дистанции, времени и первых инструкций;
- спокойный минималистичный визуальный фундамент без неонового перегруза.

## Запуск локально без деплоя

### 1. Установите зависимости

```bash
npm install
```

### 2. Создайте локальный env-файл

```bash
cp .env.example .env.local
```

### 3. Добавьте GraphHopper API key

Откройте `.env.local` и замените значение на свой GraphHopper API key:

```bash
VITE_GRAPHHOPPER_API_KEY=your_graphhopper_api_key_here
```

OpenFreeMap для отображения карты отдельный token не требует. GraphHopper key нужен для поиска адресов и построения маршрутов.

### 4. Запустите dev-сервер

```bash
npm run dev
```

После запуска Vite покажет локальный адрес, обычно:

```text
http://localhost:5173/
```

## Что проверить вручную

1. Карта загружается на стиле OpenFreeMap.
2. Браузер запрашивает разрешение на геолокацию.
3. После разрешения геолокации карта центрируется ближе к текущей позиции.
4. Кнопка «Моё местоположение» возвращает карту к текущей позиции.
5. В поле «Куда» можно ввести адрес и построить маршрут.
6. Можно кликнуть по карте, чтобы выбрать точку назначения.
7. После построения маршрута появляются линия маршрута, дистанция, примерное время и первые шаги.

## Важные заметки

- Геолокация в браузере работает только в secure context. `localhost` считается безопасным, поэтому локально всё должно работать без HTTPS.
- Если тестируете с телефона через локальный IP компьютера, браузер может заблокировать геолокацию без HTTPS.
- Если маршруты не строятся, проверьте `.env.local`, корректность `VITE_GRAPHHOPPER_API_KEY` и перезапустите `npm run dev`.
- В Netlify после изменения env-переменной нужно сделать новый deploy.

## Проверки перед деплоем

```bash
npm run lint
npm run build
```

## Деплой на Netlify

Проект уже содержит `netlify.toml`, поэтому Netlify должен автоматически использовать:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 1. Подключите репозиторий

1. Откройте [Netlify](https://app.netlify.com/).
2. Нажмите **Add new site** → **Import an existing project**.
3. Выберите GitHub/GitLab/Bitbucket.
4. Выберите репозиторий с этим приложением.

### 2. GraphHopper key уже добавлен для Netlify

Для удобного деплоя без ручной настройки Environment Variables в Netlify ключ уже лежит в `.env.production`:

```bash
VITE_GRAPHHOPPER_API_KEY=ваш_graphhopper_api_key
```

Vite автоматически подхватит этот файл во время production-сборки на Netlify. Если позже захотите поменять ключ, замените значение в `.env.production` и запушьте новый коммит.

Важно: такой ключ будет встроен во фронтенд-сборку и будет виден в браузере. Для публичного сайта лучше ограничить ключ в GraphHopper dashboard, если такая настройка доступна на вашем тарифе.

### 3. Запустите деплой

```text
Deploys → Trigger deploy → Deploy site
```

Netlify выдаст временный домен вида:

```text
https://your-site-name.netlify.app
```

## Где взять GraphHopper API key

1. Откройте [GraphHopper](https://www.graphhopper.com/).
2. Зарегистрируйтесь или войдите в аккаунт.
3. Откройте dashboard/developer-раздел и создайте API key.
4. Вставьте ключ в `.env.local` локально или в Environment Variables на Netlify как `VITE_GRAPHHOPPER_API_KEY`.

## Быстрый preview без сборки

Standalone preview лежит в папке `preview` и использует CDN-версию MapLibre + OpenFreeMap. Для маршрутов введите GraphHopper API key на странице.

```bash
python3 -m http.server 8000 --directory preview
```

После этого preview доступен локально на:

```text
http://localhost:8000/
```
