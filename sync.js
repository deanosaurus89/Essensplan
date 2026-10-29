// Synchronisation mit Supabase (REST). Stammdaten (Wochen, Gerichte, Kunden, Anwesenheit) als ein JSON-Datensatz,
// Bestellungen als einzelne Zeilen – so überschreiben sich gleichzeitige Kundenbestellungen nicht.
(function(){
const U=(window.SUPABASE_URL||'').replace(/\/$/,''),K=window.SUPABASE_ANON_KEY;
if(!U||!K)return;window.REMOTE_ON=true;
const H={apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'};
const st=t=>{const e=document.getElementById('syncState');if(e)e.textContent=t};
const oid=o=>[o.weekId,o.cid,o.day,o.itemId].join('|');
const core=()=>JSON.stringify({anbieter:S.anbieter,weeks:S.weeks,items:S.items,customers:S.customers,att:S.att,maCap:S.maCap==null?4.57:S.maCap});
let lastCore=null,lastOrd={},busy=false,timer=null,ready=false,pending=false;
async function api(path,opt={}){const r=await fetch(U+'/rest/v1/'+path,{...opt,headers:{...H,...(opt.headers||{})}});if(!r.ok)throw new Error(r.status+' '+await r.text());return r.status===204?null:r.json().catch(()=>null)}
async function pull(){
 const [stRows,ord]=await Promise.all([api('app_state?id=eq.main&select=data'),api('orders?select=*')]);
 return {core:stRows[0]?.data||null,orders:ord.map(r=>({weekId:r.week_id,cid:r.cid,day:r.day,itemId:r.item_id,qty:r.qty}))};
}
async function push(){
 if(!ready)return;busy=true;st('⏳ speichert…');
 try{
  const c=core();if(c!==lastCore){await api('app_state',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id:'main',data:JSON.parse(c),updated_at:new Date().toISOString()})});lastCore=c}
  const now={};S.orders.forEach(o=>now[oid(o)]=o);
  const up=Object.values(now).filter(o=>!lastOrd[oid(o)]||lastOrd[oid(o)].qty!==o.qty).map(o=>({id:oid(o),week_id:o.weekId,cid:o.cid,day:o.day,item_id:o.itemId,qty:o.qty,updated_at:new Date().toISOString()}));
  const del=Object.keys(lastOrd).filter(k=>!now[k]);
  if(up.length)await api('orders',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify(up)});
  for(let i=0;i<del.length;i+=50)await api('orders?id=in.('+del.slice(i,i+50).map(k=>'"'+k.replace(/"/g,'')+'"').join(',')+')',{method:'DELETE'});
  lastOrd=JSON.parse(JSON.stringify(now));st('☁️ synchronisiert');
 }catch(e){console.error(e);st('⚠️ Sync-Fehler – wird erneut versucht')}
 busy=false;
}
window.remoteSave=()=>{pending=true;clearTimeout(timer);timer=setTimeout(async()=>{pending=false;await push()},400)};
function apply(r){
 const cur=S.cur;
 if(r.core)Object.assign(S,r.core);S.orders=r.orders;
 S.cur=S.weeks.some(w=>w.id===cur)?cur:S.weeks[0]?.id;
 lastCore=core();lastOrd={};S.orders.forEach(o=>lastOrd[oid(o)]={...o});
 localStorage.setItem(KEY,JSON.stringify(S));
}
async function poll(){
 if(busy||pending||!ready)return;
 const a=document.activeElement;if(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName))return; // nicht beim Tippen stören
 try{const r=await pull();const before=JSON.stringify([core(),S.orders]);apply(r);if(JSON.stringify([core(),S.orders])!==before)render();st('☁️ synchronisiert')}catch(e){st('⚠️ offline')}
}
window.remoteInit=async function(){
 st('⏳ verbinde…');
 try{const r=await pull();
  if(!r.core){ // Datenbank leer: aktuellen Stand (lokal bzw. KW-44-Beispiel) hochladen
   ready=true;lastCore=null;lastOrd={};await push();
  }else{apply(r);ready=true;render()}
  st('☁️ synchronisiert');setInterval(poll,15000);
 }catch(e){console.error(e);st('⚠️ Datenbank nicht erreichbar – lokaler Modus')}
};
})();
