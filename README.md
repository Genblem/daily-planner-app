# Daily Planner — Django + Next.js + SQLite

Track food, medication, exercise, water, sleep, and mood in one clean interface.

---

## Stack

| Layer    | Tech                                    |
|----------|-----------------------------------------|
| Backend  | Django 5 + Django REST Framework        |
| Database | SQLite (file: `backend/db.sqlite3`)     |
| Frontend | Next.js 15 (App Router) + TypeScript    |
| Fonts    | DM Serif Display + DM Sans (Google)     |

---

## Quick start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create the SQLite database
DJANGO_SETTINGS_MODULE=settings python manage.py migrate --run-syncdb

# Start the API server on :8000
DJANGO_SETTINGS_MODULE=settings python manage.py runserver 8000
```

The API will be live at **http://localhost:8000/api/**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # starts on :3000
```

Open **http://localhost:3000**

> Next.js proxies `/api/*` → `http://localhost:8000/api/*` via `next.config.js`

---

## API endpoints

| Method | URL                           | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/api/entries/?date=YYYY-MM-DD` | List entries for a date  |
| GET    | `/api/entries/?date=…&category=food` | Filter by category  |
| POST   | `/api/entries/`               | Create entry             |
| PATCH  | `/api/entries/{id}/`          | Update entry             |
| DELETE | `/api/entries/{id}/`          | Delete entry             |
| GET    | `/api/entries/summary/?date=YYYY-MM-DD` | Day summary    |

### Entry fields (by category)

**food** — `title`, `calories`, `meal_type` (breakfast/lunch/dinner/snack)  
**medication** — `title`, `dosage`, `taken` (bool)  
**exercise** — `title`, `duration_minutes`, `intensity` (low/medium/high)  
**water** — `title`, `amount_ml`  
**sleep** — `title`, `sleep_hours`  
**mood** — `title`, `mood` (great/good/okay/bad/terrible)  

All entries share: `date`, `time`, `notes`

---

## Project structure

```
planner/
├── backend/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   └── planner/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
└── frontend/
    ├── next.config.js
    ├── package.json
    ├── lib/
    │   └── api.ts           ← typed API client
    ├── components/
    │   ├── DateNav.tsx
    │   ├── SummaryBar.tsx
    │   ├── EntryCard.tsx
    │   └── EntryModal.tsx
    └── app/
        ├── layout.tsx
        ├── globals.css
        └── page.tsx
```

---

## Production tips

- Set `SECRET_KEY` in environment, set `DEBUG=False` in settings
- Add `ALLOWED_HOSTS` with your domain
- Run Django behind gunicorn + nginx
- Update `next.config.js` rewrites to point at production API URL
