document.addEventListener('DOMContentLoaded', () => {
    const cat = document.getElementById('cat');
    
    cat.addEventListener('click', () => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        heart.style.left = (cat.offsetLeft + cat.offsetWidth/2) + 'px';
        heart.style.top = (cat.offsetTop) + 'px';
        document.body.appendChild(heart);
        
        setTimeout(() => {
            document.body.removeChild(heart);
        }, 1000);

        cat.classList.add('bounce');
        setTimeout(() => {
            cat.classList.remove('bounce');
        }, 500);
    });
});
