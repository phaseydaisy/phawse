document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1414341241545425087/wAoO_t5TCkJgJXiCsST4GsyFU-cjdgd21GxIYDhz_1Ve78AXPHp_svV4ayssDJzRihM_";

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
            const discordMessage = {
                content: "<@1161104305080762449>",
                embeds: [{
                    title: "💌 New Message from Website",
                    color: 0x2F3136,
                    fields: [
                        {
                            name: "👤 From",
                            value: formData.name,
                            inline: true
                        },
                        {
                            name: "🎮 Discord",
                            value: formData.discord,
                            inline: true
                        },
                        {
                            name: "📝 Message",
                            value: formData.message
                        }
                    ],
                    timestamp: formData.timestamp,
                    footer: {
                        text: "Sent from phases website"
                    }
                }]
            };

            const response = await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discordMessage)
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
