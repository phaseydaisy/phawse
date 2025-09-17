document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');
    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        isSubmitting = true;
        
        submitBtn.innerHTML = '<div class="loader"></div>';
        submitBtn.disabled = true;
        form.classList.add('sending');

        const timestamp = new Date();
        const message = {
            content: "<@1161104305080762449>",
            embeds: [{
                title: "💌 New Message from Website",
                color: 0x2F3136,
                fields: [
                    {
                        name: "👤 From",
                        value: form.name.value.trim(),
                        inline: true
                    },
                    {
                        name: "🎮 Discord",
                        value: form.discord.value.trim() || 'Not provided',
                        inline: true
                    },
                    {
                        name: "📝 Message",
                        value: form.message.value.trim()
                    }
                ],
                timestamp: timestamp.toISOString(),
                footer: {
                    text: "Sent from https://phawse.lol"
                }
            }]
        };

        try {
            const WEBHOOK_URL = 'https://discord.com/api/webhooks/1415402565197107333/okWqkhR_yaJm_PZRbT3zyoGXTXflMjmfLUAZnOIs6wd9kade8hW5LO7D_2hkLIzcxTgI';
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (!response.ok) throw new Error('Failed to send message');

            // Success state
            submitBtn.classList.add('submit-success');
            submitBtn.innerHTML = '<span>Message Sent! ✓</span>';
            form.reset();
            
            // Reset input states
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.parentElement.classList.remove('active');
            });

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = "I'll get back to you via discord soon!";
            form.appendChild(successMessage);

            // Remove success message after delay
            setTimeout(() => {
                successMessage.remove();
            }, 5000);

        } catch (error) {
            console.error('Error:', error);
            
            // Error state
            submitBtn.classList.add('submit-error');
            submitBtn.innerHTML = 'Error! Try Again';
            
            // Show error message with retry button
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = 'Failed to send message. <button class="retry-btn">Retry</button>';
            form.appendChild(errorMessage);

            // Handle retry button
            const retryBtn = errorMessage.querySelector('.retry-btn');
            retryBtn.onclick = () => {
                errorMessage.remove();
                submitBtn.click();
            };

            // Remove error message after delay
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        } finally {
            setTimeout(() => {
                submitBtn.classList.remove('submit-success', 'submit-error');
                submitBtn.innerHTML = 'Send Message';
                submitBtn.disabled = false;
                form.classList.remove('sending');
                isSubmitting = false;
            }, 3000);
        }
    });

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        if (input.value) input.parentElement.classList.add('active');
        
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('active');
        });

        input.addEventListener('blur', () => {
            if (!input.value) input.parentElement.classList.remove('active');
        });
    });
});