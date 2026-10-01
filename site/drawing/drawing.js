const $ = s => document.querySelector(s);
const svg = $('#canvas'), layer = $('#lands');
const colors = ['#cb4327','#efb90b','#4d438e','#3a9e58','#397ca5','#b9873e','#ae5965','#298c88','#786047','#78843c'];
const fa = value => Number(value).toLocaleString('fa-IR');
const ratio = n => 1 / Math.tan(2 * Math.PI / n);
const aspect = land => land.vertical ? 1 / ratio(land.n) : ratio(land.n);
let serial = 1, selected = 1, drag = null, imageUrl = null, imageRevision = 0;
const lands = [{id:1,n:10,x:310,y:265,h:270,color:colors[0],visible:true,vertical:false,polygon:false}];
function el(tag, attrs){const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);return node;}
// Rectangle corners lie on the same circumcircle as the regular n-gon.
// A vertical land has its polygon's first vertex at the top, as in the reference.
function polygonPoints(land){
 const w=land.h*aspect(land),cx=land.x+w/2,cy=land.y+land.h/2;
 const radius=Math.hypot(w,land.h)/2,start=land.vertical?-Math.PI/2:0;
 return Array.from({length:land.n},(_,i)=>{
  const angle=start+i*2*Math.PI/land.n;
  return `${cx+radius*Math.cos(angle)},${cy+radius*Math.sin(angle)}`;
 }).join(' ');
}
function darker(color){return '#'+color.slice(1).match(/../g).map(c=>Math.round(parseInt(c,16)*.72).toString(16).padStart(2,'0')).join('');}
function renderCanvas(){
 layer.replaceChildren();
 for(const land of [...lands.filter(l=>l.id!==selected),...lands.filter(l=>l.id===selected)]){
  if(!land.visible)continue;
  const w=land.h*aspect(land),g=el('g',{class:'land','data-id':land.id,tabindex:0,role:'graphics-symbol','aria-label':`زمین ${fa(land.n)}، لایهٔ ${fa(lands.indexOf(land)+1)}`});
  if(land.polygon)g.append(el('polygon',{points:polygonPoints(land),fill:land.color,stroke:land.color,'stroke-width':1.5,class:'land-fill outline land-polygon'}));
  g.append(el('rect',{x:land.x,y:land.y,width:w,height:land.h,fill:land.polygon?'none':land.color,stroke:land.polygon?darker(land.color):land.color,'stroke-width':land.id===selected?2:1.5,class:land.polygon?'outline land-rectangle':'land-fill outline land-rectangle','pointer-events':'all'}));
  if(land.id===selected){
   const label=el('text',{x:land.x+w,y:land.y<30?land.y+25:land.y-15,'text-anchor':'end',fill:land.color,class:'land-label'});label.textContent=`زمین ${fa(land.n)}`;g.append(label);
   for(const [corner,dx,dy] of [['nw',0,0],['ne',w,0],['sw',0,land.h],['se',w,land.h]]) g.append(el('rect',{x:land.x+dx-7,y:land.y+dy-7,width:14,height:14,rx:1,stroke:land.color,class:'handle','data-corner':corner,style:`cursor:${corner==='nw'||corner==='se'?'nwse':'nesw'}-resize`}));
  }
  layer.append(g);
 }
}
function renderControls(){
 $('#controls').innerHTML=lands.map((l,i)=>`<article class="card ${l.id===selected?'active':''}" style="--color:${l.color}" data-id="${l.id}"><div class="card-top"><button class="select-land" aria-pressed="${l.id===selected}"><span class="swatch"></span>زمین ${fa(i+1)}</button><button class="remove" aria-label="حذف زمین ${fa(i+1)}" ${lands.length===1?'disabled':''}>×</button></div><div class="range-row"><label for="n-${l.id}">شمارهٔ زمین</label><input id="n-${l.id}" type="range" min="8" max="22" step="1" value="${l.n}" aria-valuetext="${fa(l.n)}"><output for="n-${l.id}">${fa(l.n)}</output></div><div class="land-switches"><label><span>نمایش</span><input type="checkbox" role="switch" class="visibility-switch" aria-label="نمایش زمین ${fa(i+1)}" ${l.visible?'checked':''}><span class="switch-track" aria-hidden="true"></span></label><label><span>عمودی</span><input type="checkbox" role="switch" class="orientation-switch" aria-label="حالت عمودی زمین ${fa(i+1)}" ${l.vertical?'checked':''}><span class="switch-track" aria-hidden="true"></span></label><label><span>چندضلعی</span><input type="checkbox" role="switch" class="polygon-switch" aria-label="چندضلعی زمین ${fa(i+1)}" ${l.polygon?'checked':''}><span class="switch-track" aria-hidden="true"></span></label></div></article>`).join('');
 $('#count').textContent=`${fa(lands.length)} زمین`;$('#capacity').textContent=`${fa(lands.length)} از ۱۰`;$('#add').disabled=lands.length>=10;
}
function render(){renderCanvas();renderControls();}
function focusSelected(){layer.querySelector(`[data-id="${selected}"]`)?.focus({preventScroll:true});}
$('#controls').addEventListener('click',e=>{const card=e.target.closest('.card');if(!card)return;const id=Number(card.dataset.id);if(e.target.closest('.remove')){if(lands.length===1)return;lands.splice(lands.findIndex(l=>l.id===id),1);if(selected===id)selected=lands.at(-1).id;render();}else if(e.target.closest('.select-land')){selected=id;render();focusSelected();}});
$('#controls').addEventListener('change',e=>{
 const card=e.target.closest('.card');if(!card||e.target.type!=='checkbox')return;
 const l=lands.find(l=>l.id===Number(card.dataset.id));
 if(e.target.classList.contains('visibility-switch'))l.visible=e.target.checked;
 else if(e.target.classList.contains('polygon-switch'))l.polygon=e.target.checked;
 else if(e.target.classList.contains('orientation-switch')){
  const w=l.h*aspect(l),cx=l.x+w/2,cy=l.y+l.h/2;
  l.vertical=e.target.checked;l.h=w;
  l.x=cx-l.h*aspect(l)/2;l.y=cy-l.h/2;constrain(l);
 }
 renderCanvas();
});
$('#controls').addEventListener('input',e=>{if(e.target.type!=='range')return;const l=lands.find(l=>l.id===Number(e.target.closest('.card').dataset.id));const cx=l.x+l.h*aspect(l)/2;l.n=Number(e.target.value);l.x=cx-l.h*aspect(l)/2;selected=l.id;constrain(l);e.target.nextElementSibling.textContent=fa(l.n);e.target.setAttribute('aria-valuetext',fa(l.n));document.querySelectorAll('.card').forEach(c=>{c.classList.toggle('active',Number(c.dataset.id)===selected);c.querySelector('.select-land').setAttribute('aria-pressed',Number(c.dataset.id)===selected);});renderCanvas();});
$('#add').addEventListener('click',()=>{if(lands.length>=10)return;const color=colors.find(c=>!lands.some(l=>l.color===c));selected=++serial;lands.push({id:selected,n:10,x:250+lands.length*22,y:200+lands.length*22,h:260,color,visible:true,vertical:false,polygon:false});render();$('#controls').lastElementChild.scrollIntoView({block:'nearest'});});
function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());}
function constrain(l){l.h=Math.max(40,Math.min(l.h,800,1000/aspect(l)));l.x=Math.max(0,Math.min(l.x,1000-l.h*aspect(l)));l.y=Math.max(0,Math.min(l.y,800-l.h));}
svg.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const target=e.target.closest('.land');if(!target)return;e.preventDefault();selected=Number(target.dataset.id);const l=lands.find(l=>l.id===selected);drag={...l,start:point(e),corner:e.target.dataset.corner,pointerId:e.pointerId};svg.setPointerCapture(e.pointerId);render();focusSelected();});
svg.addEventListener('pointermove',e=>{if(!drag||drag.pointerId!==e.pointerId)return;const p=point(e),l=lands.find(l=>l.id===drag.id);if(!drag.corner){l.x=drag.x+p.x-drag.start.x;l.y=drag.y+p.y-drag.start.y;constrain(l);}else{
 const r=aspect(l),sx=drag.corner.includes('w')?-1:1,sy=drag.corner.includes('n')?-1:1;
 const ax=drag.x+(sx<0?drag.h*r:0),ay=drag.y+(sy<0?drag.h:0);
 const maxH=Math.min(sx<0?ax/r:(1000-ax)/r,sy<0?ay:800-ay);
 const desired=drag.h+((p.x-drag.start.x)*sx*r+(p.y-drag.start.y)*sy)/(r*r+1);
 l.h=Math.max(40,Math.min(maxH,desired));l.x=sx<0?ax-l.h*r:ax;l.y=sy<0?ay-l.h:ay;
 }renderCanvas();});
