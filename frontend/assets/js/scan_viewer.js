// NexusDAST Report Interactive Features - Enhanced Version

document.addEventListener('DOMContentLoaded', function() {
    console.log('%cNexusDAST Report Viewer', 'color: #667eea; font-size: 18px; font-weight: bold;');
    initializeReportFeatures();
});

function initializeReportFeatures() {
    // Initialize all features
    addFindingToggle();
    addSeverityFilter();
    addSearchFeature();
    addCopyFeature();
    addPrintFeatures();
    displayStatistics();
    setupScrollAnimations();
}

// ===== Finding Toggle Functionality =====
function addFindingToggle() {
    const findings = document.querySelectorAll('.finding');
    
    findings.forEach((finding, index) => {
        const header = finding.querySelector('.finding-header');
        const details = finding.querySelector('.finding-details');
        
        if (header && details) {
            header.style.cursor = 'pointer';
            
            // Set initial state
            let isExpanded = true;
            details.style.display = 'block';
            
            header.addEventListener('click', function(e) {
                // Prevent click if clicking on badge
                if (e.target.classList.contains('finding-badge')) return;
                
                isExpanded = !isExpanded;
                details.style.display = isExpanded ? 'block' : 'none';
                header.style.opacity = isExpanded ? '1' : '0.7';
                
                // Add smooth animation
                if (isExpanded) {
                    details.style.animation = 'fadeIn 0.3s ease-out';
                }
            });
        }
    });
}

// ===== Severity Filter Functionality =====
function addSeverityFilter() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const filterDiv = document.createElement('div');
    filterDiv.className = 'filter-controls';
    
    const severities = [
        { name: 'critical', icon: '🔴', label: 'Critical' },
        { name: 'high', icon: '🟠', label: 'High' },
        { name: 'medium', icon: '🟡', label: 'Medium' },
        { name: 'low', icon: '🟢', label: 'Low' },
        { name: 'all', icon: '📋', label: 'All' }
    ];
    
    severities.forEach((severity, index) => {
        const btn = document.createElement('button');
        btn.innerHTML = `${severity.icon} ${severity.label} <span id="count-${severity.name}">0</span>`;
        btn.className = 'filter-btn';
        btn.dataset.severity = severity.name;
        
        btn.addEventListener('click', function() {
            filterBySeverity(severity.name);
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.style.opacity = b === this ? '1' : '0.6';
            });
        });
        
        filterDiv.appendChild(btn);
        if (severity.name === 'all') btn.style.opacity = '1';
        else btn.style.opacity = '0.6';
    });
    
    header.appendChild(filterDiv);
    
    // Update counts
    updateFilterCounts();
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

function updateFilterCounts() {
    const severities = ['critical', 'high', 'medium', 'low'];
    
    severities.forEach(severity => {
        const count = document.querySelectorAll(`.finding.${severity}`).length;
        const countEl = document.getElementById(`count-${severity}`);
        if (countEl) {
            countEl.textContent = count > 0 ? `(${count})` : '';
        }
    });
    
    const totalCount = document.querySelectorAll('.finding').length;
    const countEl = document.getElementById('count-all');
    if (countEl) {
        countEl.textContent = totalCount > 0 ? `(${totalCount})` : '';
    }
}

// ===== Search Functionality =====
function addSearchFeature() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const searchDiv = document.createElement('div');
    searchDiv.style.cssText = 'margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 Search findings by type, URL, or details...';
    searchInput.className = 'search-input';
    searchInput.style.cssText = 'padding: 12px 16px; width: 100%; max-width: 500px; border: 2px solid rgba(255,255,255,0.3); ' +
                               'background: rgba(255,255,255,0.1); color: white; border-radius: 8px; ' +
                               'font-size: 0.95em; transition: all 0.3s;';
    
    searchInput.addEventListener('focus', function() {
        this.style.background = 'rgba(255,255,255,0.15)';
        this.style.borderColor = 'rgba(255,255,255,0.5)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.background = 'rgba(255,255,255,0.1)';
        this.style.borderColor = 'rgba(255,255,255,0.3)';
    });
    
    searchInput.addEventListener('input', function(e) {
        searchFindings(e.target.value);
    });
    
    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '✕';
    clearBtn.style.cssText = 'padding: 8px 12px; background: rgba(255,255,255,0.1); color: white; ' +
                            'border: none; border-radius: 6px; cursor: pointer; font-weight: 600;';
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchFindings('');
    });
    
    searchDiv.appendChild(searchInput);
    searchDiv.appendChild(clearBtn);
    header.appendChild(searchDiv);
}

