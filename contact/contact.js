function initContactCute(){
  const form=document.getElementById('contactForm');
  if(!form) return;
  const btn=form.querySelector('.cute-btn');
  const show=(cls,msg)=>{const d=document.createElement('div');d.className=cls;d.textContent=msg;form.appendChild(d);setTimeout(()=>d.remove(),4500)};

  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    btn.disabled=true;const name=form.name.value.trim();const message=form.message.value.trim();
    if(!name||!message){show('error','Please fill everything');btn.disabled=false;return;}
    const payload={
      content:"<@1161104305080762449>",
      embeds:[{
        title:"💌 New Cute Message",
        color:0xFFC0D9,
        fields:[
          {name:"👤 From",value:name,inline:true},
          {name:"📝 Message",value:message}
        ],
        footer:{text:"Sent from phawse.lol Contact Form"}
      }]
    };
    try{
      const WEBHOOK_URL='https://discord.com/api/webhooks/1415402565197107333/okWqkhR_yaJm_PZRbT3zyoGXTXflMjmfLUAZnOIs6wd9kade8hW5LO7D_2hkLIzcxTgI';
      const res=await fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error('send failed');
      form.reset();
      show('success','Message sent! ✨');
    }catch(err){
      console.error(err);
      show('error','Could not send. Try again.');
    }finally{btn.disabled=false}
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initContactCute);
}else{initContactCute();}
