function initContact() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const submitBtn = form.querySelector('.submit-btn');
    let isSubmitting = false;

    // avoid double-binding
    if (form.__phawse_contact_initialized) return;
    form.__phawse_contact_initialized = true;

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
            submitBtn.classList.add('submit-success');
            submitBtn.innerHTML = '<span>Message Sent! ✓</span>';
            form.reset();
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.parentElement.classList.remove('active');
            });
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = "I'll get back to you via discord soon!";
            form.appendChild(successMessage);
            setTimeout(() => {
                successMessage.remove();
            }, 5000);

        } catch (error) {
            console.error('Error:', error);
            submitBtn.classList.add('submit-error');
            submitBtn.innerHTML = 'Error! Try Again';
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = 'Failed to send message. <button class="retry-btn">Retry</button>';
            form.appendChild(errorMessage);
            const retryBtn = errorMessage.querySelector('.retry-btn');
            retryBtn.onclick = () => {
                errorMessage.remove();
                submitBtn.click();
            };
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
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initContact();
} else {
    document.addEventListener('DOMContentLoaded', initContact);
}

window.addEventListener('phawse:page-loaded', () => {
    setTimeout(initContact, 40);
});