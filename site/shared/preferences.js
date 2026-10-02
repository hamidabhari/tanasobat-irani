import {translate} from './translations.js';
const embedded=window.parent!==window;
if(embedded)document.documentElement.classList.add('embedded');
let language='fa';
const records=new WeakMap();
const nativePreferences=typeof window.setProjectPreferences==='function';
function localize(){
 if(nativePreferences)return;
 observer.disconnect();
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement.closest('script,style,#filename')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
 while(walker.nextNode()){
  const node=walker.currentNode;let record=records.get(node);
  if(!record||node.nodeValue!==record.output)record={source:node.nodeValue};
  // Uploaded filenames are user content. Only translate the built-in status.
  const filename=node.parentElement.closest('#image-name');
  if(filename&&!['بدون تصویر زمینه','شاهنامهٔ شاه تهماسب · مجموعه ساریخانی'].includes(record.source))continue;
  record.output=language==='en'?translate(record.source):record.source;
  if(node.nodeValue!==record.output)node.nodeValue=record.output;
  records.set(node,record);
 }
 document.body.querySelectorAll('[aria-label],[aria-valuetext],[title],[alt]').forEach(el=>{
  let record=records.get(el)||{};
  for(const attr of ['aria-label','aria-valuetext','title','alt']){
   if(!el.hasAttribute(attr))continue;const value=el.getAttribute(attr);let item=record[attr];
   if(!item||value!==item.output)item={source:value};
   item.output=language==='en'?translate(item.source):item.source;
   if(value!==item.output)el.setAttribute(attr,item.output);record[attr]=item;
  }records.set(el,record);
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-valuetext','title','alt']});
}
const observer=new MutationObserver(localize);
if(!nativePreferences)localize();
let lastHeight=0;
function reportHeight(){if(!embedded)return;const height=Math.ceil(document.body.getBoundingClientRect().height);if(height>0&&height!==lastHeight){lastHeight=height;parent.postMessage({type:'iranian-height',height},location.origin);}}
window.addEventListener('message',event=>{
 if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='iranian-preferences')return;
 const prefs=event.data;if(!['fa','en'].includes(prefs.language)||!['light','dark'].includes(prefs.theme))return;
 if(Number.isFinite(prefs.availableHeight)){document.documentElement.style.setProperty('--available-height',prefs.availableHeight+'px');document.documentElement.dataset.compact=prefs.availableHeight<620;}
 language=prefs.language;document.documentElement.lang=language;document.documentElement.dir=language==='fa'?'rtl':'ltr';document.documentElement.dataset.theme=prefs.theme;
 if(nativePreferences)window.setProjectPreferences(prefs);else localize();
 requestAnimationFrame(reportHeight);
});
new ResizeObserver(reportHeight).observe(document.body);
if(embedded)parent.postMessage({type:'iranian-ready'},location.origin);
