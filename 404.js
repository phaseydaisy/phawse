(function() {
    const validPaths = ['/', '/index.html', '/contact/', '/contact/index.html', '/discord/', '/discord/index.html'];
    const currentPath = window.location.pathname;
    
    if (!validPaths.includes(currentPath)) {
        window.location.href = '/404.html';
    }
})();
