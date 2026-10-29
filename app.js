// Essensplan – KaisKantine. Daten lokal im Browser (localStorage).
// ADMIN-PASSWORT: SHA-256-Hash des Passworts. Ändern: neuen Hash erzeugen mit
//   printf 'NeuesPasswort' | sha256sum   und hier eintragen. (Nur einfacher Schutz, kein echtes Sicherheitskonzept!)
const ADMIN_PW_HASH='81159e06eebfef0b9b2b4ba5ba2e5e47c82ba31796a451f8c46ee114f1a34915';
async function sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function login(e){e.preventDefault();if(await sha($('#apw').value)===ADMIN_PW_HASH){sessionStorage.setItem('adminOk','1');render()}else{$('#aerr').textContent='Falsches Passwort.'}}
function logout(){sessionStorage.removeItem('adminOk');location.hash='#kunde'}
function loginForm(){return `<div class="card"><h2>Admin-Anmeldung</h2><form onsubmit="login(event)" class="row"><input type="password" id="apw" placeholder="Passwort" autofocus><button>Anmelden</button></form><p id="aerr" style="color:#b33"></p></div>`}
const KEY='essensplan-v1', DAYS=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'], DS=['Mo','Di','Mi','Do','Fr'];
const CATS=['Tagesgericht','Kompott der Woche','Pasta','Pasta der Woche','Suppen','Suppe der Woche','Salate','Klassiker','Extra'];
const uid=()=>Math.random().toString(36).slice(2,9);
const eur=n=>(+n||0).toFixed(2).replace('.',',')+' €';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function mondayOf(y,w){const d=new Date(Date.UTC(y,0,4));d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7)+(w-1)*7);return d}
function dayDate(wk,i){const d=mondayOf(wk.year,wk.kw);d.setUTCDate(d.getUTCDate()+i);return d.toLocaleDateString('de-DE',{timeZone:'UTC',day:'2-digit',month:'2-digit',year:'2-digit'})}
function seed(){const w={id:'2026-44',year:2026,kw:44,ort:'Arcus Park'};const it=(day,cat,name,price,all='')=>({id:uid(),weekId:w.id,day,cat,name,price,all});
 const items=[it(0,'Tagesgericht','Gebratene Schupfnudeln mit Pilz-Sahnesoße',7.5,'1,5,9'),it(0,'Tagesgericht','Bratwurst mit Sauerkraut und Kartoffelbrei',9.5,'9,12,13,15,21,22'),
 it(1,'Tagesgericht','Blumenkohl-Nudelauflauf',7.5,'1,5,9'),it(1,'Tagesgericht','Hühnerfrikassee mit Gemüse und Reis',7.5,'1,9,12,13'),
 it(2,'Tagesgericht','Reisnudelpfanne Olive und Feta mit Krautsalat und Dip',7.5,'1,9'),it(2,'Tagesgericht','Lasagne',7.5,'1,5,9,12'),
 it(3,'Tagesgericht','Tortelinisalat mit Brokkoli-Käsenuggets und Dip',7.5,'1,5,9,12'),it(3,'Tagesgericht','Kasseler mit Sauerkraut und Kartoffelragout',9.5,'9,15,22'),
 it(4,'Tagesgericht','Gemüse Bauernpfanne',7.5,'1'),it(4,'Tagesgericht','Gehacktes Bauernpfanne',7.5,'1,12'),
 it(null,'Kompott der Woche','Dessert',3),it(null,'Pasta','Pasta mit Bolognese',6.5,'1,5,9,12,19'),it(null,'Pasta','Pasta mit Wildgulasch',9.9,'1,5,9,12,15,22'),
 it(null,'Pasta der Woche','Pasta mit Kürbissoße',6.5,'1,5,9'),it(null,'Suppen','Kartoffelsuppe mit Würstchen',6.5,'1,6,9,12,13,19,20,33'),it(null,'Suppen','NEU! Linseneintopf mit Gemüse',6.5,'1,8,12,33'),
 it(null,'Suppe der Woche','Soljanka',6.5,'1,8,9,12,13,18,19,20,33'),it(null,'Salate','Gemischter Salat mit Tomate & Mozzarella',7.5,'1,5,8,9,33'),it(null,'Salate','Gemischter Salat mit Geflügelstreifen und Ei',7.5,'1,5,6,8,9,33'),
 it(null,'Klassiker','2x Geflügel-Jägerschnitzel mit Nudeln und Tomatensoße',9.5,'1,5,9,13,19,20,26')];
 const c1={id:uid(),name:'Max Mustermann',firma:'Beispiel GmbH'},c2={id:uid(),name:'Erika Muster',firma:'Arcus Park Verwaltung'},c3={id:uid(),name:'Anna Koch',firma:'Kaiskantine',ma:true};
 return {anbieter:'Kai Tandel Gastronomiebetriebe – KaisKantine',weeks:[w],items,customers:[c1,c2,c3],maRabatt:0,att:[{weekId:w.id,cid:c3.id,days:[0,2,4]},{weekId:w.id,cid:c1.id,days:[0,1,2,3,4]},{weekId:w.id,cid:c2.id,days:[1,3]}],orders:[],cur:w.id}}
