document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        form.classList.add('sending');
        submitBtn.disabled = true;

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
            // Directly POST to Discord webhook (hardcoded)
            const WEBHOOK_URL = 'https://discord.com/api/webhooks/1415402565197107333/okWqkhR_yaJm_PZRbT3zyoGXTXflMjmfLUAZnOIs6wd9kade8hW5LO7D_2hkLIzcxTgI';
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (!response.ok) throw new Error('Failed to send message');

            form.reset();
            alert('Message sent successfully! I\'ll get back to you via discord soon.');

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message. Please try again later.');
        } finally {
            form.classList.remove('sending');
            submitBtn.disabled = false;
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