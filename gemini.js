const _f=window.fetch;
window.fetch=async(u,o)=>{
 if(String(u).includes('api.anthropic.com')&&!String(o.headers['x-api-key']).startsWith('sk-ant')){
  const b=JSON.parse(o.body),k=o.headers['x-api-key'];
  const r=await _f('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':k},body:JSON.stringify({systemInstruction:{parts:[{text:b.system}]},contents:b.messages.map(m=>({role:m.role=='assistant'?'model':'user',parts:[{text:m.content||'ok'}]})),generationConfig:{maxOutputTokens:800,responseMimeType:'application/json'}})});
  const j=await r.json();
  if(j.error)return new Response(JSON.stringify({error:{message:j.error.message}}));
  const t=(((j.candidates||[{}])[0]||{}).content||{parts:[{}]}).parts[0].text||'';
  return new Response(JSON.stringify({content:[{text:t}]}));
 }
 return _f(u,o);
};
const _f=window.fetch;
window.fetch=async(u,o)=>{
 if(String(u).includes('api.anthropic.com')&&!String(o.headers['x-api-key']).startsWith('sk-ant')){
  const b=JSON.parse(o.body),k=o.headers['x-api-key'];
  const r=await _f('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':k},body:JSON.stringify({systemInstruction:{parts:[{text:b.system}]},contents:b.messages.map(m=>({role:m.role=='assistant'?'model':'user',parts:[{text:m.content||'ok'}]})),generationConfig:{maxOutputTokens:800,responseMimeType:'application/json'}})});
  const j=await r.json();
  if(j.error)return new Response(JSON.stringify({error:{message:j.error.message}}));
  const t=(((j.candidates||[{}])[0]||{}).content||{parts:[{}]}).parts[0].text||'';
  return new Response(JSON.stringify({content:[{text:t}]}));
 }
 return _f(u,o);
};
