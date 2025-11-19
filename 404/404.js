// cute sparkle on load
document.addEventListener('DOMContentLoaded',()=>{
  const text=document.querySelector('.redirect-text');
  if(!text) return;
  let dots=0;setInterval(()=>{dots=(dots+1)%4;text.textContent=`redirecting you back home in 3 seconds${'.'.repeat(dots)}`;},500);
});
