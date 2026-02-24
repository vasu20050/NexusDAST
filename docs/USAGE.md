# Usage Guide

Complete examples and tutorials for using WebScanner.

---

## Table of Contents

1. [Basic Scanning](#basic-scanning)
2. [Authentication](#authentication)
3. [Configuration Reference](#configuration-reference)
4. [Report Interpretation](#report-interpretation)
5. [Advanced Usage](#advanced-usage)
6. [CI/CD Integration](#cicd-integration)
7. [Programmatic API](#programmatic-api)

---

## Basic Scanning

### Quick Start - Single Target

```bash
cd cybercell/backend

# Run with default example config
python -m scanner.cli --config examples/config.yml
```

Output:
```
[*] WebScanner - Advanced Vulnerability Scanner
[*] Target: https://example.com
[*] Starting scan...
[+] Crawled 12 pages
[+] Found 3 forms
[+] Discovered 8 API endpoints
[+] Checking for vulnerabilities...
[!] No critical vulnerabilities found
[+] Report saved to scan_report.json
[+] HTML report saved to scan_report.html
[*] Done. Report written.
```

### View Results

```bash
# View JSON report
cat scan_report.json | python -m json.tool

# Open HTML report in browser
# Windows
start scan_report.html

# macOS
open scan_report.html

# Linux
xdg-open scan_report.html
```

---

## Authentication

### Form-Based Login

Create `authenticated-config.yml`:

```yaml
target: https://webapp.example.com
max_pages: 100
auth:
  enabled: true
  username: testuser
  password: testpass
  form_selector: "form[id='login']"
  username_field: "input[name='username']"
  password_field: "input[name='password']"
  submit_button: "button[type='submit']"

report:
  format: both
  output_dir: ../frontend/reports
```

Run scan:
```bash
python -m scanner.cli --config authenticated-config.yml
```

### Multi-Stage Authentication

For apps with 2FA or intermediate steps:

```yaml
auth:
  enabled: true
  username: user@example.com
  password: mypassword
  form_selector: "form.login"
  username_field: "#email"
  password_field: "#password"
  submit_button: ".btn-login"
  post_login_wait: 3  # seconds
  # Manual verification: User handles 2FA in browser
```

### OAuth/API Token Authentication (Advanced)

```yaml
auth:
  enabled: true
  type: bearer
  token: "YOUR_API_TOKEN_HERE"
  headers:
    Authorization: "Bearer YOUR_TOKEN"
    X-API-Key: "your-api-key"
```

---

## Configuration Reference

### Full Configuration Example

```yaml
# =======================
# WebScanner Configuration
# =======================

# Target application
target: https://api.example.com
max_pages: 100
timeout: 30

# Crawling options
crawl:
  follow_redirects: true
  include_subdomains: false
  exclude_patterns:
    - "/admin/*"
    - "/internal/*"
    - "*.logout"
  include_patterns:
    - "/api/*"
    - "/app/*"

# Authentication (optional)
auth:
  enabled: false
  username: testuser
  password: testpass
  form_selector: "form[id='login']"
  username_field: "input[name='user']"
  password_field: "input[name='pass']"
  submit_button: "button[type='submit']"
  post_login_url: "/dashboard"  # Expected URL after login
  post_login_wait: 2  # seconds

# Vulnerability scanning options
scanning:
  # Check types to enable/disable
  checks:
    sql_injection: true
    xss: true
    ssti: true
    csti: true
    bola: true
    open_redirect: true
    missing_headers: true
    insecure_cookies: true
    csrf: true
  
  # Payload customization
  sql_payloads:
    - "' OR '1'='1"
    - "' OR 1=1--"
    - "1' UNION SELECT NULL--"
  
  xss_payloads:
    - "<script>alert('XSS')</script>"
    - "<img src=x onerror=alert('XSS')>"
  
  # Rate limiting
  rate_limit: 5  # requests per second
  max_concurrent: 3

# OAST Configuration (Out-of-Band Testing)
oast:
  enabled: false
  service: burp  # or "interactsh"
  api_key: "YOUR_API_KEY"
  domain: "your-domain.burpcollaborator.net"

# Report options
report:
  format: both  # "json", "html", or "both"
  output_dir: ../frontend/reports
  include_screenshots: false
  include_requests: true
  severity_threshold: low  # critical, high, medium, low

# Logging
logging:
  level: INFO  # DEBUG, INFO, WARNING, ERROR
  file: scan.log
```

### Configuration by Use Case

#### Aggressive Scanning (Many Payloads)
```yaml
target: https://target.com
max_pages: 200
scanning:
  rate_limit: 10
  max_concurrent: 5
  checks:
    sql_injection: true
    xss: true
report:
  format: both
```

#### Stealth Scanning (Firewall Evasion)
```yaml
target: https://target.com
max_pages: 20
scanning:
  rate_limit: 1  # 1 req/sec
  max_concurrent: 1
report:
  format: json
```

#### Authenticated API Testing
```yaml
target: https://api.example.com
auth:
  enabled: true
  type: bearer
  token: "jwt_token_here"
max_pages: 50
scanning:
  checks:
    bola: true
    xss: true
report:
  format: both
```

---

## Report Interpretation

### JSON Report Structure

```json
{
  "target": "https://example.com",
  "scan_date": "2024-02-20T15:30:00Z",
  "status": "completed",
  "summary": {
    "total_pages": 12,
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
      "url": "https://example.com/redirect?url=",
      "parameter": "url",
      "payload": "https://attacker.com",
      "description": "Application redirects to user-supplied URL",
      "remediation": "Validate and whitelist redirect URLs"
    }
  ]
}
```

### HTML Report Features

The HTML report includes:
- **Summary Table**: Critical/High/Medium/Low count
- **Severity Sections**: Color-coded findings
- **Interactive Filters**: Click severity badges to filter
- **Search**: Find specific findings
- **Print-Friendly**: Export as PDF via browser print

### Severity Mapping

| Severity | CVSS Range | Response Time | Risk Level |
|----------|-----------|---------------|-----------|
| **Critical** | 9.0-10.0 | Immediate (24h) | Exploitation likely in production |
| **High** | 7.0-8.9 | Urgent (72h) | Serious impact possible |
| **Medium** | 4.0-6.9 | Timely (2 weeks) | Moderate risk, standard process |
| **Low** | 0.1-3.9 | Regular (1 month) | Minor, schedule in maintenance |

---

## Advanced Usage

### Custom Vulnerability Checks

Edit `backend/scanner/checks.py` to add custom payloads:

```python
def check_xss(self, url, params):
    # Custom XSS payloads
    custom_payloads = [
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
    ]
    
    for param in params:
        for payload in custom_payloads:
            # Perform test...
            pass
```

### Scanning Behind Proxy

```yaml
proxy:
  enabled: true
  url: http://proxy.corp.com:8080
  username: proxyuser
  password: proxypass
```

### Multiple Target Scanning

Create `batch-config.yml`:

```bash
#!/bin/bash
# batch-scan.sh

targets=(
  "https://app1.example.com"
  "https://app2.example.com"
  "https://app3.example.com"
)

for target in "${targets[@]}"; do
  config=$(mktemp)
  cat > "$config" <<EOF
target: $target
max_pages: 50
auth:
  enabled: false
report:
  format: both
  output_dir: ./reports/${target/https:\/\//}
EOF
  
  echo "[*] Scanning $target..."
  python -m scanner.cli --config "$config"
  rm "$config"
done
```

Run:
```bash
chmod +x batch-scan.sh
./batch-scan.sh
```

### Diff Reports (Track Changes)

```bash
# Run two scans
python -m scanner.cli --config config.yml
cp scan_report.json scan_v1.json

# Make changes to target...

python -m scanner.cli --config config.yml
cp scan_report.json scan_v2.json

# Compare
diff <(cat scan_v1.json | jq '.findings | sort_by(.url)') \
     <(cat scan_v2.json | jq '.findings | sort_by(.url)')
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * 0'  # Weekly

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          python -m playwright install
      
      - name: Run security scan
        run: |
          cd backend
          python -m scanner.cli --config ../ci-config.yml
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: scan-report
          path: backend/scan_report.*
      
      - name: Check for critical findings
        run: |
          critical=$(jq '.summary.critical' backend/scan_report.json)
          if [ "$critical" -gt 0 ]; then
            echo "❌ Critical vulnerabilities found!"
            exit 1
          fi
          echo "✅ No critical vulnerabilities"
```

### GitLab CI

Create `.gitlab-ci.yml`:

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
      - backend/scan_report.html
    reports:
      sast: backend/scan_report.json
  only:
    - branches
    - schedules
```

### Jenkins Pipeline

Create `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh '''
                    cd backend
                    python -m venv venv
                    . venv/bin/activate
                    pip install -r requirements.txt
                    python -m playwright install
                '''
            }
        }
        
        stage('Scan') {
            steps {
                sh '''
                    cd backend
                    . venv/bin/activate
                    python -m scanner.cli --config ../ci-config.yml
                '''
            }
        }
        
        stage('Report') {
            steps {
                archiveArtifacts 'backend/scan_report.*'
                script {
                    def critical = readJSON(file: 'backend/scan_report.json').summary.critical
                    if (critical > 0) {
                        error("❌ ${critical} critical vulnerability(ies) found!")
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
```

---

## Programmatic API

### Python Integration

```python
from scanner.runner import Runner
from scanner.crawler import Crawler
from scanner.auth import Authentication
from scanner.reporter import Reporter
import yaml

# Load configuration
with open('examples/config.yml') as f:
    config = yaml.safe_load(f)

# Run scan
runner = Runner(config)
results = runner.run()

# Access findings
print(f"Total findings: {len(results['findings'])}")
for finding in results['findings']:
    print(f"  - [{finding['severity']}] {finding['type']} at {finding['url']}")
```

### Authenticated Scanning

```python
from scanner.auth import Authentication
from scanner.crawler import Crawler
import requests

# Perform login
auth = Authentication(config)
session = auth.perform_login()  # Returns requests.Session with cookies

# Use authenticated session for crawling
crawler = Crawler(config, session=session)
pages = crawler.crawl()
```

### Custom Checks

```python
from scanner.checks import VulnerabilityChecker

checker = VulnerabilityChecker(session=session)

# Run specific check
xss_findings = checker.check_xss(
    url="https://app.example.com",
    params={"search": ""}
)

# Add custom check
def custom_check(url):
    response = session.get(url)
    if "vulnerable_header" in response.headers:
        return {"type": "Custom", "severity": "medium", "url": url}
    return None

custom_findings = [custom_check(page) for page in pages]
```

---

## Troubleshooting Common Scanning Issues

### Target Returns 403 Forbidden

```yaml
headers:
  User-Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  Referer: "https://example.com/"
```

### JavaScript-Heavy SPA Not Fully Rendered

```yaml
crawl:
  wait_for_selector: ".content"  # Wait for specific element
  wait_timeout: 10  # seconds
```

### Too Many False Positives

```yaml
scanning:
  checks:
    open_redirect: false  # Disable noisy checks
  sql_injection: true
```

### Scan Too Slow

```yaml
scanning:
  rate_limit: 20  # Increase from default 5
  max_concurrent: 5
  max_pages: 50  # Reduce scope
```

---

## Next Steps

- Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Explore [API_REFERENCE.md](API_REFERENCE.md) for full API documentation
- Check [VULNERABILITIES.md](VULNERABILITIES.md) for detection methodology

---

**Last Updated**: February 2026
