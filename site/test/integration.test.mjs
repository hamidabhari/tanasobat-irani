import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,access} from 'node:fs/promises';
import {nestedRectangles} from '../margins/geometry.mjs';
import {translate} from '../shared/translations.js';
test('nested borders preserve requested area and equal physical inset',()=>{
 for(let n=8;n<=22;n++)for(const margins of [[0,0,0],[50,10,50],[80,80,80],[0,80,10]]){
  const layers=nestedRectangles(n,margins);
  for(let i=1;i<layers.length;i++){
   const p=layers[i-1],c=layers[i];
   assert.ok(Math.abs(c.width*c.height/10000-(1-margins[i-1]/100))<1e-10);
   assert.ok(Math.abs(p.ratio*(1-c.width/100)-(1-c.height/100))<1e-10);
   assert.ok(Math.abs(c.area-p.area*(1-margins[i-1]/100))<1e-10);
  }
 }
});
test('translations cover dynamic labels, proportions and narrative',()=>{
 assert.equal(translate('زمین ۱۲، لایهٔ ۲'),'Rectangle 12, Layer 2');
 assert.equal(translate('۳ از ۱۰'),'3 of 10');
 assert.equal(translate('حاشیه ۵۰٪ · متن ۵۰٪'),'Border 50% · Field 50%');
 assert.equal(translate('نسبت طول به عرض'),'Length-to-width ratio');
});
test('all four tabs and their runtime assets ship together',async()=>{
 const html=await readFile('dist/index.html','utf8');
 const keys=[...html.matchAll(/data-key="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(keys,['foundations','margins','drawing','karbandi']);
 for(const key of keys)await access(`dist/${key}/index.html`);
 for(const file of ['shared/preferences.js','shared/translations.js','shared/embedded.css','shared/shell.js','shared/shell.css','margins/geometry.mjs','margins/ardabil-carpet.jpg','assets/Vazirmatn-VariableFont_wght.ttf'])await access('dist/'+file);
});
