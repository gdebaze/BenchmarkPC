import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({localStorage:{getItem:()=>null,setItem:()=>{}},compute(){},renderDetail(){}});
vm.runInContext(fs.readFileSync('js/data.js','utf8'),context,{filename:'js/data.js'});
vm.runInContext(fs.readFileSync('js/compatibility.js','utf8'),context,{filename:'js/compatibility.js'});
const read=expr=>vm.runInContext(expr,context);
test('ultrawide monitor catalog uses native resolutions',()=>{
 assert.equal(read("monitors.UWQHD.find(m=>m.id==='oledg949').native.join('x')"),'5120x1440');
 assert.equal(read("monitors['4K'].find(m=>m.id==='neog957').native.join('x')"),'7680x2160');
});
test('native ultrawides scale estimated FPS below standard resolution',()=>{
 assert.ok(read("effectiveResolutionFactor('UWQHD',monitors.UWQHD.find(m=>m.id==='oledg949'))")<read("effectiveResolutionFactor('UWQHD',monitors.UWQHD[0])"));
 assert.ok(read("effectiveResolutionFactor('4K',monitors['4K'].find(m=>m.id==='neog957'))")<read("effectiveResolutionFactor('4K',monitors['4K'][0])"));
});
test('explicitly mismatched CPU photos are absent',()=>{
 const b=read('builds.map(b=>({cpu:b.cpu,cpuImg:b.cpuImg}))');
 assert.equal(b.find(x=>x.cpu==='Ryzen 5 7500F').cpuImg,'');
 assert.equal(b.find(x=>x.cpu==='Ryzen 9 9950X3D').cpuImg,'');
});
test('wrong socket, clearance and PSU wattage trigger failures',()=>{
 const r=read("compatibilityReportV32({cpu:'Intel Core i3-12100F',mobo:'B650 DDR5',ram:'32 Go DDR5',caseModel:{gpuMax:300,topRad:360},gpuDims:[340,120,50],psuWatts:500,gpu:'RTX 5080',cooling:'aio',cooler:'AIO 360 mm'})");
 assert.ok(r.fail>=3);assert.equal(r.compatible,false);
});
test('undocumented RAM QVL and M.2 stay warnings',()=>{
 const r=read("compatibilityReportV32({cpu:'Ryzen 5 9600X',mobo:'B850 DDR5',ram:'32 Go DDR5',caseModel:{gpuMax:400,topRad:360},gpuDims:[280,115,50],psuWatts:850,gpu:'RTX 5080',cooling:'aio',cooler:'AIO 360 mm'})");
 assert.equal(r.checks.find(x=>x.id==='qvl').status,'warn');
 assert.equal(r.checks.find(x=>x.id==='ssd').status,'warn');
});
test('app scripts parse independently',()=>{
 for(const f of ['js/data.js','js/app.js','js/buildlab-reference.js','js/buildlab-v17.js','js/compatibility.js'])assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(f,'utf8'),{filename:f}));
});
test('responsive fixes keep the exploded tab and specifications',()=>{
 const css=fs.readFileSync('css/styles.css','utf8');
 assert.ok(css.includes('.view-tabs .lab-btn:nth-child(4){display:inline-flex!important}'));
 assert.ok(css.includes('.detail{display:block;overflow-y:auto'));
});
