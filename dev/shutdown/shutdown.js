document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.status-text').textContent = 'goodnight...';
    }, 2000);

    setTimeout(() => {
        document.querySelector('.status-text').textContent = 'see you soon...';
    }, 4000);
});
