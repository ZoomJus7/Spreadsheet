## 📊 Табличный процессор

Веб-приложение для работы с электронными таблицами (spreadsheet), с поддержкой документов, формул, форматирования и горячих клавиш. Реализовано на React + TypeScript + Redux Toolkit. Данные хранятся в `localStorage` (mock‑бэкенд).

---

## 🚀 Основные возможности

### 1. Таблица
- Размер по умолчанию **26 столбцов (A–Z) × 100 строк**
- Виртуализация (через `react-window`) для работы с тысячами ячеек
- Выделение ячейки кликом, диапазона – с зажатым `Shift`
- Редактирование ячеек двойным кликом или нажатием `Enter`
- **Формулы:** `=SUM(A1:A5)`, `=AVERAGE(B1:B3)`, `=A1+B1`, `=A1*2`
- Панель формул для просмотра/редактирования содержимого активной ячейки
- Контекстное меню (правая кнопка мыши): добавление/удаление строк и столбцов (сверху/снизу, слева/справа)
- Изменение ширины столбцов и высоты строк перетаскиванием границ

### 2. Управление документами
- Дашборд со списком всех документов текущего пользователя
- **CRUD:** создание, переименование, удаление, дублирование документов
- **Автосохранение** (debounce 500 мс) при любых изменениях в таблице
- **Ручное сохранение** по `Ctrl+S` (браузер не перехватывает)
- Индикатор статуса сохранения («Сохранение…», «Сохранено», «Ошибка»)
- Предупреждение при закрытии вкладки с несохранёнными изменениями
- **Экспорт** в CSV и JSON, **импорт** из CSV (с сохранением структуры)

### 3. Аутентификация и авторизация
- Регистрация и вход (email + пароль, валидация на фронтенде)
- JWT-подобные токены (mock‑реализация)
- Защищённые маршруты – неавторизованный пользователь перенаправляется на `/login`
- Каждый пользователь видит только свои документы (привязка по `userId`)
- Доступ к чужому документу через прямой URL запрещён (403 → редирект на дашборд)

### 4. Форматирование ячеек
- Жирный (`Ctrl+B`), курсив (`Ctrl+I`), подчёркивание (`Ctrl+U`)
- Цвет фона и цвет текста (палитра цветов)
- Выравнивание по левому краю, центру, правому краю
- Числовые форматы: общий, число, процент, валюта, дата

### 5. Горячие клавиши
| Комбинация | Действие |
|------------|----------|
| `Ctrl+S` | Сохранить документ |
| `Ctrl+Z` | Отменить (Undo) |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Повторить (Redo) |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Копировать / вырезать / вставить |
| `Delete` / `Backspace` | Очистить ячейку |
| `Ctrl+A` | Выделить все ячейки |
| `Tab` / `Enter` / стрелки | Навигация между ячейками |

### 6. Страница профиля
- Отображение имени и email
- Изменение имени
- Смена пароля (с проверкой старого пароля)
- Статистика: количество документов, дата регистрации

---

## 🛠 Технологии

- **React 18** + **TypeScript** (строгий режим)
- **Redux Toolkit** – глобальное состояние, слайсы, thunks
- **React Router v6** – маршрутизация, защищённые маршруты
- **react-window** – виртуализация таблицы
- **hot-formula-parser** – безопасное вычисление формул
- **CSS Modules + глобальные стили**

---

## 📁 Структура проекта

