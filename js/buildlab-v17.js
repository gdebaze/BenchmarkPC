/* Readout V17 — rebuilt mechanical enclosure and detailed hardware.
   Keeps the modular rig, exploded-view controls and all four distinct configurations.
   All product shapes are illustrative meshes, not manufacturer CAD models. */
(()=>{
  'use strict';
  if(typeof THREE==='undefined'||typeof buildThreePC!=='function')return;
  const steel=0x15191f, trim=0x39434e, nickel=0xadb7c0, dark=0x080a0d;
  let glassPanels=[],rearCables=null;
  const material=(color,metal=.55,rough=.35)=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});
  const plate=(w,h,d,r,color=steel,metal=.7,rough=.3)=>roundedPanel(w,h,d,r,material(color,metal,rough));
  const block=(w,h,d,color=steel,metal=.65,rough=.36)=>box(w,h,d,material(color,metal,rough));
  const pin=(r=.035,h=.025,color=nickel)=>{
    const v=cyl(r,h,material(color,.88,.16),18);v.rotation.x=Math.PI/2;return v
  };
  function add(g,o,x=0,y=0,z=0){o.position.set(x,y,z);g.add(o);return o}
  function nameplate(name,sub,width=1.25,height=.20){
    const c=document.createElement('canvas');c.width=1024;c.height=160;const x=c.getContext('2d');
    x.fillStyle='#0d1218';x.fillRect(0,0,1024,160);x.strokeStyle='#566475';x.lineWidth=5;x.strokeRect(4,4,1016,152);
    x.fillStyle='#edf5fa';x.font='bold 43px Arial';x.fillText(String(name).slice(0,33),30,73);
    x.fillStyle='#aabac6';x.font='30px Arial';x.fillText(String(sub||'').slice(0,48),30,124);
    const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;
    return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,toneMapped:false}))
  }
  function screws(g,positions,z,color=nickel){
    positions.forEach(([x,y])=>{const s=pin(.035,.025,color);add(g,s,x,y,z)})
  }
  function tube(points,r=.023,color=0x1b2027){
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),35,r,8,false),material(color,.35,.48))
  }

  // Each fan has a framed housing, nine swept blades, a central hub and a separate RGB ring.
  createFan=function(r=.46,depth=.10,accent=0x67dcff,rgb=true){
    const g=new THREE.Group(),housing=plate(r*2.14,r*2.14,depth,.12,0x191e25,.58,.38);
    g.add(housing);
    const throat=new THREE.Mesh(new THREE.CircleGeometry(r*.84,48),new THREE.MeshBasicMaterial({color:0x090c10,side:THREE.DoubleSide}));
    throat.position.z=depth*.55+.008;g.add(throat);
    const ringMat=rgb?mat(0x20262c,.55,.28,accent,1.05):material(0x4a555e,.74,.26);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r*.79,r*.045,10,56),ringMat);
    ring.position.z=depth*.55+.028;g.add(ring);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(r*.68,r*.009,8,48),material(0x6b747d,.88,.20));
    inner.position.z=depth*.55+.037;g.add(inner);
    const rotor=new THREE.Group();
    const bladeMat=material(rgb?0xb0bbc4:0x444d56,.55,.29);
    for(let i=0;i<9;i++){
      const s=new THREE.Shape();
      s.moveTo(r*.09,r*.03);
      s.bezierCurveTo(r*.27,-r*.15,r*.62,-r*.16,r*.70,-r*.03);
      s.bezierCurveTo(r*.66,r*.15,r*.29,r*.29,r*.12,r*.14);
      s.closePath();
      const blade=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:false}),bladeMat);
      blade.rotation.z=i*Math.PI*2/9;blade.position.z=depth*.56;rotor.add(blade)
    }
    const hub=pin(r*.17,.065,rgb?0x343b43:0x22272d);hub.position.z=depth*.61;rotor.add(hub);
    rotor.position.z=.016;g.add(rotor);threeFans.push(rotor);
    for(const sx of [-1,1])for(const sy of [-1,1]){
      const rubber=pin(.080,.032,0x111419);add(g,rubber,sx*r*.87,sy*r*.87,depth*.60);
      const screw=pin(.030,.035);add(g,screw,sx*r*.87,sy*r*.87,depth*.625)
    }
    return g
  };

  function rearPlate(g,D,H,W,b){
    const x=-D/2,edge=material(0x47515c,.92,.20),back=material(0x1b2027,.88,.25),black=material(0x070a0e,.27,.65);
    // Segmented rear panel with real visual openings instead of one solid blank wall.
    add(g,block(.105,.20,W,0x242b32,.84,.21),x+.055,H/2-.11);
    add(g,block(.105,.20,W,0x242b32,.84,.21),x+.055,-H/2+.11);
    for(const z of [-W/2+.075,W/2-.075])add(g,block(.105,H-.3,.145,0x323b45,.9,.20),x+.055,0,z);
    add(g,block(.11,H*.28,W*.20,0x222a32,.84,.28),x+.05,-H*.30,-W*.36);
    const fanR=.46,fanY=H*.245,fanZ=W*.19;
    const fan=createFan(fanR,.12,b.theme||0x67dcff,b.caseType!=='north');
    fan.rotation.y=-Math.PI/2;add(g,fan,x+.16,fanY,fanZ);
    const guard=new THREE.Mesh(new THREE.TorusGeometry(fanR*.97,.032,9,52),edge);
    guard.rotation.y=Math.PI/2;add(g,guard,x-.04,fanY,fanZ);
    for(let i=-3;i<=3;i++){
      const h=block(.023,.026,fanR*1.78,0x6d7781,.88,.23);
      add(g,h,x-.055,fanY+i*.112,fanZ)
    }
    // Motherboard I/O shield: USB, Ethernet, audio and display connectors.
    const io=block(.060,1.20,.60,0x9ca6af,.89,.21);
    add(g,io,x-.018,H*.15,-W*.285);
    add(g,block(.024,1.08,.49,0x20272e,.75,.30),x-.055,H*.15,-W*.285);
    for(let i=0;i<6;i++){
      const port=block(.018,.105,.145,i<4?0x070b10:0x0a1829,.38,.52);
      add(g,port,x-.073,H*.50-i*.14,-W*.395+(i%2)*.21)
    }
    for(let i=0;i<3;i++){
      const audio=pin(.033,.022,[0xa8ef9a,0xefb1ad,0xadd7f9][i]);
      audio.rotation.z=Math.PI/2;audio.rotation.x=0;
      add(g,audio,x-.077,-H*.047,-W*.37+i*.145)
    }
    // Seven independently stamped PCIe slot covers and retaining rail.
    const pciZ=W*.17;
    add(g,block(.060,.93,1.05,0x242b33,.81,.27),x+.02,-H*.205,pciZ);
    for(let i=0;i<7;i++){
      const cover=plate(.78,.079,.026,.012,i===0?0x8a949d:0x555f69,.93,.16);
      cover.rotation.y=Math.PI/2;add(g,cover,x-.055,-H*.115-i*.113,pciZ);
      const s=pin(.021,.025);s.rotation.y=Math.PI/2;add(g,s,x-.071,-H*.115-i*.113,pciZ-.43)
    }
    add(g,block(.050,1.05,.10,0xadb6bf,.94,.16),x-.075,-H*.19,pciZ-.51);
    // PSU cut-out is deliberately separate and situated below PCIe.
    const psuY=-H/2+.49,psuZ=-W*.19;
    add(g,block(.065,.72,.98,0x252b32,.84,.25),x-.01,psuY,psuZ);
    const grille=new THREE.Mesh(new THREE.TorusGeometry(.31,.030,8,48),edge);
    grille.rotation.y=Math.PI/2;add(g,grille,x-.065,psuY,psuZ+.06);
    for(let i=-2;i<=2;i++)add(g,block(.019,.026,.56,0x939da6,.9,.19),x-.075,psuY+i*.11,psuZ+.06);
    add(g,block(.019,.12,.22,0x06090d,.34,.64),x-.085,psuY+.24,psuZ-.35);
    add(g,block(.025,.09,.17,0x06090d,.34,.64),x-.087,psuY-.20,psuZ-.35);
    for(const y of [H/2-.19,-H/2+.19])for(const z of [-W/2+.19,W/2-.19]){
      const s=pin(.047,.028);s.rotation.y=Math.PI/2;add(g,s,x-.076,y,z)
    }
  }

  function sideBackplate(g,D,H,W,b){
    // Full removable stamped steel cable-management panel on the opposite side of the glass.
    const z=-W/2+.065,white=selStyle===2;
    const panel=plate(D-.23,H-.25,.070,.055,white?0xc8cdd1:0x252b32,.84,.23);
    add(g,panel,0,0,z);
    for(const x of [-D*.36,D*.36]){
      const emboss=plate(.032,H*.70,.027,.01,white?0x9da7b0:0x39434b,.80,.30);
      add(g,emboss,x,.03,z-.061)
    }
    for(let y=-H*.26;y<=H*.25;y+=.11){
      add(g,block(.36,.035,.012,0x0b0e12,.32,.71),D*.29,y,z-.053)
    }
    const branding=nameplate(b.case.split(' ').slice(0,2).join(' '),'REAR ACCESS PANEL',1.16,.24);
    branding.rotation.y=Math.PI;add(g,branding,-D*.08,-H*.31,z-.060)
  }

  function topGrille(g,D,H,W){
    const y=H/2+.006;
    const cutout=block(D*.77,.016,W*.72,0x090d11,.34,.58);
    add(g,cutout,-.08,y);
    for(let i=0;i<35;i++){
      const slat=block(.020,.020,W*.69,0x49535c,.82,.26);
      add(g,slat,-D*.385+i*D*.77/34,y+.023)
    }
    const portRow=block(.37,.018,.10,0x090c10,.45,.51);
    add(g,portRow,D*.36,y+.018,W*.30);
    const power=new THREE.Mesh(new THREE.TorusGeometry(.08,.018,10,28),material(0xa8b4bc,.9,.17));
    power.rotation.x=Math.PI/2;add(g,power,D*.25,y+.025,W*.31)
  }

  function realCase(b){
    glassPanels=[];
    const specs={north:[4.47,4.69,2.15],h6:[4.15,4.35,2.87],o11:[4.78,4.71,2.90],y70:[4.70,4.70,3.20]};
    const [D,H,W]=specs[b.caseType]||specs.h6;
    const g=new THREE.Group(),white=selStyle===2,frame=white?0xbac3cc:0x22282f;
    g.userData.part='case';
    const base=block(D,.16,W,frame,.84,.27);add(g,base,0,-H/2+.08);
    const roof=block(D,.13,W,frame,.82,.29);add(g,roof,0,H/2-.065);
    for(const x of [-D/2+.08,D/2-.08]){
      for(const z of [-W/2+.08,W/2-.08])add(g,block(.15,H-.23,.15,frame,.91,.20),x,0,z)
    }
    for(const y of [-H/2+.085,H/2-.085]){
      add(g,block(D-.20,.15,.14,0x4b535e,.90,.19),0,y,W/2-.075)
    }
    add(g,block(D*.69,H*.75,.10,0x1f252c,.84,.30),-D*.06,.04,-W/2+.19);
    add(g,plate(D*.67,.63,W*.82,.045,white?0xa8b0ba:0x1c232b,.77,.30),-D*.045,-H/2+.48,-.04);
    for(const x of [-D*.33,D*.33])for(const z of [-W*.28,W*.28]){
      add(g,plate(.50,.16,.44,.045,dark,.56,.69),x,-H/2-.10,z)
    }
    sideBackplate(g,D,H,W,b);
    rearPlate(g,D,H,W,b);
    topGrille(g,D,H,W);
    // Chassis-specific front fascia and cooling layout.
    if(b.caseType==='north'){
      for(let i=0;i<12;i++)add(g,plate(.075,H-.42,.085,.018,0x835b3b,.22,.62),D/2+.015,0,-W*.41+i*W*.82/11);
      for(const y of [.69,-.62]){
        const fan=createFan(.51,.10,0xc99b67,false);
        fan.rotation.y=-Math.PI/2;add(g,fan,D/2-.24,y,0)
      }
    }else if(b.caseType==='h6'){
      for(let i=0;i<3;i++){
        const fan=createFan(.48,.11,0x67dcff,true);
        fan.rotation.y=-Math.PI*.42;add(g,fan,D/2-.27,1.16-i*1.15,-.13)
      }
      // Open intake behind the front fans, with narrow metal uprights instead of an opaque wall.
      for(let i=0;i<12;i++)add(g,block(.042,H-.31,.036,0x303c47,.80,.28),D/2-.045,0,-W*.43+i*W*.86/11)
    }else{
      const accent=b.caseType==='y70'?0xff4bd8:0xf5a344;
      for(let i=0;i<3;i++)add(g,createFan(.48,.10,accent,true),D/2-.38,1.16-i*1.14,-W/2+.26);
      for(let i=0;i<3;i++){
        const f=createFan(.45,.10,0x67dcff,true);f.rotation.x=Math.PI/2;
        add(g,f,-.22,-H/2+.25,-.67+i*.67)
      }
      if(b.caseType==='y70'){
        const corner=block(.19,H-.20,.21,0x555d68,.90,.17);
        corner.rotation.y=Math.PI*.22;add(g,corner,D/2-.17,0,W/2-.11)
      }
    }
    // Only translucent glass on the showcase-facing side: never an opaque plate over components.
    const glassMaterial=new THREE.MeshPhysicalMaterial({
      color:0xa5c9de,transparent:true,opacity:.073,roughness:.035,metalness:0,
      transmission:.48,thickness:.015,side:THREE.DoubleSide,depthWrite:false
    });
    const side=new THREE.Mesh(new THREE.PlaneGeometry(D-.30,H-.30),glassMaterial);
    add(g,side,0,0,W/2+.006);side.renderOrder=6;glassPanels.push(side);
    if(b.caseType==='o11'||b.caseType==='y70'){
      const front=new THREE.Mesh(new THREE.PlaneGeometry(W-.26,H-.30),glassMaterial.clone());
      front.rotation.y=Math.PI/2;add(g,front,D/2+.02,0,0);front.renderOrder=6;glassPanels.push(front)
    }
    for(const x of [-D/2+.14,D/2-.14])for(const y of [-H/2+.14,H/2-.14]){
      add(g,pin(.038,.026),x,y,W/2+.038)
    }
    glassMesh=side;return g
  }
  createCaseForBuild=realCase;

  // GPU: visible vented aluminium backplate, screws, edge connectors and copper heatpipes.
  const gpuBase=createGPU;
  createGPU=function(b){
    const g=gpuBase(b),dims=b.gpuDims||[300,125,50],L=dims[0]*SCALE,H=dims[1]*SCALE,T=Math.max(.42,dims[2]*SCALE);
    const z=-T/2-.067,white=selStyle===2,metal=white?0x9ba7af:0x444c54;
    const back=plate(L*.95,H*.90,.048,.052,metal,.88,.20);
    add(g,back,0,0,z);
    add(g,plate(L*.88,.052,.011,.010,0x9ca5ac,.90,.16),0,H*.36,z-.036);
    add(g,plate(L*.87,.037,.011,.010,0x171d22,.70,.33),0,-H*.36,z-.038);
    for(let i=0;i<11;i++){
      const slit=block(.031,H*.33,.014,0x0b1014,.34,.70);
      slit.rotation.z=-.25;add(g,slit,L*.24+i*.058,-H*.035,z-.038)
    }
    screws(g,[[-L*.41,-H*.35],[-L*.41,H*.35],[L*.41,-H*.35],[L*.41,H*.35]],z-.040);
    const label=nameplate(b.gpu.replace('SAPPHIRE ','').slice(0,29),'METAL BACKPLATE',Math.min(1.90,L*.70),.25);
    label.rotation.y=Math.PI;add(g,label,-L*.075,H*.08,z-.045);
    // Heatpipes and a side exhaust strip give thickness even when rotated.
    for(let i=0;i<4;i++){
      const xs=-L*.34+i*L*.21;
      const pipe=tube([new THREE.Vector3(xs,-H*.40,-T*.13),new THREE.Vector3(xs+.03,-H*.47,0),new THREE.Vector3(xs+.20,-H*.40,T*.12)],.025,0x9f6c42);
      g.add(pipe)
    }
    for(let i=0;i<4;i++){
      const port=block(.025,.068,.105,0x090b0e,.25,.69);
      add(g,port,-L/2-.108,-H*.27+i*.17,T*.13)
    }
    return g
  };

  // Motherboard rear reinforcement and a much denser frontside.
  const motherboardBase=createMotherboard;
  createMotherboard=function(b){
    const g=motherboardBase(b),mw=2.44,mh=b.moboFormat==='mATX'?2.44:3.05;
    const back=plate(mw*.96,mh*.96,.040,.020,0x3f464c,.86,.27);
    add(g,back,0,0,-.075);
    for(let i=0;i<12;i++){
      const stamped=block(.025,.30,.012,0x5d686f,.86,.20);
      add(g,stamped,-mw*.40+i*mw*.073,-mh*.20+Math.sin(i*.45)*.35,-.104)
    }
    screws(g,[[-mw*.41,mh*.40],[mw*.41,mh*.40],[-mw*.41,-mh*.40],[mw*.41,-mh*.40]],-.101);
    for(let i=0;i<11;i++){
      const fin=block(.027,.37,.23,0x727a82,.92,.18);
      add(g,fin,-.40+i*.082,mh*.39,.26)
    }
    for(let i=0;i<7;i++){
      const fin=block(.22,.027,.22,0x737d86,.90,.17);
      add(g,fin,-mw*.32,mh*.02+i*.095,.26)
    }
    for(let i=0;i<18;i++){
      const cap=cyl(.028,.075,material(i%3?0xa2aab3:0xd4bd83,.82,.24),12);
      cap.rotation.x=Math.PI/2;add(g,cap,-mw*.38+(i%6)*.128,-.16-Math.floor(i/6)*.15,.18)
    }
    for(let i=0;i<8;i++){
      const connector=block(.085,.13,.075,0x11161b,.35,.60);
      add(g,connector,mw*.43,-mh*.22+i*.105,.11)
    }
    return g
  };

  const ramBase=createRAMForBuild;
  createRAMForBuild=function(b){
    const g=ramBase(b);
    for(let i=0;i<2;i++){
      const x=i*.15,plateFace=plate(.09,1.07,.035,.018,b.ramRgb?0x505b68:0x303942,.80,.23);
      add(g,plateFace,x,.01,.153);
      const comb=plate(.070,.95,.026,.013,b.ramRgb?0xced7e0:0x202b33,.68,.26);
      add(g,comb,x,.01,.177);
      for(let j=0;j<8;j++)add(g,block(.012,.044,.012,0xc9a95a,.84,.23),x,-.57+j*.12,-.015)
    }
    return g
  };

  const psuBase=createPSU;
  createPSU=function(b){
    const g=psuBase(b);
    const label=nameplate(b.psu.split('·')[0].trim(),b.psu.split('·')[1]||'ATX PSU',1.10,.23);
    add(g,label,.08,-.13,.778);
    for(let i=0;i<7;i++){
      const vent=block(.028,.037,.40,0x69747e,.88,.20);
      add(g,vent,-.61+i*.16,.445,0)
    }
    const switcher=block(.035,.13,.18,0x090d11,.32,.64);
    add(g,switcher,.68,.16,.785);return g
  };

  // More radiator fins and mounting screws, with braided AIO hoses still attached to the pump.
  const coolingBase=createStudioCooler;
  createStudioCooler=function(b,h){
    const g=coolingBase(b,h);
    if(b.cooling==='aio'){
      for(let i=0;i<32;i++)add(g,block(.014,.89,.027,0x707980,.76,.28),-1.65+i*.107,-.03,-.149);
      for(const x of [-1.62,-.55,.55,1.62])for(const y of [-.51,.51])add(g,pin(.028,.025),x,y,.14);
      const label=nameplate(b.cooler.split(' ').slice(0,2).join(' '),'360 MM RADIATOR',1.08,.17);
      label.rotation.x=Math.PI/2;add(g,label,0,.63,-.02)
    }
    return g
  };

  const buildBase=buildThreePC;
  buildThreePC=function(b){
    buildBase(b);
    // Disappear together with the installed components as soon as the exploded animation begins.
    const mounted=new THREE.Group();mounted.userData.mountedOnly=true;
    const h=homeLayout(b);
    const d=new THREE.Vector3(...h.mobo),caseDepth=b.caseType==='north'?1.075:b.caseType==='y70'?1.60:b.caseType==='o11'?1.45:1.435;
    const z=-caseDepth+.18;
    mounted.add(tube([new THREE.Vector3(d.x+.93,d.y+.98,z+.12),new THREE.Vector3(1.22,1.02,z+.06),new THREE.Vector3(1.56,1.64,z+.02)],.035,0x171d23));
    mounted.add(tube([new THREE.Vector3(d.x+.83,d.y+.85,z+.10),new THREE.Vector3(1.08,.65,z+.04),new THREE.Vector3(1.42,.42,z+.04)],.027,0x333941));
    mounted.add(tube([new THREE.Vector3(.50,-.66,.12),new THREE.Vector3(.91,-.76,-.15),new THREE.Vector3(1.25,-.33,z+.20)],.052,0x0a0f14));
    mounted.add(tube([new THREE.Vector3(.54,-.70,.13),new THREE.Vector3(.91,-.83,-.18),new THREE.Vector3(1.30,-.38,z+.15)],.027,0x414b54));
    for(let i=0;i<4;i++)add(mounted,block(.042,.07,.11,0x333e47,.78,.29),1.12,.52-i*.31,z+.10);
    threeRoot.add(mounted);rearCables=mounted;
    const note=q('#photo3d-note');
    if(note)note.innerHTML='<b>BUILD LAB V17 · DÉTAIL MÉCANIQUE</b><br>Plaques arrière du boîtier et du GPU, connectique réelle simulée, châssis fermé et pièces inspectables en 360°.'
  };

  const viewBase=setView;
  setView=function(v){
    viewBase(v);
    glassPanels.forEach(g=>{
      g.visible=v!=='xray';
      g.material.opacity=v==='mounted'?.073:v==='internal'?.012:v==='exploded'?.025:0
    });
    if(rearCables)rearCables.visible=v!=='exploded'
  };

  const detailBase=renderDetail;
  renderDetail=function(){
    detailBase();
    const d=q('#detail');if(!d)return;
    const badge=d.querySelector('.ref-realism-badge');
    if(badge)badge.textContent='V17 · CHÂSSIS & BACKPLATES DÉTAILLÉS';
    const method=d.querySelector('.method');
    if(method)method.innerHTML='<b>BuildLab V17.</b> Le boîtier possède un panneau arrière mécanique, une plaque latérale amovible, une zone I/O, sept équerres PCIe et une ouverture alimentation. Les GPU ont une backplate métallique vissée et ventilée. Les maillages illustrent les modèles du catalogue : ce ne sont pas les fichiers CAO officiels des fabricants.'
  };
})();
