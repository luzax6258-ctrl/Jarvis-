const $=id=>document.getElementById(id),LS=k=>{try{return localStorage.getItem(k)||''}catch(e){return ''}},SV=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const 'gemini-3.5-flash-lite',MALE=/felipe|eddy|reed|rocko|grandpa|daniel|oliver|arthur|aaron|fred|alex|ralph/i;
const S={name:LS('jarvis_name'),key:LS('jarvis_key'),voice:LS('jv_voice'),rate:+LS('jv_rate')||.92,pitch:+LS('jv_pitch')||.8,wake:LS('jv_wake')==='1'};
let voices=[],hist=[],busy=0,listening=0,speaking=0,on=0,rec=null,stream=null,facing='environment',last='',au=null,wl=null;
const setS=(s,t)=>{document.body.dataset.s=s;$('st').textContent=t||({idle:'PRONTO',listening:'ESCUTANDO',thinking:'PENSANDO',speaking:'FALANDO',error:'ERRO'})[s]};
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const out=t=>{const e=$('out');e.textContent=t;e.classList.remove('f');void e.offsetWidth;e.classList.add('f')};
const tick=()=>{const d=new Date();$('time').textContent=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});$('date').textContent=d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})};setInterval(tick,1000);tick();
const cur=()=>{const p=voices.filter(v=>/^pt/i.test(v.lang));return voices.find(v=>v.voiceURI===S.voice)||p.find(v=>/felipe/i.test(v.name))||p.find(v=>MALE.test(v.name))||p[0]||voices[0]};
function loadVoices(){const ss=window.speechSynthesis;if(!ss)return;const rk=v=>(/^pt/i.test(v.lang)?0:/^en.gb/i.test(v.lang)?2:/^en/i.test(v.lang)?3:4)*2+(MALE.test(v.name)?0:1);
 voices=ss.getVoices().slice().sort((a,b)=>rk(a)-rk(b)||a.name.localeCompare(b.name));
 $('vsel').innerHTML=voices.map(v=>`<option value="${v.voiceURI}">${MALE.test(v.name)?'♂ ':''}${v.name} · ${v.lang}</option>`).join('');const c=cur();if(c)$('vsel').value=c.voiceURI}
