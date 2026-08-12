# Self-Hosted Judge0 CE for CodeForge

Official repo: [judge0/judge0](https://github.com/judge0/judge0)

Judge0 runs student code in an **isolated sandbox** (not inside your Express server). CodeForge calls it at `http://localhost:2358` (or your VPS URL).

## Requirements

| Environment | Supported? |
|-------------|------------|
| **Ubuntu 22.04 VPS** | ✅ Recommended |
| **Linux server + Docker** | ✅ Yes (may need cgroup v1 — see below) |
| **Windows + Docker Desktop** | ⚠️ Often fails — Judge0 needs Linux cgroup v1 |
| **WSL2 alone** | ❌ Not reliable for code execution |

> Judge0 officially supports **Linux only**. For a college pilot, deploy Judge0 on a small VPS (e.g. 2 GB RAM) and point CodeForge Render backend to it.

### Ubuntu 22.04 — cgroup fix (if submissions fail)

```bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX:
#   systemd.unified_cgroup_hierarchy=0
sudo update-grub
sudo reboot
```

## Quick start (Linux / VPS)

```bash
cd judge0

# 1. Configure secrets (first time only)
cp judge0.conf.example judge0.conf
# Edit judge0.conf — set REDIS_PASSWORD, POSTGRES_PASSWORD, AUTHN_TOKEN

# 2. Start database & redis first
docker compose up -d db redis
sleep 15

# 3. Start Judge0 server + workers
docker compose up -d
sleep 10

# 4. Verify
curl http://localhost:2358/about
# Open API docs: http://localhost:2358/docs
```

## Windows (Docker Desktop)

```powershell
cd judge0
.\start.ps1
```

If code execution fails with isolate/cgroup errors, use a **Linux VPS** for Judge0 instead of local Windows.

## Connect CodeForge backend

Add to `server/.env`:

```env
# Self-hosted Judge0 (no RapidAPI key needed)
JUDGE0_URL=http://localhost:2358
JUDGE0_AUTH_TOKEN=codeforge_judge0_local_token
JUDGE0_AUTH_HEADER=X-Auth-Token

# Optional: use async polling in production
# JUDGE0_ASYNC=true
```

**Must match** `AUTHN_TOKEN` in `judge0/judge0.conf`.

For Render backend → VPS Judge0:

```env
JUDGE0_URL=http://YOUR_VPS_IP:2358
JUDGE0_AUTH_TOKEN=your_secret_token
```

Open port **2358** on the VPS firewall (restrict to Render IP if possible).

## Test from CodeForge

```bash
cd server
node scripts/testJudge0.js
node scripts/seedProblems.js
node scripts/validateProblem.js --id 1 --lang javascript
```

## Architecture

```
CodeLab (Vercel)
      ↓
CodeForge API (Render)
      ↓  JUDGE0_URL + JUDGE0_AUTH_TOKEN
Self-hosted Judge0 :2358
      ↓
  server + workers (privileged Docker)
      ↓
  isolate sandbox → compile/run → verdict
```

## Commands

```bash
docker compose ps          # status
docker compose logs -f server worker
docker compose down        # stop
docker compose down -v     # stop + wipe DB (reset)
```

## Security checklist (production)

- [ ] Change `REDIS_PASSWORD`, `POSTGRES_PASSWORD`, `AUTHN_TOKEN` from defaults
- [ ] Do not expose port 2358 to the public internet without auth token
- [ ] Use HTTPS reverse proxy (nginx) if exposing externally
- [ ] Keep Judge0 on same private network as backend when possible