function searchFindings(query) {
    const findings = document.querySelectorAll('.finding');
    const lowerQuery = query.toLowerCase();
    let matchCount = 0;
    
    if (query === '') {
        findings.forEach(finding => {
            finding.style.display = 'block';
        });
    } else {
        findings.forEach(finding => {
            const findingType = finding.querySelector('.finding-type')?.textContent.toLowerCase() || '';
            const findingUrl = finding.querySelector('.finding-url')?.textContent.toLowerCase() || '';
            const findingDetails = finding.querySelector('.finding-details')?.textContent.toLowerCase() || '';
            
            const matches = findingType.includes(lowerQuery) || 
                          findingUrl.includes(lowerQuery) || 
                          findingDetails.includes(lowerQuery);
            
            finding.style.display = matches ? 'block' : 'none';
            if (matches) matchCount++;
        });
    }
    
    // Show search results count
    console.log(`Found ${matchCount} matching findings`);
}

// ===== Copy to Clipboard =====
function addCopyFeature() {
    const urls = document.querySelectorAll('.finding-url');
    
    urls.forEach(url => {
        url.style.cursor = 'pointer';
        url.title = 'Click to copy URL';
        
        url.addEventListener('click', function(e) {
            e.preventDefault();
            copyToClipboard(this.textContent);
            showNotification('✓ URL copied to clipboard!', 'success');
        });
        
        url.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(102, 126, 234, 0.3)';
        });
        
        url.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(0, 0, 0, 0.2)';
        });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('✗ Failed to copy', 'error');
    });
}

// ===== Notifications =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Print & Export Features =====
function addPrintFeatures() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const controls = document.createElement('div');
    controls.style.cssText = 'margin-top: 20px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;';
    
    // Print button
    const printBtn = document.createElement('button');
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print Report';
    printBtn.style.cssText = 'padding: 10px 20px; border: 2px solid rgba(255,255,255,0.3); ' +
                            'background: rgba(255,255,255,0.1); color: white; border-radius: 6px; ' +
                            'cursor: pointer; transition: all 0.3s; font-weight: 600;';
    
    printBtn.addEventListener('click', function() {
        window.print();
        showNotification('📄 Opening print dialog...', 'info');
    });
    
    printBtn.addEventListener('mouseover', function() {
        this.style.background = 'rgba(255,255,255,0.2)';
    });
    
    printBtn.addEventListener('mouseout', function() {
        this.style.background = 'rgba(255,255,255,0.1)';
    });
    
    controls.appendChild(printBtn);
    
    // Export JSON button
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export JSON';
    exportBtn.style.cssText = printBtn.style.cssText;
    
    exportBtn.addEventListener('click', function() {
        exportAsJSON();
    });
    
    exportBtn.addEventListener('mouseover', function() {
        this.style.background = 'rgba(255,255,255,0.2)';
    });
    
    exportBtn.addEventListener('mouseout', function() {
        this.style.background = 'rgba(255,255,255,0.1)';
    });
    
    controls.appendChild(exportBtn);
    
    header.appendChild(controls);
}

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
            const details = finding.querySelector('.finding-details')?.textContent || '';
            
            findings.push({
                severity: severity,
                type: type,
                url: url,
                details: details.substring(0, 200),
                timestamp: new Date().toISOString()
            });
        });
    });
    
    const data = {
        report: {
            title: 'NexusDAST Vulnerability Report',
            generatedAt: new Date().toISOString(),
            totalFindings: findings.length
        },
        findings: findings,
        statistics: calculateStatistics()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const fileName = 'nexusdast_report_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
    
    showNotification('✓ Report exported successfully!', 'success');
}

// ===== Statistics =====
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

function displayStatistics() {
    const stats = calculateStatistics();
    console.log('Scan Statistics:', stats);
}

// ===== Scroll Animations =====
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.finding, .summary-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.5s ease';
        observer.observe(element);
    });
}

// ===== Add animations to document =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 1000px;
        }
    }
    
    .search-input::placeholder {
        color: rgba(255,255,255,0.6);
    }
`;
document.head.appendChild(style);
