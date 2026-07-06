# Portfolio Website

<img src="res/website.png" alt="Portfolio Website Screenshot">

<br><br>
A full-stack developer portfolio built with **Vue + Vite** on the frontend
and a **Django REST Framework** API on the backend. Content (profile, tech
stack, experience, projects, contact messages) is served dynamically from the
API rather than hardcoded into the frontend, and the site includes a few
live widgets — WakaTime coding stats, current weather, and a "now playing"
music widget.

## Features

- 🧑‍💻 Dynamic profile, tech stack, work experience, and project sections powered by a Django API
- 📬 Contact form that stores messages in the database
- ⏱️ WakaTime coding-activity chart, stats, and language breakdown
- 🌤️ Live weather widget (Open-Meteo)
- 🎵 "Now playing" widget (LastFM). I use [LastFM cache API](https://github.com/AISHIK999/lastfm_recently_played_api)
- 🎨 Animated UI (GSAP, Motion) using [VueBits](https://vue-bits.dev/)
- 🗂️ Django admin for managing profile, experience, project, and tech-stack content

## Tech Stack

**Frontend**
- Vue, Vue Router, TypeScript
- Vite, Tailwind CSS
- VueBits, Axios, GSAP, Motion, Chart.js

**Backend**
- Django, Django REST Framework
- PostgreSQL (via NeonDB - `dj-database-url`, `psycopg`)
- django-cors-headers, Whitenoise

**Hosting**
- Vercel (frontend and backend deployed as separate projects)
- Neon (managed Postgres)

## Project Structure

```
portfolio-website/
├── backend/                # Django REST API
│   ├── api/                 # Models, serializers, views, admin for portfolio data
│   ├── portfolio/            # Django project settings, URLs, WSGI/ASGI
│   ├── manage.py
│   ├── requirements.txt / pyproject.toml
│   └── vercel.json
└── frontend/                # Vue + Vite
    ├── src/
    │   ├── api/              # Axios calls to the backend API
    │   ├── components/
    │   ├── composables/       # Widget data-fetching (weather, now playing, waka)
    │   └── router/
    ├── package.json
    └── vercel.json
```

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- Python `3.12`
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) instance)

### 1. Clone the repo

```bash
git clone https://github.com/AISHIK999/portfolio-website.git
cd portfolio-website
```

For the environment variables in the next step-
- For `settings.py` either make changes in the `.env` file and import, or hardcore
- For `.env` in frontend, make necessary changes

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env.local`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
DATABASE_URL=postgres://<user>:<password>@<host>/<db>?sslmode=require
```

Then run migrations and start the dev server:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`, with the admin at
`http://localhost:8000/admin/`.

Example data for the models:

<details>
<summary>Profile</summary>
Create only one profile per deployment. For ,ultiple profiles, only the first one is rendered
    <ul>
        <li>Name: Your name (e.g., `FirstName LastName`)</li>
        <li>Tagline: Your status (a couple of words e.g., `Legacy personality`)</li>
        <li>Roles: Python list structure for roles. Space " " doesn't get rendered properly. Fault in the VueBits component. Rather use ` ` - unicode U+2002 (e.g., `["Pythonista", "Backend Developer", "RPA Developer"]`</li>
        <li>Bio: Long intro. Rendered in the about page</li>
        <li>Avatar: Link to your profile photo</li>
        <li>GitHub: Link to your github profile</li>
        <li>LinkedIn: Link to your LinkedIn profile</li>
        <li>Email: Your email ID</li>
        <li>Resume: Link to your resume</li>
    </ul>
</details>

<details>
    <summary>Tech Stacks</summary>
    For each tech stack you want to render in the scrollview in the About page, create a new tech stack with the below attributes
        <ul>
            <li>Node: Link to the icon for the skill (e.g., `https://img.icons8.com/color/48/linux--v1.png` for Linux</li>
            <li>Title: Name of the skill (e.g., `Linux` in this case)</li>
            <li>Href: Link to the website or portal of the skill (e.g., `https://www.linuxfoundation.org/` in this case)</li>
        </ul>
</details>

<details>
    <summary>Experiences</summary>
    For each experience, create a new Experience object
    <ul>
        <li>Company: Name of the company (e.g., Microsoft)</li>
        <li>Start date: Date when you started working</li>
        <li>End date: Date when you left the company. Leave blank for `Currently working` status</li>
        <li>Description: Write whatever you did at work, your achievements etc.</li>
        <li>Order: Keep as is or change the number for ordering the experience list as you need</li>
    </ul>
</details>

<details>
    <summary>Projects</summary>
    For each project, create a new Project object
    <ul>
        <li>Title: Name of the project (e.g., CRUD application)</li>
        <li>Description: Project description</li>
        <li>Tech stack: Python list structure for tech stack (e.g., `["Docker", "PostgreSQL", "Redis"]`</li>
        <li>Github url: Link to the github repo (e.g., https://github.com/torvalds/AudioNoise)</li>
        <li>Live url: Link to where the project is deployed (e.g., idk, DIY. Leave blank if not deployed)</li>
        <li>Image: Link to header image of the project object (e.g., get something from pexels or something idk)</li>
        <li>Featured: Adds a featured tag to the project. Ooh, shiny!</li>
        <li>Order: Keep as is or change the number for ordering the project list as you need</li>
    </ul>
</details>

<details>
    <summary>Contact messages</summary>
    Whoever sends you messages, you get it here. As simple as that. No data entry needed here
</details>

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api   ---> Django API endpoint
VITE_BACKEND_BASE_URL=http://localhost:8000   ---> Django endpoint
VITE_WAKA_BASE_URL=https://wakatime.com/share/@your-wakatime-username     ---> Self explainable ;)
VITE_NOW_PLAYING_URL=https://your-now-playing-endpoint/     ---> Endpoint from https://github.com/AISHIK999/lastfm_recently_played_api
VITE_WEATHER_API_URL=https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<long>&current_weather=true      ---> Lat and long of the city to show the time and weather of
VITE_WAKA_CHART_ID=your_wakatime_chart_embeddable_filename      ---> Wakatime json embeddable filename for "Coding Activity over Last 7 Days"
VITE_WAKA_STATS_ID=your_wakatime_stats_embeddable_filename      ---> Wakatime json embeddable filename for "Coding Activity over All Time"
VITE_WAKA_LANGS_ID=your_wakatime_langs_embeddable_filename      ---> Wakatime json embeddable filename for "Languages over All Time"
```

Then start the dev server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`.

## Deployment

The app deploys as two separate Vercel projects (`backend` and `frontend`
root directories) backed by a Neon Postgres database.

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
