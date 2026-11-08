(() => {
"use strict";
const KEY="pedidoclaro-demo-v2",seed=[
{id:"PD-1048",client:"Ferretería Central",date:"Hoy · 10:42",channel:"Email",status:"review",lines:[{name:"Tornillo inox A2 5×50",sku:"TOR-INOX-550",qty:12,unit:"caja",price:18.5,issue:"",checked:true},{name:"Taco nylon universal 8 mm",sku:"TACO-UNIV-08",qty:10,unit:"caja",price:7.2,issue:"",checked:true},{name:"Silicona neutra blanca 300 ml",sku:"SIL-NEU-BLA",qty:24,unit:"ud.",price:4.1,issue:"Cantidad superior a la habitual",checked:false}]},
{id:"PD-1047",client:"Suministros La Vega",date:"Hoy · 10:18",channel:"PDF adjunto (simulado)",status:"ready",lines:[{name:"Guante nitrilo reforzado T9",sku:"GUA-NIT-T9",qty:20,unit:"par",price:3.4,issue:"",checked:true},{name:"Disco corte inox 115 mm",sku:"DIS-INOX-115",qty:15,unit:"ud.",price:2.8,issue:"",checked:true}]},
{id:"PD-1046",client:"Instalaciones Ríos",date:"Hoy · 09:56",channel:"Excel (simulado)",status:"review",lines:[{name:"Cable flexible 2,5 mm²",sku:"CAB-FLX-25",qty:6,unit:"rollo",price:34,issue:"",checked:true},{name:"Magnetotérmico 16A curva C",sku:"MAG-16C",qty:8,unit:"ud.",price:9.9,issue:"Confirma el formato 2P / 1P",checked:false}]},
{id:"PD-1045",client:"Obras y Montajes Norte",date:"Hoy · 09:31",channel:"Email",status:"review",lines:[{name:"Tubo PVC evacuación 40 mm",sku:"TUB-PVC-40",qty:30,unit:"barra",price:3.25,issue:"",checked:true},{name:"Codo PVC 40 mm 87°",sku:"CODO-PVC-40",qty:50,unit:"ud.",price:.95,issue:"Referencia ambigua: dos artículos similares",checked:false}]},
{id:"PD-1044",client:"Mantenimiento Alba",date:"Ayer · 16:44",channel:"Email",status:"approved",lines:[{name:"Brida nylon negra 200 mm",sku:"BRI-NYL-200",qty:100,unit:"bolsa",price:2.1,issue:"",checked:true}]}
];
const catalogSeed=[{sku:"TOR-INOX-550",name:"Tornillo inox A2 5×50",unit:"caja",price:18.5},{sku:"TACO-UNIV-08",name:"Taco nylon universal 8 mm",unit:"caja",price:7.2},{sku:"SIL-NEU-BLA",name:"Silicona neutra blanca 300 ml",unit:"ud.",price:4.1},{sku:"GUA-NIT-T9",name:"Guante nitrilo reforzado T9",unit:"par",price:3.4},{sku:"DIS-INOX-115",name:"Disco corte inox 115 mm",unit:"ud.",price:2.8},{sku:"CAB-FLX-25",name:"Cable flexible 2,5 mm²",unit:"rollo",price:34}];
const $=id=>document.getElementById(id),labels={review:"Por revisar",ready:"Listo para aprobar",approved:"Aprobado",rejected:"Descartado"},money=n=>new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n),sum=o=>o.lines.reduce((n,l)=>n+l.qty*l.price,0),issues=o=>o.lines.filter(l=>!l.checked||l.issue).length,final=o=>["approved","rejected"].includes(o.status),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let state={orders:JSON.parse(JSON.stringify(seed)),activity:[],catalog:JSON.parse(JSON.stringify(catalogSeed)),selected:"PD-1048",counter:1048};
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&Array.isArray(saved.orders)&&Array.isArray(saved.activity))state={...state,...saved};}catch{}
if(!Array.isArray(state.catalog))state.catalog=JSON.parse(JSON.stringify(catalogSeed));
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{notify("No se pudo guardar en este navegador.");}}
function notify(s){const e=$("toast");e.textContent=s;e.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(()=>e.classList.remove("show"),2600);}
function log(message,id=""){state.activity.unshift({message,id,time:new Date().toLocaleString("es-ES",{dateStyle:"short",timeStyle:"short"})});state.activity=state.activity.slice(0,100);persist();}
function derived(o){if(final(o))return o.status;return issues(o)?"review":"ready";}
function stats(){$("stat-pending").textContent=state.orders.filter(o=>["review","ready"].includes(o.status)).length;$("stat-ready").textContent=state.orders.filter(o=>o.status==="ready").length;$("stat-issues").textContent=state.orders.reduce((n,o)=>n+issues(o),0);$("stat-approved").textContent=state.orders.filter(o=>o.status==="approved").length;}
function renderList(){stats();const q=$("search").value.trim().toLocaleLowerCase("es"),f=$("filter").value,rows=state.orders.filter(o=>(f==="all"||o.status===f)&&[o.id,o.client,o.channel,...o.lines.map(l=>l.sku+" "+l.name)].join(" ").toLocaleLowerCase("es").includes(q));$("list-count").textContent=rows.length+" de "+state.orders.length+" pedidos";$("order-list").innerHTML=rows.length?rows.map(o=>'<button class="order-card '+(o.id===state.selected?"selected":"")+'" data-order="'+esc(o.id)+'"><div class="order-row"><span class="order-id">'+esc(o.id)+'</span><span class="status '+o.status+'">'+labels[o.status]+'</span></div><div class="order-client">'+esc(o.client)+'</div><div class="order-meta"><span>'+esc(o.channel)+' · '+esc(o.date)+'</span><strong>'+money(sum(o))+'</strong></div></button>').join(""):'<div class="empty-state"><div><div class="empty-icon">⌕</div><b>No hay resultados</b><p>Prueba otro término o cambia el filtro.</p></div></div>';$("order-list").querySelectorAll("[data-order]").forEach(b=>b.onclick=()=>{state.selected=b.dataset.order;render();});renderDetail();}
function renderDetail(){const o=state.orders.find(x=>x.id===state.selected),panel=$("detail-panel");if(!o){panel.innerHTML='<div class="detail-empty"><div><div class="empty-icon">▤</div><b>Selecciona un pedido</b><p>Elige un pedido de la bandeja para revisar sus líneas.</p></div></div>';return;}const n=issues(o),locked=final(o),notice=n?'<div class="notice">⚠ '+n+' línea(s) necesitan revisión. Confirma cada incidencia después de comprobar los datos.</div>':'<div class="notice good">✓ Todas las líneas están revisadas. El pedido puede aprobarse en esta demo.</div>';
const rows=o.lines.map((l,i)=>'<tr><td><div class="line-name">'+esc(l.name)+'</div><div class="line-sub">'+esc(l.unit)+'</div></td><td>'+esc(l.sku)+'</td><td><input class="qty-input" aria-label="Cantidad" type="number" min="1" max="999999" step="1" value="'+l.qty+'" data-qty="'+i+'" '+(locked?"disabled":"")+'></td><td><input class="price-input" aria-label="Precio unitario" type="number" min="0" max="999999" step=".01" value="'+Number(l.price).toFixed(2)+'" data-price="'+i+'" '+(locked?"disabled":"")+'></td><td><div class="line-actions">'+(l.checked&&!l.issue?'<span class="line-flag ok">✓ Revisada</span>':'<span class="line-flag">⚠ '+esc(l.issue||"Pendiente")+'</span>')+(locked?"":(l.checked&&!l.issue?'<button class="iconbtn" data-edit="'+i+'">Editar</button>':'<button class="iconbtn resolve" data-resolve="'+i+'">✓ Confirmar</button>'))+'</div></td></tr>').join("");
panel.innerHTML='<div class="detail-head"><div class="order-row"><span class="eyebrow">'+esc(o.id)+' · '+esc(o.date)+'</span><span class="status '+o.status+'">'+labels[o.status]+'</span></div><h2>'+esc(o.client)+'</h2><p>'+esc(o.channel)+' · '+o.lines.length+' líneas · Datos ficticios</p></div><div class="detail-body">'+notice+'<div class="table-wrap"><table class="lines"><thead><tr><th>PRODUCTO</th><th>REFERENCIA</th><th>CANT.</th><th>PRECIO/U.</th><th>REVISIÓN</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="totals"><span>Total estimado (sin impuestos)</span><strong>'+money(sum(o))+'</strong></div></div><div class="detail-actions"><button class="btn danger smallbtn" id="reject" '+(locked?"disabled":"")+' >Descartar</button><div><button class="btn secondary smallbtn" id="export-one">↓ CSV</button><button class="btn primary smallbtn" id="approve" '+(locked||n?"disabled":"")+'>✓ Aprobar pedido</button></div></div>';
panel.querySelectorAll("[data-qty],[data-price]").forEach(input=>input.onchange=()=>{const i=Number(input.dataset.qty??input.dataset.price),v=Number(input.value),line=o.lines[i];if(!Number.isFinite(v)||v<0||(input.dataset.qty&&(!Number.isInteger(v)||v<1))){notify("Introduce cantidad y precio válidos.");renderDetail();return;}if(input.dataset.qty)line.qty=v;else line.price=Math.round(v*100)/100;line.checked=false;line.issue="Cambios realizados: confirma esta línea de nuevo";o.status="review";log("Editó una línea de "+o.id,o.id);render();});
panel.querySelectorAll("[data-resolve]").forEach(b=>b.onclick=()=>{const l=o.lines[+b.dataset.resolve];l.checked=true;l.issue="";o.status=derived(o);log("Confirmó una línea de "+o.id,o.id);render();});
panel.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const l=o.lines[+b.dataset.edit];l.checked=false;l.issue="Edición pendiente de confirmar";o.status="review";log("Marcó una línea para editar en "+o.id,o.id);render();});
$("approve")?.addEventListener("click",()=>{if(issues(o)){notify("Resuelve todas las incidencias antes de aprobar.");return;}o.status="approved";log("Aprobó "+o.id+" (solo estado local)",o.id);render();notify("Aprobado en la demo. No se envió a ningún ERP.");});
$("reject")?.addEventListener("click",()=>{if(!confirm("¿Descartar este pedido ficticio?"))return;o.status="rejected";log("Descartó "+o.id+" en la demo",o.id);render();notify("Pedido descartado en la demo.");});
$("export-one")?.addEventListener("click",()=>exportCsv([o]));}
function safeCell(v){let s=String(v??"");if(/^[\s]*[=+@\-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function exportCsv(orders){const heads=["pedido","cliente","estado","canal","referencia","producto","cantidad","unidad","precio_unitario","importe","revision"],rows=[heads,...orders.flatMap(o=>o.lines.map(l=>[o.id,o.client,labels[o.status],o.channel,l.sku,l.name,l.qty,l.unit,l.price.toFixed(2),(l.qty*l.price).toFixed(2),l.checked&&!l.issue?"revisada":l.issue||"pendiente"]))],blob=new Blob(["\ufeff"+rows.map(r=>r.map(safeCell).join(";")).join("\r\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="pedidoclaro-"+(orders.length===1?orders[0].id.toLowerCase():"bandeja")+".csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);notify("CSV generado con "+orders.length+" pedido(s).");}

function renderCatalog(){
 const q=($("catalog-search")?.value||"").trim().toLocaleLowerCase("es");
 const rows=state.catalog.filter(p=>(p.sku+" "+p.name+" "+p.unit).toLocaleLowerCase("es").includes(q));
 $("catalog-count").textContent=state.catalog.length+" referencias · Almacenamiento local";
 $("catalog-list").innerHTML=rows.length?rows.map(p=>'<tr><td><b>'+esc(p.sku)+'</b></td><td>'+esc(p.name)+'</td><td>'+esc(p.unit)+'</td><td>'+money(p.price)+'</td><td><button class="iconbtn" data-product-delete="'+esc(p.sku)+'">Eliminar</button></td></tr>').join(""):'<tr><td colspan="5"><div class="empty-state"><div><b>No hay productos</b><p>Prueba otra búsqueda o añade una referencia.</p></div></div></td></tr>';
 $("catalog-list").querySelectorAll("[data-product-delete]").forEach(b=>b.onclick=()=>{
  const sku=b.dataset.productDelete;
  if(!confirm("¿Eliminar "+sku+" del catálogo local?"))return;
  state.catalog=state.catalog.filter(p=>p.sku!==sku);persist();log("Eliminó "+sku+" del catálogo");renderCatalog();notify("Producto eliminado del catálogo.");
 });
}
function catalogCsvExport(){
 const rows=[["referencia","producto","unidad","precio_unitario"],...state.catalog.map(p=>[p.sku,p.name,p.unit,p.price.toFixed(2)])];
 downloadFile("pedidoclaro-catalogo.csv","\ufeff"+rows.map(r=>r.map(safeCell).join(";")).join("\r\n"),"text/csv;charset=utf-8");
 notify("Catálogo exportado: "+state.catalog.length+" productos.");
}
async function catalogCsvImport(file){
 if(!file)return;
 if(file.size>2*1024*1024)throw new Error("El catálogo supera el límite de 2 MB.");
 const rows=csvParse(await file.text());if(rows.length<2)throw new Error("El CSV está vacío o solo contiene encabezados.");
 if(rows.length>5001)throw new Error("Máximo 5.000 productos por importación.");
 const headers=rows.shift().map(normHeader),idx=(...names)=>headers.findIndex(h=>names.includes(h));
 const cols={sku:idx("referencia","sku","codigo","codigo_producto"),name:idx("producto","product","descripcion","nombre"),unit:idx("unidad","unit","ud"),price:idx("precio_unitario","precio","price","unit_price")};
 const missing=["sku","name","price"].filter(k=>cols[k]<0);if(missing.length)throw new Error("Faltan columnas: "+missing.join(", ")+".");
 let added=0,updated=0,invalid=0;
 for(const row of rows){
  const get=k=>cols[k]<0?"":String(row[cols[k]]??"").trim();
  const sku=get("sku").slice(0,80),name=get("name").slice(0,160),unit=(get("unit")||"ud.").slice(0,30),price=parseNumber(get("price"));
  if(!sku||!name||!get("price")||!Number.isFinite(price)||price<0||price>999999){invalid++;continue;}
  const found=state.catalog.find(p=>p.sku.toLocaleLowerCase("es")===sku.toLocaleLowerCase("es"));
  if(found){found.name=name;found.unit=unit;found.price=Math.round(price*100)/100;updated++;}
  else{state.catalog.push({sku,name,unit,price:Math.round(price*100)/100});added++;}
 }
 if(!added&&!updated)throw new Error("No se encontraron productos válidos.");
 state.catalog.sort((a,b)=>a.sku.localeCompare(b.sku,"es"));persist();log("Importó catálogo: "+added+" nuevos y "+updated+" actualizados");renderCatalog();
 notify("Catálogo actualizado: "+added+" nuevos, "+updated+" actualizados y "+invalid+" omitidos.");
}

function renderActivity(){$("activity-list").innerHTML=state.activity.length?state.activity.map(a=>'<div class="activity-row"><span class="activity-dot"></span><div><p>'+esc(a.message)+'</p><small>'+esc(a.time)+(a.id?" · "+esc(a.id):"")+'</small></div></div>').join(""):'<div class="empty-state"><div><div class="empty-icon">◷</div><b>Sin actividad todavía</b><p>Las acciones de esta demo aparecerán aquí.</p></div></div>';}

function downloadFile(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function csvParse(text){
 const first=(text.split(/\r?\n/,1)[0]||"");let delimiter=";",best=-1;
 for(const d of [";",",","\t"]){let n=0,q=false;for(let i=0;i<first.length;i++){if(first[i]==='"'){if(q&&first[i+1]==='"'){i++;continue;}q=!q;}else if(first[i]===d&&!q)n++;}if(n>best){best=n;delimiter=d;}}
 const rows=[];let row=[],cell="",quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"')quoted=true;else if(c===delimiter){row.push(cell);cell="";}else if(c==="\n"){row.push(cell.replace(/\r$/,""));if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";}else cell+=c;}
 row.push(cell.replace(/\r$/,""));if(row.some(x=>x.trim()))rows.push(row);if(quoted)throw new Error("El CSV contiene comillas sin cerrar.");return rows;
}
function normHeader(s){return String(s||"").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s-]+/g,"_");}
function parseNumber(s){let v=String(s??"").trim().replace(/\s/g,"");if(v.includes(",")&&v.includes("."))v=v.replace(/\./g,"").replace(",",".");else v=v.replace(",",".");return Number(v);}
async function importCsvFile(file){
 if(!file)return;if(file.size>2*1024*1024)throw new Error("El CSV supera el límite de 2 MB.");
 const rows=csvParse(await file.text());if(rows.length<2)throw new Error("El CSV está vacío o solo contiene encabezados.");
 if(rows.length>1001)throw new Error("Máximo 1.000 líneas por importación.");
 const headers=rows.shift().map(normHeader),idx=(...names)=>headers.findIndex(h=>names.includes(h));
 const cols={order:idx("pedido","order_id","id_pedido","numero_pedido"),client:idx("cliente","customer","empresa"),sku:idx("referencia","sku","codigo","codigo_producto"),name:idx("producto","product","descripcion","nombre"),qty:idx("cantidad","qty","quantity"),unit:idx("unidad","unit","ud"),price:idx("precio_unitario","precio","price","unit_price")};
 const required=["client","sku","name","qty","price"];const missing=required.filter(k=>cols[k]<0);
 if(missing.length)throw new Error("Faltan columnas obligatorias: "+missing.join(", ")+". Descarga la plantilla para ver el formato.");
 const groups=new Map();let invalid=0;
 rows.forEach((r,i)=>{const get=k=>cols[k]<0?"":String(r[cols[k]]??"").trim(),client=get("client"),sku=get("sku"),name=get("name"),qty=parseNumber(get("qty")),price=parseNumber(get("price")),unit=get("unit")||"ud.",source=get("order")||("Fila "+(i+2));
 if(!client||!sku||!name||!get("qty")||!get("price")||!Number.isInteger(qty)||qty<1||qty>999999||!Number.isFinite(price)||price<0||price>999999){invalid++;return;}
 const key=source+"|"+client;if(!groups.has(key))groups.set(key,{sourceId:key,sourceRef:source,client,lines:[]});
 groups.get(key).lines.push({name:name.slice(0,160),sku:sku.slice(0,80),qty,unit:unit.slice(0,30),price:Math.round(price*100)/100,issue:"Importada desde CSV: confirma referencia, cantidad y precio",checked:false});
 });
 if(!groups.size)throw new Error("No se ha encontrado ninguna línea válida. Revisa cantidades, precios y columnas.");
 let added=0,skipped=0;
 for(const g of groups.values()){
  if(state.orders.some(o=>o.sourceId===g.sourceId)){skipped++;continue;}
  state.counter=Math.max(state.counter,...state.orders.map(o=>Number(o.id.slice(3))||0))+1;
  state.orders.unshift({id:"PD-"+state.counter,sourceId:g.sourceId,sourceRef:g.sourceRef,client:g.client.slice(0,120),date:"Importado ahora",channel:"CSV importado",status:"review",lines:g.lines});
  added++;
 }
 if(!added)throw new Error("Todos los pedidos del fichero ya estaban importados.");
 state.selected=state.orders[0].id;log("Importó "+added+" pedido(s) desde CSV; omitidos por duplicado: "+skipped);render();
 notify("Importados "+added+" pedido(s). Líneas no válidas omitidas: "+invalid+". Duplicados omitidos: "+skipped+".");
}
function backupData(){
 const payload={app:"PedidoClaro",version:2,exportedAt:new Date().toISOString(),counter:state.counter,orders:state.orders,activity:state.activity,catalog:state.catalog};
 downloadFile("pedidoclaro-copia-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify(payload,null,2),"application/json;charset=utf-8");
 log("Descargó una copia de seguridad local");notify("Copia JSON descargada.");
}
async function restoreData(file){
 if(!file)return;if(file.size>8*1024*1024)throw new Error("La copia supera el límite de 8 MB.");
 const data=JSON.parse(await file.text());if(data.app!=="PedidoClaro"||data.version!==2||!Array.isArray(data.orders)||!Array.isArray(data.activity))throw new Error("El fichero no es una copia válida de PedidoClaro v2.");
 if(data.orders.length>5000||data.activity.length>1000)throw new Error("La copia contiene demasiados registros.");
 const cleanOrders=data.orders.map((o,i)=>{
  if(!o||typeof o!=="object"||!Array.isArray(o.lines)||o.lines.length>100)throw new Error("Pedido inválido en la copia (registro "+(i+1)+").");
  const status=["review","ready","approved","rejected"].includes(o.status)?o.status:"review";
  const lines=o.lines.map(l=>{const qty=Number(l.qty),price=Number(l.price);if(!l||!String(l.name||"").trim()||!String(l.sku||"").trim()||!Number.isInteger(qty)||qty<1||qty>999999||!Number.isFinite(price)||price<0||price>999999)throw new Error("Línea inválida en "+String(o.id||"pedido")+".");return {name:String(l.name).slice(0,160),sku:String(l.sku).slice(0,80),qty,unit:String(l.unit||"ud.").slice(0,30),price:Math.round(price*100)/100,issue:String(l.issue||"").slice(0,240),checked:l.checked===true};});
  return {id:String(o.id||"").slice(0,40),sourceId:o.sourceId?String(o.sourceId).slice(0,240):undefined,sourceRef:o.sourceRef?String(o.sourceRef).slice(0,100):undefined,client:String(o.client||"Cliente").slice(0,120),date:String(o.date||"Restaurado").slice(0,80),channel:String(o.channel||"Copia restaurada").slice(0,80),status,lines};
 });
 const cleanActivity=data.activity.map(a=>({message:String(a?.message||"Actividad").slice(0,240),id:String(a?.id||"").slice(0,40),time:String(a?.time||"").slice(0,80)}));
 const cleanCatalog=Array.isArray(data.catalog)?data.catalog.map(p=>{const price=Number(p?.price);if(!p||!String(p.sku||"").trim()||!String(p.name||"").trim()||!Number.isFinite(price)||price<0||price>999999)throw new Error("Producto inválido en la copia.");return {sku:String(p.sku).slice(0,80),name:String(p.name).slice(0,160),unit:String(p.unit||"ud.").slice(0,30),price:Math.round(price*100)/100};}):JSON.parse(JSON.stringify(catalogSeed));
 if(cleanCatalog.length>5000)throw new Error("La copia contiene demasiados productos.");
 if(!confirm("Esto sustituirá los pedidos y el historial guardados en este navegador. ¿Continuar?"))return;
 state.orders=cleanOrders;state.catalog=cleanCatalog;state.orders.forEach(o=>{if(!["approved","rejected"].includes(o.status))o.status=derived(o);});state.activity=cleanActivity;state.counter=Math.max(Number(data.counter)||0,...cleanOrders.map(o=>Number(String(o.id).replace("PD-",""))||0));state.selected=state.orders[0]?.id||null;persist();render();notify("Copia restaurada correctamente.");
}

function render(){renderList();renderCatalog();renderActivity();}
function addOrder(client,channel,lines){state.counter=Math.max(state.counter,...state.orders.map(o=>Number(o.id.slice(3))||0))+1;const o={id:"PD-"+state.counter,client,date:"Ahora",channel,status:"review",lines};o.status=derived(o);state.orders.unshift(o);state.selected=o.id;log("Creó el pedido ficticio "+o.id,o.id);render();notify("Pedido ficticio añadido.");}
function parseText(){const raw=$("raw-order").value.trim();if(!raw){notify("Pega un pedido de ejemplo primero.");return;}const client=(raw.match(/cliente\s*:\s*([^\n;]+)/i)||[])[1]?.trim()||"Cliente de texto",rules=[{re:/(\d+)\s*(?:cajas?\s+de\s+)?tornillos?/i,name:"Tornillo inox A2 5×50",sku:"TOR-INOX-550",unit:"caja",price:18.5},{re:/(\d+)\s*(?:unidades?|uds?\.?|ud\.?)\s+de\s+silicona/i,name:"Silicona neutra blanca 300 ml",sku:"SIL-NEU-BLA",unit:"ud.",price:4.1},{re:/(\d+)\s*(?:cajas?\s+de\s+)?tacos?/i,name:"Taco nylon universal 8 mm",sku:"TACO-UNIV-08",unit:"caja",price:7.2},{re:/(\d+)\s*(?:unidades?|uds?\.?|ud\.?)\s+de\s+discos?\s+de\s+corte/i,name:"Disco corte inox 115 mm",sku:"DIS-INOX-115",unit:"ud.",price:2.8}],lines=rules.flatMap(r=>{const m=raw.match(r.re);return m?[{name:r.name,sku:r.sku,qty:+m[1],unit:r.unit,price:r.price,issue:"Confirma la referencia y cantidad extraída",checked:false}]:[];});if(!lines.length){notify("No reconozco artículos. Prueba con tornillos, tacos o silicona.");return;}addOrder(client,"Texto pegado (parser local)",lines);$("raw-order").value="";}
function view(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name));document.querySelectorAll(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("crumb").textContent={orders:"Bandeja de pedidos",catalog:"Catálogo de productos",activity:"Actividad reciente",guide:"Cómo funciona"}[name];if(name==="catalog")renderCatalog();}
$("search").oninput=renderList;$("filter").onchange=renderList;

$("catalog-search").oninput=renderCatalog;
$("catalog-add").onclick=()=>{$("product-form").reset();$("product-unit").value="ud.";$("product-price").value="0";$("product-dialog").showModal();$("product-sku").focus();};
$("product-form").addEventListener("submit",e=>{if(e.submitter?.id!=="save-product")return;e.preventDefault();const sku=$("product-sku").value.trim(),name=$("product-name").value.trim(),unit=$("product-unit").value.trim()||"ud.",price=Number($("product-price").value);if(!sku||!name||!Number.isFinite(price)||price<0||price>999999){notify("Revisa los datos del producto.");return;}if(state.catalog.some(p=>p.sku.toLocaleLowerCase("es")===sku.toLocaleLowerCase("es"))){notify("Ya existe esa referencia. Usa otra o importa el CSV para actualizarla.");return;}state.catalog.push({sku:sku.slice(0,80),name:name.slice(0,160),unit:unit.slice(0,30),price:Math.round(price*100)/100});state.catalog.sort((a,b)=>a.sku.localeCompare(b.sku,"es"));persist();log("Añadió "+sku+" al catálogo");$("product-dialog").close();renderCatalog();notify("Producto añadido al catálogo.");});
$("catalog-export").onclick=catalogCsvExport;
$("catalog-import").onclick=()=>$("catalog-file").click();
$("catalog-file").onchange=async e=>{try{await catalogCsvImport(e.target.files[0]);}catch(err){notify(err.message||"No se pudo importar el catálogo.");}finally{e.target.value="";}};
$("new-order").onclick=()=>{$("order-dialog").showModal();$("client-name").focus();};
$("order-form").addEventListener("submit",e=>{if(e.submitter?.id!=="create-order")return;e.preventDefault();const client=$("client-name").value.trim();if(!client){notify("Introduce un cliente ficticio.");return;}$("order-dialog").close();addOrder(client,$("channel").value,[{name:"Material eléctrico surtido",sku:"MAT-SURT-01",qty:5,unit:"caja",price:22.5,issue:"Confirma la composición del surtido",checked:false},{name:"Accesorios de instalación",sku:"ACC-INST-02",qty:3,unit:"lote",price:14,issue:"Confirma el contenido del lote",checked:false}]);});
$("parse-order").onclick=parseText;$("export-all").onclick=()=>state.orders.length?exportCsv(state.orders):notify("No hay pedidos que exportar.");$("clear-activity").onclick=()=>{if(!confirm("¿Limpiar el historial local?"))return;state.activity=[];persist();renderActivity();};
document.querySelectorAll(".navbtn").forEach(b=>b.onclick=()=>view(b.dataset.view));

$("import-csv").onclick=()=>$("csv-file").click();
$("csv-file").onchange=async e=>{try{await importCsvFile(e.target.files[0]);}catch(err){notify(err.message||"No se pudo importar el CSV.");}finally{e.target.value="";}};
$("csv-template").onclick=()=>downloadFile("plantilla-pedidoclaro.csv","pedido;cliente;referencia;producto;cantidad;unidad;precio_unitario\nPED-001;Ferreteria Ejemplo;TOR-INOX-550;Tornillo inox A2 5x50;12;caja;18.50\nPED-001;Ferreteria Ejemplo;SIL-NEU-BLA;Silicona neutra blanca 300 ml;24;ud.;4.10\n","text/csv;charset=utf-8");
$("backup-data").onclick=backupData;
$("restore-data").onclick=()=>$("backup-file").click();
$("backup-file").onchange=async e=>{try{await restoreData(e.target.files[0]);}catch(err){notify(err.message||"No se pudo restaurar la copia.");}finally{e.target.value="";}};
let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("install-app").hidden=false;});
$("install-app").onclick=async()=>{if(!installPrompt){notify("Usa el menú del navegador para instalar la aplicación.");return;}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("install-app").hidden=true;};
if("serviceWorker" in navigator && location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}

render();
})();