if(window.speechSynthesis){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;setTimeout(loadVoices,600);setTimeout(loadVoices,1800)}
function wav(){const n=4000,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,16000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
const pb=()=>{try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}};
const lock=async()=>{try{wl=await navigator.wakeLock.request('screen')}catch(e){}};
const unlock=()=>{pb();if(!au){au=new Audio(wav());au.loop=true;au.play().catch(()=>{})}const ss=window.speechSynthesis;if(ss){ss.resume();const u=new SpeechSynthesisUtterance(' ');u.volume=0;ss.speak(u)}};
function speak(t,retry){return new Promise(res=>{const ss=window.speechSynthesis;if(!ss)return res(0);pb();if(rec)try{rec.abort()}catch(e){}listening=0;speaking=1;ss.cancel();
 setTimeout(()=>{ss.resume();const u=new SpeechSynthesisUtterance(t.replace(/[*#`_]/g,'')),v=retry?null:cur();if(v){u.voice=v;u.lang=v.lang}else u.lang='pt-BR';u.rate=S.rate;u.pitch=S.pitch;
  let d=0,st=0,tm,w;const f=()=>{if(d)return;d=1;clearTimeout(tm);clearTimeout(w);speaking=0;res(st)};
  u.onstart=()=>{st=1;setS('speaking')};u.onend=f;
  u.onerror=e=>{if(retry||/cancel|interrupt/.test(e.error))return f();d=1;clearTimeout(tm);clearTimeout(w);speak(t,1).then(res)};
  tm=setTimeout(f,t.length*110+6000);w=setTimeout(()=>{if(!retry&&!st&&!d){d=1;clearTimeout(tm);ss.cancel();speak(t,1).then(res)}},3000);ss.speak(u)},150)})}
const after=()=>{if(on&&!busy&&!speaking)setTimeout(listen,400)};
async function say(t,err){out(t);setS(err?'error':'speaking');const ok=await speak(t);setS('idle');if(!ok)$('st').textContent='SEM SOM · TIRE DO SILENCIOSO';after()}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function listen(){if(!on||!SR||listening||busy||speaking||document.hidden)return;rec=new SR();rec.lang='pt-BR';rec.interimResults=true;let fin='';
 rec.onstart=()=>{listening=1;setS('listening')};
 rec.onresult=e=>{fin=[...e.results].map(r=>r[0].transcript).join('');$('me').textContent=fin};
 rec.onerror=e=>{if(/not-allowed|service-not-allowed/.test(e.error)){on=0;$('bmic').classList.remove('on');$('go').textContent='Toque para reativar';$('splash').classList.add('on')}};
 rec.onend=()=>{listening=0;if(fin)heard(fin);else{if(document.body.dataset.s==='listening')setS('idle');after()}};
 try{rec.start()}catch(e){setTimeout(after,1000)}}
function heard(t){if(S.wake){const m=norm(t).match(/jarvis|jarbas|ja vis|java is/);if(!m){$('me').textContent='';return after()}t=t.slice(m.index+m[0].length).replace(/^[\s,.!?]+/,'');if(!t)return say('Pois não?')}handle(t)}
async function handle(t){t=(t||'').trim();if(!t||busy)return;$('me').textContent='“'+t+'”';$('txt').value='';busy=1;try{await route(t)}catch(e){await say('Houve uma falha. Tente novamente.',1)}busy=0;after()}
const APPS={whatsapp:'whatsapp://',instagram:'instagram://',youtube:'youtube://',spotify:'spotify://',mapas:'maps://',musica:'music://',fotos:'photos-redirect://',calendario:'calshow://',notas:'mobilenotes://',mensagens:'sms:',telefone:'tel:',facetime:'facetime://',email:'message://',telegram:'tg://',netflix:'nflx://',uber:'uber://',waze:'waze://',tiktok:'snssdk1233://'};
async function route(text){const q=norm(text),d=new Date();let m;
 if(/que horas|horas sao/.test(q))return say(`São ${d.getHours()} horas e ${d.getMinutes()} minutos.`);
 if(/que dia (e )?hoje|qual a data/.test(q))return say('Hoje é '+d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})+'.');
 if(/o que voce (ta |esta )?(ve|vendo)|que (voce )?(ta|esta) vendo|analis[ae] (a )?(imagem|foto)/.test(q)){await say('Ativando visão.');return openCam(1)}
 if(/(abr[ae]|abrir|ligar|liga|ativ[ae]r?) (a |minha )?camera|tir[ae]r? (uma )?foto/.test(q)){await say('Abrindo a câmera.');return openCam()}
 const app=Object.keys(APPS).find(k=>q.includes(k));
 if(app&&/\b(abr[ae]|abrir|abra|ir para|va para)\b/.test(q)){await say('Abrindo '+app+'.');location.href=APPS[app];return}
 if(m=q.match(/(?:pesquis[ae]r?|procur[ae]r?|busc[ae]r?)(?: por| sobre)? (.+)/)){await say('Pesquisando.');location.href='https://www.google.com/search?q='+encodeURIComponent(m[1]);return}
 if(m=q.match(/(?:me leve|navegar|rota|ir) (?:para|ate|pra) (.+)/)){await say('Traçando a rota.');location.href='maps://?daddr='+encodeURIComponent(m[1]);return}
 if(/lanterna|volume|brilho|nao perturbe|modo aviao|bluetooth/.test(q)&&/(lig|deslig|aument|diminu|ativ|desativ|abaix|suba|coloc)/.test(q))return say('O iOS não permite que uma página web controle isso. Só é possível por um Atalho do iPhone.',1);
 setS('thinking');return say(await ask(text))}
async function ask(q,img){if(!S.key)return 'Minha inteligência ainda não foi configurada. Abra os ajustes e cole sua chave Gemini.';
 const l=((cur()||{}).lang||'pt-BR').slice(0,2),lang=l==='en'?'inglês britânico, chamando o usuário de "sir"':l==='es'?'espanhol':'português do Brasil';
 const sys=`Você é o J.A.R.V.I.S., assistente pessoal futurista: elegante, educado, calmo, inteligente e levemente bem-humorado. Responda sempre em ${lang}, em 1 a 3 frases curtas, sem markdown, sem listas e sem emojis, pois sua resposta será falada em voz alta. Nome do usuário: ${S.name||'senhor'}. Agora: ${new Date().toLocaleString('pt-BR')}. Você não controla o celular além de abrir apps e a câmera: nunca diga que fez algo que não fez. Não finja ser o personagem de nenhum filme.`;
 const parts=[{text:q}];if(img)parts.push({inline_data:{mime_type:'image/jpeg',data:img}});
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(S.key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:[...hist.slice(-8),{role:'user',parts}],generationConfig:{temperature:.7,maxOutputTokens:400}})});
 const j=await r.json();
 if(!r.ok)return r.status===429?'Muitas perguntas seguidas. Espere um minuto e tente de novo.':'Erro da inteligência: '+((j.error||{}).message||r.status);
 const a=(((j.candidates||[{}])[0]||{}).content||{parts:[]}).parts.map(p=>p.text||'').join('').trim();
 if(!a)return 'Não obtive resposta. Tente reformular.';
 hist.push({role:'user',parts:[{text:q}]},{role:'model',parts:[{text:a}]});return a}
const stopCam=()=>{if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}};
async function openCam(auto){if(rec)try{rec.abort()}catch(e){}$('camov').classList.add('on');$('shot').hidden=true;$('vid').hidden=false;last='';$('chint').textContent='👁 faz o JARVIS descrever o que vê';stopCam();
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing},audio:false});$('vid').srcObject=stream;if(auto)setTimeout(analyze,1800)}
 catch(e){$('chint').textContent='Sem câmera ao vivo. Toque em 📱 para usar a câmera do iPhone.'}}
