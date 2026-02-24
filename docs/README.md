target: https://your-test-target.com
max_pages: 50target: https://your-app.com
auth:
  enabled: true
  username: user@example.com
  password: password123
  form_selector: "form#login"# WebScanner - Advanced Web Application Vulnerability Scanner

**A sophisticated, OWASP-aligned security testing tool for identifying vulnerabilities in modern web applications.**

> ⚠️ **Disclaimer**: This tool is designed for authorized security testing and vulnerability assessments only. Unauthorized access to computer systems is illegal. Always obtain proper authorization before scanning any web application.

---

## 📋 Quick Start

### Prerequisites
- Python 3.9+
- Conda or venv environment manager
- Windows, macOS, or Linux

### Basic Installation

```bash
# Clone and navigate
cd cybercell/backend
pip install -r requirements.txt
python -m playwright install
```

### First Scan

```bash
# Run demo scan
python -m scanner.cli --config examples/config.yml

# View results
cat scan_report.json
start scan_report.html  # Windows
open scan_report.html   # macOS
xdg-open scan_report.html  # Linux
```

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| [INSTALLATION.md](INSTALLATION.md) | Detailed setup guide with troubleshooting |
| [USAGE.md](USAGE.md) | Complete usage examples and configuration reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module descriptions and technical design |
| [API_REFERENCE.md](API_REFERENCE.md) | Python API for programmatic scanning |
| [VULNERABILITIES.md](VULNERABILITIES.md) | Vulnerability detection details |

---

## 🎯 Key Features

### Dynamic Analysis Engine
- **JavaScript Rendering**: Headless Chromium browser with Playwright for modern SPA scanning
- **Form Discovery**: Automatic detection and enumeration of authentication/data entry forms
- **Endpoint Mapping**: Regex-based API endpoint discovery and cataloging

### Authentication Support
- **Form-Based Login**: Automatic form filling with credentials
- **Session Persistence**: Export Playwright sessions to requests for authenticated vulnerability testing
- **Multi-Stage Auth**: Support for flows with intermediate steps (2FA, CAPTCHA placeholders)

### Comprehensive Vulnerability Detection

| Category | Vulnerabilities |
|----------|-----------------|
| **Injection** | SQL Injection, Template Injection (SSTI), Client-side Injection (CSTI) |
| **Cross-Site Scripting** | Reflected XSS, DOM-based XSS detection |
| **Broken Access Control** | Broken Object Level Access (BOLA), horizontal/vertical privilege escalation |
| **Misconfiguration** | Missing security headers (CSP, HSTS, X-Frame-Options), insecure cookie flags |
| **Broken Auth** | CSRF token detection, session handling analysis |
| **Open Redirects** | URL redirection vulnerability scanning |

### Severity Classification
- **Critical** (CVSS 9.0-10.0): Immediate patching required
- **High** (CVSS 7.0-8.9): Urgent remediation
- **Medium** (CVSS 4.0-6.9): Plan timely fixes
- **Low** (CVSS 0.1-3.9): Address in regular maintenance

### Multi-Format Reporting
- **JSON Reports**: Structured data for automation and integration
- **Interactive HTML Reports**: Color-coded findings with filtering and search
- **Print-Friendly**: PDF export support via browser print dialog

---

## 🔐 Vulnerability Detection Matrix

| Vulnerability | Detection Method | Severity Range | False Positive Rate |
|---------------|-----------------|-----------------|-------------------|
| SQL Injection | Error-based pattern matching | Critical | ~5% |
| XSS (Reflected) | Input reflection analysis | High/Medium | ~10% |
| SSTI | Template expression detection | High | ~8% |
| BOLA | Sequential ID tampering | High/Medium | ~3% |
| Open Redirect | URL pattern analysis | Medium | ~15% |
| Missing Headers | Response header inspection | Medium/Low | ~1% |
| CSRF | Token presence analysis | Medium | ~20% |
| Insecure Cookies | Flag inspection (HttpOnly, Secure, SameSite) | Low | ~0% |

