# Technical Architecture Document

**NexusDAST - Advanced Web Application Vulnerability Scanner**

**Version**: 1.0  
**Date**: May 11, 2026  
**Audience**: Developers, architects, security researchers  

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                         │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   CLI Tool   │  │ Python API   │  │ Configuration (YAML)     │  │
│  │  (scanner    │  │ (programmatic│  │ ├─ Target URL           │  │
│  │   .cli)      │  │  scanning)   │  │ ├─ Authentication       │  │
│  └──────┬───────┘  └──────┬───────┘  │ ├─ Vulnerability Checks │  │
│         │                 │          │ └─ Report Format        │  │
│         └─────────────────┼──────────┴──────────────────────────┘  │
│                           │                                         │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  ORCHESTRATION │
                    │  (Runner.py)   │
                    │                │
                    │ Coordinates:   │
                    │ - Crawler      │
                    │ - Auth         │
                    │ - Checks       │
                    │ - Reporter     │
                    └─────┬──────┬───┴─────┬───────┬─────────┐
                          │      │         │       │         │
        ┌─────────────────┘      │         │       │         │
        │                        │         │       │         │
┌───────▼──────────────┐  ┌──────▼──┐  ┌──▼──┐  ┌─▼──┐  ┌──▼───┐
│   CRAWLER ENGINE     │  │  AUTH   │  │CHECKS    OAST  │ REPORT│
│                      │  │ MODULE  │  │MODULE   │      │MODULE │
│ ├─ Playwright        │  │         │  │         └──────┘       │
│ │ ├─ Chromium        │  │ - Form  │  │ ├─ SQLi              │
│ │ ├─ Firefox         │  │ - Login │  │ ├─ XSS               │
│ │ └─ WebKit          │  │ - Cookies   │ ├─ SSTI          │
│ ├─ BeautifulSoup     │  │ - Tokens    │ ├─ CSTI          │
│ ├─ Form Discovery    │  │         │  │ ├─ BOLA              │
│ ├─ Link Extraction   │  │ Returns │  │ ├─ Open Redirect │
│ ├─ Endpoint Discovery│  │ Session │  │ ├─ Headers          │
│ └─ JS Rendering      │  │         │  │ ├─ Cookies          │
│                      │  └─────────┘  │ ├─ CSRF              │
│ Returns:            │               │ └─ ...              │
│ - Pages[]           │               │                     │
│ - Forms[]           │               │ Returns:            │
│ - Endpoints[]       │               │ - Findings[]        │
└──────────────────────┘               └──────────────────────┘
        │                                     │
        │              ┌──────────────────────┤
        │              │                      │
        └──────────────┼──────────────────────┘
                       │
                ┌──────▼──────────┐
                │  REPORTER       │
                │  (reporter.py)  │
                │                 │
                │ - Severity      │
                │   Classification│
                │ - JSON Export   │
                │ - HTML Export   │
                │ - Dashboard     │
                └──────┬──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼───────┐  ┌───▼────────┐  ┌─▼──────────┐
│ scan_report   │  │scan_report  │  │ Dashboard  │
│   .json       │  │   .html     │  │ (web UI)   │
│               │  │             │  │            │
│ Structured    │  │ Interactive │  │ Historical │
│ findings      │  │ visualization│  │ trends    │
└───────────────┘  └─────────────┘  └────────────┘
```

---

## 2. Layered Architecture

### 2.1 Presentation Layer
- **CLI**: Command-line interface for standalone execution
- **API**: Python programmatic interface for integration
- **Reports**: HTML/JSON output for consumption by external tools
- **Dashboard**: Web-based interface for multi-scan visualization

### 2.2 Application Layer (Business Logic)
- **Runner**: Orchestrates scanning pipeline
- **Crawler**: Web crawling with form/endpoint discovery
- **Checker**: Vulnerability detection engine
- **Reporter**: Report generation and formatting

### 2.3 Domain Layer (Data Models)
- **CrawlResult**: Pages, forms, endpoints discovered
- **Finding**: Identified vulnerability with evidence
- **AuthSession**: Authenticated HTTP session
- **ScanReport**: Aggregated findings with metadata

### 2.4 Infrastructure Layer
- **Playwright**: Browser automation and JS rendering
- **requests**: HTTP client for testing
- **BeautifulSoup**: HTML parsing
- **YAML**: Configuration management

---

## 3. Core Modules

### 3.1 CLI Module (`cli.py`)

**Purpose**: Entry point and configuration parsing

**Responsibilities**:
- Parse command-line arguments
- Load and validate YAML configuration
- Initialize logging
- Invoke Runner with config

**Interface**:
```python
def main():
    """Entry point for CLI tool"""
    args = parse_arguments()
    config = load_config(args.config)
    runner = Runner(config)
    results = runner.run()
    return results
