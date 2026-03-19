# 🐳 Containerized Web Application with PostgreSQL

A production-ready containerized web application using **Node.js + Express** backend with **PostgreSQL** database, orchestrated via **Docker Compose** with **IPvlan** networking and **persistent volumes**.

## 📁 Project Structure

```
docker-postgres-project/
├── backend/
│   ├── Dockerfile          # Multi-stage build (Node.js)
│   ├── .dockerignore
│   ├── server.js           # Express API server
│   ├── package.json
│   └── package-lock.json
├── database/
│   ├── Dockerfile          # Multi-stage build (PostgreSQL)
│   ├── .dockerignore
│   └── init.sql            # Database seed script
├── docker-compose.yml      # Service orchestration
├── .env                    # Environment variables
├── .gitignore
├── REPORT.md               # Detailed project report
└── README.md
```

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/docker-postgres-project.git
cd docker-postgres-project
```

### 2. Create the IPvlan Network (if using external network)
```bash
# Option A: IPvlan L2 mode
docker network create -d ipvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o ipvlan_mode=l2 \
  -o parent=eth0 \
  myipvlan

# Option B: Macvlan (alternative)
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  mymacvlan
```

> **Note:** The `docker-compose.yml` is configured to create the network automatically. The above commands are only needed if you prefer an external network.

### 3. Build & Run
```bash
docker compose up --build -d
```

### 4. Verify
```bash
# Check running containers
docker ps

# Test the backend API
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/messages
```

## 🌐 API Endpoints

| Method | Endpoint        | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/`            | Returns current time from PostgreSQL |
| GET    | `/health`      | Health check endpoint                |
| GET    | `/messages`    | List all messages                    |
| POST   | `/messages`    | Create a message (`{"text":"..."}`)  |
| DELETE | `/messages/:id`| Delete a message by ID               |

## 🔄 Volume Persistence Test

```bash
# 1. Add a message
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing persistence!"}'

# 2. Stop containers (keep volumes)
docker compose down

# 3. Restart
docker compose up -d

# 4. Check data survived
curl http://localhost:3000/messages
```

## 🔍 Network Inspection

```bash
# Inspect the network
docker network inspect docker-postgres-project_myipvlan

# Check container IPs
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres_db
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' node_backend
```

## 🏗️ Build Optimization

This project uses **Docker multi-stage builds** to minimize image size:

- **Backend**: `node:18` (builder) → `node:18-alpine` (production) — ~90% size reduction
- **Database**: `alpine` (prep) → `postgres:15-alpine` (production)

Compare image sizes:
```bash
docker images | grep -E "backend|database"
```

## 📝 Report

See [REPORT.md](./REPORT.md) for the detailed project report including:
- Build optimization explanation
- Network design diagram
- Image size comparison
- Macvlan vs IPvlan comparison
