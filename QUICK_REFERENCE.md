# Quick Reference

Fast lookup commands and common tasks.

---

## 🚀 Core Commands

### Setup & Installation
```bash
# Navigate to backend
cd cybercell/backend

# Install Python packages
pip install -r requirements.txt

# Install Playwright browsers
python -m playwright install chromium firefox

# Verify installation
python -c "from scanner import cli; print('✓ Ready')"
```

### Running Scans

```bash
# Demo scan (example.com)
python -m scanner.cli --config examples/config.yml

# Custom target
python -m scanner.cli --config my-config.yml

# With authentication
python -m scanner.cli --config authenticated-config.yml --verbose

# View available options
python -m scanner.cli --help
```

### Viewing Reports

```bash
# Terminal (JSON)
cat scan_report.json | python -m json.tool

# Browser (HTML)
start scan_report.html          # Windows
open scan_report.html           # macOS
xdg-open scan_report.html       # Linux
```

---

## ⚙️ Configuration Templates

### Minimal Config (`minimal.yml`)
```yaml
target: https://example.com
max_pages: 50
report:
  format: json
```

### Full Featured (`full.yml`)
```yaml
target: https://api.example.com
max_pages: 100
auth:
  enabled: true
  username: user@example.com
  password: password123
  form_selector: "form#login"
report:
  format: both
  output_dir: ../frontend/reports
```

### Authenticated Only (`auth.yml`)
```yaml
target: https://app.example.com
auth:
  enabled: true
  username: testuser
  password: testpass
  form_selector: "form[id='login']"
  post_login_wait: 3
```

---

## 🔍 Finding Specific Outputs

```bash
# Count vulnerabilities by severity
cat scan_report.json | python -c "
import json, sys
data = json.load(sys.stdin)
print(f'Critical: {data[\"summary\"][\"critical\"]}')
print(f'High: {data[\"summary\"][\"high\"]}')
print(f'Medium: {data[\"summary\"][\"medium\"]}')
print(f'Low: {data[\"summary\"][\"low\"]}')
"

# List all URLs found
cat scan_report.json | python -c "
import json, sys
data = json.load(sys.stdin)
for finding in data['findings']:
    print(finding['url'])
" | sort -u

# Extract only critical findings
cat scan_report.json | python -c "
import json, sys
data = json.load(sys.stdin)
critical = [f for f in data['findings'] if f['severity'] == 'Critical']
print(json.dumps(critical, indent=2))
"
```

---

## 🛠️ Development Tasks

### Adding a New Check

**File**: `backend/scanner/checks.py`

```python
def check_custom_vulnerability(self, url, parameters):
    findings = []
    payload = "test_payload"
    
    for param in parameters:
        response = self.session.get(url, params={param: payload})
        
        if "vulnerability_indicator" in response.text:
            findings.append({
                "type": "Custom Vulnerability",
                "severity": "high",
                "url": url,
                "parameter": param
            })
    
    return findings
```

Then call from `check()`:
```python
def check(self, pages):
    findings = []
    # ... existing checks ...
    findings.extend(self.check_custom_vulnerability(url, params))
    return findings
```

### Running Tests

```bash
cd backend
pytest tests/ -v
pytest tests/test_basic.py::test_imports -v
```

### Debugging a Scan

```bash
# Enable verbose logging
python -m scanner.cli --config examples/config.yml --verbose

# Add custom debug in runner.py
import logging
logger = logging.getLogger(__name__)
logger.debug(f"Found {len(pages)} pages")
```

---

## 📊 CI/CD Integration

### GitHub Actions Quick Setup

```yaml
name: Security Scan

on: [push]

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

### GitLab CI Quick Setup

```yaml
security-scan:
  image: python:3.9
  script:
    - cd backend
    - pip install -r requirements.txt
    - python -m playwright install
    - python -m scanner.cli --config ../ci-config.yml
  artifacts:
    paths:
      - backend/scan_report.json