```
spreadsheet-app/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── .eslintrc.cjs
├── .prettierrc
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    │
    ├── components/
    │   ├── common/
    │   │   └── Modal.tsx
    │   │
    │   ├── auth/
    │   │   └── ProtectedRoute.tsx
    │   │
    │   ├── dashboard/
    │   │   ├── Dashboard.tsx
    │   │   ├── DocumentCard.tsx
    │   │   ├── CreateDocumentModal.tsx
    │   │   ├── RenameDocumentModal.tsx
    │   │   └── ConfirmDeleteModal.tsx
    │   │
    │   ├── spreadsheet/
    │   │   ├── Spreadsheet.tsx
    │   │   ├── Grid.tsx
    │   │   ├── Cell.tsx
    │   │   ├── RowHeader.tsx
    │   │   ├── ColHeader.tsx
    │   │   ├── FormulaBar.tsx
    │   │   ├── ContextMenu.tsx
    │   │   ├── FormattingToolbar.tsx
    │   │   ├── ColorPicker.tsx
    │   │   └── NumberFormatSelect.tsx
    │   │
    │   └── profile/
    │       ├── ProfileForm.tsx
    │       ├── ChangePasswordForm.tsx
    │       └── UserStats.tsx
    │
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── SpreadsheetPage.tsx
    │   ├── ProfilePage.tsx
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   └── NotFoundPage.tsx
    │
    ├── layouts/
    │   └── AppLayout.tsx
    │
    ├── router/
    │   └── index.tsx
    │
    ├── store/
    │   ├── index.ts
    │   ├── hooks.ts
    │   ├── slices/
    │   │   ├── spreadsheetSlice.ts
    │   │   ├── documentsSlice.ts
    │   │   ├── uiSlice.ts
    │   │   └── authSlice.ts
    │   └── middleware/
    │       └── autoSaveMiddleware.ts
    │
    ├── hooks/
    │   ├── useSpreadsheetData.ts
    │   ├── useSelection.ts
    │   ├── useEditing.ts
    │   ├── useResize.ts
    │   ├── useContextMenu.ts
    │   ├── useVirtualization.ts
    │   ├── useClipboard.ts
    │   ├── useKeyboardShortcuts.ts
    │   ├── useUnsavedChanges.ts
    │   └── useBeforeUnload.ts
    │
    ├── services/
    │   ├── mockApi.ts
    │   └── mockAuthService.ts
    │
    ├── utils/
    │   ├── exportUtils.ts
    │   ├── importUtils.ts
    │   ├── tokenUtils.ts
    │   ├── resizeUtils.ts
    │   ├── formulas/
    │   │   ├── evaluator.ts
    │   │   └── cellReference.ts
    │   └── spreadsheet/
    │       ├── rangeUtils.ts
    │       ├── cellTypeDetector.ts
    │       └── numberFormatters.ts
    │
    ├── types/
    │   ├── spreadsheet.ts
    │   ├── document.ts
    │   └── resize.ts
    │
    ├── constants/
    │   ├── defaultConfig.ts
    │   └── keyBindings.ts
    │
    └── styles/
        ├── global.css
        ├── spreadsheet.css
        ├── dashboard.css
        ├── layout.css
        ├── modal.css
        ├── auth.css
        └── profile.css
```

---

## 🚀 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <url-репозитория>
cd spreadsheet-app
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

---

## 🔐 Тестовые учётные записи

После первого запуска в `localStorage` автоматически создаётся тестовый пользователь:

- Email: `test@example.com`
- Пароль: `12345678`

Вы также можете зарегистрировать нового пользователя через страницу `/register`.

---

## 📦 Особенности реализации

- **Без реального бэкенда** – все данные хранятся в `localStorage` (документы, пользователи, токены)
- **Миграция документов** – старые документы, созданные до внедрения авторизации, автоматически получают `userId=1` (тестовый пользователь)
- **Undo/Redo** – история хранится в Redux (до 50 шагов)
- **Автосохранение** – реализовано через middleware с debounce
- **Виртуализация** – только для строк и столбцов (фиксированная ширина/высота для простоты, но можно переключаться на `VariableSizeGrid`)

---

## 🧪 Что можно протестировать

1. **Регистрация нового пользователя** – создание учётной записи, автоматический вход.
2. **Создание документа** – задать название и размер (строки × столбцы).
3. **Формулы** – например, в A1 ввести `5`, в A2 `10`, в A3 `=SUM(A1:A2)` → результат `15`.
4. **Форматирование** – выделить ячейку/диапазон, применить жирный, цвет фона и т.д.
5. **Горячие клавиши** – `Ctrl+Z`, `Ctrl+C` / `Ctrl+V`, `Ctrl+S`.
6. **Импорт CSV** – загрузить файл с данными (первая строка – заголовки столбцов).
7. **Выход из системы** – кнопка в шапке, после чего доступ к защищённым маршрутам блокируется.

---

## 🙌 Автор

Приёмкин Никита Сергеевич, группа ИП-412