let S=JSON.parse(localStorage.getItem(KEY)||'null')||seed();
function save(){localStorage.setItem(KEY,JSON.stringify(S));if(window.remoteSave)remoteSave()}
const W=()=>S.weeks.find(w=>w.id===S.cur)||S.weeks[0];
const itemsOf=(wid,day)=>S.items.filter(i=>i.weekId===wid&&(i.day===day||i.day===null));
const attOf=(wid,cid)=>S.att.find(a=>a.weekId===wid&&a.cid===cid);
const cust=id=>S.customers.find(c=>c.id===id)||{name:'?',firma:''};
const item=id=>S.items.find(i=>i.id===id)||{name:'(gelöscht)',price:0};
const priceFor=(c,i)=>(+i.price||0)*(c&&c.ma?1-(S.maRabatt||0)/100:1);
const maTag=c=>c&&c.ma?'<span class="tag">Mitarbeiter</span>':'';
const $=s=>document.querySelector(s);let adminTab='plan',kundeId=null;

function weekSel(){$('#weekSel').innerHTML=S.weeks.sort((a,b)=>a.id<b.id?-1:1).map(w=>`<option value="${w.id}" ${w.id===S.cur?'selected':''}>KW ${w.kw}/${w.year} (${dayDate(w,0)}–${dayDate(w,4)})</option>`).join('');}
$('#weekSel').onchange=e=>{S.cur=e.target.value;save();render()};
function head(w){return `<p class="muted">${esc(S.anbieter)} · Speiseplan ${esc(w.ort)} · KW ${w.kw} – ${dayDate(w,0)} bis ${dayDate(w,4)}</p>`}