```

---

## 🐛 Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module 'scanner'` | Set PYTHONPATH: `$env:PYTHONPATH = "backend"` |
| `AttributeError: 'build_ext' object has no attribute 'cython_sources'` | Install PyYAML via conda: `conda install pyyaml` |
| `Error: Chromium executable not found` | Install browsers: `python -m playwright install` |
| `Connection refused` | Verify target is reachable: `curl -I https://target.com` |
| `No parser was explicitly specified` | Install lxml: `pip install lxml` |

---

## 📁 File Locations

```
backend/scanner/
  ├─ cli.py           → Entry point
  ├─ runner.py        → Orchestration
  ├─ crawler.py       → Web crawling
  ├─ auth.py          → Login handler
  ├─ checks.py        → Vulnerability detection
  ├─ reporter.py      → Report generation
  └─ oast.py          → Out-of-band testing

frontend/
  ├─ assets/css/report_style.css
  ├─ assets/js/scan_viewer.js
  └─ templates/dashboard.html

docs/
  ├─ README.md        → Full overview
  ├─ INSTALLATION.md  → Setup guide
  ├─ USAGE.md         → Usage examples
  └─ ARCHITECTURE.md  → Technical design
```

---

## 🔗 Key URLs

- **Target for demo**: https://example.com
- **Local reports**: `frontend/reports/`
- **Config template**: `backend/examples/config.yml`
- **Test suite**: `backend/tests/`

---

## 📈 Common Workflows

### Single Target, One-Time Scan
```bash
cd backend
python -m scanner.cli --config examples/config.yml
open scan_report.html
```

### Multiple Targets, Batch Processing
```bash
for target in target1.com target2.com target3.com; do
  sed "s|target:.*|target: https://$target|" examples/config.yml > temp.yml
  python -m scanner.cli --config temp.yml
  mv scan_report.html ../frontend/reports/$target.html
done
```

### Authenticated Scanning
```bash
# 1. Create auth config
cat > auth-config.yml <<EOF
target: https://internal-app.com
auth:
  enabled: true
  username: user@company.com
  password: xyzpassword
  form_selector: "form#login"
EOF

# 2. Run scan
python -m scanner.cli --config auth-config.yml

# 3. View results
open scan_report.html
```

### Track Improvements Over Time
```bash
# Week 1
python -m scanner.cli --config config.yml
cp scan_report.json reports/week1.json

# Week 2 (after remediation)
python -m scanner.cli --config config.yml
cp scan_report.json reports/week2.json

# Compare
diff reports/week1.json reports/week2.json
```

---

## 💡 Tips & Tricks

### Faster Scanning
```yaml
scanning:
  rate_limit: 10  # Increase (default: 5)
  max_concurrent: 5  # Increase
max_pages: 30  # Reduce scope
```

### Stealth Mode
```yaml
scanning:
  rate_limit: 1  # Slow down
  max_concurrent: 1
  checks:
    open_redirect: false  # Skip noisy checks
```

### Disable Checks
```yaml
scanning:
  checks:
    xss: false  # Skip XSS check
    csrf: false  # Skip CSRF check
```

### Custom Headers
```yaml
headers:
  User-Agent: "Custom Scanner v1.0"
  Authorization: "Bearer token123"
```

---

## 🎯 Common Task Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Install browsers: `python -m playwright install`
- [ ] Create config: `cp examples/config.yml my-target.yml`
- [ ] Edit config: `nano my-target.yml`
- [ ] Run scan: `python -m scanner.cli --config my-target.yml`
- [ ] View report: `open scan_report.html`
- [ ] Archive report: `cp scan_report.* ../frontend/reports/`

---

## 📞 Getting Help

```bash
# See all options
python -m scanner.cli --help

# Check module imports
python -c "from scanner import cli, runner, crawler; print('OK')"

# Validate config
python -c "import yaml; yaml.safe_load(open('config.yml'))"

# List installed packages
pip list | grep -E "playwright|requests|beautifulsoup"
```

---

**Last Updated**: February 2026
**Version**: 1.0.0
