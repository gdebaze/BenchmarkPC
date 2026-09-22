/* Readout V16 — reference-inspired realistic BuildLab (geometry-first, no photo skins). */
(()=>{
  'use strict';
  if(typeof THREE==='undefined'||typeof buildThreePC!=='function') return;

  const C={
    black:0x090b0f, steel:0x15191f, steel2:0x252b33, edge:0x3b424b,
    silver:0xbec5cb, pcb:0x111a17, copper:0xb56f3b, gold:0xc4a04c,
    glass:0x8fc9dc, white:0xd8dde2
  };
  let referenceSceneReady=false,referenceGrid=null,referenceGlass=[];

  function injectReferenceCss(){
    if(document.getElementById('v16-reference-style'))return;
    const s=document.createElement('style');s.id='v16-reference-style';s.textContent=`
      #stage{background:
        radial-gradient(circle at 58% 38%,rgba(51,110,86,.10),transparent 34%),
        radial-gradient(circle at 35% 64%,rgba(40,80,110,.08),transparent 35%),
        linear-gradient(180deg,#080b0d 0%,#06080a 62%,#040506 100%)!important}
      #stage:before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.018),transparent 35%);mix-blend-mode:screen}
      .three-badge{backdrop-filter:blur(12px);background:rgba(7,10,13,.70)!important;border-color:rgba(255,255,255,.10)!important}
      .photo3d-note{background:rgba(6,9,12,.72)!important;border-color:rgba(103,220,255,.18)!important;backdrop-filter:blur(12px)}
      .ref-realism-badge{display:inline-flex;align-items:center;gap:8px;margin:0 0 10px;padding:7px 10px;border-radius:999px;border:1px solid rgba(103,220,255,.28);background:rgba(103,220,255,.07);font:700 8px 'JetBrains Mono',monospace;letter-spacing:.11em;color:#c8f5ff;text-transform:uppercase}
      .ref-realism-badge:before{content:'';width:6px;height:6px;border-radius:50%;background:#67dcff;box-shadow:0 0 14px rgba(103,220,255,.9)}
    `;document.head.appendChild(s)
  }

  function m(color,metal=.5,rough=.35,em=0,ei=0){return mat(color,metal,rough,em,ei)}
  function rb(w,h,d,r,color=C.steel,metal=.72,rough=.28){return roundedPanel(w,h,d,r,m(color,metal,rough))}
  function screw(x,y,z,axis='z'){
    const o=cyl(.035,.035,m(C.silver,.95,.16),20);
    if(axis==='x')o.rotation.z=Math.PI/2;else if(axis==='z')o.rotation.x=Math.PI/2;
    o.position.set(x,y,z);return o
  }
  function textTex(title,sub='',accent='#b9c5cf'){
    const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');
    x.fillStyle='rgba(4,6,8,.84)';x.fillRect(0,0,c.width,c.height);
    x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=4;x.strokeRect(6,6,c.width-12,c.height-12);
    x.fillStyle='#f3f5f6';x.font='700 44px Arial';x.fillText(String(title).slice(0,34),32,103);
    x.fillStyle=accent;x.font='600 27px Arial';x.fillText(String(sub).slice(0,55),32,166);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t
  }
  function textPlane(title,sub,w=.92,h=.24){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTex(title,sub),transparent:true,depthWrite:false,toneMapped:false}));p.renderOrder=7;return p
  }

  function addFrame(g,D,H,W,theme){
    const steel=m(C.steel,.86,.24),edge=m(C.edge,.94,.16),dark=m(C.black,.52,.62);
    const top=box(D,.14,W,steel);top.position.y=H/2-.07;g.add(top);
    const bottom=box(D,.18,W,steel);bottom.position.y=-H/2+.09;g.add(bottom);
    const rear=box(.14,H-.30,W,steel);rear.position.x=-D/2+.07;g.add(rear);
    for(const x of [-D/2+.09,D/2-.09]){const v=box(.16,H-.18,.16,edge);v.position.set(x,0,W/2-.08);g.add(v)}
    for(const y of [-H/2+.09,H/2-.09]){const h=box(D-.18,.16,.16,edge);h.position.set(0,y,W/2-.08);g.add(h)}
    const tray=box(D*.70,H*.70,.075,m(0x22282e,.82,.30));tray.position.set(-D*.08,.10,-W/2+.16);g.add(tray);
    const shroud=rb(D*.73,.70,W*.82,.055,0x11151a,.84,.26);shroud.position.set(-D*.05,-H/2+.48,-.04);g.add(shroud);
    for(const x of [-D*.34,D*.34])for(const z of [-W*.31,W*.31]){const foot=rb(.48,.18,.42,.04,0x080a0d,.55,.66);foot.position.set(x,-H/2-.10,z);g.add(foot)}
    const accent=rb(D*.62,.035,.035,.01,theme,.28,.18);accent.position.set(-D*.03,-H/2+.88,W/2-.03);accent.material.emissive=new THREE.Color(theme);accent.material.emissiveIntensity=.35;g.add(accent);
    return {steel,edge,dark}
  }

  function addGlassPanel(g,D,H,W,front=false){
    const gm=new THREE.MeshPhysicalMaterial({color:C.glass,transparent:true,opacity:.075,roughness:.04,metalness:0,transmission:.90,thickness:.035,side:THREE.DoubleSide,depthWrite:false});
    const side=new THREE.Mesh(new THREE.PlaneGeometry(D-.30,H-.34),gm);side.position.set(0,0,W/2+.012);g.add(side);referenceGlass.push(side);
    if(front){const fm=gm.clone(),fp=new THREE.Mesh(new THREE.PlaneGeometry(W-.34,H-.34),fm);fp.rotation.y=Math.PI/2;fp.position.set(D/2+.012,0,0);g.add(fp);referenceGlass.push(fp)}
  }

  function addFrontFrame(g,D,H,W){
    const edge=m(C.edge,.92,.18);
    const a=box(.16,H-.20,.18,edge);a.position.set(D/2-.08,0,-W/2+.09);g.add(a);
    const b=a.clone();b.position.z=W/2-.09;g.add(b);
    const t=box(.16,.18,W-.18,edge);t.position.set(D/2-.08,H/2-.09,0);g.add(t);
    const bt=t.clone();bt.position.y=-H/2+.09;g.add(bt)
  }

  function createReferenceCase(b){
    referenceGlass=[];
    const dims={north:[4.47,4.69,2.15],h6:[4.15,4.35,2.87],o11:[4.78,4.71,2.90],y70:[4.70,4.70,3.20]}[b.caseType]||[4.15,4.35,2.87];
    const [D,H,W]=dims,g=new THREE.Group();g.userData.part='case';addFrame(g,D,H,W,b.theme||0x67dcff);addFrontFrame(g,D,H,W);

    if(b.caseType==='north'){
      for(let i=0;i<12;i++){const sl=rb(.075,H-.55,.09,.018,0x775236,.16,.62);sl.position.set(D/2-.035,0,-W/2+.18+i*(W-.36)/11);g.add(sl)}
      for(const y of [.68,-.67]){const f=createFan(.53,.11,0xc99b67,false);f.rotation.y=-Math.PI/2;f.position.set(D/2-.24,y,0);g.add(f)}
      addGlassPanel(g,D,H,W,false)
    }else if(b.caseType==='h6'){
      for(let i=0;i<3;i++){const f=createFan(.49,.11,0x67dcff,true);f.rotation.y=-Math.PI/2;f.rotation.z=-.08;f.position.set(D/2-.24,1.18-i*1.16,-.10);g.add(f)}
      addGlassPanel(g,D,H,W,false)
    }else{
      const accent=b.caseType==='y70'?0xff4bd8:0xf29b38;
      for(let i=0;i<3;i++){const f=createFan(.49,.11,accent,true);f.position.set(1.48,1.18-i*1.17,-W/2+.23);g.add(f)}
      for(let i=0;i<3;i++){const f=createFan(.44,.10,0x67dcff,true);f.rotation.x=Math.PI/2;f.position.set(-.20,-H/2+.24,-.72+i*.72);g.add(f)}
      addGlassPanel(g,D,H,W,true)
    }

    const rearFan=createFan(.43,.10,b.theme||0x67dcff,b.caseType!=='north');rearFan.rotation.y=Math.PI/2;rearFan.position.set(-D/2+.18,H*.22,0);g.add(rearFan);
    for(let i=0;i<18;i++){const sl=box(.035,.018,W-.46,m(0x080a0d,.36,.68));sl.position.set(-D/2+.36+i*(D-.72)/17,H/2+.012,0);g.add(sl)}
    for(let i=0;i<7;i++){const slot=box(.025,.075,.72,m(0x0a0c0e,.45,.62));slot.position.set(-D/2-.008,-.48-i*.105,0);g.add(slot)}
    const io=box(.03,.72,.64,m(0x252b31,.88,.22));io.position.set(-D/2-.012,.86,0);g.add(io);
    for(const x of [-D/2+.13,D/2-.13])for(const y of [-H/2+.13,H/2-.13])g.add(screw(x,y,W/2+.025));
    glassMesh=referenceGlass[0]||null;return g
  }
  createCaseForBuild=createReferenceCase;

  createMotherboard=function(b){
    const g=new THREE.Group(),mw=2.44,mh=b.moboFormat==='mATX'?2.44:3.05;
    const pcb=rb(mw,mh,.055,.025,C.pcb,.22,.66);g.add(pcb);
    for(let i=0;i<20;i++){const tr=box(.012,.30+(i%5)*.15,.014,m(i%4===0?0xb18d47:0x3a4741,.42,.52));tr.position.set(-mw*.43+(i%10)*mw*.095,-mh*.28+Math.floor(i/10)*.72,.04);tr.rotation.z=(i%2?.25:-.18);g.add(tr)}
    const io=rb(.46,1.05,.23,.05,0x3a4148,.94,.16);io.position.set(-mw*.38,mh*.30,.15);g.add(io);
    const ioLabel=textPlane(b.mobo.split(' ').slice(0,3).join(' '),b.moboFormat,.38,.16);ioLabel.position.set(0,0,.125);io.add(ioLabel);
    const vrmTop=rb(1.10,.34,.20,.045,0x3e464e,.94,.15);vrmTop.position.set(.08,mh*.39,.14);g.add(vrmTop);
    const vrmSide=rb(.34,1.03,.20,.045,0x343c43,.94,.15);vrmSide.position.set(-mw*.27,mh*.21,.14);g.add(vrmSide);
    const socket=rb(.52,.52,.07,.035,0xbfc4c8,.96,.12);socket.position.set(-.08,mh*.16,.11);g.add(socket);
    const socketInset=rb(.39,.39,.05,.022,0x777f86,.88,.18);socketInset.position.set(-.08,mh*.16,.17);g.add(socketInset);
    for(let i=0;i<4;i++){const slot=rb(.075,1.22,.055,.015,0x171b20,.52,.52);slot.position.set(.48+i*.12,mh*.12,.08);g.add(slot)}
    const pcie=rb(mw*.72,.075,.075,.018,0xd7dade,.70,.28);pcie.position.set(.03,-mh*.18,.09);g.add(pcie);
    for(let i=1;i<3;i++){const s=rb(mw*.66,.065,.06,.015,0x232a31,.66,.34);s.position.set(.02,-mh*.18-i*.42,.08);g.add(s)}
    const m2a=rb(1.32,.24,.13,.03,0x454d55,.94,.15);m2a.position.set(.06,-mh*.02,.13);g.add(m2a);
    const chip=rb(.56,.56,.15,.045,0x30373e,.92,.17);chip.position.set(mw*.29,-mh*.34,.14);g.add(chip);
    for(let i=0;i<12;i++){const cap=cyl(.035,.09,m(0xa0a8af,.84,.22),18);cap.rotation.x=Math.PI/2;cap.position.set(-.72+(i%6)*.15,-.04-Math.floor(i/6)*.18,.12);g.add(cap)}
    return g
  };

  createGPU=function(b){
    const g=new THREE.Group(),dims=b.gpuDims||[300,125,50],L=dims[0]*SCALE,H=dims[1]*SCALE,T=Math.max(.42,dims[2]*SCALE),theme=b.theme||0x67dcff;
    const core=rb(L,H,T,.08,b.key==='dream'?0x30363b:0x171b20,.88,.18);g.add(core);
    for(let i=0;i<26;i++){const fin=box(.035,H*.84,T*.72,m(0x737b82,.88,.18));fin.position.set(-L*.43+i*(L*.86/25),0,-.03);g.add(fin)}
    const frontZ=T/2+.028,fanCount=b.gpuFans||2;
    for(let i=0;i<fanCount;i++){
      const x=fanCount===3?(-L*.31+i*L*.31):(-L*.24+i*L*.48);
      const f=createFan(H*(fanCount===3?.28:.32),.065,theme,!!b.gpuRgb);f.scale.z=.60;f.position.set(x,0,frontZ);g.add(f)
    }
    const upper=rb(L*.86,.07,.055,.016,0x434a51,.90,.15);upper.position.set(0,H*.42,frontZ+.045);g.add(upper);
    const lower=upper.clone();lower.position.y=-H*.42;g.add(lower);
    if(b.key==='dream'){
      for(const a of [-.52,.52]){const bar=box(L*.63,.055,.045,m(0x9ba2a9,.95,.12));bar.rotation.z=a;bar.position.z=frontZ+.055;g.add(bar)}
    }else if(b.gpuRgb){
      const glow=rb(L*.75,.035,.035,.012,0x20252b,.28,.20);glow.position.set(0,H*.46,frontZ+.07);glow.material.emissive=new THREE.Color(theme);glow.material.emissiveIntensity=1.5;rgbMaterials.push(glow.material);g.add(glow)
    }
    const back=rb(L*.94,H*.88,.025,.045,0x252b31,.92,.16);back.position.z=-T/2-.018;g.add(back);
    const bracket=box(.10,H*.95,T*.78,m(0xaeb5bb,.95,.15));bracket.position.x=-L/2-.05;g.add(bracket);
    const pcie=box(L*.42,.07,.025,m(C.gold,.90,.18));pcie.position.set(-L*.08,-H/2-.045,-T*.12);g.add(pcie);
    const side=rb(L*.74,.18,.045,.025,0x101419,.74,.26);side.position.set(.05,-H*.49,.02);g.add(side);
    const label=textPlane(b.gpu.replace('SAPPHIRE ','').replace('Radeon ','').slice(0,28),'GRAPHICS',Math.min(1.95,L*.64),.18);label.rotation.x=Math.PI/2;label.position.set(.03,-H*.51,.20);g.add(label);
    return g
  };

  createAirCooler=function(){
    const g=new THREE.Group(),fin=m(0xb9c0c5,.96,.15),copper=m(C.copper,.92,.16);
    for(const x of [-.34,.34]){
      const tower=new THREE.Group();
      for(let i=0;i<22;i++){const f=box(.58,.018,1.10,fin);f.position.y=-.56+i*.052;tower.add(f)}
      const cap=rb(.60,.055,1.12,.02,0xc7cccf,.96,.12);cap.position.y=.60;tower.add(cap);tower.position.x=x;g.add(tower)
    }
    for(let i=0;i<6;i++){const pipe=new THREE.Mesh(new THREE.TorusGeometry(.26+i*.014,.018,12,36,Math.PI),copper);pipe.rotation.y=Math.PI/2;pipe.position.set(-.10+i*.04,-.58,-.16+i*.055);g.add(pipe)}
    const center=createFan(.48,.10,0x67dcff,false);center.rotation.y=Math.PI/2;center.position.set(0,0,.02);g.add(center);
    const front=createFan(.46,.10,0x67dcff,false);front.rotation.y=Math.PI/2;front.position.set(.70,0,.02);g.add(front);
    return g
  };

  function createRefRadiator(accent){
    const g=new THREE.Group(),fin=m(0x394047,.82,.27);
    for(const y of [-.56,.56]){const r=rb(3.62,.11,.18,.025,0x11151a,.74,.34);r.position.set(0,y,-.05);g.add(r)}
    for(let i=0;i<38;i++){const rib=box(.028,1.02,.14,fin);rib.position.set(-1.72+i*.093,0,-.05);g.add(rib)}
    for(let i=0;i<3;i++){const f=createFan(.48,.095,accent,true);f.rotation.x=Math.PI/2;f.position.set(-1.22+i*1.22,-.04,.055);g.add(f)}return g
  }
  createStudioCooler=function(b,h){
    if(b.cooling!=='aio')return createAirCooler();
    const accent=b.key==='performance'?0xf5a33c:(b.theme||0x67dcff),g=createRefRadiator(accent);
    const pump=cyl(.36,.22,m(0x151a20,.78,.18,accent,.52),64);pump.rotation.x=Math.PI/2;
    pump.position.set(h.cpu[0]-h.cooler[0],h.cpu[1]-h.cooler[1]+.04,h.cpu[2]-h.cooler[2]+.29);g.add(pump);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.27,.025,12,64),m(0x242a31,.35,.18,accent,1.55));ring.position.copy(pump.position);ring.position.z+=.12;g.add(ring);
    const p1=[new THREE.Vector3(pump.position.x+.08,pump.position.y,pump.position.z-.02),new THREE.Vector3(.20,-.50,.30),new THREE.Vector3(1.02,-.18,.02)];
    const p2=[new THREE.Vector3(pump.position.x-.08,pump.position.y,pump.position.z-.02),new THREE.Vector3(-.02,-.43,.25),new THREE.Vector3(.74,-.18,.02)];
    g.add(createCable(p1,0x090b0e,.046));g.add(createCable(p2,0x111419,.046));return g
  };

  const initBase=initThree;
  initThree=function(){
    const was=threeReady;initBase();if(was||!threeReady||referenceSceneReady)return;referenceSceneReady=true;
    threeRenderer.toneMappingExposure=1.04;threeCamera.fov=30;threeCamera.updateProjectionMatrix();
    if(threeScene){
      referenceGrid=new THREE.GridHelper(22,44,0x315446,0x18221f);referenceGrid.position.y=-2.365;referenceGrid.material.transparent=true;referenceGrid.material.opacity=.32;threeScene.add(referenceGrid);
      const key=new THREE.SpotLight(0xf4f7ff,2.5,25,Math.PI/5,.55,1.15);key.position.set(4.8,8.5,6.5);key.target.position.set(0,0,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);threeScene.add(key,key.target);
      const green=new THREE.PointLight(0x39ffb0,.75,10);green.position.set(-2.5,.2,3.4);threeScene.add(green);
      const warm=new THREE.PointLight(0xffa34d,.48,9);warm.position.set(3.5,1.4,-3.5);threeScene.add(warm);
      const back=new THREE.PointLight(0x5f8dff,.55,10);back.position.set(-3.8,2.7,-4);threeScene.add(back)
    }
  };

  const buildBase=buildThreePC;
  buildThreePC=function(b){buildBase(b);if(referenceGrid)referenceGrid.visible=true};
  buildModularPC=buildThreePC;

  const setViewBase=setView;
  setView=function(v){
    setViewBase(v);
    referenceGlass.forEach(gl=>{if(!gl||!gl.material)return;gl.visible=v!=='xray';gl.material.opacity=v==='mounted'?.075:v==='internal'?.018:v==='exploded'?.03:0});
    if(v==='mounted'){orbit.yaw=.66;orbit.pitch=.24;orbit.dist=currentBuild&&currentBuild.caseType==='y70'?9.1:8.35;orbit.target.set(0,-.02,0);updateCamera()}
  };

  const resetBase=resetCamera3D;
  resetCamera3D=function(){resetBase();if(currentView==='mounted'){orbit.yaw=.66;orbit.pitch=.24;orbit.dist=currentBuild&&currentBuild.caseType==='y70'?9.1:8.35;orbit.target.set(0,-.02,0);updateCamera()}};

  const detailBase=renderDetail;
  renderDetail=function(){detailBase();const d=q('#detail');if(!d)return;const badge=document.createElement('div');badge.className='ref-realism-badge';badge.textContent='V16 · Reference-grade 3D';const anchor=d.querySelector('.desc');if(anchor)d.insertBefore(badge,anchor);else d.prepend(badge)};

  injectReferenceCss();
})();