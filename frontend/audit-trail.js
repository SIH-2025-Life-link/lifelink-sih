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

// Update completion circle animation
function updateCompletionCircle(percentage) {
    const circle = document.querySelector('.circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
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

function renderDonations(donations, container) {
    if (!donations || donations.length === 0) {
        container.innerHTML = '<p>No donations found</p>';
        return;
    }

    const content = donations.map(donation => `
        <div class="audit-item ${donation.tracking.status}" 
             data-date="${donation.tracking.createdAt}">
            <div class="audit-bullet">
                ${getStatusIcon(donation.tracking.status)}
            </div>
            <div class="audit-content">
                <div class="audit-header">
                    <h3>${donation.details.donorName}</h3>
                    <span class="status ${donation.tracking.status}">
                        ${donation.tracking.status.toUpperCase()}
                    </span>
                </div>
                <div class="audit-details">
                    <p><strong>Amount:</strong> ${new Intl.NumberFormat('en-IN', { 
                        style: 'currency', 
                        currency: 'INR' 
                    }).format(donation.details.amount)}</p>
                    <p><strong>Purpose:</strong> ${donation.details.purpose}</p>
                    <p><strong>Date:</strong> ${new Date(donation.tracking.createdAt).toLocaleDateString()}</p>
                    ${donation.blockchain ? `
                        <div class="blockchain-info">
                            <p><strong>TX Hash:</strong> ${donation.blockchain.txHash}</p>
                            <p><strong>Network:</strong> ${donation.blockchain.network}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

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

    const content = supplies.map(supply => `
        <div class="audit-item ${supply.tracking.status}"
             data-date="${supply.tracking.createdAt}">
            <div class="audit-bullet">
                ${getStatusIcon(supply.tracking.status)}
            </div>
            <div class="audit-content">
                <div class="audit-header">
                    <h3>${supply.details.item}</h3>
                    <span class="status ${supply.tracking.status}">
                        ${supply.tracking.status.toUpperCase()}
                    </span>
                </div>
                <div class="audit-details">
                    <p><strong>Quantity:</strong> ${supply.details.quantity} ${supply.details.unit}</p>
                    <p><strong>Category:</strong> ${supply.details.category}</p>
                    <p><strong>From:</strong> ${supply.logistics.from.name}</p>
                    <p><strong>To:</strong> ${supply.logistics.to.name}</p>
                    <p><strong>Date:</strong> ${new Date(supply.tracking.createdAt).toLocaleDateString()}</p>
                    ${supply.blockchain ? `
                        <div class="blockchain-info">
                            <p><strong>TX Hash:</strong> ${supply.blockchain.txHash}</p>
                            <p><strong>Network:</strong> ${supply.blockchain.network}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = content;
}