const getBasePath = () => {
    const isGitHubPages = location.hostname.endsWith('github.io');
    if (isGitHubPages) {
        return '/phawse';
    }
    return '';
};

const basePath = getBasePath();

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
if (!validPaths.includes(currentPath) && !currentPath.includes('/404/')) {
    window.location.href = basePath + '/404/';
}
