<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>AI Career Mentor — Endee.io Project</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{font-family:'Sora',sans-serif;background:#080c14;color:#e2e8f0;display:flex;flex-direction:column;height:100vh;overflow:hidden}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#2d3748;border-radius:3px}

  .screen{display:none;flex:1;flex-direction:column;overflow:hidden}
  .screen.active{display:flex}

  /* ══ SCREEN 1 — API KEY ══════════════════════════════════════════════ */
  #s-key{align-items:center;justify-content:center;padding:24px}
  .key-card{background:#0f1623;border:1px solid #1e2d45;border-radius:20px;padding:44px 36px;max-width:440px;width:100%;text-align:center}
  .key-card .icon{font-size:54px;margin-bottom:16px}
  .key-card h1{font-size:26px;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .key-card p{color:#64748b;font-size:13px;line-height:1.6;margin-bottom:28px}
  .key-card input{width:100%;padding:14px 16px;background:#0a1220;border:2px solid #1e2d45;border-radius:12px;color:#e2e8f0;font-size:13px;font-family:inherit;margin-bottom:14px;transition:border-color .2s}
  .key-card input:focus{outline:none;border-color:#38bdf8}
  .key-card .note{font-size:11px;color:#475569;margin-top:14px}
  .key-card .note a{color:#38bdf8;text-decoration:none}

  /* ══ SCREEN 2 — PASTE DOCUMENTS ═════════════════════════════════════ */
  #s-paste{background:#080c14}
  .paste-top{padding:18px 28px 12px;flex-shrink:0;text-align:center;border-bottom:1px solid #0d1a2e}
  .paste-top h2{font-size:20px;font-weight:800;margin-bottom:3px}
  .paste-top p{color:#475569;font-size:12px}

  .tabs{display:flex;gap:8px;padding:14px 28px 0;flex-shrink:0}
  .tab{flex:1;padding:11px;text-align:center;font-size:13px;font-weight:700;color:#475569;border-radius:10px;cursor:pointer;border:2px solid #1e2d45;background:transparent;font-family:inherit;transition:all .2s;position:relative}
  .tab.active{border-color:#38bdf8;color:#38bdf8;background:rgba(56,189,248,.08)}
  .tab .tick{display:none;position:absolute;top:-7px;right:-7px;background:#22c55e;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;line-height:18px}
  .tab.done .tick{display:block}
  .tab.done{border-color:#22c55e40;color:#22c55e}

  .doc-panels{flex:1;padding:12px 28px 0;min-height:0;display:flex;flex-direction:column}
  .doc-panel{display:none;flex:1;flex-direction:column;min-height:0}
  .doc-panel.active{display:flex}
  .doc-label{font-size:11px;font-weight:700;letter-spacing:.08em;color:#475569;margin-bottom:8px;text-transform:uppercase;display:flex;justify-content:space-between}
  .char-ct{font-weight:400;color:#2a3a55}
  textarea.doc{flex:1;width:100%;background:#0c1525;border:2px solid #1e2d45;border-radius:14px;padding:18px;color:#e2e8f0;font-size:14px;font-family:inherit;resize:none;line-height:1.8;transition:border-color .2s}
  textarea.doc:focus{outline:none;border-color:#38bdf8}
  textarea.doc::placeholder{color:#1e3050;line-height:2.2}

  .paste-bottom{padding:12px 28px 20px;flex-shrink:0}
  .status-row{display:flex;gap:10px;margin-bottom:12px}
  .pill{flex:1;padding:9px;border-radius:10px;font-size:12px;font-weight:600;text-align:center;border:1px solid #1e2d45;color:#2a3a55;background:#0c1525;transition:all .2s}
  .pill.ok{border-color:#22c55e50;color:#22c55e;background:rgba(34,197,94,.06)}
  .err-box{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:12px;color:#fca5a5;font-size:13px;margin-bottom:12px;display:none}
  .prog-box{background:rgba(56,189,248,.07);border:1px solid rgba(56,189,248,.2);border-radius:10px;padding:12px;color:#38bdf8;font-size:13px;text-align:center;margin-bottom:12px;display:none}

  /* ══ BUTTONS ════════════════════════════════════════════════════════ */
  .btn{width:100%;padding:14px;border:none;border-radius:12px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s}
  .btn-primary{background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff}
  .btn-primary:disabled{background:#111e30;color:#2a3a55;cursor:not-allowed}
  .btn-sm{width:auto;padding:8px 16px;font-size:12px;background:transparent;border:1px solid #1e2d45;color:#475569;border-radius:8px;cursor:pointer;font-family:inherit;transition:all .2s}
  .btn-sm:hover{border-color:#38bdf8;color:#38bdf8}

  /* ══ SCREEN 3 — CHAT ════════════════════════════════════════════════ */
  #s-chat{background:#080c14}
  .chat-header{padding:13px 24px;border-bottom:1px solid #0d1a2e;display:flex;align-items:center;gap:12px;background:#0a1220;flex-shrink:0}
  .avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#818cf8);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .chat-title{font-weight:700;font-size:15px}
  .chat-sub{font-size:11px;color:#475569}

  .messages{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:14px;max-width:800px;width:100%;margin:0 auto}
  .msg{display:flex;gap:10px;align-items:flex-end}
  .msg.user{flex-direction:row-reverse}
  .bubble{max-width:76%;padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.75;white-space:pre-wrap}
  .msg.bot .bubble{background:#0f1623;border:1px solid #1e2d45;border-radius:18px 18px 18px 4px}
  .msg.user .bubble{background:linear-gradient(135deg,#0369a1,#4338ca);color:#fff;border-radius:18px 18px 4px 18px}
  .tw{display:flex;gap:5px;align-items:center;padding:14px 18px}
  .dot{width:7px;height:7px;border-radius:50%;background:#38bdf8;animation:pu 1.2s ease-in-out infinite}
  .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
  @keyframes pu{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}

  .suggestions{padding:6px 24px 8px;max-width:800px;width:100%;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px;flex-shrink:0}
  .sug{padding:7px 14px;background:rgba(56,189,248,.05);border:1px solid #1e2d45;border-radius:100px;color:#94a3b8;font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s}
  .sug:hover{background:rgba(56,189,248,.14);border-color:#38bdf8;color:#38bdf8}

  .input-row{padding:10px 24px 20px;max-width:800px;width:100%;margin:0 auto;display:flex;gap:10px;align-items:flex-end;flex-shrink:0}
  #msg-input{flex:1;background:#0f1623;border:2px solid #1e2d45;border-radius:12px;padding:12px 16px;color:#e2e8f0;font-size:14px;font-family:inherit;resize:none;line-height:1.5;transition:border-color .2s;max-height:120px}
  #msg-input:focus{outline:none;border-color:#38bdf8}
  #send-btn{padding:12px 18px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border:none;border-radius:12px;color:#fff;font-size:20px;cursor:pointer;flex-shrink:0}
  #send-btn:disabled{opacity:.35;cursor:not-allowed}
</style>
</head>
<body>

<!-- ══ SCREEN 1: API KEY ════════════════════════════════════════════════════ -->
<div id="s-key" class="screen active">
  <div class="key-card">
    <div class="icon">🎯</div>
    <h1>AI Career Mentor</h1>
    <p>Get personalized career advice based on your actual resume and target job — powered by Claude AI.</p>
    <input type="password" id="api-key-input" placeholder="Paste your Anthropic API key (sk-ant-...)" />
    <button class="btn btn-primary" onclick="setKey()">Get Started →</button>
    <p class="note">Free key at <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a> · stays in your browser only</p>
  </div>
</div>

<!-- ══ SCREEN 2: PASTE DOCUMENTS ═══════════════════════════════════════════ -->
<div id="s-paste" class="screen">
  <div class="paste-top">
    <h2>📄 Paste Your Documents</h2>
    <p>Use the tabs below — paste resume in tab 1, job description in tab 2, then click Analyze</p>
  </div>

  <div class="tabs">
    <button class="tab active" id="tab-resume" onclick="switchTab('resume')">
      📄 Your Resume
      <span class="tick">✓</span>
    </button>
    <button class="tab" id="tab-jd" onclick="switchTab('jd')">
      💼 Job Description
      <span class="tick">✓</span>
    </button>
  </div>

  <div class="doc-panels">
    <div class="doc-panel active" id="panel-resume">
      <div class="doc-label">
        <span>YOUR FULL RESUME — paste everything</span>
        <span class="char-ct" id="resume-ct">0 chars</span>
      </div>
      <textarea class="doc" id="resume-txt" oninput="onInput('resume')"
        placeholder="Paste your complete resume here...

• Name & contact info
• Technical skills & technologies
• Work experience & projects
• Education & certifications

The more you paste, the better the advice."></textarea>
    </div>
    <div class="doc-panel" id="panel-jd">
      <div class="doc-label">
        <span>JOB DESCRIPTION — paste the full posting</span>
        <span class="char-ct" id="jd-ct">0 chars</span>
      </div>
      <textarea class="doc" id="jd-txt" oninput="onInput('jd')"
        placeholder="Paste the full job description here...

• Job title & company name
• Required skills & technologies
• Responsibilities
• Qualifications & nice-to-haves

Copy directly from LinkedIn, Indeed, etc."></textarea>
    </div>
  </div>

  <div class="paste-bottom">
    <div class="status-row">
      <div class="pill" id="pill-resume">📄 Resume — not pasted yet</div>
      <div class="pill" id="pill-jd">💼 Job Description — not pasted yet</div>
    </div>
    <div class="err-box" id="paste-err"></div>
    <div class="prog-box" id="paste-prog"></div>
    <button class="btn btn-primary" id="analyze-btn" onclick="analyze()">🚀 Analyze & Start Chat</button>
  </div>
</div>

<!-- ══ SCREEN 3: CHAT ═══════════════════════════════════════════════════════ -->
<div id="s-chat" class="screen">
  <div class="chat-header">
    <div class="avatar">🎯</div>
    <div>
      <div class="chat-title">AI Career Mentor</div>
      <div class="chat-sub" id="chat-sub">Ready</div>
    </div>
    <button class="btn-sm" onclick="restart()" style="margin-left:auto">↩ New Session</button>
  </div>

  <div class="messages" id="messages"></div>

  <div class="suggestions" id="suggestions">
    <button class="sug" onclick="ask(this.textContent)">What skills am I missing?</button>
    <button class="sug" onclick="ask(this.textContent)">How do I tailor my resume?</button>
    <button class="sug" onclick="ask(this.textContent)">What are my strongest points?</button>
    <button class="sug" onclick="ask(this.textContent)">How do I prep for the interview?</button>
    <button class="sug" onclick="ask(this.textContent)">What salary should I ask for?</button>
    <button class="sug" onclick="ask(this.textContent)">What gaps exist in my profile?</button>
  </div>

  <div class="input-row">
    <textarea id="msg-input" rows="1" placeholder="Ask anything about your career fit..."></textarea>
    <button id="send-btn" onclick="sendMsg()">↑</button>
  </div>
</div>

<script>
let API_KEY='', vectors=[], isLoading=false;

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}

// Step 1
function setKey(){const k=document.getElementById('api-key-input').value.trim();if(!k){alert('Please paste your API key.');return;}API_KEY=k;show('s-paste');}
document.getElementById('api-key-input').addEventListener('keydown',e=>{if(e.key==='Enter')setKey();});

// Step 2 — tabs
function switchTab(w){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.doc-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+w).classList.add('active');
  document.getElementById('panel-'+w).classList.add('active');
}

function onInput(w){
  const val=document.getElementById(w==='resume'?'resume-txt':'jd-txt').value.trim();
  const ct=document.getElementById(w==='resume'?'resume-ct':'jd-ct');
  const pill=document.getElementById('pill-'+w);
  const tab=document.getElementById('tab-'+w);
  ct.textContent=val.length.toLocaleString()+' chars';
  if(val.length>80){
    pill.classList.add('ok'); pill.textContent=(w==='resume'?'📄 Resume':'💼 Job Description')+' ✓ pasted';
    tab.classList.add('done');
  } else {
    pill.classList.remove('ok'); pill.textContent=(w==='resume'?'📄 Resume':'💼 Job Description')+' — not pasted yet';
    tab.classList.remove('done');
  }
}

// Chunking + vector search
function chunkText(text,type){const words=text.replace(/\s+/g,' ').trim().split(' ');const r=[];for(let i=0;i<words.length;i+=400)r.push({text:words.slice(i,i+400).join(' '),type});return r;}
function makeVec(text){const f={};text.toLowerCase().split(/\W+/).forEach(w=>{if(w.length>2)f[w]=(f[w]||0)+1;});return f;}
function cosim(a,b){const keys=new Set([...Object.keys(a),...Object.keys(b)]);let d=0,na=0,nb=0;keys.forEach(k=>{const av=a[k]||0,bv=b[k]||0;d+=av*bv;na+=av*av;nb+=bv*bv;});return d/(Math.sqrt(na)*Math.sqrt(nb)+1e-10);}
function search(q,k=6){const qv=makeVec(q);return vectors.map(v=>({...v,score:cosim(qv,v.vec)})).sort((a,b)=>b.score-a.score).slice(0,k);}

async function analyze(){
  const r=document.getElementById('resume-txt').value.trim();
  const j=document.getElementById('jd-txt').value.trim();
  const err=document.getElementById('paste-err');
  const prog=document.getElementById('paste-prog');
  err.style.display='none';
  if(!r){err.textContent='⚠️ Please paste your resume in the Resume tab.';err.style.display='block';switchTab('resume');return;}
  if(!j){err.textContent='⚠️ Please paste the job description in the Job Description tab.';err.style.display='block';switchTab('jd');return;}
  document.getElementById('analyze-btn').disabled=true;
  prog.textContent='⚙️ Indexing your documents...'; prog.style.display='block';
  await new Promise(res=>setTimeout(res,80));
  const chunks=[...chunkText(r,'resume'),...chunkText(j,'job')];
  vectors=chunks.map(c=>({...c,vec:makeVec(c.text)}));
  prog.style.display='none';
  document.getElementById('analyze-btn').disabled=false;
  document.getElementById('chat-sub').textContent=`${vectors.length} chunks indexed · ready`;
  show('s-chat');
  addMsg('bot',`✨ Done! I've analyzed your resume and the job description (${vectors.length} text chunks indexed).\n\nAsk me anything — I'll give you personalized, specific advice based on your actual documents.`);
}

// Chat
function addMsg(role,text){
  const msgs=document.getElementById('messages');
  const div=document.createElement('div');
  div.className='msg '+(role==='user'?'user':'bot');
  div.innerHTML=role==='bot'
    ?`<div class="avatar" style="width:32px;height:32px;font-size:15px;flex-shrink:0">🎯</div><div class="bubble">${esc(text)}</div>`
    :`<div class="bubble">${esc(text)}</div>`;
  msgs.appendChild(div); msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){const msgs=document.getElementById('messages');const div=document.createElement('div');div.className='msg bot';div.id='ti';div.innerHTML=`<div class="avatar" style="width:32px;height:32px;font-size:15px;flex-shrink:0">🎯</div><div class="bubble"><div class="tw"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;}
function removeTyping(){document.getElementById('ti')?.remove();}
function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}

async function ask(q){if(isLoading)return;document.getElementById('suggestions').style.display='none';await sendQ(q);}
async function sendMsg(){const inp=document.getElementById('msg-input');const q=inp.value.trim();if(!q||isLoading)return;inp.value='';inp.style.height='';document.getElementById('suggestions').style.display='none';await sendQ(q);}

async function sendQ(question){
  isLoading=true; document.getElementById('send-btn').disabled=true;
  addMsg('user',question); showTyping();
  const top=search(question,6);
  const rp=top.filter(c=>c.type==='resume').map(c=>c.text);
  const jp=top.filter(c=>c.type==='job').map(c=>c.text);
  const ctx=[rp.length?'=== FROM RESUME ===\n'+rp.join('\n\n'):'',jp.length?'=== FROM JOB DESCRIPTION ===\n'+jp.join('\n\n'):''].filter(Boolean).join('\n\n');
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',max_tokens:1000,
        system:`You are an expert AI Career Mentor for software developers. You have the user's resume and target job description as context. Give HIGHLY PERSONALIZED, SPECIFIC, ACTIONABLE advice — mention actual skills and technologies from their documents. Identify gaps honestly. Be encouraging and concrete. Use clear formatting.`,
        messages:[{role:'user',content:`CONTEXT:\n${ctx}\n\n---\nQUESTION: ${question}`}]
      })
    });
    const data=await res.json(); removeTyping();
    if(data.error)throw new Error(data.error.message);
    addMsg('bot',data.content[0].text);
  }catch(e){removeTyping();addMsg('bot','⚠️ Error: '+e.message+'\n\nDouble-check your API key and try again.');}
  isLoading=false; document.getElementById('send-btn').disabled=false;
}

document.getElementById('msg-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}});
document.getElementById('msg-input').addEventListener('input',function(){this.style.height='';this.style.height=Math.min(this.scrollHeight,120)+'px';});

function restart(){
  vectors=[];
  ['resume-txt','jd-txt'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('messages').innerHTML='';
  document.getElementById('suggestions').style.display='flex';
  ['resume','jd'].forEach(w=>{
    document.getElementById('pill-'+w).classList.remove('ok');
    document.getElementById('tab-'+w).classList.remove('done');
    document.getElementById(w==='resume'?'resume-ct':'jd-ct').textContent='0 chars';
    document.getElementById('pill-'+w).textContent=(w==='resume'?'📄 Resume':'💼 Job Description')+' — not pasted yet';
  });
  switchTab('resume'); show('s-paste');
}
</script>
</body>
</html>
