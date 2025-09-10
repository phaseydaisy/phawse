document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');
    const WORKER_URL = "https://phawse.kaidenlorse1.workers.dev/";

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        form.classList.add('sending');
        submitBtn.disabled = true;

        const timestamp = new Date();
        const formData = {
            name: form.name.value.trim(),
            discord: form.discord.value.trim() || 'Not provided',
            message: form.message.value.trim(),
            timestamp: timestamp.toISOString()
        };

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            form.reset();
            
            alert('Message sent successfully! I\'ll get back to you via discord soon.');
        } catch (error) {
            console.error('Error:', error);
            alert('Oops! Something went wrong. Please try again.');
        } finally {
            form.classList.remove('sending');
            submitBtn.disabled = false;
        }
    });

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        if (input.value) {
            input.parentElement.classList.add('active');
        }
        
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('active');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('active');
            }
        });
    });
});
