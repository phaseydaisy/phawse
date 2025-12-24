document.addEventListener('DOMContentLoaded', ()=>{
  const fileInput = document.getElementById('fileInput');
  const chooseBtn = document.getElementById('chooseBtn');
  const dropZone = document.getElementById('dropZone');
  const progressContainer = document.getElementById('progressContainer');
  const progressEl = document.getElementById('uploadProgress');
  const progressText = document.getElementById('progressText');
  const cancelBtn = document.getElementById('cancelBtn');
  const result = document.getElementById('result');

  const MAX_BYTES = 5 * 1024 * 1024 * 1024;
  let currentXhr = null;

  function formatMB(bytes, dp = 1){ return `${(bytes / (1024*1024)).toFixed(dp)} MB`; }

  chooseBtn.addEventListener('click', ()=> fileInput.click());

  ['dragenter','dragover'].forEach(ev => {
    dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  });
  ['dragleave','drop'].forEach(ev => {
    dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
  });

  dropZone.addEventListener('drop', e => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFile(f);
  });

  fileInput.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  });

  cancelBtn.addEventListener('click', ()=>{
    if (currentXhr) {
      currentXhr.abort();
      currentXhr = null;
      progressContainer.style.display = 'none';
      progressEl.value = 0;
      progressText.textContent = 'Cancelled';
    }
  });

  function resetResult(){
    result.innerHTML = '';
  }

  function showError(msg){
    resetResult();
    const d = document.createElement('div');
    d.className = 'upload-meta';
    d.style.color = 'var(--danger)';
    d.textContent = msg;
    result.appendChild(d);
  }

  function handleFile(f){
    resetResult();
    if (!f.type || !f.type.startsWith('video/')){
      showError('Only video files are accepted.');
      return;
    }
    if (f.size && f.size > MAX_BYTES){
      showError('File exceeds maximum size of 5 GB.');
      return;
    }

    const info = document.createElement('div');
    info.className = 'upload-meta';
    info.textContent = `${f.name} · ${formatMB(f.size,2)} · ${f.type || 'n/a'}`;
    result.appendChild(info);

    const vid = document.createElement('video');
    vid.controls = true;
    vid.style.maxWidth = '100%';
    vid.src = URL.createObjectURL(f);
    result.appendChild(vid);
    uploadFile(f);
  }

  async function uploadFile(file){
    progressContainer.style.display = 'block';
    progressEl.value = 0;
    progressText.textContent = 'Requesting upload URL...';

    let signed;
    try {
      const res = await fetch('/upload/api/signed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', size: file.size })
      });
      signed = await res.json();
      if (!res.ok) throw new Error(signed.error || `${res.status}`);
    } catch (err){
      showError('Failed to get signed URL: ' + err.message);
      progressContainer.style.display = 'none';
      return;
    }

    const putUrl = signed.putUrl;
    if (!putUrl){ showError('Invalid signed URL response'); progressContainer.style.display = 'none'; return; }

    progressText.textContent = 'Uploading...';

    const xhr = new XMLHttpRequest();
    currentXhr = xhr;

    xhr.upload.onprogress = (e)=>{
      if (e.lengthComputable){
        const pct = Math.round(e.loaded / e.total * 100);
        progressEl.value = pct;
        const loadedStr = formatMB(e.loaded, 1);
        const totalStr = formatMB(e.total, 1);
        progressText.textContent = `${pct}% (${loadedStr} / ${totalStr})`;
      } else {
        const loadedStr = formatMB(e.loaded, 1);
        progressText.textContent = `${loadedStr}`;
      }
    }; 

    async function fallbackUpload(file){
      progressText.textContent = 'Uploading via proxy...';
      const xhr2 = new XMLHttpRequest();
      currentXhr = xhr2;

      xhr2.upload.onprogress = (e)=>{
        if (e.lengthComputable){
          const pct = Math.round(e.loaded / e.total * 100);
          progressEl.value = pct;
          const loadedStr = formatMB(e.loaded, 1);
          const totalStr = formatMB(e.total, 1);
          progressText.textContent = `${pct}% (${loadedStr} / ${totalStr})`;
        } else {
          const loadedStr = formatMB(e.loaded, 1);
          progressText.textContent = `${loadedStr}`;
        }
      };

      xhr2.onload = async ()=>{
        currentXhr = null;
        if (xhr2.status >= 200 && xhr2.status < 300){
          try {
            const json = JSON.parse(xhr2.responseText);
            if (!json || !json.id) throw new Error('Invalid response');
            showResultLink(json);
          } catch (err){
            showError('Fallback upload failed: ' + (err.message || xhr2.responseText));
          }
        } else {
          showError(`Fallback upload failed: ${xhr2.status} ${xhr2.statusText}`);
        }
        progressContainer.style.display = 'none';
      };

      xhr2.onerror = ()=>{
        currentXhr = null;
        showError('Network error during fallback upload.');
        progressContainer.style.display = 'none';
      };

      const form = new FormData();
      form.append('file', file, file.name);
      xhr2.open('POST', '/upload/api/upload');
      xhr2.send(form);
    }

    xhr.onload = async ()=>{
      currentXhr = null;
      if (xhr.status >= 200 && xhr.status < 300){
        // notify Worker to confirm and finalize
        try {
          const comp = await fetch('/upload/api/complete', {
            method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: signed.id })
          });
          const json = await comp.json();
          if (!comp.ok) throw new Error(json.error || `${comp.status}`);
          showResultLink(json);
        } catch (err){
          showError('Upload succeeded but failed to finalize: ' + err.message);
        }
        progressContainer.style.display = 'none';
      } else {
        await fallbackUpload(file);
      }
    };

    xhr.onerror = ()=>{
      currentXhr = null;
      fallbackUpload(file);
    };

    xhr.open('PUT', putUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  }

  function showResultLink(resp){
    resetResult();
    const base = resp && resp.url ? resp.url : null;
    if (!base){ showError('Unexpected response from server'); return; }

    const id = resp.id;
    const invite = resp.invite;
    const url = invite ? `${base}?invite=${invite}` : base;

    const linkRow = document.createElement('div');
    linkRow.style.display = 'flex';
    linkRow.style.gap = '8px';

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.textContent = url;
    a.style.wordBreak = 'break-all';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-primary';
    copyBtn.textContent = 'Copy link';
    copyBtn.onclick = ()=> navigator.clipboard.writeText(url);

    const openBtn = document.createElement('button');
    openBtn.className = 'btn btn-primary';
    openBtn.textContent = 'Open';
    openBtn.onclick = ()=> window.open(url, '_blank');

    linkRow.appendChild(a);
    linkRow.appendChild(copyBtn);
    linkRow.appendChild(openBtn);

    result.appendChild(linkRow);

    // embed code
    const embed = document.createElement('textarea');
    embed.readOnly = true;
    embed.rows = 3;
    embed.style.width = '100%';
    embed.style.marginTop = '8px';
    embed.textContent = `<video src="${url}" controls width="640"></video>`;
    result.appendChild(embed);
  }
});