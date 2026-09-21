/* Readout V15 — real product photo skins for the modular Three.js build lab. */
(()=>{
  'use strict';

  if(typeof THREE==='undefined'||typeof buildThreePC!=='function') return;

  const V15_REAL_ASSETS={
    smart:{
      gpu:'assets/images/gpu-sapphire9060xt8.webp',
      mobo:'assets/images/component-amdboard.webp',
      ram:'assets/images/component-ram5.webp',
      ssd:'assets/images/component-ssd.png',
      cooler:'assets/images/component-air.webp',
      psu:'assets/images/component-psu1200.webp'
    },
    balanced:{
      gpu:'assets/images/gpu-asrock9070.webp',
      mobo:'assets/images/component-amdboard.webp',
      ram:'assets/images/component-ram5rgb.webp',
      ssd:'assets/images/component-ssd.png',
      cooler:'assets/images/component-aio.webp',
      psu:'assets/images/component-psu1200.webp'
    },
    performance:{
      gpu:'assets/images/gpu-xfx9070xt.webp',
      mobo:'assets/images/component-amdboard.webp',
      ram:'assets/images/component-ram5rgb.webp',
      ssd:'assets/images/component-ssd.png',
      cooler:'assets/images/component-aio.webp',
      psu:'assets/images/component-psu1200.webp'
    },
    dream:{
      gpu:'assets/images/gpu-rtx5080.jpg',
      mobo:'assets/images/component-amdboard.webp',
      ram:'assets/images/component-ram96rgb.webp',
      ssd:'assets/images/component-ssd.png',
      cooler:'assets/images/component-aio.webp',
      psu:'assets/images/component-psu1600.webp'
    }
  };

  const V15_TEXTURE_CACHE=new Map();
  const V15_PHOTO_SPECS={
    gpu:{w:2.55,h:1.02,z:.40,scaleByGpu:true},
    mobo:{w:2.18,h:2.68,z:.24},
    cpu:{w:.39,h:.39,z:.105},
    ram:{w:.40,h:1.08,z:.16},
    ssd:{w:.72,h:.19,z:.055},
    psu:{w:1.45,h:.69,z:.765},
    cooler:{w:2.90,h:.92,z:.62,cooler:true}
  };

  function v15InjectStyles(){
    if(document.getElementById('v15-realism-style')) return;
    const s=document.createElement('style');s.id='v15-realism-style';s.textContent=`
      .real-model-badge{display:inline-flex;align-items:center;gap:7px;margin:0 0 10px;padding:7px 10px;border:1px solid rgba(103,220,255,.32);border-radius:999px;background:rgba(103,220,255,.08);font:700 8px 'JetBrains Mono',monospace;letter-spacing:.12em;color:#bdf2ff;text-transform:uppercase}
      .real-model-badge:before{content:'';width:6px;height:6px;border-radius:50%;background:#67dcff;box-shadow:0 0 12px #67dcff}
      #part-detail .real-model-card{display:grid;grid-template-columns:78px 1fr;gap:10px;align-items:center;margin-top:10px;padding:9px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));overflow:hidden}
      #part-detail .real-model-card img{width:78px;height:64px;object-fit:contain;filter:drop-shadow(0 7px 10px rgba(0,0,0,.55));mix-blend-mode:screen}
      #part-detail .real-model-card span{display:block;font:600 8px 'JetBrains Mono',monospace;color:#8d9aa8;line-height:1.55;text-transform:uppercase;letter-spacing:.08em}
      #part-detail .real-model-card b{display:block;margin-bottom:4px;font-size:10px;color:#fff}
      .photo-skin-hint{margin:10px 0 0;color:#aab6c4;font:500 8px 'JetBrains Mono',monospace;line-height:1.65}
    `;document.head.appendChild(s)
  }

  function v15LoadCutoutTexture(src){
    if(V15_TEXTURE_CACHE.has(src)) return V15_TEXTURE_CACHE.get(src);
    const promise=new Promise((resolve,reject)=>{
      const img=new Image();img.decoding='async';img.crossOrigin='anonymous';
      img.onload=()=>{
        try{
          const maxSide=720,ratio=Math.min(1,maxSide/Math.max(img.naturalWidth||1,img.naturalHeight||1));
          const w=Math.max(2,Math.round(img.naturalWidth*ratio)),h=Math.max(2,Math.round(img.naturalHeight*ratio));
          const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);
          const px=x.getImageData(0,0,w,h),d=px.data;
          for(let i=0;i<d.length;i+=4){
            if(d[i+3]===0) continue;
            const r=d[i],g=d[i+1],b=d[i+2],mn=Math.min(r,g,b),mx=Math.max(r,g,b),neutral=mx-mn<18;
            if(neutral&&mn>246)d[i+3]=0;
            else if(neutral&&mn>224)d[i+3]=Math.min(d[i+3],Math.round((246-mn)/22*220));
          }
          x.putImageData(px,0,0);const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;tex.needsUpdate=true;resolve(tex)
        }catch(err){reject(err)}
      };
      img.onerror=reject;img.src=src
    }).catch(()=>null);
    V15_TEXTURE_CACHE.set(src,promise);return promise
  }

  function v15PhotoSize(id,b,spec){
    let w=spec.w,h=spec.h;
    if(id==='gpu'&&spec.scaleByGpu){const dims=b.gpuDims||[300,130,50];w=Math.max(1.65,Math.min(3.0,dims[0]*SCALE*.90));h=Math.max(.72,Math.min(1.18,dims[1]*SCALE*.82))}
    if(id==='cooler'&&b.cooling!=='aio'){w=1.22;h=1.08}
    return {w,h}
  }

  function v15AddPhotoSkin(id,part,src,b){
    const spec=V15_PHOTO_SPECS[id];if(!part||!src||!spec)return;
    v15LoadCutoutTexture(src).then(tex=>{
      if(!tex||threeParts[id]!==part)return;
      const size=v15PhotoSize(id,b,spec),geo=new THREE.PlaneGeometry(size.w,size.h);
      const back=new THREE.Mesh(geo.clone(),new THREE.MeshBasicMaterial({color:0x06090d,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide}));
      const matPhoto=new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.035,opacity:.96,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
      const photo=new THREE.Mesh(geo,matPhoto);photo.userData.realProductPhoto=true;photo.userData.part=id;photo.renderOrder=8;back.renderOrder=7;
      const z=spec.z||.10;back.position.z=z-.012;photo.position.z=z;
      if(id==='cooler'&&b.cooling==='aio'){photo.position.y=-.02;back.position.y=-.02}
      part.add(back);part.add(photo)
    })
  }

  function v15DecorateBuild(b){
    const map=V15_REAL_ASSETS[b.key]||V15_REAL_ASSETS.balanced;
    Object.entries(map).forEach(([id,src])=>v15AddPhotoSkin(id,threeParts[id],src,b));
  }

  function v15PartImage(id,b){
    const map=V15_REAL_ASSETS[b.key]||{};
    return map[id]||({case:b.caseImg,gpu:b.gpuImg,cpu:b.cpuImg,mobo:b.moboImg,ram:b.ramImg,ssd:b.ssdImg,cooler:b.coolerImg,psu:b.psuImg}[id]||'')
  }

  const v15BuildBase=buildThreePC;
  buildThreePC=function(b){v15BuildBase(b);v15DecorateBuild(b)};
  buildModularPC=buildThreePC;

  const v15RenderDetailBase=renderDetail;
  renderDetail=function(){
    v15RenderDetailBase();
    const detail=q('#detail');if(!detail||!currentBuild)return;
    const badge=document.createElement('div');badge.className='real-model-badge';badge.textContent='V15 · textures photo de composants réels';
    const anchor=detail.querySelector('.desc');if(anchor)detail.insertBefore(badge,anchor);else detail.prepend(badge);
    const method=detail.querySelector('.method');if(method)method.insertAdjacentHTML('beforebegin','<div class="photo-skin-hint">Les photos locales servent de peau visuelle sur les maillages 3D : la pièce reste rotative et dissociable, mais reprend l\'apparence d\'un vrai composant au lieu d\'un bloc générique.</div>')
  };

  function v15AppendPartCard(id){
    const el=q('#part-detail'),b=currentBuild;if(!el||!b)return;const src=v15PartImage(id,b);if(!src)return;
    el.querySelectorAll('.real-model-card').forEach(n=>n.remove());
    const names={case:b.case,gpu:b.gpu,cpu:b.cpu,mobo:b.mobo,ram:b.ram,ssd:b.ssd,cooler:b.cooler,psu:b.psu};
    const card=document.createElement('div');card.className='real-model-card';card.innerHTML=`<img src="${src}" alt="${names[id]||id}" onerror="this.closest('.real-model-card').remove()"><div><b>Référence visuelle réelle</b><span>${names[id]||id}<br>texture appliquée au composant 3D</span></div>`;el.appendChild(card)
  }

  const v15SelectPartBase=selectPart;
  selectPart=function(id){v15SelectPartBase(id);v15AppendPartCard(id)};
  if(typeof focusExplodedPart==='function'){const v15FocusBase=focusExplodedPart;focusExplodedPart=function(id){v15FocusBase(id);v15AppendPartCard(id)}}

  builds.forEach(b=>{
    const a=V15_REAL_ASSETS[b.key]||{};
    if(a.gpu)b.gpuImg=a.gpu;if(a.mobo)b.moboImg=a.mobo;if(a.ram)b.ramImg=a.ram;if(a.ssd)b.ssdImg=a.ssd;if(a.cooler)b.coolerImg=a.cooler;if(a.psu)b.psuImg=a.psu
  });

  v15InjectStyles();
})();
