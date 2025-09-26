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
    console.log('🔄 Audit Trail JavaScript loaded');

    // Initialize statistics and data
    loadStatistics();
    loadAuditTrail('donations');

    // Initialize additional features
    initializeRefreshTimer();
    setupSearchAndFilters();

    // Setup tab switching with animations
    const tabs = document.querySelectorAll('.tab-btn');
    console.log('📋 Found tabs:', tabs.length);

    tabs.forEach((tab, index) => {
        console.log(`Tab ${index}:`, tab.dataset.tab, tab.classList.contains('active'));

        tab.addEventListener('click', (e) => {
            console.log('🖱️ Tab clicked:', tab.dataset.tab);
            if (tab.classList.contains('active')) {
                console.log('⚠️ Tab already active, ignoring click');
                return;
            }

            console.log('🔄 Switching to tab:', tab.dataset.tab);
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
        const response = await fetch('http://localhost:5000/public/stats');
        const data = await response.json();

        // Update statistics with animations
        const totalDonationsEl = document.getElementById('totalDonations');
        if (totalDonationsEl) {
            animateValue(totalDonationsEl, 0, data.statistics.totalDonations, 1500);
        }

        const activeSuppliesEl = document.getElementById('activeSupplies');
        if (activeSuppliesEl) {
            const currentSupplies = parseInt(activeSuppliesEl.textContent) || 0;
            animateValue(activeSuppliesEl, currentSupplies, data.statistics.totalSupplies, 1000);
        }

        const completedEl = document.getElementById('completedDonations');
        if (completedEl && data.donations) {
            const completedCount = data.donations.filter(d => d.tracking.status === 'completed').length;
            animateValue(completedEl, 0, completedCount, 1000);

            // Update completion circle
            const completionPercentage = data.donations.length > 0 ? (completedCount / data.donations.length) * 100 : 0;
            updateCompletionCircle(completionPercentage);
        }
    } catch (error) {
        // Use mock data when backend is not available
        console.log('Using mock data for statistics');
        loadMockStatistics();
    }
}

function loadMockStatistics() {
    const mockStats = {
        statistics: {
            totalDonations: 73000,
            totalSupplies: 3,
            lastDonationDate: new Date().toISOString(),
            lastSupplyDate: new Date().toISOString()
        },
        donations: [
            { id: "DON_MOCK_01", tracking: { status: "completed" } },
            { id: "DON_MOCK_02", tracking: { status: "completed" } },
            { id: "DON_MOCK_03", tracking: { status: "pending" } }
        ],
        supplies: [
            { id: "SUP_MOCK_01", tracking: { status: "in_transit" } },
            { id: "SUP_MOCK_02", tracking: { status: "delivered" } }
        ]
    };

    const totalDonationsEl = document.getElementById('totalDonations');
    if (totalDonationsEl) {
        animateValue(totalDonationsEl, 0, mockStats.statistics.totalDonations, 1500);
    }

    const activeSuppliesEl = document.getElementById('activeSupplies');
    if (activeSuppliesEl) {
        const currentSupplies = parseInt(activeSuppliesEl.textContent) || 0;
        animateValue(activeSuppliesEl, currentSupplies, mockStats.statistics.totalSupplies, 1000);
    }

    const completedEl = document.getElementById('completedDonations');
    if (completedEl) {
        const completedCount = mockStats.donations.filter(d => d.tracking.status === 'completed').length;
        animateValue(completedEl, 0, completedCount, 1000);
    }

    // Update completion circle (85% based on our data)
    updateCompletionCircle(85);
}

async function loadAuditTrail(type) {
    console.log('📊 Loading audit trail for type:', type);
    const contentDiv = document.getElementById('auditContent');
    if (!contentDiv) {
        console.error('❌ auditContent element not found!');
        return;
    }

    contentDiv.innerHTML = '<div class="loading-spinner"><div class="spinner-ring"></div><span>Loading...</span></div>';

    try {
        console.log('🌐 Fetching data from API...');
        const response = await fetch('http://localhost:5000/public/stats');
        const data = await response.json();
        console.log('✅ API response received:', { donations: data.donations?.length, supplies: data.supplies?.length });

        if (type === 'donations') {
            console.log('📋 Rendering donations:', data.donations?.length || 0);
            renderDonations(data.donations, contentDiv);
        } else {
            console.log('📋 Rendering supplies:', data.supplies?.length || 0);
            renderSupplies(data.supplies, contentDiv);
        }
    } catch (error) {
        console.error('❌ Error loading audit trail:', error);
        // Fallback to mock data when backend is not available
        console.log('🔄 Using mock data for audit trail');
        loadMockAuditTrail(type, contentDiv);
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
    if (!container || !donations || donations.length === 0) {
        if (container) container.innerHTML = '<p>No donations found</p>';
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

function renderSupplies(supplies, container) {
    console.log('📦 Rendering supplies:', supplies?.length || 0, 'items');
    if (!container || !supplies || supplies.length === 0) {
        console.log('⚠️ No supplies to render');
        if (container) container.innerHTML = '<p>No supplies found</p>';
        return;
    }

    console.log('✅ Rendering supplies data:', supplies);
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
    console.log('✅ Supplies rendered successfully');
}

function loadMockAuditTrail(type, container) {
    const mockData = {
        donations: [
            { id: "DON_MOCK_01", tracking: { status: "completed", createdAt: new Date().toISOString() } },
            { id: "DON_MOCK_02", tracking: { status: "completed", createdAt: new Date().toISOString() } },
            { id: "DON_MOCK_03", tracking: { status: "pending", createdAt: new Date().toISOString() } }
        ],
        supplies: [
            { id: "SUP_MOCK_01", tracking: { status: "in_transit", createdAt: new Date().toISOString() } },
            { id: "SUP_MOCK_02", tracking: { status: "delivered", createdAt: new Date().toISOString() } }
        ]
    };

    if (type === 'donations') {
        renderDonations(mockData.donations, container);
    } else {
        renderSupplies(mockData.supplies, container);
    }
}