```

**Configuration Schema**:
```yaml
target: string (required)
max_pages: int (default: 50)
timeout: int (seconds, default: 30)
auth:
  enabled: bool
  username: string
  password: string
  form_selector: string
scanning:
  rate_limit: int (req/sec)
  max_concurrent: int
  checks: dict[str, bool]
report:
  format: string (json|html|both)
  output_dir: string
```

**Error Handling**:
- Invalid YAML syntax → Raise ConfigError
- Missing required fields → Raise ValidationError
- File not found → Raise FileNotFoundError

---

### 3.2 Runner Module (`runner.py`)

**Purpose**: Orchestrate entire scanning pipeline

**Responsibilities**:
- Manage component lifecycle
- Coordinate data flow between modules
- Handle error recovery
- Generate final results

**Execution Pipeline**:
```python
def run(self):
    """Main scanning orchestration"""
    # Phase 1: Initialize
    self._setup()
    
    # Phase 2: Crawl
    crawl_result = self.crawler.crawl(self.config['target'])
    
    # Phase 3: Authenticate (if enabled)
    if self.config.get('auth', {}).get('enabled'):
        session = self.auth.perform_login()
    else:
        session = requests.Session()
    
    # Phase 4: Check vulnerabilities
    findings = self.checker.check(crawl_result, session)
    
    # Phase 5: Report
    report = self.reporter.generate(findings)
    
    # Phase 6: Cleanup
    self._cleanup()
    
    return report
```

**State Management**:
```python
class Runner:
    _state = {
        'initialized': False,
        'crawled': False,
        'authenticated': False,
        'checked': False,
        'reported': False
    }
```

---

### 3.3 Crawler Module (`crawler.py`)

**Purpose**: Web crawling with JavaScript rendering

**Architecture**:
```
Input: target URL
  ↓
[Browser Initialization]
  ├─ Launch Playwright browser (Chromium/Firefox/WebKit)
  └─ Initialize page pool
  ↓
[Crawling Loop] (BFS)
  ├─ Get page from queue
  ├─ Navigate to URL
  ├─ Wait for rendering (JS execution)
  ├─ Extract links
  ├─ Extract forms
  ├─ Extract API endpoints
  ├─ Add new URLs to queue
  └─ Repeat until queue empty or max_pages reached
  ↓
Output: CrawlResult
  ├─ pages[]
  ├─ forms[]
  └─ endpoints[]
```

**Key Algorithms**:

**1. Breadth-First Search (BFS) Crawling**:
```python
def crawl(self, target_url):
    visited = set()
    queue = [target_url]
    
    while queue and len(visited) < self.max_pages:
        url = queue.pop(0)
        if url in visited:
            continue
            
        page_data = self._fetch_page(url)
        visited.add(url)
        
        # Extract links
        for link in self._extract_links(page_data):
            if link not in visited and self._is_same_domain(link):
                queue.append(link)
        
        # Extract forms
        forms = self._extract_forms(page_data)
        
        # Store page data
        self.pages.append({
            'url': url,
            'forms': forms,
            'title': self._get_title(page_data)
        })
    
    return CrawlResult(pages=self.pages)
```

**2. Form Field Extraction**:
```python
def _extract_forms(self, html):
    """Extract form structure for testing"""
    soup = BeautifulSoup(html, 'lxml')
    forms = []
    
    for form in soup.find_all('form'):
        fields = []
        for input_field in form.find_all(['input', 'textarea', 'select']):
            fields.append({
                'name': input_field.get('name'),
                'type': input_field.get('type', 'text'),
                'value': input_field.get('value', '')
            })
        
        forms.append({
            'action': form.get('action'),
            'method': form.get('method', 'GET').upper(),
            'fields': fields
        })
    
    return forms
