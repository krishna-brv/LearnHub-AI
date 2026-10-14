# 🚀 LearnHub AI — Complete MERN Stack Deployment Guide

> **Pure MERN Stack Architecture (No Docker Required)**  
> **Frontend:** React (Vite, Tailwind CSS, Lucide, Recharts)  
> **Backend:** Node.js + Express.js REST API + Socket.IO  
> **Database:** MongoDB Atlas (Cloud Managed Database)  
> **AI Engine:** Groq SDK (Llama 3.3 70B & 3.1 8B)

---

## 📋 Prerequisites: MongoDB Atlas Cloud Setup (Free)

Before deploying to Render, Vercel, or Railway, set up your cloud database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Create a **Shared Free Cluster (M0)**.
3. Under **Security -> Database Access**:
   - Add a database user (e.g. `learnhub_admin`), set a secure password, and grant **Read and write to any database**.
4. Under **Security -> Network Access**:
   - Click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** -> Confirm.
   *(This is required so cloud hosting providers like Render and Vercel can reach your cluster).*
5. Click **Connect** on your cluster -> Choose **Drivers** (Node.js) -> Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/learnhub_ai?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials).*

---

## 🎯 Deployment Option 1: Unified Full-Stack on Render (Recommended & Easiest)

Deploy both the backend and frontend together on a single Render Web Service (100% Free tier compatible). Express automatically serves the built React frontend.

### Step 1: Push Repository to GitHub
Ensure all changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure pure MERN stack deployment without Docker"
git push origin main
```

### Step 2: Create Web Service on Render
1. Open the [Render Dashboard](https://dashboard.render.com/) and click **New + -> Web Service**.
2. Connect your GitHub repository: `krishna-brv/LearnHub-AI`.
3. Configure settings:
   - **Name:** `learnhub-ai`
   - **Region:** Choose closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / default root)*
   - **Runtime:** `Node` *(Do NOT select Docker)*
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 3: Configure Environment Variables in Render
In the Render dashboard under **Environment**:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode & static client serving |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/learnhub_ai?retryWrites=true&w=majority` | MongoDB Atlas URI |
| `JWT_SECRET` | `your_super_secret_jwt_access_key_min_32_chars` | Secret key for JWT access tokens |
| `JWT_REFRESH_SECRET` | `your_super_secret_jwt_refresh_key_min_32_chars` | Secret key for JWT refresh tokens |
| `JWT_EXPIRES_IN` | `15m` | Token expiry duration |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token duration |
| `GROQ_API_KEY` | `gsk_your_groq_api_key_here` | Groq AI API key |
| `GROQ_PRIMARY_MODEL` | `llama-3.3-70b-versatile` | Heavy reasoning model |
| `GROQ_FAST_MODEL` | `llama-3.1-8b-instant` | Real-time tutor model |

4. Click **Deploy Web Service**.
5. Once deployment completes, your full-stack app is live at: `https://your-service-name.onrender.com`!

---

## 🎯 Deployment Option 2: Split Deployment (Backend on Render + Frontend on Vercel)

If you prefer hosting the React frontend on Vercel's global CDN and the Express backend on Render:

### Part A: Deploy Express API on Render
1. Render -> **New + -> Web Service**.
2. Settings:
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. Add Environment Variables:
   - All variables from Option 1 (`MONGO_URI`, `JWT_SECRET`, etc.)
   - Plus `CLIENT_URL=https://your-frontend.vercel.app` *(Your Vercel URL)*
4. Note your backend URL (e.g. `https://learnhub-api.onrender.com`).

### Part B: Deploy React Client on Vercel
1. Open [Vercel Dashboard](https://vercel.com/) -> Click **Add New... -> Project**.
2. Import your GitHub repository.
3. Configure Project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://learnhub-ai-1.onrender.com/api` *(or `VITE_BACKEND_URL=https://learnhub-ai-1.onrender.com`)*
5. Click **Deploy**.
   *(SPA routing is pre-configured via `client/vercel.json` so page refreshes will work seamlessly).*

---

## 🛠️ Local Development (Running Without Docker)

From the root directory:

```bash
# 1. Install all dependencies (both server and client)
npm run install:all

# 2. Seed initial sample courses, quizzes, and demo users into MongoDB
npm run seed

# 3. Start both backend (port 5000) and frontend (port 5173) concurrently:
npm run dev
```

Visit:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔧 Common Deployment Issues & How They Are Resolved

1. **"Docker build failed"**:
   - **Cause:** Dockerfile in repository tricked cloud platforms into using container builds.
   - **Fix:** All Dockerfiles removed. Hosting platforms now detect pure Node.js environments.
2. **"Cannot GET /dashboard (404 on refresh)"**:
   - **Fix:** Handled by `client/vercel.json` (Vercel) and Express wildcard SPA route in `server/app.js` (Render).
3. **"CORS policy violation" / 500 errors**:
   - **Fix:** `server/config/cors.js` now dynamically accepts Vercel and Render domains, trims trailing slashes, and fails safely without crashing the server.
4. **"RefreshToken cookie blocked in production"**:
   - **Fix:** `server/controllers/authController.js` sets `sameSite: 'none'` and `secure: true` in production for cross-site cookie transmission.
5. **"ECONNREFUSED 127.0.0.1:27017"**:
   - **Cause:** Missing `MONGO_URI` in production.
   - **Fix:** `server/config/db.js` now validates `MONGO_URI` before connecting and outputs clear setup advice.
6. **"AppError: Cannot find / on this server! (GET / 404)"**:
   - **Cause:** On Render, `client/dist` static build was not compiled or not found. This occurs if:
     - Render **Root Directory** was set to `server` instead of being left empty (root).
     - Render **Build Command** was left as default `npm install` instead of `npm run build`.
     - Vite was in `devDependencies` and omitted when `NODE_ENV=production`.
   - **Fix:**
     - In Render Web Service settings, set **Root Directory** to empty (blank).
     - Set **Build Command** to `npm run build` and **Start Command** to `npm start`.
     - Vite build packages are now in `dependencies` of `client/package.json` with `--include=dev` flags.
     - `server/app.js` now auto-detects frontend builds across candidate directories, gracefully handles `GET /` with API status when in backend-only mode, and silences `/favicon.ico` 404 requests.
