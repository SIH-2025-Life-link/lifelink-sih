// Statistics Update Functions
document.addEventListener('DOMContentLoaded', function() {
    // Initial load
    updateStatistics();

    // Set up refresh button click handler
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.style.transform = 'translateX(-50%) rotate(360deg)';
            updateStatistics();
            setTimeout(() => {
                this.style.transform = 'translateX(-50%) rotate(0deg)';
            }, 1000);
        });
    }
});

async function updateStatistics() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/statistics`);
        const data = await response.json();
        
        // Update donation statistics
        const totalDonations = document.getElementById('totalDonations');
        const transactionCount = document.getElementById('transactionCount');
        if (totalDonations && data.totalDonations) {
            totalDonations.textContent = `₹${data.totalDonations.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
        if (transactionCount && data.transactionCount) {
            transactionCount.textContent = data.transactionCount;
        }

        // Update active supplies
        const activeSupplies = document.getElementById('activeSupplies');
        if (activeSupplies && data.activeSupplies) {
            activeSupplies.textContent = data.activeSupplies;
        }

        // Update supply chart
        updateSupplyChart(data.supplyDistribution || {
            completed: 1,
            inTransit: 2,
            pending: 1
        });

        // Update progress bars
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach((bar, index) => {
            const progress = data.progress?.[index] || 75;
            bar.style.width = `${progress}%`;
        });

    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

function updateSupplyChart(distribution) {
    const chartContainer = document.querySelector('.supply-chart');
    if (!chartContainer) return;

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    chartContainer.innerHTML = `
        <div class="chart-legend">
            <span class="status-dot completed"></span>
            <span class="legend-label">Completed</span>
            <span class="legend-count">${distribution.completed || 0}</span>
        </div>
        <div class="chart-legend">
            <span class="status-dot in-transit"></span>
            <span class="legend-label">In Transit</span>
            <span class="legend-count">${distribution.inTransit || 0}</span>
        </div>
        <div class="chart-legend">
            <span class="status-dot pending"></span>
            <span class="legend-label">Pending</span>
            <span class="legend-count">${distribution.pending || 0}</span>
        </div>
    `;
}

// Auto-refresh every 30 seconds
setInterval(updateStatistics, 30000);