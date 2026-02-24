# Architecture & Design

Technical documentation of WebScanner's architecture, design patterns, and module interactions.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Module Overview](#module-overview)
3. [Data Flow](#data-flow)
4. [Design Patterns](#design-patterns)
5. [Scanning Pipeline](#scanning-pipeline)
6. [Extension Points](#extension-points)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WebScanner System                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
          ┌─────▼──────┐ ┌────▼────┐ ┌────▼─────┐
          │    CLI     │ │ Config  │ │ Logging  │
          └─────┬──────┘ └────┬────┘ └────┬─────┘
                │             │            │
          ┌─────▼─────────────▼────────────▼──────┐
          │         Runner (Orchestration)        │
          └─────┬──────────────────────────────┬──┘
                │                              │
          ┌─────▼──────┐              ┌────────▼────────┐
          │  Crawler   │              │  Auth Handler   │
          │  (JS Rend) │              │  (Form Login)   │
          └─────┬──────┘              └────────┬────────┘
                │                              │
          ┌─────▼──────────────────────────────▼───────┐
          │      Vulnerability Checker                  │
          │  (SQLi/XSS/SSTI/CSTI/BOLA/etc)            │
          └─────┬──────────────────────────────────┬───┘
                │                                  │
          ┌─────▼──────┐                   ┌──────▼──────┐
          │  Reporter  │                   │  OAST (OOB) │
          │(JSON/HTML) │                   │  Framework  │
          └────────────┘                   └─────────────┘

                    ↓
          ┌──────────────────────┐
          │   Reports Folder     │
          │  (JSON + HTML)       │
          └──────────────────────┘
```

### Scanning Phases

```
1. RECONNAISSANCE
   └─ Crawl target with JS rendering
   └─ Extract forms, endpoints, links
   └─ Build attack surface map

2. AUTHENTICATION (Optional)
   └─ Form-based login
   └─ Export session cookies
   └─ Establish authenticated context

3. VULNERABILITY SCANNING
   └─ Inject payloads into parameters
   └─ Monitor responses for indicators
   └─ Heuristic-based detection

4. OUT-OF-BAND TESTING (Optional)
   └─ Generate OOB payloads
   └─ Callback detection
   └─ Remediate false negatives

5. REPORTING
   └─ Classify by severity
   └─ Generate JSON report
   └─ Generate interactive HTML
```

---

## Module Overview

### 1. **CLI Module** (`cli.py`)

**Purpose**: Command-line interface and configuration parsing

**Key Responsibilities**:
- Parse command-line arguments
- Load YAML configuration files
- Initialize logging
- Invoke Runner

**Key Methods**:
- `main()` - Entry point
- `load_config()` - YAML parsing with validation

**Dependencies**: `yaml`, `argparse`, `logging`

**Example**:
```python
from scanner.cli import main

# Command: python -m scanner.cli --config myconfig.yml --verbose
main()
```

**Data Contract**:
```yaml
Input: YAML config file
Output: Configuration dictionary passed to Runner
```

---

### 2. **Runner Module** (`runner.py`)

**Purpose**: Orchestration layer coordinating all scanning phases

**Key Responsibilities**:
- Manage scan lifecycle
- Coordinate Crawler, Auth, Checker, Reporter
- Handle error recovery
- Emit progress/status updates

**Key Methods**:
- `run()` - Main orchestration method
- `_setup()` - Initialize components
- `_cleanup()` - Resource cleanup

**Dependencies**: `crawler`, `auth`, `checks`, `reporter`

**Example**:
```python
runner = Runner(config)
results = runner.run()  # Returns findings dict
```

**Orchestration Flow**:
```
1. Setup (initialize modules)
2. Crawl (discover pages/forms)
3. Authenticate (if enabled)
4. Check (run vulnerability tests)
5. Report (generate outputs)
6. Cleanup (close browsers, sessions)
```

---

### 3. **Crawler Module** (`crawler.py`)

**Purpose**: Web crawling with JavaScript rendering and form discovery

**Key Responsibilities**:
- Launch Playwright browser
- Render pages with JavaScript
- Extract links, forms, API endpoints
- Handle pagination and session persistence

**Key Methods**:
- `crawl()` - Main crawling loop
- `_extract_links()` - Parse links from HTML
- `_extract_forms()` - Discover forms and fields
- `_discover_endpoints()` - Regex-based API discovery

**Core Algorithm**:
```
1. Initialize browser (Chromium/Firefox)
2. Add target to queue
3. While queue not empty:
   a. Pop page from queue
   b. Render with Playwright
   c. Extract links/forms/endpoints
   d. Add new URLs to queue (if < max_pages)
   e. Store page metadata
4. Return crawl results
```

**Key Data Structures**:
```python
CrawlResult = {
    "pages": [
        {
            "url": "https://example.com/login",
            "title": "Login Page",
            "forms": [
                {
                    "id": "login-form",
                    "action": "/api/login",
                    "method": "POST",
                    "fields": [
                        {"name": "username", "type": "text"},
                        {"name": "password", "type": "password"}
                    ]
                }
            ]
        }
    ],
    "endpoints": ["/api/users", "/api/posts"],
    "total_pages_crawled": 12
}
```

**Rendering Strategy**: 
- Uses Playwright for JS rendering (SPA support)
- Fallback to BeautifulSoup for static content
- Extractable data: links, forms, JavaScript, API calls

---

### 4. **Authentication Module** (`auth.py`)

**Purpose**: Form-based login and session management

**Key Responsibilities**:
- Fill login forms with credentials
- Submit authentication
- Export cookies to requests.Session for subsequent requests
- Handle post-login redirects

**Key Methods**:
- `perform_login()` - Main login procedure
- `_fill_form()` - Form field population
- `_extract_session()` - Cookie extraction to requests.Session

**Authentication Flow**:
```
1. Navigate to target URL
2. Wait for form to load
3. Fill username/password fields
4. Click submit button
5. Wait for post-login page load
6. Extract cookies from browser
7. Create requests.Session with cookies
8. Return session for authenticated requests
```

**Session Persistence**:
```python
auth = Authentication(config)
session = auth.perform_login()  # requests.Session object

# Use for authenticated scanning
response = session.get("/api/admin", params={"id": 1})
```

**Key Challenge**: 
- 2FA/CAPTCHA bypass (manual intervention required)
- Dynamic form selectors (CSS selector configuration)

---

### 5. **Vulnerability Checker Module** (`checks.py`)

**Purpose**: Core vulnerability detection engine

**Key Responsibilities**:
- Run payload-based checks
- Monitor responses for vulnerability indicators
- Apply heuristic detection rules
- Return findings with severity/context

**Supported Vulnerabilities**:

| Check | Method | Indicator |
|-------|--------|-----------|
| **SQL Injection** | Error-based | SQL error in response |
| **XSS (Reflected)** | Encoding bypass | Payload reflected unescaped |
| **SSTI** | Expression injection | Template evaluation output |
| **CSTI** | DOM analytics | Script execution via DOM |
| **BOLA** | Sequential ID tampering | 200 response with unauthorized data |
| **Open Redirect** | URL location trace | Redirect to attacker domain |
| **Missing Headers** | Header inspection | Absence of security headers |
| **Insecure Cookies** | Flag analysis | Missing HttpOnly/Secure/SameSite |
| **CSRF** | Token analysis | Missing CSRF token in forms |

**Check Execution Pattern**:
```python
def check_vulnerability(self, url, parameters):
    findings = []
    for param in parameters:
        for payload in payloads:
            response = self.session.get(url, params={param: payload})
            if self._is_vulnerable(response, payload):
                findings.append({
                    "type": "Vulnerability",
                    "url": url,
                    "parameter": param,
                    "payload": payload,
                    "severity": self._calculate_severity()
                })
    return findings
```

**Key Classes**:
```python
class VulnerabilityChecker:
    def __init__(self, session, config):
        self.session = session
        self.config = config
    
    def check(self, pages):
        """Main entry point for all checks"""
        findings = []
        for page in pages:
            findings.extend(self.check_xss(page))
            findings.extend(self.check_sql_injection(page))
            # ... other checks
        return findings
```

---

### 6. **Reporter Module** (`reporter.py`)

**Purpose**: Multi-format report generation and severity classification

**Key Responsibilities**:
- Aggregate findings
- Classify by severity
- Generate JSON report
- Generate interactive HTML report
- Apply styling and formatting

**Key Methods**:
- `generate()` - Main report generation
- `_classify_severity()` - CVSS-based severity mapping
- `_generate_json()` - JSON output
- `_generate_html()` - HTML output with styling

**Severity Classification**:
```python
SEVERITY_MAPPING = {
    "sql_injection": "Critical",
    "xss": "High",
    "open_redirect": "Medium",
    "missing_headers": "Low"
}

SEVERITY_SCORES = {
    "Critical": 9.0,  # CVSS 9.0-10.0
    "High": 7.5,      # CVSS 7.0-8.9
    "Medium": 5.0,    # CVSS 4.0-6.9
    "Low": 2.0        # CVSS 0.1-3.9
}
```

**Report Structure**:
```json
{
  "target": "url",
  "scan_date": "ISO8601",
  "status": "completed",
  "summary": {
    "total_findings": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "findings": []
}
```

**HTML Report Features**:
- Color-coded severity badges
- Summary statistics
- Interactive filtering
- Print-friendly styling
- JavaScript interactivity (search, expand/collapse)

---

### 7. **OAST Module** (`oast.py`)

**Purpose**: Out-of-Band (Blind) Testing Framework

**Key Responsibilities**:
- Generate unique OOB payloads
- Manage callback domain
- Query for interactions
- Correlate callbacks to requests

**Supported Services**:
- Burp Collaborator
- Interactsh

**Key Methods**:
- `generate_payload()` - Create OOB callback payload
- `check_interactions()` - Poll for callbacks
- `_register_domain()` - Register callback domain

**Payload Generation**:
```python
oast = OASTClient(config)
payload = oast.generate_payload("sqli")
# Returns: "https://abc123.burpcollaborator.net/x"
```

**Usage in Checks**:
```python
# Blind SQL injection detection
payload = f"' OR SLEEP(10) AND CALLBACK({oast.generate_payload()})"
# Later: oast.check_interactions() returns callbacks from blind injection
```

---

## Data Flow

### End-to-End Data Flow

```
┌─────────────┐
│ YAML Config │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Runner          │ (Orchestration)
│  .run()          │
└──────┬───────────┘
       │
       ├──────────────────────────────┐
       │                              │
       ▼                              ▼
┌─────────────┐              ┌────────────────┐
│  Crawler    │              │  Auth Module   │
│  .crawl()   │              │  .login()      │
└──────┬──────┘              └────────┬───────┘
       │                              │
       ▼                              ▼
┌──────────────────────────────┐  ┌────────────────┐
│ CrawlResult                  │  │ requests.Session│
│  - pages[]                   │  │  + cookies     │
│  - forms[]                   │  │  + auth header │
│  - endpoints[]               │  └────────┬───────┘
└──────┬───────────────────────┘           │
       │                                   │
       L───────────────┬────────────────────┘
                       │
                       ▼
           ┌─────────────────────┐
           │ VulnerabilityChecker│
           │ .check(pages)       │
           └──────────┬──────────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │ Finding[]                │
        │  - type                  │
        │  - severity              │
        │  - url                   │
        │  - parameter             │
        │  - payload               │
        │  - evidence              │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │ Reporter                 │
        │ .generate(findings)      │
        └──────────┬───────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
scan_report.json          scan_report.html
```

### Configuration Propagation

```
config.yml
  ├─ target → Runner, Crawler
  ├─ auth → Auth module
  ├─ scanning.checks → VulnerabilityChecker
  ├─ report → Reporter
  └─ oast → OASTClient
```

---

## Design Patterns

### 1. **Strategy Pattern** (Vulnerability Checks)

Different vulnerability types implemented as separate methods:

```python
class VulnerabilityChecker:
    def check_sql_injection(self, url):
        # SQLi strategy
        pass
    
    def check_xss(self, url):
        # XSS strategy
        pass
```

### 2. **Factory Pattern** (Report Generation)

Factory creates appropriate reporter:

```python
class Reporter:
    @staticmethod
    def create(format):
        if format == "json":
            return JSONReporter()
        elif format == "html":
            return HTMLReporter()
```

### 3. **Observer Pattern** (Progress Tracking)

Scanner emits events for progress:

```python
class Runner:
    def __init__(self, config, observers=None):
        self.observers = observers or []
    
    def _notify(self, event):
        for observer in self.observers:
            observer.on_event(event)
```

### 4. **Builder Pattern** (Configuration)

Fluent configuration building:

```python
config = ConfigBuilder()
    .set_target("https://example.com")
    .set_auth(username="user", password="pass")
    .enable_xss_check()
    .disable_csrf_check()
    .build()
```

### 5. **Decorator Pattern** (Request Enhancement)

Enhance requests with authentication:

```python
def authenticated_request(func):
    def wrapper(self, url, **kwargs):
        if self.session:
            kwargs['cookies'] = self.session.cookies
        return func(self, url, **kwargs)
    return wrapper
```

---

## Scanning Pipeline

### Detailed Pipeline Execution

```
PHASE 1: INITIALIZATION
├─ Parse configuration
├─ Validate target URL
├─ Initialize logging
└─ Create session/browser

PHASE 2: RECONNAISSANCE (Crawler)
├─ Add target to queue
├─ For each page:
│  ├─ Navigate with Playwright
│  ├─ Wait for content load
│  ├─ Extract HTML
│  ├─ Parse links (BFS)
│  ├─ Extract forms
│  ├─ Discover API endpoints
│  └─ Add child URLs to queue
└─ Return: pages[], forms[], endpoints[]

PHASE 3: AUTHENTICATION (If enabled)
├─ Navigate to target
├─ Wait for form selector
├─ Fill username field
├─ Fill password field
├─ Submit form
├─ Wait for post-login page
├─ Extract cookies
└─ Return: requests.Session with auth cookies

PHASE 4: VULNERABILITY SCANNING
├─ For each page:
│  ├─ For each parameter:
│  │  ├─ Run SQLi check
│  │  ├─ Run XSS check
│  │  ├─ Run SSTI check
│  │  ├─ Run other checks
│  │  └─ Aggregate findings
│  └─ For each form:
│     ├─ Test CSRF protection
│     ├─ Test field validation
│     └─ Test privilege escalation
└─ Return: findings[]

PHASE 5: OUT-OF-BAND TESTING (If enabled)
├─ Generate OOB payloads
├─ Inject into blind parameters
├─ Poll callback server
├─ Correlate interactions
└─ Add OOB findings

PHASE 6: REPORTING
├─ Classify findings by severity
├─ Aggregate statistics
├─ Generate JSON report
├─ Generate HTML report
└─ Save to output directory

PHASE 7: CLEANUP
├─ Close browser
├─ Close requests session
├─ Clear temporary files
└─ Log completion
```

---

## Extension Points

### 1. **Adding Custom Vulnerability Checks**

```python
# Edit backend/scanner/checks.py

def check_custom_vulnerability(self, url, parameters):
    findings = []
    payload = "custom_test_payload"
    
    for param in parameters:
        response = self.session.get(url, params={param: payload})
        
        # Detection logic
        if "custom_indicator" in response.text:
            findings.append({
                "type": "Custom Vulnerability",
                "severity": "high",
                "url": url,
                "parameter": param,
                "evidence": "custom_indicator found in response"
            })
    
    return findings

# Call from main check() method
findings.extend(self.check_custom_vulnerability(url, params))
```

### 2. **Custom Report Formats**

```python
# Add to backend/scanner/reporter.py

def _generate_markdown(self):
    """Generate Markdown report"""
    md = "# Vulnerability Report\n\n"
    for finding in self.findings:
        md += f"## {finding['type']}\n"
        md += f"**Severity**: {finding['severity']}\n"
        md += f"**URL**: {finding['url']}\n\n"
    return md

# Call from generate()
if self.format == "markdown":
    return self._generate_markdown()
```

### 3. **Custom Payloads**

```python
# Dynamic payload configuration in config.yml
scanning:
  sql_injection:
    payloads:
      - "' OR '1'='1"
      - "' UNION SELECT NULL--"
  xss:
    payloads:
      - "<script>alert(1)</script>"
```

### 4. **Integrating External Tools**

```python
# Add OAST integration
class OASTIntegration:
    def register_with_burp(self):
        # API call to Burp Collaborator
        pass
    
    def check_callbacks(self):
        # Poll for blind test results
        pass
```

### 5. **Custom Authentication**

```python
# Multi-stage auth
class CustomAuth(Authentication):
    def perform_login(self):
        # Stage 1: Initial login
        # Stage 2: 2FA (manual or programmatic)
        # Stage 3: Return authenticated session
        pass
```

---

## Performance Considerations

### Optimization Strategies

1. **Parallel Requests**
   ```python
   max_concurrent: 5  # Concurrent requests per category
   ```

2. **Rate Limiting**
   ```python
   rate_limit: 5  # requests/second
   ```

3. **Page Caching**
   - Avoid re-crawling discovered pages
   - Cache form/endpoint data

4. **Payload Optimization**
   - Limit SQLi payloads (typical: 3-5)
   - Limit XSS payloads (typical: 2-3)

5. **Early Termination**
   - Stop on critical findings priority
   - Skip checks if no vulnerable parameters

### Resource Usage

- **Memory**: ~500MB for typical 50-page scan
- **CPU**: 1-2 cores (Playwright rendering)
- **Network**: Dependent on target responsiveness
- **Playwright Browsers**: 200-300MB footprint

---

## Security Considerations

### Safe Payload Handling

- Payloads do NOT execute malicious code
- Detection via pattern matching and response analysis
- No actual data exfiltration
- Reversible test payloads

### Data Protection

- Sessions stored in memory only
- No credentials logged
- Reports redacted of sensitive data
- HTTPS enforced for target communication

---

**Last Updated**: February 2026
