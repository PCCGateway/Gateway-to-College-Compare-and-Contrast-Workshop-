(()=>{'use strict';
const cfg=window.CLASSROOM_CONFIG||{},el=id=>document.getElementById(id),s=msg=>{const e=el('cloudStatus');if(e)e.textContent=msg};
if(!cfg.endpoint){s('Online saving not configured yet. Download Workshop Progress (.json) before leaving.');return;}
const idKey='gateway_recovery_record_'+cfg.activityId,tokenKey='gateway_recovery_token_'+cfg.activityId;
let recordId=sessionStorage.getItem(idKey)||'',editToken=sessionStorage.getItem(tokenKey)||'',timer=null,seq=0,savedSeq=0,busy=false;
// Session storage is wiped with the lab session; the instructor retains the durable server copy.
function newToken(){const a=new Uint8Array(32);crypto.getRandomValues(a);return Array.from(a,b=>b.toString(16).padStart(2,'0')).join('')}
function getData(){return typeof data==='function'?data():{}}
async function request(action,payload){const r=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload})});let j;try{j=await r.json()}catch{throw Error('Server returned an unreadable response')}if(!r.ok||!j.ok)throw Error(j.error||'Server error '+r.status);return j}
async function flush(){if(busy)return;if(!navigator.onLine){s('Not saved — offline. Download JSON before leaving.');return;}const d=getData(),name=String(d.student||'').trim();if(!name){s('Enter your name in Step 1 to enable online backup.');return;}busy=true;const current=seq;s('Saving online…');try{if(!editToken)editToken=newToken();const result=await request('save',{recordId,editToken,activityId:cfg.activityId,name,answers:d});recordId=result.recordId;sessionStorage.setItem(idKey,recordId);sessionStorage.setItem(tokenKey,editToken);savedSeq=current;s('Saved online at '+new Date().toLocaleTimeString());}catch(e){s('Not saved online: '+e.message+'. Download your JSON backup.')}finally{busy=false;if(seq>savedSeq){clearTimeout(timer);timer=setTimeout(flush,900)}}}
function changed(){seq++;clearTimeout(timer);timer=setTimeout(flush,1100)}
document.addEventListener('input',e=>{if(e.target.matches('[data-save]'))changed()},true);
document.addEventListener('change',e=>{if(e.target.matches('[data-save]'))changed()},true);
window.addEventListener('online',()=>{if(seq>savedSeq)flush()});
// Instructor-restored JSON should become a NEW online record rather than silently overwrite a previous lab session.
const importButton=el('importBtn');if(importButton)importButton.addEventListener('click',()=>{const file=el('importFile')?.files?.[0];if(file&&file.name.toLowerCase().endsWith('.json')){recordId='';editToken='';sessionStorage.removeItem(idKey);sessionStorage.removeItem(tokenKey);setTimeout(changed,1200)}},true);
window.addEventListener('pagehide',()=>{if(seq>savedSeq&&navigator.sendBeacon){const d=getData();if(recordId&&editToken&&String(d.student||'').trim())navigator.sendBeacon(cfg.endpoint,new Blob([JSON.stringify({action:'save',recordId,editToken,activityId:cfg.activityId,name:d.student,answers:d})],{type:'text/plain'}))}});
s('Online backup ready. Enter your name in Step 1.');
// Do not silently create a record from stale shared-computer localStorage until the student edits a field.
})();