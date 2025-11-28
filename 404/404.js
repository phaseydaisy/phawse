document.addEventListener('DOMContentLoaded', () => {
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;
  
  let count = 3;
  
  const interval = setInterval(() => {
    count--;
    countdownElement.textContent = count;
    
    if (count <= 0) {
      clearInterval(interval);
      window.location.href = '../';
    }
  }, 1000);
});
