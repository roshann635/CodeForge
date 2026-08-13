# Deploying CodeForge on Render

This repository contains a full-stack Node.js + Express + React application ready for deployment on Render as a single Web Service.

## 🚀 Quick Setup (Render Web Service Settings)

If deploying manually on [Render Dashboard](https://dashboard.render.com/):

1. Click **New +** → **Web Service**.
2. Connect your GitHub / GitLab repository.
3. Configure the following fields **EXACTLY** as shown below:

| Setting Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `codeforge` | Or any custom name |
| **Region** | Singapore / US East / any | Choose closest region |
| **Branch** | `main` (or `master`) | |
| **Root Directory** | *(Leave Empty)* | Do NOT set to `server` or `client` |
| **Environment** | `Node` | |
| **Build Command** | `npm run build` | Builds client & installs server deps |
| **Start Command** | `npm start` | Runs `cd server && node server.js` |

---

## 🔑 Environment Variables Required

Add these in Render under **Environment** variables:

| Variable Key | Required? | Example / Value |
| :--- | :--- | :--- |
| `NODE_VERSION` | Recommended | `20.11.0` |
| `PORT` | Optional (Render auto-sets) | `5000` |
| `MONGO_URI` | **Required** | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | **Required** | Any secure random key string |
| `GEMINI_API_KEY` | Optional | Your Google Gemini API Key |
| `EMAIL_USER` | Optional | Gmail address for OTP emails |
| `EMAIL_PASS` | Optional | Gmail App Password for SMTP |

---

## 🛠 Fixes Applied for Render Compatibility

1. **Removed `prestart` build loop**: Removed `"prestart": "npm run build"` from `server/package.json` which previously caused Render container startup timeouts & port binding failures.
2. **Explicit Host Binding (`0.0.0.0`)**: Configured Express server in `server/server.js` to listen on `"0.0.0.0"` host interface so Render web containers can route traffic properly.
3. **Cross-Platform Scripts**: Updated root `package.json` scripts to be compatible with Render's Linux build environment.
4. **Blueprint Support**: Added `render.yaml` for automatic infrastructure definition.