const closeCam=()=>{stopCam();$('camov').classList.remove('on');after()};
function grab(s,w,h){const c=document.createElement('canvas'),k=Math.min(1,768/Math.max(w,h));c.width=w*k;c.height=h*k;c.getContext('2d').drawImage(s,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.8)}
function snap(){const v=$('vid');if(v.hidden||!v.videoWidth)return 0;const u=grab(v,v.videoWidth,v.videoHeight);$('shot').src=u;$('shot').hidden=false;v.hidden=true;last=u.split(',')[1];$('chint').textContent='Segure a foto para salvar nas Fotos.';return 1}
async function analyze(){if(!$('vid').hidden&&!snap())return;if(!last)return;const img=last;closeCam();busy=1;setS('thinking');
 try{await say(await ask('Descreva brevemente o que você vê nesta imagem.',img))}catch(e){await say('Não consegui analisar a imagem.',1)}busy=0;after()}
$('bcam').onclick=()=>{unlock();openCam()};$('cclose').onclick=closeCam;$('csnap').onclick=snap;$('cai').onclick=analyze;
$('cflip').onclick=()=>{facing=facing==='environment'?'user':'environment';openCam()};
$('file').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const u=grab(im,im.width,im.height);$('shot').src=u;$('shot').hidden=false;$('vid').hidden=true;stopCam();last=u.split(',')[1];$('chint').textContent='Toque em 👁 para analisar.';URL.revokeObjectURL(im.src)};im.src=URL.createObjectURL(f)};
$('go').onclick=async()=>{unlock();on=1;lock();$('bmic').classList.add('on');$('splash').classList.remove('on');const h=new Date().getHours();
 await say(`${h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'}${S.name?', '+S.name:''}. Estou ouvindo.`)};
$('bmic').onclick=()=>{unlock();on=on?0:1;$('bmic').classList.toggle('on',!!on);if(on){lock();listen()}else{if(rec)try{rec.abort()}catch(e){}setS('idle')}};
$('txt').addEventListener('keydown',e=>{if(e.key==='Enter'){unlock();handle($('txt').value)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){listening=0;if(rec)try{rec.abort()}catch(e){}}else if(on){lock();if(au)au.play().catch(()=>{});setTimeout(listen,700)}});
$('bset').onclick=()=>{unlock();$('name').value=S.name;$('key').value=S.key;$('rate').value=S.rate;$('pitch').value=S.pitch;$('wake').checked=S.wake;loadVoices();$('ov').classList.add('on')};
$('sclose').onclick=()=>{$('ov').classList.remove('on');after()};
async function test(){unlock();S.voice=$('vsel').value;S.rate=+$('rate').value;S.pitch=+$('pitch').value;const v=voices.find(x=>x.voiceURI===S.voice)||{},en=/^en/i.test(v.lang||''),n=$('name').value||(en?'sir':'senhor'),b=$('vtest');b.textContent='🔊 Falando…';
 const ok=await speak(en?`Good evening, ${n}. All systems online.`:`Boa noite, ${n}. Sistemas online. Estou pronto.`);b.textContent=ok?'🔊 Testar voz':'⚠️ Sem som: tire do silencioso'}
$('vtest').onclick=test;
$('gb').onclick=()=>{const v=voices.find(x=>/^en.gb/i.test(x.lang)&&MALE.test(x.name))||voices.find(x=>/^en.gb/i.test(x.lang));if(v){$('vsel').value=v.voiceURI;$('rate').value=.9;$('pitch').value=.85;test()}};
$('save').onclick=()=>{S.name=$('name').value.trim();S.key=$('key').value.trim();S.voice=$('vsel').value;S.rate=+$('rate').value;S.pitch=+$('pitch').value;S.wake=$('wake').checked;
 SV('jarvis_name',S.name);SV('jarvis_key',S.key);SV('jv_voice',S.voice);SV('jv_rate',S.rate);SV('jv_pitch',S.pitch);SV('jv_wake',S.wake?'1':'0');$('ov').classList.remove('on');say('Configurações salvas.')};
if(!S.key)out('Abra ••• e cole sua chave Gemini para começar.');
const cv=$('wv'),g=cv.getContext('2d');let ph=0,amp=0;
(function draw(){const W=cv.width=cv.clientWidth*2,H=cv.height=cv.clientHeight*2,t={idle:.07,listening:.4,thinking:.2,speaking:.75,error:.1}[document.body.dataset.s]||.1;amp+=(t-amp)*.08;ph+=.04+amp*.12;
 g.clearRect(0,0,W,H);const n=46,gp=W/n,gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#7be0ff');gr.addColorStop(1,'#b69cff');g.fillStyle=gr;
 for(let i=0;i<n;i++){const e=Math.sin(i/(n-1)*Math.PI),h=3+e*(4+(Math.sin(i*.55+ph)*.5+.5)*(Math.sin(i*.21-ph*1.3)*.5+.5)*amp*H*.95);g.beginPath();g.rect(i*gp+gp*.3,H/2-h/2,gp*.4,h);g.fill()}
 requestAnimationFrame(draw)})();
