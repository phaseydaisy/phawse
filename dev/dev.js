document.addEventListener('DOMContentLoaded', () => {
    const statusMessages = [
        'Writing code...',
        'Building components...',
        'Testing features...',
        'Debugging...',
        'Optimizing performance...',
        'Implementing new features...',
        'Refactoring code...',
        'Running tests...',
    ];

    const statusText = document.querySelector('.status-text');
    let currentIndex = 0;
    function updateStatus() {
        statusText.style.opacity = '0';
        
        setTimeout(() => {
            statusText.textContent = statusMessages[currentIndex];
            statusText.style.opacity = '1';
            
            currentIndex = (currentIndex + 1) % statusMessages.length;
        }, 500);
    }
    updateStatus();
    setInterval(updateStatus, 3000);
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => {
        tool.addEventListener('mouseenter', () => {
            tool.style.transform = 'scale(1.2)';
        });
        
        tool.addEventListener('mouseleave', () => {
            tool.style.transform = 'scale(1)';
        });
    });
});
