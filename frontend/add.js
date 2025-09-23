// Add Relief Form Functionality
document.addEventListener('DOMContentLoaded', () => {
    const reliefForm = document.getElementById('reliefForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const idPassSection = document.getElementById('idPassSection');

    // Update navbar title based on current page
    function updateNavbarTitle() {
        const pageTitle = document.getElementById('pageTitle');
        if (!pageTitle) return;

        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop().replace('.html', '') || 'index';

        const pageTitles = {
            'index': 'LifeLink - Home',
            'add': 'LifeLink - Add Relief',
            'check': 'LifeLink - Check Relief',
            'about': 'LifeLink - About Us',
            'funds': 'LifeLink - Funds',
            'feedback': 'LifeLink - Feedback'
        };

        const title = pageTitles[pageName] || 'LifeLink';
        pageTitle.textContent = title;
        pageTitle.setAttribute('alt', title);
    }

    // Update navbar title when page loads or when navigation occurs
    updateNavbarTitle();

    // Also update title when navigation links are clicked (for SPA-like experience)
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Add a small delay to allow for page transition
            setTimeout(updateNavbarTitle, 100);
        });
    });

    // Hide messages initially
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    // Generate a random ID and password for the relief request
    function generateReliefId() {
        const prefix = 'RLF';
        const year = new Date().getFullYear().toString().slice(-2);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${year}-${randomNum}`;
    }

    function generatePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    // Copy text to clipboard
    function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const text = element.textContent;
        navigator.clipboard.writeText(text).then(() => {
            // Show feedback
            const originalText = element.textContent;
            element.textContent = 'Copied!';
            element.style.color = '#10B981';
            
            setTimeout(() => {
                element.textContent = originalText;
                element.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    reliefForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(reliefForm);
        const data = Object.fromEntries(formData.entries());

        // Hide the important notice when form is submitted
        const importantNotice = document.querySelector('.important-notice');
        if (importantNotice) {
            importantNotice.style.display = 'none';
        }

        // Use hardcoded ID and password
        const reliefId = 'admin';
        const reliefPassword = 'admin123';
        
        // Update the ID Pass section
        document.getElementById('reliefIdDisplay').textContent = reliefId;
        document.getElementById('reliefPasswordDisplay').textContent = reliefPassword;
        
        // Show the ID Pass section and hide the form
        idPassSection.style.display = 'block';
        reliefForm.style.display = 'none';
        
        // Scroll to the ID Pass section
        idPassSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Show success message - DISABLED
        // successMessage.style.display = 'block';
        // successMessage.textContent = 'Relief details submitted successfully!';
        
        // Hide the success message after 5 seconds - DISABLED
        // setTimeout(() => {
        //     successMessage.style.display = 'none';
        // }, 5000);
        
        // In a real application, you would send the data to your server here
        try {
            const response = await fetch('/api/relief', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    id: reliefId,
                    password: reliefPassword
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit relief details');
            }
            
            // Data submitted successfully
            console.log('Relief details submitted successfully');
        } catch (error) {
            console.error('Error submitting relief details:', error);
            // Show error message - DISABLED
            // errorMessage.style.display = 'block';
            // errorMessage.textContent = 'Error submitting relief details. Please try again.';
            
            // Hide the error message after 5 seconds - DISABLED
            // setTimeout(() => {
            //     errorMessage.style.display = 'none';
            // }, 5000);
        }
    });

    // Form validation
    const inputs = reliefForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.classList.add('is-valid');
                input.classList.remove('is-invalid');
            } else {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            }
        });
    });
    
    // Add print button functionality
    document.querySelectorAll('.print-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.print();
        });
    });
    
    // Add click handlers for copy buttons
    document.addEventListener('click', (e) => {
        // Handle copy buttons with data-copy-target attribute
        const copyBtn = e.target.closest('[data-copy-target]');
        if (copyBtn) {
            e.preventDefault();
            const targetId = copyBtn.getAttribute('data-copy-target');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const text = targetElement.textContent.trim();
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        }
    });
    
    // Make the copyToClipboard function available globally for inline onclick handlers
    window.copyToClipboard = copyToClipboard;
});