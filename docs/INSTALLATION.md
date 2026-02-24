# Installation Guide

Complete setup instructions for WebScanner across Windows, macOS, and Linux.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Step-by-Step Installation](#step-by-step-installation)
3. [Environment Configuration](#environment-configuration)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum
- **Python**: 3.9 or later
- **RAM**: 2GB (4GB recommended for concurrent scanning)
- **Disk**: 500MB free (includes Playwright browsers)
- **Network**: Internet connectivity for target scanning

### Supported Operating Systems
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu/Debian
- ✅ CentOS/RHEL

---

## Step-by-Step Installation

### 1. Python Setup

#### Windows
```powershell
# Verify Python installation
python --version  # Should be 3.9+

# Optionally create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### macOS/Linux
```bash
# Verify Python installation
python3 --version  # Should be 3.9+

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
```

### 2. Clone and Navigate to Backend

```bash
# Navigate to backend directory
cd cybercell/backend

# Option A: Using conda (RECOMMENDED for Windows with PyYAML)
conda create -n webscanner python=3.9
conda activate webscanner

# Option B: Using pip venv
python -m venv .venv
# Windows
.venv\Scripts\activate.ps1
# macOS/Linux
source .venv/bin/activate
```

### 3. Install Dependencies

#### Recommended (Windows Users - Conda)
```bash
# Install all packages via conda
conda install -c conda-forge -r requirements.txt

# Install Playwright browsers
python -m playwright install chromium firefox
```

#### Standard (All Platforms - Pip)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
python -m playwright install

# Optional: Install specific browsers only
python -m playwright install chromium
python -m playwright install firefox
python -m playwright install webkit
```

### 4. Verify Installation

```bash
# Test imports
python -c "import playwright, requests, bs4, yaml; print('✓ All imports successful')"

# Check installed packages
pip list | grep -E "playwright|requests|beautifulsoup|pyyaml|lxml"
```

---

## Environment Configuration

### Set PYTHONPATH for CLI Access

#### Windows (PowerShell)
```powershell
# Set for current session
$env:PYTHONPATH = "backend"

# Verify
echo $env:PYTHONPATH

# Run scanner
python -m scanner.cli --config examples/config.yml
```

#### Windows (Command Prompt)
```cmd
set PYTHONPATH=backend
python -m scanner.cli --config examples/config.yml
```

#### macOS/Linux (Bash)
```bash
# Set for current session
export PYTHONPATH=backend

# Permanent setup (add to ~/.bashrc or ~/.zshrc)
echo 'export PYTHONPATH=backend' >> ~/.bashrc
source ~/.bashrc
```

### Create Configuration File

Copy and customize the example configuration:

```bash
cp examples/config.yml my-scan.yml
```

Edit `my-scan.yml`:
```yaml
target: https://your-target.com
max_pages: 50
auth:
  enabled: false
  # Optional authentication config
report:
  format: both  # "json", "html", or "both"
  output_dir: ../frontend/reports
```

---

## Verification

### Quick Test

```bash
# Run basic import test
cd backend
pytest tests/test_basic.py -v
```

Expected output:
```
test_basic.py::test_imports PASSED [100%]
========================== 1 passed in 1.24s ==========================
```

### Demo Scan

```bash
# Run demo against example.com
python -m scanner.cli --config examples/config.yml

# Check report
cat scan_report.json | head -20
```

Expected output should show:
```json
{
  "target": "https://example.com",
  "status": "completed",
  "findings": [...]
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. **PyYAML Build Error on Windows**

**Error**: `AttributeError: 'build_ext' object has no attribute 'cython_sources'`

**Root Cause**: YAML source compilation fails on Windows

**Solution** (Recommended):
```bash
# Uninstall pip version
pip uninstall pyyaml

# Install conda pre-built binary
conda install pyyaml
```

**Alternative Solution**:
```bash
# Download binary wheel
pip install https://files.pythonhosted.org/packages/...pyyaml-6.0-cp39-cp39-win_amd64.whl
```

---

#### 2. **ModuleNotFoundError: No module named 'playwright'**

**Error**: `ModuleNotFoundError: No module named 'playwright'`

**Cause**: Playwright not installed or wrong environment activated

**Solution**:
```bash
# Verify environment
which python  # macOS/Linux
where python  # Windows

# Reinstall in active environment
pip install playwright

# Verify installation
python -c "import playwright; print(playwright.__version__)"
```

---

#### 3. **Playwright Browsers Not Found**

**Error**: `Error: Chromium executable not found`

**Cause**: Browser binaries not installed

**Solution**:
```bash
# Install all browsers
python -m playwright install

# Or specific browser
python -m playwright install chromium

# Verify installation
python -m playwright install-deps  # Install system dependencies (Linux)
```

---

#### 4. **PYTHONPATH Module Not Found**

**Error**: `ModuleNotFoundError: No module named 'scanner'`

**Cause**: PYTHONPATH not set or incorrect working directory

**Solution** (Windows PowerShell):
```powershell
# Verify PYTHONPATH
Write-Host $env:PYTHONPATH

# Set if empty
$env:PYTHONPATH = "backend"

# Test
python -c "from scanner import cli; print('OK')"
```

**Solution** (macOS/Linux):
```bash
# Verify PYTHONPATH
echo $PYTHONPATH

# Set if empty
export PYTHONPATH=backend

# Test
python -c "from scanner import cli; print('OK')"
```

---

#### 5. **BeautifulSoup4 Parser Warning**

**Warning**: `No parser was explicitly specified, so I'm using the best-available HTML parser`

**Cause**: Optional lxml not installed

**Solution**:
```bash
pip install lxml

# Verify
python -c "from bs4 import BeautifulSoup; print(BeautifulSoup('<html></html>', 'lxml'))"
```

---

#### 6. **Connection Timeout to Target**

**Error**: `requests.exceptions.ConnectionError: Failed to establish connection`

**Causes**: 
- Target unreachable
- Firewall/proxy blocking
- Target requires specific headers

**Solutions**:
```bash
# Test connectivity
ping your-target.com

# Test with curl
curl -I https://your-target.com

# Increase timeout in config
# Edit examples/config.yml:
# timeout: 30  # seconds
```

---

#### 7. **Permission Denied: reports folder**

**Error**: `PermissionError: [Errno 13] Permission denied: '../frontend/reports/scan_report.html'`

**Solution**:
```bash
# Create reports folder if missing
mkdir -p ../frontend/reports

# Or change output in config.yml
# report:
#   output_dir: ./reports
```

---

### Advanced Configuration

#### Behind Corporate Proxy

```yaml
# Add to config.yml
proxy:
  enabled: true
  url: http://proxy.company.com:8080
  username: user
  password: pass
```

#### Custom Headers

```yaml
headers:
  User-Agent: "Mozilla/5.0 (Custom Scanner)"
  Authorization: "Bearer token123"
  X-Custom-Header: "value"
```

#### Rate Limiting

```yaml
rate_limit:
  requests_per_second: 5
  max_concurrent: 2
```

---

### Getting Help

If issues persist:

1. **Check Python Environment**:
   ```bash
   python -m pip list
   python -m site
   ```

2. **Enable Verbose Logging**:
   ```bash
   python -m scanner.cli --config examples/config.yml --verbose
   ```

3. **Review System Info**:
   ```bash
   python -m platform
   python --version
   ```

4. **Check Dependencies**:
   ```bash
   pip install --upgrade -r requirements.txt
   python -m playwright install --with-deps
   ```

---

## Next Steps

After successful installation:

1. **Read [USAGE.md](USAGE.md)** for scanning examples
2. **Review [CONFIG_REFERENCE.md](#)** for full configuration options
3. **Run demo scan** against example.com
4. **Customize config.yml** for your target
5. **Integrate with CI/CD** pipelines

---

**Last Updated**: February 2026