```

**3. API Endpoint Discovery (Regex)**:
```python
def _discover_endpoints(self, html):
    """Regex-based API endpoint discovery"""
    patterns = [
        r'/api/v\d+/\w+',
        r'/rest/\w+',
        r'/graphql',
        r'/api/\w+/\d+',
    ]
    
    endpoints = set()
    for pattern in patterns:
        matches = re.findall(pattern, html)
        endpoints.update(matches)
    
    return list(endpoints)
```

**Data Structure**:
```python
@dataclass
class CrawlResult:
    pages: List[Page]
    forms: List[Form]
    endpoints: List[str]
    total_crawled: int
    
@dataclass
class Page:
    url: str
    title: str
    forms: List[Form]
    links: List[str]
    
@dataclass
class Form:
    action: str
    method: str
    fields: List[FormField]
    
@dataclass
class FormField:
    name: str
    type: str
    value: str
```

---

### 3.4 Authentication Module (`auth.py`)

**Purpose**: Form-based login and session management

**Process**:
```
Input: Credentials + Form Selectors
  ↓
[Browser Navigation]
  └─ Navigate to target URL
  ↓
[Form Filling]
  ├─ Wait for form selector
  ├─ Fill username field
  ├─ Fill password field
  └─ Click submit button
  ↓
[Post-Login Handling]
  ├─ Wait for page load
  ├─ Check for success indicators
  └─ Wait for redirect
  ↓
[Session Export]
  ├─ Extract cookies from browser
  ├─ Create requests.Session
  ├─ Add cookies to session
  └─ Add auth headers if needed
  ↓
Output: requests.Session
  └─ Ready for authenticated requests
```

**Session Export Logic**:
```python
def perform_login(self):
    """Perform form-based login and export session"""
    # Navigate to target
    page = self.browser.goto(self.target)
    
    # Wait for form
    page.wait_for_selector(self.form_selector)
    
    # Fill form fields
    page.fill(self.username_selector, self.username)
    page.fill(self.password_selector, self.password)
    page.click(self.submit_selector)
    
    # Wait for post-login page
    page.wait_for_navigation()
    
    # Extract cookies
    cookies = page.context.cookies()
    
    # Create authenticated session
    session = requests.Session()
    for cookie in cookies:
        session.cookies.set(
            cookie['name'],
            cookie['value'],
            domain=cookie.get('domain'),
            path=cookie.get('path')
        )
    
    return session
```

**Error Handling**:
- Form not found → Raise FormNotFoundError
- Login timeout → Raise LoginTimeoutError
- Login failure detected → Raise LoginFailedError

---

### 3.5 Vulnerability Checker Module (`checks.py`)

**Purpose**: Payload-based vulnerability detection

**Architecture**:
```python
class VulnerabilityChecker:
    def check(self, crawl_result, session):
        """Main checking orchestration"""
        findings = []
        
        for page in crawl_result.pages:
            # Extract injectable parameters
            params = self._extract_parameters(page)
            
            # Run checks
            findings.extend(self.check_sql_injection(page.url, params, session))
            findings.extend(self.check_xss(page.url, params, session))
            findings.extend(self.check_ssti(page.url, params, session))
            # ... other checks
        
        # Check non-parameter vulnerabilities
        findings.extend(self.check_headers(crawl_result))
        findings.extend(self.check_cookies(crawl_result))
        findings.extend(self.check_csrf(crawl_result))
        
        return findings
```

**Check Pattern Template**:
```python
def check_vulnerability_type(self, url, parameters, session):
    """Generic vulnerability check pattern"""
    findings = []
    payloads = self.payloads['vulnerability_type']
    
    for param in parameters:
        for payload in payloads:
            # Create test request
            test_url = f"{url}?{param}={payload}"
            
            try:
                response = session.get(test_url, timeout=10)
                
                # Analyze response
                if self._is_vulnerable(response, payload):
                    findings.append(Finding(
                        type='Vulnerability Type',
                        severity=self._calculate_severity(),
                        url=url,
                        parameter=param,
                        payload=payload,
                        evidence=self._extract_evidence(response)
                    ))
            except Exception as e:
                logger.debug(f"Check failed: {e}")
    
    return findings
