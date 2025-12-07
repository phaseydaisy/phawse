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
        title:"💌 New Message from phawse.lol",
        description:`You've received a new message from your contact form!`,
        color:0xFFC0D9,
        fields:[
          {name:"👤 Name",value:`\`\`\`${name}\`\`\``,inline:false},
          {name:"💬 Message",value:message,inline:false}
        ],
        footer:{text:"phawse.lol Contact Form"},
        timestamp:new Date().toISOString()
      }]
    };
    
    try{
      const WORKER_URL='https://discord-webhook-proxy.kaidenlorse1.workers.dev/';
      const res=await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
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
