// Initialize refresh timer
function initializeRefreshTimer() {
    const counter = document.getElementById('refreshCounter');
    const refreshBtn = document.getElementById('refreshNow');
    let countdown = 30;

    function updateCounter() {
        counter.textContent = countdown;
        countdown--;
        
        if (countdown < 0) {
            countdown = 30;
            loadStatistics();
            loadAuditTrail(document.querySelector('.tab-btn.active').dataset.tab);
        }
    }

    setInterval(updateCounter, 1000);
    refreshBtn.addEventListener('click', () => {
        countdown = 30;
        loadStatistics();
        loadAuditTrail(document.querySelector('.tab-btn.active').dataset.tab);
        
        // Add rotation animation to refresh icon
        const icon = refreshBtn.querySelector('.refresh-icon');
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => icon.style.transform = '', 500);
    });
}

// Setup search and filters
function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchAudit');
    const dateFilter = document.getElementById('dateFilter');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterAuditTrail(e.target.value, dateFilter.value);
        }, 300);
    });

    dateFilter.addEventListener('change', (e) => {
        filterAuditTrail(searchInput.value, e.target.value);
    });
}

// Filter audit trail data
function filterAuditTrail(searchQuery, dateRange) {
    const items = document.querySelectorAll('.audit-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const date = new Date(item.dataset.date);
        const isTextMatch = !searchQuery || text.includes(searchQuery.toLowerCase());
        const isDateMatch = checkDateRange(date, dateRange);
        
        if (isTextMatch && isDateMatch) {
            item.style.display = '';
            item.style.animation = 'fadeIn 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
}

// Check if date is within selected range
function checkDateRange(date, range) {
    if (range === 'all') return true;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    switch (range) {
        case 'today':
            return itemDate.getTime() === today.getTime();
        case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= weekAgo;
        case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return itemDate >= monthAgo;
        default:
            return true;
    }
}

// Update completion circle animation (supports path-based ring)
function updateCompletionCircle(percentage) {
    const circlePath = document.getElementById('completionCircle');
    if (!circlePath) return;

    // Use total path length for dash calculations
    const length = typeof circlePath.getTotalLength === 'function'
        ? circlePath.getTotalLength()
        : 100; // fallback

    // Safety: ensure no fill is applied that could render as a solid patch
    circlePath.style.fill = 'none';

    circlePath.style.strokeDasharray = `${length} ${length}`;
    circlePath.style.strokeDashoffset = length - (percentage / 100) * length;
}

// Format currency with animation
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const formatter = new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR' 
    });

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const value = start + (end - start) * progress;
        element.textContent = formatter.format(Math.floor(value));
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Audit Trail Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize statistics and data
    loadStatistics();
    loadAuditTrail('donations');
    initializeRefreshTimer();
    setupSearchAndFilters();

    // Setup tab switching with animations
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            // Animate content transition
            const content = document.getElementById('auditContent');
            content.style.opacity = '0';
            setTimeout(() => {
                loadAuditTrail(tab.dataset.tab);
                content.style.opacity = '1';
            }, 300);
        });
    });

    // Copy-to-clipboard (event delegation)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-copy-id]');
        if (btn) {
            const value = btn.getAttribute('data-copy-id');
            navigator.clipboard.writeText(value).then(() => {
                btn.textContent = 'Copied';
                setTimeout(() => (btn.textContent = 'Copy'), 1200);
            });
        }
    });
});

async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:5000/audit-trail');
        const data = await response.json();
        
        // Update statistics with animations
        const totalDonationsEl = document.getElementById('totalDonations');
        animateValue(totalDonationsEl, 0, data.statistics.totalDonations, 1500);
        
        const activeSuppliesEl = document.getElementById('activeSupplies');
        const currentSupplies = parseInt(activeSuppliesEl.textContent) || 0;
        animateValue(activeSuppliesEl, currentSupplies, data.statistics.totalSupplies, 1000);
        
        const completedEl = document.getElementById('completedDonations');
        const completedCount = data.donations.filter(d => d.tracking.status === 'completed').length;
        animateValue(completedEl, 0, completedCount, 1000);
        
        // Update completion circle
        const completionPercentage = (completedCount / data.donations.length) * 100;
        updateCompletionCircle(completionPercentage);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadAuditTrail(type) {
    const contentDiv = document.getElementById('auditContent');
    contentDiv.innerHTML = '<div class="loading-spinner">Loading...</div>';

    try {
        const response = await fetch('http://localhost:5000/audit-trail');
        const data = await response.json();
        
        if (type === 'donations') {
            renderDonations(data.donations, contentDiv);
        } else {
            renderSupplies(data.supplies, contentDiv);
        }
    } catch (error) {
        contentDiv.innerHTML = '<p class="error">Failed to load audit trail data</p>';
        console.error('Error:', error);
    }
}

function makeVerifyUrl(id) {
    return `http://localhost:5000/verifyRecord/${encodeURIComponent(id)}`;
}

function makeQrSrc(url) {
    const encoded = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}`;
}

function renderDonations(donations, container) {
    if (!donations || donations.length === 0) {
        container.innerHTML = '<p>No donations found</p>';
        return;
    }

    const content = donations.map(donation => {
        const id = donation.id || donation.details?.id || donation.blockchain?.txHash || '';
        const verifyUrl = makeVerifyUrl(id);
        const qr = makeQrSrc(verifyUrl);
        return `
        <div class="audit-item id-only ${donation.tracking.status}" data-date="${donation.tracking.createdAt}">
            <div class="id-left">
                <div class="id-label">Transaction ID</div>
                <div class="id-value" title="${id}">${id}</div>
                <div class="id-actions">
                    <button class="copy-btn" data-copy-id="${id}" aria-label="Copy transaction ID">Copy</button>
                    <a class="verify-link" href="${verifyUrl}" target="_blank" rel="noopener">Open</a>
                </div>
            </div>
            <a class="qr-right" href="${verifyUrl}" target="_blank" rel="noopener" aria-label="Scan QR or click to verify">
                <img src="${qr}" alt="QR to verify ${id}">
                <span>Scan to verify</span>
            </a>
        </div>`;
    }).join('');

    container.innerHTML = content;
}

function getStatusIcon(status) {
    switch (status) {
        case 'completed':
            return '✓';
        case 'pending':
            return '⌛';
        case 'in-transit':
            return '🔄';
        default:
            return '•';
    }
}

function renderSupplies(supplies, container) {
    if (!supplies || supplies.length === 0) {
        container.innerHTML = '<p>No supplies found</p>';
        return;
    }

    const content = supplies.map(supply => {
        const id = supply.id || supply.details?.id || supply.blockchain?.txHash || '';
        const verifyUrl = makeVerifyUrl(id);
        const qr = makeQrSrc(verifyUrl);
        return `
        <div class="audit-item id-only ${supply.tracking.status}" data-date="${supply.tracking.createdAt}">
            <div class="id-left">
                <div class="id-label">Transaction ID</div>
                <div class="id-value" title="${id}">${id}</div>
                <div class="id-actions">
                    <button class="copy-btn" data-copy-id="${id}" aria-label="Copy transaction ID">Copy</button>
                    <a class="verify-link" href="${verifyUrl}" target="_blank" rel="noopener">Open</a>
                </div>
            </div>
            <a class="qr-right" href="${verifyUrl}" target="_blank" rel="noopener" aria-label="Scan QR or click to verify">
                <img src="${qr}" alt="QR to verify ${id}">
                <span>Scan to verify</span>
            </a>
        </div>`;
    }).join('');

    container.innerHTML = content;
}