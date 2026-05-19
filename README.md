# 🔒 NexusDAST

**Advanced Web Application Vulnerability Scanner**

A sophisticated, OWASP-aligned dynamic analysis tool for identifying critical security vulnerabilities in modern web applications with authenticated scanning, intelligent crawling, and comprehensive reporting.

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green.svg)]()
[![Completion: 100%](https://img.shields.io/badge/Completion-100%25-brightgreen.svg)](ALL_TODOS_COMPLETE.md)

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/vasu20050/NexusDAST.git
cd NexusDAST

# 2. Install dependencies (backend folder)
cd backend
pip install -r requirements.txt
python -m playwright install

# 3. Run first scan
python -m scanner.cli --config examples/config.yml

# 4. View results
start scan_report.html  # Windows
open scan_report.html   # macOS
xdg-open scan_report.html  # Linux
```

**That's it!** Your first vulnerability scan is complete. 🎉

---

## 🎯 Key Features

### 🔍 **Dynamic Analysis Engine**
- **JavaScript Rendering**: Headless Chromium with Playwright for modern SPAs
- **Intelligent Crawling**: Automatic discovery of pages, forms, and API endpoints
- **Form Detection**: Enum authentication endpoints and data entry points

### 🔐 **Authentication Support**
- **Form-Based Login**: Auto-fill and submit login forms
- **Session Persistence**: Authenticated vulnerability testing
- **Multi-Stage Auth**: Support for 2FA and CAPTCHA workflows

### 🛡️ **Comprehensive Vulnerability Detection**

| Vulnerability Type | Detection Method | Severity |
|-------------------|------------------|----------|
| SQL Injection | Error-based pattern matching | 🔴 Critical |
| Cross-Site Scripting (XSS) | Reflection analysis | 🟠 High |
| Server-Side Template Injection (SSTI) | Expression detection | 🟠 High |
| Client-Side Template Injection (CSTI) | DOM analysis | 🟠 High |
| Broken Object Level Access (BOLA) | ID enumeration | 🟠 High |
| Open Redirects | URL pattern analysis | 🟡 Medium |
| Missing Security Headers | Header inspection | 🟡 Medium |
| Insecure Cookies | Flag analysis | 🟡 Medium |
| CSRF Protection Issues | Token detection | 🟡 Medium |

### 📊 **Multi-Format Reporting**
- **JSON Reports**: Structured data for CI/CD automation
- **Interactive HTML**: Color-coded findings with filtering & search
- **Print-Friendly**: PDF export via browser print dialog
- **Dashboard**: Aggregate multiple scan reports

---

## 📁 Project Structure

```
NexusDAST/
├── backend/                    # Scanner Engine
│   ├── scanner/               # 7 core modules (1,925+ LOC)
│   │   ├── cli.py            # Command-line interface
│   │   ├── runner.py         # Orchestration layer
│   │   ├── crawler.py        # Web crawling with JS rendering
│   │   ├── auth.py           # Authentication handler
│   │   ├── checks.py         # Vulnerability detection (227 lines)
│   │   ├── reporter.py       # Report generation
│   │   └── oast.py           # Out-of-band testing framework
│   ├── tests/                # Test suite
│   ├── examples/config.yml   # Configuration template
│   └── requirements.txt       # Dependencies
│
├── frontend/                   # UI & Reporting
│   ├── assets/css/           # Professional styling
│   ├── assets/js/            # Interactive features
│   ├── templates/            # HTML templates
│   └── reports/              # Generated scan reports
│
├── docs/                       # Comprehensive Documentation
│   ├── README.md             # Full documentation
│   ├── INSTALLATION.md       # Setup guide
│   ├── USAGE.md              # Usage examples & CI/CD
│   └── ARCHITECTURE.md       # Technical design
│
└── QUICK_REFERENCE.md         # Command cheat sheet
```

---

## 🚀 Usage Examples

### **Basic Scan**
```bash
cd backend
python -m scanner.cli --config examples/config.yml
```

### **Scan with Authentication**
```yaml
# auth-config.yml
target: https://app.example.com
auth:
  enabled: true
  username: user@example.com
  password: password123
  form_selector: "form#login"
```

```bash
python -m scanner.cli --config auth-config.yml
```

### **Custom Target Configuration**
```yaml
# my-target.yml
target: https://your-app.com
max_pages: 100

scanning:
  rate_limit: 10
  max_concurrent: 5

report:
  format: both
  output_dir: ../frontend/reports
```

```bash
python -m scanner.cli --config my-target.yml
```

---

## 🔧 Installation Guide

### **Requirements**
- Python 3.9+
- Conda or pip
- Windows, macOS, or Linux

### **Step-by-Step Setup**

**1. Clone Repository**
```bash
git clone https://github.com/YOUR_USERNAME/NexusDAST.git
cd NexusDAST/backend
```

**2. Install Dependencies**
```bash
# Option A: Using conda (recommended for Windows)
conda install -c conda-forge -r requirements.txt

# Option B: Using pip
pip install -r requirements.txt
```

**3. Install Playwright Browsers**
```bash
python -m playwright install chromium firefox
```

**4. Verify Installation**
```bash
python -c "from scanner import cli; print('✓ Ready to scan')"
```

### **Troubleshooting**

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module 'scanner'` | Set PYTHONPATH: `$env:PYTHONPATH = "backend"` |
| PyYAML build error on Windows | Install via conda: `conda install pyyaml` |
| Playwright browsers not found | Run: `python -m playwright install` |
| Connection timeout | Verify target: `curl -I https://target.com` |

**See [docs/INSTALLATION.md](docs/INSTALLATION.md) for detailed setup guide.**

---

## 📈 Sample Report

After scanning, NexusDAST generates:

**JSON Report** (`scan_report.json`):
```json
{
  "target": "https://example.com",
  "scan_date": "2026-02-25T10:30:00Z",
  "status": "completed",
  "summary": {
    "total_findings": 3,
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 0
  },
  "findings": [
    {
      "type": "Open Redirect",
      "severity": "high",
      "url": "https://example.com/redirect",
      "parameter": "url",
      "payload": "https://attacker.com"
    }
  ]
}
```

**Interactive HTML Report**:
- Color-coded severity badges
- Filter by vulnerability type
- Search across findings
- Export to JSON/PDF

---

## 🔄 CI/CD Integration

### **GitHub Actions**
```yaml
name: Security Scan
on: [push, schedule: {cron: '0 2 * * 0'}]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: |
          cd backend
          pip install -r requirements.txt
          python -m playwright install
          python -m scanner.cli --config ../ci-config.yml
      - uses: actions/upload-artifact@v3
        with:
          name: scan-report
          path: backend/scan_report.html
```

See [docs/USAGE.md](docs/USAGE.md) for GitLab CI and Jenkins examples.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [docs/README.md](docs/README.md) | Feature guide & vulnerability matrix |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Setup + 7 troubleshooting solutions |
| [docs/USAGE.md](docs/USAGE.md) | Usage examples, auth scenarios, CI/CD |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical design & code internals |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Command cheat sheet |

---

## 🎓 How It Works

```
1. RECONNAISSANCE
   └─ Crawl target with JavaScript rendering
   └─ Discover pages, forms, endpoints

2. AUTHENTICATION (Optional)
   └─ Perform form-based login
   └─ Establish authenticated session

3. VULNERABILITY SCANNING
   └─ Inject test payloads
   └─ Analyze responses for vulnerabilities

4. REPORTING
   └─ Classify by CVSS severity
   └─ Generate JSON & HTML reports
```

**See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture.**

---

## ⚖️ Legal & Disclaimer

⚠️ **IMPORTANT**: This tool is designed for **authorized security testing only**. 

- ✅ Use only on targets you own or have explicit written permission to test
- ✅ Comply with applicable laws and regulations
- ✅ Practice responsible disclosure
- ❌ Unauthorized access to computer systems is illegal

**See [LICENSE](LICENSE) for full MIT License.**

---

## 🚀 Getting Started

1. **Read** [docs/README.md](docs/README.md) for complete feature overview
2. **Install** following [docs/INSTALLATION.md](docs/INSTALLATION.md)
3. **Try** the [Quick Start](#-quick-start) demo
4. **Customize** [backend/examples/config.yml](backend/examples/config.yml)
5. **Integrate** with your CI/CD using [docs/USAGE.md](docs/USAGE.md)

---

## 💡 Tips

- Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for command shortcuts
- Review [docs/USAGE.md](docs/USAGE.md) for authentication examples
- See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for extending with custom checks
- Use `--verbose` flag for detailed logging

---

## 📊 Project Stats

- **Code**: 2,500+ lines (scanner + tests)
- **Documentation**: 1,500+ lines (guides + architecture)
- **Vulnerabilities Detected**: 9 OWASP Top 10 types
- **Python**: 3.9+
- **License**: MIT

---

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- GraphQL/API fuzzing
- Advanced JavaScript analysis
- Deep OAST integration
- Additional payload databases
- New vulnerability checks

---

## 📞 Support

- 📖 **Full Docs**: See [docs/](docs/) folder
- ❓ **FAQ**: Check [docs/INSTALLATION.md](docs/INSTALLATION.md#troubleshooting-quick-fixes)
- 🐛 **Issues**: Open GitHub issue
- 💬 **Discussions**: Use GitHub discussions

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for security professionals**

Last Updated: February 2026  
Status: Production Ready ✅
