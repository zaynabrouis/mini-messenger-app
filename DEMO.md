# 🎓 CI/CD Pipeline & DevSecOps Demo

This guide demonstrates the complete CI/CD pipeline with DevSecOps features for the Mini Messenger App.

---

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git configured
- Access to GitHub repository

---

## 🚀 Part 1: Trigger CI/CD Pipeline

### Option A: Simple File Change
```bash
# Add a demo line to any existing file (choose one):
echo "# Demo" >> README.md
# OR
echo "# Demo" >> DEMO.md

# Then commit and push:
git add .
git commit -m "Demo: Trigger CI/CD pipeline"
git push origin main
```

### Option B: Empty Commit (Faster)
```bash
git commit --allow-empty -m "Demo: CI/CD Pipeline"
git push origin main
```

### ✅ Verify Pipeline is Running
Open: https://github.com/zaynabrouis/mini-messenger-app/actions

**What to show:**
- ✅ Security job (Gitleaks, SonarQube, Trivy)
- ✅ Backend job (npm install, tests)
- ✅ Frontend job (Vitest tests, build)
- ⏱️ Total time: ~1-2 minutes

---

## 🏃 Part 2: Run the Full Application

### Start Everything
```bash
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
```

### View Logs (Optional)
```bash
docker-compose logs -f
```

---

## 🌐 Part 3: Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Chat Application** | http://localhost:5173 | Register a new account |
| **Prometheus Metrics** | http://localhost:9090 | None |
| **Grafana Dashboard** | http://localhost:3001 | admin / admin |
| **Backend API Health** | http://localhost:3000/health | None |
| **Backend Metrics** | http://localhost:3000/metrics | None |
| **SonarCloud** | https://sonarcloud.io | Your account |
| **GitHub Actions** | https://github.com/zaynabrouis/mini-messenger-app/actions | Your account |

---

## 🎯 Part 4: Demo Features

### 1. Show CI/CD Pipeline (GitHub Actions)
1. Navigate to Actions tab
2. Show the latest green run
3. Click on the run to show:
   - **Security scanning** (Gitleaks, SonarQube, Trivy)
   - **Automated tests** (Frontend Vitest tests passing)
   - **Parallel execution** (Jobs running simultaneously)

### 2. Show the Chat Application
1. Open http://localhost:5173
2. Register two users in different browsers/incognito
3. Create a room
4. Send messages between users
5. Show real-time messaging working

### 3. Show Prometheus Metrics
1. Open http://localhost:9090
2. In the search bar, type: `chat_connected_users_total`
3. Click "Execute" and "Graph"
4. Show real-time metrics updating

### 4. Show Grafana Dashboard
1. Open http://localhost:3001
2. Login: `admin` / `admin`
3. Navigate to: **Dashboards** → **Browse**
4. Click on **"Mini Messenger Dashboard"**
5. Show:
   - Connected users graph
   - Memory usage (Heap)
   - Real-time updates (5s refresh)

### 5. Show SonarCloud (Code Quality)
1. Open https://sonarcloud.io
2. Navigate to your project: `zaynabrouis_mini-messenger-app`
3. Show:
   - Code quality score
   - Security analysis
   - Code coverage
   - Technical debt

---

## 📊 DevSecOps Features Implemented

### Security Scanning
- ✅ **Gitleaks**: Scans for secrets and credentials in code
- ✅ **SonarQube**: Static code analysis and security vulnerabilities
- ✅ **Trivy**: Dependency vulnerability scanning
- ✅ **npm audit**: Dependency security checks

### Monitoring & Observability
- ✅ **Prometheus**: Metrics collection
- ✅ **Grafana**: Real-time dashboards
- ✅ **Custom Metrics**: Connected users, memory usage

### Automated Testing
- ✅ **Frontend Tests**: Vitest unit/integration tests
- ✅ **Component Tests**: React Testing Library
- ✅ **Build Verification**: Ensures deployable artifacts

### CI/CD Pipeline
- ✅ **Automated Triggers**: On every push/PR
- ✅ **Parallel Execution**: Faster feedback
- ✅ **Fail-Fast**: Stops on security/test failures
- ✅ **Docker Integration**: Containerized deployment

---

## 🛑 Stop the Application

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
```

---

## 🔄 Quick Re-run Commands

### Trigger Pipeline Again
```bash
# Simplest way - no file changes needed:
git commit --allow-empty -m "Demo: Re-trigger pipeline"
git push origin main
```

### Restart Application
```bash
docker-compose restart
```

### View Real-time Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 💡 Demo Tips

1. **Open tabs beforehand**:
   - GitHub Actions
   - Prometheus
   - Grafana
   - Two browser windows for chat

2. **Clear explanation flow**:
   - Show code → Trigger pipeline → Pipeline runs → App deploys → Monitoring works

3. **Highlight key points**:
   - Security scanning catches issues BEFORE deployment
   - Automated tests ensure code quality
   - Real-time monitoring provides visibility
   - Everything is automated (DevOps culture)

4. **Expected questions**:
   - "What happens if a test fails?" → Pipeline stops, no deployment
   - "How do you know if production is healthy?" → Prometheus + Grafana
   - "What if secrets are committed?" → Gitleaks blocks the pipeline

---

## 📚 Project Structure

```
mini-messenger-app/
├── .github/workflows/pipeline.yml  # CI/CD Pipeline definition
├── backend/                        # Node.js Express backend
│   ├── src/index.js               # Prometheus metrics endpoint
│   └── package.json
├── frontend/                       # React + Vite frontend
│   ├── src/                       # Components and tests
│   └── package.json
├── docker-compose.yml             # All services orchestration
├── prometheus.yml                 # Prometheus configuration
├── grafana/                       # Grafana dashboards
├── sonar-project.properties       # SonarQube configuration
└── .gitleaks.toml                 # Gitleaks secret scanning rules
```

---

## ✅ Demo Checklist

- [ ] Pipeline triggered and running
- [ ] All jobs passing (green checkmarks)
- [ ] Application running on http://localhost:5173
- [ ] Can send messages between users
- [ ] Prometheus showing metrics
- [ ] Grafana dashboard displaying data
- [ ] SonarCloud showing code quality

---

## 🎉 Success!

You've successfully demonstrated a complete **CI/CD pipeline with DevSecOps features** including:
- Automated security scanning
- Continuous testing
- Real-time monitoring
- Containerized deployment

**Good luck with your presentation!** 🚀

