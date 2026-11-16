# 🚀 ConnectHub Deployment & Sharing Guide

This guide explains how to make **ConnectHub** live so your friends can use it on their phones, laptops, and PCs anywhere in the world.

---

## ⚡ Method 1: Instant Live Link for Friends (2 Minutes, 100% Free)

If you want your friends to join **right now** without setting up cloud accounts, paying for hosting, or migrating databases:

1. Start ConnectHub on your computer:
   ```cmd
   scripts\start.bat
   ```
2. Run the instant live sharing script:
   ```cmd
   scripts\share-live.bat
   ```
   *(Or run `npm run share`)*
3. Choose option `[1]` for **Localtunnel** or `[2]` for **Cloudflare Quick Tunnel**.
4. You will get a live public HTTPS URL (e.g. `https://cool-panda-42.loca.lt` or `https://....trycloudflare.com`).
5. **Send that URL to your friends!**
   - They can open it directly in their mobile browser, Chrome, Safari, etc.
   - They can register their own accounts or use the 1-click demo logins (`@alice`, `@bob`, `@charlie`).
   - Real-time messages (Socket.IO), C++ data structures, and MySQL storage will all work live!

---

## ☁️ Method 2: 24/7 Cloud Hosting (Vercel / Netlify + Render / Railway)

ConnectHub has 4 interconnected layers:
1. **React Frontend** (Vite SPA)
2. **Node.js + Socket.IO Backend** (Requires a persistent server for live WebSockets)
3. **C++17 Data Structure Engine** (Compiled native binary executing N-ary Tree, Graph BFS/DFS, FIFO Queue, Max Heap)
4. **MySQL Database** (Persistent storage)

> **Why can't Vercel or Netlify host the entire project alone?**  
> Vercel and Netlify are **serverless** platforms. They are fantastic for static frontend SPAs, but they **terminate connections immediately** and cannot maintain persistent WebSockets (`Socket.IO`), persistent database pools, or execute long-running C++ binaries in the background.  
> The standard architecture is: **Vercel/Netlify for Frontend** + **Render/Railway for Backend & C++ Engine & MySQL**.

---

### Step 1: Host Free Cloud MySQL Database

Get a free managed MySQL database in 2 minutes:
- **Option A: Aiven** ([aiven.io](https://aiven.io/mysql)) — Free Tier MySQL instance.
- **Option B: TiDB Cloud** ([tidbcloud.com](https://tidbcloud.com)) — Free MySQL-compatible serverless cluster.
- **Option C: Railway** ([railway.app](https://railway.app)) — 1-click MySQL database plugin.

Once created, copy your credentials:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Import the schema to your cloud database:
Run the SQL queries in `database/schema.sql` and `database/sample_data.sql` via MySQL Workbench or the cloud web console.

---

### Step 2: Deploy Backend + C++ Engine on Render or Railway

We have already configured a production `Dockerfile` in the root of the project that automatically:
- Installs `g++` and compiles `ConnectHubEngine` in Linux.
- Sets up the Express and Socket.IO server.
- Connects to your cloud MySQL.

#### Deploying on Render (Free):
1. Push your ConnectHub project to **GitHub**.
2. Go to [render.com](https://render.com) and click **New + > Web Service**.
3. Select your GitHub repository.
4. Set **Environment** to **Docker** (Render will automatically detect `Dockerfile`).
5. Add the Environment Variables:
   - `DB_HOST`: `<your-cloud-db-host>`
   - `DB_PORT`: `<your-cloud-db-port>`
   - `DB_USER`: `<your-cloud-db-user>`
   - `DB_PASSWORD`: `<your-cloud-db-password>`
   - `DB_NAME`: `connecthub_db`
   - `JWT_SECRET`: `connecthub_jwt_super_secret_key_2024_cpp_ds`
   - `PORT`: `5000`
6. Click **Deploy Web Service**.  
   Render will build the C++ engine, install Node packages, and give you a public URL (e.g. `https://connecthub-api.onrender.com`).

---

### Step 3: Deploy Frontend on Vercel or Netlify

#### Deploying on Vercel:
1. Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. In **Root Directory**, choose: `frontend`
4. In **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. In **Environment Variables**:
   - Name: `VITE_API_URL`
   - Value: `https://connecthub-api.onrender.com` (Your Render backend URL from Step 2)
6. Click **Deploy**!  
   *(Vercel will use our included `frontend/vercel.json` for seamless SPA routing).*

#### Deploying on Netlify:
1. Go to [netlify.com](https://netlify.com) and click **Add new site > Import an existing project**.
2. Select your repository.
3. Set:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Under **Environment variables**, add:
   - `VITE_API_URL` = `https://connecthub-api.onrender.com`
5. Click **Deploy Site**!  
   *(Netlify will use our included `frontend/public/_redirects` for 200 SPA rewrite).*

---

## 🐳 Method 3: 1-Click All-in-One Docker Deployment

If you or a friend have a VPS (DigitalOcean, AWS EC2, Linode, Hetzner, etc.):
```bash
git clone <your-repo-url>
cd ConnectHub
docker compose up -d --build
```
This launches both **MySQL 8.4** and **ConnectHub (Frontend + Backend + C++ Engine)** together on port 5000 with persistent database volumes!
