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
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
}

// Update progress bars
function updateProgressBar(elementId, percent) {
    const progressBar = document.querySelector(`#${elementId} .progress`);
    progressBar.style.width = `${percent}%`;
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

    // Animate numbers
    const donationElement = document.querySelector('.donation-total');
    const suppliesElement = document.querySelector('.supplies-total');
    animateNumber(donationElement, 0, stats.totalDonations, 2000);
    animateNumber(suppliesElement, 0, stats.suppliesDelivered, 2000);

    // Update completion ring
    setProgress(stats.completionRate, 'completion-chart');

    // Update progress bars
    updateProgressBar('supplies-progress', 75);
    updateProgressBar('donation-progress', 65);

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
    // Add API call here to fetch new data
    refreshCountdown = 60;
    initializeStatistics();
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