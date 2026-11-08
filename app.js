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
let editingCatalogSku=null;
const selectedOrderIds=new Set();
const defaultRules={maxQuantity:999999,priceTolerancePct:2,unknownSku:"review",duplicateSku:"review"};
let state={orders:JSON.parse(JSON.stringify(seed)),activity:[],catalog:JSON.parse(JSON.stringify(catalogSeed)),rules:{...defaultRules},selected:"PD-1048",counter:1048};
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&Array.isArray(saved.orders)&&Array.isArray(saved.activity))state={...state,...saved};}catch{}
if(!Array.isArray(state.catalog))state.catalog=JSON.parse(JSON.stringify(catalogSeed));
state.rules={...defaultRules,...(state.rules||{})};
state.rules.maxQuantity=Math.min(999999,Math.max(1,Math.floor(Number(state.rules.maxQuantity)||999999)));
state.rules.priceTolerancePct=Math.min(100,Math.max(0,Number(state.rules.priceTolerancePct)||0));
if(!["review","block"].includes(state.rules.unknownSku))state.rules.unknownSku="review";
if(!["review","block"].includes(state.rules.duplicateSku))state.rules.duplicateSku="review";
function priceDiffers(reference,actual){return Math.abs(Number(reference)-Number(actual))>Math.max(0.01,Math.abs(Number(reference))*state.rules.priceTolerancePct/100);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{notify("No se pudo guardar en este navegador.");}}
function notify(s){const e=$("toast");e.textContent=s;e.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(()=>e.classList.remove("show"),2600);}
function log(message,id=""){state.activity.unshift({message,id,time:new Date().toLocaleString("es-ES",{dateStyle:"short",timeStyle:"short"})});state.activity=state.activity.slice(0,100);persist();}
function derived(o){if(final(o))return o.status;return issues(o)?"review":"ready";}
function stats(){$("stat-pending").textContent=state.orders.filter(o=>["review","ready"].includes(o.status)).length;$("stat-ready").textContent=state.orders.filter(o=>o.status==="ready").length;$("stat-issues").textContent=state.orders.reduce((n,o)=>n+issues(o),0);$("stat-approved").textContent=state.orders.filter(o=>o.status==="approved").length;}
function getVisibleOrders(){
 const q=$("search").value.trim().toLocaleLowerCase("es"),f=$("filter").value,sort=$("sort-orders")?.value||"recent";
 const rows=state.orders.filter(o=>(f==="all"||o.status===f)&&[o.id,o.client,o.channel,...o.lines.map(l=>l.sku+" "+l.name)].join(" ").toLocaleLowerCase("es").includes(q));
 const statusRank={review:0,ready:1,approved:2,rejected:3};
 if(sort==="priority")rows.sort((a,b)=>issues(b)-issues(a)||statusRank[a.status]-statusRank[b.status]);
 else if(sort==="value-desc")rows.sort((a,b)=>sum(b)-sum(a));
 else if(sort==="value-asc")rows.sort((a,b)=>sum(a)-sum(b));
 else if(sort==="client")rows.sort((a,b)=>a.client.localeCompare(b.client,"es"));
 return rows;
}
function updateBulkBar(){
 const visible=getVisibleOrders(),selected=state.orders.filter(o=>selectedOrderIds.has(o.id)),eligible=selected.filter(o=>!final(o)&&!issues(o)&&o.status==="ready");
 const bar=$("bulk-bar");if(!bar)return;
 bar.hidden=!selected.length;
 $("bulk-selected-count").textContent=selected.length+" seleccionados";
 $("bulk-approve").disabled=!eligible.length;
 $("bulk-approve").textContent="✓ Aprobar listos ("+eligible.length+")";
 $("bulk-export-csv").disabled=!selected.length;$("bulk-export-xlsx").disabled=!selected.length;
 const all=visible.length>0&&visible.every(o=>selectedOrderIds.has(o.id));
 $("select-visible").checked=all;$("select-visible").indeterminate=!all&&visible.some(o=>selectedOrderIds.has(o.id));
}
function renderList(){
 stats();const rows=getVisibleOrders();$("list-count").textContent=rows.length+" de "+state.orders.length+" pedidos";
 $("export-filtered").disabled=!rows.length;$("export-filtered-xlsx").disabled=!rows.length;
 $("order-list").innerHTML=rows.length?rows.map(o=>'<div class="order-card '+(o.id===state.selected?"selected":"")+'" data-order-card="'+esc(o.id)+'"><label class="order-select" title="Seleccionar pedido"><input type="checkbox" data-select-order="'+esc(o.id)+'" '+(selectedOrderIds.has(o.id)?"checked":"")+' aria-label="Seleccionar '+esc(o.id)+'"></label><div class="order-card-main" role="button" tabindex="0" data-order="'+esc(o.id)+'"><div class="order-row"><span class="order-id">'+esc(o.id)+'</span><span class="status '+o.status+'">'+labels[o.status]+'</span></div><div class="order-client">'+esc(o.client)+'</div><div class="order-meta"><span>'+esc(o.channel)+' · '+esc(o.date)+'</span><strong>'+money(sum(o))+'</strong></div></div></div>').join(""):'<div class="empty-state"><div><div class="empty-icon">⌕</div><b>No hay resultados</b><p>Prueba otro término o cambia el filtro.</p></div></div>';
 $("order-list").querySelectorAll("[data-order]").forEach(b=>{b.onclick=()=>{state.selected=b.dataset.order;render();};b.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();state.selected=b.dataset.order;render();}};});
 $("order-list").querySelectorAll("[data-select-order]").forEach(input=>input.onchange=()=>{if(input.checked)selectedOrderIds.add(input.dataset.selectOrder);else selectedOrderIds.delete(input.dataset.selectOrder);updateBulkBar();});
 updateBulkBar();renderDetail();
}
function renderDetail(){const o=state.orders.find(x=>x.id===state.selected),panel=$("detail-panel");if(!o){panel.innerHTML='<div class="detail-empty"><div><div class="empty-icon">▤</div><b>Selecciona un pedido</b><p>Elige un pedido de la bandeja para revisar sus líneas.</p></div></div>';return;}const n=issues(o),locked=final(o),notice=n?'<div class="notice">⚠ '+n+' línea(s) necesitan revisión. Confirma cada incidencia después de comprobar los datos.</div>':'<div class="notice good">✓ Todas las líneas están revisadas. El pedido puede aprobarse en esta demo.</div>';
const rows=o.lines.map((l,i)=>'<tr><td><div class="line-name">'+esc(l.name)+'</div><div class="line-sub">'+esc(l.unit)+'</div></td><td>'+esc(l.sku)+'</td><td><input class="qty-input" aria-label="Cantidad" type="number" min="1" max="999999" step="1" value="'+l.qty+'" data-qty="'+i+'" '+(locked?"disabled":"")+'></td><td><input class="price-input" aria-label="Precio unitario" type="number" min="0" max="999999" step=".01" value="'+Number(l.price).toFixed(2)+'" data-price="'+i+'" '+(locked?"disabled":"")+'></td><td><div class="line-actions">'+(l.checked&&!l.issue?'<span class="line-flag ok" title="Revisión confirmada manualmente">✓ Revisada</span>'+(l.reviewedAt?'<small class="line-reviewed-at">Confirmada '+esc(l.reviewedAt)+'</small>':'')+'':'<span class="line-flag">⚠ '+esc(l.issue||"Pendiente")+'</span>')+(locked?"":((state.catalog.some(p=>p.sku.toLocaleLowerCase("es")===l.sku.toLocaleLowerCase("es"))?'<button class="iconbtn" data-catalog-apply="'+i+'">↻ Catálogo</button>':"")+(l.checked&&!l.issue?'<button class="iconbtn" data-edit="'+i+'">Reabrir</button>':'<button class="iconbtn resolve" data-resolve="'+i+'">✓ Confirmar incidencia</button>')))+'</div></td></tr>').join("");
panel.innerHTML='<div class="detail-head"><div class="order-row"><span class="eyebrow">'+esc(o.id)+' · '+esc(o.date)+'</span><span class="status '+o.status+'">'+labels[o.status]+'</span></div><h2>'+esc(o.client)+'</h2><p>'+esc(o.channel)+' · '+o.lines.length+' líneas · Datos ficticios</p></div><div class="detail-body">'+notice+'<div class="table-wrap"><table class="lines"><thead><tr><th>PRODUCTO</th><th>REFERENCIA</th><th>CANT.</th><th>PRECIO/U.</th><th>REVISIÓN</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="totals"><span>Total estimado (sin impuestos)</span><strong>'+money(sum(o))+'</strong></div></div><div class="detail-actions"><button class="btn danger smallbtn" id="reject" '+(locked?"disabled":"")+' >Descartar</button><div><button class="btn secondary smallbtn" id="export-one">↓ CSV</button><button class="btn secondary smallbtn" id="export-one-xlsx">↓ Excel</button><button class="btn primary smallbtn" id="approve" '+(locked||n?"disabled":"")+'>✓ Aprobar pedido</button></div></div>';
panel.querySelectorAll("[data-qty],[data-price]").forEach(input=>input.onchange=()=>{const i=Number(input.dataset.qty??input.dataset.price),v=Number(input.value),line=o.lines[i];if(!Number.isFinite(v)||v<0||v>999999||(input.dataset.qty&&(!Number.isInteger(v)||v<1))){notify("Introduce cantidad y precio válidos.");renderDetail();return;}if(input.dataset.qty)line.qty=v;else line.price=Math.round(v*100)/100;line.checked=false;line.reviewedAt="";line.issue="Cambios realizados: confirma esta línea de nuevo";o.status="review";log("Editó una línea de "+o.id,o.id);render();});
panel.querySelectorAll("[data-catalog-apply]").forEach(b=>b.onclick=()=>{const line=o.lines[Number(b.dataset.catalogApply)],p=state.catalog.find(x=>x.sku.toLocaleLowerCase("es")===line.sku.toLocaleLowerCase("es"));if(!p)return;line.name=p.name;line.unit=p.unit;line.price=p.price;line.checked=false;line.reviewedAt="";line.issue="Datos actualizados desde catálogo: confirma la línea";o.status="review";log("Actualizó "+line.sku+" desde el catálogo en "+o.id,o.id);render();notify("Datos del catálogo aplicados. Revisa y confirma la línea.");});
panel.querySelectorAll("[data-resolve]").forEach(b=>b.onclick=()=>{
 const l=o.lines[+b.dataset.resolve];
 if(!l||locked)return;
 l.checked=true;l.issue="";l.reviewedAt=new Date().toLocaleString("es-ES",{dateStyle:"short",timeStyle:"short"});
 o.status=derived(o);log("Confirmó la revisión de "+l.sku+" en "+o.id,o.id);
 render();notify("Incidencia confirmada. La línea sale de la cola de revisión.");
});
panel.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const l=o.lines[+b.dataset.edit];l.checked=false;l.reviewedAt="";l.issue="Edición pendiente de confirmar";o.status="review";log("Marcó una línea para editar en "+o.id,o.id);render();});
$("approve")?.addEventListener("click",()=>{if(issues(o)){notify("Resuelve todas las incidencias antes de aprobar.");return;}o.status="approved";log("Aprobó "+o.id+" (solo estado local)",o.id);render();notify("Aprobado en la demo. No se envió a ningún ERP.");});
$("reject")?.addEventListener("click",()=>{if(!confirm("¿Descartar este pedido ficticio?"))return;o.status="rejected";log("Descartó "+o.id+" en la demo",o.id);render();notify("Pedido descartado en la demo.");});
$("export-one")?.addEventListener("click",()=>exportCsv([o]));$("export-one-xlsx")?.addEventListener("click",()=>exportOrdersXlsx([o]));}
function safeCell(v){let s=String(v??"");if(/^[\s]*[=+@\-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function downloadImportErrors(filename,headers,errors){
 if(!errors.length)return;
 const rows=[["fila_csv","motivo",...headers],...errors.map(e=>[e.row,e.reason,...e.values])];
 const csv=String.fromCharCode(0xfeff)+rows.map(row=>row.map(safeCell).join(";")).join(String.fromCharCode(13,10));
 downloadFile(filename,csv,"text/csv;charset=utf-8");
}

// Generador XLSX mínimo sin dependencias externas: libro real compatible con Excel.
function xmlEsc(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function excelCol(n){let out="";while(n){const r=(n-1)%26;out=String.fromCharCode(65+r)+out;n=Math.floor((n-1)/26);}return out;}
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function zipStore(files){
 const enc=new TextEncoder(),local=[],central=[];let offset=0;
 for(const [name,content] of Object.entries(files)){
  const n=enc.encode(name),data=typeof content==="string"?enc.encode(content):content,crc=crc32(data);
  const h=new Uint8Array(30+n.length),v=new DataView(h.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0,true);v.setUint16(8,0,true);v.setUint16(10,0,true);v.setUint16(12,0x21,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,n.length,true);v.setUint16(28,0,true);h.set(n,30);
  local.push(h,data);
  const c=new Uint8Array(46+n.length),d=new DataView(c.buffer);
  d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0,true);d.setUint16(10,0,true);d.setUint16(12,0,true);d.setUint16(14,0x21,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,n.length,true);d.setUint16(30,0,true);d.setUint16(32,0,true);d.setUint16(34,0,true);d.setUint16(36,0,true);d.setUint32(38,0,true);d.setUint32(42,offset,true);c.set(n,46);central.push(c);offset+=h.length+data.length;
 }
 const centralSize=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);
 v.setUint32(0,0x06054b50,true);v.setUint16(4,0,true);v.setUint16(6,0,true);v.setUint16(8,central.length,true);v.setUint16(10,central.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);v.setUint16(20,0,true);
 return new Blob([...local,...central,end],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
function downloadXlsx(filename,sheetName,headers,records,widths,numericCols=[],moneyCols=[]){
 const matrix=[headers,...records],lastCol=excelCol(headers.length),lastRow=matrix.length;
 const cols=widths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join("");
 const rows=matrix.map((row,ri)=>'<row r="'+(ri+1)+'"'+(ri===0?' ht="28" customHeight="1"':"")+'>'+row.map((value,ci)=>{
  const ref=excelCol(ci+1)+(ri+1),style=ri===0?1:moneyCols.includes(ci)?3:numericCols.includes(ci)?4:0;
  if(typeof value==="number"&&Number.isFinite(value))return '<c r="'+ref+'" s="'+style+'"><v>'+value+'</v></c>';
  return '<c r="'+ref+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+xmlEsc(value)+'</t></is></c>';
 }).join("")+'</row>').join("");
 const sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>'+cols+'</cols><sheetData>'+rows+'</sheetData><autoFilter ref="A1:'+lastCol+lastRow+'"/></worksheet>';
 const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF172B4D"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><bottom style="thin"><color rgb="FFDCE3ED"/></bottom><left/><right/><top/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0"/><xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0"/><xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
 const files={"[Content_Types].xml":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',"_rels/.rels":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',"xl/workbook.xml":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="'+xmlEsc(sheetName.slice(0,31))+'" sheetId="1" r:id="rId1"/></sheets></workbook>',"xl/_rels/workbook.xml.rels":'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',"xl/styles.xml":styles,"xl/worksheets/sheet1.xml":sheet};
 const blob=zipStore(files),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 notify("Excel generado: "+records.length+" filas.");
}
function exportOrdersXlsx(orders){
 const heads=["Pedido","Cliente","Estado","Canal","Referencia","Producto","Cantidad","Unidad","Precio unitario (€)","Importe (€)","Revisión"];
 const rows=orders.flatMap(o=>o.lines.map(l=>[o.id,o.client,labels[o.status],o.channel,l.sku,l.name,l.qty,l.unit,l.price,Math.round(l.qty*l.price*100)/100,l.checked&&!l.issue?"Revisada":l.issue||"Pendiente"]));
 downloadXlsx("pedidoclaro-pedidos.xlsx","Pedidos",heads,rows,[16,25,19,22,20,34,12,14,20,18,42],[6],[8,9]);
}
function exportCatalogXlsx(){
 const heads=["Referencia / SKU","Producto","Unidad","Precio de referencia (€)"];
 const rows=state.catalog.map(p=>[p.sku,p.name,p.unit,p.price]);
 downloadXlsx("pedidoclaro-catalogo.xlsx","Catálogo",heads,rows,[24,38,16,25],[],[3]);
}

function exportCsv(orders){const heads=["pedido","cliente","estado","canal","referencia","producto","cantidad","unidad","precio_unitario","importe","revision"],rows=[heads,...orders.flatMap(o=>o.lines.map(l=>[o.id,o.client,labels[o.status],o.channel,l.sku,l.name,l.qty,l.unit,l.price.toFixed(2),(l.qty*l.price).toFixed(2),l.checked&&!l.issue?"revisada":l.issue||"pendiente"]))],blob=new Blob(["\ufeff"+rows.map(r=>r.map(safeCell).join(";")).join("\r\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="pedidoclaro-"+(orders.length===1?orders[0].id.toLowerCase():"bandeja")+".csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);notify("CSV generado con "+orders.length+" pedido(s).");}

function renderCatalog(){
 const q=($("catalog-search")?.value||"").trim().toLocaleLowerCase("es");
 const rows=state.catalog.filter(p=>(p.sku+" "+p.name+" "+p.unit).toLocaleLowerCase("es").includes(q));
 $("catalog-count").textContent=state.catalog.length+" referencias · Almacenamiento local";
 $("catalog-list").innerHTML=rows.length?rows.map(p=>'<tr><td><b>'+esc(p.sku)+'</b></td><td>'+esc(p.name)+'</td><td>'+esc(p.unit)+'</td><td>'+money(p.price)+'</td><td><button class="iconbtn" data-product-edit="'+esc(p.sku)+'">Editar</button> <button class="iconbtn" data-product-delete="'+esc(p.sku)+'">Eliminar</button></td></tr>').join(""):'<tr><td colspan="5"><div class="empty-state"><div><b>No hay productos</b><p>Prueba otra búsqueda o añade una referencia.</p></div></div></td></tr>';
 $("catalog-list").querySelectorAll("[data-product-edit]").forEach(b=>b.onclick=()=>{const p=state.catalog.find(x=>x.sku===b.dataset.productEdit);if(!p)return;editingCatalogSku=p.sku;$("product-dialog-title").textContent="Editar producto";$("product-sku").value=p.sku;$("product-name").value=p.name;$("product-unit").value=p.unit;$("product-price").value=p.price;$("product-dialog").showModal();});
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
 const originalHeaders=rows.shift(),headers=originalHeaders.map(normHeader),idx=(...names)=>headers.findIndex(h=>names.includes(h));
 validateCsvHeaders(originalHeaders);
 const cols={sku:idx("referencia","sku","codigo","codigo_producto"),name:idx("producto","product","descripcion","nombre"),unit:idx("unidad","unit","ud"),price:idx("precio_unitario","precio","price","unit_price")};
 const missing=["sku","name","price"].filter(k=>cols[k]<0);if(missing.length)throw new Error("Faltan columnas: "+missing.join(", ")+".");
 let added=0,updated=0;const errors=[],seenSkus=new Set();
 for(let i=0;i<rows.length;i++){
  const row=rows[i],get=k=>cols[k]<0?"":String(row[cols[k]]??"").trim();
  if(row.length!==originalHeaders.length){errors.push({row:i+2,reason:"Número de columnas distinto al encabezado",values:row});continue;}
  const sku=get("sku").slice(0,80),name=get("name").slice(0,160),unit=(get("unit")||"ud.").slice(0,30),price=parseNumber(get("price"));
  let reason="";
  if(!sku)reason="Falta la referencia SKU";else if(!name)reason="Falta el nombre del producto";else if(!get("price")||!Number.isFinite(price))reason="Precio vacío o no numérico";else if(price<0||price>999999)reason="Precio fuera del límite permitido (0–999.999)";
  if(reason){errors.push({row:i+2,reason,values:row});continue;}
  const normalizedSku=sku.toLocaleLowerCase("es");if(seenSkus.has(normalizedSku)){errors.push({row:i+2,reason:"SKU duplicado dentro del mismo CSV",values:row});continue;}seenSkus.add(normalizedSku);
  const found=state.catalog.find(p=>p.sku.toLocaleLowerCase("es")===sku.toLocaleLowerCase("es"));
  if(found){found.name=name;found.unit=unit;found.price=Math.round(price*100)/100;updated++;}
  else{state.catalog.push({sku,name,unit,price:Math.round(price*100)/100});added++;}
 }
 if(errors.length)downloadImportErrors("pedidoclaro-errores-catalogo.csv",originalHeaders,errors);
 if(!added&&!updated)throw new Error("No se encontraron productos válidos. Se ha descargado un CSV con las filas rechazadas.");
 state.catalog.sort((a,b)=>a.sku.localeCompare(b.sku,"es"));persist();log("Importó catálogo: "+added+" nuevos y "+updated+" actualizados");renderCatalog();
 notify("Catálogo actualizado: "+added+" nuevos, "+updated+" actualizados y "+errors.length+" omitidos."+(errors.length?" Se descargó un CSV con los errores.":""));
}

function renderActivity(){$("activity-list").innerHTML=state.activity.length?state.activity.map(a=>'<div class="activity-row"><span class="activity-dot"></span><div><p>'+esc(a.message)+'</p><small>'+esc(a.time)+(a.id?" · "+esc(a.id):"")+'</small></div></div>').join(""):'<div class="empty-state"><div><div class="empty-icon">◷</div><b>Sin actividad todavía</b><p>Las acciones de esta demo aparecerán aquí.</p></div></div>';}

function clientSummary(){
 const map=new Map();
 for(const o of state.orders){
  const key=String(o.client||"Cliente").trim().toLocaleLowerCase("es");
  if(!map.has(key))map.set(key,{name:String(o.client||"Cliente").trim(),orders:0,total:0,approved:0,pending:0,issues:0,last:o.date||""});
  const c=map.get(key);c.orders++;c.total+=sum(o);if(o.status==="approved")c.approved+=sum(o);if(["review","ready"].includes(o.status))c.pending++;c.issues+=issues(o);
 }
 return [...map.values()].sort((a,b)=>b.total-a.total);
}
function renderClients(){
 const clients=clientSummary(),total=clients.reduce((n,c)=>n+c.total,0),orders=clients.reduce((n,c)=>n+c.orders,0),avg=orders?total/orders:0;
 $("clients-count").textContent=clients.length+" clientes únicos · "+orders+" pedidos registrados";
 $("clients-overview").innerHTML=[["Clientes activos",clients.length,"♙"],["Pedidos recibidos",orders,"▤"],["Valor medio por pedido",money(avg),"↗"]].map((m,i)=>'<article class="client-kpi"><span class="client-kpi-icon">'+m[2]+'</span><div><small>'+m[0]+'</small><strong>'+m[1]+'</strong></div></article>').join("");
 const max=Math.max(1,...clients.map(c=>c.total));
 $("clients-highlights").innerHTML=clients.length?clients.slice(0,3).map((c,i)=>'<article class="client-highlight"><div class="client-avatar">'+esc(c.name.trim().slice(0,1).toUpperCase())+'</div><div class="client-highlight-main"><small>CLIENTE '+String(i+1).padStart(2,"0")+'</small><b>'+esc(c.name)+'</b><span>'+c.orders+' pedidos · '+c.pending+' pendientes</span></div><strong>'+money(c.total)+'</strong><div class="client-progress"><i style="width:'+Math.max(3,c.total/max*100)+'%"></i></div></article>').join(""):'<div class="empty-state"><div><b>Sin clientes todavía</b><p>Importa o crea pedidos de ejemplo para generar el resumen.</p></div></div>';
 $("clients-table-body").innerHTML=clients.length?clients.map(c=>'<tr><td><div class="client-name-cell"><span class="client-mini-avatar">'+esc(c.name.trim().slice(0,1).toUpperCase())+'</span><b>'+esc(c.name)+'</b></div></td><td>'+c.orders+'</td><td><span class="metric-chip '+(c.pending?"pending":"neutral")+'">'+c.pending+'</span></td><td>'+c.issues+'</td><td><b>'+money(c.total)+'</b></td><td><b class="approved-value">'+money(c.approved)+'</b></td></tr>').join(""):'<tr><td colspan="6">Todavía no hay datos de clientes.</td></tr>';
}
function renderAnalytics(){
 const orders=state.orders,total=orders.length,approved=orders.filter(o=>o.status==="approved"),pending=orders.filter(o=>["review","ready"].includes(o.status)),rejected=orders.filter(o=>o.status==="rejected"),gross=orders.reduce((n,o)=>n+sum(o),0),approvedValue=approved.reduce((n,o)=>n+sum(o),0),avg=total?gross/total:0,openIssues=orders.reduce((n,o)=>n+issues(o),0);
 const metrics=[["Pedidos totales",total,"▤","Todos los estados"],["Valor registrado",money(gross),"€","Incluye todos los estados"],["Valor aprobado",money(approvedValue),"✓","Solo pedidos aprobados"],["Ticket medio",money(avg),"↗","Valor medio por pedido"],["Pendientes",pending.length,"◷","Requieren atención"],["Incidencias",openIssues,"!","Líneas por validar"]];
 $("analytics-kpis").innerHTML=metrics.map((m,i)=>'<article class="stat analytics-stat"><div class="analytics-stat-head"><span>'+esc(m[0])+'</span><i>'+m[2]+'</i></div><strong>'+esc(m[1])+'</strong><small>'+esc(m[3])+'</small><span class="analytics-stat-foot">'+(i===4||i===5?'<b class="warning-dot"></b>Seguimiento':i===2?'<b class="success-dot"></b>Confirmado':'Resumen local')+'</span></article>').join("");
 const status=[{name:"Por revisar / listos",items:pending,color:"amber"},{name:"Aprobados",items:approved,color:"green"},{name:"Descartados",items:rejected,color:"slate"}];
 const maxN=Math.max(1,...status.map(x=>x.items.length)),maxV=Math.max(1,...status.map(x=>x.items.reduce((n,o)=>n+sum(o),0)));
 const rows=(items,max,fmt,kind)=>items.map(x=>'<div class="analytics-bar-row"><div class="analytics-bar-label"><span>'+esc(x.name)+'</span><b>'+fmt(x.value)+'</b></div><div class="analytics-track"><i class="'+(x.color||"blue")+'" style="width:'+Math.max(x.value?3:0,x.value/max*100)+'%"></i></div></div>').join("");
 $("analytics-status").innerHTML=total
  ?'<div class="analytics-status-summary"><div class="analytics-status-total"><strong>'+total+'</strong><span>pedidos registrados</span></div><div class="analytics-status-legend">'+status.map((x,i)=>'<div><i class="status-legend-dot seg-dot-'+i+'"></i><span>'+x.name+'</span><b>'+x.items.length+' <small>'+(total?Math.round(x.items.length/total*100):0)+'%</small></b></div>').join("")+'</div></div><div class="analytics-dual-bars"><div><span class="analytics-subtitle">NÚMERO DE PEDIDOS</span>'+rows(status.map(x=>({name:x.name,value:x.items.length,color:x.color})),maxN,x=>x)+'</div><div><span class="analytics-subtitle">VALOR POR ESTADO</span>'+rows(status.map(x=>({name:x.name,value:x.items.reduce((n,o)=>n+sum(o),0),color:x.color})),maxV,money)+'</div></div>'
  :'<div class="analytics-empty">Aún no hay pedidos para analizar. Importa un CSV o crea un pedido de demostración.</div>';
 const clients=clientSummary().slice(0,6),clientMax=Math.max(1,...clients.map(x=>x.total));
 $("analytics-top-clients").innerHTML=clients.length?clients.map((x,i)=>'<div class="analytics-rank-row"><span class="rank-number">'+String(i+1).padStart(2,"0")+'</span><div class="rank-main"><div><b>'+esc(x.name)+'</b><small>'+x.orders+' pedido'+(x.orders===1?"":"s")+'</small></div><div class="analytics-track"><i class="blue" style="width:'+Math.max(3,x.total/clientMax*100)+'%"></i></div></div><strong>'+money(x.total)+'</strong></div>').join(""):'<div class="analytics-empty">El ranking aparecerá cuando haya clientes con pedidos.</div>';
 const products=new Map();for(const o of orders)for(const l of o.lines){const k=String(l.sku||l.name);if(!products.has(k))products.set(k,{name:l.name||l.sku,sku:l.sku||"",qty:0,value:0});const p=products.get(k);p.qty+=Number(l.qty)||0;p.value+=(Number(l.qty)||0)*(Number(l.price)||0);}
 const bestProducts=[...products.values()].sort((x,y)=>y.qty-x.qty).slice(0,6),prodMax=Math.max(1,...bestProducts.map(x=>x.qty));
 $("analytics-products").innerHTML=bestProducts.length?bestProducts.map((x,i)=>'<div class="analytics-rank-row"><span class="rank-number">'+String(i+1).padStart(2,"0")+'</span><div class="rank-main"><div><b>'+esc(x.name)+'</b><small>'+esc(x.sku)+'</small></div><div class="analytics-track"><i class="violet" style="width:'+Math.max(3,x.qty/prodMax*100)+'%"></i></div></div><strong>'+x.qty.toLocaleString("es-ES")+' <small>uds.</small></strong></div>').join(""):'<div class="analytics-empty">No hay líneas de pedido para mostrar.</div>';
 const channels=new Map();for(const o of orders){const k=o.channel||"Sin especificar";channels.set(k,(channels.get(k)||0)+1);}
 const channelRows=[...channels.entries()].sort((x,y)=>y[1]-x[1]),channelMax=Math.max(1,...channelRows.map(x=>x[1]));
 $("analytics-channels").innerHTML=channelRows.length?channelRows.map(([name,n],i)=>'<div class="analytics-bar-row"><div class="analytics-bar-label"><span>'+esc(name)+'</span><b>'+n+' <small>pedidos</small></b></div><div class="analytics-track"><i class="'+(["blue","teal","violet","amber"][i%4])+'" style="width:'+Math.max(3,n/channelMax*100)+'%"></i></div></div>').join(""):'<div class="analytics-empty">No hay canales registrados.</div>';
 const ranges=[{name:"Hasta 50 €",min:0,max:50},{name:"50–150 €",min:50,max:150},{name:"150–500 €",min:150,max:500},{name:"Más de 500 €",min:500,max:Infinity}],rangeData=ranges.map(r=>({...r,count:orders.filter(o=>{const v=sum(o);return v>=r.min&&v<r.max;}).length})),rangeMax=Math.max(1,...rangeData.map(x=>x.count));
 $("analytics-ticket").innerHTML=total?rangeData.map(x=>'<div class="analytics-bar-row"><div class="analytics-bar-label"><span>'+x.name+'</span><b>'+x.count+' <small>pedidos</small></b></div><div class="analytics-track"><i class="teal" style="width:'+Math.max(x.count?3:0,x.count/rangeMax*100)+'%"></i></div></div>').join(""):'<div class="analytics-empty">Añade pedidos para ver la distribución.</div>';
 const activity=new Map();for(const o of orders){const k=o.date||"Sin fecha";activity.set(k,(activity.get(k)||0)+1);}
 const activityRows=[...activity.entries()].slice(0,7),activityMax=Math.max(1,...activityRows.map(x=>x[1]));
 $("analytics-activity").innerHTML=activityRows.length?activityRows.map(([name,n],i)=>'<div class="analytics-bar-row"><div class="analytics-bar-label"><span>'+esc(name)+'</span><b>'+n+' <small>pedidos</small></b></div><div class="analytics-track"><i class="blue" style="width:'+Math.max(3,n/activityMax*100)+'%"></i></div></div>').join(""):'<div class="analytics-empty">Sin actividad registrada.</div>';
}
function renderDashboardCharts(){
 const groups=[
  {label:"Por revisar / listos",orders:state.orders.filter(o=>["review","ready"].includes(o.status)),color:"amber"},
  {label:"Aprobados",orders:state.orders.filter(o=>o.status==="approved"),color:"green"},
  {label:"Descartados",orders:state.orders.filter(o=>o.status==="rejected"),color:"slate"}
 ];
 const total=state.orders.length;
 const totals=groups.map(g=>({ ...g,count:g.orders.length,value:g.orders.reduce((n,o)=>n+sum(o),0)}));
 const maxCount=Math.max(1,...totals.map(g=>g.count)),maxValue=Math.max(1,...totals.map(g=>g.value));
 const pending=totals[0].count,approved=totals[1].count,p1=total?pending/total*100:0,p2=total?approved/total*100:0;
 const donut="conic-gradient(#e6a23c 0 "+p1+"%,#2caa78 "+p1+"% "+(p1+p2)+"%,#aab5c5 "+(p1+p2)+"% 100%)";
 const legend=totals.map((g,i)=>'<div class="status-legend-row"><span><i class="status-legend-dot seg-dot-'+i+'"></i>'+g.label+'</span><b>'+g.count+' <small>'+Math.round(total?g.count/total*100:0)+'%</small></b></div>').join("");
 const countBars=totals.map(g=>'<div class="dash-metric-row"><span>'+g.label+'</span><div class="dash-track"><i class="dash-fill '+g.color+'" style="width:'+(g.count?Math.max(4,g.count/maxCount*100):0)+'%"></i></div><b>'+g.count+'</b></div>').join("");
 const valueBars=totals.map(g=>'<div class="dash-metric-row"><span>'+g.label+'</span><div class="dash-track"><i class="dash-fill '+g.color+'" style="width:'+(g.value?Math.max(4,g.value/maxValue*100):0)+'%"></i></div><b>'+money(g.value)+'</b></div>').join("");
 $("dashboard-status").innerHTML=total
  ?'<div class="dash-status-overview"><div class="status-chart-layout"><div class="status-donut" style="background:'+donut+'"><div class="status-donut-hole"><strong>'+total+'</strong><small>PEDIDOS</small></div></div><div class="status-chart-legend">'+legend+'</div></div><div class="dashboard-metric-charts"><div><div class="dash-chart-title">NÚMERO DE PEDIDOS</div>'+countBars+'</div><div><div class="dash-chart-title">VALOR ACUMULADO</div>'+valueBars+'</div></div></div>'
  :'<div class="dashboard-empty"><b>Aún no hay pedidos</b><span>Importa una plantilla o crea un pedido de demostración para activar las gráficas.</span></div>';
 const clients=clientSummary().slice(0,5),max=Math.max(1,...clients.map(x=>x.total));
 $("dashboard-clients").innerHTML=clients.length
  ?'<div class="dashboard-client-total"><span>Clientes con actividad</span><strong>'+clientSummary().length+'</strong></div><div class="dash-client-list">'+clients.map((x,i)=>'<div class="dash-client-row"><div class="dash-client-rank">'+String(i+1).padStart(2,"0")+'</div><div class="dash-client-info"><div><b>'+esc(x.name)+'</b><span>'+x.orders+' pedido'+(x.orders===1?"":"s")+'</span></div><div class="dash-client-track"><i style="width:'+Math.max(3,x.total/max*100)+'%"></i></div></div><strong>'+money(x.total)+'</strong></div>').join("")+'</div>'
  :'<div class="dashboard-empty"><b>Sin actividad de clientes</b><span>El ranking aparecerá cuando haya pedidos en la bandeja.</span></div>';
}
function downloadFile(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function csvParse(text){
 const first=(text.split(/\r?\n/,1)[0]||"");let delimiter=";",best=-1;
 for(const d of [";",",","\t"]){let n=0,q=false;for(let i=0;i<first.length;i++){if(first[i]==='"'){if(q&&first[i+1]==='"'){i++;continue;}q=!q;}else if(first[i]===d&&!q)n++;}if(n>best){best=n;delimiter=d;}}
 const rows=[];let row=[],cell="",quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"')quoted=true;else if(c===delimiter){row.push(cell);cell="";}else if(c==="\n"){row.push(cell.replace(/\r$/,""));if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";}else cell+=c;}
 row.push(cell.replace(/\r$/,""));if(row.some(x=>x.trim()))rows.push(row);if(quoted)throw new Error("El CSV contiene comillas sin cerrar.");return rows;
}
function normHeader(s){return String(s||"").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s-]+/g,"_");}
let pendingImport=null;
function auditImportRows(rows,kind){
 const originalHeaders=rows[0],headers=originalHeaders.map(normHeader),idx=(...names)=>headers.findIndex(h=>names.includes(h));
 validateCsvHeaders(originalHeaders);
 const audit={headers:originalHeaders,rows:[],valid:0,rejected:0,warnings:0,duplicates:0,groups:0,importable:0,added:0,updated:0,errors:[],mapping:[]};
 if(kind==="orders"){
  const cols={order:idx("pedido","order_id","id_pedido","numero_pedido"),client:idx("cliente","customer","empresa"),sku:idx("referencia","sku","codigo","codigo_producto"),name:idx("producto","product","descripcion","nombre"),qty:idx("cantidad","qty","quantity"),unit:idx("unidad","unit","ud"),price:idx("precio_unitario","precio","price","unit_price")};
  const required=["client","sku","name","qty","price"],missing=required.filter(k=>cols[k]<0);
  if(missing.length)throw new Error("Faltan columnas obligatorias: "+missing.join(", ")+". Descarga la plantilla para ver el formato.");
  audit.mapping=[["Pedido",cols.order],["Cliente",cols.client],["Referencia",cols.sku],["Producto",cols.name],["Cantidad",cols.qty],["Unidad",cols.unit],["Precio",cols.price]].filter(x=>x[1]>=0);
  const groupMap=new Map(),skuSets=new Map();
  for(let i=1;i<rows.length;i++){
   const r=rows[i],get=k=>cols[k]<0?"":String(r[cols[k]]??"").trim();
   const item={row:i+1,values:r,status:"ok",reason:""};
   if(r.length!==originalHeaders.length)item.reason="Número de columnas distinto al encabezado";
   else{
    const client=get("client"),sku=get("sku"),name=get("name"),qty=parseNumber(get("qty")),price=parseNumber(get("price"));
    if(!client)item.reason="Falta el cliente";else if(!sku)item.reason="Falta la referencia SKU";else if(!name)item.reason="Falta el nombre del producto";else if(!get("qty")||!Number.isFinite(qty))item.reason="Cantidad vacía o no numérica";else if(!Number.isInteger(qty)||qty<1||qty>state.rules.maxQuantity)item.reason="Cantidad fuera del límite configurado (1–"+state.rules.maxQuantity.toLocaleString("es-ES")+")";else if(!get("price")||!Number.isFinite(price))item.reason="Precio vacío o no numérico";else if(price<0||price>999999)item.reason="Precio fuera del límite (0–999.999)";
    if(!item.reason){
     const source=get("order")||"__LOTE_PREVIEW__",key=source+"|"+client,sk=sku.toLocaleLowerCase("es");
     if(!groupMap.has(key))groupMap.set(key,{sourceId:key,client,order:get("order"),lines:0,importableLines:0,existing:false});
     const group=groupMap.get(key);group.lines++;
     if(!skuSets.has(key))skuSets.set(key,new Set());
     if(skuSets.get(key).has(sk)){item.status=state.rules.duplicateSku==="block"?"rejected":"warning";item.reason="Referencia repetida dentro del mismo pedido"+(state.rules.duplicateSku==="block"?" · bloqueada por regla":"");}else skuSets.get(key).add(sk);
     const product=state.catalog.find(p=>p.sku.toLocaleLowerCase("es")===sk);
     if(!product){if(state.rules.unknownSku==="block")item.status="rejected";else if(item.status==="ok")item.status="warning";item.reason+=(item.reason?"; ":"")+"SKU no encontrado en catálogo"+(state.rules.unknownSku==="block"?" · bloqueado por regla":"");}
     else if(priceDiffers(product.price,Math.round(price*100)/100)){if(item.status==="ok")item.status="warning";item.reason+=(item.reason?"; ":"")+"Precio distinto al catálogo (tolerancia "+state.rules.priceTolerancePct+"%)";}
     if(get("order")&&state.orders.some(o=>o.sourceId===key)){item.status="duplicate";item.reason="Este pedido y cliente ya se importaron anteriormente";group.existing=true;}
     if(item.status!=="rejected"&&item.status!=="duplicate")group.importableLines++;
    }
   }
   if(item.status==="rejected"||(item.reason&&item.status==="ok")){item.status="rejected";audit.rejected++;audit.errors.push({row:item.row,reason:item.reason,values:r});}
   else if(item.status==="duplicate"){audit.duplicates++;}
   else if(item.status==="warning"){audit.warnings++;audit.valid++;}
   else if(item.status==="ok"){audit.valid++;}
   audit.rows.push(item);
  }
  audit.groups=groupMap.size;
  audit.importable=[...groupMap.values()].filter(g=>!g.existing&&g.importableLines>0).length;
 }else{
  const cols={sku:idx("referencia","sku","codigo","codigo_producto"),name:idx("producto","product","descripcion","nombre"),unit:idx("unidad","unit","ud"),price:idx("precio_unitario","precio","price","unit_price")};
  const missing=["sku","name","price"].filter(k=>cols[k]<0);
  if(missing.length)throw new Error("Faltan columnas obligatorias: "+missing.join(", ")+".");
  audit.mapping=[["Referencia",cols.sku],["Producto",cols.name],["Unidad",cols.unit],["Precio",cols.price]].filter(x=>x[1]>=0);
  const seen=new Set();
  for(let i=1;i<rows.length;i++){
   const r=rows[i],get=k=>cols[k]<0?"":String(r[cols[k]]??"").trim(),sku=get("sku"),name=get("name"),price=parseNumber(get("price"));
   const item={row:i+1,values:r,status:"ok",reason:""};
   if(r.length!==originalHeaders.length)item.reason="Número de columnas distinto al encabezado";
   else if(!sku)item.reason="Falta la referencia SKU";else if(!name)item.reason="Falta el nombre del producto";else if(!get("price")||!Number.isFinite(price))item.reason="Precio vacío o no numérico";else if(price<0||price>999999)item.reason="Precio fuera del límite (0–999.999)";
   const normalized=sku.toLocaleLowerCase("es");
   if(!item.reason&&seen.has(normalized))item.reason="SKU duplicado dentro del mismo CSV";
   if(!item.reason){
    seen.add(normalized);
    if(state.catalog.some(p=>p.sku.toLocaleLowerCase("es")===normalized)){audit.updated++;item.status="update";item.reason="Actualizará una referencia existente";}
    else{audit.added++;item.reason="Añadirá una referencia nueva";}
    audit.valid++;
   }else{item.status="rejected";audit.rejected++;audit.errors.push({row:item.row,reason:item.reason,values:r});}
   audit.rows.push(item);
  }
  audit.groups=audit.valid;audit.importable=audit.valid;
 }
 return audit;
}
async function showImportPreview(file,kind){
 if(!file)return;
 if(file.size>2*1024*1024)throw new Error("El fichero supera el límite de 2 MB.");
 const rows=csvParse(await file.text());
 if(rows.length<2)throw new Error("El CSV está vacío o solo contiene encabezados.");
 const max=kind==="orders"?1001:5001;
 if(rows.length>max)throw new Error("Se supera el máximo de "+(max-1).toLocaleString("es-ES")+" filas.");
 const audit=auditImportRows(rows,kind),dataCount=rows.length-1;
 $("import-preview-title").textContent=kind==="orders"?"Informe de calidad · Pedidos":"Informe de calidad · Catálogo";
 $("import-preview-file").textContent=file.name+" · "+(file.size/1024).toFixed(1)+" KB · "+dataCount.toLocaleString("es-ES")+" filas";
 $("import-preview-summary").innerHTML='<div class="import-audit-stat"><span>Filas válidas</span><b class="audit-good">'+audit.valid+'</b></div><div class="import-audit-stat"><span>Para revisar</span><b class="audit-warn">'+audit.warnings+'</b></div><div class="import-audit-stat"><span>Rechazadas</span><b class="audit-bad">'+audit.rejected+'</b></div><div class="import-audit-stat"><span>Duplicadas</span><b class="audit-neutral">'+audit.duplicates+'</b></div>';
 $("import-preview-mapping").innerHTML='<div class="audit-section-title"><span>01</span><div><b>Columnas reconocidas</b><small>Correspondencia detectada automáticamente</small></div></div><div class="audit-mapping">'+audit.mapping.map(([name,index])=>'<span><i>✓</i>'+esc(name)+'<small>'+esc(audit.headers[index])+'</small></span>').join("")+'</div>';
 const rowsToShow=audit.rows.slice(0,10);
 $("import-preview-content").innerHTML='<div class="audit-section-title"><span>02</span><div><b>Revisión fila a fila</b><small>Primeras '+rowsToShow.length+' filas · '+dataCount+' en total</small></div></div><div class="import-audit-table-wrap"><table class="import-audit-table"><thead><tr><th>FILA</th><th>RESULTADO</th><th>CLIENTE / PRODUCTO</th><th>DETALLE</th></tr></thead><tbody>'+rowsToShow.map(x=>{
  const primary=kind==="orders"?(x.values[audit.mapping.find(m=>m[0]==="Cliente")?.[1]??-1]||x.values[audit.mapping.find(m=>m[0]==="Producto")?.[1]??-1]||"—"):(x.values[audit.mapping.find(m=>m[0]==="Producto")?.[1]??-1]||"—");
  const label=x.status==="rejected"?"Rechazada":x.status==="warning"?"Revisar":x.status==="duplicate"?"Duplicada":x.status==="update"?"Actualizar":"Correcta";
  return '<tr><td class="audit-rownum">'+x.row+'</td><td><span class="audit-status '+x.status+'">'+label+'</span></td><td class="audit-primary">'+esc(primary)+'</td><td class="audit-reason '+(x.status==="rejected"?"bad":"")+'">'+esc(x.reason||"Datos válidos")+'</td></tr>';
 }).join("")+'</tbody></table></div>';
 $("import-preview-more").textContent=dataCount>rowsToShow.length?"Mostrando "+rowsToShow.length+" de "+dataCount+" filas.":"Se han analizado todas las filas.";
 const importCount=kind==="orders"?audit.importable:audit.valid;
 const outcome=kind==="orders"?audit.importable+" pedidos nuevos posibles · "+audit.groups+" grupos detectados":audit.added+" productos nuevos · "+audit.updated+" referencias a actualizar";
 $("import-preview-note").innerHTML='<b>'+(audit.rejected?"Hay filas que no se importarán automáticamente.":"El análisis previo no ha detectado filas rechazadas.")+'</b><span>'+esc(outcome)+'. '+(audit.warnings?"Revisa las advertencias antes de importar. ":"")+(audit.duplicates?"Los duplicados existentes se omitirán. ":"")+'La revisión y aprobación de los pedidos seguirá siendo manual.</span>';
 $("import-preview-errors").disabled=!audit.errors.length;
 $("import-preview-confirm").disabled=!importCount;
 $("import-preview-confirm").textContent=importCount?(kind==="orders"?"Importar "+importCount+" pedido(s)":"Aplicar "+importCount+" cambio(s)"):"No hay datos importables";
 pendingImport={file,kind,audit,headers:rows[0]};
 $("import-preview-dialog").showModal();
}

function validateCsvHeaders(headers){
 const normalized=headers.map(normHeader),empty=normalized.findIndex(h=>!h);
 if(empty>=0)throw new Error("La columna "+(empty+1)+" no tiene nombre. Corrige el encabezado.");
 const seen=new Set(),duplicates=[];
 for(const h of normalized){if(seen.has(h)&&!duplicates.includes(h))duplicates.push(h);seen.add(h);}
 if(duplicates.length)throw new Error("Hay encabezados repetidos o ambiguos: "+duplicates.join(", ")+". Corrige el CSV antes de importarlo.");
}

function parseNumber(s){let v=String(s??"").trim().replace(/[\s\u00a0]/g,"").replace(/[€$£]/g,"");if(v.includes(",")&&v.includes(".")){if(v.lastIndexOf(",")>v.lastIndexOf("."))v=v.replace(/\./g,"").replace(",",".");else v=v.replace(/,/g,"");}else v=v.replace(",",".");return Number(v);}
async function importCsvFile(file){
 if(!file)return;if(file.size>2*1024*1024)throw new Error("El CSV supera el límite de 2 MB.");
 const rows=csvParse(await file.text());if(rows.length<2)throw new Error("El CSV está vacío o solo contiene encabezados.");
 if(rows.length>1001)throw new Error("Máximo 1.000 líneas por importación.");
 const originalHeaders=rows.shift(),headers=originalHeaders.map(normHeader),idx=(...names)=>headers.findIndex(h=>names.includes(h));
 validateCsvHeaders(originalHeaders);
 const cols={order:idx("pedido","order_id","id_pedido","numero_pedido"),client:idx("cliente","customer","empresa"),sku:idx("referencia","sku","codigo","codigo_producto"),name:idx("producto","product","descripcion","nombre"),qty:idx("cantidad","qty","quantity"),unit:idx("unidad","unit","ud"),price:idx("precio_unitario","precio","price","unit_price")};
 const required=["client","sku","name","qty","price"];const missing=required.filter(k=>cols[k]<0);
 if(missing.length)throw new Error("Faltan columnas obligatorias: "+missing.join(", ")+". Descarga la plantilla para ver el formato.");
 const groups=new Map(),errors=[];const importBatch="SIN-ID-"+new Date().toISOString()+"-"+state.counter;
 rows.forEach((r,i)=>{if(r.length!==originalHeaders.length){errors.push({row:i+2,reason:"Número de columnas distinto al encabezado",values:r});return;}const get=k=>cols[k]<0?"":String(r[cols[k]]??"").trim(),client=get("client"),sku=get("sku"),name=get("name"),qty=parseNumber(get("qty")),price=parseNumber(get("price")),unit=get("unit")||"ud.",source=get("order")||importBatch,sourceRef=get("order")||"Importación sin número";
 let reason="";
 if(!client)reason="Falta el cliente";else if(!sku)reason="Falta la referencia SKU";else if(!name)reason="Falta el nombre del producto";else if(!get("qty")||!Number.isFinite(qty))reason="Cantidad vacía o no numérica";else if(!Number.isInteger(qty)||qty<1||qty>state.rules.maxQuantity)reason="Cantidad fuera del límite configurado (1–"+state.rules.maxQuantity.toLocaleString("es-ES")+")";else if(!get("price")||!Number.isFinite(price))reason="Precio vacío o no numérico";else if(price<0||price>999999)reason="Precio fuera del límite (0–999.999)";
 if(reason){errors.push({row:i+2,reason,values:r});return;}
 const key=source+"|"+client;if(!groups.has(key))groups.set(key,{sourceId:key,sourceRef,client,lines:[]});
 const catalogProduct=state.catalog.find(p=>p.sku.toLocaleLowerCase("es")===sku.toLocaleLowerCase("es"));const roundedPrice=Math.round(price*100)/100;const duplicateSku=groups.get(key).lines.some(line=>line.sku.toLocaleLowerCase("es")===sku.toLocaleLowerCase("es"));if(duplicateSku&&state.rules.duplicateSku==="block"){errors.push({row:i+2,reason:"Referencia repetida en el pedido · bloqueada por regla",values:r});return;}if(!catalogProduct&&state.rules.unknownSku==="block"){errors.push({row:i+2,reason:"SKU no encontrado en catálogo · bloqueado por regla",values:r});return;}const issue=duplicateSku?"Referencia repetida en el pedido: confirma si son líneas distintas":!catalogProduct?"Referencia no encontrada en el catálogo: valida el SKU":priceDiffers(catalogProduct.price,roundedPrice)?"Precio distinto al catálogo (referencia: "+money(catalogProduct.price)+")":"Importada: confirma cantidad y producto";groups.get(key).lines.push({name:name.slice(0,160),sku:sku.slice(0,80),qty,unit:unit.slice(0,30),price:roundedPrice,issue,checked:false});
 });
 if(errors.length)downloadImportErrors("pedidoclaro-errores-pedidos.csv",originalHeaders,errors);
 const importableGroups=[...groups.values()].filter(g=>g.lines.length);
 if(!importableGroups.length)throw new Error("No se ha encontrado ninguna línea válida según las reglas configuradas. Se ha descargado un CSV con las filas rechazadas.");
 let added=0,skipped=0;
 for(const g of importableGroups){
  if(state.orders.some(o=>o.sourceId===g.sourceId)){skipped++;continue;}
  state.counter=Math.max(state.counter,...state.orders.map(o=>Number(o.id.slice(3))||0))+1;
  state.orders.unshift({id:"PD-"+state.counter,sourceId:g.sourceId,sourceRef:g.sourceRef,client:g.client.slice(0,120),date:"Importado ahora",channel:"CSV importado",status:"review",lines:g.lines});
  added++;
 }
 if(!added)throw new Error("Todos los pedidos del fichero ya estaban importados.");
 state.selected=state.orders[0].id;log("Importó "+added+" pedido(s) desde CSV; omitidos por duplicado: "+skipped);render();
 notify("Importados "+added+" pedido(s). Líneas rechazadas: "+errors.length+". Duplicados omitidos: "+skipped+"."+(errors.length?" Se descargó un CSV con los errores.":""));
}
function backupData(){
 const payload={app:"PedidoClaro",version:2,exportedAt:new Date().toISOString(),counter:state.counter,orders:state.orders,activity:state.activity,catalog:state.catalog,rules:state.rules};
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
  const lines=o.lines.map(l=>{const qty=Number(l.qty),price=Number(l.price);if(!l||!String(l.name||"").trim()||!String(l.sku||"").trim()||!Number.isInteger(qty)||qty<1||qty>999999||!Number.isFinite(price)||price<0||price>999999)throw new Error("Línea inválida en "+String(o.id||"pedido")+".");return {name:String(l.name).slice(0,160),sku:String(l.sku).slice(0,80),qty,unit:String(l.unit||"ud.").slice(0,30),price:Math.round(price*100)/100,issue:String(l.issue||"").slice(0,240),checked:l.checked===true,reviewedAt:String(l.reviewedAt||"").slice(0,40)};});
  return {id:String(o.id||"").slice(0,40),sourceId:o.sourceId?String(o.sourceId).slice(0,240):undefined,sourceRef:o.sourceRef?String(o.sourceRef).slice(0,100):undefined,client:String(o.client||"Cliente").slice(0,120),date:String(o.date||"Restaurado").slice(0,80),channel:String(o.channel||"Copia restaurada").slice(0,80),status,lines};
 });
 const orderIds=new Set(),sourceIds=new Set();
 for(const o of cleanOrders){
  if(!o.id||orderIds.has(o.id))throw new Error("La copia contiene números de pedido vacíos o repetidos: "+(o.id||"(vacío)")+".");
  orderIds.add(o.id);
  if(o.sourceId){if(sourceIds.has(o.sourceId))throw new Error("La copia contiene una importación de origen duplicada: "+o.sourceId+".");sourceIds.add(o.sourceId);}
 }
 const cleanActivity=data.activity.map(a=>({message:String(a?.message||"Actividad").slice(0,240),id:String(a?.id||"").slice(0,40),time:String(a?.time||"").slice(0,80)}));
 const cleanCatalog=Array.isArray(data.catalog)?data.catalog.map(p=>{const price=Number(p?.price);if(!p||!String(p.sku||"").trim()||!String(p.name||"").trim()||!Number.isFinite(price)||price<0||price>999999)throw new Error("Producto inválido en la copia.");return {sku:String(p.sku).slice(0,80),name:String(p.name).slice(0,160),unit:String(p.unit||"ud.").slice(0,30),price:Math.round(price*100)/100};}):JSON.parse(JSON.stringify(catalogSeed));
 if(cleanCatalog.length>5000)throw new Error("La copia contiene demasiados productos.");
 const catalogSkus=new Set();
 for(const p of cleanCatalog){const key=p.sku.toLocaleLowerCase("es");if(catalogSkus.has(key))throw new Error("La copia contiene referencias SKU duplicadas: "+p.sku+".");catalogSkus.add(key);}
 if(!confirm("Esto sustituirá los pedidos y el historial guardados en este navegador. ¿Continuar?"))return;
 state.orders=cleanOrders;state.catalog=cleanCatalog;state.rules={...defaultRules,...(data.rules||{})};state.rules.maxQuantity=Math.min(999999,Math.max(1,Math.floor(Number(state.rules.maxQuantity)||999999)));state.rules.priceTolerancePct=Math.min(100,Math.max(0,Number(state.rules.priceTolerancePct)||0));if(!["review","block"].includes(state.rules.unknownSku))state.rules.unknownSku="review";if(!["review","block"].includes(state.rules.duplicateSku))state.rules.duplicateSku="review";state.orders.forEach(o=>{if(!["approved","rejected"].includes(o.status))o.status=derived(o);});state.activity=cleanActivity;state.counter=Math.max(Number(data.counter)||0,...cleanOrders.map(o=>Number(String(o.id).replace("PD-",""))||0));state.selected=state.orders[0]?.id||null;persist();render();notify("Copia restaurada correctamente.");
}

function renderReviewQueue(){
 const findings=[];
 for(const o of state.orders){
  if(final(o))continue;
  for(const line of o.lines){
   if(line.checked&&!line.issue)continue;
   const product=state.catalog.find(p=>String(p.sku).toLocaleLowerCase("es")===String(line.sku).toLocaleLowerCase("es"));
   const reasons=[];
   if(line.issue)reasons.push(line.issue);
   else reasons.push("Línea pendiente de confirmar");
   if(!product)reasons.push("SKU no existe en el catálogo");
   else if(priceDiffers(product.price,line.price))reasons.push("Precio distinto al de referencia");
   if(reasons.length)findings.push({order:o,line,reasons});
  }
 }
 findings.sort((a,b)=>(b.reasons.length-a.reasons.length)||sum(b.order)-sum(a.order));
 const unique=new Set(findings.map(x=>x.order.id));
 $("review-queue-count").textContent=findings.length+" líneas · "+unique.size+" pedidos";
 $("review-queue-list").innerHTML=findings.length?findings.slice(0,6).map(x=>'<article class="review-queue-row"><span class="review-queue-mark">!</span><div class="review-queue-main"><div><b>'+esc(x.line.name||x.line.sku)+'</b><small>'+esc(x.order.id)+' · '+esc(x.order.client)+'</small></div><p>'+x.reasons.map(esc).join(" · ")+'</p></div><strong class="review-queue-value">'+money(x.line.qty*x.line.price)+'</strong><button class="btn secondary smallbtn" data-review-order="'+esc(x.order.id)+'">Revisar ↗</button></article>').join(""):'<div class="review-queue-empty"><span>✓</span><div><b>Todo al día</b><p>No hay líneas pendientes ni diferencias detectadas frente al catálogo local.</p></div></div>';
 $("review-queue-list").querySelectorAll("[data-review-order]").forEach(b=>b.onclick=()=>{
  const id=b.dataset.reviewOrder;
  if(!state.orders.some(o=>o.id===id)){notify("No se encuentra ese pedido. Actualiza la cola.");render();return;}
  state.selected=id;view("orders");render();
  window.setTimeout(()=>{
   const target=$("detail-panel");
   target?.scrollIntoView({behavior:"smooth",block:"center"});
   const heading=target?.querySelector(".detail-head h2");
   if(heading){heading.setAttribute("tabindex","-1");heading.focus({preventScroll:true});}
  },80);
 });
}
function render(){renderList();renderCatalog();renderActivity();renderClients();renderAnalytics();renderDashboardCharts();renderReviewQueue();}
function addOrder(client,channel,lines){state.counter=Math.max(state.counter,...state.orders.map(o=>Number(o.id.slice(3))||0))+1;const o={id:"PD-"+state.counter,client,date:"Ahora",channel,status:"review",lines};o.status=derived(o);state.orders.unshift(o);state.selected=o.id;log("Creó el pedido ficticio "+o.id,o.id);render();notify("Pedido ficticio añadido.");}
function parseText(){const raw=$("raw-order").value.trim();if(!raw){notify("Pega un pedido de ejemplo primero.");return;}const client=(raw.match(/cliente\s*:\s*([^\n;]+)/i)||[])[1]?.trim()||"Cliente de texto",rules=[{re:/(\d+)\s*(?:cajas?\s+de\s+)?tornillos?/i,name:"Tornillo inox A2 5×50",sku:"TOR-INOX-550",unit:"caja",price:18.5},{re:/(\d+)\s*(?:unidades?|uds?\.?|ud\.?)\s+de\s+silicona/i,name:"Silicona neutra blanca 300 ml",sku:"SIL-NEU-BLA",unit:"ud.",price:4.1},{re:/(\d+)\s*(?:cajas?\s+de\s+)?tacos?/i,name:"Taco nylon universal 8 mm",sku:"TACO-UNIV-08",unit:"caja",price:7.2},{re:/(\d+)\s*(?:unidades?|uds?\.?|ud\.?)\s+de\s+discos?\s+de\s+corte/i,name:"Disco corte inox 115 mm",sku:"DIS-INOX-115",unit:"ud.",price:2.8}],lines=rules.flatMap(r=>{const m=raw.match(r.re);if(!m)return[];const product=state.catalog.find(p=>p.sku.toLocaleLowerCase("es")===r.sku.toLocaleLowerCase("es"));return [{name:product?.name||r.name,sku:r.sku,qty:+m[1],unit:product?.unit||r.unit,price:product?.price??r.price,issue:product?"Confirma la referencia y cantidad extraída":"Referencia no encontrada en el catálogo",checked:false}];});if(!lines.length){notify("No reconozco artículos. Prueba con tornillos, tacos o silicona.");return;}addOrder(client,"Texto pegado (parser local)",lines);$("raw-order").value="";}
function view(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name));document.querySelectorAll(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("crumb").textContent={orders:"Bandeja de pedidos",catalog:"Catálogo de productos",clients:"Clientes",analytics:"Analítica",activity:"Actividad reciente",guide:"Cómo funciona"}[name];if(name==="catalog")renderCatalog();if(name==="clients")renderClients();if(name==="analytics")renderAnalytics();}
$("search").oninput=renderList;$("filter").onchange=renderList;$("sort-orders").onchange=renderList;$("export-filtered").onclick=()=>exportCsv(getVisibleOrders());$("export-filtered-xlsx").onclick=()=>exportOrdersXlsx(getVisibleOrders());
$("select-visible").onchange=()=>{getVisibleOrders().forEach(o=>{if($("select-visible").checked)selectedOrderIds.add(o.id);else selectedOrderIds.delete(o.id);});updateBulkBar();$("order-list").querySelectorAll("[data-select-order]").forEach(x=>x.checked=selectedOrderIds.has(x.dataset.selectOrder));};
function openRulesDialog(){
 $("rule-max-qty").value=state.rules.maxQuantity;
 $("rule-price-tolerance").value=state.rules.priceTolerancePct;
 $("rule-unknown-sku").value=state.rules.unknownSku;
 $("rule-duplicate-sku").value=state.rules.duplicateSku;
 $("rules-dialog").showModal();
}
$("open-rules").onclick=openRulesDialog;
$("open-rules-queue").onclick=openRulesDialog;
$("rules-cancel").onclick=()=>$("rules-dialog").close();
$("rules-form").addEventListener("submit",e=>{if(e.submitter?.id!=="rules-save")return;e.preventDefault();const max=Number($("rule-max-qty").value),tolerance=Number($("rule-price-tolerance").value);if(!Number.isInteger(max)||max<1||max>999999||!Number.isFinite(tolerance)||tolerance<0||tolerance>100){notify("Revisa los límites de las reglas.");return;}state.rules={maxQuantity:max,priceTolerancePct:tolerance,unknownSku:$("rule-unknown-sku").value==="block"?"block":"review",duplicateSku:$("rule-duplicate-sku").value==="block"?"block":"review"};persist();$("rules-dialog").close();log("Actualizó las reglas de validación");render();notify("Reglas guardadas. Se aplicarán a las próximas importaciones.");});

$("bulk-clear").onclick=()=>{selectedOrderIds.clear();renderList();};
$("bulk-export-csv").onclick=()=>exportCsv(state.orders.filter(o=>selectedOrderIds.has(o.id)));
$("bulk-export-xlsx").onclick=()=>exportOrdersXlsx(state.orders.filter(o=>selectedOrderIds.has(o.id)));
$("bulk-approve").onclick=()=>{const chosen=state.orders.filter(o=>selectedOrderIds.has(o.id)),eligible=chosen.filter(o=>!final(o)&&!issues(o)&&o.status==="ready");if(!eligible.length){notify("No hay pedidos listos para aprobar en la selección.");return;}const skipped=chosen.length-eligible.length;if(!confirm("Vas a aprobar "+eligible.length+" pedido(s) listos en esta demo."+ (skipped?" Se dejarán "+skipped+" pedido(s) sin cambios porque tienen incidencias o ya están cerrados.":"")+" ¿Continuar?"))return;eligible.forEach(o=>{o.status="approved";log("Aprobó "+o.id+" mediante acción masiva (solo estado local)",o.id);});eligible.forEach(o=>selectedOrderIds.delete(o.id));persist();render();notify(eligible.length+" pedido(s) aprobados localmente. No se enviaron a ningún ERP.");};

$("catalog-search").oninput=renderCatalog;
$("catalog-add").onclick=()=>{$("product-form").reset();editingCatalogSku=null;$("product-dialog-title").textContent="Añadir producto";$("product-unit").value="ud.";$("product-price").value="0";$("product-dialog").showModal();$("product-sku").focus();};
$("product-form").addEventListener("submit",e=>{if(e.submitter?.id!=="save-product")return;e.preventDefault();const sku=$("product-sku").value.trim(),name=$("product-name").value.trim(),unit=$("product-unit").value.trim()||"ud.",price=Number($("product-price").value);if(!sku||!name||!Number.isFinite(price)||price<0||price>999999){notify("Revisa los datos del producto.");return;}const duplicate=state.catalog.find(p=>p.sku.toLocaleLowerCase("es")===sku.toLocaleLowerCase("es")&&p.sku!==editingCatalogSku);if(duplicate){notify("Ya existe esa referencia. El SKU debe ser único.");return;}const clean={sku:sku.slice(0,80),name:name.slice(0,160),unit:unit.slice(0,30),price:Math.round(price*100)/100};if(editingCatalogSku){const index=state.catalog.findIndex(p=>p.sku===editingCatalogSku);if(index<0){notify("No se encontró el producto que querías editar.");return;}state.catalog[index]=clean;log("Editó "+clean.sku+" en el catálogo");}else{state.catalog.push(clean);log("Añadió "+clean.sku+" al catálogo");}editingCatalogSku=null;state.catalog.sort((a,b)=>a.sku.localeCompare(b.sku,"es"));persist();$("product-dialog").close();renderCatalog();notify("Catálogo actualizado.");});
$("catalog-export").onclick=catalogCsvExport;$("catalog-export-xlsx").onclick=exportCatalogXlsx;
$("catalog-import").onclick=()=>$("catalog-file").click();
$("catalog-template").onclick=()=>downloadFile("plantilla-catalogo-pedidoclaro.csv","referencia;producto;unidad;precio_unitario\nTOR-INOX-550;Tornillo inox A2 5x50;caja;18.50\nSIL-NEU-BLA;Silicona neutra blanca 300 ml;ud.;4.10\n","text/csv;charset=utf-8");
$("catalog-file").onchange=async e=>{try{await showImportPreview(e.target.files[0],"catalog");}catch(err){notify(err.message||"No se pudo leer el CSV.");e.target.value="";}};

$("import-preview-cancel").onclick=()=>{pendingImport=null;$("import-preview-dialog").close();$("csv-file").value="";$("catalog-file").value="";};
$("import-preview-errors").onclick=()=>{if(!pendingImport?.audit?.errors?.length)return;downloadImportErrors(pendingImport.kind==="orders"?"pedidoclaro-errores-pedidos.csv":"pedidoclaro-errores-catalogo.csv",pendingImport.headers,pendingImport.audit.errors);notify("Informe de filas rechazadas descargado.");};
$("import-preview-confirm").onclick=async()=>{
 if(!pendingImport)return;
 const task=pendingImport;pendingImport=null;$("import-preview-dialog").close();
 const input=task.kind==="orders"?$("csv-file"):$("catalog-file");
 try{if(task.kind==="orders")await importCsvFile(task.file);else await catalogCsvImport(task.file);}
 catch(err){notify(err.message||"No se pudo completar la importación.");}
 finally{input.value="";}
};
$("import-preview-dialog").addEventListener("cancel",()=>{pendingImport=null;$("csv-file").value="";$("catalog-file").value="";});

$("new-order").onclick=()=>{$("order-dialog").showModal();$("client-name").focus();};
$("order-form").addEventListener("submit",e=>{if(e.submitter?.id!=="create-order")return;e.preventDefault();const client=$("client-name").value.trim();if(!client){notify("Introduce un cliente ficticio.");return;}$("order-dialog").close();addOrder(client,$("channel").value,[{name:"Material eléctrico surtido",sku:"MAT-SURT-01",qty:5,unit:"caja",price:22.5,issue:"Confirma la composición del surtido",checked:false},{name:"Accesorios de instalación",sku:"ACC-INST-02",qty:3,unit:"lote",price:14,issue:"Confirma el contenido del lote",checked:false}]);});
$("parse-order").onclick=parseText;
$("hero-import")?.addEventListener("click",()=>$("csv-file").click());$("export-all").onclick=()=>state.orders.length?exportCsv(state.orders):notify("No hay pedidos que exportar.");$("export-all-xlsx").onclick=()=>state.orders.length?exportOrdersXlsx(state.orders):notify("No hay pedidos que exportar.");$("clear-activity").onclick=()=>{if(!confirm("¿Limpiar el historial local?"))return;state.activity=[];persist();renderActivity();};
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>view(b.dataset.view));

$("import-csv").onclick=()=>$("csv-file").click();
$("csv-file").onchange=async e=>{try{await showImportPreview(e.target.files[0],"orders");}catch(err){notify(err.message||"No se pudo leer el CSV.");e.target.value="";}};
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