'use strict';
// ===== Datos y actualizaciones de textos =====
// Dirección donde se publican las actualizaciones (GitHub Pages del repositorio).
const UPDATE_BASE='https://nsuarezmansilla-ai.github.io/ley32069-app/datos/';
let META=Object.assign({v:1,fecha:'26/10/2026'},window.DATA_META||{});
let DOC,IDX;
function setData(D,meta){DOC={ley:{name:'Ley N.º 32069',short:'Ley',...D.ley},reg:{name:'Reglamento (D.S. 009-2025-EF)',short:'Reglamento',...D.reg}};if(meta)META=meta;buildIdx()}
const validData=D=>D&&D.ley&&D.reg&&Array.isArray(D.ley.arts)&&Array.isArray(D.reg.arts)&&D.ley.arts.length>50&&D.reg.arts.length>100;
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('ley32069',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbGet(k){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('kv').objectStore('kv').get(k);t.onsuccess=()=>res(t.result);t.onerror=()=>rej(t.error)})}
async function idbSet(k,v){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
async function checkUpdates(manual){
 try{const r=await fetch(UPDATE_BASE+'version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('http '+r.status);const vj=await r.json();
  if(!(vj.v>META.v)){if(manual)toast('Ya tienes los textos más recientes');return}
  const d=await fetch(UPDATE_BASE+'data.json?v='+vj.v,{cache:'no-store'});if(!d.ok)throw new Error('http '+d.status);const D=await d.json();
  if(!validData(D))throw new Error('datos inválidos');
  const meta={v:vj.v,fecha:vj.fecha||'',notas:vj.notas||''};await idbSet('data',{meta,D});
  setData(D,meta);st.stack=st.stack.filter(x=>DOC[x.d].arts[x.i]);render();toast('Textos actualizados al '+meta.fecha);
 }catch(e){if(manual)toast('No se pudo buscar actualizaciones. Revisa tu conexión.')}}
const ic={home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',idx:'<path d="M4 6h16M4 12h16M4 18h10"/>',srch:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',save:'<path d="M6 3h12v18l-6-4-6 4z"/>',back:'<path d="M15 5l-7 7 7 7"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',aa:'<path d="M3 19l5-14 5 14M5 14h6M15 19l3-8 3 8M16 16h4"/>',note:'<path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'};
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic[k]}</svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const st={tab:'home',stack:[],idxDoc:'ley',q:'',qDoc:'all',scroll:{}};
const store={fav:[],notes:{},recent:[],theme:'t-inst',fs:17};
try{Object.assign(store,JSON.parse(localStorage.getItem('ley32069')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('ley32069',JSON.stringify(store))}catch(e){}};
const key=(d,i)=>d+':'+i;
const lab=a=>a.disp?`${a.n} · ${a.p[0]||'Disposición'}`:`Art. ${a.n}`;
const labShort=a=>a.disp?`${a.n} disp.`:`Art. ${a.n}`;
const THEMES=[['t-inst','Institucional','Azul, claro y sobrio'],['t-dark','Oscuro','Modo noche, descansa la vista'],['t-paper','Libro','Letra con serifa, fondo papel']];
function applyTheme(){document.body.className=store.theme;const m=document.querySelector('meta[name=color-scheme]');if(m)m.content=store.theme==='t-dark'?'dark':'light'}
applyTheme();

function nav(){const it=[['home','Inicio'],['idx','Índice'],['srch','Buscar'],['save','Guardados']];
$('nav').innerHTML=it.map(([k,l])=>`<button class="${st.tab===k&&!st.stack.length?'on':''}" data-go="${k}">${svg(k)}${l}</button>`).join('')}
function go(t){st.tab=t;st.stack=[];closeSheet();render();$('body').scrollTop=0}
function openArt(d,i){if(i<0||i>=DOC[d].arts.length)return;st.stack.push({d,i});store.recent=[key(d,i),...store.recent.filter(x=>x!==key(d,i))].slice(0,6);save();closeSheet();render();$('body').scrollTop=0}
function replaceArt(d,i){st.stack.pop();openArt(d,i)}
function back(){if($('sheet').classList.contains('open')){closeSheet();return true}if(st.stack.length){st.stack.pop();render();return true}if(st.tab!=='home'){go('home');return true}return false}
function card(d,i,ex){const a=DOC[d].arts[i];return `<button class="card" data-art="${d}:${i}"><div class="k">${DOC[d].short} · ${esc(labShort(a))}</div><div class="tt">${esc(a.t)}</div>${ex!==undefined?`<div class="ex">${ex}</div>`:''}</button>`}

function render(){nav();const T=$('top'),B=$('body');
if(st.stack.length){const {d,i}=st.stack[st.stack.length-1];return renderArt(d,i)}
if(st.tab==='home'){T.innerHTML=`<h2>Contrataciones Públicas</h2><button class="ib" data-act="settings" aria-label="Ajustes">${svg('gear')}</button>`;
const rec=store.recent.slice(0,4).map(k=>{const[d,i]=k.split(':');return DOC[d]&&DOC[d].arts[+i]?card(d,+i):''}).join('');
const topics=['plazo','penalidad','garantía','prestaciones adicionales','ampliación de plazo','arbitraje','Junta de Prevención','sanción','catálogo electrónico','contratación directa','requerimiento','buena pro'];
B.innerHTML=`<div class="hero"><img src="logo.png" alt="" class="hlogo"><small>Texto con modificaciones al ${esc(META.fecha)}</small><h3>Ley 32069 y su Reglamento</h3><p>Consulta sin conexión, con los artículos de la Ley enlazados a su Reglamento.</p></div>
<div class="sbox" data-go="srch">${svg('srch')}<input placeholder="Buscar artículo, palabra o tema…" readonly tabindex="-1"></div>
<div class="grid"><button class="tile" data-idx="ley"><div class="n">${DOC.ley.arts.length}</div><b>Ley</b><span>Artículos y disposiciones</span></button>
<button class="tile" data-idx="reg"><div class="n">${DOC.reg.arts.length}</div><b>Reglamento</b><span>Artículos y disposiciones</span></button></div>
<div class="sec">Temas frecuentes</div><div>${topics.map(t=>`<button class="chip" data-topic="${esc(t)}">${esc(t)}</button>`).join('')}</div>
<div class="sec">Continuar leyendo</div>${rec||`<div class="empty">Aún no has abierto ningún artículo.<br><button class="chip" style="margin-top:10px" data-art="ley:0">Empezar por el Artículo 1</button></div>`}`;return}
if(st.tab==='idx'){T.innerHTML=`<h2>Índice</h2>`;const dk=st.idxDoc,dd=DOC[dk];
let h=`<div class="seg"><button class="${dk==='ley'?'on':''}" data-idx="ley">Ley</button><button class="${dk==='reg'?'on':''}" data-idx="reg">Reglamento</button></div>`;
const tops=dd.tree.map((n,k)=>({...n,k})).filter(n=>n.lvl===0);
const rows=(a,b)=>{let r='';for(let i=a;i<b;i++){const x=dd.arts[i];r+=`<div class="row" data-art="${dk}:${i}"><span class="num">${x.disp?esc(x.n):'Art. '+esc(x.n)}</span><span>${esc(x.t)}</span></div>`}return r};
tops.forEach((t,ti)=>{const nk=ti+1<tops.length?tops[ti+1].k:dd.tree.length;const end=ti+1<tops.length?tops[ti+1].first:dd.arts.length;
 const kids=dd.tree.slice(t.k+1,nk);let inner='';
 if(kids.length){inner+=rows(t.first,kids[0].first);kids.forEach((c,ci)=>{const ce=ci+1<kids.length?kids[ci+1].first:end;inner+=`<div class="ch" style="padding-left:${(c.lvl-1)*10}px">${esc(c.label)}${c.name?' · '+esc(c.name):''}</div>`+rows(c.first,ce)})}
 else inner+=rows(t.first,end);
 h+=`<details class="h"><summary><div><span class="lb">${esc(t.label)}</span><span class="nm">${esc(t.name||t.label)}</span></div><span class="ct">${end-t.first}</span></summary><div class="sub">${inner}</div></details>`});
B.innerHTML=h;return}
if(st.tab==='srch'){T.innerHTML=`<h2>Buscar</h2>`;
B.innerHTML=`<div class="sbox">${svg('srch')}<input id="q" type="search" enterkeyhint="search" placeholder="Ej.: penalidad, art 45, garantía" value="${esc(st.q)}"></div>
<div class="seg">${[['all','Todo'],['ley','Ley'],['reg','Reglamento']].map(([k,l])=>`<button data-qd="${k}" class="${st.qDoc===k?'on':''}">${l}</button>`).join('')}</div><div id="res"></div>`;
const q=$('q');let tm;q.oninput=()=>{st.q=q.value;clearTimeout(tm);tm=setTimeout(search,120)};q.onkeydown=e=>{if(e.key==='Enter')q.blur()};if(!st.q)setTimeout(()=>q.focus(),50);search();return}
if(st.tab==='save'){T.innerHTML=`<h2>Guardados</h2>`;
const fav=store.fav.map(k=>{const[d,i]=k.split(':');return DOC[d]&&DOC[d].arts[+i]?card(d,+i):''}).join('');
const nts=Object.entries(store.notes).filter(([k,v])=>v&&v.trim()).map(([k,v])=>{const[d,i]=k.split(':');return DOC[d]&&DOC[d].arts[+i]?card(d,+i,'📝 '+esc(v)):''}).join('');
B.innerHTML=`<div class="sec">Favoritos</div>${fav||'<div class="empty">Toca la estrella de un artículo para guardarlo aquí.</div>'}<div class="sec">Mis notas</div>${nts||'<div class="empty">Las notas que escribas en un artículo aparecerán aquí.</div>'}`}}

const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function buildIdx(){IDX={};for(const d of ['ley','reg'])IDX[d]=DOC[d].arts.map(a=>({t:norm(a.t),b:a.x.join(' '),nb:norm(a.x.join(' '))}))}
function search(){const R=$('res');if(!R)return;const q=st.q.trim();if(q.length<2){R.innerHTML='<div class="empty">Escribe al menos 2 letras.<br>También puedes buscar por número: “art 45”.</div>';return}
const nq=norm(q);const m=nq.match(/^(art(iculo|\.)?\s*)(\d+)$/)||nq.match(/^(\s*)(\d+)$/);const num=m?m[m.length-1]:null;const words=nq.split(/\s+/).filter(w=>w.length>1);let out=[];
for(const d of ['ley','reg']){if(st.qDoc!=='all'&&st.qDoc!==d)continue;DOC[d].arts.forEach((a,i)=>{const ix=IDX[d][i];
 if(num){if(a.n===num&&!a.disp)out.push([d,i,100,esc(a.x.join(' ').slice(0,140))]);return}
 let sc=0;if(ix.t.includes(nq))sc+=10;const p=ix.nb.indexOf(nq);if(p>=0)sc+=2+Math.min(ix.nb.split(nq).length-1,10)*.3;
 else if(words.length>1&&words.every(w=>ix.nb.includes(w)||ix.t.includes(w)))sc+=1;
 if(sc){let ex;if(p>=0){const s=Math.max(0,p-50);ex=(s?'…':'')+esc(ix.b.slice(s,p))+'<mark>'+esc(ix.b.substr(p,q.length))+'</mark>'+esc(ix.b.slice(p+q.length,p+q.length+120))+'…'}else ex=esc(ix.b.slice(0,140));out.push([d,i,sc,ex])}})}
out.sort((a,b)=>b[2]-a[2]);
R.innerHTML=`<div class="sec">${out.length} resultado${out.length===1?'':'s'}</div>`+(out.length?out.slice(0,80).map(([d,i,,ex])=>card(d,i,ex)).join(''):'<div class="empty">Sin resultados. Prueba con otra palabra.</div>')}

function fmt(p){const e=esc(p);if(/^([a-zñ]\)|[ivx]+\.)\s/.test(p))return `<p class="it">${e}</p>`;return `<p>${e}</p>`}
function renderArt(d,i){const dd=DOC[d],a=dd.arts[i],k=key(d,i),fav=store.fav.includes(k);
$('top').innerHTML=`<button class="ib" data-act="back" aria-label="Volver">${svg('back')}</button><h2>${dd.short} · ${esc(labShort(a))}</h2><button class="ib ${fav?'on':''}" data-act="fav" aria-label="Favorito">${svg('star')}</button>`;
let rel='';
if(d==='ley'){if(a.rd&&a.rd.length)rel+=`<div class="sec">Reglamento que lo desarrolla</div><div class="hint">Artículos del Reglamento que citan este artículo.</div>${a.rd.map(j=>card('reg',j)).join('')}`;
 if(a.rt&&a.rt.length)rel+=`<div class="sec">Relacionados por tema</div><div class="hint">Sugerencia automática por similitud de texto.</div>${a.rt.map(j=>card('reg',j)).join('')}`}
if(d==='reg'&&a.ld&&a.ld.length)rel+=`<div class="sec">Desarrolla la Ley</div>${a.ld.map(j=>card('ley',j)).join('')}`;
const note=store.notes[k];
$('body').innerHTML=`<div class="crumb">${esc(dd.name)}${a.p.length?' › '+a.p.map(esc).join(' › '):''}</div>
<div class="ah">${esc(a.t)}</div><span class="atag">${esc(lab(a))}</span>
<div class="tools"><button class="ib" data-act="fs" aria-label="Tamaño de letra">${svg('aa')}</button><button class="ib ${note?'on':''}" data-act="note" aria-label="Nota">${svg('note')}</button><button class="ib" data-act="copy" aria-label="Copiar">${svg('copy')}</button></div>
<div class="atext" id="atext" style="--fs:${store.fs}px">${a.x.map(fmt).join('')||'<p>Sin texto.</p>'}</div>
${a.pend?`<details class="pend"><summary>Modificación con vigencia pendiente</summary><div class="atext" style="--fs:${store.fs-1}px">${a.pend.map(fmt).join('')}</div></details>`:''}
${a.nt&&a.nt.length?`<details class="notes"><summary>Notas de modificación y concordancias (${a.nt.length})</summary>${a.nt.map(n=>`<div class="nt">${esc(n)}</div>`).join('')}</details>`:''}
${note?`<div class="sec">Mi nota</div><div class="card" data-act="note"><div class="ex" style="-webkit-line-clamp:8">${esc(note)}</div></div>`:''}
${rel?`<div class="rel">${rel}</div>`:''}
<div class="pn">${i>0?`<button data-nav="${i-1}">‹ Anterior</button>`:''}${i<dd.arts.length-1?`<button data-nav="${i+1}">Siguiente ›</button>`:''}</div>`}

function openSheet(html){$('sheet').innerHTML=html;$('sheet').classList.add('open');$('scrim').classList.add('open')}
function closeSheet(){$('sheet').classList.remove('open');$('scrim').classList.remove('open')}
function noteSheet(){const {d,i}=st.stack[st.stack.length-1];const k=key(d,i);
openSheet(`<h4>Nota personal · ${esc(labShort(DOC[d].arts[i]))}</h4><textarea class="note" id="nt" placeholder="Tu comentario, criterio u opinión del OECE…">${esc(store.notes[k]||'')}</textarea><div class="pn"><button data-act="close">Cancelar</button><button class="pri" data-act="savenote">Guardar</button></div>`);setTimeout(()=>$('nt')&&$('nt').focus(),250)}
function settingsSheet(){openSheet(`<h4>Ajustes</h4><div class="sec" style="margin-top:0">Estilo</div>${THEMES.map(([t,n,s])=>`<button class="opt ${store.theme===t?'on':''}" data-theme="${t}"><b>${n}</b><span>${s}</span></button>`).join('')}
<div class="sec">Tamaño de letra del texto</div><div class="seg">${[15,17,19,21].map(f=>`<button data-fs="${f}" class="${store.fs===f?'on':''}">${f===15?'Pequeña':f===17?'Normal':f===19?'Grande':'Muy grande'}</button>`).join('')}</div>
<div class="sec">Textos</div><div class="card" style="cursor:default"><div class="tt">Actualizados al ${esc(META.fecha)}</div><div class="ex">Versión de datos ${esc(META.v)}${META.notas?' · '+esc(META.notas):''}</div></div><button class="opt" data-act="update"><b>Buscar actualizaciones</b><span>Descarga los textos más recientes si hay conexión</span></button>
<div class="about">Texto de la Ley N.º 32069 y de su Reglamento (D.S. 009-2025-EF) con sus modificaciones. Faltan los Anexos I y II del Reglamento. Esta app es una herramienta de consulta: ante cualquier duda, verifica el texto oficial en El Peruano o el SPIJ.</div>`)}
function toast(t){const e=document.createElement('div');e.textContent=t;e.style.cssText='position:absolute;left:50%;bottom:calc(var(--sab) + 80px);transform:translateX(-50%);background:var(--tx);color:var(--bg);padding:8px 14px;border-radius:999px;font-size:13px;z-index:9';$('app').appendChild(e);setTimeout(()=>e.remove(),1400)}
async function copyArt(){const {d,i}=st.stack[st.stack.length-1];const a=DOC[d].arts[i];const t=`${DOC[d].name} – ${lab(a)}. ${a.t}\n\n${a.x.join('\n\n')}`;
try{await navigator.clipboard.writeText(t);toast('Texto copiado')}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('Texto copiado')}catch(_){}ta.remove()}}