// ---------- ADMIN ----------
function admin(){const w=W();let h=`<div class="tabs noprint card">${[['plan','Speiseplan'],['kunden','Kunden & Anwesenheit'],['ma','Mitarbeiter'],['abr','Abrechnung'],['daten','Daten']].map(([k,l])=>`<button class="${adminTab===k?'on':''}" onclick="adminTab='${k}';render()">${l}</button>`).join('')}<button class="sec" style="float:right" onclick="logout()">Abmelden</button></div>`;
 if(adminTab==='plan'){h+=`<div class="card"><h2>Woche</h2>${head(w)}<div class="row noprint">Neue Woche: KW <input id="nkw" type="number" min="1" max="53" style="width:4em" value="${w.kw+1}"> Jahr <input id="nyr" type="number" style="width:5em" value="${w.year}"> Ort <input id="nort" value="${esc(w.ort)}"> <label><input type="checkbox" id="ncopy" checked> Ständige Karte & Kunden übernehmen</label> <button onclick="newWeek()">Anlegen</button>
 <button class="del" onclick="delWeek()">Diese Woche löschen</button></div></div>
 <div class="card"><h2>Gericht hinzufügen</h2><div class="row"><select id="iday"><option value="">Ständige Karte (Mo–Fr)</option>${DAYS.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}</select>
 <select id="icat">${CATS.map(c=>`<option>${c}</option>`).join('')}</select><input id="iname" placeholder="Gericht" size="30"><input id="iall" placeholder="Allergene z.B. 1,5,9" size="12"><input id="iprice" type="number" step="0.1" placeholder="Preis" style="width:6em"><button onclick="addItem()">Hinzufügen</button></div></div>`;
  const grp=[...DAYS.map((d,i)=>[d,i]),['Ständige Karte',null]];
  for(const [l,d] of grp){const its=S.items.filter(i=>i.weekId===w.id&&i.day===d);h+=`<div class="card"><h2>${l}${d!==null?' <span class="muted">'+dayDate(w,d)+'</span>':''}</h2><table><tr><th>Kategorie</th><th>Gericht</th><th>Allergene</th><th class="right">Preis</th><th></th></tr>${its.map(i=>`<tr><td>${esc(i.cat)}</td><td><input value="${esc(i.name)}" size="40" onchange="upd('${i.id}','name',this.value)"></td><td><input value="${esc(i.all)}" size="12" onchange="upd('${i.id}','all',this.value)"></td><td class="right"><input type="number" step="0.1" style="width:6em" value="${i.price}" onchange="upd('${i.id}','price',+this.value)"></td><td><button class="del" onclick="delItem('${i.id}')">✕</button></td></tr>`).join('')||'<tr><td colspan=5 class="muted">keine Einträge</td></tr>'}</table></div>`}}
 if(adminTab==='kunden'||adminTab==='ma'){const isMA=adminTab==='ma',list=S.customers.filter(c=>!!c.ma===isMA);
  h+=`<div class="card"><h2>${isMA?'Mitarbeiter':'Kunden'} – KW ${w.kw}</h2>${head(w)}${isMA?`<div class="row">Mitarbeiter-Rabatt: <input type="number" min="0" max="100" style="width:5em" value="${S.maRabatt||0}" onchange="S.maRabatt=+this.value;save()"> % auf alle Gerichte (0 = gleicher Preis, nur getrennte Auswertung)</div>`:''}
  <div class="row"><input id="cname" placeholder="Name"><input id="cfirma" placeholder="Firma" value="${isMA?'Kaiskantine':''}"><button onclick="addCust(${isMA})">${isMA?'Mitarbeiter':'Kunde'} anlegen</button></div>
  <table class="fixed"><tr><th style="width:18%">Name</th><th style="width:18%">Firma</th>${DS.map((d,i)=>`<th>${d}<br><span class="muted">${dayDate(w,i)}</span></th>`).join('')}<th>Tage</th><th>Mitarb.</th><th></th></tr>${list.map(c=>{const a=attOf(w.id,c.id);const ds=a?a.days:[];return `<tr><td><input value="${esc(c.name)}" style="width:95%" onchange="updC('${c.id}','name',this.value)"></td><td><input value="${esc(c.firma)}" style="width:95%" onchange="updC('${c.id}','firma',this.value)"></td>${DS.map((_,i)=>`<td><input type="checkbox" ${ds.includes(i)?'checked':''} onchange="togDay('${c.id}',${i},this.checked)"></td>`).join('')}<td>${ds.length}</td><td><input type="checkbox" ${c.ma?'checked':''} title="Als Mitarbeiter führen" onchange="updC('${c.id}','ma',this.checked);render()"></td><td><button class="del" onclick="delCust('${c.id}')">✕</button></td></tr>`}).join('')||'<tr><td colspan=10 class="muted">keine Einträge</td></tr>'}</table>
  <p class="muted">Nur Personen mit mindestens einem Anwesenheitstag können in dieser Woche bestellen. Häkchen „Mitarb.“ verschiebt eine Person zwischen Kunden und Mitarbeitern.</p></div>`}
 if(adminTab==='abr'){const rows=S.customers.map(c=>{const os=S.orders.filter(o=>o.weekId===w.id&&o.cid===c.id);return{c,os,sum:os.reduce((s,o)=>s+o.qty*priceFor(c,item(o.itemId)),0),n:os.reduce((s,o)=>s+o.qty,0)}}).filter(r=>r.os.length);
  h+=`<div class="card"><h2>Abrechnung KW ${w.kw}</h2>${head(w)}<button class="noprint" onclick="print()">Drucken</button> <button class="noprint sec" onclick="csv()">CSV exportieren</button>
  <h3>Statistik</h3><table class="fixed"><tr><th>Gruppe</th><th class="right">Personen</th><th class="right">Essen</th><th class="right">Betrag</th></tr>${[['Kunden',rows.filter(r=>!r.c.ma)],['Mitarbeiter',rows.filter(r=>r.c.ma)],['Gesamt',rows]].map(([l,rs])=>`<tr><td>${l==='Gesamt'?'<b>Gesamt</b>':l}</td><td class="right">${rs.length}</td><td class="right">${rs.reduce((s,r)=>s+r.n,0)}</td><td class="right">${eur(rs.reduce((s,r)=>s+r.sum,0))}</td></tr>`).join('')}</table>`;
  for(const [title,rs] of [['Kunden',rows.filter(r=>!r.c.ma)],['Mitarbeiter'+(S.maRabatt?` (−${S.maRabatt} %)`:''),rows.filter(r=>r.c.ma)]]){if(!rs.length)continue;h+=`<h2 style="margin-top:1.5rem">${title}</h2>`;
   const firmen={};rs.forEach(r=>firmen[r.c.firma||'–']=(firmen[r.c.firma||'–']||0)+r.sum);
   rs.forEach(r=>{h+=`<h3>${esc(r.c.name)} ${maTag(r.c)} <span class="muted">${esc(r.c.firma)}</span></h3><table class="fixed"><tr><th style="width:18%">Tag</th><th>Gericht</th><th class="right" style="width:8%">Anz.</th><th class="right" style="width:12%">Einzel</th><th class="right" style="width:12%">Summe</th></tr>${r.os.sort((a,b)=>a.day-b.day).map(o=>{const i=item(o.itemId),p=priceFor(r.c,i);return `<tr><td>${DS[o.day]} ${dayDate(w,o.day)}</td><td>${esc(i.name)}</td><td class="right">${o.qty}</td><td class="right">${eur(p)}</td><td class="right">${eur(o.qty*p)}</td></tr>`}).join('')}<tr><th colspan=4>Gesamt</th><th class="right">${eur(r.sum)}</th></tr></table>`});
   h+=`<h3>Summe je Firma – ${title}</h3><table class="fixed">${Object.entries(firmen).map(([f,s])=>`<tr><td>${esc(f)}</td><td class="right">${eur(s)}</td></tr>`).join('')}</table>`}
  h+=rows.length?'':'<p class="muted">Noch keine Bestellungen.</p>';h+='</div>'}
 if(adminTab==='daten'){h+=`<div class="card"><h2>Daten</h2><p>${window.REMOTE_ON?'✅ Gemeinsame Datenbank (Supabase) aktiv – alle Geräte sehen dieselben Daten.':'⚠️ Keine Datenbank konfiguriert – Daten liegen nur in diesem Browser (siehe README: Supabase einrichten).'}</p><div class="row">Anbieter: <input id="anb" size="50" value="${esc(S.anbieter)}"><button onclick="S.anbieter=$('#anb').value;save();render()">Speichern</button></div>
 <div class="row"><button onclick="exp()">JSON exportieren</button><input type="file" id="imp" accept=".json" onchange="imp(this)"><button class="del" onclick="if(confirm('Alles zurücksetzen auf Beispieldaten KW 44?')){S=seed();save();render()}">Zurücksetzen</button></div></div>`}
 return h}
