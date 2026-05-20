# 🚀 NexusDAST Dashboard - Quick Reference

## 📱 Start Dashboard in 3 Steps

### Step 1: Navigate to Project
```bash
cd c:\Users\vaibh\OneDrive\Desktop\cybercell
```

### Step 2: Start Server

**Windows:**
```bash
run_server.bat
```

**macOS/Linux:**
```bash
chmod +x run_server.sh
./run_server.sh
```

**Any Platform:**
```bash
python run_server.py
```

### Step 3: Open Browser
Browser should open automatically to:
```
http://localhost:8000
```

---

## 🌐 Dashboard Sections

| Section | URL | Features |
|---------|-----|----------|
| **Dashboard** | `http://localhost:8000` | Stats, quick links, overview |
| **Features** | `#features` | Key capabilities |
| **Vulnerabilities** | `#vulnerabilities` | Detection matrix |
| **Quick Start** | `#quickstart` | Setup guide |
| **Documentation** | `#docs` | Links to all guides |
| **About** | `#about` | Project info |

---

## 📊 Sample Reports

View pre-generated reports:
- JSON: `http://localhost:8000/scan_report.json`
- HTML: `http://localhost:8000/scan_report.html`

---

## ⚙️ Common Commands

| Task | Command |
|------|---------|
| Start server | `python run_server.py` |
| Use port 8080 | `python run_server.py 8080` |
| Stop server | `Ctrl+C` in terminal |
| View files | `http://localhost:8000/backend/` |
| Edit dashboard | Edit `index.html` directly |

---

## 🔧 Port Troubleshooting

**Port 8000 in use?**
```bash
# Try different port
python run_server.py 8080
# then visit: http://localhost:8080
```

**Find what's using port 8000:**

Windows:
```cmd
netstat -ano | findstr :8000
```

macOS/Linux:
```bash
lsof -i :8000
```

---

## 🎓 From Dashboard You Can:

✅ Navigate all sections with tabs  
✅ View project statistics  
✅ Learn about each vulnerability type  
✅ See detection methods  
✅ Access quick start instructions  
✅ Click links to full documentation  
✅ View GitHub repository  
✅ Check technology stack  

---

## 📖 Full Documentation

For complete details: [`RUNNING_LOCALLY.md`](RUNNING_LOCALLY.md)

---

**Dashboard ready!** 🎉 Visit http://localhost:8000 to get started.
