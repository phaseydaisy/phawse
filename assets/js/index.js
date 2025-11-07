const canvas = document.createElement('canvas');

document.addEventListener('click', handleLinkClick);

window.addEventListener('popstate', (e) => {
    
    const url = new URL(location.href);
    fetch(url.href, { credentials: 'same-origin' }).then(r => r.text()).then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const replaced = extractAndReplaceContent(doc);
        if (!replaced) {
            
            location.reload();
            return;
        }
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.textContent;
        window.scrollTo(0,0);
    }).catch(() => {
        location.reload();
    });
});