function newWeek(){const kw=+$('#nkw').value,year=+$('#nyr').value,id=year+'-'+String(kw).padStart(2,'0');if(S.weeks.some(w=>w.id===id))return alert('Woche existiert bereits');const old=W();S.weeks.push({id,kw,year,ort:$('#nort').value});
 if($('#ncopy').checked){S.items.filter(i=>i.weekId===old.id&&i.day===null).forEach(i=>S.items.push({...i,id:uid(),weekId:id}));S.att.filter(a=>a.weekId===old.id).forEach(a=>S.att.push({...a,weekId:id,days:[...a.days]}))}S.cur=id;save();render()}
function delWeek(){if(S.weeks.length<2)return alert('Mindestens eine Woche nötig');if(!confirm('Woche inkl. Bestellungen löschen?'))return;const id=S.cur;S.weeks=S.weeks.filter(w=>w.id!==id);S.items=S.items.filter(i=>i.weekId!==id);S.att=S.att.filter(a=>a.weekId!==id);S.orders=S.orders.filter(o=>o.weekId!==id);S.cur=S.weeks[0].id;save();render()}
function addItem(){const n=$('#iname').value.trim();if(!n)return;const d=$('#iday').value;S.items.push({id:uid(),weekId:W().id,day:d===''?null:+d,cat:$('#icat').value,name:n,all:$('#iall').value,price:+$('#iprice').value||0});save();render()}
function upd(id,k,v){item(id)[k]=v;save()}function delItem(id){S.items=S.items.filter(i=>i.id!==id);S.orders=S.orders.filter(o=>o.itemId!==id);save();render()}
function addCust(ma){const n=$('#cname').value.trim();if(!n)return;S.customers.push({id:uid(),name:n,firma:$('#cfirma').value.trim(),ma:!!ma});save();render()}
function updC(id,k,v){cust(id)[k]=v;save()}function delCust(id){if(!confirm('Kunde löschen?'))return;S.customers=S.customers.filter(c=>c.id!==id);S.att=S.att.filter(a=>a.cid!==id);S.orders=S.orders.filter(o=>o.cid!==id);save();render()}
function togDay(cid,d,on){const w=W();let a=attOf(w.id,cid);if(!a)S.att.push(a={weekId:w.id,cid,days:[]});a.days=on?[...new Set([...a.days,d])].sort():a.days.filter(x=>x!==d);if(!on)S.orders=S.orders.filter(o=>!(o.weekId===w.id&&o.cid===cid&&o.day===d));save();render()}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='essensplan-daten.json';a.click()}
function imp(inp){const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);save();render()}catch(e){alert('Ungültige Datei')}};r.readAsText(inp.files[0])}
function csv(){const w=W();const l=[['Kunde','Firma','Mitarbeiter','Tag','Datum','Gericht','Anzahl','Einzelpreis','Summe']];S.orders.filter(o=>o.weekId===w.id).forEach(o=>{const c=cust(o.cid),i=item(o.itemId);const pr=priceFor(c,i);l.push([c.name,c.firma,c.ma?'ja':'nein',DS[o.day],dayDate(w,o.day),i.name,o.qty,pr.toFixed(2).replace('.',','),(o.qty*pr).toFixed(2).replace('.',',')])});
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+l.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\n')],{type:'text/csv'}));a.download=`abrechnung-KW${w.kw}-${w.year}.csv`;a.click()}

// ---------- KUNDE ----------
function kunde(){const w=W();const present=S.customers.filter(c=>(attOf(w.id,c.id)?.days||[]).length).sort((a,b)=>a.name.localeCompare(b.name));
 let h=`<div class="card"><h2>Essen bestellen – KW ${w.kw}</h2>${head(w)}<div class="row">Name auswählen: <select id="ksel" onchange="kundeId=this.value||null;render()"><option value="">– bitte wählen –</option>${present.map(c=>`<option value="${c.id}" ${c.id===kundeId?'selected':''}>${esc(c.name)}${c.firma?' ('+esc(c.firma)+')':''}${c.ma?' – Mitarbeiter':''}</option>`).join('')}</select>
 oder tippen: <input list="cl" id="kn" placeholder="Name eingeben" oninput="nameFb()" onkeydown="if(event.key==='Enter')pickK()"><datalist id="cl">${present.map(c=>`<option value="${esc(c.name)}">${esc(c.firma)}</option>`).join('')}</datalist><button onclick="pickK()">Weiter</button> <span id="kfb"></span></div></div>`;
 if(!kundeId)return h;const c=cust(kundeId),a=attOf(w.id,c.id);if(!a||!a.days.length)return h+`<div class="card">Für ${esc(c.name)} sind in KW ${w.kw} keine Tage hinterlegt. Bitte an die Verwaltung wenden.</div>`;
 let tot=0;h+=`<div class="card"><h2>✓ ${esc(c.name)} ${maTag(c)} <span class="muted">${esc(c.firma)}</span></h2><div class="week">`;
 for(let d=0;d<5;d++){const on=a.days.includes(d);h+=`<div class="day ${on?'':'off'}"><h3>${DS[d]} <span class="muted">${dayDate(w,d)}</span></h3>`;
  if(!on){h+='<p class="muted">nicht anwesend</p></div>';continue}let dsum=0,lastCat='';
  for(const i of itemsOf(w.id,d)){const o=S.orders.find(o=>o.weekId===w.id&&o.cid===c.id&&o.day===d&&o.itemId===i.id);const q=o?o.qty:0,p=priceFor(c,i);dsum+=q*p;
   if(i.cat!==lastCat)h+=`<div class="cat">${esc(lastCat=i.cat)}</div>`;
   h+=`<label class="dish ${q?'sel':''}"><span>${esc(i.name)}<br><span class="muted">${eur(p)}${i.all?' · '+esc(i.all):''}</span></span><input type="number" min="0" max="20" value="${q}" onchange="setQ('${c.id}',${d},'${i.id}',+this.value)"></label>`}
  tot+=dsum;h+=`<div class="dsum">Tag: ${eur(dsum)}</div></div>`}
 return h+`</div><h3>Summe Woche: ${eur(tot)}</h3><p class="ok">Bestellungen werden automatisch gespeichert.</p></div>`}
function findName(n){n=n.trim().toLowerCase();return S.customers.find(c=>c.name.toLowerCase()===n)}
function nameFb(){const n=$('#kn').value,c=findName(n),e=$('#kfb');if(!n.trim()){e.textContent='';return}
 if(!c){e.innerHTML='<span style="color:#b33">✗ Name nicht bekannt</span>';return}
 const ok=(attOf(W().id,c.id)?.days||[]).length;e.innerHTML=ok?`<span class="ok">✓ ${esc(c.name)} gefunden${c.ma?' (Mitarbeiter)':''}</span>`:'<span style="color:#b33">Name bekannt, aber diese Woche keine Tage hinterlegt</span>'}
function pickK(){const c=findName($('#kn').value);if(!c){alert('Name nicht gefunden. Bitte aus der Liste wählen oder an die Verwaltung wenden.');return}kundeId=c.id;render()}
function setQ(cid,day,itemId,q){const w=W();S.orders=S.orders.filter(o=>!(o.weekId===w.id&&o.cid===cid&&o.day===day&&o.itemId===itemId));if(q>0)S.orders.push({weekId:w.id,cid,day,itemId,qty:q});save();render()}

// ---------- KANTINE ----------
function kantine(){const w=W();const all=S.orders.filter(o=>o.weekId===w.id),wk={};let wtot=0;
 const val=o=>o.qty*priceFor(cust(o.cid),item(o.itemId));all.forEach(o=>wtot+=val(o));
 let h=`<div class="card"><h2>Kantinen-Planung KW ${w.kw}</h2>${head(w)}<p><b>Wochen-Gesamtpreis (veranschlagt): ${eur(wtot)}</b> · ${all.reduce((s,o)=>s+o.qty,0)} Essen</p><button class="noprint" onclick="print()">Drucken</button></div>`;
 const cols='<colgroup><col style="width:40%"><col style="width:10%"><col style="width:50%"></colgroup>';
 for(let d=0;d<5;d++){const os=all.filter(o=>o.day===d);const sum={};os.forEach(o=>sum[o.itemId]=(sum[o.itemId]||0)+o.qty);const dt=os.reduce((s,o)=>s+val(o),0);
  h+=`<div class="card"><h2>${DAYS[d]} <span class="muted">${dayDate(w,d)}</span></h2>${os.length?`<table class="fixed">${cols}<tr><th>Gericht</th><th class="right">Anzahl</th><th>Für</th></tr>${Object.entries(sum).map(([id,n])=>{wk[id]=(wk[id]||0)+n;return `<tr><td>${esc(item(id).name)}</td><td class="right"><b>${n}</b></td><td>${os.filter(o=>o.itemId===id).map(o=>esc(cust(o.cid).name)+(o.qty>1?' ×'+o.qty:'')+(cust(o.cid).ma?' [MA]':'')+' <span class="muted">('+esc(cust(o.cid).firma)+')</span>').join(', ')}</td></tr>`}).join('')}<tr><th>Tagessumme</th><th class="right">${os.reduce((s,o)=>s+o.qty,0)}</th><th>${eur(dt)}</th></tr></table>`:'<p class="muted">Keine Bestellungen.</p>'}</div>`}
 h+=`<div class="card"><h2>Wochensumme</h2><table class="fixed">${cols}<tr><th>Gericht</th><th class="right">Anzahl</th><th>Preis</th></tr>${Object.entries(wk).map(([id,n])=>`<tr><td>${esc(item(id).name)}</td><td class="right"><b>${n}</b></td><td>${eur(all.filter(o=>o.itemId===id).reduce((s,o)=>s+val(o),0))}</td></tr>`).join('')}<tr><th>Gesamt</th><th class="right">${all.reduce((s,o)=>s+o.qty,0)}</th><th>${eur(wtot)}</th></tr></table></div>`;return h}

function render(){if(!S.weeks.some(w=>w.id===S.cur))S.cur=S.weeks[0].id;weekSel();const v=(location.hash||'#kunde').slice(1);document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+v));
 $('#app').innerHTML=v==='admin'?(sessionStorage.getItem('adminOk')?admin():loginForm()):v==='kantine'?kantine():kunde()}
window.onhashchange=render;render();if(window.remoteInit)remoteInit();
