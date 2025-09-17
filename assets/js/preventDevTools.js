document.addEventListener('keydown', function(event) {
    if(event.keyCode === 123) { event.preventDefault(); return false; }
    if(event.ctrlKey && event.shiftKey && event.keyCode === 73) { event.preventDefault(); return false; }
    if(event.ctrlKey && event.shiftKey && event.keyCode === 74) { event.preventDefault(); return false; }
    if(event.ctrlKey && event.shiftKey && event.keyCode === 67) { event.preventDefault(); return false; }
    if(event.ctrlKey && event.keyCode === 85) { event.preventDefault(); return false; }
});

document.addEventListener('contextmenu', function(event) { event.preventDefault(); return false; });