```

**Vulnerability Detections**:

| Check | Payload | Indicator | Evidence |
|-------|---------|-----------|----------|
| SQLi | `' OR '1'='1` | SQL error | Error message text |
| XSS | `<script>alert(1)` | Reflection | Payload in response |
| SSTI | `{{7*7}}` | Evaluation | `49` in response |
| BOLA | ID+1 | Unauthorized data | 200 response, different data |
| Open Redirect | `https://attacker.com` | Redirect header | Location header value |
| Missing Headers | N/A | Absence | Missing header in response |

---

### 3.6 Reporter Module (`reporter.py`)

**Purpose**: Report generation and severity classification

**Report Pipeline**:
```
Input: Findings[]
  ↓
[Severity Classification]
  ├─ Map finding type to CVSS score
  └─ Classify as Critical/High/Medium/Low
  ↓
[Aggregation]
  ├─ Group by severity
  ├─ Count findings
  └─ Calculate statistics
  ↓
[JSON Generation]
  └─ Serialize findings to JSON
  ↓
[HTML Generation]
  ├─ Create HTML template
  ├─ Inject CSS styling
  ├─ Embed JavaScript interactivity
  └─ Format findings with color-coding
  ↓
Output: scan_report.json + scan_report.html
```

**Severity Mapping**:
```python
SEVERITY_MAP = {
    'sql_injection': 'Critical',      # CVSS 9.0+
    'reflected_xss': 'High',          # CVSS 7.0-8.9
    'ssti': 'High',
    'csti': 'High',
    'bola': 'High',
    'open_redirect': 'Medium',        # CVSS 4.0-6.9
    'missing_headers': 'Medium',
    'insecure_cookies': 'Low',        # CVSS 0.1-3.9
    'csrf': 'Medium'
}

CVSS_SCORES = {
    'Critical': 9.0,
    'High': 7.5,
    'Medium': 5.0,
    'Low': 2.0
}
```

**JSON Output Schema**:
```json
{
  "metadata": {
    "target": "url",
    "scan_date": "ISO8601",
    "scan_duration": "seconds",
    "scanner_version": "1.0.0"
  },
  "summary": {
    "total_findings": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "findings": [
    {
      "id": "finding_001",
      "type": "Vulnerability Type",
      "severity": "High",
      "url": "affected_url",
      "parameter": "param_name",
      "payload": "test_payload",
      "evidence": "response_snippet",
      "remediation": "recommended_fix",
      "references": ["https://..."]
    }
  ]
}
```

---

### 3.7 OAST Module (`oast.py`)

**Purpose**: Out-of-Band testing framework

**Process**:
```
Input: Target + Payload Type
  ↓
[Payload Generation]
  ├─ Generate unique callback domain
  ├─ Create OOB payload with ID
  └─ Return callback URL
  ↓
[Injection]
  ├─ Inject payload into parameter
  └─ Send request to target
  ↓
[Polling]
  ├─ Wait for callback
  ├─ Query callback server
  └─ Collect interactions
  ↓
Output: OOB Findings
```

**Supported Services**:
- Burp Collaborator
- Interactsh
- Custom callback server

---

## 4. Data Flow Architecture

### 4.1 End-to-End Data Flow

```
User Input (CLI/API)
    ↓
Config Validation
    ↓
Runner Initialization
    ├─ Create Crawler
    ├─ Create Auth
    ├─ Create Checker
    └─ Create Reporter
    ↓
Crawling Phase
    ├─ Browser Launch
    ├─ Page Fetching
    ├─ Form Extraction
    └─ Endpoint Discovery
    ↓
CrawlResult {pages, forms, endpoints}
    ↓
Authentication Phase (if enabled)
    ├─ Form Filling
    ├─ Login Submission
    └─ Session Extraction
    ↓
Authenticated Session (requests.Session)
    ↓
Vulnerability Checking Phase
    ├─ Extract parameters
    ├─ Inject payloads
    ├─ Analyze responses
    └─ Generate findings
    ↓
Findings[] {type, severity, url, evidence}
    ↓
Reporting Phase
    ├─ Classify severity
    ├─ Generate JSON
    ├─ Generate HTML
    └─ Create Dashboard
    ↓
Reports {JSON, HTML, Dashboard}
    ↓
Output Files
    ├─ scan_report.json
    ├─ scan_report.html
    └─ dashboard.html
```

