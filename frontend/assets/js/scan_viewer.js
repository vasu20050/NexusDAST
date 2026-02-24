// WebScanner Report Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    initializeReportFeatures();
});

function initializeReportFeatures() {
    // Add expand/collapse functionality
    addFindingToggle();
    
    // Add filter functionality
    addSeverityFilter();
    
    // Add search functionality
    addSearchFeature();
    
    // Add copy-to-clipboard for URLs
    addCopyFeature();
    
    // Add print styling
    addPrintFeatures();
}

// Toggle finding details
function addFindingToggle() {
    const findings = document.querySelectorAll('.finding');
    
    findings.forEach(finding => {
        const header = finding.querySelector('.finding-header');
        const details = finding.querySelector('.finding-details');
        
        if (header && details) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function(e) {
                if (e.target.classList.contains('finding-badge')) return;
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
                header.style.opacity = details.style.display === 'none' ? 0.7 : 1;
            });
        }
    });
}

// Filter findings by severity
function addSeverityFilter() {
    const container = document.querySelector('header');
    if (!container) return;
    
    const filterDiv = document.createElement('div');
    filterDiv.className = 'filter-controls';
    filterDiv.style.cssText = 'margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;';
    
    const severities = ['critical', 'high', 'medium', 'low', 'all'];
    
    severities.forEach(severity => {
        const btn = document.createElement('button');
        btn.textContent = severity.charAt(0).toUpperCase() + severity.slice(1);
        btn.className = 'filter-btn';
        btn.dataset.severity = severity;
        btn.style.cssText = 'padding: 8px 16px; border: 2px solid rgba(255,255,255,0.3); ' +
                          'background: rgba(255,255,255,0.1); color: white; border-radius: 20px; ' +
                          'cursor: pointer; transition: all 0.3s;';
        
        btn.addEventListener('mouseover', function() {
            this.style.background = 'rgba(255,255,255,0.2)';
        });
        
        btn.addEventListener('mouseout', function() {
            this.style.background = 'rgba(255,255,255,0.1)';
        });
        
        btn.addEventListener('click', function() {
            filterBySeverity(severity);
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.style.opacity = '0.5';
            });
            this.style.opacity = '1';
        });
        
        filterDiv.appendChild(btn);
        if (severity === 'all') btn.style.opacity = '1';
        else btn.style.opacity = '0.5';
    });
    
    container.appendChild(filterDiv);
}

function filterBySeverity(severity) {
    const sections = document.querySelectorAll('.severity-section');
    
    if (severity === 'all') {
        sections.forEach(section => section.style.display = 'block');
    } else {
        sections.forEach(section => {
            section.style.display = section.classList.contains(severity) ? 'block' : 'none';
        });
    }
}

// Search findings
function addSearchFeature() {
    const container = document.querySelector('header');
    if (!container) return;
    
    const searchDiv = document.createElement('div');
    searchDiv.style.cssText = 'margin-top: 10px;';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search findings...';
    searchInput.className = 'search-input';
    searchInput.style.cssText = 'padding: 10px 15px; width: 300px; border: none; border-radius: 5px; max-width: 90%;';
    
    searchInput.addEventListener('input', function(e) {
        searchFindings(e.target.value);
    });
    
    searchDiv.appendChild(searchInput);
    container.appendChild(searchDiv);
}

function searchFindings(query) {
    const findings = document.querySelectorAll('.finding');
    const lowerQuery = query.toLowerCase();
    
    findings.forEach(finding => {
        const text = finding.textContent.toLowerCase();
        finding.style.display = text.includes(lowerQuery) ? 'block' : 'none';
    });
}

// Copy URL to clipboard
function addCopyFeature() {
    const urls = document.querySelectorAll('.finding-url');
    
    urls.forEach(url => {
        url.style.cursor = 'pointer';
        url.addEventListener('click', function(e) {
            e.preventDefault();
            copyToClipboard(this.textContent);
            showNotification('URL copied to clipboard!');
        });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; ' +
                                'color: white; padding: 15px 20px; border-radius: 5px; ' +
                                'box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1000; font-weight: 600;';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Print and export features
function addPrintFeatures() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const controls = document.createElement('div');
    controls.style.cssText = 'margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;';
    
    // Print button
    const printBtn = document.createElement('button');
    printBtn.textContent = '🖨️ Print Report';
    printBtn.style.cssText = baseButtonStyle + 'background: rgba(255,255,255,0.2);';
    printBtn.addEventListener('click', function() {
        window.print();
    });
    controls.appendChild(printBtn);
    
    // Export JSON button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '💾 Export JSON';
    exportBtn.style.cssText = baseButtonStyle + 'background: rgba(255,255,255,0.2);';
    exportBtn.addEventListener('click', function() {
        exportAsJSON();
    });
    controls.appendChild(exportBtn);
    
    header.appendChild(controls);
}

const baseButtonStyle = 'padding: 10px 20px; border: 2px solid rgba(255,255,255,0.4); ' +
                       'color: white; border-radius: 5px; cursor: pointer; transition: all 0.3s; ' +
                       'font-weight: 600;';

function exportAsJSON() {
    const findings = [];
    const sections = document.querySelectorAll('.severity-section');
    
    sections.forEach(section => {
        section.querySelectorAll('.finding').forEach(finding => {
            const severity = Array.from(finding.classList).find(c => 
                ['critical', 'high', 'medium', 'low'].includes(c)
            );
            
            const url = finding.querySelector('.finding-url')?.textContent || '';
            const type = finding.querySelector('.finding-type')?.textContent || '';
            
            findings.push({
                severity: severity,
                type: type,
                url: url,
                timestamp: new Date().toISOString()
            });
        });
    });
    
    const dataStr = JSON.stringify({ findings: findings, exportedAt: new Date().toISOString() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'scan_report_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Report exported as JSON!');
}

// Statistics calculation
function calculateStatistics() {
    const findings = document.querySelectorAll('.finding');
    const stats = {
        total: findings.length,
        critical: document.querySelectorAll('.finding.critical').length,
        high: document.querySelectorAll('.finding.high').length,
        medium: document.querySelectorAll('.finding.medium').length,
        low: document.querySelectorAll('.finding.low').length
    };
    
    return stats;
}

// Dark mode toggle
function addDarkModeToggle() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const btn = document.createElement('button');
    btn.textContent = '🌙 Dark Mode';
    btn.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 10px 15px; ' +
                       'background: #667eea; color: white; border: none; border-radius: 5px; ' +
                       'cursor: pointer; font-weight: 600; z-index: 999;';
    
    btn.addEventListener('click', function() {
        document.body.style.filter = document.body.style.filter === 'invert(1)' ? 'none' : 'invert(1)';
        btn.textContent = document.body.style.filter === 'invert(1)' ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
    
    document.body.appendChild(btn);
}
