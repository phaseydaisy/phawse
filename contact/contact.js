document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Add loading state
        form.classList.add('sending');
        submitBtn.disabled = true;

        // Get form data
        const formData = {
            name: form.name.value,
            email: form.email.value,
            message: form.message.value,
            timestamp: new Date().toISOString()
        };

        try {
            // Here you would typically send the data to your backend
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Clear the form
            form.reset();
            
            // Show success message
            alert('Message sent successfully! I\'ll get back to you soon.');
        } catch (error) {
            alert('Oops! Something went wrong. Please try again.');
        } finally {
            // Remove loading state
            form.classList.remove('sending');
            submitBtn.disabled = false;
        }
    });

    // Add floating label animation
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