### 4.2 Request Flow in Vulnerability Checking

```
Parameter Extraction
    ↓
For each Parameter:
    ├─ For each Payload:
    │   ├─ Construct Request
    │   ├─ Send Request (with timeout)
    │   ├─ Receive Response
    │   ├─ Analyze Response
    │   │   ├─ Check status code
    │   │   ├─ Check headers
    │   │   ├─ Check body content
    │   │   └─ Check response time
    │   ├─ Calculate confidence
    │   └─ Create Finding (if vulnerable)
    └─ Return findings for parameter
```

---

## 5. Design Patterns

### 5.1 Strategy Pattern (Vulnerability Checks)

Different vulnerability detection strategies:

```python
class VulnerabilityChecker:
    def check_sql_injection(self): pass      # SQLi strategy
    def check_xss(self): pass                # XSS strategy
    def check_ssti(self): pass               # SSTI strategy
    # ... other strategies
```

### 5.2 Template Method Pattern (Check Execution)

Common check pattern with customizable steps:

```python
def _generic_check(self, url, param, payloads, analyzer):
    for payload in payloads:
        response = self.session.get(url, params={param: payload})
        if analyzer(response, payload):
            return Finding(...)
```

### 5.3 Factory Pattern (Report Generation)

Create appropriate reporter based on format:

```python
class ReporterFactory:
    @staticmethod
    def create(format):
        if format == 'json':
            return JSONReporter()
        elif format == 'html':
            return HTMLReporter()
        elif format == 'both':
            return CompositeReporter()
```

### 5.4 Observer Pattern (Progress Tracking)

Emit events during scanning:

```python
class Runner:
    def __init__(self, config, observers=None):
        self.observers = observers or []
    
    def _notify(self, event, data):
        for observer in self.observers:
            observer.on_event(event, data)
```

---

## 6. Error Handling & Recovery

### 6.1 Error Hierarchy

```
ScannerException
├─ ConfigError
│  ├─ InvalidYAML
│  ├─ MissingRequired
│  └─ ValidationError
├─ CrawlerError
│  ├─ NetworkError
│  ├─ BrowserError
│  └─ TimeoutError
├─ AuthError
│  ├─ FormNotFoundError
│  ├─ LoginFailedError
│  └─ SessionExportError
└─ CheckerError
   ├─ PayloadError
   └─ AnalysisError
```

### 6.2 Resilience Strategies

| Scenario | Strategy |
|----------|----------|
| Network timeout | Retry with exponential backoff |
| Browser crash | Restart Playwright and resume |
| Invalid response | Skip and continue to next payload |
| Form not found | Log warning and skip authentication |
| Check timeout | Mark as incomplete, continue scanning |

---

## 7. Performance Characteristics

### 7.1 Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Crawling | O(n*d) | n=pages, d=avg links per page |
| Checking | O(n*p*c) | n=parameters, p=payloads, c=avg concurrent |
| Reporting | O(f) | f=findings |
| Overall | O(n*p*c) | Checking dominates |

### 7.2 Space Complexity

```
Memory Usage:
├─ Browser instances: 200-300MB each
├─ Page cache: 50MB per 100 pages
├─ Findings: ~1KB per finding
└─ Session data: ~10KB

Total: ~500MB-1GB for typical scans
```

### 7.3 Optimization Techniques

1. **Request Pooling**: Limit concurrent requests
2. **Payload Pruning**: Skip redundant payloads
3. **Page Caching**: Avoid re-fetching
4. **Early Termination**: Stop on definitive indicators
5. **Parallel Processing**: Multi-threaded checking

---

## 8. Security Considerations

### 8.1 Payload Safety
- ✅ No arbitrary code execution
- ✅ Payloads analyzed via pattern matching only
- ✅ No data exfiltration from target
- ✅ Reversible test operations

