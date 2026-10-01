import assert from 'node:assert/strict';
import test from 'node:test';
import {access} from 'node:fs/promises';
import {angle,ratio,inscribedLand,vertices} from '../foundations/geometry.mjs';
test('definition holds across every slider value',()=>{
 for(let n=8;n<=26;n++){
  assert.ok(Math.abs(Math.atan(1/ratio(n))*180/Math.PI-angle(n))<1e-10);
  if(n>8)assert.ok(ratio(n)>ratio(n-1));
 }
 assert.ok(Math.abs(ratio(8)-1)<1e-10);
 assert.ok(Math.abs(ratio(12)-Math.sqrt(3))<1e-10);
});
test('regular polygons share a circumcircle and two vertices with their land',()=>{
 for(let n=8;n<=22;n++){
  const r=225,{width:w,height:h}=inscribedLand(n,r),points=vertices(n,0,0,r);
  assert.equal(points.length,n);
  assert.ok(Math.abs(h/w-ratio(n))<1e-10);
  assert.ok(Math.abs(Math.hypot(w/2,h/2)-r)<1e-10);
  for(const x of [-w/2,w/2]) assert.ok(points.some(([px,py])=>Math.hypot(px-x,py+h/2)<1e-9));
  const sides=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%n][0],p[1]-points[(i+1)%n][1]));
  assert.ok(Math.max(...sides)-Math.min(...sides)<1e-9);
 }
});
test('lesson assets ship in the Pages build',async()=>{
 for(const file of ['index.html','style.css','lesson.js','geometry.mjs'])await access(`dist/foundations/${file}`);
});
