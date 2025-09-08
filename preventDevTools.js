// Prevent common keyboard shortcuts for developer tools
document.addEventListener('keydown', function(event) {
    // Prevent F12 key
    if(event.keyCode === 123) {
        event.preventDefault();
        return false;
    }
    
    // Prevent Ctrl+Shift+I (Chrome/Firefox/Edge)
    if(event.ctrlKey && event.shiftKey && event.keyCode === 73) {
        event.preventDefault();
        return false;
    }
    
    // Prevent Ctrl+Shift+J (Chrome/Edge)
    if(event.ctrlKey && event.shiftKey && event.keyCode === 74) {
        event.preventDefault();
        return false;
    }
    
    // Prevent Ctrl+Shift+C (Chrome/Edge)
    if(event.ctrlKey && event.shiftKey && event.keyCode === 67) {
        event.preventDefault();
        return false;
    }

    // Prevent Ctrl+U (View source)
    if(event.ctrlKey && event.keyCode === 85) {
        event.preventDefault();
        return false;
    }
});

// Prevent right click
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    return false;
});
