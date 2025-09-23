// Add Relief Form Functionality
document.addEventListener('DOMContentLoaded', () => {
    const reliefForm = document.getElementById('reliefForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Hide messages initially
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    reliefForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(reliefForm);
        const data = Object.fromEntries(formData.entries());

        try {
            // Simulate API call (replace with actual API endpoint)
            const response = await fetch('/api/relief', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Show success message
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
                reliefForm.reset();

                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            // Show error message
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';

            // Hide error message after 5 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
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
});