document.addEventListener('click',e=>{const el=e.target.closest('[data-go],[data-art],[data-idx],[data-topic],[data-act],[data-nav],[data-qd],[data-theme],[data-fs]');if(!el)return;const ds=el.dataset;
if(ds.art){const[d,i]=ds.art.split(':');openArt(d,+i)}
else if(ds.go)go(ds.go)
else if(ds.idx){st.idxDoc=ds.idx;if(st.tab!=='idx'||st.stack.length)go('idx');else render()}
else if(ds.topic){st.q=ds.topic;go('srch')}
else if(ds.nav){const {d}=st.stack[st.stack.length-1];replaceArt(d,+ds.nav)}
else if(ds.qd){st.qDoc=ds.qd;document.querySelectorAll('[data-qd]').forEach(b=>b.classList.toggle('on',b===el));search()}
else if(ds.theme){store.theme=ds.theme;save();applyTheme();settingsSheet()}
else if(ds.fs){store.fs=+ds.fs;save();settingsSheet()}
else if(ds.act){const a=ds.act,top=st.stack[st.stack.length-1];
 if(a==='back')back();
 else if(a==='settings')settingsSheet();
 else if(a==='close')closeSheet();
 else if(a==='fav'){const k=key(top.d,top.i);store.fav=store.fav.includes(k)?store.fav.filter(x=>x!==k):[k,...store.fav];save();toast(store.fav.includes(k)?'Agregado a favoritos':'Quitado de favoritos');render()}
 else if(a==='fs'){store.fs=store.fs>=21?15:store.fs+2;save();$('atext').style.setProperty('--fs',store.fs+'px')}
 else if(a==='note')noteSheet();
 else if(a==='savenote'){const k=key(top.d,top.i);const v=$('nt').value;if(v.trim())store.notes[k]=v;else delete store.notes[k];save();closeSheet();render()}
 else if(a==='copy')copyArt()
 else if(a==='update'){toast('Buscando…');checkUpdates(true)}}});

// Botón atrás de Android
try{const CapApp=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
 if(CapApp)CapApp.addListener('backButton',()=>{if(!back())CapApp.exitApp()})}catch(e){}
(async()=>{let used=false;try{const s=await idbGet('data');if(s&&s.meta&&s.meta.v>META.v&&validData(s.D)){setData(s.D,s.meta);used=true}}catch(e){}
 if(!used)setData(window.DATA);render();setTimeout(()=>checkUpdates(false),1500)})();