function endDrag(e){if(drag&&e.pointerId===drag.pointerId){drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);focusSelected();}}svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);svg.addEventListener('lostpointercapture',()=>drag=null);
svg.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const key=e.code==='Equal'||e.code==='NumpadAdd'?'+':e.code==='Minus'||e.code==='NumpadSubtract'?'-':e.key;const target=e.target.closest('.land');if(!target||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(key))return;e.preventDefault();selected=Number(target.dataset.id);const l=lands.find(l=>l.id===selected),step=e.shiftKey?20:5;if(key==='ArrowLeft')l.x-=step;if(key==='ArrowRight')l.x+=step;if(key==='ArrowUp')l.y-=step;if(key==='ArrowDown')l.y+=step;if(['+','=','-'].includes(key)){const old=l.h;l.h*=key==='-'?.95:1.05;l.x-=(l.h-old)*aspect(l)/2;l.y-=(l.h-old)/2;}constrain(l);render();focusSelected();});
function clearImage(){imageRevision++;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;$('#background').removeAttribute('href');svg.classList.remove('has-image');$('#sample').setAttribute('aria-pressed','false');$('#clear-image').hidden=true;$('#image-name').textContent='بدون تصویر زمینه';$('#upload').value='';$('#message').textContent='';}
function setImage(url,name,isSample=false){const revision=++imageRevision,img=new Image();img.onload=()=>{if(revision!==imageRevision){if(!isSample)URL.revokeObjectURL(url);return;}if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=isSample?null:url;$('#background').setAttribute('href',url);svg.classList.add('has-image');$('#sample').setAttribute('aria-pressed',String(isSample));$('#clear-image').hidden=false;$('#image-name').textContent=name;$('#message').textContent='';};img.onerror=()=>{if(!isSample)URL.revokeObjectURL(url);if(revision===imageRevision)$('#message').textContent='تصویر خوانده نشد؛ یک تصویر دیگر انتخاب کنید.';};img.src=url;}
$('#sample').addEventListener('click',()=>{$('#sample').getAttribute('aria-pressed')==='true'?clearImage():setImage('assets/shahnameh.jpeg','شاهنامهٔ شاه تهماسب · مجموعه ساریخانی',true);});
$('#clear-image').addEventListener('click',clearImage);
$('#upload').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){$('#message').textContent='لطفاً یک فایل تصویری انتخاب کنید.';return;}setImage(URL.createObjectURL(file),file.name);e.target.value='';});
render();
