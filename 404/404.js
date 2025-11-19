// Visible countdown to redirect
(function(){
    const display = document.getElementById('count');
    let seconds = parseInt(display?.textContent || '5', 10);
    const tick = () => {
        seconds -= 1;
        if (display) display.textContent = String(seconds);
        if (seconds <= 0) {
            window.location.href = '/';
            return;
        }
    };
    setInterval(tick, 1000);
})();
