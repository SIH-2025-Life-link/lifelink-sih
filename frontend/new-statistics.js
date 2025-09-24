// Statistics JavaScript

// Update statistics numbers with animation
function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Update completion ring
function setProgress(percent, elementId) {
    const circle = document.querySelector(`#${elementId} .circle`);
    const completionRing = circle.closest('.completion-ring');
    const percentText = completionRing.querySelector('.completion-percent');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    // Set the stroke-dasharray to the full circumference
    circle.style.strokeDasharray = `${circumference} ${circumference}`;

    // Calculate the offset to show only the completed percentage
    // The offset is calculated as (100% - percent) of the circumference
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Update percentage text
    percentText.textContent = `${percent}%`;

    // Add high completion class for special effects
    if (percent >= 80) {
        completionRing.classList.add('high-completion');
        circle.classList.add('high-completion');
        percentText.classList.add('high-completion');
    } else {
        completionRing.classList.remove('high-completion');
        circle.classList.remove('high-completion');
        percentText.classList.remove('high-completion');
    }
}

// Update supply chart legend
function updateSupplyChart(delivered, inTransit, pending) {
    // Update legend counts
    const deliveredCount = document.querySelector('.chart-legend .legend-count');
    const inTransitCount = document.querySelector('.chart-legend:nth-child(2) .legend-count');
    const pendingCount = document.querySelector('.chart-legend:nth-child(3) .legend-count');

    if (deliveredCount) deliveredCount.textContent = delivered;
    if (inTransitCount) inTransitCount.textContent = inTransit;
    if (pendingCount) pendingCount.textContent = pending;

    // Update total supplies display
    const totalSupplies = delivered + inTransit + pending;
    const suppliesElement = document.querySelector('.supplies-total');
    if (suppliesElement) {
        animateNumber(suppliesElement, parseInt(suppliesElement.textContent.replace(/,/g, '')) || 0, totalSupplies, 1000);
    }
}

// Initialize statistics
function initializeStatistics() {
    // Sample data - replace with actual API calls
    const stats = {
        totalDonations: 25000,
        suppliesDelivered: 1500,
        completionRate: 85,
        inTransit: 200,
        pending: 150
    };

    // Calculate total supplies (delivered + in transit + pending)
    const totalSupplies = stats.suppliesDelivered + stats.inTransit + stats.pending;

    // Animate numbers
    const donationElement = document.querySelector('.donation-total');
    const suppliesElement = document.querySelector('.supplies-total');
    animateNumber(donationElement, 0, stats.totalDonations, 2000);
    animateNumber(suppliesElement, 0, totalSupplies, 2000);

    // Update completion ring
    setProgress(stats.completionRate, 'completionCircle');

    // Update progress bars with realistic percentages
    const suppliesProgressPercent = Math.round((stats.suppliesDelivered / totalSupplies) * 100);
    const donationProgressPercent = Math.round((stats.totalDonations / 50000) * 100); // Assuming target is 50k

    updateProgressBar('supplies-progress', suppliesProgressPercent);
    updateProgressBar('donation-progress', donationProgressPercent);

    // Update supply chart legend
    updateSupplyChart(stats.suppliesDelivered, stats.inTransit, stats.pending);

    // Set up refresh timer
    updateRefreshTimer();
}

// Refresh timer
let refreshCountdown = 60;
function updateRefreshTimer() {
    const timerElement = document.querySelector('.refresh-countdown');
    timerElement.textContent = refreshCountdown;
    
    const countdown = setInterval(() => {
        refreshCountdown--;
        timerElement.textContent = refreshCountdown;
        
        if (refreshCountdown <= 0) {
            clearInterval(countdown);
            refreshStatistics();
        }
    }, 1000);
}

// Refresh statistics
function refreshStatistics() {
    // Generate slightly different data for more realistic updates
    const baseStats = {
        totalDonations: 25000,
        suppliesDelivered: 1500,
        completionRate: 85,
        inTransit: 200,
        pending: 150
    };

    // Add some random variation to make it feel more dynamic
    const variation = {
        totalDonations: Math.floor(Math.random() * 1000) + 500, // +500 to +1500
        suppliesDelivered: Math.floor(Math.random() * 50) + 25, // +25 to +75
        inTransit: Math.floor(Math.random() * 20) + 10, // +10 to +30
        pending: Math.floor(Math.random() * 30) + 5, // +5 to +35
        completionRate: Math.floor(Math.random() * 5) + 83 // 83% to 88%
    };

    const newStats = {
        totalDonations: baseStats.totalDonations + variation.totalDonations,
        suppliesDelivered: baseStats.suppliesDelivered + variation.suppliesDelivered,
        completionRate: baseStats.completionRate + Math.floor(Math.random() * 6) - 3, // -3 to +3
        inTransit: baseStats.inTransit + variation.inTransit,
        pending: baseStats.pending + variation.pending
    };

    // Ensure completion rate stays within reasonable bounds
    newStats.completionRate = Math.max(75, Math.min(95, newStats.completionRate));

    // Re-initialize with new data
    refreshCountdown = 60;
    initializeStatisticsWithData(newStats);
}

// Initialize with custom data
function initializeStatisticsWithData(stats) {
    const totalSupplies = stats.suppliesDelivered + stats.inTransit + stats.pending;

    // Animate numbers
    const donationElement = document.querySelector('.donation-total');
    const suppliesElement = document.querySelector('.supplies-total');
    animateNumber(donationElement, 0, stats.totalDonations, 2000);
    animateNumber(suppliesElement, 0, totalSupplies, 2000);

    // Update completion ring
    setProgress(stats.completionRate, 'completionCircle');

    // Update progress bars with realistic percentages
    const suppliesProgressPercent = Math.round((stats.suppliesDelivered / totalSupplies) * 100);
    const donationProgressPercent = Math.round((stats.totalDonations / 50000) * 100);

    updateProgressBar('supplies-progress', suppliesProgressPercent);
    updateProgressBar('donation-progress', donationProgressPercent);

    // Update supply chart legend
    updateSupplyChart(stats.suppliesDelivered, stats.inTransit, stats.pending);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeStatistics();
    
    // Manual refresh button
    const refreshButton = document.querySelector('.refresh-btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            refreshStatistics();
        });
    }
});