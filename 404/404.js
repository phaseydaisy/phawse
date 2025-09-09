// Get the repository name from the path for GitHub Pages
const getBasePath = () => {
    const path = window.location.pathname;
    // Check if we're on GitHub Pages
    if (path.includes('/phawse/')) {
        return '/phawse';
    }
    return '';
};

const basePath = getBasePath();

// Prevent the page from being shown in an iframe
if (window.top !== window.self) {
    window.top.location.href = window.self.location.href;
}

const validPaths = [
    '/',
    '/index.html',
    '/contact/',
    '/contact/index.html',
    '/hmph/',
    '/hmph/index.html',
    '/404/',
    '/404/index.html'
].map(path => basePath + path);

const currentPath = window.location.pathname;

// Don't redirect if we're already on a 404 page or the path is valid
if (!validPaths.includes(currentPath) && !currentPath.includes('/404/')) {
    window.location.href = basePath + '/404/';
}
