# Corp/BS Translator
> AI-powered two-way translator between corporate jargon and plain human English.

<img width="2559" height="1248" alt="image" src="https://github.com/user-attachments/assets/6d1e41df-ff39-49e3-936f-dff05a187ae7" />

---

## What is this?

Ever sat in a meeting wondering what anyone actually meant? Corp/BS Translator cuts through the noise.

- **Corporate → Human**: Paste the buzzword soup, get the honest truth back
- **Human → Corporate**: Turn plain English into McKinsey-approved waffle

With 5 tone modes: Plain, Sarcastic, Parody, Formal, and Blunt AF.

---

## Live Demo

https://corp-bs-translator.netlify.app/

---

## Features

- Two-way translation — Corporate ↔ Human
- 5 tone modes per direction (10 prompt variations total)
- Rate limited to 100 requests/day per IP
- Example phrases to get started instantly
- Copy to clipboard, paste shortcut, Ctrl+Enter to translate
- Fully responsive UI

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML, CSS, JS |
| Backend | Node.js + Express |
| AI | Google Gemini 2.5 Flash |
| Rate Limiting | express-rate-limit |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

---

## Local Setup

### Prerequisites

- Node.js v18+
- A Google Gemini API key — get one free at [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/corp-bs-translator.git
cd corp-bs-translator
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create your `.env` file

Inside the `/backend` folder, create a `.env` file:

```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

> ⚠️ Never commit this file. It's already in `.gitignore`.

### 4. Start the backend

```bash
node server.js
```

You should see:
```
Server running at http://localhost:3000
Gemini API key: loaded
```

### 5. Open the frontend

Open `frontend/index.html` with Live Server in VS Code, or just double click it in your file explorer.

That's it — the app is running locally.

---

## Project Structure

```
corp-bs-translator/
├── frontend/
│   └── index.html        # Entire UI — HTML, CSS, JS in one file
├── backend/
│   ├── server.js         # Express server + Gemini API + rate limiting
│   ├── .env              # Your API key (never commit this)
│   ├── .gitignore        # Ignores node_modules and .env
│   └── package.json      # Dependencies
└── README.md
```

---

## Deployment

### Backend → Render

1. Push repo to GitHub
2. Go to [render.com](https://render.com) and create a new Web Service from your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `node server.js`
6. Add environment variables:
   ```
   GEMINI_API_KEY=your_key_here
   PORT=10000
   ```
7. Save and Deploy


### Frontend → Netlify

1. Go to [netlify.com](https://netlify.com) and import from GitHub
2. Set **Base directory** to `frontend`
3. Leave build command empty
4. Deploy

Then update this line in `frontend/index.html` to point to your live Railway URL:

```js
const API_BASE = 'https://your-railway-url.up.railway.app';
```

---

## API

### `POST /api/translate`

**Request body:**
```json
{
  "text": "We need to leverage our core competencies.",
  "mode": "corp_to_human",
  "tone": "plain"
}
```

**Mode options:** `corp_to_human` | `human_to_corp`

**Tone options:** `plain` | `sarcastic` | `parody` | `formal` | `blunt`

**Response:**
```json
{
  "translation": "We should use what we're already good at."
}
```

### `GET /api/health`

Returns server status.

---

## Rate Limiting

100 requests per IP per day. Resets at midnight. Tracked in memory — resets if the server restarts.

---

## License

MIT — do whatever you want with it.

---
