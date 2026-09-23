// ===== V32 COMPATIBILITE STRICTE + COMPARATEUR AVANT / APRES =====
/* UI styles are in css/compatibility.css. */

let compatibleOnlyV32=(()=>{try{return localStorage.getItem('readoutCompatibleOnly')==='1'}catch(_){return true}})(),comparePicksV32=[];
function requiredPsuV32(b){const name=(b.gpuChip||b.originalParts?.gpu||b.gpu||'').toUpperCase();if(b.integrated)return 450;if(/5090/.test(name))return 1000;if(/5080|9070 XT/.test(name))return 850;if(/5070 TI/.test(name))return 800;if(/5070|9070/.test(name))return 750;if(/5060 TI|9060 XT|B580/.test(name))return 650;if(/7600/.test(name))return 550;return 500}
function compatibilityReportV32(b){
 const c=b.caseModel||{},cpu=String(b.originalParts?.cpu||b.cpu||''),board=String(b.mobo||''),ram=String(b.ram||'');
 const gpuLength=b.gpuDims?.[0]||0,psu=b.psuWatts||Number(String(b.originalParts?.psu||b.psu||'').match(/(\d+)\s*W/i)?.[1])||0,storage=b.storageCount||1;
 const intel=/intel|core\s+i[3579]/i.test(cpu),amd=/ryzen/i.test(cpu);
 const boardIntel=/LGA\s*1700|H610|B660|B760|Z690|Z790/i.test(board),boardAmd=/AM5|B650|B850|X670|X870/i.test(board);
 const checks=[],add=(id,label,status,detail)=>checks.push({id,label,status,detail});
 if((!intel&&!amd)||(!boardIntel&&!boardAmd))add('socket','CPU ↔ carte mère','warn','Référence ou socket non documenté.');
 else add('socket','CPU ↔ carte mère',(intel&&boardIntel||amd&&boardAmd)?'pass':'fail',(intel&&boardIntel||amd&&boardAmd)?'Plateforme cohérente selon les familles de produits.':'Plateforme CPU incompatible avec le socket détecté.');
 const ramType=/DDR4/i.test(ram)?'DDR4':/DDR5/i.test(ram)?'DDR5':null;
 const boardType=/DDR4/i.test(board)?'DDR4':/DDR5|AM5|B650|B850|X670|X870/i.test(board)?'DDR5':null;
 if(!ramType||!boardType)add('ram','RAM ↔ carte mère','warn','Génération de mémoire de la carte mère non déterminée.');
 else add('ram','RAM ↔ carte mère',ramType===boardType?'pass':'fail',ramType===boardType?ramType+' compatible au niveau du format ; kit précis non validé.':ramType+' incompatible avec '+boardType+'.');
 add('qvl','Kit RAM ↔ QVL','warn','Référence du kit, profil XMP/EXPO et version BIOS à vérifier chez le fabricant.');
 const space=c.gpuMax&&gpuLength?c.gpuMax-gpuLength:null;
 add('gpu','Longueur GPU ↔ boîtier',space===null?'warn':space>=0?'pass':'fail',space===null?'Dimensions du GPU ou marge du boîtier manquantes.':gpuLength+' mm pour '+c.gpuMax+' mm disponibles ; marge '+space+' mm. Épaisseur et câbles non validés.');
 const rad=b.cooling==='aio'?Number(String(b.cooler||'').match(/(240|280|360|420)\s*mm/i)?.[1])||360:0,maxRad=Math.max(c.topRad||0,c.frontRad||0);
 if(rad)add('cooler','Radiateur ↔ boîtier',!maxRad?'warn':maxRad>=rad?'pass':'fail',!maxRad?'Emplacement radiateur inconnu.':maxRad>=rad?'Format '+rad+' mm possible ; épaisseur et montage à confirmer.':'Radiateur '+rad+' mm hors capacité documentée.');
 else{
  const h=b.airTowers===2?155:148;
  add('cooler','Ventirad ↔ boîtier',!c.airMax?'warn':c.airMax>=h?'warn':'fail',!c.airMax?'Hauteur autorisée du boîtier inconnue.':c.airMax>=h?'Hauteur générique '+h+' mm ; mesurer le ventirad exact.':'Hauteur générique '+h+' mm au-delà du dégagement '+c.airMax+' mm.');
 }
 const required=requiredPsuV32(b);
 add('psu','Puissance alimentation',!psu?'warn':psu>=required?'pass':'fail',!psu?'Puissance de l’alimentation non déterminée.':psu+' W indiqués ; seuil indicatif '+required+' W.');
 add('connectors','Connecteurs GPU','warn','Connecteurs PCIe / 12V-2x6 et longueur des câbles à contrôler sur la référence exacte.');
 const m2=b.componentProducts?.mobo?.m2Slots;
 add('ssd','Emplacements M.2',!Number.isFinite(m2)?'warn':storage<=m2?'pass':'fail',Number.isFinite(m2)?storage+' SSD M.2 / '+m2+' emplacements documentés.':'Nombre de ports M.2 non documenté pour cette référence.');
 return {checks,fail:checks.filter(x=>x.status==='fail').length,warn:checks.filter(x=>x.status==='warn').length,pass:checks.filter(x=>x.status==='pass').length,get compatible(){return this.fail===0}};
}
function buildIdentityV32(b){return b.id||[b.cpu,b.gpu,b.ram,b.ssd,b.case,Math.round(b.base||0)].join('|')}
function ensureCompatibilityToolbarV32(){
 const configs=q('#configs');if(!configs)return;let bar=q('#compat-toolbar');if(!bar){bar=document.createElement('div');bar.id='compat-toolbar';bar.className='compat-toolbar';configs.before(bar)}const reports=builds.map(compatibilityReportV32),valid=reports.filter(x=>x.compatible).length;
 bar.innerHTML=`<div class="compat-toolbar-copy"><b>Précontrôle de compatibilité avant achat</b><span id="compat-count">${valid} configuration${valid>1?'s':''} compatible${valid>1?'s':''} sur cette page · vérification finale des références nécessaire.</span></div><label class="compat-switch"><input id="compat-only-v32" type="checkbox" ${compatibleOnlyV32?'checked':''}><i></i>Masquer les incompatibilités détectées</label>`;
 q('#compat-only-v32').onchange=e=>{compatibleOnlyV32=e.target.checked;try{localStorage.setItem('readoutCompatibleOnly',compatibleOnlyV32?'1':'0')}catch(_){}applyCompatibilityCardsV32()}
}
function applyCompatibilityCardsV32(){
 let visible=0;qa('#configs .config').forEach((card,i)=>{const b=builds[i];if(!b)return;const r=compatibilityReportV32(b),old=card.querySelector('.config-compat');if(old)old.remove();const badge=document.createElement('div');badge.className='config-compat '+(r.fail?'fail':r.warn?'warn':'');badge.innerHTML=`<span>${r.pass}/${r.checks.length} contrôles validés</span><b>${r.fail?'INCOMPATIBLE':r.warn?'PRÉCONTRÔLE OK · À CONFIRMER' :'PRÉCONTRÔLE OK'}</b>`;const specs=card.querySelector('.specs');(specs||card).insertAdjacentElement('afterend',badge);card.hidden=compatibleOnlyV32&&!r.compatible;if(!card.hidden)visible++});const count=q('#compat-count');if(count)count.textContent=`${visible} configuration${visible>1?'s':''} affichée${visible>1?'s':''} · contrôles CPU, RAM, GPU, refroidissement, alimentation et SSD.`
}
function ensureComparePanelV32(){let panel=q('#compare-panel-v32');if(!panel){panel=document.createElement('section');panel.id='compare-panel-v32';panel.className='compare-panel';q('#configs').after(panel)}return panel}
function compareCardV32(b,side,index){if(!b)return `<div class="compare-empty">Sélectionne un PC avec le bouton<br>« ${side==='AVANT'?'Comparer en avant':'Comparer en après'} »</div>`;return `<article class="compare-pc ${index?'after':''}" data-side="${side}"><button class="compare-remove" type="button" data-remove-compare="${index}" aria-label="Retirer cette configuration">×</button><h4>${escapeProduct(b.tier||b.case)}</h4><div class="compare-price">${Math.round(b.base||adjustedPrice(b)).toLocaleString('fr-FR')} €</div><small>${escapeProduct(b.case)}</small><small>${escapeProduct(b.gpu)}</small></article>`}
function metricV32(label,a,b,fmt=v=>v,better='high'){
 const max=Math.max(Math.abs(Number(a)||0),Math.abs(Number(b)||0),1),delta=Number(b)-Number(a),good=better==='low'?delta<0:delta>0,neutral=Math.abs(delta)<.5;return `<div class="compare-metric"><div class="left"><strong>${fmt(a)}</strong><div class="compare-bar"><i style="width:${Math.max(5,(Number(a)||0)/max*100)}%"></i></div></div><label>${label}${neutral?'':`<span class="compare-delta ${good?'':'down'}">${delta>0?'+':''}${fmt(delta)}</span>`}</label><div class="right"><strong>${fmt(b)}</strong><div class="compare-bar"><i style="width:${Math.max(5,(Number(b)||0)/max*100)}%"></i></div></div></div>`
}
function renderComparisonV32(){
 const panel=ensureComparePanelV32(),a=comparePicksV32[0],b=comparePicksV32[1];let body=`<div class="compare-slots">${compareCardV32(a,'AVANT',0)}<div class="compare-vs">VS</div>${compareCardV32(b,'APRÈS',1)}</div>`;
 if(a&&b){const pa=Math.round(a.base||adjustedPrice(a)),pb=Math.round(b.base||adjustedPrice(b)),fa=Math.round(baseFps(a)),fb=Math.round(baseFps(b)),ra=a.ramGB||Number(a.ram?.match(/\d+/)?.[0])||0,rb=b.ramGB||Number(b.ram?.match(/\d+/)?.[0])||0,sa=a.storageTB||(/500 Go/.test(a.ssd)?.5:Number(a.ssd?.match(/(\d+)\s*To/)?.[1])||0),sb=b.storageTB||(/500 Go/.test(b.ssd)?.5:Number(b.ssd?.match(/(\d+)\s*To/)?.[1])||0),gain=fb-fa,cost=pb-pa,value=gain>0&&cost>0?Math.round(cost/gain):null;
  body+=`<div class="compare-deltas">${metricV32('Prix',pa,pb,v=>`${v>0?Math.round(v):Math.round(v)} €`,'low')}${metricV32('FPS estimés',fa,fb,v=>`${Math.round(v)} FPS`)}${metricV32('Indice GPU',a.score||0,b.score||0,v=>Math.round(v))}${metricV32('Mémoire',ra,rb,v=>`${v} Go`)}${metricV32('Stockage',sa,sb,v=>`${String(v).replace('.',',')} To`)}</div><p class="compare-conclusion"><b>${gain>0?`La configuration « après » apporte environ ${gain} FPS supplémentaires selon la simulation.`:gain<0?`La configuration « avant » reste environ ${Math.abs(gain)} FPS de plus selon la simulation.`:'Les performances estimées sont proches.'}</b> ${cost===0?'Le prix estimé est identique.':`Écart de prix : ${cost>0?'+':''}${cost.toLocaleString('fr-FR')} €.`}${value?` Cela représente environ ${value} € par FPS supplémentaire.`:''}</p>`
 }
 panel.innerHTML=`<div class="compare-head"><div><div class="kicker">COMPARATEUR AVANT / APRÈS</div><h3>Deux PC, une différence claire</h3><p>Prix, performances et composants comparés avec les mêmes réglages.</p></div><button class="compare-reset" id="compare-reset-v32" type="button">Effacer</button></div>${body}`;
 q('#compare-reset-v32').onclick=()=>{comparePicksV32=[];renderComparisonV32();decorateCompareButtonsV32()};qa('[data-remove-compare]').forEach(btn=>btn.onclick=()=>{comparePicksV32.splice(Number(btn.dataset.removeCompare),1);renderComparisonV32();decorateCompareButtonsV32()})
}
function toggleCompareV32(b){const id=buildIdentityV32(b),at=comparePicksV32.findIndex(x=>buildIdentityV32(x)===id);if(at>=0)comparePicksV32.splice(at,1);else{if(comparePicksV32.length>=2)comparePicksV32.shift();comparePicksV32.push(b)}renderComparisonV32();decorateCompareButtonsV32();if(comparePicksV32.length===2)setTimeout(()=>q('#compare-panel-v32')?.scrollIntoView({behavior:'smooth',block:'center'}),80)}
function decorateCompareButtonsV32(){qa('#configs .config').forEach((card,i)=>{let wrap=card.querySelector('.config-actions-v32');if(!wrap){wrap=document.createElement('div');wrap.className='config-actions-v32';const open=card.querySelector(':scope>button');wrap.innerHTML='<button type="button" data-open-v32>Ouvrir BuildLab →</button><button type="button" data-compare-v32>+ Comparer</button>';if(open){open.hidden=true;wrap.querySelector('[data-open-v32]').onclick=e=>{e.stopPropagation();openLab(builds[i].key)}}card.appendChild(wrap)}const b=builds[i],btn=wrap.querySelector('[data-compare-v32]'),picked=comparePicksV32.some(x=>buildIdentityV32(x)===buildIdentityV32(b));btn.classList.toggle('picked',picked);btn.textContent=picked?'✓ Dans la comparaison':'+ Comparer';btn.onclick=e=>{e.stopPropagation();toggleCompareV32(b)}})}
function compatibilityMatrixV32(b){const r=compatibilityReportV32(b);return `<section class="compat-matrix"><div class="compat-matrix-head"><b>Compatibilité de cette configuration</b><span>${r.fail?'À CORRIGER':r.warn?'COMPATIBLE · VÉRIFICATION FINALE':'CONTRÔLES INDICATIFS VALIDÉS'}</span></div>${r.checks.map(x=>`<div class="compat-line ${x.status}"><div><b>${x.label}</b><small>${x.detail}</small></div><em>${x.status==='pass'?'VALIDÉ':x.status==='warn'?'À CONFIRMER':'INCOMPATIBLE'}</em></div>`).join('')}</section>`}
const detailV32Base=renderDetail;renderDetail=function(){detailV32Base();if(currentBuild){const quality=q('#detail .quality-summary');if(quality)quality.insertAdjacentHTML('afterend',compatibilityMatrixV32(currentBuild));else q('#detail').insertAdjacentHTML('afterbegin',compatibilityMatrixV32(currentBuild))}};
const computeV32Base=compute;compute=function(){computeV32Base();if(q('#results')?.classList.contains('show')){ensureCompatibilityToolbarV32();applyCompatibilityCardsV32();decorateCompareButtonsV32();renderComparisonV32()}};

