if (window.top !== window.self) {
    window.top.location.href = window.self.location.href;
}

const validPaths = ['/', '/index.html', '/contact/', '/contact/index.html', '/hmph/', '/hmph/index.html', '/404/', '/404/index.html'];
const currentPath = window.location.pathname;

if (!validPaths.includes(currentPath) && !currentPath.startsWith('/404/')) {
    window.location.href = '/404/';
}
