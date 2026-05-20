# 🌐 Running NexusDAST Dashboard Locally

This guide explains how to run the NexusDAST frontend dashboard on your local machine.

---

## 📋 Prerequisites

- Python 3.6+ (for HTTP server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional packages needed (uses Python's built-in HTTP server)

---

## 🚀 Quick Start

### Option 1: Windows (Easiest)

**Double-click the batch file:**
```
run_server.bat
```

Or run from Command Prompt:
```cmd
run_server.bat
# or with custom port:
run_server.bat 8080
```

✅ Browser should open automatically to http://localhost:8000

---

### Option 2: macOS / Linux

**Make script executable:**
```bash
chmod +x run_server.sh
```

**Run the script:**
```bash
./run_server.sh
# or with custom port:
./run_server.sh 8080
```

✅ Browser should open automatically to http://localhost:8000

---

### Option 3: Manual Python (All Platforms)

**Navigate to project directory:**
```bash
cd c:\Users\vaibh\OneDrive\Desktop\cybercell  # Windows
# or
cd ~/path/to/cybercell  # macOS/Linux
```

**Start the server:**
```bash
python run_server.py
# or with custom port:
python run_server.py 8080
```

**Open in browser:**
```
http://localhost:8000
```

---

### Option 4: Python's Built-in Server

**Without our script (basic method):**
```bash
cd c:\Users\vaibh\OneDrive\Desktop\cybercell

# Windows:
python -m http.server 8000

# macOS/Linux:
python3 -m http.server 8000
```

**Open in browser:**
```
http://localhost:8000/index.html
```

---

## 📊 What You'll See

The dashboard includes:

✅ **Dashboard Tab**
- Project statistics (9 vulnerability types, 1,447 LOC, etc.)
- Quick links to GitHub and sample reports
- Completion status

✅ **Features Tab**
- Key features overview
- Dynamic analysis capabilities
- Authentication support

✅ **Vulnerabilities Tab**
- Complete vulnerability matrix
- Detection methods for each type
- Severity levels

✅ **Quick Start Tab**
- Step-by-step setup instructions
- Installation commands
- Code examples

✅ **Documentation Tab**
- Links to all documentation files
- README, Installation, Usage guides
- Architecture and PRD documents

✅ **About Tab**
- Project overview
- Technology stack
- Development timeline
- Contact information

---

## 🔗 Available Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | http://localhost:8000/ | Main frontend index |
| Dashboard | http://localhost:8000/index.html | Same as above |
| Reports | http://localhost:8000/scan_report.html | Sample vulnerability report |
| Reports | http://localhost:8000/scan_report.json | Sample JSON report |
| Backend | http://localhost:8000/backend/ | Backend files (if not .gitignore) |

---

## ⚙️ Customization

### Change Port

If port 8000 is already in use, specify a different port:

**Windows:**
```cmd
run_server.bat 8080
```

**macOS/Linux:**
```bash
./run_server.sh 8080
```

**Python directly:**
```bash
python run_server.py 9000
```

### Edit the Dashboard

The dashboard is fully customizable. Edit `index.html` to:
- Change colors (see `:root` CSS variables)
- Add new sections
- Modify styling
- Update content

Changes automatically appear when you refresh the browser.

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `Address already in use`

**Solution:** Use a different port
```bash
python run_server.py 8080
```

Or kill the existing process:

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :8000
kill -9 <PID>
```

---

### Python Not Found

**Error:** `'python' is not recognized` or `command not found: python`

**Solution:** Install Python from https://www.python.org

Or use full path:
```bash
C:\Python39\python.exe run_server.py  # Windows
/usr/bin/python3 run_server.py  # macOS/Linux
```

---

### CORS Errors

If you see CORS errors in console:
- This is normal for file:// protocol
- Use the HTTP server (this solution fixes it)
- Not an issue in production

---

### Files Not Found

**Problem:** 404 errors for assets

**Solution:** Make sure you're in the correct directory
```bash
cd c:\Users\vaibh\OneDrive\Desktop\cybercell
# or wherever you cloned NexusDAST
```

---

## 🔄 Server Features

### Automatic Features

✅ Auto-opens browser (if possible)  
✅ Shows server URL in terminal  
✅ Lists serving directory  
✅ Handles CORS properly  
✅ Serves static files automatically  
✅ Pretty-prints directory listings

---

## 🛑 Stopping the Server

### Keyboard Shortcut
```
Press Ctrl+C in the terminal/command prompt
```

You should see:
```
✅ Server stopped
```

---

## 📂 Project Structure for Server

```
cybercell/
├── index.html                    ✅ Main dashboard
├── scan_report.html              ✅ Sample vulnerability report
├── scan_report.json              ✅ Sample JSON report
├── run_server.py                 ✅ Python server launcher
├── run_server.bat                ✅ Windows batch script
├── run_server.sh                 ✅ macOS/Linux shell script
├── README.md                     ✅ Project README
├── docs/
│   ├── README.md                 ✅ Features & quick start
│   ├── INSTALLATION.md           ✅ Setup guide
│   ├── USAGE.md                  ✅ Usage examples
│   ├── ARCHITECTURE.md           ✅ Technical design
│   ├── PRD.md                    ✅ Product requirements
│   └── TECHNICAL_ARCHITECTURE.md ✅ Technical specs
├── backend/
│   ├── scanner/                  ✅ Core modules
│   ├── tests/                    ✅ Unit tests
│   ├── examples/                 ✅ Config examples
│   └── requirements.txt          ✅ Dependencies
└── frontend/
    ├── assets/
    │   ├── css/                  ✅ Styling
    │   └── js/                   ✅ Interactivity
    └── templates/                ✅ HTML templates
```

---

## 🎓 Learning More

From the dashboard, you can:
- Click links to view documentation
- Explore different tabs
- View the sample vulnerability report
- Check GitHub repository
- Read all documentation files

---

## 💡 Tips & Tricks

### Keep Terminal Visible
- Don't close the terminal window
- Server will stop when terminal closes

### Multiple Ports
- Run multiple instances on different ports:
  ```bash
  python run_server.py 8000 &  # Background
  python run_server.py 8080 &  # Another window
  ```

### View File List
- Navigate to http://localhost:8000/backend/
- See all backend files
- Access via web browser

### Network Access
- Local only by default
- For network access, modify `run_server.py`
- Change `""` to `"0.0.0.0"` (security risk)

---

## 📞 Support

For issues:
1. Check troubleshooting section above
2. Verify Python is installed: `python --version`
3. Check port is available: `netstat -ano` (Windows)
4. Try different port: `python run_server.py 9000`
5. Clear browser cache (Ctrl+Shift+Delete)

---

## 🔒 Security Note

This HTTP server is for development only. 

⚠️ **DO NOT** use in production.

For production deployment:
- Use professional web servers (Nginx, Apache)
- Enable HTTPS/SSL
- Implement authentication
- Add security headers
- Use proper hosting

---

**Ready to run?** Start with:

```
# Windows
run_server.bat

# macOS/Linux
./run_server.sh

# Python (all platforms)
python run_server.py
```

Then open: **http://localhost:8000** 🚀

---

*Dashboard v1.0.0 | NexusDAST | May 2026*
