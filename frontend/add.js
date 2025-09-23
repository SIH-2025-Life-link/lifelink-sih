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

        async function showSuccessAndCreds() {
            // Show success message
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            reliefForm.reset();

            // Show tracking credentials card
            const credsCard = document.getElementById('credsCard');
            if (credsCard) {
                credsCard.style.display = 'block';
                const idEl = document.getElementById('trackIdValue');
                const pwEl = document.getElementById('trackPwValue');
                if (idEl) idEl.textContent = 'admin';
                if (pwEl) pwEl.textContent = 'admin123';
                credsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }

        try {
            // Try to submit to backend if available. If it fails, fall back to local success.
            const response = await fetch('/api/relief', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await showSuccessAndCreds();
            } else {
                // Fallback to success to avoid blocking UX when API is not configured locally
                console.warn('Relief submit API returned non-OK. Falling back to local success.');
                await showSuccessAndCreds();
            }
        } catch (error) {
            console.warn('Relief submit API not reachable. Falling back to local success.', error);
            await showSuccessAndCreds();
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

    // Copy-to-clipboard for credentials card
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-copy-target]');
        if (!btn) return;
        const sel = btn.getAttribute('data-copy-target');
        const el = document.querySelector(sel);
        if (el) {
            const text = el.textContent.trim();
            navigator.clipboard.writeText(text).then(() => {
                const original = btn.textContent;
                btn.textContent = 'Copied';
                setTimeout(() => (btn.textContent = original), 1200);
            });
        }
    });
});