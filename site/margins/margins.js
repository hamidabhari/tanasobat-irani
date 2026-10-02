import {nestedRectangles} from './geometry.mjs';
const $=s=>document.querySelector(s),fmt=(n,d=0)=>n.toLocaleString('fa-IR',{minimumFractionDigits:d,maximumFractionDigits:d});
const values=[10,50,10,50],visible=[true,true,true,true],colors=['#cb4327','#efb90b','#4d438e','#3a9e58'],labels=['شمارهٔ زمین نخست','حاشیهٔ اول','حاشیهٔ دوم','حاشیهٔ سوم'];
let show=false,custom=null,revision=0;
$('#controls').innerHTML=values.map((v,i)=>`<div class="slider-card" style="--slider-color:${colors[i]}"><span class="slider-top"><label for="range-${i}">${labels[i]}</label><span class="slider-actions">${i?`<button class="mini-toggle is-on" data-toggle="${i}" type="button" role="switch" aria-checked="true" aria-label="نمایش ${labels[i]}"><i></i></button>`:''}<output id="value-${i}" for="range-${i}"></output></span></span><input id="range-${i}" data-index="${i}" type="range" min="${i?0:8}" max="${i?80:22}" step="1" value="${v}"><span class="range-limits"><small>${i?'۰٪':'۸'}</small><small>${i?'۸۰٪':'۲۲'}</small></span></div>`).join('');
new ResizeObserver(()=>{
 const diagram=$('.diagram'),style=getComputedStyle(diagram);
 diagram.style.setProperty('--plot-max-height',Math.max(100,diagram.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom))+'px');
}).observe($('.diagram'));
function render(){
 const geometry=nestedRectangles(values[0],values.slice(1));
 $('#problem').textContent=`یک زمین ${fmt(values[0])} رسم کنید. از چهار طرف به‌اندازه‌ای حاشیه بدهید که مساحت حاشیه برابر با ${fmt(values[1])}٪ مساحت کل باشد. سپس همین کار را برای زمین تازه، با حاشیهٔ ${fmt(values[2])}٪ و پس از آن با حاشیهٔ ${fmt(values[3])}٪ تکرار کنید.`;
 $('#outer').style.aspectRatio=geometry[0].ratio;$('#outer').style.setProperty('--land-ratio',geometry[0].ratio);
 $('#steps').innerHTML=geometry.map((g,i)=>`<div class="step"><span class="step-line" style="background:${colors[i]}"></span><div><small>${fmt(i+1)}</small><strong>زمین ${fmt(g.land,i?2:0)}</strong><span>${i?`حاشیه ${fmt(values[i])}٪ · متن ${fmt(100-values[i])}٪`:'نقطهٔ آغاز'}</span></div></div>`).join('');
 geometry.forEach((g,i)=>{if(i){const p=$('#plot-'+i);p.style.width=g.width+'%';p.style.height=g.height+'%';p.classList.toggle('is-hidden',!visible[i]);}$('#label-'+i).innerHTML=`<span>زمین ${fmt(g.land,i?2:0)}</span><small>${i?`${fmt(g.area)}٪ از زمین نخستین`:'مساحت مبنا: ۱۰۰٪'}</small>`;$('#value-'+i).textContent=fmt(values[i])+(i?'٪':'');$('#range-'+i).style.setProperty('--progress',((values[i]-(i?0:8))/(i?80:14)*100)+'%');});
 geometry.forEach((_,i)=>$('#label-'+i).hidden=!visible[i]);
}
function imageState(){ $('#outer').classList.toggle('carpet-visible',show);$('#carpet').classList.toggle('is-on',show);$('#carpet').setAttribute('aria-checked',show);$('#credit').hidden=!show||!!custom;$('#image-label').textContent=custom?'نمایش تصویر انتخابی':'نمایش فرش اردبیل'; }
$('#controls').addEventListener('input',e=>{if(e.target.matches('input[type=range]')){values[Number(e.target.dataset.index)]=Number(e.target.value);render();}});
$('#controls').addEventListener('click',e=>{const button=e.target.closest('[data-toggle]');if(!button)return;const i=Number(button.dataset.toggle);visible[i]=!visible[i];button.classList.toggle('is-on',visible[i]);button.setAttribute('aria-checked',visible[i]);render();});
$('#carpet').addEventListener('click',()=>{show=!show;imageState();});
$('#upload').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const version=++revision;if(!file.type.startsWith('image/')){$('#message').textContent='لطفاً یک فایل تصویری انتخاب کنید.';return;}const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{if(version!==revision){URL.revokeObjectURL(url);return;}if(custom)URL.revokeObjectURL(custom);custom=url;$('#image').src=url;$('#image').alt=file.name;$('#filename').textContent=file.name;$('#message').textContent='';show=true;imageState();};img.onerror=()=>{URL.revokeObjectURL(url);if(version===revision)$('#message').textContent='تصویر خوانده نشد؛ یک تصویر دیگر انتخاب کنید.';};img.src=url;e.target.value='';});
render();