### 8.2 Credential Protection
- ✅ Credentials not logged to files
- ✅ Sessions ephemeral (memory only)
- ✅ No credentials in report outputs
- ✅ HTTPS-only for authenticated requests

### 8.3 Target Protection
- ✅ Rate limiting to avoid DoS
- ✅ Configurable timeout to prevent hangs
- ✅ Graceful failure on errors
- ✅ No brute-force attacks

---

## 9. Deployment Architecture

### 9.1 Standalone Deployment
```
┌─────────────────────┐
│   NexusDAST CLI     │
│  (Standalone)       │
├─────────────────────┤
│ Single machine      │
│ Local execution     │
│ No server required  │
└─────────────────────┘
```

### 9.2 CI/CD Pipeline Integration
```
Git Commit
    ↓
CI/CD Trigger
    ↓
Build Container
    ↓
Run NexusDAST
    ├─ python -m scanner.cli
    └─ Generate reports
    ↓
Analyze Results
    ├─ Check severity thresholds
    ├─ Generate alerts
    └─ Archive artifacts
    ↓
Decision
    ├─ Pass: Continue pipeline
    └─ Fail: Block deployment
```

### 9.3 Container Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . .

RUN pip install -r requirements.txt
RUN python -m playwright install

ENTRYPOINT ["python", "-m", "scanner.cli"]
```

---

## 10. Extensibility & Plugin Architecture

### 10.1 Custom Vulnerability Checks

```python
# User defines custom check
class CustomChecker(VulnerabilityChecker):
    def check_custom_vulnerability(self, url, params, session):
        # Custom implementation
        pass

# Register in runner
runner.register_check(CustomChecker())
```

### 10.2 Custom Report Formats

```python
# User defines custom reporter
class PDFReporter(Reporter):
    def generate(self, findings):
        # Generate PDF
        pass

# Configure in YAML
report:
  format: pdf
  generator: custom.PDFReporter
```

### 10.3 Custom Payloads

```yaml
# User-defined payloads in config
scanning:
  sql_injection:
    payloads:
      - "custom_payload_1"
      - "custom_payload_2"
```

---

## 11. Monitoring & Observability

### 11.1 Logging Strategy

```python
logger.debug("Starting crawl phase")
logger.info(f"Discovered {page_count} pages")
logger.warning(f"Timeout on {url}")
logger.error(f"Failed to extract session: {error}")
```

### 11.2 Metrics Tracking

| Metric | Purpose |
|--------|---------|
| Scan duration | Performance monitoring |
| Pages crawled | Attack surface size |
| Findings by severity | Risk assessment |
| Check coverage | Quality assurance |
| False positive rate | Tuning payloads |

### 11.3 Event Logging

```
SCAN_STARTED
  ├─ CRAWL_STARTED
  ├─ PAGE_DISCOVERED (repeated)
  ├─ CRAWL_COMPLETED
  ├─ AUTH_STARTED (if enabled)
  ├─ AUTH_COMPLETED
  ├─ CHECK_STARTED
  ├─ FINDING_DISCOVERED (repeated)
  ├─ CHECK_COMPLETED
  ├─ REPORT_GENERATED
  └─ SCAN_COMPLETED
```

---

## 12. Appendix: API Reference

### 12.1 Runner API

```python
class Runner:
    def __init__(self, config: Dict): ...
    def run(self) -> ScanReport: ...
    def register_check(self, check: VulnerabilityChecker): ...
    def register_observer(self, observer: Observer): ...
```

### 12.2 Crawler API

```python
class Crawler:
    def crawl(self, target_url: str) -> CrawlResult: ...
    def set_max_pages(self, max_pages: int): ...
    def set_timeout(self, timeout: int): ...
```

### 12.3 Checker API

```python
class VulnerabilityChecker:
    def check(self, crawl_result: CrawlResult, session: Session) -> List[Finding]: ...
    def register_payload_set(self, vuln_type: str, payloads: List[str]): ...
```

---

**Document Owner**: NexusDAST Architecture Team  
**Last Updated**: May 11, 2026  
**Status**: Approved ✅