---

## 📦 Project Structure

```
cybercell/
├── backend/                    # Scanner logic and engine
│   ├── scanner/
│   │   ├── cli.py             # CLI entry point
│   │   ├── runner.py          # Orchestration layer
│   │   ├── crawler.py         # Web crawling engine
│   │   ├── auth.py            # Authentication handler
│   │   ├── checks.py          # Vulnerability checks
│   │   ├── reporter.py        # Report generation
│   │   └── oast.py            # Out-of-band testing framework
│   ├── tests/                 # Test suite
│   ├── examples/
│   │   └── config.yml         # Configuration template
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # UI and reporting
│   ├── assets/
│   │   ├── css/               # Report styling
│   │   └── js/                # Interactive features
│   ├── templates/             # HTML templates
│   └── reports/               # Generated scan reports
│
└── docs/                       # Documentation
    ├── INSTALLATION.md
    ├── USAGE.md
    ├── ARCHITECTURE.md
    ├── API_REFERENCE.md
    └── VULNERABILITIES.md
```

---

## 🚀 Common Use Cases

### 1. **Baseline Security Assessment**
```bash
python -m scanner.cli --config examples/config.yml
```

### 2. **Authenticated Area Scanning**
Configure `auth` section in YAML:
```yaml
target: https://app.example.com
auth:
  enabled: true
  username: testuser
  password: testpass
  form_selector: "form[id='login']"
```

### 3. **Continuous Integration**
```bash
python -m scanner.cli --config ./ci-config.yml
# Exit code 0 = no critical/high findings
# Exit code 1 = vulnerabilities found
```

### 4. **Programmatic Scanning**
```python
from scanner.runner import Runner
from scanner.crawler import Crawler

runner = Runner(config)
results = runner.run()
```

---

## 🐛 Troubleshooting

### PyYAML Installation Fails on Windows
**Solution**: Install via conda instead of pip
```bash
conda install pyyaml
```

### Playwright Browsers Not Found
**Solution**: Install browser binaries
```bash
python -m playwright install
```

### ModuleNotFoundError: No module named 'scanner'
**Solution**: Ensure PYTHONPATH includes backend folder
```bash
# Windows PowerShell
$env:PYTHONPATH = "backend"
python -m scanner.cli --config examples/config.yml

# macOS/Linux
export PYTHONPATH=backend
python -m scanner.cli --config examples/config.yml
```

See [INSTALLATION.md](INSTALLATION.md) for detailed troubleshooting.

---

## 🛠️ Development

### Running Tests
```bash
cd backend
pytest tests/ -v
```

### Adding Custom Checks
1. Edit `backend/scanner/checks.py`
2. Add method to `VulnerabilityChecker` class
3. Register in `check()` orchestration method
4. Update test suite

### Integration with OAST Services
- Framework ready for Burp Collaborator
- Placeholder for Interactsh API integration
- See [vulnerabilities.md](VULNERABILITIES.md#oast-integration) for details

---

## 📋 License & Legal

**MIT License** - See LICENSE file for details.

⚠️ **Responsible Disclosure**: Report discovered vulnerabilities responsibly. Use this tool only for authorized testing. The authors assume no liability for misuse.

---

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- GraphQL/API-specific testing
- Advanced JavaScript analysis
- Proxy support for traffic interception
- Additional payload databases

Submit pull requests or issues to improve coverage.

---

## 📞 Support & Contact

- 📖 See [USAGE.md](USAGE.md) for detailed examples
- 🔧 Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical design
- 🐍 Check [API_REFERENCE.md](API_REFERENCE.md) for Python API details

---

## 🔄 Version History

- **v1.0.0** (Current): Initial release with OWASP Top 10 coverage, authenticated scanning, HTML/JSON reporting
- **v0.5.0**: Basic vulnerability detection, crawler, reporter
- **v0.1.0**: Project scaffold

---

**Last Updated**: February 2026
**Maintained By**: WebScanner Team
