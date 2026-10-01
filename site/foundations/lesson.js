import {angle, ratio, inscribedLand, vertices} from './geometry.mjs';
const $ = s => document.querySelector(s);
const fa = (n, digits=2) => Number(n).toLocaleString('fa-IR',{maximumFractionDigits:digits});
const ns='http://www.w3.org/2000/svg', ink='#263c32', red='#cb4327', muted='#849087';
let mode='definition';
const values={definition:12,comparison:12,polygon:12};
const titles={definition:'تعریف زمین',comparison:'مقایسهٔ زمین‌ها',polygon:'زمین و چندضلعی منتظم'};
function add(tag,attrs={},parent=$('#geometry')){const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);parent.append(el);return el;}
function text(value,x,y,attrs={},parent){const el=add('text',{x,y,fill:ink,'font-size':18,'text-anchor':'middle',...attrs},parent);el.textContent=value;return el;}
function line(x1,y1,x2,y2,attrs={},parent){return add('line',{x1,y1,x2,y2,stroke:ink,'stroke-width':1.5,...attrs},parent);}
function rect(x,y,width,height,attrs={},parent){return add('rect',{x,y,width,height,fill:'none',stroke:ink,'stroke-width':1.7,...attrs},parent);}
function definition(n){
 const theta=2*Math.PI/n,h=310,w=h/ratio(n),x=444-w/2,y=65;
 // The circle center and diagonal start coincide with the land's lower-left corner.
 const cx=x,cy=y+h,r=88;
 rect(x,y,w,h,{fill:'#f3efdf','fill-opacity':.75});
 add('circle',{cx,cy,r,fill:'#efc55a','fill-opacity':.14,stroke:muted,'stroke-width':1});
 for(let i=0;i<n;i++){const a=-Math.PI/2+i*theta;line(cx,cy,cx+r*Math.cos(a),cy+r*Math.sin(a),{stroke:muted,'stroke-width':.8});}
 add('path',{d:`M ${cx} ${cy} L ${cx} ${cy-r} A ${r} ${r} 0 0 1 ${cx+r*Math.sin(theta)} ${cy-r*Math.cos(theta)} Z`,fill:red,'fill-opacity':.22,stroke:red,'stroke-width':1});
 line(cx,cy,x+w,y,{stroke:red,'data-diagonal':''});
 const ar=56;add('path',{d:`M ${cx} ${cy-ar} A ${ar} ${ar} 0 0 1 ${cx+ar*Math.sin(theta)} ${cy-ar*Math.cos(theta)}`,fill:'none',stroke:red,'stroke-width':1.5});
 add('path',{d:`M ${x+w} ${y+ar} A ${ar} ${ar} 0 0 1 ${x+w-ar*Math.sin(theta)} ${y+ar*Math.cos(theta)}`,fill:'none',stroke:red,'stroke-width':1.5});
}
function comparison(n){
 const base=660,width=143,left=130,right=500;
 const group=add('g',{'data-comparison':'all'});
 for(let k=8;k<=26;k++){
  const g=add('g',{'data-land':k,opacity:k===n?1:.18},group);
  const color=`hsl(${(k-8)*29+280} 62% 39%)`,h=width*ratio(k),rh=width/ratio(k);
  rect(left,base-h,width,h,{stroke:color,'stroke-width':1.2},g);
  rect(right,base-rh,width,rh,{stroke:color,'stroke-width':1.2},g);
  text(fa(k),left-17,base-h+5,{'font-size':12,fill:color},g);
 }
 // Repeat selected outlines last so shared edges stay prominent.
 const h=width*ratio(n),rh=width/ratio(n);
 rect(left,base-h,width,h,{stroke:red,'stroke-width':2.7,fill:red,'fill-opacity':.04,'data-highlight':'vertical'});
 rect(right,base-rh,width,rh,{stroke:red,'stroke-width':2.7,fill:red,'fill-opacity':.07,'data-highlight':'horizontal'});
 text(fa(n),right+width+22,base-rh+5,{fill:red,'font-size':16});
 text('عرض ثابت',left+width/2,695,{'font-size':15,fill:muted});
 text('طول ثابت',right+width/2,695,{'font-size':15,fill:muted});
}
function polygon(n){
 const cx=400,cy=280,r=225,{width:w,height:h}=inscribedLand(n,r);
 add('circle',{cx,cy,r,fill:'none',stroke:muted,'stroke-width':1,'stroke-dasharray':'4 5'});
 add('polygon',{points:vertices(n,cx,cy,r).map(p=>p.join(',')).join(' '),fill:'none',stroke:ink,'stroke-width':1.7,'data-polygon':n});
 rect(cx-w/2,cy-h/2,w,h,{stroke:red,'stroke-width':2,fill:red,'fill-opacity':.06,'data-inscribed':n});
 text(`زمین ${fa(n)}`,cx,cy+7,{fill:red,'font-size':22});
 for(const [x,y] of [[cx-w/2,cy-h/2],[cx+w/2,cy-h/2]])add('circle',{cx:x,cy:y,r:3,fill:red});
}
function render(){
 const n=values[mode];$('#geometry').replaceChildren();
 $('.sheet').dataset.mode=mode;
 $('#canvas').setAttribute('viewBox',mode==='comparison'?'0 0 800 730':'0 0 800 540');
 $('#definition').hidden=mode!=='definition';$('#math').hidden=mode!=='definition';
 $('#view-title').textContent=titles[mode];
 $('#selected-land').textContent=`زمین ${fa(n)}`;$('#selected-angle').textContent=`${fa(angle(n))}°`;$('#selected-ratio').textContent=fa(ratio(n),3);
 document.querySelectorAll('[data-definition-number]').forEach(el=>el.textContent=fa(n));
 $('#land-number').textContent=fa(n);$('#equation').textContent=`۳۶۰° ÷ ${fa(n)} ${360%n===0?'=':'≈'} ${fa(angle(n))}°`;
 $('#diagram-title').textContent=`${titles[mode]}؛ زمین ${fa(n)}؛ زاویهٔ طول و قطر ${fa(angle(n))} درجه`;
 ({definition,comparison,polygon}[mode])(n);
 document.querySelectorAll('input[type=range]').forEach(input=>{input.setAttribute('aria-valuetext',`زمین ${fa(input.value)}`);input.previousElementSibling.querySelector('output').textContent=fa(input.value);});
}
document.querySelectorAll('input[name=mode]').forEach(input=>input.addEventListener('change',()=>{
 mode=input.value;document.querySelectorAll('.tool').forEach(tool=>{const active=tool.querySelector('input[type=radio]').checked;tool.classList.toggle('active',active);tool.querySelector('.slider-panel').hidden=!active;tool.querySelector('input[type=range]').disabled=!active;});render();
}));
document.querySelectorAll('input[type=range]').forEach(input=>input.addEventListener('input',()=>{values[mode]=Number(input.value);render();}));
render();
