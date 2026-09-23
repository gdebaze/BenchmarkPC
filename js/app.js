function q(s){return document.querySelector(s)}function qa(s){return [...document.querySelectorAll(s)]}

const assistance={novice:{label:'Novice',coach:true,title:'Mode guidé',intro:'Je vais expliquer les choix importants sans jargon inutile.',tip:'Commence par ton écran : sa résolution et sa fréquence déterminent une grande partie de la puissance GPU utile.'},connaisseur:{label:'Connaisseur',coach:true,title:'Mode équilibré',intro:'Je garde les explications utiles et je te laisse davantage de contrôle.',tip:'Tu peux combiner plusieurs usages et plusieurs priorités : reclique sur une option pour la retirer.'},pro:{label:'Pro',coach:true,title:'Mode technique',intro:'Interface plus directe, avec davantage de données et moins d’explications.',tip:'Les builds restent des recommandations de prototype : vérifie prix, compatibilité et benchmarks réels avant achat.'},expert:{label:'Expert',coach:false,title:'Mode expert',intro:'Données d’abord.',tip:''}};
let userLevel=null;
function applyLevel(level,closeIntro=true){if(!assistance[level])return;userLevel=level;document.body.classList.remove('level-novice','level-connaisseur','level-pro','level-expert');document.body.classList.add('level-'+level);q('#level-switch').textContent='Niveau : '+assistance[level].label;qa('.level-card').forEach(x=>x.classList.toggle('active',x.dataset.level===level));try{localStorage.setItem('readoutLevel',level)}catch(_){ }updateAdaptiveHelp();if(closeIntro){q('#onboarding').classList.add('done');document.body.classList.remove('onboarding-open');q('.hero').classList.add('reveal')}}
function reopenLevel(){q('#onboarding').classList.remove('done');document.body.classList.add('onboarding-open')}
function updateAdaptiveHelp(){if(!userLevel)return;const h=assistance[userLevel],box=q('#adaptive-help');if(!h.coach){box.classList.add('hidden');return}let title=h.title,text=h.intro,tip=h.tip;if(!selRes){title='1. Choisis ton affichage';text=userLevel==='novice'?'La résolution correspond au nombre de pixels affichés. 1080p demande moins de puissance que 1440p ou 4K.':'Sélectionne la résolution cible puis un écran.'}else if(!selMonitor){title='Choisis un écran concret';text='La fréquence en Hz fixe le nombre maximal d’images que l’écran peut afficher chaque seconde.'}else if(selUsages.length===0){title='2. Ajoute tes usages';text='Tu peux en sélectionner plusieurs : jeu compétitif, AAA, création, streaming, simulation ou polyvalent.'}else if(selPriorities.length===0){title='3. Définis tes priorités';text='Readout utilise ces choix pour arbitrer entre FPS, qualité, silence et puissance de création.'}else if(selBudget===null){title='4. Fixe ton budget';text='Choisis une fourchette réaliste pour éviter de recommander une machine inutilement chère.'}else if(selStyle===null){title='5. Choisis le style';text='Le style modifie surtout le boîtier, le RGB et le refroidissement.'}else{title='Ton profil est complet';text='Les quatre builds sont prêts. Ouvre BuildLab pour inspecter le montage et le RGB.';tip='Dans BuildLab : glisse pour tourner, molette pour zoomer et double-clique un composant pour le localiser.'}q('#ah-level').textContent=h.label.toUpperCase()+' · AIDE ADAPTATIVE';q('#ah-title').textContent=title;q('#ah-text').textContent=text;q('#ah-tip').textContent=tip;box.classList.remove('hidden')}

function safe(img,label){img.style.display='none';if(img.parentElement){img.parentElement.dataset.fallback=label;img.parentElement.style.background='linear-gradient(145deg,#151922,#0b0d12)'}}
function renderSimple(id,data,sel,setter,multi=false){q(id).innerHTML=data.map((x,i)=>{const on=multi?sel.includes(i):sel===i;return `<button class="opt ${on?'sel':''}" onclick="${setter}(${i})"><b>${x[0]}</b><small>${x[1]}</small></button>`}).join('')}
function renderRes(){q('#resolutions').innerHTML=resolutions.map(r=>`<button class="opt ${selRes===r.id?'sel':''}" onclick="selectRes('${r.id}')"><b>${r.name}</b><small>${r.sub}</small></button>`).join('')}
function selectRes(id){if(selRes===id){selRes=null;selMonitor=null}else{selRes=id;selMonitor=null}renderRes();renderMonitors();compute()}
function monitorImgError(img){const box=img.closest('.monitor-img');img.classList.add('img-error');img.removeAttribute('src');if(box)box.classList.add('fallback-active')}
function renderMonitors(){const wrap=q('#monitor-wrap');if(!selRes){wrap.classList.remove('show');return}wrap.classList.add('show');q('#monitors').innerHTML=monitors[selRes].map(m=>`<article class="monitor ${selMonitor===m.id?'sel':''}" onclick="chooseMonitor('${m.id}')"><span class="badge">${m.badge}</span><div class="monitor-img ${m.img2?'dual':''}"><img src="${m.img}" alt="${m.name}" loading="eager" referrerpolicy="no-referrer" onerror="monitorImgError(this)">${m.img2?`<img src="${m.img2}" alt="${m.name} · vue alternative" loading="eager" onerror="monitorImgError(this)">`:''}<span class="monitor-fallback-label">${m.name}<br>${m.size} · ${m.hz} Hz</span></div><h3>${m.name}</h3><div class="meta">${m.size} · ${selRes} · ${m.hz} Hz · ${m.panel}</div><div class="foot"><b>${m.price}</b><a href="${m.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Fabricant ↗</a></div></article>`).join('')}
function chooseMonitor(id){selMonitor=selMonitor===id?null:id;renderMonitors();compute()}
qa('.level-card').forEach(x=>x.onclick=()=>applyLevel(x.dataset.level,true));q('#level-switch').onclick=reopenLevel;q('#ah-close').onclick=()=>q('#adaptive-help').classList.add('hidden');
function toggleIn(arr,i){const p=arr.indexOf(i);if(p>=0)arr.splice(p,1);else arr.push(i)}
function setUsage(i){toggleIn(selUsages,i);renderAll();compute()}function setPriority(i){toggleIn(selPriorities,i);renderAll();compute()}function setBudget(i){selBudget=selBudget===i?null:i;customBudget=null;renderAll();compute()}function setStyle(i){selStyle=selStyle===i?null:i;renderAll();compute()}
function applyCustomBudget(){const input=q('#custom-budget-value'),status=q('#custom-budget-status'),value=Number(input.value);if(!Number.isFinite(value)||value<=0){status.textContent='Entre un montant positif valide, sans plafond.';status.classList.remove('custom-budget-status');return}customBudget=value;budgets[4][0]=`${value.toLocaleString('fr-FR')} €`;budgets[4][2]=value;selBudget=4;status.textContent=`Prix cible enregistré : ${value.toLocaleString('fr-FR')} € pour la tour.`;status.classList.add('custom-budget-status');renderAll();compute()}
function renderAll(){renderSimple('#usages',usages,selUsages,'setUsage',true);renderSimple('#priorities',priorities,selPriorities,'setPriority',true);renderSimple('#budgets',budgets.slice(0,4),selBudget,'setBudget');renderSimple('#styles',styles,selStyle,'setStyle');const custom=q('#custom-budget');if(custom){custom.classList.toggle('active',selBudget===4);const input=q('#custom-budget-value');if(customBudget!==null&&document.activeElement!==input)input.value=customBudget}updateAdaptiveHelp()}
function mon(){return selRes&&selMonitor?monitors[selRes].find(x=>x.id===selMonitor):null}
function adjustedPrice(b){if(b.dynamic)return b.base;if(selStyle===1)return b.base+80;if(selStyle===2)return b.base+60;if(selStyle===3&&b.key!=='balanced')return b.base+45;return b.base}
function compute(){if(!selRes||!selMonitor||selUsages.length===0||selPriorities.length===0||selBudget===null||selStyle===null){q('#results').classList.remove('show');return}q('#results').classList.add('show');const m=mon();const useTxt=selUsages.map(i=>usages[i][0]).join(' + '),prioTxt=selPriorities.map(i=>priorities[i][0]).join(' + ');q('#readout').textContent=`${m.name} · ${selRes} @ ${m.hz} Hz · ${useTxt} · ${prioTxt} · ${budgets[selBudget][0]} · ${styles[selStyle][0]}`;q('#configs').innerHTML=builds.map(b=>`<article data-build="${b.key}" class="config ${b.key==='balanced'?'reco':''} ${benchKey===b.key?'selected':''}" onclick="selectBuild('${b.key}')"><span class="build-check" aria-hidden="true">✓</span><div class="tier">${b.tier}${b.key==='balanced'?' · RECOMMANDATION':''}</div><div class="price">${adjustedPrice(b).toLocaleString('fr-FR')} €</div><div class="target">${b.target}</div><div class="case-thumb" data-case="${b.case}"><canvas class="build-thumb-canvas" data-build="${b.key}"></canvas><img class="case-product-photo" src="${b.caseImg}" alt="${b.case} · vue produit" loading="eager" onload="this.parentElement.classList.add('photo-loaded')" onerror="this.remove()"><span class="product-photo-tag">PHOTO DU BOÎTIER RÉEL</span><span class="render-tag">RENDU 3D DE SECOURS</span></div><div class="specs"><div class="spec"><span>GPU</span><span>${b.gpu}</span></div><div class="spec"><span>CPU</span><span>${b.cpu}</span></div><div class="spec"><span>RAM</span><span>${b.ram}</span></div><div class="spec"><span>COOLING</span><span>${b.cooler}</span></div></div><button onclick="event.stopPropagation();openLab('${b.key}')">Ouvrir BuildLab →</button></article>`).join('');drawBuildThumbs();fillGames();syncBuildSelection();if(benchKey)updateBench();setTimeout(()=>q('#results').scrollIntoView({behavior:'smooth',block:'start'}),60)}
function syncBuildSelection(){qa('.config').forEach(card=>card.classList.toggle('selected',card.dataset.build===benchKey));const bench=q('.bench'),gate=q('#bench-gate');bench.classList.toggle('show',!!benchKey);gate.classList.toggle('hidden',!!benchKey)}
function selectBuild(key,scroll=true){benchKey=benchKey===key?null:key;syncBuildSelection();if(!benchKey)return;updateBench();if(scroll)setTimeout(()=>q('.bench').scrollIntoView({behavior:'smooth',block:'start'}),120)}
function drawBuildThumbs(){qa('.build-thumb-canvas').forEach(c=>{
 const b=builds.find(v=>v.key===c.dataset.build),dpr=Math.min(devicePixelRatio||1,2),w=c.clientWidth||280,h=c.clientHeight||185,x=c.getContext('2d');c.width=w*dpr;c.height=h*dpr;x.scale(dpr,dpr);
 const rgb=['#63d9ff','#8e7dff','#ff5ac8','#9fe9ff'][builds.indexOf(b)],white=selStyle===2;
 let bg=x.createRadialGradient(w*.55,h*.4,5,w*.55,h*.48,w*.65);bg.addColorStop(0,'#172334');bg.addColorStop(.48,'#0b1018');bg.addColorStop(1,'#050609');x.fillStyle=bg;x.fillRect(0,0,w,h);
 x.save();x.globalAlpha=.32;x.fillStyle=rgb;x.filter='blur(22px)';x.beginPath();x.ellipse(w*.53,h*.84,w*.34,h*.12,0,0,Math.PI*2);x.fill();x.restore();
 const variants={smart:[.20,.12,.54,.72,.10],balanced:[.17,.10,.60,.75,.14],performance:[.13,.09,.66,.77,.06],dream:[.16,.07,.62,.80,.18]},v=variants[b.key],px=w*v[0],py=h*v[1],pw=w*v[2],ph=h*v[3],depth=w*v[4];
 x.save();x.shadowColor='rgba(0,0,0,.8)';x.shadowBlur=24;x.shadowOffsetY=14;
 x.fillStyle=white?'#d9dde2':'#11151b';x.beginPath();x.roundRect(px,py,pw,ph,9);x.fill();x.shadowBlur=0;
 if(depth){x.fillStyle=white?'#aeb5bd':'#090c11';x.beginPath();x.moveTo(px+pw,py+7);x.lineTo(px+pw+depth,py+depth*.42);x.lineTo(px+pw+depth,py+ph-depth*.25);x.lineTo(px+pw,py+ph);x.closePath();x.fill()}
 let glass=x.createLinearGradient(px,py,px+pw,py+ph);glass.addColorStop(0,'rgba(160,220,255,.19)');glass.addColorStop(.45,'rgba(20,30,40,.43)');glass.addColorStop(1,'rgba(3,6,10,.78)');x.fillStyle=glass;x.beginPath();x.roundRect(px+pw*.06,py+ph*.06,pw*.83,ph*.86,6);x.fill();
 x.strokeStyle='rgba(190,225,255,.25)';x.lineWidth=1;x.stroke();
 x.fillStyle='#142019';x.beginPath();x.roundRect(px+pw*.18,py+ph*.20,pw*.46,ph*.48,4);x.fill();
 for(let i=0;i<9;i++){x.fillStyle=i%2?'#16251c':'#1d3225';x.fillRect(px+pw*(.21+(i%3)*.13),py+ph*(.24+Math.floor(i/3)*.13),pw*.08,ph*.075)}
 const gx=px+pw*.17,gy=py+ph*.58,gw=pw*.62,gh=ph*.16;x.fillStyle=b.key==='dream'?'#353b43':'#242b34';x.beginPath();x.roundRect(gx,gy,gw,gh,4);x.fill();x.strokeStyle='rgba(255,255,255,.18)';x.stroke();
 const fanCount=b.gpuFans||2;for(let i=0;i<fanCount;i++){const fx=gx+gw*(.22+i*(.56/Math.max(1,fanCount-1))),fy=gy+gh*.5,r=gh*.30;x.lineWidth=2.6;x.strokeStyle='#76818c';x.beginPath();x.arc(fx,fy,r,0,Math.PI*2);x.stroke();x.strokeStyle=rgb;x.shadowColor=rgb;x.shadowBlur=9;x.beginPath();x.arc(fx,fy,r*.7,0,Math.PI*2);x.stroke();x.shadowBlur=0}
 const caseFans=b.key==='smart'?2:3;for(let i=0;i<caseFans;i++){const fx=px+pw*.87,fy=py+ph*(.23+i*(.53/Math.max(1,caseFans-1))),r=ph*.072;x.lineWidth=4;x.strokeStyle='#48515c';x.beginPath();x.arc(fx,fy,r,0,Math.PI*2);x.stroke();x.lineWidth=2;x.strokeStyle=rgb;x.shadowColor=rgb;x.shadowBlur=13;x.beginPath();x.arc(fx,fy,r*.72,0,Math.PI*2);x.stroke();x.shadowBlur=0}
 if(b.cooling==='aio'){x.fillStyle='#1d242c';x.beginPath();x.roundRect(px+pw*.16,py+ph*.09,pw*.60,ph*.08,3);x.fill();for(let i=0;i<3;i++){x.strokeStyle=rgb;x.lineWidth=1.4;x.beginPath();x.arc(px+pw*(.25+i*.20),py+ph*.13,ph*.027,0,Math.PI*2);x.stroke()}}
 x.strokeStyle='rgba(255,255,255,.22)';x.beginPath();x.moveTo(px+pw*.08,py+ph*.08);x.lineTo(px+pw*.34,py+ph*.08);x.lineTo(px+pw*.12,py+ph*.92);x.stroke();
 x.restore();x.fillStyle='rgba(255,255,255,.76)';x.font='600 8px JetBrains Mono, monospace';x.fillText(`${b.case.toUpperCase()} · ${b.gpuFans}F GPU`,10,h-10);
 })}
function fillGames(){q('#game-select').innerHTML=Object.entries(games).map(([k,v])=>`<option value="${k}" ${game===k?'selected':''}>${v.name}</option>`).join('')}
function baseFps(b){const r=resolutions.find(x=>x.id===selRes);let f=(renderMode==='rt'?b.rt:b.score)*r.factor;if(renderMode==='upscale')f=b.score*r.factor*1.58;f*=games[game].mult*quality[qualityMode];if(selUsages.includes(0))f*=1.08;if(selUsages.includes(2))f*=.97;if(selPriorities.includes(0))f*=1.06;if(selPriorities.includes(1))f*=.98;if(selPriorities.includes(2))f*=.98;return Math.max(18,f)}
function youtubeId(url){const m=String(url).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null}
function gameplayUrl(id){const mute=soundMode==='muted'?1:0;const origin=(location.protocol==='http:'||location.protocol==='https:')?`&origin=${encodeURIComponent(location.origin)}`:'';const start=(games[game].starts&&games[game].starts[selRes])||0;return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${mute}&controls=1&rel=0&playsinline=1&enablejsapi=1&modestbranding=1&start=${start}${origin}`}
function renderBenchmarkPicks(){const g=games[game];q('#benchmark-picks').innerHTML=`<button class="bench-pick" onclick="useBenchmarkVideo('${g.video}')"><b>${g.creator}</b><span>${g.source}</span></button><button class="bench-pick" onclick="openBenchmarkSource()"><b>Ouvrir sur YouTube ↗</b><span>solution de secours si l’embed est bloqué</span></button><button class="bench-pick" onclick="q('#local-video-file').click()"><b>Ma propre capture</b><span>MP4 / WebM / MOV local</span></button>`}
function useBenchmarkVideo(id){customGameplayId=id;localVideoActive=false;q('#gameplay-layer').classList.remove('local');q('#local-gameplay').pause();q('#local-gameplay').removeAttribute('src');setGameplayPoster();updateGameplay(true)}
function openBenchmarkSource(){const id=customGameplayId||games[game].video;window.open(`https://www.youtube.com/watch?v=${id}`,'_blank','noopener')}
function setGameplayPoster(){const id=customGameplayId||games[game].video,poster=q('#video-poster');q('#gameplay-layer').classList.remove('local');poster.style.backgroundImage=`linear-gradient(180deg,rgba(2,3,5,.02),rgba(2,3,5,.32)),url(https://i.ytimg.com/vi/${id}/maxresdefault.jpg)`;poster.classList.remove('hidden');q('#gameplay-frame').src='about:blank';lastGameplayKey=''}
function playGameplay(){const id=customGameplayId||games[game].video;q('#gameplay-layer').classList.remove('local');q('#gameplay-frame').src=gameplayUrl(id);q('#video-poster').classList.add('hidden');lastGameplayKey=`${id}-${soundMode}`;q('#video-state').textContent=location.protocol==='file:'?'Le lecteur nécessite un serveur local ou GitHub Pages.':'Vidéo de référence chargée ; la télémétrie superposée reste une simulation indépendante.'}
let localVideoActive=false,localVideoObjectUrl=null;
function updateGameplay(force=false){const screen=q('#bench-screen'),g=games[game],id=customGameplayId||g.video;screen.classList.toggle('gameplay',visualMode==='gameplay');screen.classList.toggle('synthetic',visualMode==='synthetic');q('#gameplay-status').textContent=localVideoActive?'CLIP LOCAL':visualMode==='gameplay'?'BENCHMARK GAMEPLAY':'COURBE DE PERFORMANCE';if(visualMode==='gameplay'&&!localVideoActive&&(force||!lastGameplayKey||!lastGameplayKey.startsWith(id)))setGameplayPoster();q('#gameplay-source').textContent=localVideoActive?'Clip local importé par toi':(customGameplayId?'Gameplay YouTube personnalisé':g.source);q('#gameplay-open').href=`https://www.youtube.com/watch?v=${id}`;renderBenchmarkPicks()}
function graphPath(avg,b,m){const n=72,low=avg*(game==='cs2'?.70:game==='fortnite'?.74:.80),pts=[];let seed=(Math.round(avg)*31+b.score*17+m.hz*3+game.length*97)%997;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};for(let i=0;i<n;i++){const wave=Math.sin(i*.42)*.045+Math.sin(i*.13+1.2)*.025;const jitter=(rnd()-.5)*.09;let dip=0;if(i%19===0||i%31===0)dip=.08+rnd()*.08;pts.push(Math.max(low*.92,avg*(1+wave+jitter-dip)))}const max=Math.max(m.hz*1.18,avg*1.35,80),xy=pts.map((v,i)=>[i/(n-1)*1000,360-(v/max)*315]),line='M'+xy.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' L'),area=line+` L1000,390 L0,390 Z`,lowPts=pts.map((v,i)=>[i/(n-1)*1000,360-(Math.max(low*.92,v*.82)/max)*315]),lowLine='M'+lowPts.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' L'),targetY=360-(m.hz/max)*315;return{line,area,lowLine,targetY,low,pts}}
let liveSamples=[],liveGraphSamples=[],liveGraphLast=0;
function graphFromSamples(samples,base,m){if(!samples.length)return;const max=Math.max(m.hz*1.18,base*1.38,80),lowFactor=game==='cs2'?.70:game==='fortnite'?.74:.80;const xy=samples.map((v,i)=>[i/Math.max(1,samples.length-1)*1000,360-(v/max)*315]);const line='M'+xy.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' L');const area=line+` L1000,390 L0,390 Z`;const lowxy=samples.map((v,i)=>[i/Math.max(1,samples.length-1)*1000,360-(v*lowFactor/max)*315]);const lowLine='M'+lowxy.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' L');q('#perf-line').setAttribute('d',line);q('#perf-low').setAttribute('d',lowLine);q('#perf-area').setAttribute('d',area);q('#target-line').setAttribute('y1',360-(m.hz/max)*315);q('#target-line').setAttribute('y2',360-(m.hz/max)*315);const last=xy[xy.length-1];q('#perf-head').setAttribute('cx',last[0]);q('#perf-head').setAttribute('cy',last[1]);}
function updateGraph(fps,b,m){const g=graphPath(fps,b,m);liveGraphSamples=g.pts.slice();liveSamples=g.pts.slice(-35);graphFromSamples(liveGraphSamples,fps,m);q('#graph-avg').textContent=`AVG ${Math.round(fps)} FPS`;q('#graph-low').textContent=`1% LOW ${Math.round(g.low)} FPS`;q('#graph-ft').textContent=`${(1000/fps).toFixed(1)} ms`}
function tickTelemetry(now=performance.now()){if(document.hidden||!mon()||!benchKey)return;const b=builds.find(x=>x.key===benchKey),m=mon(),base=baseFps(b),t=now/1000;const noise=Math.sin(t*2.7)*.035+Math.sin(t*.77)*.025+(Math.random()-.5)*.035;const current=Math.max(18,base*(1+noise));const low=current*(game==='cs2'?.70:game==='fortnite'?.74:.80);const gpu=Math.min(99,Math.max(48,Math.round((renderMode==='rt'?96:88)+(Math.random()-.5)*7)));const cpu=Math.min(95,Math.max(18,Math.round((game==='cs2'||game==='fortnite'?58:36)+(Math.random()-.5)*12)));q('#live-fps').textContent=Math.round(current);q('#live-low').textContent=Math.round(low);q('#live-gpu').textContent=gpu+'%';q('#live-cpu').textContent=cpu+'%';q('#live-ft').textContent=(1000/current).toFixed(1)+' ms';q('#hud-fps').innerHTML=`${Math.round(current)} <small>FPS</small>`;q('#graph-ft').textContent=`${(1000/current).toFixed(1)} ms`;liveSamples.push(current);if(liveSamples.length>45)liveSamples.shift();if(now-liveGraphLast>105){liveGraphLast=now;liveGraphSamples.push(current);if(liveGraphSamples.length>72)liveGraphSamples.shift();graphFromSamples(liveGraphSamples,base,m);const avg=liveGraphSamples.reduce((a,v)=>a+v,0)/liveGraphSamples.length;q('#graph-avg').textContent=`AVG ${Math.round(avg)} FPS`;q('#graph-low').textContent=`1% LOW ${Math.round(Math.min(...liveGraphSamples))} FPS`}const max=Math.max(...liveSamples,base*1.15,60),min=Math.min(...liveSamples,base*.65),range=Math.max(1,max-min);const d='M'+liveSamples.map((v,i)=>`${(i/Math.max(1,liveSamples.length-1)*150).toFixed(1)},${(28-(v-min)/range*24).toFixed(1)}`).join(' L');q('#live-spark').setAttribute('d',d)}
let lastTelemetryFrame=0;function liveBenchmarkLoop(now){requestAnimationFrame(liveBenchmarkLoop);if(document.hidden||!benchKey||!mon()||now-lastTelemetryFrame<180)return;lastTelemetryFrame=now;tickTelemetry(now)}requestAnimationFrame(liveBenchmarkLoop);
function updateBench(){if(!mon()||!benchKey)return;const b=builds.find(x=>x.key===benchKey),m=mon(),fps=baseFps(b),use=Math.min(100,Math.round(fps/m.hz*100));q('#hud-game').textContent=games[game].name.toUpperCase();q('#hud-gpu').textContent=b.gpu.replace(' Founders Edition','');q('#hud-fps').innerHTML=`${Math.round(fps)} <small>FPS</small>`;q('#hud-res').textContent=`${selRes} · ${qualityMode.toUpperCase()} · ${renderMode.toUpperCase()}`;q('#hud-use').textContent=`${use}% du ${m.hz} Hz`;q('#mini-monitor').innerHTML=`<div class="monitor-img" style="width:92px;height:62px;flex:none"><img src="${m.img}" alt="${m.name}" referrerpolicy="no-referrer" onerror="monitorImgError(this)"><span class="monitor-fallback-label">${m.name}</span></div><div><b>${m.name}</b><span>${m.size} · ${selRes} · ${m.hz} Hz · ${m.panel}<br>${b.tier} · ${b.gpu}</span></div>`;const vals=[['FPS estimés',`${fps.toFixed(0)} FPS`,Math.min(100,fps/220*100)],['Écran exploité',`${use}%`,use],['Marge vers '+m.hz+' Hz',fps>=m.hz?'objectif atteint':`${Math.round(m.hz-fps)} FPS`,Math.min(100,fps/m.hz*100)],['Indice build',`${Math.round(b.score/1.67)} / 100`,Math.min(100,b.score/1.67)]];q('#bench-stats').innerHTML=vals.map(v=>`<div class="bench-stat"><div class="stat-top"><span>${v[0]}</span><span>${v[1]}</span></div><div class="bar"><i style="width:${v[2]}%"></i></div></div>`).join('');updateGraph(fps,b,m);updateGameplay();tickTelemetry()}
q('#game-select').onchange=e=>{game=e.target.value;customGameplayId=null;localVideoActive=false;lastGameplayKey='';q('#gameplay-url').value='';q('#video-state').textContent='Benchmark gameplay synchronisé avec le jeu sélectionné.';q('#video-state').classList.remove('error');updateBench()};q('#quality-select').onchange=e=>{qualityMode=e.target.value;updateBench()};q('#visual-select').onchange=e=>{visualMode=e.target.value;updateGameplay()};q('#sound-select').onchange=e=>{soundMode=e.target.value;updateGameplay(true)};q('#load-gameplay').onclick=()=>{const id=youtubeId(q('#gameplay-url').value);const state=q('#video-state');if(!id){state.textContent='Lien non reconnu. Utilise un lien YouTube classique, youtu.be, Shorts ou Embed.';state.classList.add('error');return}customGameplayId=id;localVideoActive=false;lastGameplayKey='';visualMode='gameplay';q('#visual-select').value='gameplay';state.textContent='Gameplay personnalisé prêt.';state.classList.remove('error');updateGameplay(true)};q('#reset-gameplay').onclick=()=>{customGameplayId=null;localVideoActive=false;lastGameplayKey='';q('#gameplay-url').value='';visualMode='gameplay';q('#visual-select').value='gameplay';q('#video-state').textContent='Benchmark gameplay du jeu sélectionné.';q('#video-state').classList.remove('error');updateGameplay(true)};qa('#render-toggle button').forEach(b=>b.onclick=()=>{qa('#render-toggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMode=b.dataset.mode;updateBench()});q('#play-video').onclick=playGameplay;
q('#local-video-file').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(localVideoObjectUrl)URL.revokeObjectURL(localVideoObjectUrl);localVideoObjectUrl=URL.createObjectURL(f);const v=q('#local-gameplay');v.src=localVideoObjectUrl;v.muted=soundMode==='muted';localVideoActive=true;visualMode='gameplay';q('#visual-select').value='gameplay';q('#gameplay-layer').classList.add('local');q('#video-state').textContent=`Clip local : ${f.name}`;q('#gameplay-source').textContent='Fichier local · '+f.name;v.play().catch(()=>{});updateGameplay()};q('#clear-local-video').onclick=()=>{localVideoActive=false;q('#local-gameplay').pause();q('#gameplay-layer').classList.remove('local');setGameplayPoster();updateGameplay(true)};
let currentBuild=null,currentView='mounted',threeReady=false,threeScene,threeCamera,threeRenderer,threeRaycaster,threeMouse,threeRoot,threeParts={},threeFans=[],threeClock,selected3D=null,explodeFactor=0,explodeTarget=0,glassMesh=null,rgbOn=true,rgbMode='rainbow',rgbColor=0x67dcff,rgbIntensity=1.5,rgbMaterials=[],rgbLights=[];
let orbit={yaw:.70,pitch:.22,dist:8.2,target:null,drag:false,x:0,y:0};
const SCALE=.01;
const partDesc={gpu:'Carte graphique montée horizontalement dans le premier slot PCIe x16, bracket aligné sur les slots arrière.',cpu:'CPU AM5 installé dans le socket de la carte mère, sous le bloc pompe ou le ventirad.',mobo:'Carte mère ATX 304,8 × 243,84 mm vissée sur les entretoises du plateau.',ram:'Deux barrettes DDR5 placées en A2/B2.',ssd:'SSD M.2 2280 de 80 × 22 mm installé sur le slot M.2 principal.',cooler:'Refroidissement CPU. En AIO, le radiateur 360 mm est monté au plafond avec trois ventilateurs.',psu:'Alimentation ATX installée dans la seconde chambre, derrière la carte mère.',fans:'Trois ventilateurs 120 mm inclinés sur le côté avant du H6 Flow.',case:'NZXT H6 Flow : 435 × 287 × 415 mm, double chambre et verre panoramique.'};
function mat(color,metal=.35,rough=.45,emissive=0,intensity=0){const m=new THREE.MeshPhysicalMaterial({color,metalness:metal,roughness:rough,emissive,emissiveIntensity:intensity,clearcoat:metal>.6?.32:.08,clearcoatRoughness:.28,reflectivity:.55});if(emissive&&intensity>0)rgbMaterials.push(m);return m}
function box(w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d,2,2,2),m);o.castShadow=o.receiveShadow=true;return o}
function cyl(r,h,m,seg=48){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.castShadow=o.receiveShadow=true;return o}
function roundedPanel(w,h,d,r,m){const shape=new THREE.Shape();const x=-w/2,y=-h/2;shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:Math.min(r*.25,.035),bevelThickness:.018});geo.center();const o=new THREE.Mesh(geo,m);o.castShadow=o.receiveShadow=true;return o}
function labelTexture(text,sub=''){const c=document.createElement('canvas');c.width=1024;c.height=220;const x=c.getContext('2d');x.fillStyle='rgba(5,8,12,.88)';x.fillRect(0,0,c.width,c.height);x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=3;x.strokeRect(5,5,c.width-10,c.height-10);x.fillStyle='#fff';x.font='700 38px Arial';x.fillText(text.slice(0,42),32,88);x.fillStyle='#a9b3bf';x.font='500 24px Arial';x.fillText(sub.slice(0,62),32,145);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}
function addFaceLabel(){return null}
function createFan(r=.42,depth=.10,accent=0x67dcff,rgb=true){const g=new THREE.Group();const frame=roundedPanel(r*2.2,r*2.2,depth,.12,mat(0x11151a,.45,.5));g.add(frame);for(const sx of [-1,1])for(const sy of [-1,1]){const screw=cyl(r*.045,.018,mat(0x8e969e,.9,.2),18);screw.rotation.x=Math.PI/2;screw.position.set(sx*r*.86,sy*r*.86,depth*.56);g.add(screw)}const ringMat=rgb?mat(0x252c34,.45,.28,accent,1.25):mat(0x303741,.55,.28);const ring=new THREE.Mesh(new THREE.TorusGeometry(r*.80,r*.055,12,64),ringMat);ring.position.z=depth*.57;g.add(ring);const rotor=new THREE.Group();for(let i=0;i<9;i++){const sh=new THREE.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(r*.26,r*.04,r*.58,r*.10);sh.quadraticCurveTo(r*.48,r*.26,r*.13,r*.23);sh.quadraticCurveTo(r*.05,r*.13,0,0);const geo=new THREE.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:false});const blade=new THREE.Mesh(geo,mat(0x39414a,.4,.34));blade.rotation.z=i*Math.PI*2/9+.18;blade.position.z=depth*.59;rotor.add(blade)}const hub=cyl(r*.17,.07,rgb?mat(0x161a20,.5,.3,accent,.8):mat(0x161a20,.5,.3),40);hub.rotation.x=Math.PI/2;hub.position.z=depth*.62;rotor.add(hub);g.add(rotor);threeFans.push(rotor);return g}
function reg(id,o,home,explode){o.userData.part=id;o.userData.home=home.clone();o.userData.explode=explode.clone();o.position.copy(home);o.traverse(x=>x.userData.part=id);threeRoot.add(o);threeParts[id]=o;return o}
function createH6Flow(){const g=new THREE.Group(),D=4.15,H=4.35,W=2.87;g.userData.part='case';const steel=mat(0x11161d,.88,.24),edge=mat(0x313943,.9,.2),dark=mat(0x080a0d,.55,.6);const bottom=roundedPanel(D-.10,.12,W-.10,.05,steel);bottom.rotation.x=Math.PI/2;bottom.position.y=-H/2+.06;g.add(bottom);const top=roundedPanel(D-.10,.12,W-.10,.05,steel);top.rotation.x=Math.PI/2;top.position.y=H/2-.06;g.add(top);const rear=box(.10,H-.18,W-.12,steel);rear.position.x=-D/2+.06;g.add(rear);const tray=roundedPanel(2.95,3.62,.075,.06,mat(0x20262d,.82,.32));tray.position.set(-.35,.08,-.77);g.add(tray);for(const x of [-D/2+.07,D/2-.07])for(const y of [-H/2+.07,H/2-.07]){const beam=box(.09,.09,W-.10,edge);beam.position.set(x,y,0);g.add(beam)}
// H6 Flow: trois ventilateurs 120 mm inclinés à l'avant-droit
for(let i=0;i<3;i++){const f=createFan(.50,.11,0x67dcff,true);f.rotation.y=-Math.PI*.18;f.position.set(1.49,1.22-i*1.20,-.08);g.add(f)}const rearFan=createFan(.47,.10,0x8e7dff,true);rearFan.rotation.y=Math.PI/2;rearFan.position.set(-1.98,1.08,.28);g.add(rearFan);
// grilles perforées simplifiées
for(let ix=0;ix<9;ix++)for(let iz=0;iz<5;iz++){const hole=box(.16,.018,.16,mat(0x050608,.1,.8));hole.position.set(-1.55+ix*.38,H/2-.115,-.82+iz*.36);g.add(hole)}for(const x of [-1.55,1.55])for(const z of [-.95,.95]){const ft=box(.48,.16,.40,dark);ft.position.set(x,-H/2-.12,z);g.add(ft)}
glassMesh=null;return g}
function createMotherboard(b){const g=new THREE.Group();g.add(roundedPanel(2.438,3.048,.055,.035,mat(0x0a0d0f,.28,.66))); // MSI black PCB
// PCB traces
for(let i=0;i<14;i++){const tr=box(.012,.72+Math.random()*.7,.012,mat(i%3?0x3a4147:0xc6a94b,.45,.48));tr.position.set(-1.05+i*.15,-.55+Math.sin(i)*.45,.045);tr.rotation.z=(i%2?-.18:.22);g.add(tr)}
const io=roundedPanel(.42,1.04,.22,.05,mat(0x3b4249,.9,.18));io.position.set(-.96,1.0,.13);g.add(io);const vrm1=roundedPanel(1.05,.32,.18,.05,mat(0x3b4249,.92,.18));vrm1.position.set(.10,1.31,.14);g.add(vrm1);const vrm2=roundedPanel(.32,1.02,.18,.05,mat(0x343b42,.92,.18));vrm2.position.set(-.64,.73,.14);g.add(vrm2);const socket=roundedPanel(.50,.50,.08,.04,mat(0x9ca3aa,.88,.16));socket.position.set(-.10,.62,.10);g.add(socket);const ihs=roundedPanel(.39,.39,.065,.035,mat(0xc9cdd1,.98,.12));ihs.position.set(-.10,.62,.18);g.add(ihs);
for(let i=0;i<4;i++){const sl=roundedPanel(.075,1.24,.06,.02,mat(0x15191e,.55,.48));sl.position.set(.48+i*.12,.56,.08);g.add(sl)}for(let i=0;i<3;i++){const sl=roundedPanel(1.76,.06,.065,.015,mat(i===0?0xd6d9dc:0x222831,.65,.32));sl.position.set(.05,-.30-i*.39,.09);g.add(sl)}for(const [x,y,w] of [[.12,.03,1.06],[.04,-.82,1.36]]){const m=roundedPanel(w,.23,.12,.035,mat(0x434a52,.92,.18));m.position.set(x,y,.13);g.add(m)}const chip=roundedPanel(.55,.55,.16,.06,mat(0x30363d,.9,.18));chip.position.set(.70,-1.04,.14);g.add(chip);for(let i=0;i<10;i++){const cap=cyl(.035,.09,mat(0x9ca4ac,.82,.24),16);cap.rotation.x=Math.PI/2;cap.position.set(-.70+(i%5)*.16,-.03-Math.floor(i/5)*.18,.12);g.add(cap)}addFaceLabel(g,b.mobo,'MSI · ATX 304,8 × 243,84 mm',1.70,.32,.21);return g}
function createRAM(){const g=new THREE.Group();for(let i=0;i<2;i++){const body=roundedPanel(.10,1.18,.23,.025,mat(0x171c22,.72,.25));body.position.x=i*.15;g.add(body);for(let y=-.42;y<.45;y+=.22){const chip=box(.025,.14,.19,mat(0x080a0d,.35,.55));chip.position.set(i*.15,y,.01);g.add(chip)}const led=roundedPanel(.105,1.12,.035,.018,mat(0x1d242c,.25,.22,i?0x8e7dff:0x67dcff,1.6));led.position.set(i*.15,0,.135);g.add(led)}return g}
function createSSD(){const g=new THREE.Group();g.add(roundedPanel(.80,.22,.025,.02,mat(0x0b1b14,.2,.72)));for(let i=0;i<4;i++){const chip=roundedPanel(.12,.14,.025,.012,mat(0x171a1f,.5,.45));chip.position.set(-.26+i*.17,0,.026);g.add(chip)}const gold=box(.08,.22,.012,mat(0xcaa74d,.9,.2));gold.position.x=.36;g.add(gold);addFaceLabel(g,'Samsung 990 PRO','M.2 2280 · NVMe',.62,.14,.05);return g}
function createGPU(b){const g=new THREE.Group(),dims=b.gpuDims||[304,137,50],L=dims[0]*SCALE,H=dims[1]*SCALE,T=dims[2]*SCALE;const isFE=b.key==='dream',isNitro=b.key==='performance';const shroud=roundedPanel(L,H,T,.10,mat(isFE?0x34383d:isNitro?0x20252b:0x171b20,.88,.18));g.add(shroud);const frontZ=T/2+.025;const fanCount=b.gpuFans||2;for(let i=0;i<fanCount;i++){const x=fanCount===2?(-L*.24+i*L*.48):(-L*.31+i*L*.31);const f=createFan(H*(fanCount===2?.32:.27),.055,isNitro?0x8e7dff:0x67dcff,isNitro);f.scale.z=.55;f.position.set(x,0,frontZ);g.add(f)}if(isFE){const a=box(L*.66,.07,.04,mat(0x969da4,.95,.14));a.rotation.z=.52;a.position.z=frontZ+.045;g.add(a);const b2=a.clone();b2.rotation.z=-.52;g.add(b2)}if(isNitro){const strip=roundedPanel(L*.82,.055,.035,.02,mat(0x20252b,.4,.2,0x8e7dff,1.8));strip.position.set(0,H*.43,frontZ+.04);g.add(strip)}const pcie=box(L*.42,.07,.025,mat(0xd2ad51,.9,.2));pcie.position.set(-L*.1,-H/2-.045,-T*.15);g.add(pcie);const bracket=box(.10,H*.95,T*.78,mat(0xaeb4ba,.95,.18));bracket.position.x=-L/2-.05;g.add(bracket);const back=roundedPanel(L*.94,H*.88,.025,.06,mat(0x252a30,.9,.2));back.position.z=-T/2-.02;g.add(back);addFaceLabel(g,b.gpu,`${dims[0]} × ${dims[1]} × ${dims[2]} mm · ${fanCount} ventilateurs`,Math.min(2.35,L*.78),.29,frontZ+.075);return g}
function createPSU(b){const g=new THREE.Group();g.add(roundedPanel(1.80,.86,1.50,.08,mat(0x0f1216,.82,.24)));const fan=createFan(.47,.07,0x67dcff,false);fan.rotation.x=Math.PI/2;fan.position.set(-.30,.47,0);g.add(fan);for(let i=0;i<5;i++){const port=roundedPanel(.18,.10,.04,.02,mat(0x050608,.3,.7));port.position.set(.56,-.18+i*.10,.77);g.add(port)}addFaceLabel(g,b.psu,'ATX · chambre arrière',1.35,.30,.77);return g}
function createAIO(){const g=new THREE.Group();for(let i=0;i<3;i++){const f=createFan(.48,.09,i===1?0x8e7dff:0x67dcff,true);f.rotation.x=Math.PI/2;f.position.set(-1.22+i*1.22,-.18,0);g.add(f)}return g}
function createPump(){const g=new THREE.Group();const p=cyl(.37,.20,mat(0x12171d,.75,.20,0x67dcff,1.15),64);p.rotation.x=Math.PI/2;g.add(p);const screen=new THREE.Mesh(new THREE.CircleGeometry(.27,48),new THREE.MeshBasicMaterial({map:labelTexture('NZXT','KRAKEN 360'),transparent:true}));screen.position.z=.115;screen.scale.y=.45;g.add(screen);const ring=new THREE.Mesh(new THREE.TorusGeometry(.30,.026,12,64),mat(0x67dcff,.25,.18,0x67dcff,1.8));ring.position.z=.12;g.add(ring);return g}
function createAirCooler(){const g=new THREE.Group();for(const x of [-.32,.32]){const tower=roundedPanel(.50,1.20,1.10,.04,mat(0xaeb5bc,.92,.18));tower.position.x=x;g.add(tower);for(let y=-.52;y<.55;y+=.08){const fin=box(.54,.012,1.13,mat(0xc8ccd0,.96,.14));fin.position.set(x,y,0);g.add(fin)}}for(let i=0;i<6;i++){const pipe=new THREE.Mesh(new THREE.TorusGeometry(.24+i*.015,.018,10,32,Math.PI),mat(0xc77b43,.92,.16));pipe.rotation.y=Math.PI/2;pipe.position.set(-.05+i*.02,-.52,-.10+i*.04);g.add(pipe)}const f=createFan(.48,.10,0x67dcff,false);f.rotation.y=Math.PI/2;f.position.z=.61;g.add(f);return g}
function createCable(points,color=0x151a20,r=.035){const o=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,r,12,false),mat(color,.2,.72));o.castShadow=true;return o}

function createGpuSupport(){const g=new THREE.Group();const rail=box(.12,1.18,.12,mat(0x20262d,.9,.18));rail.position.y=-.18;g.add(rail);const foot=box(.48,.10,.42,mat(0x11151a,.88,.24));foot.position.y=-.80;g.add(foot);const pad=box(.38,.08,.22,mat(0x3b424a,.7,.34));pad.position.set(-.12,.33,.02);g.add(pad);return g}
function createCableComb(count=4,spacing=.075){const g=new THREE.Group();for(let i=0;i<count;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.045,.012,8,24),mat(0x343b44,.75,.28));ring.rotation.x=Math.PI/2;ring.position.x=(i-(count-1)/2)*spacing;g.add(ring)}return g}
function addRealismDetails(b){for(const x of [-1.25,-.45,.35])for(const y of [-1.05,0,1.05]){const st=cyl(.035,.07,mat(0xb9a36a,.92,.18),16);st.rotation.x=Math.PI/2;st.position.set(x,y,-.70);threeRoot.add(st)}const sup=createGpuSupport();sup.position.set(1.05,-1.12,.18);threeRoot.add(sup);for(let i=0;i<5;i++)threeRoot.add(createCable([new THREE.Vector3(.72,.48,-.55+i*.018),new THREE.Vector3(1.05,.42,-.70+i*.02),new THREE.Vector3(1.33,.22,-1.18+i*.025)],i%2?0x20262c:0x0b0d10,.022));const comb=createCableComb(5,.065);comb.position.set(1.03,.39,-.72);comb.rotation.y=.45;threeRoot.add(comb);for(let i=0;i<4;i++)threeRoot.add(createCable([new THREE.Vector3(.68,-.12,.20+i*.022),new THREE.Vector3(.98,-.02,-.12+i*.02),new THREE.Vector3(1.30,.08,-.78+i*.018)],0x11151b,.025));if(b.key==='performance'||b.key==='dream'){const strip=roundedPanel(2.6,.035,.035,.012,mat(0x171b20,.35,.22,0x67dcff,1.35));strip.position.set(.15,-1.91,.88);threeRoot.add(strip)}const bar=roundedPanel(.12,2.55,.18,.035,mat(0x252b32,.86,.24));bar.position.set(.82,.05,-1.25);threeRoot.add(bar);for(let i=0;i<3;i++){const tie=box(.28,.035,.08,mat(0x39414a,.65,.35));tie.position.set(.82,.65-i*.55,-1.14);threeRoot.add(tie)}}
function buildThreePC(b){while(threeRoot.children.length)threeRoot.remove(threeRoot.children[0]);threeParts={};threeFans=[];rgbMaterials=[];selected3D=null;const caseG=createH6Flow();threeRoot.add(caseG);threeParts.case=caseG;reg('mobo',createMotherboard(b),new THREE.Vector3(-.45,.18,-.62),new THREE.Vector3(-1.0,.25,.25));reg('ram',createRAM(),new THREE.Vector3(.14,.73,-.48),new THREE.Vector3(.9,1.25,.55));reg('ssd',createSSD(),new THREE.Vector3(-.28,.20,-.46),new THREE.Vector3(.75,-.65,.60));reg('gpu',createGPU(b),new THREE.Vector3(-.05,-.55,.05),new THREE.Vector3(.80,-.25,1.25));reg('psu',createPSU(b),new THREE.Vector3(-.55,.45,-1.55),new THREE.Vector3(-1.0,-1.35,-1.85));if(b.cooling==='aio'){reg('cooler',createAIO(),new THREE.Vector3(-.02,1.88,-.08),new THREE.Vector3(-.20,2.55,.65));const pump=createPump();pump.position.set(-.58,.80,-.22);pump.userData.part='cooler';pump.traverse(x=>x.userData.part='cooler');threeRoot.add(pump);threeRoot.add(createCable([new THREE.Vector3(-.50,.84,-.12),new THREE.Vector3(.20,1.18,.05),new THREE.Vector3(.72,1.55,-.05),new THREE.Vector3(.90,1.80,-.12)],0x11151b,.045));threeRoot.add(createCable([new THREE.Vector3(-.68,.84,-.12),new THREE.Vector3(-.05,1.26,.12),new THREE.Vector3(.55,1.55,.04),new THREE.Vector3(.72,1.80,-.12)],0x11151b,.045))}else{reg('cooler',createAirCooler(),new THREE.Vector3(-.55,.82,.05),new THREE.Vector3(-.65,1.65,1.0))}threeRoot.add(createCable([new THREE.Vector3(.95,-.10,.18),new THREE.Vector3(1.28,-.02,-.10),new THREE.Vector3(1.38,.15,-.78)],0x0b0e12,.055));threeRoot.add(createCable([new THREE.Vector3(.62,.15,-.42),new THREE.Vector3(.90,.08,-.75),new THREE.Vector3(1.10,.10,-1.28)],0x11151b,.045));if(b.key==='performance'||b.key==='dream'){for(const x of [.25,1.45]){const f=createFan(.54,.10,0x67dcff,true);f.rotation.x=Math.PI/2;f.position.set(x,-1.78,.38);threeRoot.add(f)}}addRealismDetails(b);applyRgbNow()}
function updateCamera(){if(!threeCamera||!orbit.target)return;const cp=Math.cos(orbit.pitch),sp=Math.sin(orbit.pitch),cy=Math.cos(orbit.yaw),sy=Math.sin(orbit.yaw);threeCamera.position.set(orbit.target.x+orbit.dist*cp*cy,orbit.target.y+orbit.dist*sp,orbit.target.z+orbit.dist*cp*sy);threeCamera.lookAt(orbit.target)}
function initThree(){if(threeReady)return;const canvas=q('#three-canvas'),stage=q('#stage');if(typeof THREE==='undefined'){q('#three-loading').innerHTML='WebGL 3D indisponible : aperçu de secours affiché. Lance le pack via localhost et vérifie la connexion.';return}threeScene=new THREE.Scene();threeScene.fog=new THREE.FogExp2(0x06070a,.045);threeCamera=new THREE.PerspectiveCamera(34,stage.clientWidth/stage.clientHeight,.1,100);threeRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});threeRenderer.setPixelRatio(Math.min(devicePixelRatio,2));threeRenderer.setSize(stage.clientWidth,stage.clientHeight,false);threeRenderer.shadowMap.enabled=true;threeRenderer.shadowMap.type=THREE.PCFSoftShadowMap;threeRenderer.toneMapping=THREE.ACESFilmicToneMapping;threeRenderer.toneMappingExposure=1.18;threeRenderer.outputEncoding=THREE.sRGBEncoding;orbit.target=new THREE.Vector3(0,0,0);threeScene.add(new THREE.HemisphereLight(0xddeeff,0x080a0d,1.35));const key=new THREE.DirectionalLight(0xffffff,2.1);key.position.set(5,8,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);threeScene.add(key);const fill=new THREE.PointLight(0x67dcff,2.2,14);fill.position.set(2,1,4);threeScene.add(fill);const rim=new THREE.PointLight(0x8e7dff,1.8,12);rim.position.set(-3,2,-4);threeScene.add(rim);rgbLights=[fill,rim];const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0x080a0d,roughness:.55,metalness:.25}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.38;floor.receiveShadow=true;threeScene.add(floor);threeRoot=new THREE.Group();threeScene.add(threeRoot);threeRaycaster=new THREE.Raycaster();threeMouse=new THREE.Vector2();threeClock=new THREE.Clock();canvas.addEventListener('pointerdown',e=>{orbit.drag=true;orbit.x=e.clientX;orbit.y=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!orbit.drag)return;const dx=e.clientX-orbit.x,dy=e.clientY-orbit.y;orbit.x=e.clientX;orbit.y=e.clientY;orbit.yaw-=dx*.008;orbit.pitch=Math.max(-.15,Math.min(.72,orbit.pitch-dy*.006));updateCamera()});canvas.addEventListener('pointerup',e=>{orbit.drag=false;try{canvas.releasePointerCapture(e.pointerId)}catch(_){}});canvas.addEventListener('wheel',e=>{e.preventDefault();orbit.dist=Math.max(5.2,Math.min(13,orbit.dist*(1+e.deltaY*.001)));updateCamera()},{passive:false});canvas.addEventListener('dblclick',e=>{const r=canvas.getBoundingClientRect();threeMouse.x=(e.clientX-r.left)/r.width*2-1;threeMouse.y=-((e.clientY-r.top)/r.height*2-1);threeRaycaster.setFromCamera(threeMouse,threeCamera);const hits=threeRaycaster.intersectObjects(threeRoot.children,true);if(hits.length){let o=hits[0].object,id=o.userData.part;while(!id&&o.parent){o=o.parent;id=o.userData.part}if(id)selectPart(id)}});window.addEventListener('resize',resizeThree);threeReady=true;q('#three-loading').classList.add('hidden');q('#three-fallback').classList.add('hidden');updateCamera();animateThree()}
function resizeThree(){if(!threeReady)return;const stage=q('#stage');if(!stage.clientWidth||!stage.clientHeight)return;threeCamera.aspect=stage.clientWidth/stage.clientHeight;threeCamera.updateProjectionMatrix();threeRenderer.setSize(stage.clientWidth,stage.clientHeight,false)}
function animateThree(){requestAnimationFrame(animateThree);if(!threeReady)return;const dt=Math.min(.04,threeClock.getDelta()),t=performance.now()/1000;threeFans.forEach((f,i)=>f.rotation.z+=dt*(2.8+(i%3)*.28));explodeFactor+=(explodeTarget-explodeFactor)*Math.min(1,dt*5.5);Object.entries(threeParts).forEach(([id,o])=>{if(!o.userData.home)return;const h=o.userData.home,e=o.userData.explode;o.position.set(THREE.MathUtils.lerp(h.x,e.x,explodeFactor),THREE.MathUtils.lerp(h.y,e.y,explodeFactor),THREE.MathUtils.lerp(h.z,e.z,explodeFactor))});if(glassMesh){glassMesh.material.opacity=currentView==='mounted'?.10:currentView==='internal'?.018:currentView==='xray'?0:.025;glassMesh.visible=currentView!=='xray'}if(rgbOn){let c=new THREE.Color(rgbColor),power=rgbIntensity;if(rgbMode==='rainbow')c.setHSL((t*.08)%1,.88,.62);else if(rgbMode==='pulse')power=rgbIntensity*(.55+.45*(.5+.5*Math.sin(t*2.2)));else if(rgbMode==='ice')c.set('#9fe9ff');rgbMaterials.forEach((m,i)=>{if(rgbMode==='rainbow'){const cc=new THREE.Color();cc.setHSL(((t*.08)+(i*.07))%1,.9,.62);m.emissive.copy(cc)}else m.emissive.copy(c);m.emissiveIntensity=power});rgbLights.forEach((l,i)=>{l.color.copy(c);l.intensity=1.1+power*(i?0.65:0.85)})}else{rgbMaterials.forEach(m=>m.emissiveIntensity=.02);rgbLights.forEach(l=>l.intensity=.35)}threeRenderer.render(threeScene,threeCamera)}
function openLab(key){currentBuild=builds.find(x=>x.key===key);if(benchKey!==key)selectBuild(key,false);renderDetail();q('#modal').classList.add('show');q('#three-fallback').classList.remove('hidden');q('#fallback-pc').style.setProperty('--rgb',q('#rgb-color').value);setTimeout(()=>{initThree();if(threeReady){buildThreePC(currentBuild);resizeThree();setView('mounted');resetCamera3D()}},80)}
function renderDetail(){const b=currentBuild,fps=baseFps(b);q('#detail').innerHTML=`<div class="tag">${b.tier} · BUILD LAB V9</div><h3>${b.case} RGB</h3><div class="bigprice">≈ ${adjustedPrice(b).toLocaleString('fr-FR')} €</div><div class="desc"><b>Montage basé sur des références réelles.</b> H6 Flow : 435 × 287 × 415 mm. Carte mère ATX 304,8 × 243,84 mm, GPU horizontal sur le premier PCIe x16, alimentation dans la seconde chambre et Kraken 360 au plafond quand le build utilise un AIO. Le modèle GPU change réellement selon la configuration.</div><div class="component-photo-strip"><div class="component-photo"><img src="${b.gpuImg}" alt="${b.gpu}" onerror="safe(this,'GPU')"><span>GPU réel</span></div><div class="component-photo"><img src="${b.moboImg}" alt="${b.mobo}" onerror="safe(this,'CM')"><span>Carte mère</span></div><div class="component-photo"><img src="${b.coolerImg}" alt="${b.cooler}" onerror="safe(this,'COOLING')"><span>Cooling</span></div></div><div class="lab-perf"><div><b>${Math.round(fps)} FPS</b><span>${games[game].name} · ${selRes}</span></div><div><b>${b.ram.split(' ')[0]} Go</b><span>mémoire système</span></div><div><b>${mon().hz} Hz</b><span>écran sélectionné</span></div></div><div class="titleline">Composants du montage</div><div class="parts">${partRow('gpu','GPU',b.gpu,b.gpuImg)}${partRow('cpu','CPU',b.cpu,b.cpuImg)}${partRow('mobo','Carte mère',b.mobo,b.moboImg)}${partRow('ram','RAM',b.ram,b.ramImg)}${partRow('ssd','SSD',b.ssd,b.ssdImg)}${partRow('cooler','Refroidissement',b.cooler,b.coolerImg)}${partRow('psu','Alimentation',b.psu,b.psuImg)}${partRow('fans','Airflow','3 × NZXT F120 RGB Core inclinés + arrière/bas','')}</div><div class="part-detail" id="part-detail"></div><div class="method">Le BuildLab V7 reconstruit les composants à leurs dimensions principales et reproduit leur architecture visuelle (nombre de ventilateurs, format, position, refroidissement, RGB). Ce n’est pas un fichier CAO officiel du fabricant.</div>`}
function partRow(id,label,name,img){return `<div class="part" data-row="${id}" onclick="selectPart('${id}')"><div>${img?`<img src="${img}" alt="${name}" onerror="safe(this,'${label}')">`:''}</div><div><b>${name}</b><span>${label}</span></div><em>LOCALISER</em></div>`}
function selectPart(id){selected3D=id;qa('.part').forEach(x=>x.classList.toggle('active',x.dataset.row===id));const obj=threeParts[id],el=q('#part-detail');if(el){el.classList.add('show');el.innerHTML=`<b>${id.toUpperCase()}</b><p>${partDesc[id]||''}</p>`}if(obj&&orbit.target){const wp=new THREE.Vector3();obj.getWorldPosition(wp);orbit.target.lerp(wp,.55);updateCamera()}}
function setView(v){currentView=v;explodeTarget=v==='exploded'?1:0;qa('.view-tabs .lab-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v))}
function resetCamera3D(){if(!threeReady)return;orbit.yaw=.70;orbit.pitch=.22;orbit.dist=8.2;orbit.target.set(0,0,0);updateCamera()}
function applyRgbNow(){if(!threeReady)return;const c=new THREE.Color(rgbColor);rgbMaterials.forEach(m=>{m.emissive.copy(c);m.emissiveIntensity=rgbOn?rgbIntensity:.02});rgbLights.forEach(l=>{l.color.copy(c);l.intensity=rgbOn?1.6:.35})}
qa('.view-tabs .lab-btn').forEach(b=>b.onclick=()=>setView(b.dataset.view));q('#rgb-btn').onclick=()=>{rgbOn=!rgbOn;q('#rgb-btn').classList.toggle('active',rgbOn);q('#rgb-btn').textContent=rgbOn?'RGB ON':'RGB OFF';applyRgbNow()};q('#rgb-mode').onchange=e=>{rgbMode=e.target.value;q('#rgb-readout').textContent=rgbMode.toUpperCase();applyRgbNow()};q('#rgb-color').oninput=e=>{rgbColor=parseInt(e.target.value.slice(1),16);q('#fallback-pc').style.setProperty('--rgb',e.target.value);applyRgbNow()};q('#rgb-intensity').oninput=e=>{rgbIntensity=parseFloat(e.target.value);applyRgbNow()};q('#reset-btn').onclick=resetCamera3D;q('#zoom-in').onclick=()=>{if(threeReady){orbit.dist=Math.max(5.2,orbit.dist*.88);updateCamera()}};q('#zoom-out').onclick=()=>{if(threeReady){orbit.dist=Math.min(13,orbit.dist*1.12);updateCamera()}};q('#close').onclick=()=>q('#modal').classList.remove('show');q('#modal').onclick=e=>{if(e.target.id==='modal')q('#modal').classList.remove('show')};document.addEventListener('keydown',e=>{if(e.key==='Escape')q('#modal').classList.remove('show')});


// ===== V9 MODULAR EXPLODED 3D =====
// Le V9 revient à de vrais objets Three.js indépendants : chaque composant est un groupe séparé,
// possède une position montée + une position éclatée, et chaque tier utilise un boîtier/layout différent.

function createGlassMaterial(op=.10){return new THREE.MeshPhysicalMaterial({color:0x9fdcff,transparent:true,opacity:op,roughness:.035,metalness:0,transmission:.82,thickness:.045,side:THREE.DoubleSide,depthWrite:false})}
function addCaseFrame(g,D,H,W,opts={}){const steel=mat(opts.steel||0x11161d,.88,.24),edge=mat(opts.edge||0x313943,.9,.2);const bottom=roundedPanel(D-.08,.12,W-.08,.045,steel);bottom.rotation.x=Math.PI/2;bottom.position.y=-H/2+.06;g.add(bottom);const top=roundedPanel(D-.08,.12,W-.08,.045,steel);top.rotation.x=Math.PI/2;top.position.y=H/2-.06;g.add(top);const rear=box(.10,H-.16,W-.10,steel);rear.position.x=-D/2+.055;g.add(rear);for(const x of [-D/2+.06,D/2-.06])for(const y of [-H/2+.06,H/2-.06]){const beam=box(.085,.085,W-.08,edge);beam.position.set(x,y,0);g.add(beam)}return {steel,edge}}
function addCaseFan(g,x,y,z,r=.48,rotY=0,rotX=0,rgb=true,accent=0x67dcff){const f=createFan(r,.10,accent,rgb);f.rotation.y=rotY;f.rotation.x=rotX;f.position.set(x,y,z);g.add(f);return f}

function createNorthCase(){const g=new THREE.Group(),D=4.47,H=4.69,W=2.15;g.userData.part='case';addCaseFrame(g,D,H,W,{steel:0x151719,edge:0x35383b});const tray=roundedPanel(3.35,3.78,.07,.05,mat(0x222629,.78,.34));tray.position.set(-.20,.05,-.72);g.add(tray);const wood=mat(0x7a4f2c,.18,.62);for(let i=0;i<12;i++){const slat=roundedPanel(.12,H-1.0,.10,.025,wood);slat.position.set(D/2-.02,-.05,-.78+i*.14);slat.rotation.y=Math.PI/2;g.add(slat)}addCaseFan(g,1.94,.68,-.38,.56,-Math.PI/2,0,false,0xc99b67);addCaseFan(g,1.94,-.63,-.38,.56,-Math.PI/2,0,false,0xc99b67);addCaseFan(g,-2.12,1.18,.18,.46,Math.PI/2,0,false);glassMesh=null;const mesh=roundedPanel(.06,H-1.0,W-.30,.02,new THREE.MeshStandardMaterial({color:0x1a1c1e,roughness:.82,metalness:.25,transparent:true,opacity:.72}));mesh.position.x=D/2-.08;g.add(mesh);return g}

function createH6Case(){return createH6Flow()}

function createO11Case(){const g=new THREE.Group(),D=4.78,H=4.71,W=2.90;g.userData.part='case';addCaseFrame(g,D,H,W,{steel:0x101318,edge:0x3c424a});const tray=roundedPanel(3.30,3.82,.07,.05,mat(0x20252b,.82,.28));tray.position.set(-.45,.05,-.83);g.add(tray);glassMesh=null;for(let i=0;i<3;i++)addCaseFan(g,1.72,1.28-i*1.22,-.62,.49,-Math.PI/2,0,true,0x8e7dff);for(let i=0;i<3;i++)addCaseFan(g,-.25,-1.98,-.15+i*.78,.48,0,Math.PI/2,true,0x67dcff);const strip1=roundedPanel(D-.38,.045,.045,.015,mat(0x181c22,.3,.2,0x8e7dff,1.8));strip1.position.set(0,H/2-.13,W/2-.10);g.add(strip1);const strip2=strip1.clone();strip2.position.y=-H/2+.13;g.add(strip2);return g}

function createY70Case(){const g=new THREE.Group(),D=4.70,H=4.70,W=3.20;g.userData.part='case';addCaseFrame(g,D,H,W,{steel:0x111318,edge:0x444a53});const tray=roundedPanel(3.25,3.78,.07,.05,mat(0x24282f,.82,.27));tray.position.set(-.48,.05,-.92);g.add(tray);glassMesh=null;for(let i=0;i<3;i++)addCaseFan(g,1.52,1.22-i*1.18,-.58,.49,-Math.PI/2,0,true,0xff4bd8);for(let i=0;i<3;i++)addCaseFan(g,-.25,-1.98,-.35+i*.78,.48,0,Math.PI/2,true,0x67dcff);const riser=roundedPanel(2.30,.06,.16,.02,mat(0x2a3038,.8,.25));riser.position.set(.05,-.78,.48);g.add(riser);return g}

function createCaseForBuild(b){if(b.caseType==='north')return createNorthCase();if(b.caseType==='o11')return createO11Case();if(b.caseType==='y70')return createY70Case();return createH6Case()}

// Carte mère adaptée au format réel de la configuration (mATX pour Smart, ATX pour les autres).
createMotherboard=function(b){const g=new THREE.Group();const mw=b.moboFormat==='mATX'?2.44:2.438,mh=b.moboFormat==='mATX'?2.44:3.048;g.add(roundedPanel(mw,mh,.055,.035,mat(0x090d10,.28,.66)));for(let i=0;i<12;i++){const tr=box(.012,.55+Math.random()*.75,.012,mat(i%3?0x3b4349:0xc7a64b,.45,.48));tr.position.set(-mw*.40+i*(mw*.072),-.40+Math.sin(i)*.38,.045);tr.rotation.z=(i%2?-.18:.22);g.add(tr)}const io=roundedPanel(.40,.94,.20,.05,mat(0x3b4249,.9,.18));io.position.set(-mw*.39,mh*.30,.13);g.add(io);const vrm1=roundedPanel(.98,.30,.18,.05,mat(0x3b4249,.92,.18));vrm1.position.set(.05,mh*.39,.14);g.add(vrm1);const vrm2=roundedPanel(.30,.95,.18,.05,mat(0x343b42,.92,.18));vrm2.position.set(-mw*.27,mh*.23,.14);g.add(vrm2);for(let i=0;i<4;i++){const sl=roundedPanel(.075,1.12,.06,.02,mat(0x15191e,.55,.48));sl.position.set(mw*.20+i*.12,mh*.17,.08);g.add(sl)}for(let i=0;i<(b.moboFormat==='mATX'?2:3);i++){const sl=roundedPanel(mw*.70,.06,.065,.015,mat(i===0?0xd6d9dc:0x222831,.65,.32));sl.position.set(.02,-mh*.12-i*.38,.09);g.add(sl)}const chip=roundedPanel(.52,.52,.16,.06,mat(0x30363d,.9,.18));chip.position.set(mw*.29,-mh*.34,.14);g.add(chip);addFaceLabel(g,b.mobo,`${b.moboFormat} · AM5`,Math.min(1.72,mw*.72),.30,.21);return g}

function createCPU(b){const g=new THREE.Group();const pcb=roundedPanel(.44,.44,.045,.035,mat(0x16351f,.18,.64));g.add(pcb);const ihs=roundedPanel(.36,.36,.055,.025,mat(0xc9cdd1,.98,.10));ihs.position.z=.05;g.add(ihs);addFaceLabel(g,b.cpu,'AMD AM5',.34,.12,.085);return g}
function createRAMForBuild(b){const g=new THREE.Group();for(let i=0;i<2;i++){const body=roundedPanel(.10,1.18,.23,.025,mat(0x171c22,.72,.25));body.position.x=i*.15;g.add(body);for(let y=-.42;y<.45;y+=.22){const chip=box(.025,.14,.19,mat(0x080a0d,.35,.55));chip.position.set(i*.15,y,.01);g.add(chip)}if(b.ramRgb){const led=roundedPanel(.105,1.12,.035,.018,mat(0x1d242c,.25,.22,i?0x8e7dff:0x67dcff,1.6));led.position.set(i*.15,0,.135);g.add(led)}}return g}
function createSSDForBuild(b){const g=createSSD();g.children.filter(x=>x.material&&x.material.map).forEach(()=>{});return g}

function homeLayout(b){
 if(b.caseType==='north')return {mobo:[-.40,.20,-.63],cpu:[-.47,.74,-.40],ram:[.16,.65,-.48],ssd:[-.22,.02,-.45],gpu:[-.02,-.62,.02],psu:[.78,-1.55,-.86],cooler:[-.48,.80,.02]};
 if(b.caseType==='o11')return {mobo:[-.48,.18,-.72],cpu:[-.55,.74,-.48],ram:[.16,.70,-.57],ssd:[-.25,.05,-.54],gpu:[-.02,-.58,.08],psu:[.78,.30,-1.55],cooler:[-.05,1.92,-.12]};
 if(b.caseType==='y70')return {mobo:[-.52,.18,-.82],cpu:[-.59,.74,-.58],ram:[.12,.70,-.66],ssd:[-.28,.05,-.62],gpu:[.08,-.62,.45],psu:[.80,.30,-1.72],cooler:[-.05,1.92,-.16]};
 return {mobo:[-.45,.18,-.62],cpu:[-.52,.74,-.38],ram:[.14,.73,-.48],ssd:[-.28,.20,-.46],gpu:[-.05,-.55,.05],psu:[-.55,.45,-1.55],cooler:[-.02,1.88,-.08]};
}
function explodedLayout(b){
 const wide=b.caseType==='y70'||b.caseType==='o11';
 return {mobo:new THREE.Vector3(-2.65,.30,.15),cpu:new THREE.Vector3(-1.55,2.25,1.05),ram:new THREE.Vector3(.55,2.45,1.20),ssd:new THREE.Vector3(2.25,-1.55,1.15),gpu:new THREE.Vector3(2.65,-.15,1.35),psu:new THREE.Vector3(-2.45,-1.85,-.35),cooler:new THREE.Vector3(wide?.10:-.25,3.05,.75)};
}

function addMountedCooling(b,h,ex){if(b.cooling==='aio'){reg('cooler',createAIO(),new THREE.Vector3(...h.cooler),ex.cooler);const pump=createPump();pump.position.set(h.cpu[0],h.cpu[1]+.04,h.cpu[2]+.30);pump.userData.part='cooler';pump.traverse(x=>x.userData.part='cooler');threeRoot.add(pump);threeRoot.add(createCable([new THREE.Vector3(h.cpu[0]+.06,h.cpu[1]+.08,h.cpu[2]+.26),new THREE.Vector3(.10,1.18,.12),new THREE.Vector3(.72,1.58,-.02),new THREE.Vector3(.88,1.84,-.10)],0x11151b,.045));threeRoot.add(createCable([new THREE.Vector3(h.cpu[0]-.08,h.cpu[1]+.08,h.cpu[2]+.26),new THREE.Vector3(-.12,1.26,.16),new THREE.Vector3(.48,1.58,.06),new THREE.Vector3(.68,1.84,-.10)],0x11151b,.045))}else reg('cooler',createAirCooler(),new THREE.Vector3(...h.cooler),ex.cooler)}

function buildModularPC(b){
 while(threeRoot.children.length)threeRoot.remove(threeRoot.children[0]);threeParts={};threeFans=[];rgbMaterials=[];selected3D=null;glassMesh=null;q('#stage').classList.remove('photo3d');q('#lab-view').classList.remove('show-hotspots');
 const caseG=createCaseForBuild(b);caseG.userData.part='case';threeRoot.add(caseG);threeParts.case=caseG;
 const h=homeLayout(b),ex=explodedLayout(b);
 reg('mobo',createMotherboard(b),new THREE.Vector3(...h.mobo),ex.mobo);
 reg('cpu',createCPU(b),new THREE.Vector3(...h.cpu),ex.cpu);
 reg('ram',createRAMForBuild(b),new THREE.Vector3(...h.ram),ex.ram);
 reg('ssd',createSSDForBuild(b),new THREE.Vector3(...h.ssd),ex.ssd);
 const gpu=createGPU(b); if(b.caseType==='y70'){gpu.position.z+=.35} reg('gpu',gpu,new THREE.Vector3(...h.gpu),ex.gpu);
 reg('psu',createPSU(b),new THREE.Vector3(...h.psu),ex.psu);
 addMountedCooling(b,h,ex);
 // câblage propre et support GPU, seulement visible en vue montée/interne
 threeRoot.add(createCable([new THREE.Vector3(.90,-.12,.18),new THREE.Vector3(1.22,-.02,-.18),new THREE.Vector3(1.34,.15,-.82)],0x0b0e12,.052));
 threeRoot.add(createCable([new THREE.Vector3(.58,.15,-.42),new THREE.Vector3(.88,.08,-.78),new THREE.Vector3(1.08,.10,-1.28)],0x11151b,.042));
 addRealismDetails(b);applyRgbNow();q('#three-loading').classList.add('hidden');q('#three-fallback').classList.add('hidden');setView(currentView||'mounted')
}
buildThreePC=buildModularPC;

updateCamera=function(){if(!threeCamera||!orbit.target)return;const cp=Math.cos(orbit.pitch),sp=Math.sin(orbit.pitch),cy=Math.cos(orbit.yaw),sy=Math.sin(orbit.yaw);threeCamera.position.set(orbit.target.x+orbit.dist*cp*cy,orbit.target.y+orbit.dist*sp,orbit.target.z+orbit.dist*cp*sy);threeCamera.lookAt(orbit.target)};
resetCamera3D=function(){if(!threeReady)return;orbit.yaw=.72;orbit.pitch=.20;orbit.dist=currentBuild&&currentBuild.caseType==='y70'?9.4:8.6;orbit.target.set(0,0,0);updateCamera()};
setView=function(v){currentView=v;explodeTarget=v==='exploded'?1:0;qa('.view-tabs .lab-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===v));if(glassMesh){glassMesh.visible=v!=='xray';glassMesh.material.opacity=v==='mounted'?.09:v==='internal'?.025:v==='exploded'?.035:0}if(v==='internal')orbit.dist=Math.min(orbit.dist,7.3);if(v==='exploded')orbit.dist=Math.max(orbit.dist,10.5);updateCamera()};

animateThree=function(){requestAnimationFrame(animateThree);if(!threeReady)return;const dt=Math.min(.04,threeClock.getDelta()),t=performance.now()/1000;threeFans.forEach((f,i)=>f.rotation.z+=dt*(2.6+(i%3)*.30));explodeFactor+=(explodeTarget-explodeFactor)*Math.min(1,dt*5.2);Object.entries(threeParts).forEach(([id,o])=>{if(!o.userData.home)return;const h=o.userData.home,e=o.userData.explode;o.position.set(THREE.MathUtils.lerp(h.x,e.x,explodeFactor),THREE.MathUtils.lerp(h.y,e.y,explodeFactor),THREE.MathUtils.lerp(h.z,e.z,explodeFactor))});if(rgbOn){let c=new THREE.Color(rgbColor),power=rgbIntensity;if(rgbMode==='rainbow')c.setHSL((t*.08)%1,.88,.62);else if(rgbMode==='pulse')power=rgbIntensity*(.55+.45*(.5+.5*Math.sin(t*2.2)));else if(rgbMode==='ice')c.set('#9fe9ff');rgbMaterials.forEach((m,i)=>{if(rgbMode==='rainbow'){const cc=new THREE.Color();cc.setHSL(((t*.08)+(i*.07))%1,.9,.62);m.emissive.copy(cc)}else m.emissive.copy(c);m.emissiveIntensity=power});rgbLights.forEach((l,i)=>{l.color.copy(c);l.intensity=1.0+power*(i?.62:.82)})}else{rgbMaterials.forEach(m=>m.emissiveIntensity=.02);rgbLights.forEach(l=>l.intensity=.32)}threeRenderer.render(threeScene,threeCamera)};

selectPart=function(id){selected3D=id;qa('.part').forEach(x=>x.classList.toggle('active',x.dataset.row===id));const el=q('#part-detail');if(el){el.classList.add('show');const b=currentBuild;const names={gpu:b.gpu,cpu:b.cpu,mobo:b.mobo,ram:b.ram,ssd:b.ssd,cooler:b.cooler,psu:b.psu,case:b.case,fans:'Ventilation du boîtier'};const desc=id==='case'?`${b.case} · ${b.caseDims.join(' × ')} mm · boîtier propre à la configuration ${b.tier}.`:(partDesc[id]||'');el.innerHTML=`<b>${names[id]||id.toUpperCase()}</b><p>${desc}</p>`}const obj=threeParts[id];if(obj&&orbit.target){const wp=new THREE.Vector3();obj.getWorldPosition(wp);orbit.target.lerp(wp,.38);orbit.dist=Math.max(5.6,orbit.dist*.88);updateCamera()}};

renderDetail=function(){const b=currentBuild,fps=baseFps(b),dims=b.caseDims;const airflow=b.caseModel?b.caseModel.fanText:b.caseType==='north'?'2 × 140 mm avant + 1 arrière':b.caseType==='h6'?'3 × 120 mm inclinés + arrière':b.caseType==='o11'?'3 latéraux + 3 bas + RGB châssis':'3 latéraux + 3 bas · vitrine panoramique';q('#detail').innerHTML=`<div class="tag">${b.tier} · BUILD LAB V10 STUDIO</div><h3>${b.case}</h3><div class="bigprice">≈ ${adjustedPrice(b).toLocaleString('fr-FR')} €</div><div class="desc"><b>Cette proposition est un PC différent des trois autres.</b> Le boîtier, le montage, le refroidissement et les composants changent selon le niveau. En vue Éclatée, les pièces pivotent puis se déposent sur un plan de travail comme lors d’un véritable démontage.</div><div class="explode-legend"><span>BOÎTIER · ${dims[0]} × ${dims[1]} × ${dims[2]} mm</span><span>AIRFLOW · ${airflow}</span><span>GPU · ${b.gpuDims.join(' × ')} mm</span><span>CM · ${b.moboFormat}</span></div><div class="component-photo-strip"><div class="component-photo"><img src="${b.gpuImg}" alt="${b.gpu}" onerror="safe(this,'GPU')"><span>GPU recommandé</span></div><div class="component-photo"><img src="${b.moboImg}" alt="${b.mobo}" onerror="safe(this,'CM')"><span>Carte mère</span></div><div class="component-photo"><img src="${b.coolerImg}" alt="${b.cooler}" onerror="safe(this,'COOLING')"><span>Cooling</span></div></div><div class="lab-perf"><div><b>${Math.round(fps)} FPS</b><span>${games[game].name} · ${selRes}</span></div><div><b>${b.ram.split(' ')[0]} Go</b><span>mémoire système</span></div><div><b>${mon().hz} Hz</b><span>écran sélectionné</span></div></div><div class="titleline">Composants dissociables</div><div class="parts">${partRow('case','Boîtier',b.case,b.caseImg)}${partRow('gpu','GPU',b.gpu,b.gpuImg)}${partRow('cpu','CPU',b.cpu,b.cpuImg)}${partRow('mobo','Carte mère',b.mobo,b.moboImg)}${partRow('ram','RAM',b.ram,b.ramImg)}${partRow('ssd','SSD',b.ssd,b.ssdImg)}${partRow('cooler','Refroidissement',b.cooler,b.coolerImg)}${partRow('psu','Alimentation',b.psu,b.psuImg)}</div><div class="part-detail" id="part-detail"></div><div class="method"><b>V10 : présentation éclatée en studio.</b> Les composants sont des maillages WebGL indépendants, animés entre leur emplacement monté et une disposition de démontage au sol. Le radiateur est désormais ajouré et les câbles internes sont masqués pendant la séparation pour éviter toute intersection visuelle.</div>`};

// Miniatures : silhouette/layout différent pour chaque proposition, sans réutiliser la même photo.
drawBuildThumbs=function(){qa('.build-thumb-canvas').forEach(c=>{const b=builds.find(x=>x.key===c.dataset.build),dpr=Math.min(devicePixelRatio||1,2),w=c.clientWidth||280,h=c.clientHeight||170;c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);const grad=x.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#111823');grad.addColorStop(1,'#07090d');x.fillStyle=grad;x.fillRect(0,0,w,h);const rgb='#'+(b.theme||0x67dcff).toString(16).padStart(6,'0');const layouts={north:[.20,.08,.62,.84],h6:[.16,.08,.68,.84],o11:[.13,.07,.74,.86],y70:[.12,.06,.76,.88]},L=layouts[b.caseType]||layouts.h6;x.save();x.translate(w*L[0],h*L[1]);const cw=w*L[2],ch=h*L[3];x.fillStyle='rgba(15,19,25,.98)';x.strokeStyle='#45515e';x.lineWidth=2;x.beginPath();x.roundRect(0,0,cw,ch,b.caseType==='y70'?16:10);x.fill();x.stroke();if(b.caseType==='north'){x.fillStyle='#79502f';for(let i=0;i<9;i++)x.fillRect(cw*.88+i*2.2,ch*.08,1.3,ch*.82)}else{x.fillStyle='rgba(115,204,255,.055)';x.fillRect(cw*.05,ch*.06,cw*.86,ch*.86)}x.fillStyle='#17211f';x.fillRect(cw*.20,ch*.18,cw*.43,ch*.48);x.fillStyle='#303945';x.fillRect(cw*.16,ch*.57,cw*.60,ch*.17);const fans=b.gpuFans||2;for(let i=0;i<fans;i++){const fx=cw*(.27+i*(.40/Math.max(1,fans-1))),fy=ch*.65,r=ch*.055;x.beginPath();x.arc(fx,fy,r,0,Math.PI*2);x.strokeStyle='#7c8793';x.lineWidth=3;x.stroke();x.shadowColor=rgb;x.shadowBlur=12;x.beginPath();x.arc(fx,fy,r*.76,0,Math.PI*2);x.strokeStyle=rgb;x.lineWidth=1.5;x.stroke();x.shadowBlur=0}const cf=b.caseType==='north'?2:3;for(let i=0;i<cf;i++){const fx=cw*.87,fy=ch*(cf===2?.32+i*.30:.22+i*.24),r=ch*.065;x.beginPath();x.arc(fx,fy,r,0,Math.PI*2);x.strokeStyle='#515c68';x.lineWidth=4;x.stroke();x.shadowColor=rgb;x.shadowBlur=14;x.beginPath();x.arc(fx,fy,r*.72,0,Math.PI*2);x.strokeStyle=rgb;x.lineWidth=2;x.stroke();x.shadowBlur=0}if(b.cooling==='aio'){x.fillStyle='#252d36';x.fillRect(cw*.17,ch*.08,cw*.60,ch*.07)}if(b.caseType==='o11'){x.strokeStyle=rgb;x.lineWidth=2;x.strokeRect(cw*.08,ch*.03,cw*.84,ch*.92)}if(b.caseType==='y70'){x.strokeStyle='rgba(255,255,255,.24)';x.beginPath();x.moveTo(cw*.78,0);x.lineTo(cw,cw*.18);x.lineTo(cw,ch);x.stroke()}x.restore();x.fillStyle='rgba(255,255,255,.78)';x.font='600 8px JetBrains Mono, monospace';x.fillText(b.case+' · '+b.gpu.replace('SAPPHIRE ','').slice(0,25),10,h-10)})};

// ===== V10 STUDIO EXPLODED VIEW =====
// Composition inspirée d'un véritable démontage produit : boîtier à gauche,
// composants posés sur le sol à droite, rotations physiques et éclairage studio.
let studioExplodedExtras=null;
function setStudioPose(o,rot=[0,0,0],scale=1){
 const e=new THREE.Euler(rot[0],rot[1],rot[2],'XYZ');
 o.userData.homeQuat=o.quaternion.clone();o.userData.explodeQuat=new THREE.Quaternion().setFromEuler(e);
 o.userData.homeScale=o.scale.clone();o.userData.explodeScale=new THREE.Vector3(scale,scale,scale);return o
}
function createStudioAIO(){
 const g=new THREE.Group(),black=mat(0x11151a,.72,.36),fin=mat(0x343a40,.78,.32);
 // Un radiateur ajouré : deux rails et des ailettes, sans grande plaque pleine.
 for(const y of [-.56,.56]){const rail=roundedPanel(3.62,.10,.18,.025,black);rail.position.set(0,y,-.06);g.add(rail)}
 for(let i=0;i<34;i++){const rib=box(.035,1.02,.12,fin);rib.position.set(-1.70+i*.103,0,-.06);g.add(rib)}
 for(let i=0;i<3;i++){const f=createFan(.48,.09,i===1?0x8e7dff:0x67dcff,true);f.rotation.x=Math.PI/2;f.position.set(-1.22+i*1.22,-.05,.04);g.add(f)}
 return g
}
function createStudioCooler(b,h){
 if(b.cooling!=='aio')return createAirCooler();
 const g=createStudioAIO(),pump=createPump();
 pump.position.set(h.cpu[0]-h.cooler[0],h.cpu[1]-h.cooler[1]+.04,h.cpu[2]-h.cooler[2]+.30);g.add(pump);
 const p1=new THREE.Vector3(pump.position.x+.08,pump.position.y,pump.position.z-.02),p2=new THREE.Vector3(.42,-.44,.12),p3=new THREE.Vector3(1.02,-.18,.02);
 const p4=new THREE.Vector3(pump.position.x-.08,pump.position.y,pump.position.z-.02),p5=new THREE.Vector3(.15,-.36,.18),p6=new THREE.Vector3(.72,-.18,.02);
 g.add(createCable([p1,p2,p3],0x090b0e,.045));g.add(createCable([p4,p5,p6],0x11151b,.045));return g
}
function createExplodedHardware(){
 const g=new THREE.Group(),steel=mat(0x68717a,.92,.20),brass=mat(0xb79648,.88,.20);
 for(let i=0;i<12;i++){const screw=cyl(.035,.10,i<4?brass:steel,14);screw.position.set((i%6)*.18,0,Math.floor(i/6)*.22);g.add(screw)}
 const bracket=box(.85,.055,.12,steel);bracket.position.set(.45,.025,.58);g.add(bracket);
 g.position.set(1.12,-2.31,-.28);g.visible=false;return g
}
function studioLayout(b){
 const wide=b.caseType==='o11'||b.caseType==='y70';
 return {
  case:new THREE.Vector3(-3.55,-.04,-.55),
  mobo:new THREE.Vector3(3.18,-2.30,-.72),
  cpu:new THREE.Vector3(-.92,-2.31,1.25),
  ram:new THREE.Vector3(.34,-2.29,1.55),
  ssd:new THREE.Vector3(-.92,-2.32,1.92),
  gpu:new THREE.Vector3(2.62,-2.15,1.55),
  psu:new THREE.Vector3(.20,-1.93,-1.48),
  cooler:new THREE.Vector3(.48,-2.28,-.05),
  caseScale:wide?.83:.88
 }
}
buildModularPC=function(b){
 while(threeRoot.children.length)threeRoot.remove(threeRoot.children[0]);threeParts={};threeFans=[];rgbMaterials=[];selected3D=null;glassMesh=null;studioExplodedExtras=null;
 q('#stage').classList.remove('photo3d');q('#lab-view').classList.remove('show-hotspots');
 const h=homeLayout(b),ex=studioLayout(b),caseG=createCaseForBuild(b);
 reg('case',caseG,new THREE.Vector3(0,0,0),ex.case);setStudioPose(caseG,[0,.10,0],ex.caseScale);
 const mobo=reg('mobo',createMotherboard(b),new THREE.Vector3(...h.mobo),ex.mobo);setStudioPose(mobo,[-Math.PI/2,0,.05],1.03);
 const cpu=reg('cpu',createCPU(b),new THREE.Vector3(...h.cpu),ex.cpu);setStudioPose(cpu,[-Math.PI/2,0,-.08],1.45);
 const ram=reg('ram',createRAMForBuild(b),new THREE.Vector3(...h.ram),ex.ram);setStudioPose(ram,[-Math.PI/2,0,Math.PI/2],1.15);
 const ssd=reg('ssd',createSSDForBuild(b),new THREE.Vector3(...h.ssd),ex.ssd);setStudioPose(ssd,[-Math.PI/2,0,-.05],1.35);
 const gpuMesh=createGPU(b);if(b.caseType==='y70')gpuMesh.position.z+=.35;
 const gpu=reg('gpu',gpuMesh,new THREE.Vector3(...h.gpu),ex.gpu);setStudioPose(gpu,[-Math.PI/2,0,-.05],.92);
 const psu=reg('psu',createPSU(b),new THREE.Vector3(...h.psu),ex.psu);setStudioPose(psu,[0,-.12,0],.92);
 const cooler=reg('cooler',createStudioCooler(b,h),new THREE.Vector3(...h.cooler),ex.cooler);setStudioPose(cooler,b.cooling==='aio'?[0,.06,0]:[0,.2,0],b.cooling==='aio'?.82:.92);
 // Détails montés : ils disparaissent pendant le démontage pour ne pas traverser les pièces.
 const before=new Set(threeRoot.children);
 const c1=createCable([new THREE.Vector3(.90,-.12,.18),new THREE.Vector3(1.22,-.02,-.18),new THREE.Vector3(1.34,.15,-.82)],0x0b0e12,.052);threeRoot.add(c1);
 const c2=createCable([new THREE.Vector3(.58,.15,-.42),new THREE.Vector3(.88,.08,-.78),new THREE.Vector3(1.08,.10,-1.28)],0x11151b,.042);threeRoot.add(c2);addRealismDetails(b);
 threeRoot.children.forEach(o=>{if(!before.has(o)&&!Object.values(threeParts).includes(o))o.userData.mountedOnly=true});
 studioExplodedExtras=createExplodedHardware();threeRoot.add(studioExplodedExtras);
 applyRgbNow();q('#three-loading').classList.add('hidden');q('#three-fallback').classList.add('hidden');setView(currentView||'mounted')
};
buildThreePC=buildModularPC;

animateThree=function(){
 requestAnimationFrame(animateThree);if(!threeReady)return;
 if(document.hidden||!q('#modal').classList.contains('show')){threeClock.getDelta();return;}
 const dt=Math.min(.04,threeClock.getDelta()),t=performance.now()/1000;
 threeFans.forEach((f,i)=>f.rotation.z+=dt*(2.15+(i%3)*.24));explodeFactor+=(explodeTarget-explodeFactor)*Math.min(1,dt*3.8);
 Object.values(threeParts).forEach(o=>{if(!o.userData.home)return;const h=o.userData.home,e=o.userData.explode;o.position.lerpVectors(h,e,explodeFactor);if(o.userData.homeQuat&&o.userData.explodeQuat)THREE.Quaternion.slerp(o.userData.homeQuat,o.userData.explodeQuat,o.quaternion,explodeFactor);if(o.userData.homeScale)o.scale.lerpVectors(o.userData.homeScale,o.userData.explodeScale,explodeFactor)});
 threeRoot.children.forEach(o=>{if(o.userData.mountedOnly)o.visible=explodeFactor<.18});if(studioExplodedExtras)studioExplodedExtras.visible=explodeFactor>.72;
 if(rgbOn){let c=new THREE.Color(rgbColor),power=rgbIntensity;if(rgbMode==='rainbow')c.setHSL((t*.08)%1,.88,.62);else if(rgbMode==='pulse')power=rgbIntensity*(.55+.45*(.5+.5*Math.sin(t*2.2)));else if(rgbMode==='ice')c.set('#9fe9ff');rgbMaterials.forEach((m,i)=>{if(rgbMode==='rainbow'){const cc=new THREE.Color();cc.setHSL(((t*.08)+(i*.07))%1,.9,.62);m.emissive.copy(cc)}else m.emissive.copy(c);m.emissiveIntensity=power});rgbLights.forEach((l,i)=>{l.color.copy(c);l.intensity=.85+power*(i?.48:.65)})}else{rgbMaterials.forEach(m=>m.emissiveIntensity=.02);rgbLights.forEach(l=>l.intensity=.28)}threeRenderer.render(threeScene,threeCamera)
};
setView=function(v){
 currentView=v;explodeTarget=v==='exploded'?1:0;qa('.view-tabs .lab-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===v));
 if(!threeReady)return;if(v==='exploded'){orbit.target.set(.05,-.72,.15);orbit.yaw=.78;orbit.pitch=.50;orbit.dist=13.0}else if(v==='internal'){orbit.target.set(0,.05,0);orbit.pitch=.22;orbit.dist=7.2}else if(v==='xray'){orbit.target.set(0,0,0);orbit.pitch=.20;orbit.dist=8.4}else{orbit.target.set(0,0,0);orbit.pitch=.20;orbit.dist=currentBuild&&currentBuild.caseType==='y70'?9.4:8.6}updateCamera()
};
resetCamera3D=function(){if(!threeReady)return;if(currentView==='exploded'){orbit.yaw=.78;orbit.pitch=.50;orbit.dist=13;orbit.target.set(.05,-.72,.15)}else{orbit.yaw=.72;orbit.pitch=.20;orbit.dist=currentBuild&&currentBuild.caseType==='y70'?9.4:8.6;orbit.target.set(0,0,0)}updateCamera()};

// ===== V11 INTERACTION DES COMPOSANTS ÉCLATÉS =====
let explodedLabelNodes={},explodedUiReady=false,explodedLabelLoop=false,selectionOutline=null,focusTransition=null;
function explodedPartInfo(){const b=currentBuild||{};return {
 case:['BOÎTIER',b.case||'Boîtier'],mobo:['CARTE MÈRE',b.mobo||'Carte mère'],cpu:['PROCESSEUR',b.cpu||'CPU'],ram:['MÉMOIRE',b.ram||'RAM'],ssd:['STOCKAGE',b.ssd||'SSD'],gpu:['CARTE GRAPHIQUE',b.gpu||'GPU'],psu:['ALIMENTATION',b.psu||'Alimentation'],cooler:['REFROIDISSEMENT',b.cooler||'Refroidissement']
}}
function ensureExplodedUI(){
 const stage=q('#stage');if(!stage)return;let layer=q('#exploded-labels');
 if(!layer){layer=document.createElement('div');layer.id='exploded-labels';layer.className='exploded-labels';stage.appendChild(layer);const tip=document.createElement('div');tip.id='exploded-focus-tip';tip.className='exploded-focus-tip';tip.textContent='Clique sur une pièce pour l’afficher au premier plan · Reset vue pour revenir';stage.appendChild(tip)}
 layer.innerHTML='';explodedLabelNodes={};const infos=explodedPartInfo();
 Object.keys(infos).forEach(id=>{const btn=document.createElement('button');btn.type='button';btn.className='exploded-label';btn.dataset.part=id;const title=document.createElement('b'),name=document.createElement('span');title.textContent=infos[id][0];name.textContent=infos[id][1];btn.append(title,name);btn.onclick=e=>{e.stopPropagation();focusExplodedPart(id)};layer.appendChild(btn);explodedLabelNodes[id]=btn});
 if(!explodedUiReady){
  const canvas=q('#three-canvas');let down=null;
  canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
  canvas.addEventListener('pointerup',e=>{if(currentView!=='exploded'||!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>7)return;pickExplodedPart(e)});
  explodedUiReady=true
 }
 if(!explodedLabelLoop){explodedLabelLoop=true;requestAnimationFrame(updateExplodedLabels)}
}
function pickExplodedPart(e){
 const canvas=q('#three-canvas'),r=canvas.getBoundingClientRect();threeMouse.x=(e.clientX-r.left)/r.width*2-1;threeMouse.y=-((e.clientY-r.top)/r.height*2-1);threeRaycaster.setFromCamera(threeMouse,threeCamera);
 const hits=threeRaycaster.intersectObjects(Object.values(threeParts),true);if(!hits.length)return;let o=hits[0].object,id=o.userData.part;while(!id&&o.parent){o=o.parent;id=o.userData.part}if(id)focusExplodedPart(id)
}
function focusExplodedPart(id){
 if(currentView!=='exploded'||!threeParts[id])return;selected3D=id;qa('.part').forEach(x=>x.classList.toggle('active',x.dataset.row===id));Object.entries(explodedLabelNodes).forEach(([k,n])=>n.classList.toggle('active',k===id));
 if(selectionOutline){threeScene.remove(selectionOutline);selectionOutline.geometry&&selectionOutline.geometry.dispose()}
 selectionOutline=new THREE.BoxHelper(threeParts[id],0x67dcff);selectionOutline.material.transparent=true;selectionOutline.material.opacity=.82;threeScene.add(selectionOutline);
 const wp=new THREE.Vector3();threeParts[id].getWorldPosition(wp);focusTransition={fromTarget:orbit.target.clone(),toTarget:wp.clone(),fromDist:orbit.dist,toDist:id==='case'?6.7:4.7,t:0};
 const info=explodedPartInfo()[id],el=q('#part-detail');if(el){el.classList.add('show');el.innerHTML=`<b>${info[0]} · ${info[1]}</b><p>${id==='case'?`${currentBuild.case} · ${currentBuild.caseDims.join(' × ')} mm.`:(partDesc[id]||'Clique sur Reset vue pour revenir à la présentation complète.')}</p>`}
}
function updateExplodedLabels(){
 requestAnimationFrame(updateExplodedLabels);if(!threeReady)return;const layer=q('#exploded-labels'),tip=q('#exploded-focus-tip'),visible=currentView==='exploded'&&explodeFactor>.55;
 if(layer)layer.classList.toggle('show',visible);if(tip)tip.classList.toggle('show',visible);
 if(focusTransition){focusTransition.t=Math.min(1,focusTransition.t+.055);const k=1-Math.pow(1-focusTransition.t,3);orbit.target.lerpVectors(focusTransition.fromTarget,focusTransition.toTarget,k);orbit.dist=THREE.MathUtils.lerp(focusTransition.fromDist,focusTransition.toDist,k);updateCamera();if(k>=1)focusTransition=null}
 if(selectionOutline){selectionOutline.visible=currentView==='exploded';selectionOutline.update()}
 if(!visible)return;const stage=q('#stage'),w=stage.clientWidth,h=stage.clientHeight;
 Object.entries(explodedLabelNodes).forEach(([id,node])=>{const obj=threeParts[id];if(!obj){node.style.display='none';return}const p=new THREE.Vector3();obj.getWorldPosition(p);p.y+=id==='case'?2.25:id==='psu'?.65:.28;p.project(threeCamera);const on=p.z>-1&&p.z<1&&Math.abs(p.x)<1.12&&Math.abs(p.y)<1.12;node.style.display=on?'block':'none';node.style.left=((p.x*.5+.5)*w)+'px';node.style.top=((-p.y*.5+.5)*h)+'px'})
}
const buildStudioV10=buildModularPC;buildModularPC=function(b){if(selectionOutline){threeScene.remove(selectionOutline);selectionOutline=null}selected3D=null;focusTransition=null;buildStudioV10(b);ensureExplodedUI()};buildThreePC=buildModularPC;
const setViewStudioV10=setView;setView=function(v){setViewStudioV10(v);ensureExplodedUI();if(v!=='exploded'){focusTransition=null;if(selectionOutline)selectionOutline.visible=false}else{Object.values(explodedLabelNodes).forEach(n=>n.classList.remove('active'))}};
const resetCameraStudioV10=resetCamera3D;resetCamera3D=function(){selected3D=null;focusTransition=null;Object.values(explodedLabelNodes).forEach(n=>n.classList.remove('active'));if(selectionOutline){threeScene.remove(selectionOutline);selectionOutline=null}resetCameraStudioV10()};
selectPart=function(id){if(currentView==='exploded'){focusExplodedPart(id);return}selected3D=id;qa('.part').forEach(x=>x.classList.toggle('active',x.dataset.row===id));const obj=threeParts[id],el=q('#part-detail');if(el){const info=explodedPartInfo()[id];el.classList.add('show');el.innerHTML=`<b>${info?info[0]+' · '+info[1]:id.toUpperCase()}</b><p>${partDesc[id]||''}</p>`}if(obj&&orbit.target){const wp=new THREE.Vector3();obj.getWorldPosition(wp);orbit.target.lerp(wp,.55);updateCamera()}};

// ===== V12 INSPECTION 360° + CHÂSSIS SHOWCASE =====
let inspectControlsReady=false,inspectDrag=null,liftTransition=null;
function restoreInspectedPart(id){const o=id&&threeParts[id];if(!o)return;if(o.userData.baseExplode)o.userData.explode.copy(o.userData.baseExplode);if(o.userData.baseExplodeQuat)o.userData.explodeQuat.copy(o.userData.baseExplodeQuat)}
function prepareInspectPoses(){Object.values(threeParts).forEach(o=>{if(o.userData.explode&&!o.userData.baseExplode)o.userData.baseExplode=o.userData.explode.clone();if(o.userData.explodeQuat&&!o.userData.baseExplodeQuat)o.userData.baseExplodeQuat=o.userData.explodeQuat.clone()})}
function setupInspectControls(){
 if(inspectControlsReady)return;const canvas=q('#three-canvas');
 canvas.addEventListener('pointerdown',e=>{if(currentView!=='exploded'||!selected3D||!threeParts[selected3D])return;inspectDrag={x:e.clientX,y:e.clientY,id:selected3D};canvas.setPointerCapture&&canvas.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation()},true);
 canvas.addEventListener('pointermove',e=>{if(!inspectDrag||currentView!=='exploded')return;const o=threeParts[inspectDrag.id];if(!o||!o.userData.explodeQuat)return;const dx=e.clientX-inspectDrag.x,dy=e.clientY-inspectDrag.y;inspectDrag.x=e.clientX;inspectDrag.y=e.clientY;const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),dx*.012),qx=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),dy*.012);o.userData.explodeQuat.premultiply(qy).multiply(qx);e.preventDefault();e.stopImmediatePropagation()},true);
 const finish=e=>{if(!inspectDrag)return;inspectDrag=null;e.preventDefault();e.stopImmediatePropagation()};canvas.addEventListener('pointerup',finish,true);canvas.addEventListener('pointercancel',finish,true);inspectControlsReady=true
}
const focusExplodedPartV11=focusExplodedPart;focusExplodedPart=function(id){
 if(currentView!=='exploded'||!threeParts[id])return;const previous=selected3D;if(previous&&previous!==id)restoreInspectedPart(previous);prepareInspectPoses();focusExplodedPartV11(id);
 const o=threeParts[id],from=o.userData.explode.clone(),to=o.userData.baseExplode.clone(),lift=id==='case'?.55:1.18;to.y+=lift;to.z+=id==='case'?.10:.18;liftTransition={object:o,from,to,t:0};if(focusTransition)focusTransition.toTarget.y+=lift*.82;
 const tip=q('#exploded-focus-tip');if(tip){tip.textContent='MODE INSPECTION · Glisse pour tourner la pièce à 360° · Reset vue pour la reposer';tip.classList.add('inspect-mode')}
};
const updateExplodedLabelsV11=updateExplodedLabels;updateExplodedLabels=function(){
 if(liftTransition){liftTransition.t=Math.min(1,liftTransition.t+.055);const k=1-Math.pow(1-liftTransition.t,3);liftTransition.object.userData.explode.lerpVectors(liftTransition.from,liftTransition.to,k);if(k>=1)liftTransition=null}
 updateExplodedLabelsV11()
};
const resetCameraV11=resetCamera3D;resetCamera3D=function(){const old=selected3D;restoreInspectedPart(old);liftTransition=null;const tip=q('#exploded-focus-tip');if(tip){tip.textContent='Clique sur une pièce pour la soulever et l’inspecter à 360°';tip.classList.remove('inspect-mode')}resetCameraV11()};
const setViewV11=setView;setView=function(v){if(v!=='exploded'&&selected3D)restoreInspectedPart(selected3D);liftTransition=null;setViewV11(v);const tip=q('#exploded-focus-tip');if(tip&&!selected3D)tip.textContent='Clique sur une pièce pour la soulever et l’inspecter à 360°'};

function addShowcaseFrameDetails(g,b){
 const sizes={north:[4.47,4.69,2.15],h6:[4.15,4.35,2.87],o11:[4.78,4.71,2.90],y70:[4.70,4.70,3.20]},s=sizes[b.caseType]||sizes.h6,D=s[0],H=s[1],W=s[2],chrome=mat(0xc8d0d6,.98,.10),dark=mat(0x111419,.88,.22);
 for(const y of [-H/2+.10,H/2-.10]){const rod=cyl(.055,D-.34,chrome,32);rod.rotation.z=Math.PI/2;rod.position.set(0,y,W/2+.09);g.add(rod);for(const x of [-D/2+.17,D/2-.17]){const cap=cyl(.09,.075,chrome,32);cap.rotation.z=Math.PI/2;cap.position.set(x,y,W/2+.09);g.add(cap)}}
 for(const x of [-D*.29,D*.29]){const foot=roundedPanel(.78,.82,.12,.06,dark);foot.rotation.x=Math.PI/2;foot.position.set(x,-H/2-.11,.15);g.add(foot);const pad=box(.55,.055,.62,mat(0x050608,.22,.82));pad.position.set(x,-H/2-.20,.15);g.add(pad)}return g
}
const createCaseForBuildV11=createCaseForBuild;createCaseForBuild=function(b){return addShowcaseFrameDetails(createCaseForBuildV11(b),b)};
function createCoolantTube(points,color){const m=mat(color,.28,.22,color,.55),o=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),72,.028,14,false),m);o.castShadow=true;return o}
const createStudioCoolerV11=createStudioCooler;createStudioCooler=function(b,h){const g=createStudioCoolerV11(b,h);if(b.cooling==='aio'){const accent=b.key==='performance'?0xff7a28:(b.theme||0x67dcff);g.add(createCoolantTube([new THREE.Vector3(-.42,-1.02,.34),new THREE.Vector3(.20,-.62,.42),new THREE.Vector3(1.10,-.28,.18)],accent));g.add(createCoolantTube([new THREE.Vector3(-.28,-1.10,.27),new THREE.Vector3(.38,-.72,.32),new THREE.Vector3(.82,-.30,.10)],accent))}return g};
const buildModularPCV11=buildModularPC;buildModularPC=function(b){buildModularPCV11(b);prepareInspectPoses();setupInspectControls();const tip=q('#exploded-focus-tip');if(tip)tip.textContent='Clique sur une pièce pour la soulever et l’inspecter à 360°'};buildThreePC=buildModularPC;

// ===== V13 BOÎTIERS CARRÉS RÉALISTES =====
function createSquareCase(b){
 const specs={north:{D:4.47,H:4.69,W:2.15,steel:0x17191b,edge:0x34383d},h6:{D:4.15,H:4.35,W:2.87,steel:0x11151a,edge:0x353c45},o11:{D:4.78,H:4.71,W:2.90,steel:0x101318,edge:0x3e4650},y70:{D:4.70,H:4.70,W:3.20,steel:0x121419,edge:0x464d57}},c=specs[b.caseType]||specs.h6,D=c.D,H=c.H,W=c.W,g=new THREE.Group();g.userData.part='case';
 const steel=mat(c.steel,.84,.28),edge=mat(c.edge,.92,.18),black=mat(0x090b0e,.55,.60),meshMat=mat(0x20252a,.75,.38);
 // Panneaux extérieurs droits : toit, base et arrière donnent une vraie silhouette de tour.
 const top=box(D,.14,W,steel);top.position.y=H/2-.07;g.add(top);const bottom=box(D,.16,W,steel);bottom.position.y=-H/2+.08;g.add(bottom);const rear=box(.13,H-.28,W,steel);rear.position.x=-D/2+.065;g.add(rear);
 // Cadre carré autour de l'ouverture latérale, sans vitre parasite.
 for(const x of [-D/2+.09,D/2-.09]){const v=box(.18,H-.18,.18,edge);v.position.set(x,0,W/2-.09);g.add(v)}
 for(const y of [-H/2+.09,H/2-.09]){const h=box(D-.18,.18,.18,edge);h.position.set(0,y,W/2-.09);g.add(h)}
 // Plateau de carte mère et cache alimentation, strictement contenus dans le boîtier.
 const tray=box(D*.70,H*.76,.08,meshMat);tray.position.set(-D*.07,.08,-W/2+.18);g.add(tray);const shroud=box(D*.72,.68,W*.83,steel);shroud.position.set(-D*.05,-H/2+.49,-.08);g.add(shroud);
 // Façade rectangulaire avec cadre et grille centrale.
 const frontL=box(.16,H-.20,.18,edge);frontL.position.set(D/2-.08,0,-W/2+.09);g.add(frontL);const frontR=frontL.clone();frontR.position.z=W/2-.09;g.add(frontR);
 const frontTop=box(.16,.18,W-.18,edge);frontTop.position.set(D/2-.08,H/2-.09,0);g.add(frontTop);const frontBottom=frontTop.clone();frontBottom.position.y=-H/2+.09;g.add(frontBottom);
 const grille=box(.055,H-.52,W-.42,new THREE.MeshStandardMaterial({color:0x15191d,roughness:.72,metalness:.36,transparent:true,opacity:.72}));grille.position.set(D/2-.14,0,0);g.add(grille);
 // Pieds courts et rectangulaires, comme sur un véritable boîtier posé au sol.
 for(const x of [-D*.34,D*.34])for(const z of [-W*.30,W*.30]){const foot=box(.46,.18,.40,black);foot.position.set(x,-H/2-.09,z);g.add(foot)}
 // Bouton et ports en façade supérieure.
 const power=cyl(.075,.035,mat(0x9aa3aa,.92,.16),28);power.rotation.z=Math.PI/2;power.position.set(D/2+.015,H/2-.32,W*.28);g.add(power);
 for(let i=0;i<2;i++){const usb=box(.035,.10,.18,black);usb.position.set(D/2+.02,H/2-.55-i*.17,W*.28);g.add(usb)}
 // Ventilation propre à chaque châssis, toujours placée derrière le cadre.
 if(b.caseType==='north'){
  const wood=mat(0x755034,.18,.62);for(let i=0;i<11;i++){const slat=box(.07,H-.52,.10,wood);slat.position.set(D/2-.04,0,-W/2+.22+i*(W-.44)/10);g.add(slat)}
  for(const y of [.68,-.66])addCaseFan(g,D/2-.22,y,0,.54,-Math.PI/2,0,false,0xc99b67)
 }else if(b.caseType==='h6'){
  for(let i=0;i<3;i++)addCaseFan(g,D/2-.24,1.18-i*1.17,0,.48,-Math.PI/2,0,true,0x67dcff)
 }else{
  const accent=b.caseType==='y70'?0xff4bd8:0x8e7dff;for(let i=0;i<3;i++)addCaseFan(g,D/2-.24,1.18-i*1.17,0,.49,-Math.PI/2,0,true,accent);
  for(let i=0;i<3;i++)addCaseFan(g,-.20,-H/2+.24,-.72+i*.72,.44,0,Math.PI/2,true,0x67dcff)
 }
 // Ventilateur arrière et vis de cadre visibles.
 addCaseFan(g,-D/2+.18,H*.24,0,.43,Math.PI/2,0,b.caseType!=='north',b.theme||0x67dcff);
 for(const x of [-D/2+.13,D/2-.13])for(const y of [-H/2+.13,H/2-.13]){const screw=cyl(.035,.025,mat(0x9ea6ad,.92,.16),16);screw.rotation.x=Math.PI/2;screw.position.set(x,y,W/2+.015);g.add(screw)}
 // Détails de fabrication : joints des panneaux, aérations et connectique arrière.
 const seam=mat(0x050608,.48,.58),slotMat=mat(0x080a0c,.40,.66),metal=mat(0x69717a,.90,.18);
 for(const y of [-H/2+.25,H/2-.25]){const joint=box(D-.46,.018,.022,seam);joint.position.set(0,y,W/2+.018);g.add(joint)}
 for(let i=0;i<7;i++){const slot=box(.035,.075,.72,slotMat);slot.position.set(-D/2-.006,-.52-i*.105,0);g.add(slot);const lip=box(.022,.018,.76,metal);lip.position.set(-D/2-.028,-.475-i*.105,0);g.add(lip)}
 const io=box(.035,.72,.68,mat(0x252a30,.88,.26));io.position.set(-D/2-.01,.88,0);g.add(io);
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){const port=box(.018,.075,.105,slotMat);port.position.set(-D/2-.032,1.08-row*.20,-.21+col*.14);g.add(port)}
 // Micro-perforations simulées uniquement sur les surfaces, jamais à travers les composants.
 for(let row=0;row<5;row++)for(let col=0;col<6;col++){const vent=cyl(.026,.012,slotMat,12);vent.rotation.z=Math.PI/2;vent.position.set(-D/2-.018,-1.55+row*.15,-.38+col*.15);g.add(vent)}
 // Fente de panneau et badge discret pour renforcer l'échelle du produit.
 const sideLip=box(D-.62,.035,.035,metal);sideLip.position.set(0,-H/2+.27,W/2+.025);g.add(sideLip);
 const badge=box(.36,.12,.025,mat(b.theme||0x67dcff,.72,.26,b.theme||0x67dcff,.10));badge.position.set(D/2-.42,-H/2+.36,W/2+.04);g.add(badge);
 glassMesh=null;return g
}
createCaseForBuild=function(b){return createSquareCase(b)};

// ===== V14 MOTION SYSTEM =====
let futureMotionReady=false;
function initFutureMotion(){
 if(futureMotionReady)return;futureMotionReady=true;
 const selector='.step,.config,.bench,.hero-card,.monitor,.section-head';
 const revealObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('future-in');revealObserver.unobserve(entry.target)}}),{threshold:.10,rootMargin:'0px 0px -35px'}):null;
 const register=root=>(root.matches&&root.matches(selector)?[root]:[]).concat(root.querySelectorAll?[...root.querySelectorAll(selector)]:[]).forEach(el=>{if(el.dataset.futureFx)return;el.dataset.futureFx='1';el.classList.add('future-reveal');if(revealObserver)revealObserver.observe(el);else el.classList.add('future-in')});
 register(document);
 new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)register(n)}))).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('pointermove',e=>{const card=e.target.closest&&e.target.closest('.step,.config,.bench,.hero-card,.monitor');if(!card)return;const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`)},{passive:true});
 document.addEventListener('pointerout',e=>{const card=e.target.closest&&e.target.closest('.step,.config,.bench,.hero-card,.monitor');if(card&&!card.contains(e.relatedTarget)){card.style.setProperty('--mx','50%');card.style.setProperty('--my','50%')}},{passive:true})
}
setTimeout(initFutureMotion,60);

// ===== V15 COACH ADAPTATIF =====
Object.assign(assistance,{novice:{label:'Novice',coach:true,title:'Parcours guidé'},connaisseur:{label:'Connaisseur',coach:true,title:'Aide contextuelle'},pro:{label:'Pro',coach:true,title:'Synthèse technique'},expert:{label:'Expert',coach:true,title:'État du profil'}});
function ensureAdaptiveHelpV15(){
 const box=q('#adaptive-help');if(!box||q('#ah-progress'))return;
 q('#ah-text').insertAdjacentHTML('afterend','<div class="ah-progress" id="ah-progress"><div class="ah-progress-top"><span>PROGRESSION DU PROFIL</span><b id="ah-percent">0%</b></div><div class="ah-track"><i id="ah-progress-fill"></i></div></div><div class="ah-why" id="ah-why"></div><div class="ah-glossary" id="ah-glossary"></div><div class="ah-actions"><button type="button" id="ah-main-action">ALLER À L’ÉTAPE →</button></div>')
}
function adaptiveStage(){
 if(!selRes)return {i:0,target:'#resolutions'};if(!selMonitor)return {i:1,target:'#monitors'};if(!selUsages.length)return {i:2,target:'#usages'};if(!selPriorities.length)return {i:3,target:'#priorities'};if(selBudget===null)return {i:4,target:'#budgets'};if(selStyle===null)return {i:5,target:'#styles'};return {i:6,target:'#results'}
}
const adaptiveCopy={
 novice:[
  ['Choisis la définition','La définition indique la quantité de détails affichés. Le Full HD est le plus facile à faire tourner, le QHD est plus net et la 4K demande une carte graphique puissante.','Pourquoi ? L’écran détermine une grande partie de la puissance graphique nécessaire.',['1080p = Full HD','1440p = QHD','2160p = 4K']],
  ['Choisis ton écran','Regarde surtout sa taille et sa fréquence. Plus le nombre de Hz est élevé, plus les mouvements peuvent paraître fluides si le PC produit assez de FPS.','Un écran 240 Hz n’est vraiment utile que si la configuration peut approcher 240 FPS.',['Hz = fluidité maximale','FPS = images produites','OLED = contraste élevé']],
  ['Indique tes usages','Sélectionne tout ce que tu feras réellement avec le PC. Tu peux choisir plusieurs usages en même temps.','Le processeur et la carte graphique ne sont pas sollicités de la même façon selon les logiciels.',['AAA = jeux exigeants','Esport = hauts FPS','Création = CPU + RAM']],
  ['Classe tes priorités','Choisis ce qui compte le plus pour toi : fluidité, qualité d’image, silence ou création. Plusieurs réponses sont possibles.','Cela permet d’éviter de payer plus cher pour une caractéristique qui ne t’est pas utile.',['FPS = fluidité','Silence = refroidissement','Qualité = détails visuels']],
  ['Définis ton budget','Choisis le montant consacré uniquement à la tour. Le prix de l’écran est présenté séparément.','Une fourchette réaliste aide à privilégier les composants qui ont le plus d’impact.',['Tour = PC sans écran','Marge = évolutions','Rapport qualité/prix']],
  ['Choisis le style','Ce choix change principalement le boîtier, l’éclairage RGB et le refroidissement, pas la puissance principale.','Les performances restent prioritaires, puis l’apparence est adaptée à ton goût.',['Sobre','RGB','Bois','Vitrine']],
  ['Configuration terminée','Tes propositions sont prêtes. Sélectionne un PC pour afficher son benchmark, puis ouvre BuildLab pour examiner chaque composant.','Commence par la recommandation, puis compare son prix et ses FPS avec les autres modèles.',['✓ Profil complet','Benchmark disponible','Vue 3D interactive']]
 ],
 connaisseur:[
  ['Résolution cible','Sélectionne la définition réellement utilisée : monter en résolution augmente surtout la charge GPU.','Arbitrage : finesse de l’image contre fréquence d’images.',['GPU bound','Densité de pixels']],
  ['Écran et fréquence','Choisis le couple taille/Hz correspondant à tes jeux et à ta distance de visionnage.','La fréquence élevée doit rester cohérente avec les FPS attendus.',['VRR','OLED / IPS','Temps de réponse']],
  ['Charge de travail','Combine jeu, streaming et création pour obtenir un profil de charge plus réaliste.','Les usages mixtes augmentent l’importance du CPU, de la RAM et du stockage.',['CPU multicœur','VRAM','Encodage']],
  ['Compromis principal','Indique les compromis acceptables entre FPS, qualité, bruit et création.','Le configurateur pondère ses recommandations à partir de ces choix.',['Raster','Ray tracing','Acoustique']],
  ['Enveloppe tarifaire','Fixe la fourchette de la tour et conserve une marge pour l’écran ou les périphériques.','Le meilleur équilibre se trouve rarement dans le composant le plus haut de gamme.',['Budget tour','Coût par FPS']],
  ['Châssis et finition','Sélectionne l’esthétique et le type de boîtier souhaités.','Le châssis influence également l’airflow, le bruit et l’encombrement.',['Airflow','AIO','Format ATX']],
  ['Comparer les builds','Compare maintenant le coût, les FPS, le niveau sonore attendu et les possibilités d’évolution.','BuildLab permet ensuite de contrôler visuellement le montage.',['4 propositions','Bench dynamique','Inspection 3D']]
 ],
 pro:[
  ['Cible d’affichage','Définis la charge pixel avant de dimensionner le GPU.','Base de calcul : définition × fréquence cible.',['1080p','1440p','2160p']],
  ['Display ceiling','Valide Hz, dalle et taille ; ils définissent le plafond utile du benchmark.','Vérifie aussi VRR, connectique et bande passante.',['Hz','VRR','DP / HDMI']],
  ['Workloads','Empile les charges réellement simultanées.','Le profil mixte peut déplacer le goulot du GPU vers le CPU ou la mémoire.',['CPU/GPU','VRAM','RAM']],
  ['Pondération','Définis la pondération performance, qualité, acoustique et productivité.','Ces axes déterminent le compromis recommandé.',['1% low','Raster/RT','dB(A)']],
  ['Cap budgétaire','Fixe le plafond de la tour avant les ajustements esthétiques.','Contrôle le rendement marginal entre chaque tier.',['€/FPS','Headroom PSU']],
  ['Contraintes châssis','Valide format, airflow, refroidissement et encombrement GPU.','La compatibilité mécanique reste à vérifier avant achat.',['ATX/mATX','GPU clearance','Radiateur']],
  ['Profil calculé','Les builds et estimations sont disponibles pour comparaison.','Prix et performances restent indicatifs : confronte-les aux mesures réelles.',['FPS moyens','1% low estimé','BuildLab']]
 ],
 expert:[
  ['Affichage','Résolution cible manquante.','Charge pixel non définie.',['RES']],['Écran','Écran/Hz manquant.','Plafond d’affichage non défini.',['HZ']],['Workload','Usage manquant.','Pondération de charge absente.',['LOAD']],['Priorités','Priorité manquante.','Arbitrage non défini.',['WEIGHT']],['Budget','Budget manquant.','Cap tarifaire absent.',['CAP']],['Style','Contraintes châssis manquantes.','Layout incomplet.',['CASE']],['Profil prêt','Profil complet · benchmarks disponibles.','Sélectionne un build pour comparer.',['READY']]
 ]
};
updateAdaptiveHelp=function(){
 if(!userLevel)return;ensureAdaptiveHelpV15();const box=q('#adaptive-help'),stage=adaptiveStage(),copy=adaptiveCopy[userLevel][stage.i],done=[!!selRes,!!selMonitor,selUsages.length>0,selPriorities.length>0,selBudget!==null,selStyle!==null].filter(Boolean).length,percent=Math.round(done/6*100);
 box.classList.toggle('expert-compact',userLevel==='expert');q('#ah-level').textContent=assistance[userLevel].label.toUpperCase()+' · '+(userLevel==='expert'?'STATUS':'AIDE ADAPTATIVE');q('#ah-title').textContent=copy[0];q('#ah-text').textContent=copy[1];q('#ah-tip').textContent=stage.i===6?(userLevel==='novice'?'Conseil : sélectionne d’abord le build recommandé pour voir son benchmark.':'Profil complet · comparaison active.'):`Étape ${stage.i+1} sur 6`;
 q('#ah-why').innerHTML=`<b>À retenir :</b> ${copy[2]}`;q('#ah-glossary').innerHTML=copy[3].map(x=>`<span>${x}</span>`).join('');q('#ah-percent').textContent=percent+'%';q('#ah-progress-fill').style.width=percent+'%';const action=q('#ah-main-action');action.textContent=stage.i===6?'VOIR LES CONFIGURATIONS →':'ALLER À L’ÉTAPE →';action.onclick=()=>{const target=q(stage.target);if(target)(target.closest('.step,.results')||target).scrollIntoView({behavior:'smooth',block:'center'})};box.classList.remove('hidden')
};

// ===== V16 QUESTIONNAIRE DE PROFIL ADAPTATIF =====
let quizIndex=0,quizAnswers=[],aidProfile=(()=>{try{return JSON.parse(localStorage.getItem('readoutAidProfile')||'null')}catch(_){return null}})();
const quizBase=[
 {tag:'ON COMMENCE FACILEMENT',q:'Tu t’y connais comment en PC ?',hint:'Choisis simplement la réponse qui te ressemble le plus.',options:[{b:'Pas du tout',s:'Je veux des mots simples.',skill:0},{b:'Un peu',s:'Je connais les composants principaux.',skill:1},{b:'Plutôt bien',s:'Je sais comparer plusieurs PC.',skill:2},{b:'Très bien',s:'Je préfère aller droit aux détails.',skill:3}]},
 {tag:'TON OBJECTIF',q:'Ton PC servira surtout à quoi ?',hint:'Cela permet de te montrer les conseils les plus utiles.',options:[{b:'Jouer en ligne',s:'Fortnite, Valorant et jeux compétitifs.',goal:'competitive'},{b:'Jouer aux gros jeux',s:'Belle image et jeux récents.',goal:'aaa'},{b:'Créer ou travailler',s:'Montage, 3D, streaming et logiciels.',goal:'creation'},{b:'Un peu de tout',s:'Je cherche un PC polyvalent.',goal:'balanced'}]},
 {tag:'TON CONFORT',q:'Quand un choix est compliqué, tu préfères…',hint:'Readout adaptera immédiatement sa façon de t’aider.',options:[{b:'Qu’on me guide',s:'Une réponse claire à chaque étape.',help:'guided'},{b:'Une petite explication',s:'Juste ce qu’il faut pour comprendre.',help:'context'},{b:'Un résumé rapide',s:'Les points importants uniquement.',help:'light'},{b:'Voir directement les chiffres',s:'Je veux décider seul.',help:'dense'}]},
 {tag:'LE RÉSULTAT',q:'À la fin, qu’est-ce qui t’aide le plus ?',hint:'Tu pourras toujours comparer les autres propositions.',options:[{b:'Un seul PC conseillé',s:'Le meilleur choix mis en avant.',decision:'single'},{b:'Deux ou trois choix comparés',s:'Les différences expliquées simplement.',decision:'compare'},{b:'Les performances en jeu',s:'FPS et benchmarks en priorité.',decision:'data'},{b:'Tout personnaliser moi-même',s:'Davantage de réglages et de contrôle.',decision:'control'}]},
 {tag:'DERNIER CHOIX',q:'Tu veux prendre combien de temps ?',hint:'C’est le dernier choix.',options:[{b:'Aller au plus vite',s:'Interface très directe.',pace:'fast',skillAdjust:0},{b:'Être bien accompagné',s:'Conseils visibles au bon moment.',pace:'comfortable',skillAdjust:0},{b:'Comprendre mes choix',s:'Quelques explications en plus.',pace:'learn',skillAdjust:-.15},{b:'Tout explorer',s:'Comparaisons et outils avancés.',pace:'deep',skillAdjust:.15}]}
];
function quizQuestions(){return quizBase}
function openSkillQuiz(){quizIndex=0;quizAnswers=[];q('#diagnostic-launch').style.display='none';q('#level-grid').style.display='none';q('.intro-foot').style.display='none';q('#skill-quiz').classList.add('show');renderSkillQuiz()}
function closeSkillQuiz(){q('#skill-quiz').classList.remove('show');q('#diagnostic-launch').style.display='grid';q('#level-grid').style.display='grid';q('.intro-foot').style.display='flex'}
function renderSkillQuiz(){const questions=quizQuestions(),total=questions.length,stage=q('#quiz-stage'),back=q('#quiz-back');back.style.visibility=quizIndex?'visible':'hidden';q('#quiz-count').textContent=`CHOIX ${Math.min(quizIndex+1,total)} / ${total}`;q('#quiz-meter-fill').style.width=(quizIndex/total*100)+'%';if(quizIndex>=total){renderQuizResult();return}const item=questions[quizIndex];stage.innerHTML=`<div class="quiz-kicker">${item.tag}</div><h2>${item.q}</h2><p>${item.hint}</p><div class="quiz-answers">${item.options.map((o,i)=>`<button class="quiz-answer" type="button" data-answer="${i}"><b>${o.b}</b><span>${o.s}</span></button>`).join('')}</div><button class="quiz-skip" id="quiz-skip" type="button">Je ne sais pas · passer →</button>`;qa('.quiz-answer').forEach(btn=>btn.onclick=()=>chooseQuizAnswer(Number(btn.dataset.answer)));q('#quiz-skip').onclick=()=>{quizAnswers[quizIndex]={skipped:true};quizIndex++;renderSkillQuiz()}}
function chooseQuizAnswer(i){const item=quizQuestions()[quizIndex];quizAnswers[quizIndex]=item.options[i];quizIndex++;renderSkillQuiz()}
function calculateAidProfile(){const skill=quizAnswers.find(x=>typeof x?.skill==='number')?.skill??1,adjust=quizAnswers.find(x=>typeof x?.skillAdjust==='number')?.skillAdjust||0,score=Math.max(0,Math.min(3,skill+adjust)),help=quizAnswers.find(x=>x?.help)?.help||'context',goal=quizAnswers.find(x=>x?.goal)?.goal||'balanced',decision=quizAnswers.find(x=>x?.decision)?.decision||'compare',pace=quizAnswers.find(x=>x?.pace)?.pace||'comfortable';let level=score<.75?'novice':score<1.75?'connaisseur':score<2.65?'pro':'expert';if(help==='guided')level=score<2?'novice':'connaisseur';if(help==='dense'&&level==='novice')level='connaisseur';return {level,skillScore:Number(score.toFixed(2)),help,goal,decision,pace,createdAt:Date.now()}}
function renderQuizResult(){aidProfile=calculateAidProfile();const names={novice:'PARCOURS GUIDÉ',connaisseur:'PARCOURS ÉQUILIBRÉ',pro:'PARCOURS RAPIDE',expert:'MODE EXPERT'},helpNames={guided:'Guidage complet',context:'Aide au bon moment',light:'Résumés rapides',dense:'Chiffres en priorité'},goalNames={competitive:'Jeu en ligne',aaa:'Gros jeux',creation:'Création et travail',balanced:'Polyvalence'},decisionNames={single:'Un choix conseillé',compare:'Comparatif simple',data:'Performances en jeu',control:'Contrôle avancé'};q('#quiz-count').textContent='C’EST PRÊT';q('#quiz-meter-fill').style.width='100%';q('#quiz-stage').innerHTML=`<div class="quiz-result"><div class="quiz-result-orb">✓</div><div class="quiz-kicker">TON AIDE PERSONNALISÉE</div><h2>${names[aidProfile.level]}</h2><p>Tu pourras modifier ce réglage à tout moment.</p><div class="quiz-profile-grid"><div><b>AIDE</b><span>${helpNames[aidProfile.help]}</span></div><div><b>USAGE</b><span>${goalNames[aidProfile.goal]}</span></div><div><b>RÉSULTAT</b><span>${decisionNames[aidProfile.decision]}</span></div></div><button class="quiz-apply" id="quiz-apply" type="button">COMMENCER →</button></div>`;q('#quiz-apply').onclick=applyQuizProfile}
function applyQuizProfile(){try{localStorage.setItem('readoutAidProfile',JSON.stringify(aidProfile))}catch(_){ }closeSkillQuiz();applyLevel(aidProfile.level,true)}
q('#diagnostic-launch').onclick=openSkillQuiz;q('#quiz-close').onclick=closeSkillQuiz;q('#quiz-back').onclick=()=>{if(quizIndex>0){quizIndex--;quizAnswers.length=quizIndex;renderSkillQuiz()}};
q('#target-price-mode').onchange=e=>{targetPriceMode=e.target.checked;compositionSignature='';if(selBudget!==null)compute()};q('#custom-budget-apply').onclick=applyCustomBudget;q('#custom-budget-value').addEventListener('keydown',e=>{if(e.key==='Enter')applyCustomBudget()});
const updateAdaptiveHelpV15=updateAdaptiveHelp;updateAdaptiveHelp=function(){updateAdaptiveHelpV15();if(!userLevel||!aidProfile)return;const why=q('#ah-why');if(!why)return;const goalHint={competitive:'Exemples orientés hauts FPS et faible latence.',aaa:'Exemples orientés qualité visuelle et stabilité.',creation:'Exemples orientés CPU, RAM et accélération GPU.',balanced:'Exemples orientés équilibre et durée de vie.'}[aidProfile.goal],decisionHint={single:'La recommandation principale sera mise en avant.',compare:'Les différences entre les propositions seront expliquées.',data:'Les mesures et benchmarks seront prioritaires.',control:'Les outils d’inspection avancés resteront visibles.'}[aidProfile.decision];why.innerHTML+=`<br><b>Ton profil :</b> ${goalHint} ${decisionHint}`};

// ===== V18 MOTEUR DE CONFIGURATIONS DYNAMIQUES =====
const dynamicCPUs=[
 {name:'Intel Core i3-12100F',price:85,game:58,work:48,img:I.cpu9600,tier:0,intel:true},
 {name:'Ryzen 5 8600G',price:170,game:64,work:68,img:I.cpu9600,tier:0,igpu:true},
 {name:'Ryzen 5 8400F',price:105,game:69,work:57,img:I.cpu9600,tier:0},
 {name:'Ryzen 5 7500F',price:130,game:78,work:62,img:I.cpu9600,tier:0},
 {name:'Ryzen 5 9600X',price:225,game:91,work:76,img:I.cpu9600,tier:1},
 {name:'Ryzen 7 9700X',price:315,game:98,work:94,img:I.cpu9800,tier:2},
 {name:'Ryzen 7 9800X3D',price:465,game:122,work:96,img:I.cpu9800,tier:3},
 {name:'Ryzen 9 9900X',price:475,game:104,work:126,img:I.cpu9800,tier:3},
 {name:'Ryzen 9 9950X3D',price:725,game:128,work:148,img:I.cpu9800,tier:4}
];
const dynamicGPUs=[
 {name:'Radeon RX 6400 4 Go',price:120,score:37,rt:12,img:I.gpu9060,dims:[170,105,38],fans:1,rgb:false,w:500},
 {name:'Radeon 760M intégrée',price:0,score:30,rt:8,img:I.gpu9060,dims:[110,72,18],fans:1,rgb:false,w:500,apu:true},
 {name:'Intel Arc B580 12 Go',price:290,score:76,rt:39,img:I.gpu9060,dims:[272,115,44],fans:2,rgb:false,w:650},
 {name:'Radeon RX 7600 8 Go',price:250,score:68,rt:29,img:I.gpu9060,dims:[204,111,42],fans:2,rgb:false,w:550},
 {name:'GeForce RTX 5060 Ti 16 Go',price:455,score:91,rt:52,img:I.gpu9060,dims:[242,120,45],fans:2,rgb:false,w:650},
 {name:'Radeon RX 9060 XT 16 Go',price:485,score:99,rt:48,img:I.gpu9060,dims:[280,118,49],fans:2,rgb:false,w:650},
 {name:'GeForce RTX 5070 12 Go',price:665,score:121,rt:72,img:I.gpu5080,dims:[242,112,44],fans:2,rgb:false,w:750},
 {name:'Radeon RX 9070 16 Go',price:690,score:137,rt:67,img:I.gpu9070,dims:[280,120,52],fans:2,rgb:false,w:750},
 {name:'Radeon RX 9070 XT 16 Go',price:825,score:154,rt:79,img:I.gpu9070xt,dims:[331,129,66],fans:3,rgb:true,w:850},
 {name:'GeForce RTX 5070 Ti 16 Go',price:925,score:160,rt:94,img:I.gpu5080,dims:[304,137,50],fans:2,rgb:false,w:850},
 {name:'GeForce RTX 5080 16 Go',price:1325,score:181,rt:116,img:I.gpu5080,dims:[304,137,61],fans:2,rgb:false,w:1000}
];
const dynamicCases=[
 {name:'Fractal Design North TG',type:'north',dims:[447,215,469],img:I.caseNorth,price:105,theme:0xc99b67},
 {name:'NZXT H6 Flow RGB',type:'h6',dims:[415,287,435],img:I.caseH6,price:135,theme:0x67dcff},
 {name:'Lian Li O11D EVO RGB',type:'o11',dims:[478,290,471],img:I.caseO11,price:185,theme:0x8e7dff},
 {name:'HYTE Y70',type:'y70',dims:[470,320,470],img:'https://cdn.sanity.io/images/mqc7p4g4/production/917e2c8c8e179426269b209c2c979e8a43a1a471-3480x2460.jpg?auto=format&fit=clip&q=92&w=1200',price:225,theme:0xff4bd8}
];
// Premium assemblies use fixed indicative line-item estimates, never a budget filler.
let targetPriceMode=true;
function targetBand(){const price=budgets[selBudget]?.[2]||0;return {active:selBudget===4&&targetPriceMode,low:Math.round(price*.975),high:Math.round(price*1.0625),price}}
function premiumCandidates(){
 const list=[],creative=selUsages.includes(2)||selPriorities.includes(3),silent=selPriorities.includes(2);
 const forms=realCaseOptions().filter(c=>c.id!=='focus').map(c=>({...c,cost:c.price}));
 for(const cpu of dynamicCPUs.filter(c=>c.name==='Ryzen 7 9800X3D'||c.name==='Ryzen 9 9950X3D'))for(const ram of [64,96,128])for(const storage of [4,8,12,16])for(const form of forms)for(const loop of [false,true])for(const boardPrice of [420,650])for(const watts of [1200,1600]){
 const costs={Processeur:cpu.price,Graphique:4000,'Carte mère':boardPrice,Mémoire:({64:220,96:340,128:460})[ram],Stockage:storage/4*350,Boîtier:form.cost,Refroidissement:loop?850:250,Alimentation:watts===1200?300:450,'Ventilateurs et câblage':180};
 const base=Object.values(costs).reduce((a,b)=>a+b,0),id=['premium',cpu.name,ram,storage,form.name,loop,boardPrice,watts].join('|');
 list.push({id,base,costs,premium:true,form:forms.indexOf(form),customLoop:loop,utility:260+(creative?cpu.work*.8+Math.min(ram,96)*.2+storage*2:cpu.game*.6+Math.min(ram,64)*.06)+(silent&&loop?8:0)-base*.003,
 cpu:cpu.name,cpuImg:'',cpuGame:cpu.game,gpu:'GeForce RTX 5090 · 32 Go',gpuImg:'',gpuDims:[340,150,75],gpuFans:3,gpuRgb:selStyle===1,mobo:'AM5 X870E · '+(boardPrice===420?'Connectique complète':'Extension et connectique premium'),moboImg:'',moboFormat:'ATX',ram:ram+' Go DDR5 · kit à valider sur QVL',ramGB:ram,ramImg:'',ramRgb:selStyle===1,ssd:storage+' To NVMe · '+storage/4+' × 4 To',ssdImg:'',cooler:loop?'Boucle CPU sur mesure · radiateur 360 mm':'AIO CPU 360 mm',coolerImg:'',cooling:'aio',psu:watts+' W · ATX 3.1',psuImg:'',case:form.name+' · concept '+(selStyle===2?'blanc':'noir'),caseType:form.type,caseDims:form.dims,caseImg:'',theme:selStyle===2?0xa3caff:form.type==='y70'?0xe7ac64:0x79dcff,score:245,rt:155,dynamic:true,caseModel:form});
 }
 return list;
}
function curateNearPrice(pool,band){
 const sorted=pool.filter(b=>b.base>=band.low&&b.base<=band.high).sort((a,b)=>b.utility-a.utility||Math.abs(a.base-band.price)-Math.abs(b.base-band.price)||a.id.localeCompare(b.id));
 const selected=[],families=new Map();for(const b of sorted){const family=[b.cpu,b.case,b.ram,b.ssd,b.cooler].join('|');if(families.has(family))continue;families.set(family,true);selected.push(b);}return diverseCases(selected,30);
}
function premiumPreview(b){
 const white=(b.caseModel?.white||b.case.includes('blanc')),body=white?'#d7dfe6':'#252c38',side=white?'#919eac':'#101722',accent='#'+b.theme.toString(16).padStart(6,'0'),wide=b.form===0?205:170,front=b.form===2?62:45,top=32,h=b.form===1?260:230,x=65,y=50;
 let fans='';for(let i=0;i<3;i++)fans+=`<g transform="translate(${x+wide+front/2},${y+42+i*58}) scale(.52 1)"><circle r="22" fill="#121c2b" stroke="${accent}" stroke-width="3"/><circle r="15" fill="none" stroke="#677889" stroke-width="5" stroke-dasharray="12 5"/><circle r="6" fill="#111824"/></g>`;
 return `<svg viewBox="0 0 380 360" role="img" aria-label="Aperçu illustratif ${b.case}"><defs><linearGradient id="glass-${b.key}" x2="1" y2="1"><stop stop-color="#53687b" stop-opacity=".3"/><stop offset="1" stop-color="#0b1320" stop-opacity=".8"/></linearGradient></defs><ellipse cx="205" cy="329" rx="135" ry="16" fill="#000" opacity=".4"/><path d="M${x},${y} l${front},-${top} h${wide} l-${front},${top}z" fill="${white?'#eef4fa':'#495461'}"/><path d="M${x+wide},${y} l${front},-${top} v${h} l-${front},${top}z" fill="${side}"/><rect x="${x}" y="${y}" width="${wide}" height="${h}" rx="5" fill="${body}" stroke="#6e7c8b"/><rect x="${x+10}" y="${y+12}" width="${wide-20}" height="${h-24}" fill="#0d1722"/><rect x="${x+26}" y="${y+50}" width="90" height="128" fill="#26333e" stroke="#506174"/>${[0,1,2,3].map(i=>`<path d="M${x+92+i*9} ${y+58}v60" stroke="${accent}" stroke-width="4"/>`).join('')}<rect x="${x+22}" y="${y+18}" width="${wide-42}" height="22" rx="4" fill="#3b4654"/><circle cx="${x+65}" cy="${y+90}" r="20" fill="#131e2b" stroke="${accent}" stroke-width="3"/><path d="M${x+65},${y+71} Q${x+36},${y+38} ${x+120},${y+33}" fill="none" stroke="${b.customLoop?accent:'#8094a7'}" stroke-width="5"/><rect x="${x+23}" y="${y+151}" width="${wide-48}" height="40" rx="5" fill="#546273" stroke="#a3aeb7"/><text x="${x+32}" y="${y+175}" fill="#eef7ff" font-size="9" font-family="sans-serif">GEFORCE RTX 5090</text><rect x="${x+10}" y="${y+h-38}" width="${wide-20}" height="26" fill="${side}"/>${fans}<rect x="${x+10}" y="${y+12}" width="${wide-20}" height="${h-24}" fill="url(#glass-${b.key})" opacity=".3"/><path d="M${x+14} ${y+18} L${x+wide-16} ${y+18} L${x+14} ${y+h-50}z" fill="#e6f4ff" opacity=".035"/>${[x+15,x+wide-30].map(px=>`<rect x="${px}" y="${y+h}" width="20" height="10" rx="2" fill="#65717e"/>`).join('')}</svg>`;
}
const drawStandardThumbs=drawBuildThumbs;drawBuildThumbs=function(){drawStandardThumbs();qa('.config').forEach(card=>{const b=builds.find(x=>x.key===card.dataset.build);if(!b?.premium)return;const thumb=card.querySelector('.case-thumb');thumb.classList.add('premium-preview');thumb.innerHTML=premiumPreview(b)+'<span class="premium-caption">'+b.case+' · '+b.caseDims.join(' × ')+' mm<br>Aperçu de conception · non contractuel</span>'})};
const standardCaseFactory=createCaseForBuild;createCaseForBuild=function(b){const g=standardCaseFactory(b);if(!b.premium)return g;const D=b.caseType==='h6'?4.15:b.caseType==='o11'?4.78:4.7,H=b.caseType==='h6'?4.35:4.7,W=b.caseType==='h6'?2.87:b.caseType==='o11'?2.9:3.2;
 // Exterior trim stays on the chassis perimeter and follows the exploded case.
 const alloy=mat((b.caseModel?.white||b.case.includes('blanc'))?0xe1e7ec:0x697686,.8,.3);for(const y of [-H/2+.04,H/2-.04]){const rail=box(D,.055,.065,alloy);rail.position.set(0,y,W/2+.04);g.add(rail)}
 for(let i=0;i<24;i++){const slot=box(.07,.012,W*.66,mat(0x05090e,.3,.8));slot.position.set(-D*.35+i*D*.03,H/2+.005,0);g.add(slot)}
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(D-.4,H-.4),new THREE.MeshPhysicalMaterial({color:0xb6d7eb,transparent:true,opacity:.045,roughness:.1,metalness:.1,side:THREE.DoubleSide,depthWrite:false}));glass.position.z=W/2+.03;g.add(glass);
 if(b.form===1){g.scale.set(1,1.12,1);g.position.y=.25}return g;};

const premiumCoolerBase=createStudioCooler;createStudioCooler=function(b,h){const g=premiumCoolerBase(b,h);if(!b.premium||!b.customLoop)return g;
 const tank=cyl(.13,.72,new THREE.MeshPhysicalMaterial({color:0xafdfff,transparent:true,opacity:.3,roughness:.1,metalness:.1,depthWrite:false}),32);tank.position.set(.80,-.85,.3);g.add(tank);
 const liquid=cyl(.09,.57,mat(b.theme,.2,.25,b.theme,.25),24);liquid.position.copy(tank.position);g.add(liquid);
 for(const y of [-1.22,-.48]){const cap=cyl(.15,.08,mat(0x545f6c,.8,.25),24);cap.position.set(.80,y,.3);g.add(cap)}
 g.add(createCoolantTube([new THREE.Vector3(.8,-1.2,.3),new THREE.Vector3(.8,-1.4,.4),new THREE.Vector3(-.2,-1.4,.4),new THREE.Vector3(-.3,-1.05,.3)],b.theme));return g};

// Complete assemblies are ranked, including every cost before the budget check.
let compositionPool=[],compositionPage=0,compositionSignature='',catalogMinimum=0;
function generateDynamicBuilds(){
 if(selBudget===null)return;
 const band=targetBand(),cap=band.active?band.high:band.price,signature=JSON.stringify([targetPriceMode,cap,selRes,selMonitor,[...selUsages].sort(),[...selPriorities].sort(),selStyle]);
 if(signature!==compositionSignature){
 compositionSignature=signature;compositionPage=0;benchKey=null;compositionPool=[];catalogMinimum=Infinity;
 const creative=selUsages.includes(2)||selPriorities.includes(3),stream=selUsages.includes(3),esport=selUsages.includes(0)||selPriorities.includes(0),visual=selPriorities.includes(1),silent=selPriorities.includes(2),simulation=selUsages.includes(4),mixed=selUsages.includes(5)||selPriorities.includes(4);
 const gpuWeight=(selRes==='4K'||selRes==='UWQHD')?.72:esport||(mon()&&mon().hz>=240)?.48:visual?.68:.60;
 const cases=realCaseOptions().filter(c=>c.id!=='9000d');
 for(const cpu of dynamicCPUs)for(const gpu of dynamicGPUs){
 if(gpu.apu&&!cpu.igpu)continue;
 const boardPrice=cpu.intel?80:cpu.tier>=3?235:110;
 for(const ramGB of [16,32,64])for(const ssdTB of [.5,1,2,4])for(const pcCase of cases)for(const cooling of ['air','aio']){
 if(!caseFits(pcCase,gpu,cooling))continue;
 const rgb=selStyle===1,white=selStyle===2,ramPrice=({16:50,32:90,64:190})[ramGB]+(rgb?15:0),ssdPrice=({'0.5':40,1:65,2:125,4:260})[ssdTB],coolPrice=cooling==='aio'?160:cpu.tier>=3?40:25,casePrice=pcCase.price,psuPrice=gpu.w>=1000?160:gpu.w>=850?125:gpu.w>=750?105:gpu.w>=650?75:55;
 const costs={Processeur:cpu.price,Graphique:gpu.price,'Carte mère':boardPrice,'Mémoire':ramPrice,Stockage:ssdPrice,Refroidissement:coolPrice,Boîtier:casePrice,Alimentation:psuPrice,Ventilation:pcCase.extraFans};
 const total=Object.values(costs).reduce((a,b)=>a+b,0);catalogMinimum=Math.min(catalogMinimum,total);if(total>cap)continue;
 const gaming=1/(gpuWeight/gpu.score+(1-gpuWeight)/(cpu.game*1.4));
 const memoryUtility=creative||stream||simulation?({16:-24,32:8,64:18})[ramGB]:({16:0,32:7,64:8})[ramGB];
 const storageUtility=(creative||mixed?7:3)*Math.log2(ssdTB*2+1);
 const styleUtility=(selStyle===3&&pcCase.type==='north'?8:rgb&&pcCase!==cases[0]?4:0);
 const utility=gaming*(creative?.55:1)+(creative?cpu.work*.65:stream?cpu.work*.25:simulation?cpu.game*.22:0)+memoryUtility+storageUtility+styleUtility+(silent&&cooling==='aio'?10:0)-total*.006;
 const id=[cpu.name,gpu.name,ramGB,ssdTB,pcCase.name,cooling].join('|');
 compositionPool.push(decorateCase({id,base:total,utility,costs,cpu:cpu.name,cpuImg:'',gpu:gpu.name,gpuImg:'',mobo:cpu.intel?'Carte mère LGA1700 DDR4':cpu.tier>=3?'Carte mère AM5 DDR5 haut de gamme':'Carte mère AM5 DDR5',moboImg:'',moboFormat:cpu.tier>=3?'ATX':'mATX',ram:ramGB+' Go '+(cpu.intel?'DDR4-3200':'DDR5-6000')+(rgb?' RGB':''),ramImg:'',ramRgb:rgb,ssd:'SSD NVMe '+(ssdTB===.5?'500 Go':ssdTB+' To'),ssdImg:'',cooler:cooling==='aio'?'Refroidissement liquide 360 mm':(cpu.tier>=3?'Ventirad double tour':'Ventirad tour compact'),coolerImg:'',psu:'Alimentation '+gpu.w+' W',psuImg:'',case:pcCase.name+(white?' · finition blanche':''),caseImg:white?'':pcCase.img,caseType:pcCase.type,caseDims:pcCase.dims,theme:pcCase.theme,gpuDims:gpu.dims,gpuFans:gpu.fans,gpuRgb:rgb,cooling,score:gpu.score,rt:gpu.rt,cpuGame:cpu.game,integrated:!!gpu.apu,dynamic:true,ramGB},pcCase));
 }
 }
 compositionPool.push(...premiumCandidates().filter(b=>b.base<=cap));
 if(band.active)compositionPool=curateNearPrice(compositionPool,band);
 compositionPool=diverseCases(compositionPool);
 }
 const keys=['balanced','smart','performance','dream'];
 builds.splice(0,builds.length,...compositionPool.slice(compositionPage*4,compositionPage*4+4).map((b,i)=>({...b,key:keys[i],tier:compositionPage===0&&i===0?'OPTIMISÉ POUR TOI':'ALTERNATIVE '+(compositionPage*4+i+1),target:(b.base>band.price?'Dépassement proposé : +'+(b.base-band.price).toLocaleString('fr-FR'):'Sous la cible : '+(band.price-b.base).toLocaleString('fr-FR'))+' €'+(b.integrated?' · graphique intégré, jeux légers':'' )})));
}
function renderCompositionControls(){
 let panel=q('#composition-controls');if(!panel){panel=document.createElement('div');panel.id='composition-controls';panel.className='custom-budget';q('#configs').before(panel)}
 const n=compositionPool.length,pages=Math.ceil(n/4);
 panel.innerHTML=n?`<b>${n.toLocaleString('fr-FR')} compositions ${targetBand().active?'entre '+targetBand().low.toLocaleString('fr-FR')+' et '+targetBand().high.toLocaleString('fr-FR')+' €':'sous ton budget'}</b><p>Classées selon tes besoins. Estimations de conception, pas des devis marchands : prix non synchronisés, performances simulées et compatibilité détaillée à valider. Chaque proposition utilise un boîtier réel, avec photo et fiche constructeur. Les formes 3D sont reconstruites ; les photos montrent le boîtier, pas nécessairement les composants proposés. Le budget restant est conservé quand une dépense supplémentaire apporte peu.</p><button id="composition-prev" ${compositionPage===0?'disabled':''}>← Précédentes</button> <span>Page ${compositionPage+1} / ${pages}</span> <button id="composition-next" ${compositionPage+1>=pages?'disabled':''}>Autres compositions →</button>`:`<b>Aucun PC complet à ce montant dans le catalogue.</b><p>Premier assemblage disponible : environ ${catalogMinimum.toLocaleString('fr-FR')} €. Aucune composition dans la fourchette demandée. Désactive « Autour de mon prix » pour consulter les options moins chères. Le catalogue ne couvre pas tous les prix.</p>`;
 if(n){q('#composition-prev').onclick=()=>changeCompositionPage(-1);q('#composition-next').onclick=()=>changeCompositionPage(1)}
 qa('.config').forEach((card,i)=>{const b=builds[i],d=document.createElement('details');d.onclick=e=>e.stopPropagation();d.innerHTML='<summary>Répartition du prix</summary>'+Object.entries(b.costs).map(([k,v])=>`<div class="spec"><span>${k}</span><span>${v} €</span></div>`).join('');card.appendChild(d)});
 q('#bench-gate').classList.toggle('hidden',!n||!!benchKey);
}
function changeCompositionPage(delta){const next=compositionPage+delta;if(next<0||next>=Math.ceil(compositionPool.length/4))return;compositionPage=next;benchKey=null;compute()}
baseFps=function(b){const factor=effectiveResolutionFactor(selRes,mon());const gpu=(renderMode==='rt'?b.rt:b.score)*factor*(renderMode==='upscale'?1.58:1)*games[game].mult*quality[qualityMode];const cpu=(b.cpuGame||90)*2.4*games[game].mult;return Math.max(1,Math.min(gpu,cpu))};
const budgetBuildThree=buildThreePC;buildThreePC=function(b){budgetBuildThree(b);if(b.integrated&&threeParts.gpu){threeParts.gpu.parent.remove(threeParts.gpu);delete threeParts.gpu}};

// Dated observations: these records are deliberately not described as live offers.
const priceEvidence={
 cpu9950:{name:'AMD Ryzen 9 9950X3D',price:729.95,seller:'LDLC (page internationale en EUR)',date:'2026-09-17',url:'https://www.ldlc.com/en/product/PB00671173.html',sku:'100-100000719WOF',availability:'En stock lors du relevé'},
 caseBlack:{name:'CORSAIR 9000D RGB AIRFLOW noir',price:574.90,seller:'CORSAIR France',date:'2026-09-17',url:'https://www.corsair.com/fr/fr/p/pc-cases/cc-9011273-ww/9000d-rgb-airflow-super-full-tower-pc-case-cc-9011273-ww',sku:'CC-9011273-WW',availability:'En stock lors du relevé',image:'assets/images/corsair-9000d-black.webp'},
 caseWhite:{name:'CORSAIR 9000D RGB AIRFLOW blanc',price:574.90,seller:'CORSAIR France',date:'2026-09-17',url:'https://www.corsair.com/fr/fr/p/pc-cases/cc-9011274-ww/9000d-rgb-airflow-super-full-tower-pc-case-cc-9011274-ww',sku:'CC-9011274-WW',availability:'En stock lors du relevé',image:'assets/images/corsair-9000d-white.webp'},
 fans:{name:'CORSAIR iCUE LINK QX120 RGB · kit de 3',price:104.90,seller:'CORSAIR France',date:'2026-09-17',url:'https://www.corsair.com/fr/fr/p/case-fans/co-9051002-ww/icue-link-qx120-rgb-120mm-pwm-pc-fans-starter-kit-with-icue-link-system-hub-co-9051002-ww',sku:'CO-9051002-WW',availability:'En stock lors du relevé'}
};
const moneyFR=n=>n.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
const unsourcedPremium=premiumCandidates;
premiumCandidates=function(){return unsourcedPremium().map(b=>{
 const c=b.caseModel; b.priceSources={};
 if(b.cpu==='Ryzen 9 9950X3D'){b.costs.Processeur=priceEvidence.cpu9950.price;b.priceSources.Processeur={...priceEvidence.cpu9950,quantity:1}}
 delete b.costs['Ventilateurs et câblage']; b.costs.Ventilation=c.id==='9000d'?209.8:c.extraFans;
 if(c.id==='9000d')b.priceSources.Ventilation={...priceEvidence.fans,quantity:2};
 const old=b.base;b.base=Math.round(Object.values(b.costs).reduce((a,v)=>a+v,0)*100)/100;b.utility-=(b.base-old)*.003;b.id+='|'+c.id;
 return decorateCase(b,c);
})};
function evidenceDetails(b){const evidence=b.priceSources||{},count=Object.keys(evidence).length;return `<details class="evidence-panel"><summary>Prix et références · ${count}/${Object.keys(b.costs).length} lignes sourcées</summary><p>Total mixte : ${moneyFR(b.base)}<br>Prix relevés : ${moneyFR(b.sourcedSubtotal||0)} · À confirmer : ${moneyFR(b.base-(b.sourcedSubtotal||0))}</p>${Object.entries(b.costs).map(([label,value])=>{const e=evidence[label];return `<div class="evidence-row"><b>${label} · ${moneyFR(value)}</b>${e?`<span class="evidence-ok">Relevé du ${e.date} · quantité ${e.quantity}</span><span>${e.name} · ${e.sku}</span><a href="${e.url}" target="_blank" rel="noopener">Vérifier chez ${e.seller} ↗</a><small>${e.availability}. Disponibilité à reconfirmer ; livraison, montage et système non inclus.</small>`:'<span class="evidence-pending">Estimation · référence ou prix marchand à confirmer</span>'}</div>`}).join('')}<p>Les relevés sont datés et ne se mettent pas à jour automatiquement. Un prix sourcé ne valide pas la compatibilité complète du montage.</p></details>`}
const controlsWithoutEvidence=renderCompositionControls;renderCompositionControls=function(){controlsWithoutEvidence();qa('.config').forEach(card=>{const b=builds.find(x=>x.key===card.dataset.build);if(!b)return;card.querySelector('details')?.remove();card.insertAdjacentHTML('beforeend',evidenceDetails(b));card.querySelector('.evidence-panel').onclick=e=>e.stopPropagation()})};
const renderDetailWithoutEvidence=renderDetail;renderDetail=function(){renderDetailWithoutEvidence();if(currentBuild?.costs)q('#detail').insertAdjacentHTML('beforeend',evidenceDetails(currentBuild));if(currentBuild?.caseOfficial)q('#detail').insertAdjacentHTML('beforeend',`<p class="source-caption">Boîtier : dimensions constructeur ${currentBuild.caseDims.join(' × ')} mm (profondeur × largeur × hauteur). La vue 3D reste une reconstruction simplifiée ; BIOS, QVL, connecteurs et dégagements restent à valider.</p>`)};
const drawBeforeOfficialPhotos=drawBuildThumbs;drawBuildThumbs=function(){drawBeforeOfficialPhotos();qa('.config').forEach(card=>{const b=builds.find(x=>x.key===card.dataset.build);if(!b?.caseOfficial)return;const thumb=card.querySelector('.case-thumb');thumb.classList.add('official-case-preview');thumb.innerHTML=`<img class="official-case-image" src="${b.caseOfficial.image}" alt="Photo officielle du boîtier ${b.case}"><div class="official-photo-fallback" hidden>Photo indisponible · consulte la fiche constructeur</div><div class="official-caption"><strong>${b.case}</strong><span>Photo constructeur du boîtier · composants montrés non garantis inclus</span><a href="${b.caseOfficial.url}" target="_blank" rel="noopener">Fiche officielle et autres vues ↗</a></div>`;thumb.querySelector('a').onclick=e=>e.stopPropagation();thumb.querySelector('img').onerror=e=>{e.target.hidden=true;thumb.querySelector('.official-photo-fallback').hidden=false}})};
const caseBeforeMeasuredShell=createCaseForBuild;createCaseForBuild=function(b){if(!b.caseOfficial)return caseBeforeMeasuredShell(b);
 const g=new THREE.Group();g.userData.part='case';const H=4.9,D=4.9,W=4.9*307/698,white=(b.caseModel?.white||b.case.includes('blanc')),steel=mat(white?0xe3e5e7:0x22282f,.55,.42),trim=mat(white?0xc0c6ce:0x46515c,.8,.3);
 function panel(w,h,d,x,y,z,m=steel){const mesh=box(w,h,d,m);mesh.position.set(x,y,z);g.add(mesh);return mesh}
 panel(D,.10,W,0,H/2,0);panel(D,.10,W,0,-H/2,0);panel(.10,H,W,-D/2,0,0);panel(D,H,.06,0,0,-W/2);
 for(const x of [-D/2,D/2])for(const z of [-W/2,W/2])panel(.09,H,.09,x,0,z,trim);
 for(const x of [-D*.34,D*.34])for(const z of [-W*.3,W*.3])panel(.38,.16,.30,x,-H/2-.1,z);
 // Front mesh: thin horizontal slats reveal the intake fans.
 for(let i=0;i<58;i++)panel(.035,.025,W-.16,D/2,-H/2+.15+i*(H-.3)/57,0,trim);
 for(let i=0;i<3;i++)addCaseFan(g,D/2-.22,1.28-i*1.25,0,.51,-Math.PI/2,0,selStyle===1,b.theme);
 for(let i=0;i<4;i++)panel(.035,.055,.09,D/2+.03,H/2-.2,-.35+i*.18,mat(0x07090b,.2,.6));
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(D-.2,H-.2),new THREE.MeshPhysicalMaterial({color:0xcde2ef,transparent:true,opacity:.055,roughness:.13,metalness:.1,depthWrite:false,side:THREE.DoubleSide}));glass.position.z=W/2+.02;g.add(glass);glassMesh=glass;return g;
};

// Real chassis catalogue: model evidence is separate from merchant price evidence.
const casePhotos={"focus": "assets/images/case-focus.jpg", "north": "assets/images/case-north.png", "h6-black": "assets/images/case-h6-black.png", "h6-white": "assets/images/case-h6-white.png", "y70": "assets/images/case-y70.jpg"};
const realCases=[
 {id:'focus',name:'Fractal Focus 2 RGB · noir',type:'north',shape:'mesh',dims:[471.5,215,450.5],price:79,gpuMax:405,airMax:170,topRad:240,frontRad:360,included:2,extraFans:15,sku:'FD-C-FOC2A-03',url:'https://www.fractal-design.com/products/cases/focus-series/focus-2/focus-2-rgb-black-tg-clear-tint/',image:casePhotos.focus,theme:0x76d9df,reason:'Deux grands ventilateurs inclus et une façade ouverte : le budget reste concentré sur les composants.',fanText:'2 × 140 mm avant inclus + extraction arrière budgétée'},
 {id:'h6',name:'NZXT H6 Flow RGB',type:'h6',shape:'angled',dims:[415,287,435],price:135,gpuMax:365,airMax:163,topRad:360,included:3,extraFans:15,sku:'CC-H61FB-R1',url:'https://nzxt.com/products/h6-flow-rgb',image:casePhotos['h6-black'],theme:0x67dcff,reason:'Double chambre et arrivée d’air inclinée : une vue dégagée dans un format moins haut.',fanText:'3 × 120 mm inclinés inclus + extraction arrière budgétée'},
 {id:'northxl',name:'Fractal North XL RC · noir',type:'north',shape:'wood',dims:[503,240,509],price:199,gpuMax:413,airMax:169,topRad:360,included:3,extraFans:15,sku:'FD-C-NOR1X-05',url:'https://www.fractal-design.com/products/cases/north-series/north-xl/north-xl-rc-charcoal-black-tg-dark/',image:casePhotos.north,theme:0xc99b67,reason:'Façade en bois et grand volume ventilé : une machine sobre avec de la place pour évoluer.',fanText:'3 × 140 mm avant inclus + extraction arrière budgétée'},
 {id:'y70',name:'HYTE Y70 · Snow White',type:'y70',shape:'panorama',white:true,dims:[470,320,470],price:225,gpuMax:422,airMax:180,topRad:360,included:0,extraFans:60,sku:'CS-HYTE-Y70-WW',url:'https://hyte.com/store/y70/cs-hyte-y70-ww',image:casePhotos.y70,theme:0xa8c7ff,reason:'Vitre panoramique en trois parties et carte graphique verticale : les composants deviennent visibles.',fanText:'Ventilateurs supplémentaires budgétés · riser PCIe 4.0 inclus'},
 {id:'9000d',name:'Corsair 9000D RGB Airflow',type:'h6',shape:'super',dims:[698,307,698],price:574.9,gpuMax:400,airMax:180,topRad:360,included:0,extraFans:209.8,theme:0x79dcff,reason:'Très grand châssis pour une installation ambitieuse et un circuit de refroidissement évolutif.',fanText:'2 kits QX120 (6 ventilateurs) budgétés · capacité supérieure du châssis non entièrement représentée'}
];
function realCaseOptions(){return realCases.map(original=>{
 const c={...original};
 if(c.id==='h6'){c.white=selStyle===2;c.name+=' · '+(c.white?'blanc':'noir');c.image=casePhotos[c.white?'h6-white':'h6-black'];c.sku=c.white?'CC-H61FW-R1':'CC-H61FB-R1'}
 if(c.id==='9000d'){c.evidence=selStyle===2?priceEvidence.caseWhite:priceEvidence.caseBlack;Object.assign(c,{name:c.evidence.name,url:c.evidence.url,image:c.evidence.image,sku:c.evidence.sku,white:selStyle===2})}
 return c;
})}
function caseFits(c,gpu,cooling){const clearance=c.gpuMax-(cooling==='aio'&&c.topRad<360?55:0);return (gpu.dims?.[0]||0)<=clearance&&(cooling!=='aio'||Math.max(c.topRad,c.frontRad||0)>=360)}
function decorateCase(b,c){
 b.caseModel=c;b.case=c.name;b.caseType=c.type;b.caseDims=c.dims;b.caseImg=c.image;b.caseOfficial={name:c.name,image:c.image,url:c.url,sku:c.sku};b.theme=c.theme;
 b.priceSources=b.priceSources||{};delete b.priceSources.Boîtier;
 if(c.evidence)b.priceSources.Boîtier={...c.evidence,quantity:1};
 b.sourcedSubtotal=Object.keys(b.priceSources).reduce((sum,key)=>sum+(b.costs[key]||0),0);
 return b;
}
function diverseCases(pool,limit=pool.length){
 const sorted=[...pool].sort((a,b)=>b.utility-a.utility||a.base-b.base),out=[],buckets=new Map();
 for(const b of sorted){const id=b.caseModel.id;if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push(b)}
 const positions=new Map([...buckets.keys()].map(k=>[k,0]));
 while(out.length<limit){let used=new Set();for(let slot=0;slot<4&&out.length<limit;slot++){
  const heads=[...buckets].map(([id,items])=>({id,b:items[positions.get(id)]})).filter(x=>x.b).sort((a,b)=>b.b.utility-a.b.utility||a.b.base-b.b.base);
  if(!heads.length)return out;const best=heads[0];const pick=heads.find(x=>!used.has(x.id)&&x.b.utility>=best.b.utility-Math.max(12,Math.abs(best.b.utility)*.1))||best;
  used.add(pick.id);positions.set(pick.id,positions.get(pick.id)+1);out.push(pick.b);
 }}return out;
}

function chassisMetrics(b){const c=b.caseModel,s=Math.min(.01,5.3/c.dims[2]);return {D:c.dims[0]*s,W:c.dims[1]*s,H:c.dims[2]*s}}
const oldHomeForCases=homeLayout;homeLayout=function(b){if(!b.caseModel)return oldHomeForCases(b);const c=b.caseModel,{D,W,H}=chassisMetrics(b),dual=['angled','panorama'].includes(c.shape),z=dual?-.53:-W/2+.28;
 return {mobo:[-.35,.08,z],cpu:[-.42,.62,z+.23],ram:[.20,.61,z+.16],ssd:[-.22,-.06,z+.16],gpu:[-.12,-.73,c.shape==='panorama'?.4:z+.68],psu:dual?[.4,-1.65,-W/2+.48]:[-.6,-1.84,0],cooler:b.cooling==='aio'?(c.id==='focus'?[D/2-.35,H/2-2.25,0]:[-.05,H-2.65,0]):[-.4,.67,z+.55]};};
const oldCaseGeometry=createCaseForBuild;
createCaseForBuild=function(b){if(!b.caseModel)return oldCaseGeometry(b);
 const c=b.caseModel,{D,W,H}=chassisMetrics(b),g=new THREE.Group(),cy=H/2-2.25,dual=['angled','panorama'].includes(c.shape),white=c.white;g.userData.part='case';
 const steel=mat(white?0xe3e6e9:0x242a31,.68,.38),trim=mat(white?0xc0c6ce:0x515a66,.85,.24),dark=mat(0x0b0e12,.3,.75),wood=mat(0x805235,.12,.62);
 function p(w,h,d,x,y,z,m=steel){const o=box(w,h,d,m);o.position.set(x,y+cy,z);g.add(o);return o}
 // All skin panels stay at the chassis boundary. No full slab across the components.
 p(D,.12,W,0,-H/2+.06,0);p(D,.10,W,0,H/2-.05,0);p(.08,H-.2,W,-D/2+.04,0,0);p(D-.16,H-.2,.06,0,0,-W/2+.03);
 for(const x of [-D/2+.06,D/2-.06])for(const z of [-W/2+.06,W/2-.06]){
  if(c.shape==='panorama'&&x>0&&z>0)continue;p(.09,H-.15,.09,x,0,z,trim);
 }
 for(const y of [-H/2+.14,H/2-.12])p(D-.12,.10,.08,0,y,W/2-.04,trim);
 for(const x of [-D*.34,D*.34])for(const z of [-W*.32,W*.32])p(.40,.14,.32,x,-H/2-.07,z,dark);
 // Roof ventilation and inset manufacturing seams.
 for(let i=0;i<32;i++)p(.018,.008,W*.70,-D*.38+i*D*.76/31,H/2+.003,0,dark);
 for(let i=0;i<7;i++)p(.014,.055,W*.38,-D/2-.005,-.45-i*.115,0,dark);
 for(let i=0;i<4;i++)p(.016,.07,.10,-D/2-.008,.70-i*.19,-.08,dark);
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xc8d8e6,metalness:.08,roughness:.12,transparent:true,opacity:.065,side:THREE.DoubleSide,depthWrite:false});
 const bevel=c.shape==='panorama'?.55:0;
 const sideGlass=new THREE.Mesh(new THREE.PlaneGeometry(D-.18-bevel,H-.32),glassMat);sideGlass.position.set(-bevel/2,cy,W/2+.004);g.add(sideGlass);glassMesh=sideGlass;
 if(dual){
  const front=new THREE.Mesh(new THREE.PlaneGeometry(W-.2-bevel,H-.32),glassMat);front.rotation.y=Math.PI/2;front.position.set(D/2+.004,cy,-bevel/2);g.add(front);
  if(bevel){const corner=new THREE.Mesh(new THREE.PlaneGeometry(bevel*Math.SQRT2,H-.32),glassMat);corner.rotation.y=Math.PI/4;corner.position.set(D/2-bevel/2,cy,W/2-bevel/2);g.add(corner);for(const y of [-H/2+.12,H/2-.12]){const bar=p(bevel*Math.SQRT2,.10,.08,D/2-bevel/2,y,W/2-bevel/2,trim);bar.rotation.y=Math.PI/4}}
  for(let i=0;i<3;i++){
   const fan=addCaseFan(g,D/2-.48,cy+.98-i*1.08,-W/2+.54,.45,c.shape==='angled'?-Math.PI/4:0,0,selStyle===1,b.theme);
  }
  if(c.shape==='angled')for(let i=0;i<16;i++){const strip=p(.03,H-.36,.04,D/2-.23,0,-W/2+.14+i*.05,trim);strip.rotation.y=Math.PI/4}
  if(c.shape==='panorama')for(let i=0;i<3;i++)addCaseFan(g,-1.1+i*1.08,cy-H/2+.23,0,.43,0,Math.PI/2,selStyle===1,b.theme);
 }else{
  const count=c.id==='focus'?2:3,rad=c.id==='focus'?.58:.53;
  for(let i=0;i<count;i++)addCaseFan(g,D/2-.24,cy+(count-1)*.64-i*1.28,0,rad,-Math.PI/2,0,selStyle===1&&c.shape!=='wood',b.theme);
  if(c.shape==='wood'){
   for(let i=0;i<13;i++){const slat=p(.07,H-.35,.095,D/2+.015,0,-W/2+.16+i*(W-.32)/12,wood);for(let line=0;line<2;line++)p(.008,H-.43,.005,D/2+.055,0,slat.position.z-.023+line*.041,mat(0x5c3c29,.1,.8))}
  }else{
   for(let i=0;i<42;i++)p(.018,.018,W-.20,D/2+.015,-H/2+.17+i*(H-.34)/41,0,trim);
   for(let i=0;i<14;i++)p(.012,H-.30,.012,D/2+.022,0,-W/2+.16+i*(W-.32)/13,dark);
  }
 }
 // Small fasteners and ports are attached to the outer frame only.
 for(const x of [-D/2+.13,D/2-.13])for(const y of [-H/2+.15,H/2-.15]){if(bevel&&x>0)continue;const screw=cyl(.025,.015,trim,12);screw.rotation.x=Math.PI/2;screw.position.set(x,y+cy,W/2+.016);g.add(screw)}
 for(let i=0;i<3;i++)p(.024,.045,.11,D/2+.02,-H/2+.24,-.22+i*.18,dark);
 addCaseFan(g,-D/2+.18,cy+.94,0,.42,Math.PI/2,0,selStyle===1,b.theme);
 return g;
};
function casePresentation(b){const c=b.caseModel;if(!c)return '';const room=Math.round(c.gpuMax-(b.cooling==='aio'&&c.topRad<360?55:0)-(b.gpuDims?.[0]||0));return `<section class="case-fit"><div class="case-fit-label">LE BOÎTIER DE CETTE CONFIGURATION</div><h4>${c.name}</h4><p>${c.reason}</p><div class="case-facts"><span>${c.dims[0]} × ${c.dims[1]} × ${c.dims[2]} mm<small>Profondeur × largeur × hauteur</small></span><span>${b.cooling==='aio'?'Radiateur 360 mm · '+(c.topRad>=360?'en haut':'à l’avant'):'Refroidissement par air'}<small>Implantation prévue</small></span></div><p class="case-fit-note">${c.fanText}. ${room>=0?'Marge longitudinale calculée pour le GPU : '+room+' mm.':''} Dimensions du GPU indicatives : la référence exacte, les câbles et l’épaisseur du radiateur restent à confirmer.</p><a href="${c.url}" target="_blank" rel="noopener">Dimensions et fiche constructeur ↗</a></section>`}
const detailWithCaseEvidence=renderDetail;renderDetail=function(){detailWithCaseEvidence();if(currentBuild?.caseModel)q('#detail').insertAdjacentHTML('afterbegin',casePresentation(currentBuild))};
const thumbsWithSource=drawBuildThumbs;drawBuildThumbs=function(){thumbsWithSource();qa('.config').forEach(card=>{const b=builds.find(x=>x.key===card.dataset.build);if(!b?.caseModel)return;const t=card.querySelector('.case-thumb');t.classList.add('case-product');t.querySelector('.official-caption span').textContent='Photo du boîtier réel · '+b.caseDims.join(' × ')+' mm';if(!card.querySelector('.case-fit')){card.insertAdjacentHTML('beforeend',casePresentation(b));card.querySelector('.case-fit').onclick=e=>e.stopPropagation()}})};

const coolerBeforeFrontLayout=createStudioCooler;
createStudioCooler=function(b,h){if(b.caseModel?.id!=='focus'||b.cooling!=='aio')return coolerBeforeFrontLayout(b,h);
 const g=new THREE.Group(),radiator=createStudioAIO();radiator.rotation.z=-Math.PI/2;g.add(radiator);const pump=createPump();pump.position.set(h.cpu[0]-h.cooler[0],h.cpu[1]-h.cooler[1]+.04,h.cpu[2]-h.cooler[2]+.30);g.add(pump);
 for(const offset of [-.08,.08])g.add(createCable([pump.position.clone().add(new THREE.Vector3(0,offset,0)),new THREE.Vector3(-.65,.85,.3),new THREE.Vector3(-.12,1.1+offset,.08)],0x14191e,.045));return g;
};

// Closing the guide persists independently of level, quiz and configuration changes.
let helpDismissed=(()=>{try{return localStorage.getItem('readoutHelpDismissed')==='1'}catch(_){return false}})();
const helpReopen=document.createElement('button');helpReopen.id='help-reopen';helpReopen.type='button';helpReopen.textContent='? Réactiver l’aide';helpReopen.className='help-reopen';helpReopen.hidden=!helpDismissed;document.body.appendChild(helpReopen);
const updateHelpBeforeDismissal=updateAdaptiveHelp;
updateAdaptiveHelp=function(){if(helpDismissed){q('#adaptive-help').classList.add('hidden');helpReopen.hidden=false;return}helpReopen.hidden=true;updateHelpBeforeDismissal()};
q('#ah-close').onclick=e=>{e.preventDefault();e.stopPropagation();helpDismissed=true;try{localStorage.setItem('readoutHelpDismissed','1')}catch(_){}q('#adaptive-help').classList.add('hidden');helpReopen.hidden=false;helpReopen.focus()};
helpReopen.onclick=()=>{helpDismissed=false;try{localStorage.removeItem('readoutHelpDismissed')}catch(_){}updateAdaptiveHelp();if(!userLevel)reopenLevel();else q('#ah-close').focus()};
if(helpDismissed)q('#adaptive-help').classList.add('hidden');

// Product photographs are genuine manufacturer assets, distinct from the schematic 3D meshes.
const componentPhotos={"board": "assets/images/component-board.png", "ssd": "assets/images/component-ssd.png", "gpu5080": "assets/images/gpu-rtx5080.jpg", "gpu5090-1": "assets/images/gpu-rtx5090-1.jpg", "gpu5090-2": "assets/images/gpu-rtx5090-2.jpg", "gpu5090-3": "assets/images/gpu-rtx5090-3.jpg"};
const componentProducts={
 gpu5090:{name:'NVIDIA GeForce RTX 5090 Founders Edition · 32 Go',url:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/',brand:'NVIDIA',images:[componentPhotos['gpu5090-1'],componentPhotos['gpu5090-2'],componentPhotos['gpu5090-3']]},
 gpu5080:{name:'NVIDIA GeForce RTX 5080 Founders Edition · 16 Go',url:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/',brand:'NVIDIA',images:[componentPhotos.gpu5080]},
 board:{name:'MSI MAG X870E TOMAHAWK WIFI',url:'https://www.msi.com/Motherboard/MAG-X870E-TOMAHAWK-WIFI',brand:'MSI',images:[componentPhotos.board]},
 ssd:{name:'Samsung 990 PRO · 2 To',sku:'MZ-V9P2T0BW',url:'https://www.samsung.com/fr/memory-storage/nvme-ssd/990-pro-2tb-nvme-pcie-gen-4-mz-v9p2t0bw/',brand:'Samsung',images:[componentPhotos.ssd]}
};
function attachRealProducts(b){
 b.componentProducts=b.componentProducts||{};
 const set=(part,product)=>{b.componentProducts[part]=product;b[part]=product.name;b[part+'Img']=product.images[0]};
 if(/RTX 5090/.test(b.gpu))set('gpu',componentProducts.gpu5090);
 else if(/RTX 5080/.test(b.gpu))set('gpu',componentProducts.gpu5080);
 if(b.costs?.['Carte mère']===235){set('mobo',componentProducts.board);b.moboFormat='ATX'}
 if(/^SSD NVMe 2 To$/.test(b.ssd))set('ssd',componentProducts.ssd);
 return b;
}
const caseDecorationWithProducts=decorateCase;decorateCase=function(b,c){return attachRealProducts(caseDecorationWithProducts(b,c))};
const productLabels={gpu:'Carte graphique',cpu:'Processeur',mobo:'Carte mère',ram:'Mémoire',ssd:'Stockage',cooler:'Refroidissement',psu:'Alimentation'};
function realProductMarkup(b){return `<section class="real-products"><div class="case-fit-label">LES PIÈCES DE CE PC</div><h4>Voir les composants réels</h4><p>Les photos constructeur sont associées à leur référence précise. Les pièces non documentées restent à préciser ; la vue 3D est un schéma de montage.</p><div class="real-products-grid">${Object.entries(productLabels).map(([part,label])=>{const item=b.componentProducts?.[part];return item?`<button class="real-product" type="button" data-real-part="${part}"><img src="${item.images[0]}" alt="${item.name}" loading="lazy"><span>${label}</span><b>${item.name}</b><small>Photo constructeur · agrandir ↗</small></button>`:`<div class="real-product pending-product"><span>${label}</span><b>${b[part]}</b><small>Photo exacte non intégrée</small></div>`}).join('')}</div><p class="real-price-note">Identifier la pièce ne vérifie pas son prix : les montants restent estimatifs sauf relevé marchand daté.</p></section>`}
let productViewer=null,productFocusReturn=null,activeProduct=null,productPhotoIndex=0;
function ensureProductViewer(){if(productViewer)return;productViewer=document.createElement('div');productViewer.id='product-viewer';productViewer.className='product-viewer';productViewer.hidden=true;productViewer.setAttribute('role','dialog');productViewer.setAttribute('aria-modal','true');productViewer.setAttribute('aria-labelledby','product-viewer-title');productViewer.innerHTML=`<div class="product-viewer-card"><header><div><small id="product-viewer-brand"></small><h3 id="product-viewer-title"></h3></div><button type="button" id="product-viewer-close" aria-label="Fermer la photo du composant">×</button></header><div class="product-image-stage"><img id="product-viewer-image" alt=""></div><nav aria-label="Vues du composant"><button type="button" id="product-photo-prev" aria-label="Photo précédente">←</button><span id="product-photo-count" aria-live="polite"></span><button type="button" id="product-photo-next" aria-label="Photo suivante">→</button><label>Zoom <input id="product-photo-zoom" type="range" min="1" max="2.5" step=".1" value="1"></label></nav><footer><a id="product-viewer-source" target="_blank" rel="noopener">Fiche constructeur ↗</a><button type="button" id="product-viewer-back">Revenir au montage 3D</button><p>Photographies constructeur. Les angles disponibles ne constituent pas un modèle 3D à 360°.</p></footer></div>`;document.body.appendChild(productViewer);
 q('#product-viewer-close').onclick=closeRealProduct;q('#product-viewer-back').onclick=closeRealProduct;
 q('#product-photo-prev').onclick=()=>changeProductPhoto(-1);q('#product-photo-next').onclick=()=>changeProductPhoto(1);
 q('#product-photo-zoom').oninput=e=>q('#product-viewer-image').style.transform=`scale(${e.target.value})`;
 productViewer.onclick=e=>{if(e.target===productViewer)closeRealProduct()};
 document.addEventListener('keydown',e=>{if(productViewer.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeRealProduct()}else if(e.key==='ArrowRight'&&e.target.type!=='range'){e.preventDefault();changeProductPhoto(1)}else if(e.key==='ArrowLeft'&&e.target.type!=='range'){e.preventDefault();changeProductPhoto(-1)}else if(e.key==='Tab'){const els=[...productViewer.querySelectorAll('button:not([disabled]),a,input')],first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}},true);
}
function showProductPhoto(){const img=q('#product-viewer-image');img.src=activeProduct.images[productPhotoIndex];img.alt=activeProduct.name+' · vue '+(productPhotoIndex+1);img.style.transform='scale(1)';q('#product-photo-zoom').value=1;q('#product-photo-count').textContent=`Vue ${productPhotoIndex+1} / ${activeProduct.images.length}`;q('#product-photo-prev').disabled=q('#product-photo-next').disabled=activeProduct.images.length<2}
function changeProductPhoto(delta){productPhotoIndex=(productPhotoIndex+delta+activeProduct.images.length)%activeProduct.images.length;showProductPhoto()}
function openRealProduct(part){const item=currentBuild?.componentProducts?.[part];if(!item)return;ensureProductViewer();productFocusReturn=document.activeElement;activeProduct=item;productPhotoIndex=0;q('#product-viewer-title').textContent=item.name;q('#product-viewer-brand').textContent=item.brand+' · PHOTO CONSTRUCTEUR';q('#product-viewer-source').href=item.url;showProductPhoto();productViewer.hidden=false;q('#product-viewer-close').focus()}
function closeRealProduct(){if(!productViewer)return;productViewer.hidden=true;if(productFocusReturn?.isConnected)productFocusReturn.focus()}
function attachPartPhotoButton(id){const item=currentBuild?.componentProducts?.[id],panel=q('#part-detail');if(!item||!panel)return;panel.insertAdjacentHTML('beforeend',`<button type="button" class="part-real-photo"><img src="${item.images[0]}" alt="${item.name}"><span>Voir la vraie pièce en grand ↗</span></button>`);panel.querySelector('.part-real-photo').onclick=()=>openRealProduct(id)}
const selectPartWithProduct=selectPart;selectPart=function(id){selectPartWithProduct(id);if(currentView!=='exploded')attachPartPhotoButton(id)};
const focusPartWithProduct=focusExplodedPart;focusExplodedPart=function(id){focusPartWithProduct(id);attachPartPhotoButton(id)};
const detailBeforeProducts=renderDetail;renderDetail=function(){detailBeforeProducts();if(!currentBuild)return;attachRealProducts(currentBuild);q('#detail').insertAdjacentHTML('afterbegin',realProductMarkup(currentBuild));q('#detail').querySelectorAll('[data-real-part]').forEach(btn=>btn.onclick=()=>openRealProduct(btn.dataset.realPart))};

/* Catalogue visuel étendu : photos de produits et géométrie adaptée à la configuration. */
const componentCataloguePhotos={"nv3":"assets/images/component-nv3.webp","air":"assets/images/component-air.webp","intelboard":"assets/images/component-intelboard.webp","psu1600":"assets/images/component-psu1600.webp","ram5":"assets/images/component-ram5.webp","block":"assets/images/component-block.webp","pump":"assets/images/component-pump.webp","compact":"assets/images/component-compact.webp","loopfans":"assets/images/component-loopfans.webp","ram5rgb":"assets/images/component-ram5rgb.webp","psu1200":"assets/images/component-psu1200.webp","ram96":"assets/images/component-ram96.webp","intel":"assets/images/component-intel.webp","ram4":"assets/images/component-ram4.webp","aio":"assets/images/component-aio.webp","loop":"assets/images/component-loop.webp","carbon":"assets/images/component-carbon.webp","amdboard":"assets/images/component-amdboard.webp","ram96rgb":"assets/images/component-ram96rgb.webp"};
const componentSources={
 ram4:'https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr4-memory',ram5:'https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory',ram96:'https://www.kingston.com/en/memory/gaming/kingston-fury-renegade-ddr5-memory',
 air:'https://www.thermalright.com/product/peerless-assassin-120-se/',compact:'https://www.thermalright.com/product/assassin-x-120-refined-se/',aio:'https://www.thermalright.com/product/frozen-notte-360-black-argb-v2/',loop:'https://www.corsair.com/fr/fr/p/custom-liquid-cooling/cx-9070008-ww/hydro-x-series-icue-xh305i-rgb-pro-custom-cooling-kit-black-cx-9070008-ww',
 nv3:'https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd',psu:'https://www.bequiet.com/en/powersupply/pure-power-12/4063',psu1200:'https://www.corsair.com/us/en/p/psu/cp-9020281-na/hx1200i-fully-modular-ultra-low-noise-platinum-atx-1200-watt-pc-power-supply-cp-9020281-na',psu1600:'https://www.corsair.com/us/en/p/psu/cp-9020087-na/ax1600i-digital-atx-power-supply-1600-watt-fully-modular-psu-cp-9020087-na',
 intel:'https://www.intel.com/content/www/us/en/products/sku/132223/intel-core-i312100f-processor-12m-cache-up-to-4-30-ghz/specifications.html',intelboard:'https://www.msi.com/Motherboard/PRO-H610M-E-DDR4',amdboard:'https://www.asrock.com/mb/AMD/B650M-HDVM.2/index.asp',carbon:'https://www.msi.com/Motherboard/MPG-X870E-CARBON-WIFI'
};
const escapeProduct=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enrichBaseProducts=attachRealProducts;
attachRealProducts=function(b){
 enrichBaseProducts(b);if(!b||b.productsEnriched)return b;b.productsEnriched=true;
 const original={cpu:b.cpu,ram:b.ram,ssd:b.ssd,psu:b.psu,cooler:b.cooler,mobo:b.mobo,gpu:b.gpu};b.originalParts=original;
 const item=(name,brand,url,key,note,specs,captions)=>({name,brand,url,images:key&&componentCataloguePhotos[key]?[componentCataloguePhotos[key]]:[],photoNote:note||'',specs:specs||[],captions:captions||[]});
 const set=(part,x,rename=true)=>{b.componentProducts[part]=x;if(rename)b[part]=x.name;if(x.images[0])b[part+'Img']=x.images[0]};
 const intel=/Intel/i.test(original.cpu),rm=original.cpu?.match(/Ryzen (\d) (\w+)/);
 if(rm){const model=rm[2],series=model[0]+'000',exact=model==='9800X3D',cpuItem=item(original.cpu,'AMD',`https://www.amd.com/en/products/processors/desktops/ryzen/${series}-series/amd-ryzen-${rm[1]}-${model.toLowerCase()}.html`,null,exact?'Visuel officiel AMD du processeur Ryzen 7 9800X3D.':'La référence exacte est liée à sa fiche AMD ; aucun autre processeur n’est utilisé comme fausse photo.', ['1 processeur','Socket AM5','Référence exacte : '+original.cpu]);if(exact)cpuItem.images=['https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2900400-ryzen-7-9800x3d-product.jpg'];set('cpu',cpuItem,false)}
 else set('cpu',item(original.cpu,'Intel',componentSources.intel,'intel','Visuel officiel de la gamme Intel Core i3.', ['1 processeur','Socket LGA1700','Référence exacte : '+original.cpu]),false);
 const gb=b.ramGB||Number(original.ram?.match(/(\d+)\s*Go/)?.[1])||32,ddr=intel?4:5,renegade=gb===96,modules=gb>=128?4:2;b.ramGB=gb;b.ramModules=modules;
 let rk=intel?'ram4':renegade?'ram96':'ram5';if(b.ramRgb&&!intel)rk+='rgb';
 set('ram',item(`Kingston FURY ${renegade?'Renegade':'Beast'}${b.ramRgb&&!intel?' RGB':''} · ${gb} Go DDR${ddr}`,'Kingston',componentSources[intel?'ram4':renegade?'ram96':'ram5'],rk,'Photo de gamme constructeur : la capacité exacte est indiquée dans le titre et dans les détails.',[`${modules} × ${gb/modules} Go`,`DDR${ddr} pour PC fixe`,'Fréquence et kit à valider sur la liste de compatibilité de la carte mère']));
 const tb=/500\s*Go/.test(original.ssd)?.5:Number(original.ssd?.match(/(\d+)\s*To/)?.[1])||2;b.storageTB=tb;b.storageCount=tb>4?Math.ceil(tb/4):1;
 if(!b.componentProducts.ssd)set('ssd',item(`Kingston NV3 · ${tb===.5?'500 Go':tb+' To'}`,'Kingston',componentSources.nv3,'nv3','Photo de la famille Kingston NV3 ; la capacité retenue reste écrite séparément.',[`${tb===.5?'500 Go':tb+' To'} au total`,`${b.storageCount} SSD M.2 2280`,'Nombre de ports et partage des lignes PCIe à vérifier']));
 else {b.componentProducts.ssd={...b.componentProducts.ssd,specs:['2 To','1 SSD M.2 2280'],photoNote:'Photographie du Samsung 990 PRO 2 To.'};b.storageCount=1}
 let cool;
 if(b.customLoop){cool=item('Corsair Hydro X XH305i RGB PRO · boucle CPU','Corsair',componentSources.loop,'loop','Kit constructeur complet. Les tubes sont découpés et installés selon le boîtier.',['Waterblock XC7 RGB PRO','Pompe et réservoir XD5 RGB','Radiateur XR5 360 mm','3 ventilateurs QL120 RGB']);cool.images.push(componentCataloguePhotos.block,componentCataloguePhotos.pump,componentCataloguePhotos.loopfans);cool.captions=['Kit complet','Waterblock processeur','Pompe et réservoir','Ventilateurs du circuit'];}
 else if(b.cooling==='aio')cool=item('Thermalright Frozen Notte 360 BLACK ARGB V2','Thermalright',componentSources.aio,'aio','Photo constructeur du watercooling complet.',['Radiateur 360 mm','3 ventilateurs','Bloc-pompe posé sur le processeur']);
 else {const compact=(b.costs?.Refroidissement||40)<40;b.airTowers=compact?1:2;cool=item(compact?'Thermalright Assassin X 120 Refined SE':'Thermalright Peerless Assassin 120 SE','Thermalright',componentSources[compact?'compact':'air'],compact?'compact':'air','Photo constructeur du ventirad.',[compact?'Simple tour · 148 mm':'Double tour · 155 mm','Compatible AM5 et LGA1700']);}
 set('cooler',cool);
 const watts=Number(original.psu?.match(/(\d+)\s*W/)?.[1])||650;b.psuWatts=watts;
 if(watts>=1200){const w=watts>=1600?1600:1200;set('psu',item(`Corsair ${w===1600?'AX1600i':'HX1200i'} · ${w} W`,'Corsair',componentSources['psu'+w],'psu'+w,'Photo constructeur de cette alimentation.',[`${w} W`,'Bloc entièrement modulaire','Connecteurs GPU à vérifier avant achat']))}
 else set('psu',item(original.psu,'Alimentation',componentSources.psu,null,'La puissance est définie, mais la référence commerciale exacte doit être choisie avant commande.',[`${watts} W`,'Norme, rendement et connecteurs à confirmer']),false);
 if(!b.componentProducts.mobo){const premium=!!b.premium,key=intel?'intelboard':premium?'carbon':'amdboard',ref=intel?'MSI PRO H610M-E DDR4':premium?'MSI MPG X870E CARBON WIFI':'ASRock B650M-HDV/M.2',url=componentSources[key];const mb=item(premium?original.mobo:ref,intel||premium?'MSI':'ASRock',url,key,premium?'Référence visuelle de plateforme : la carte exacte dépend du niveau de connectique retenu.':'Photo constructeur de la carte mère.',[intel?'LGA1700 · DDR4':'AM5 · DDR5',premium?'Référence visuelle : '+ref:'Format micro-ATX','BIOS et mémoire à valider']);set('mobo',mb,!premium);if(!premium)b.moboFormat='mATX'}
 if(b.integrated)set('gpu',item('AMD Radeon 760M · intégré au processeur','AMD',b.componentProducts.cpu.url,null,'Aucune carte graphique séparée : le circuit graphique se trouve dans le processeur.',['Graphique intégré','Mémoire vidéo partagée avec la RAM']),false);
 else if(!b.componentProducts.gpu){const amd=/RX/.test(original.gpu),nv=/RTX/.test(original.gpu);set('gpu',item(original.gpu,amd?'AMD':nv?'NVIDIA':'Intel',amd?'https://www.amd.com/en/products/graphics/desktops/radeon.html':nv?'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/':'https://www.intel.com/content/www/us/en/products/docs/discrete-gpus/arc/desktop/b-series/overview.html',null,'La puce est définie ; le modèle partenaire et son refroidisseur doivent encore être sélectionnés.',['Référence GPU : '+original.gpu,'Dimensions et connecteurs à confirmer selon le fabricant']),false)}
 const c=b.caseModel;if(c){set('case',item(c.name,'Boîtier',c.url||b.caseOfficial?.url,null,'Photo constructeur du châssis.',[c.dims.join(' × ')+' mm']),false);b.componentProducts.case.images=c.image?[c.image]:[];set('fans',item('Ventilation du boîtier','Configuration',c.url||b.caseOfficial?.url,b.customLoop?'loopfans':null,'Les ventilateurs du radiateur sont indiqués dans la fiche du refroidissement.',[c.fanText||'Ventilation à préciser',`${c.included||0} ventilateur(s) fourni(s) avec le boîtier`,'Modèle exact des ventilateurs supplémentaires à préciser']),false)}
 return b;
};
productLabels.case='Boîtier';productLabels.fans='Ventilateurs';
realProductMarkup=function(b){return `<section class="real-products"><div class="case-fit-label">CHAQUE PIÈCE, EN DÉTAIL</div><h4>Explorer les composants</h4><p>Ouvrez une pièce pour voir sa référence, ses visuels disponibles et les caractéristiques retenues.</p><div class="real-products-grid">${Object.entries(productLabels).map(([part,label])=>{const x=b.componentProducts?.[part];if(!x)return '';const photo=x.images?.[0];return `<button class="real-product" type="button" data-real-part="${part}">${photo?`<img src="${photo}" alt="${escapeProduct(x.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><em class="part-image-unavailable" hidden>Visuel indisponible</em>`:`<em class="part-image-unavailable">Fiche détaillée</em>`}<span>${label}</span><b>${escapeProduct(x.name)}</b><small>${photo?'Voir le visuel et la variante':'Voir la référence et les détails'} ↗</small></button>`}).join('')}</div><p class="real-price-note">Les prix restent estimatifs. Les références, connecteurs et emplacements doivent être validés avant achat. La vue 3D est une reconstitution fidèle aux dimensions et au nombre de pièces.</p></section>`};
const baseEnsureCatalogue=ensureProductViewer;ensureProductViewer=function(){baseEnsureCatalogue();if(q('#product-variant-note'))return;productViewer.querySelector('nav').insertAdjacentHTML('afterend','<div class="product-variant"><p id="product-variant-note"></p><ul id="product-variant-specs"></ul></div>');productViewer.querySelector('.product-image-stage').insertAdjacentHTML('beforeend','<p id="product-image-message" hidden></p>')};
showProductPhoto=function(){const images=(activeProduct.images||[]).filter(Boolean),img=q('#product-viewer-image'),msg=q('#product-image-message'),has=images.length>0;img.hidden=!has;msg.hidden=has;if(has){img.src=images[productPhotoIndex];img.alt=activeProduct.name+' · '+(activeProduct.captions?.[productPhotoIndex]||'vue constructeur');img.onerror=()=>{img.hidden=true;msg.hidden=false;msg.textContent='Le visuel ne peut pas être chargé. La fiche constructeur reste accessible.'}}else{img.removeAttribute('src');msg.textContent='Aucune photo exacte intégrée pour cette variante.'}img.style.transform='scale(1)';q('#product-photo-zoom').value=1;q('#product-photo-zoom').disabled=!has;q('#product-photo-count').textContent=has?`${activeProduct.captions?.[productPhotoIndex]||'Vue'} ${productPhotoIndex+1} / ${images.length}`:'Fiche du composant';q('#product-photo-prev').disabled=q('#product-photo-next').disabled=images.length<2;q('#product-variant-note').textContent=activeProduct.photoNote||'';q('#product-variant-specs').innerHTML=(activeProduct.specs||[]).map(s=>`<li>${escapeProduct(s)}</li>`).join('')};
changeProductPhoto=function(delta){const n=activeProduct?.images?.filter(Boolean).length||0;if(!n)return;productPhotoIndex=(productPhotoIndex+delta+n)%n;showProductPhoto()};
openRealProduct=function(part){const x=currentBuild?.componentProducts?.[part];if(!x)return;ensureProductViewer();productFocusReturn=document.activeElement;activeProduct=x;productPhotoIndex=0;q('#product-viewer-title').textContent=x.name;q('#product-viewer-brand').textContent=x.brand+' · '+(x.images?.length?'VISUEL CONSTRUCTEUR':'FICHE CONSTRUCTEUR');q('#product-viewer-source').href=x.url||'#';q('#product-viewer-source').hidden=!x.url;showProductPhoto();productViewer.hidden=false;q('#product-viewer-close').focus()};
attachPartPhotoButton=function(id){const x=currentBuild?.componentProducts?.[id],panel=q('#part-detail');if(!x||!panel)return;panel.querySelectorAll('.part-real-photo').forEach(e=>e.remove());panel.insertAdjacentHTML('beforeend',`<button type="button" class="part-real-photo">${x.images?.[0]?`<img src="${x.images[0]}" alt="">`:''}<span>Voir la référence et les visuels ↗</span></button>`);panel.querySelector('.part-real-photo').onclick=()=>openRealProduct(id)};
/* Géométrie : quantité, format et étiquettes suivent désormais la configuration. */
createCPU=function(b){const g=new THREE.Group(),intel=/Intel/i.test(b.cpu),w=intel?.38:.44,h=intel?.50:.44;g.add(roundedPanel(w,h,.035,.016,mat(0x184433,.2,.62)));const top=roundedPanel(w-.07,h-.07,.045,.015,mat(0xc3c6c9,.9,.22));top.position.z=.04;g.add(top);for(let i=0;i<6;i++)for(let j=0;j<6;j++){const p=box(.035,.035,.007,mat(0xc7a253,.86,.34));p.position.set(-w*.35+i*w*.14,-h*.35+j*h*.14,-.022);g.add(p)}addFaceLabel(g,b.cpu,intel?'INTEL · LGA1700':'AMD · AM5',w*.86,.12,.069);return g};
createRAMForBuild=function(b){const g=new THREE.Group(),count=b.ramModules||2;for(let i=0;i<count;i++){const stick=new THREE.Group();stick.add(box(.038,1.18,.26,mat(0x14382a,.18,.7)));for(const side of [-1,1]){const heat=roundedPanel(.028,1.12,.22,.013,mat(0x252c34,.78,.3));heat.position.x=side*.033;stick.add(heat)}for(let j=0;j<18;j++){const pin=box(.05,.037,.022,mat(0xc6a044,.84,.34));pin.position.set(0,-.55+j*.063,-.145);stick.add(pin)}if(b.ramRgb){const led=roundedPanel(.10,1.09,.033,.013,mat(0xb7c1ce,.18,.36,i%2?0x8e7dff:0x67dcff,.9));led.position.z=.14;stick.add(led)}stick.position.x=i*.16;g.add(stick)}g.userData.moduleCount=count;return g};
createSSDForBuild=function(b){const g=new THREE.Group(),count=b.storageCount||1;for(let i=0;i<count;i++){const s=new THREE.Group();s.add(roundedPanel(.80,.22,.025,.012,mat(0x14251d,.2,.7)));for(let j=0;j<3;j++){const chip=box(.14,.16,.025,mat(0x181a20,.36,.6));chip.position.set(-.23+j*.18,0,.025);s.add(chip)}for(let j=0;j<8;j++){const pin=box(.07,.018,.008,mat(0xc8a353,.9,.28));pin.position.set(.36,-.09+j*.025,.021);s.add(pin)}addFaceLabel(s,b.ssd,count>1?`SSD ${i+1}/${count}`:'M.2 2280',.63,.12,.045);s.position.y=i*.30;g.add(s)}g.userData.driveCount=count;return g};
const baseSelectCatalogue=selectPart;selectPart=function(id){baseSelectCatalogue(id);const p=currentBuild?.componentProducts?.[id],panel=q('#part-detail');if(p&&panel?.querySelector('p'))panel.querySelector('p').textContent=(p.specs||[]).join(' · ')};
const baseFocusCatalogue=focusExplodedPart;focusExplodedPart=function(id){baseFocusCatalogue(id);const p=currentBuild?.componentProducts?.[id],panel=q('#part-detail');if(p&&panel?.querySelector('p'))panel.querySelector('p').textContent=(p.specs||[]).join(' · ')};

// ===== V25 COMPOSANTS 3D HAUTE FIDELITE =====
function realPartDecal(title,sub,w=.9,h=.22,accent='#75e6ff'){
 const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');
 x.fillStyle='rgba(4,7,11,.94)';x.fillRect(0,0,c.width,c.height);x.fillStyle=accent;x.fillRect(0,0,14,c.height);
 x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=4;x.strokeRect(3,3,c.width-6,c.height-6);
 x.fillStyle='#f5f8fb';x.font='700 38px Arial';x.fillText(String(title).slice(0,40),40,96);
 x.fillStyle='#aeb9c5';x.font='500 25px Arial';x.fillText(String(sub||'').slice(0,62),40,158);
 const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=threeRenderer?.capabilities?.getMaxAnisotropy?.()||1;
 const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));o.renderOrder=6;return o
}
function realScrew(r=.025){const g=new THREE.Group(),m=mat(0x9aa3ac,.95,.16),head=cyl(r,.018,m,20);head.rotation.x=Math.PI/2;g.add(head);const slot=box(r*1.25,.007,.009,mat(0x24282d,.6,.35));slot.position.z=.012;g.add(slot);return g}
function realPort(w,h,d,x,y,z,color=0x090c10){const p=roundedPanel(w,h,d,.012,mat(color,.68,.35));p.position.set(x,y,z);return p}
function realHeatsink(w,h,d,color=0x6e7780,vertical=false){const g=new THREE.Group(),base=roundedPanel(w,h,d,.025,mat(color,.94,.16));g.add(base);const count=Math.max(4,Math.round((vertical?h:w)/.09));for(let i=0;i<count;i++){const fin=box(vertical?w*.96:.018,vertical?.018:h*.96,d*.42,mat(0x929aa2,.96,.13));fin.position.set(vertical?0:-w*.45+i*(w*.90/(count-1)),vertical?-h*.45+i*(h*.90/(count-1)):0,d*.58);g.add(fin)}return g}

createMotherboard=function(b){
 const g=new THREE.Group(),mw=b.moboFormat==='mATX'?2.44:2.438,mh=b.moboFormat==='mATX'?2.44:3.048,pcb=mat(0x07110e,.18,.64),black=mat(0x11161b,.64,.36),silver=mat(0xaab0b6,.96,.14),gold=mat(0xc3a34f,.84,.26);
 g.add(roundedPanel(mw,mh,.055,.028,pcb));
 // Pistes cuivre, déterministes pour que toutes les vues restent stables.
 for(let i=0;i<24;i++){const len=.28+(i%7)*.10,tr=box(.008,len,.008,mat(i%5?0x284a3e:0xa9853d,.48,.48));tr.position.set(-mw*.42+(i%12)*mw*.075,-mh*.34+Math.floor(i/12)*.58+(i%3)*.08,.034);tr.rotation.z=(i%2?.32:-.28);g.add(tr)}
 // Panneau E/S avec ports réellement creusés visuellement.
 const io=roundedPanel(.43,1.00,.22,.035,mat(0x777f87,.94,.16));io.position.set(-mw*.395,mh*.29,.13);g.add(io);
 for(let i=0;i<4;i++)g.add(realPort(.105,.10,.235,-mw*.395,mh*.48-i*.14,.145,i===0?0x2e69b4:0x11151a));
 g.add(realPort(.16,.13,.235,-mw*.395,mh*.49-.63,.145,0x12171d));g.add(realPort(.15,.15,.235,-mw*.395,mh*.49-.82,.145,0x15191e));
 // Etage d'alimentation, selfs et condensateurs.
 const vrmTop=realHeatsink(1.05,.31,.18,b.premium?0xc7cbd0:0x59616a);vrmTop.position.set(.02,mh*.405,.14);g.add(vrmTop);
 const vrmSide=realHeatsink(.31,.91,.18,b.premium?0xc7cbd0:0x59616a,true);vrmSide.position.set(-mw*.285,mh*.225,.14);g.add(vrmSide);
 for(let i=0;i<10;i++){const choke=roundedPanel(.13,.13,.10,.018,mat(0x252b31,.72,.3));choke.position.set(-.56+(i%5)*.15,mh*.27-Math.floor(i/5)*.17,.11);g.add(choke)}
 for(let i=0;i<16;i++){const cap=cyl(.027,.075,mat(i%3?0x7f8790:0xb69b58,.88,.22),18);cap.rotation.x=Math.PI/2;cap.position.set(-.70+(i%8)*.17,.14-Math.floor(i/8)*.16,.11);g.add(cap)}
 // Socket avec cadre, levier et plaque de rétention.
 const socket=roundedPanel(.56,.56,.055,.025,silver);socket.position.set(-.11,mh*.20,.08);g.add(socket);const socketHole=roundedPanel(.43,.43,.07,.018,black);socketHole.position.set(-.11,mh*.20,.115);g.add(socketHole);
 const lever=box(.025,.55,.025,silver);lever.position.set(.205,mh*.20,.15);g.add(lever);
 // Quatre emplacements DIMM et leurs loquets.
 for(let i=0;i<4;i++){const x=.48+i*.13,slot=roundedPanel(.065,1.18,.065,.014,mat(i%2?0x2c333a:0x11161b,.62,.38));slot.position.set(x,mh*.18,.075);g.add(slot);for(const y of [-.62,.62]){const latch=box(.10,.075,.07,mat(0x9fa6ad,.88,.20));latch.position.set(x,mh*.18+y,.08);g.add(latch)}}
 // PCIe renforcé, slots secondaires et connecteur ATX 24 broches.
 const slots=b.moboFormat==='mATX'?2:3;for(let i=0;i<slots;i++){const y=-mh*.12-i*.39,s=roundedPanel(mw*.72,.065,.07,.014,i===0?silver:black);s.position.set(.04,y,.08);g.add(s);const key=box(.08,.09,.08,black);key.position.set(-mw*.10,y,.10);g.add(key)}
 const atx=roundedPanel(.16,.76,.16,.025,black);atx.position.set(mw*.42,.28,.12);g.add(atx);for(let i=0;i<12;i++){const pin=box(.045,.045,.04,gold);pin.position.set(mw*.42-.045,.60-i*.055,.215);g.add(pin)}
 // Dissipateurs M.2 et chipset avec ailettes.
 const m2a=realHeatsink(1.08,.22,.105,b.premium?0xd0d3d6:0x555d65);m2a.position.set(.03,.02,.125);g.add(m2a);if(b.moboFormat!=='mATX'){const m2b=realHeatsink(1.38,.22,.105,0x4d555e);m2b.position.set(.04,-.83,.125);g.add(m2b)}
 const chipset=realHeatsink(.56,.56,.15,b.premium?0xb7bdc4:0x3c444c);chipset.position.set(mw*.28,-mh*.34,.14);g.add(chipset);
 // Audio, headers et vis de fixation.
 for(let i=0;i<5;i++){const a=cyl(.035,.10,mat(0x9ca4ad,.82,.24),16);a.rotation.x=Math.PI/2;a.position.set(-mw*.39+i*.12,-mh*.39,.10);g.add(a)}
 for(const x of [-mw*.44,0,mw*.44])for(const y of [-mh*.44,mh*.44]){const sc=realScrew(.025);sc.position.set(x,y,.09);g.add(sc)}
 const decal=realPartDecal(b.mobo,b.moboFormat+' · '+(/Intel/i.test(b.cpu)?'LGA1700':'AM5'),1.12,.22,b.premium?'#d7c2ff':'#75e6ff');decal.position.set(.25,-mh*.405,.166);g.add(decal);return g
};

createCPU=function(b){
 const g=new THREE.Group(),intel=/Intel/i.test(b.cpu),w=intel?.38:.44,h=intel?.50:.44,pcb=roundedPanel(w,h,.045,.018,mat(intel?0x174b57:0x174932,.16,.62));g.add(pcb);
 const ihs=roundedPanel(w-.065,h-.065,.060,.018,mat(0xc8cdd2,.98,.10));ihs.position.z=.052;g.add(ihs);
 for(let i=0;i<8;i++)for(let j=0;j<8;j++){const p=box(.018,.018,.006,mat(0xcaa84f,.86,.28));p.position.set(-w*.37+i*w*.105,-h*.37+j*h*.105,-.028);g.add(p)}
 for(const sx of [-1,1])for(const sy of [-1,1]){const notch=box(.055,.018,.018,mat(0x0b1511,.2,.7));notch.position.set(sx*w*.43,sy*h*.28,.01);g.add(notch)}
 const d=realPartDecal(b.cpu,intel?'INTEL · LGA1700':'AMD · AM5',w*.78,h*.28,intel?'#72d7ff':'#ff9a62');d.position.z=.086;g.add(d);return g
};

createRAMForBuild=function(b){
 const g=new THREE.Group(),count=b.ramModules||2,white=!!b.caseModel?.white;
 for(let i=0;i<count;i++){const stick=new THREE.Group(),pcb=box(.045,1.19,.27,mat(0x103b28,.15,.68));stick.add(pcb);
  for(const side of [-1,1]){const spread=roundedPanel(.035,1.12,.225,.018,mat(white?0xd9dde1:0x252b31,.88,.22));spread.position.x=side*.040;stick.add(spread);for(let j=0;j<6;j++){const cut=box(.013,.075,.17,mat(white?0xaeb5bd:0x11161a,.58,.42));cut.position.set(side*.061,-.42+j*.17,.02);stick.add(cut)}}
  for(let j=0;j<8;j++){const chip=roundedPanel(.052,.10,.11,.012,mat(0x090b0e,.42,.5));chip.position.set(0,-.45+j*.13,.01);stick.add(chip)}
  for(let j=0;j<18;j++){const pin=box(.052,.030,.018,mat(0xcaa84e,.84,.24));pin.position.set(0,-.56+j*.062,-.145);stick.add(pin)}
  if(b.ramRgb){const led=roundedPanel(.105,1.08,.040,.018,mat(0xd3d9df,.24,.22,i%2?0x8e7dff:0x67dcff,1.15));led.position.z=.14;stick.add(led)}
  const d=realPartDecal('FURY',`${b.ramGB/count} Go · DDR${/DDR4/.test(b.ram)?4:5}`,.18,.55,b.ramRgb?'#9be8ff':'#f3c26b');d.rotation.z=Math.PI/2;d.position.set(.064,0,.02);stick.add(d);stick.position.x=i*.155;g.add(stick)}
 g.userData.moduleCount=count;return g
};

createSSDForBuild=function(b){
 const g=new THREE.Group(),count=b.storageCount||1;
 for(let i=0;i<count;i++){const s=new THREE.Group(),pcb=roundedPanel(.80,.22,.025,.012,mat(0x0b3a26,.12,.7));s.add(pcb);
  for(let j=0;j<4;j++){const chip=roundedPanel(.13,.15,.030,.010,mat(j===0?0x30353b:0x101318,.5,.42));chip.position.set(-.27+j*.17,0,.028);s.add(chip)}
  for(let j=0;j<9;j++){const pin=box(.075,.014,.008,mat(0xcaa64b,.9,.22));pin.position.set(.36,-.085+j*.021,.02);s.add(pin)}
  const d=realPartDecal((b.ssd||'NVMe').split(' · ')[0],count>1?`DISQUE ${i+1}/${count}`:'M.2 2280 · NVMe',.51,.14,'#7ce6ff');d.position.set(-.04,0,.048);s.add(d);const screw=realScrew(.018);screw.position.set(-.37,0,.045);s.add(screw);s.position.y=i*.29;g.add(s)}
 g.userData.driveCount=count;return g
};

createGPU=function(b){
 const g=new THREE.Group(),dims=b.gpuDims||[304,137,50],L=Math.max(2.05,dims[0]*SCALE),H=Math.max(.95,dims[1]*SCALE),T=Math.max(.40,dims[2]*SCALE),fe=/Founders Edition/.test(b.gpu),white=!!b.caseModel?.white,fanCount=fe?2:(b.gpuFans||2);
 const dark=mat(white?0xdfe3e7:0x171b20,.88,.18),edge=mat(white?0xa8b0b8:0x535c65,.95,.13),finMat=mat(0x778089,.96,.16),black=mat(0x080b0e,.45,.48),front=T/2+.025;
 // Radiateur interne visible sur les bords.
 for(let x=-L*.43;x<L*.44;x+=.07){const fin=box(.018,H*.80,T*.82,finMat);fin.position.set(x,0,0);g.add(fin)}
 const back=roundedPanel(L*.96,H*.90,.035,.055,edge);back.position.z=-T/2-.025;g.add(back);
 const shroud=roundedPanel(L,H,T*.72,.095,dark);shroud.position.z=T*.12;g.add(shroud);
 for(let i=0;i<fanCount;i++){const x=fanCount===2?(-L*.25+i*L*.50):(-L*.31+i*L*.31),f=createFan(H*(fanCount===2?.30:.255),.065,fe?0xe3e7eb:(b.gpuVisual?.accent||0x67dcff),!!b.gpuVisual?.rgb);f.scale.z=.70;f.position.set(x,0,front);g.add(f)}
 // Cadres diagonaux des Founders Edition ou renforts d'une carte partenaire.
 if(fe){for(const a of [-.58,.58]){const rail=box(L*.72,.065,.055,edge);rail.rotation.z=a;rail.position.z=front+.07;g.add(rail)}}else{for(const y of [-H*.42,H*.42]){const rail=box(L*.88,.055,.05,edge);rail.position.set(0,y,front+.045);g.add(rail)}}
 const pcie=box(L*.43,.065,.025,mat(0xd0aa4d,.9,.18));pcie.position.set(-L*.12,-H/2-.04,-T*.10);g.add(pcie);
 const bracket=box(.095,H*.96,T*.88,mat(0xb7bdc3,.96,.16));bracket.position.x=-L/2-.05;g.add(bracket);for(let i=0;i<4;i++){const port=box(.035,.10,.12,black);port.position.set(-L/2-.102,-H*.30+i*H*.19,.02);g.add(port)}
 // Heatpipes et connecteur d'alimentation.
 for(let i=0;i<3;i++){const pipe=new THREE.Mesh(new THREE.TorusGeometry(L*.24+i*.025,.018,10,48,Math.PI),mat(0xb87343,.96,.14));pipe.rotation.y=Math.PI/2;pipe.rotation.z=Math.PI/2;pipe.position.set(.05,-H*.33+i*.055,-T*.30);g.add(pipe)}
 const power=roundedPanel(.20,.10,.13,.018,black);power.position.set(L*.18,H/2+.055,0);g.add(power);
 const name=b.gpu.replace('GeForce ','').replace('Founders Edition','FE'),d=realPartDecal(name,`${dims[0]} × ${dims[1]} × ${dims[2]} mm`,Math.min(1.55,L*.55),.22,fe?'#e9edf1':'#75e6ff');d.position.set(0,-H*.34,front+.065);g.add(d);return g
};

createPSU=function(b){
 const g=new THREE.Group(),white=!!b.caseModel?.white,body=roundedPanel(1.80,.86,1.50,.065,mat(white?0xd8dde2:0x11151a,.88,.22));g.add(body);
 // Ventilateur supérieur et véritable grille concentrique.
 const rotor=createFan(.42,.045,0x9aa3ac,false);rotor.rotation.x=Math.PI/2;rotor.position.set(-.28,.455,0);g.add(rotor);
 for(let r=.16;r<.48;r+=.075){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.010,8,48),mat(0x7f8891,.94,.16));ring.rotation.x=Math.PI/2;ring.position.set(-.28,.493,0);g.add(ring)}
 for(let i=0;i<8;i++){const spoke=box(.010,.60,.012,mat(0x7f8891,.94,.16));spoke.rotation.y=i*Math.PI/4;spoke.position.set(-.28,.501,0);g.add(spoke)}
 // Panneau modulaire avec ports 8 broches.
 const panel=roundedPanel(.95,.62,.025,.025,mat(0x090b0e,.55,.5));panel.position.set(.30,0,.762);g.add(panel);for(let row=0;row<2;row++)for(let col=0;col<4;col++){const p=roundedPanel(.18,.12,.035,.015,mat(0x232a31,.62,.34));p.position.set(-.02+col*.22,.14-row*.25,.785);g.add(p);for(let j=0;j<4;j++){const hole=cyl(.008,.012,mat(0x020304,.2,.9),8);hole.rotation.x=Math.PI/2;hole.position.set(-.075+col*.22+j*.035,.14-row*.25,.808);g.add(hole)}}
 // Grille arrière perforée.
 for(let row=0;row<5;row++)for(let col=0;col<8;col++){const h=cyl(.018,.012,mat(0x020304,.2,.9),8);h.rotation.z=Math.PI/2;h.position.set(-.906,-.27+row*.13,-.49+col*.14);g.add(h)}
 const d=realPartDecal(b.psu,`${b.psuWatts||''} W · MODULAIRE`,1.18,.24,'#f0c75e');d.position.set(.10,0,.762);d.rotation.z=Math.PI/2;d.position.x=.82;g.add(d);return g
};

createAirCooler=function(){
 const g=new THREE.Group(),towers=currentBuild?.airTowers||2,fin=mat(0xbcc3c9,.97,.14),dark=mat(0x191e23,.62,.32),copper=mat(0xb87342,.96,.13);
 for(let t=0;t<towers;t++){const x=towers===1?0:(t? .30:-.30);for(let y=-.54;y<.56;y+=.055){const f=roundedPanel(.50,.016,1.05,.012,fin);f.position.set(x,y,0);g.add(f)}const cap=roundedPanel(.52,.05,1.08,.018,dark);cap.position.set(x,.59,0);g.add(cap)}
 for(let i=0;i<(towers===1?4:6);i++){const pipe=new THREE.Mesh(new THREE.TorusGeometry(.26+i*.014,.017,10,36,Math.PI),copper);pipe.rotation.y=Math.PI/2;pipe.position.set(-.04+i*.018,-.57,-.16+i*.055);g.add(pipe)}
 const base=roundedPanel(.58,.10,.52,.025,mat(0xc4c8cc,.98,.10));base.position.y=-.65;g.add(base);
 const fan=createFan(.45,.09,0x90e7ff,currentBuild?.ramRgb);fan.rotation.y=Math.PI/2;fan.position.set(towers===1?.30:0,0,.58);g.add(fan);return g
};
createStudioAIO=function(){
 const g=new THREE.Group(),frame=mat(0x11161b,.78,.28),fin=mat(0x4c545c,.94,.20);for(const y of [-.57,.57]){const rail=roundedPanel(3.62,.10,.20,.025,frame);rail.position.set(0,y,-.06);g.add(rail)}
 for(let i=0;i<48;i++){const rib=box(.030,1.02,.15,fin);rib.position.set(-1.72+i*.073,0,-.06);g.add(rib)}
 for(let i=0;i<3;i++){const f=createFan(.49,.10,i===1?0x8e7dff:0x67dcff,true);f.rotation.x=Math.PI/2;f.position.set(-1.22+i*1.22,-.04,.08);g.add(f)}return g
};
createPump=function(){
 const g=new THREE.Group(),block=roundedPanel(.58,.58,.22,.09,mat(0x171c22,.84,.18));g.add(block);const ring=new THREE.Mesh(new THREE.TorusGeometry(.225,.030,12,64),mat(0x67dcff,.22,.16,0x67dcff,1.6));ring.position.z=.13;g.add(ring);const d=realPartDecal(currentBuild?.customLoop?'XC7 RGB':'CPU COOLING','WATERBLOCK + POMPE',.38,.16,'#86ecff');d.position.z=.135;g.add(d);for(const x of [-.21,.21])for(const y of [-.21,.21]){const s=realScrew(.022);s.position.set(x,y,.14);g.add(s)}return g
};
createStudioCooler=function(b,h){
 if(b.cooling!=='aio')return createAirCooler();const g=new THREE.Group(),rad=createStudioAIO();if(b.caseModel?.id==='focus')rad.rotation.z=-Math.PI/2;g.add(rad);
 const pump=createPump();pump.position.set(h.cpu[0]-h.cooler[0],h.cpu[1]-h.cooler[1]+.03,h.cpu[2]-h.cooler[2]+.28);g.add(pump);
 const endA=b.caseModel?.id==='focus'?new THREE.Vector3(-.16,1.0,.04):new THREE.Vector3(.72,-.18,.02),endB=b.caseModel?.id==='focus'?new THREE.Vector3(.02,1.0,.04):new THREE.Vector3(1.02,-.18,.02);
 g.add(createCable([pump.position.clone().add(new THREE.Vector3(-.08,0,0)),new THREE.Vector3(.10,-.36,.18),endA],0x11151b,.045));g.add(createCable([pump.position.clone().add(new THREE.Vector3(.08,0,0)),new THREE.Vector3(.42,-.44,.12),endB],0x090b0e,.045));
 if(b.customLoop){const reservoir=new THREE.Group(),tube=cyl(.18,.75,new THREE.MeshPhysicalMaterial({color:0x6fdcff,transparent:true,opacity:.48,roughness:.08,metalness:.05,transmission:.2}),36);reservoir.add(tube);const top=cyl(.21,.10,mat(0x20262d,.88,.18),36);top.position.y=.42;reservoir.add(top);const bot=top.clone();bot.position.y=-.42;reservoir.add(bot);reservoir.position.set(1.30,-.55,.25);g.add(reservoir)}return g
};

let realSceneUpgraded=false;
function upgradeRealScene(){
 if(!threeScene||!threeRenderer)return;if(!realSceneUpgraded){const grid=new THREE.GridHelper(18,36,0x30506a,0x172431);grid.position.y=-2.37;grid.material.transparent=true;grid.material.opacity=.22;threeScene.add(grid);const key=new THREE.SpotLight(0xffffff,1.3,24,Math.PI/5,.42,1.4);key.position.set(2.8,7,5.5);key.target.position.set(0,0,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);threeScene.add(key,key.target);const edge=new THREE.PointLight(0x8fceff,1.15,12);edge.position.set(-4,2,3);threeScene.add(edge);realSceneUpgraded=true}
 threeRenderer.toneMappingExposure=1.26;threeRoot.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material&&'envMapIntensity' in o.material)o.material.envMapIntensity=1.15}})
}
const buildPhotoRealBase=buildThreePC;
buildThreePC=function(b){buildPhotoRealBase(b);upgradeRealScene()};
buildModularPC=buildThreePC;
// ===== V26 SHOWROOM 3D ET CHASSIS PRODUIT =====
let readoutShowroom=null;
function showroomLabel(title,subtitle,w=3.4,h=.62){
 const c=document.createElement('canvas');c.width=1600;c.height=360;const x=c.getContext('2d');
 x.clearRect(0,0,c.width,c.height);x.fillStyle='rgba(5,9,14,.90)';x.fillRect(0,0,c.width,c.height);
 const grad=x.createLinearGradient(0,0,c.width,0);grad.addColorStop(0,'#67dcff');grad.addColorStop(1,'#8e7dff');x.fillStyle=grad;x.fillRect(0,0,18,c.height);
 x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=5;x.strokeRect(3,3,c.width-6,c.height-6);
 x.fillStyle='#f4f8fb';x.font='700 62px Arial';x.fillText(String(title).slice(0,48),66,146);
 x.fillStyle='#91a5b5';x.font='500 34px Arial';x.fillText(String(subtitle).slice(0,78),66,235);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=threeRenderer?.capabilities?.getMaxAnisotropy?.()||1;
 return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide}))
}
function showroomStrip(w,h,d,color,intensity=1.2){return box(w,h,d,mat(0x17202a,.28,.28,color,intensity))}
function rebuildHardwareShowroom(b){
 if(!threeScene)return;if(readoutShowroom){threeScene.remove(readoutShowroom);readoutShowroom.traverse(o=>{o.geometry?.dispose?.()});}
 const g=new THREE.Group();g.name='READOUT_SHOWROOM';readoutShowroom=g;const accent=b.theme||0x67dcff;
 // Cyclorama circulaire : le fond reste cohérent même lorsque la caméra tourne à 360°.
 const wall=new THREE.Mesh(new THREE.CylinderGeometry(10.8,10.8,7.4,64,1,true),new THREE.MeshStandardMaterial({color:0x080c12,roughness:.78,metalness:.22,side:THREE.BackSide}));wall.position.y=.85;g.add(wall);
 const stage=new THREE.Mesh(new THREE.CylinderGeometry(5.9,6.05,.16,64),new THREE.MeshStandardMaterial({color:0x111820,roughness:.38,metalness:.54}));stage.position.y=-2.40;stage.receiveShadow=true;g.add(stage);
 const stageRing=new THREE.Mesh(new THREE.TorusGeometry(5.82,.025,10,96),mat(0x121a22,.32,.28,accent,.82));stageRing.rotation.x=Math.PI/2;stageRing.position.y=-2.305;g.add(stageRing);
 // Panneaux acoustiques et montants du studio.
 for(const side of [-1,1])for(let i=0;i<4;i++){const panel=roundedPanel(1.05,2.05,.08,.055,mat(i%2?0x111821:0x0d131a,.38,.55));panel.position.set(side*(4.35+(i%2)*.35),-.10,-4.7+i*.72);panel.rotation.y=side*.20;g.add(panel)}
 for(const x of [-4.8,4.8]){const bar=showroomStrip(.075,4.9,.075,accent,1.35);bar.position.set(x,.3,-4.35);g.add(bar);const light=new THREE.PointLight(accent,.50,8);light.position.set(x,1.2,-2.8);g.add(light)}
 // Pont lumineux suspendu et softboxes latérales.
 const truss=box(7.2,.07,.07,mat(0x6f7b86,.88,.20));truss.position.set(0,3.85,-2.7);g.add(truss);
 for(const x of [-2.9,-.95,.95,2.9]){const lamp=roundedPanel(.72,.17,.33,.035,mat(0xc8d5df,.42,.18,0xbbeaff,1.15));lamp.position.set(x,3.64,-2.65);lamp.rotation.x=-.18;g.add(lamp)}
 // Console de référence réelle, placée derrière la machine.
 const c=b.caseModel,sub=c?`${c.dims.join(' × ')} mm · ${c.sku||'référence constructeur'}`:'CONFIGURATION MATÉRIELLE INTERACTIVE';
 const label=showroomLabel(c?.name||b.case,sub,4.2,.74);label.position.set(-2.0,2.62,-5.15);g.add(label);
 const brand=showroomLabel('READOUT · HARDWARE LAB','CONFIGURATION RÉELLE · INSPECTION 360°',3.2,.52);brand.position.set(3.0,-1.72,-5.0);g.add(brand);
 // Bornes de mesure et petites caisses techniques sur les bords du plateau.
 for(const side of [-1,1]){const pedestal=roundedPanel(.72,1.08,.66,.055,mat(0x131a22,.62,.38));pedestal.position.set(side*5.0,-1.76,-1.9);g.add(pedestal);const screen=roundedPanel(.50,.30,.025,.025,mat(0x0a1118,.26,.4,accent,.42));screen.position.set(side*5.0,-1.55,-1.555);g.add(screen)}
 const fill=new THREE.SpotLight(accent,.72,18,Math.PI/5,.55,1.5);fill.position.set(-5.2,4.0,4.5);fill.target.position.set(0,-.2,0);g.add(fill,fill.target);
 threeScene.add(g);threeScene.background=new THREE.Color(0x05080c);threeScene.fog=new THREE.FogExp2(0x05080c,.028);
}
function caseProductBadge(text,w=.58){const d=realPartDecal(text,'CHASSIS',w,.15,'#d8e8f2');d.material.depthWrite=false;return d}
function addPerforatedPanel(g,D,H,W,cy,front=true){
 const dark=mat(0x070a0e,.28,.78),metal=mat(0x4c5660,.9,.22),x=front?D/2+.022:-D/2-.022;
 for(let row=0;row<16;row++)for(let col=0;col<6;col++){const hole=cyl(.017,.012,dark,8);hole.rotation.z=Math.PI/2;hole.position.set(x,cy-H*.36+row*H*.048,-W*.31+col*W*.124);g.add(hole)}
 for(const z of [-W*.39,W*.39]){const rail=box(.035,H*.80,.04,metal);rail.position.set(x,cy,z);g.add(rail)}
}
const caseFactoryV26=createCaseForBuild;
createCaseForBuild=function(b){
 const g=caseFactoryV26(b),c=b.caseModel;if(!c)return g;const {D,W,H}=chassisMetrics(b),cy=H/2-2.25,white=!!c.white;
 const trim=mat(white?0xd7dce1:0x66717b,.92,.18),dark=mat(0x090c10,.34,.68),glass=new THREE.MeshPhysicalMaterial({color:0xb9d9ec,roughness:.06,metalness:.04,transparent:true,opacity:.045,transmission:.18,side:THREE.DoubleSide,depthWrite:false});
 // Entretoises de carte mère et passages de câbles réellement matérialisés.
 for(const x of [-D*.22,0,D*.22])for(const y of [cy-.72,cy,cy+.72]){const standoff=cyl(.026,.055,mat(0xb8a06c,.88,.18),14);standoff.rotation.x=Math.PI/2;standoff.position.set(x,y,-W/2+.095);g.add(standoff)}
 for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.125,.022,8,36),dark);ring.position.set(D*.22,cy+.62-i*.52,-W/2+.10);g.add(ring)}
 if(c.id==='focus'){
  addPerforatedPanel(g,D,H,W,cy,true);const badge=caseProductBadge('FRACTAL',.52);badge.rotation.y=-Math.PI/2;badge.position.set(D/2+.046,cy-H*.38,W*.31);g.add(badge);
  const topFilter=box(D*.72,.018,W*.70,mat(0x171c22,.48,.62));topFilter.position.set(-.05,cy+H/2+.015,0);g.add(topFilter);
 }else if(c.id==='h6'){
  // H6 Flow : arrivée d’air diagonale et chambre latérale très reconnaissables.
  const intake=roundedPanel(.12,H*.72,W*.56,.035,trim);intake.position.set(D/2-.34,cy,-W*.24);intake.rotation.y=-Math.PI/4;g.add(intake);
  for(let i=0;i<18;i++){const slot=box(.02,H*.67,.025,dark);slot.position.set(D/2-.29+i*.012,cy,-W*.43+i*.018);slot.rotation.y=-Math.PI/4;g.add(slot)}
  const badge=caseProductBadge('NZXT',.42);badge.position.set(D/2-.48,cy-H*.38,W/2+.025);g.add(badge);
 }else if(c.id==='northxl'){
  // North XL : lamelles bois épaisses, grille interne et badge Fractal.
  for(let i=0;i<13;i++){const z=-W*.43+i*W*.071,slat=roundedPanel(.10,H*.78,.12,.018,mat(i%2?0x70452d:0x8c5c3b,.12,.68));slat.rotation.y=Math.PI/2;slat.position.set(D/2+.055,cy,z);g.add(slat)}
  const mesh=box(.025,H*.80,W*.86,mat(0x080a0d,.30,.76));mesh.position.set(D/2-.04,cy,0);g.add(mesh);const badge=caseProductBadge('FRACTAL',.52);badge.rotation.y=-Math.PI/2;badge.position.set(D/2+.13,cy-H*.39,W*.34);g.add(badge);
 }else if(c.id==='y70'){
  // Y70 : angle panoramique, GPU vertical et barre inférieure massive.
  const corner=new THREE.Mesh(new THREE.PlaneGeometry(.78,H*.84),glass);corner.rotation.y=Math.PI/4;corner.position.set(D/2-.29,cy,W/2-.29);g.add(corner);
  const riser=roundedPanel(D*.55,.075,.18,.025,trim);riser.position.set(.12,cy-H*.27,W*.29);g.add(riser);for(let i=0;i<3;i++){const support=box(.035,H*.32,.09,trim);support.position.set(-D*.17+i*.18,cy-H*.08,W*.31);g.add(support)}
  const badge=caseProductBadge('HYTE',.42);badge.rotation.y=-Math.PI/4;badge.position.set(D/2-.27,cy-H*.39,W/2-.27);g.add(badge);
 }else if(c.id==='9000d'){
  // 9000D : façade haute densité, double chambre et quatre admissions frontales.
  addPerforatedPanel(g,D,H,W,cy,true);for(let i=0;i<4;i++)addCaseFan(g,D/2-.20,cy+1.52-i*1.02,0,.42,-Math.PI/2,0,true,b.theme);
  const divider=box(D*.72,.08,W*.82,trim);divider.position.set(-D*.05,cy-.38,0);g.add(divider);const badge=caseProductBadge('CORSAIR',.72);badge.rotation.y=-Math.PI/2;badge.position.set(D/2+.048,cy-H*.40,W*.28);g.add(badge);
  for(const y of [cy-H*.23,cy+H*.22]){const rail=box(D*.84,.05,.055,trim);rail.position.set(-D*.04,y,W/2+.02);g.add(rail)}
 }
 // Connectique supérieure : bouton, USB-A, USB-C et prise audio.
 const power=cyl(.055,.025,trim,28);power.position.set(D*.31,cy+H/2+.035,W*.24);g.add(power);
 for(let i=0;i<2;i++){const usb=roundedPanel(.14,.038,.055,.012,dark);usb.rotation.x=Math.PI/2;usb.position.set(D*.16+i*.19,cy+H/2+.038,W*.24);g.add(usb)}
 const usbc=roundedPanel(.09,.025,.045,.012,dark);usbc.rotation.x=Math.PI/2;usbc.position.set(-D*.02,cy+H/2+.038,W*.24);g.add(usbc);
 return g
};
function addSleevedBundle(points,count,color=.0){const g=new THREE.Group();for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.018,pts=points.map(p=>p.clone().add(new THREE.Vector3(0,0,off)));g.add(createCable(pts,color||0x161b21,.010))}return g}
function addInstalledHardwareDetails(b){
 if(!threeRoot)return;const g=new THREE.Group();g.name='REAL_CABLE_MANAGEMENT';g.userData.mountedOnly=true;
 const h=homeLayout(b),accent=b.caseModel?.white?0xd7dde3:0x151a20;
 g.add(addSleevedBundle([new THREE.Vector3(.55,.35,-.45),new THREE.Vector3(1.08,.28,-.78),new THREE.Vector3(1.22,-.30,-1.18)],12,accent));
 if(!b.integrated)g.add(addSleevedBundle([new THREE.Vector3(.64,-.42,.20),new THREE.Vector3(.92,-.18,-.18),new THREE.Vector3(1.20,.02,-.72)],8,accent));
 const cpuCable=addSleevedBundle([new THREE.Vector3(h.cpu[0]-.28,h.cpu[1]+.50,h.cpu[2]-.08),new THREE.Vector3(-1.25,1.72,-.72),new THREE.Vector3(-1.45,.38,-1.28)],8,accent);g.add(cpuCable);
 g.traverse(o=>o.userData.part='case');threeRoot.add(g)
}
const buildShowroomV26=buildThreePC;
buildThreePC=function(b){buildShowroomV26(b);rebuildHardwareShowroom(b);addInstalledHardwareDetails(b)};
buildModularPC=buildThreePC;
const showroomStyle=document.createElement('style');showroomStyle.textContent=`.stage{background:radial-gradient(circle at 50% 28%,rgba(103,220,255,.10),transparent 31%),linear-gradient(180deg,#070a0f,#030507)!important}.three-badge{background:rgba(5,9,14,.72)!important;backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:7px 10px}.photo3d-note{background:linear-gradient(120deg,rgba(5,9,14,.92),rgba(10,20,29,.82))!important;box-shadow:0 18px 50px rgba(0,0,0,.34)}`;document.head.appendChild(showroomStyle);
// ===== V27 STUDIO PHOTO EPURE =====
function cleanConcreteTexture(base='#252b31',light='#343b42'){
 const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,light);g.addColorStop(1,base);x.fillStyle=g;x.fillRect(0,0,512,512);
 // Grain très discret : il donne une matière réelle sans attirer le regard.
 for(let i=0;i<1800;i++){const a=.015+(i%7)*.003,v=90+(i%35);x.fillStyle=`rgba(${v},${v+4},${v+8},${a})`;x.fillRect((i*83)%512,(i*197)%512,1+(i%3),1+(i%2))}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,2);t.encoding=THREE.sRGBEncoding;t.anisotropy=threeRenderer?.capabilities?.getMaxAnisotropy?.()||1;return t
}
rebuildHardwareShowroom=function(b){
 if(!threeScene)return;if(readoutShowroom){threeScene.remove(readoutShowroom);readoutShowroom.traverse(o=>{o.geometry?.dispose?.();if(o.material?.map)o.material.map.dispose?.();o.material?.dispose?.()})}
 const g=new THREE.Group();g.name='READOUT_CLEAN_STUDIO';readoutShowroom=g;const white=!!b.caseModel?.white,accent=b.theme||0x67dcff;
 const wallColor=white?0x181d22:0x272e34,floorColor=white?0x090c10:0x11161b;
 // Pièce circulaire très simple : aucune géométrie ne masque le PC pendant la rotation.
 const wallMat=new THREE.MeshStandardMaterial({color:wallColor,map:cleanConcreteTexture(white?'#151a1f':'#252b31',white?'#242a30':'#343b42'),roughness:.88,metalness:.02,side:THREE.BackSide});
 const wall=new THREE.Mesh(new THREE.CylinderGeometry(11.4,11.4,8.2,72,1,true),wallMat);wall.position.y=.85;wall.receiveShadow=true;g.add(wall);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(11.35,72),new THREE.MeshStandardMaterial({color:floorColor,roughness:.50,metalness:.18}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.385;floor.receiveShadow=true;g.add(floor);
 // Plinthe et ligne d’horizon : elles rendent immédiatement le volume de la pièce lisible.
 const skirting=new THREE.Mesh(new THREE.TorusGeometry(11.20,.055,8,96),new THREE.MeshStandardMaterial({color:white?0x31383f:0x4a535c,roughness:.64,metalness:.18}));skirting.rotation.x=Math.PI/2;skirting.position.y=-2.315;g.add(skirting);
 // Socle neutre, suffisamment large pour la vue éclatée mais presque invisible.
 const plinth=new THREE.Mesh(new THREE.CylinderGeometry(5.85,5.98,.105,72),new THREE.MeshStandardMaterial({color:white?0x10151a:0x1a222a,roughness:.38,metalness:.30}));plinth.position.y=-2.40;plinth.receiveShadow=true;g.add(plinth);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(5.86,.012,8,96),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.22}));edge.rotation.x=Math.PI/2;edge.position.y=-2.34;g.add(edge);
 // Deux grandes sources de studio, hors du champ principal, pour détacher la silhouette.
 const key=new THREE.SpotLight(0xf4f8ff,1.15,22,Math.PI/4,.72,1.2);key.position.set(5.5,6.5,6.0);key.target.position.set(0,-.2,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);g.add(key,key.target);
 const rim=new THREE.SpotLight(white?0x78bfff:accent,.58,18,Math.PI/4,.80,1.4);rim.position.set(-5.8,3.8,-4.2);rim.target.position.set(0,.2,0);g.add(rim,rim.target);
 const soft=new THREE.HemisphereLight(white?0xc9dcf0:0xe5edf5,0x080a0d,white?.72:.88);g.add(soft);
 threeScene.add(g);threeScene.background=new THREE.Color(white?0x11161b:0x20262c);threeScene.fog=new THREE.FogExp2(white?0x11161b:0x20262c,.020);
 if(threeRenderer)threeRenderer.toneMappingExposure=white?1.18:1.25
};
const cleanStudioStyle=document.createElement('style');cleanStudioStyle.textContent=`.stage{background:linear-gradient(180deg,#151b21 0%,#090d11 100%)!important}.three-badge,.photo3d-note{display:none!important}.lab-view{background:#070a0e}.exploded-focus-tip{box-shadow:0 8px 30px rgba(0,0,0,.28)}`;document.head.appendChild(cleanStudioStyle);
// ===== V28 PRESENTATION PRODUIT CINEMATIQUE =====
let productIntroToken=0,productIntroActive=false,productIntroFrame=0,productIntroReady=false;
function productEditionName(b){return {balanced:'READOUT BALANCE',smart:'READOUT CORE',performance:'READOUT PERFORMANCE',dream:'READOUT SIGNATURE'}[b?.key]||'READOUT CUSTOM'}
function ensureProductIntro(){
 if(productIntroReady)return;productIntroReady=true;const stage=q('#stage'),intro=document.createElement('div');intro.id='product-intro';intro.className='product-intro';intro.innerHTML=`<div class="product-intro-black"></div><div class="product-intro-copy"><span>READOUT PRÉSENTE</span><h2 id="product-intro-name">READOUT CUSTOM</h2><p id="product-intro-case">CONFIGURATION SUR MESURE</p><i></i></div><button type="button" id="product-intro-skip">PASSER L’INTRO →</button><div class="product-intro-ready">GLISSE POUR PRENDRE LE CONTRÔLE</div>`;stage.appendChild(intro);
 const stop=()=>finishProductIntro(true);intro.addEventListener('pointerdown',e=>{if(e.target.closest('#product-intro-skip')||e.target===intro||e.target.classList.contains('product-intro-black'))stop()});
 q('#three-canvas').addEventListener('pointerdown',()=>{if(productIntroActive)finishProductIntro(true)},true);q('#three-canvas').addEventListener('wheel',()=>{if(productIntroActive)finishProductIntro(true)},{passive:true,capture:true});
 q('#close').addEventListener('click',()=>finishProductIntro(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&productIntroActive)finishProductIntro(false)})
}
function easeCinematic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function finishProductIntro(showReady=true){
 if(!productIntroReady)return;productIntroToken++;productIntroActive=false;cancelAnimationFrame(productIntroFrame);const intro=q('#product-intro');intro.classList.remove('playing','title-on');intro.querySelector('.product-intro-black').style.opacity='0';if(showReady){intro.classList.add('controls-ready');setTimeout(()=>intro.classList.remove('controls-ready'),1250)}else intro.classList.remove('controls-ready');
 if(threeRenderer)threeRenderer.toneMappingExposure=currentBuild?.caseModel?.white?1.18:1.25;if(threeReady)updateCamera()
}
function startProductIntro(b){
 ensureProductIntro();finishProductIntro(false);if(!threeReady||!b||!q('#modal').classList.contains('show'))return;
 const intro=q('#product-intro'),reduced=matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;productIntroActive=true;const token=++productIntroToken,duration=reduced?900:5100,targetExposure=b.caseModel?.white?1.18:1.25;
 q('#product-intro-name').textContent=productEditionName(b);q('#product-intro-case').textContent=b.case;intro.classList.add('playing');intro.classList.remove('controls-ready');intro.querySelector('.product-intro-black').style.opacity='.94';
 setView('mounted');selected3D=null;explodeTarget=0;orbit.target.set(0,-.02,0);const finalYaw=.72,initialYaw=finalYaw-.58,initialPitch=.12,finalPitch=.20,initialDist=b.caseType==='y70'?10.2:9.6,finalDist=b.caseType==='y70'?9.4:8.6;
 orbit.yaw=initialYaw;orbit.pitch=initialPitch;orbit.dist=initialDist;threeRenderer.toneMappingExposure=.035;updateCamera();const started=performance.now();
 const tick=now=>{if(token!==productIntroToken||!productIntroActive||!q('#modal').classList.contains('show'))return;const t=Math.min(1,(now-started)/duration),cameraT=easeCinematic(Math.min(1,t/.88)),lightT=easeCinematic(Math.max(0,Math.min(1,(t-.08)/.48)));
  orbit.yaw=THREE.MathUtils.lerp(initialYaw,finalYaw,cameraT);orbit.pitch=THREE.MathUtils.lerp(initialPitch,finalPitch,cameraT);orbit.dist=THREE.MathUtils.lerp(initialDist,finalDist,cameraT);threeRenderer.toneMappingExposure=THREE.MathUtils.lerp(.035,targetExposure,lightT);intro.querySelector('.product-intro-black').style.opacity=String(.94-lightT*.94);updateCamera();
  intro.classList.toggle('title-on',t>.23&&t<.84);intro.style.setProperty('--intro-light',String(lightT));if(t<1)productIntroFrame=requestAnimationFrame(tick);else finishProductIntro(true)
 };productIntroFrame=requestAnimationFrame(tick)
}
const openLabCinematicBase=openLab;
openLab=function(key){
 ensureProductIntro();const upcoming=builds.find(x=>x.key===key);const intro=q('#product-intro');intro.classList.add('playing');intro.classList.remove('title-on','controls-ready');intro.querySelector('.product-intro-black').style.opacity='.94';q('#product-intro-name').textContent=productEditionName(upcoming);q('#product-intro-case').textContent=upcoming?.case||'CONFIGURATION SUR MESURE';
 openLabCinematicBase(key);const ticket=++productIntroToken;setTimeout(()=>{if(ticket===productIntroToken)startProductIntro(currentBuild)},190)
};
const productIntroStyle=document.createElement('style');productIntroStyle.textContent=`
.product-intro{position:absolute;inset:0;z-index:18;overflow:hidden;pointer-events:none;color:#fff}.product-intro-black{position:absolute;inset:0;background:#010203;opacity:0;transition:opacity .15s linear}.product-intro.playing{pointer-events:auto;cursor:pointer}
.product-intro-copy{position:absolute;left:50%;top:50%;width:min(76%,680px);transform:translate(-50%,-42%);text-align:center;opacity:0;filter:blur(9px);transition:opacity .65s ease,filter .65s ease,transform .65s cubic-bezier(.2,.8,.2,1);text-shadow:0 8px 28px rgba(0,0,0,.78)}.product-intro.title-on .product-intro-copy{opacity:1;filter:blur(0);transform:translate(-50%,-50%)}.product-intro-copy span{display:block;font:600 9px 'JetBrains Mono',monospace;letter-spacing:.42em;color:#8ddff8;margin-bottom:15px}.product-intro-copy h2{margin:0;font:700 clamp(28px,4.4vw,62px) Inter,Arial,sans-serif;letter-spacing:-.045em}.product-intro-copy p{margin:11px 0 0;font:500 10px 'JetBrains Mono',monospace;letter-spacing:.14em;color:#c0cbd3}.product-intro-copy i{display:block;width:0;height:1px;margin:20px auto 0;background:linear-gradient(90deg,transparent,#67dcff,#8e7dff,transparent);transition:width 1.1s ease}.product-intro.title-on .product-intro-copy i{width:190px}
#product-intro-skip{position:absolute;right:18px;bottom:18px;border:1px solid rgba(255,255,255,.20);border-radius:999px;padding:9px 13px;background:rgba(4,8,12,.52);color:#d7e0e6;font:600 8px 'JetBrains Mono',monospace;letter-spacing:.09em;opacity:0;transition:opacity .35s;cursor:pointer;backdrop-filter:blur(12px)}.product-intro.playing #product-intro-skip{opacity:.78}.product-intro-ready{position:absolute;left:50%;bottom:25px;transform:translate(-50%,12px);padding:9px 14px;border:1px solid rgba(103,220,255,.32);border-radius:999px;background:rgba(4,9,13,.72);font:600 8px 'JetBrains Mono',monospace;letter-spacing:.10em;opacity:0;transition:opacity .3s,transform .3s;white-space:nowrap;backdrop-filter:blur(12px)}.product-intro.controls-ready .product-intro-ready{opacity:1;transform:translate(-50%,0)}
@media(max-width:700px){.product-intro-copy{width:88%}.product-intro-copy p{font-size:8px}.product-intro-ready{bottom:17px}}
@media(prefers-reduced-motion:reduce){.product-intro-copy,.product-intro-black,.product-intro-copy i{transition-duration:.12s!important}}
`;document.head.appendChild(productIntroStyle);
// ===== V29 GPU REELS FOURNIS =====
const uploadedGpuPhotos={
 rtx5060ti16:'assets/images/gpu-rtx5060ti16.webp',
 gigabyte5070:'assets/images/gpu-gigabyte5070.webp',
 msi5070ti:'assets/images/gpu-msi5070ti.webp',
 inno5080:'assets/images/gpu-inno5080.webp',
 pny5080:'assets/images/gpu-pny5080.webp',
 xfx9070xt:'assets/images/gpu-xfx9070xt.webp',
 asrock9070:'assets/images/gpu-asrock9070.webp',
 sapphire9060xt8:'assets/images/gpu-sapphire9060xt8.webp'
};
function uploadedGpuReference(chip,b){
 if(/RTX 5060 Ti 16/i.test(chip))return {key:'rtx5060ti',name:'GeForce RTX 5060 Ti 16 Go · triple ventilateur',brand:'NVIDIA / partenaire',image:uploadedGpuPhotos.rtx5060ti16,fans:3,rgb:false,accent:0x7b8792,accentHex:'#9aa8b3',dims:[300,116,41],slots:'2 slots',power:'1 × 8 broches',url:'https://www.nvidia.com/fr-fr/geforce/graphics-cards/50-series/rtx-5060-family/',note:'Reconstruction 3D basée sur la photo fournie ; le fabricant partenaire exact reste à confirmer.'};
 if(/RTX 5070 Ti 16/i.test(chip))return {key:'msi5070ti',name:'MSI GeForce RTX 5070 Ti GAMING TRIO OC · 16 Go',brand:'MSI',image:uploadedGpuPhotos.msi5070ti,fans:3,rgb:true,accent:0x8e7dff,accentHex:'#a995ff',dims:[338,140,50],slots:'2,5 slots',power:'1 × 16 broches',url:'https://www.msi.com/Graphics-Card/GeForce-RTX-5070-Ti-16G-GAMING-TRIO-OC',note:'Reconstruction 3D du carénage GAMING TRIO à partir de la photo fournie et de la fiche fabricant.'};
 if(/RTX 5070 12/i.test(chip))return {key:'gigabyte5070',name:'GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF · 12 Go',brand:'GIGABYTE',image:uploadedGpuPhotos.gigabyte5070,fans:3,rgb:false,accent:0x7d8790,accentHex:'#aab4bd',dims:[282,110,50],slots:'2,5 slots',power:'1 × 16 broches',url:'https://www.gigabyte.com/Graphics-Card/GV-N5070WF3OC-12GD',note:'Reconstruction 3D du modèle WINDFORCE OC SFF à partir de la photo fournie et de la fiche fabricant.'};
 if(/RTX 5080/i.test(chip)){const rgb=['y70','9000d'].includes(b.caseModel?.id)||b.key==='dream';return rgb?{key:'pny5080',name:'PNY GeForce RTX 5080 ARGB OC · 16 Go',brand:'PNY',image:uploadedGpuPhotos.pny5080,fans:3,rgb:true,accent:0x8e7dff,accentHex:'#a995ff',dims:[329,138,72],slots:'3,5 slots',power:'1 × 16 broches',url:'https://www.pny.com/geforce-rtx-5080-16gb-argb-triple-fan-oc',note:'Reconstruction 3D du modèle PNY ARGB Overclocked à partir de la photo fournie.'}:{key:'inno5080',name:'INNO3D GeForce RTX 5080 X3 · 16 Go',brand:'INNO3D',image:uploadedGpuPhotos.inno5080,fans:3,rgb:false,accent:0x9da7b0,accentHex:'#bdc6cd',dims:[300,116,41],slots:'2 slots',power:'1 × 16 broches',url:'https://www.inno3d.com/product/inno3d-geforce-rtx-5080-x3',note:'Reconstruction 3D du modèle INNO3D X3 à partir de la photo fournie et de la fiche fabricant.'}}
 if(/RX 9070 XT 16/i.test(chip))return {key:'xfx9070xt',name:'XFX SWIFT Radeon RX 9070 XT · 16 Go',brand:'XFX',image:uploadedGpuPhotos.xfx9070xt,fans:3,rgb:false,accent:0xd28b38,accentHex:'#e4a451',dims:[344,130,67],slots:'3,5 slots',power:'2 × 8 broches',url:'https://www.xfxforce.com/shop/xfx-swift-amd-radeon-rx-9070xt-triple-fan-gaming-edition',note:'Reconstruction 3D du modèle XFX SWIFT à trois ventilateurs à partir de la photo fournie.'};
 if(/RX 9070 16/i.test(chip))return {key:'asrock9070',name:'ASRock Radeon RX 9070 Challenger · 16 Go',brand:'ASRock',image:uploadedGpuPhotos.asrock9070,fans:3,rgb:true,accent:0x62d7bd,accentHex:'#74e4cb',dims:[290,123,51],slots:'2,6 slots',power:'2 × 8 broches',url:'https://www.asrock.com/Graphics-Card/AMD/Radeon%20RX%209070%20Challenger%2016GB/',note:'Reconstruction 3D du modèle ASRock Challenger à partir de la photo fournie.'};
 if(/RX 9060 XT 8/i.test(chip))return {key:'sapphire9060',name:'SAPPHIRE PULSE Radeon RX 9060 XT · 8 Go',brand:'SAPPHIRE',image:uploadedGpuPhotos.sapphire9060xt8,fans:2,rgb:false,accent:0xd65050,accentHex:'#ed6a6a',dims:[240,124,46],slots:'2,3 slots',power:'1 × 8 broches',url:'https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-9060-xt-8g-gddr6',note:'Reconstruction 3D du modèle SAPPHIRE PULSE 8 Go à partir de la photo fournie.'};
 return null
}
const attachProductsUploadedGpu=attachRealProducts;
attachRealProducts=function(b){
 const out=attachProductsUploadedGpu(b);if(!b||b.integrated||b.uploadedGpuApplied)return out;const chip=b.originalParts?.gpu||b.gpu,ref=uploadedGpuReference(chip,b);if(!ref)return out;
 b.uploadedGpuApplied=true;b.gpuChip=chip;b.gpuVisual=ref;b.gpuDims=ref.dims;b.gpuFans=ref.fans;b.gpuRgb=ref.rgb;b.gpu=ref.name;b.gpuImg=ref.image;b.componentProducts=b.componentProducts||{};
 b.componentProducts.gpu={name:ref.name,brand:ref.brand,url:ref.url,images:[ref.image],photoNote:ref.note,specs:[chip.match(/(\d+)\s*Go/i)?.[0]||'Capacité indiquée dans la référence',ref.dims.join(' × ')+' mm',ref.slots,ref.power,ref.fans+' ventilateurs'],captions:['Photo de référence fournie']};return out
};
const createGpuUploadedModels=createGPU;
createGPU=function(b){
 const v=b.gpuVisual;if(!v)return createGpuUploadedModels(b);
 const g=new THREE.Group(),dims=v.dims,L=Math.max(2.05,dims[0]*SCALE),H=Math.max(.92,dims[1]*SCALE),T=Math.max(.38,dims[2]*SCALE),front=T/2+.025;
 const black=mat(0x07090c,.46,.52),dark=mat(0x171b20,.84,.20),mid=mat(0x343b43,.90,.17),silver=mat(0x9da5ad,.97,.12),fin=mat(0x626b73,.96,.15),copper=mat(0xb87343,.95,.12),gold=mat(0xd2aa49,.90,.18),accent=mat(v.accent,.73,.22,v.rgb?v.accent:0x000000,v.rgb?1.35:0);
 // PCB et radiateur : chaque carte possède une véritable épaisseur, visible en vue 360°.
 const pcb=roundedPanel(L*.91,H*.75,.055,.025,mat(0x103525,.18,.64));pcb.position.z=-T*.15;g.add(pcb);
 for(let x=-L*.43;x<L*.44;x+=.055){const f=box(.014,H*.76,T*.68,fin);f.position.set(x,0,-.015);g.add(f)}
 for(let i=0;i<5;i++){const pipe=new THREE.Mesh(new THREE.TorusGeometry(L*(.17+i*.012),.014,8,42,Math.PI),copper);pipe.rotation.y=Math.PI/2;pipe.rotation.z=Math.PI/2;pipe.position.set(-.03,-H*.31+i*.045,-T*.28);g.add(pipe)}
 // Backplate avec ouverture d'évacuation et visserie.
 const back=roundedPanel(L*.96,H*.88,.035,.055,mid);back.position.z=-T/2-.024;g.add(back);
 const exhaust=new THREE.Mesh(new THREE.RingGeometry(H*.18,H*.31,38),black);exhaust.position.set(L*.31,0,-T/2-.045);exhaust.rotation.y=Math.PI;g.add(exhaust);
 for(const x of [-L*.39,-L*.12,L*.13,L*.39])for(const y of [-H*.34,H*.34]){const s=realScrew(.018);s.position.set(x,y,-T/2-.052);s.rotation.x=Math.PI;g.add(s)}
 // Carénage de base, puis panneaux propres à chaque référence.
 const shellColor=v.key==='inno5080'?0x838b92:v.key==='msi5070ti'?0x292d33:v.key==='xfx9070xt'?0x111418:0x20252b;
 const shell=roundedPanel(L,H,T*.68,.085,mat(shellColor,.86,.19));shell.position.z=T*.12;g.add(shell);
 const fanXs=v.fans===2?[-L*.25,L*.25]:[-L*.31,0,L*.31];
 fanXs.forEach((x,i)=>{const ringColor=v.key==='sapphire9060'?0xa52c31:(v.key==='inno5080'?0xbfc5ca:v.accent),ring=new THREE.Mesh(new THREE.TorusGeometry(H*(v.fans===2?.30:.245),.030,10,48),mat(ringColor,.90,.13,v.rgb?v.accent:0x000000,v.rgb ? .58 : 0));ring.position.set(x,0,front+.025);g.add(ring);const f=createFan(H*(v.fans===2?.285:.232),.064,v.accent,v.rgb);f.scale.z=.72;f.position.set(x,0,front+.030);f.userData.gpuFanIndex=i;g.add(f)});
 const rail=(w,h,x,y,rot=0,m=mid,z=front+.078)=>{const p=roundedPanel(w,h,.035,.014,m);p.position.set(x,y,z);p.rotation.z=rot;g.add(p);return p};
 if(v.key==='pny5080'){
  rail(L*.78,.052,0,H*.43,0,accent);rail(L*.42,.060,-L*.20,-H*.39,.12,accent);rail(L*.26,.050,L*.31,-H*.30,-.55,accent);
  rail(L*.32,.085,-L*.18,H*.25,.68,mid);rail(L*.32,.085,L*.18,-H*.25,.68,mid);
 }else if(v.key==='inno5080'){
  for(const x of [-L*.34,0,L*.34]){rail(L*.22,.065,x,H*.40,.06,silver);rail(L*.24,.055,x,-H*.40,-.06,silver)}
  rail(L*.84,.055,0,0,-.12,mid);rail(L*.55,.040,L*.08,H*.35,0,black);
 }else if(v.key==='gigabyte5070'){
  rail(L*.88,.060,0,H*.39,0,mid);rail(L*.72,.052,-L*.05,-H*.40,0,mid);
  for(const x of [-L*.28,L*.28]){rail(L*.22,.070,x,H*.18,.55,black);rail(L*.22,.070,x,-H*.18,-.55,black)}
 }else if(v.key==='msi5070ti'){
  rail(L*.83,.060,0,H*.42,0,accent);rail(L*.38,.065,-L*.24,-H*.39,.18,accent);
  for(const x of [-L*.27,L*.27]){rail(L*.25,.090,x,H*.17,.60,mid);rail(L*.25,.090,x,-H*.17,-.60,mid)}
 }else if(v.key==='xfx9070xt'){
  rail(L*.90,.055,0,H*.42,0,black);rail(L*.90,.055,0,-H*.42,0,black);rail(L*.55,.038,0,H*.36,0,accent);
  for(const x of [-L*.30,L*.30])rail(L*.18,.055,x,0,.78,mid);
 }else if(v.key==='asrock9070'){
  rail(L*.88,.050,0,H*.42,0,accent);rail(L*.52,.060,L*.12,-H*.40,0,silver);
  for(const x of [-L*.28,L*.28]){rail(L*.22,.064,x,H*.17,.58,mid);rail(L*.22,.064,x,-H*.17,-.58,mid)}
 }else if(v.key==='sapphire9060'){
  rail(L*.86,.060,0,H*.40,0,black);rail(L*.86,.060,0,-H*.40,0,black);rail(L*.34,.085,0,H*.30,.25,accent);rail(L*.25,.075,L*.30,-H*.28,-.55,accent);
 }else{
  rail(L*.86,.055,0,H*.41,0,mid);rail(L*.86,.055,0,-H*.41,0,mid);for(const x of [-L*.26,L*.26])rail(L*.20,.065,x,0,.62,mid);
 }
 // Équerre PCI, sorties vidéo, connecteur PCIe et alimentation supérieure.
 const bracket=box(.095,H*.98,T*.88,silver);bracket.position.x=-L/2-.05;g.add(bracket);
 const portYs=[-.29,-.09,.11,.31];portYs.forEach((py,i)=>{const p=roundedPanel(.020,i===3?.105:.125,.115,.012,black);p.position.set(-L/2-.105,py*H,0);g.add(p)});
 for(let row=0;row<4;row++)for(let col=0;col<3;col++){const vent=cyl(.010,.014,black,8);vent.rotation.z=Math.PI/2;vent.position.set(-L/2-.108,-H*.39+row*.055,-T*.27+col*.07);g.add(vent)}
 const pcie=box(L*.43,.060,.022,gold);pcie.position.set(-L*.10,-H/2-.038,-T*.12);g.add(pcie);for(let i=0;i<16;i++){const cut=box(.006,.066,.028,black);cut.position.set(-L*.30+i*L*.025,-H/2-.041,-T*.12);g.add(cut)}
 const powerCount=/2 ×/.test(v.power)?2:1;for(let i=0;i<powerCount;i++){const pw=roundedPanel(.18,.10,.13,.018,black);pw.position.set(L*(.12+i*.10),H/2+.052,0);g.add(pw);for(let j=0;j<8;j++){const pin=cyl(.009,.018,mid,8);pin.rotation.x=Math.PI/2;pin.position.set(L*(.12+i*.10)-.055+(j%4)*.036,H/2+.108,-.025+Math.floor(j/4)*.05);g.add(pin)}}
 // Plaque signalétique discrète : la référence ne traverse jamais le boîtier.
 const badge=realPartDecal(v.brand,/RX/.test(b.gpuChip||'')?'RADEON':'GEFORCE RTX',Math.min(.68,L*.24),.15,v.accentHex);badge.position.set(L*.25,H*.30,front+.102);g.add(badge);
 const side=realPartDecal((b.gpuChip||b.gpu).replace(/.*?(RTX|RX)/,'$1'),`${dims.join(' × ')} mm`,Math.min(1.05,L*.34),.17,v.accentHex);side.rotation.x=Math.PI/2;side.position.set(0,H/2+.020,.03);g.add(side);
 g.userData.realReference=v.key;g.userData.officialDimensions=dims;return g
};
const uploadedGpuStyle=document.createElement('style');uploadedGpuStyle.textContent=`.real-product img,.product-viewer-media img{object-fit:contain;background:linear-gradient(145deg,#fff,#eef1f4)}`;document.head.appendChild(uploadedGpuStyle);
// ===== V31 FINITIONS VISUELLES, INTERACTION ET MICRO-DETAILS 3D =====
const polishV31Style=document.createElement('style');polishV31Style.textContent=`
:root{scrollbar-color:rgba(103,220,255,.42) rgba(255,255,255,.035);scrollbar-width:thin}
*::-webkit-scrollbar{width:8px;height:8px}*::-webkit-scrollbar-track{background:rgba(255,255,255,.025)}*::-webkit-scrollbar-thumb{background:linear-gradient(var(--cyan),var(--violet));border-radius:20px;border:2px solid #080a0e}
button,a,input,select{outline:none}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{box-shadow:0 0 0 2px #070a0e,0 0 0 4px rgba(103,220,255,.72)!important}
.config,.card,.monitor-card,.real-product,.part{transition:transform .24s cubic-bezier(.2,.8,.2,1),border-color .24s,box-shadow .24s,background .24s}
.config:hover{transform:translateY(-5px);box-shadow:0 24px 70px rgba(0,0,0,.28),0 0 0 1px rgba(103,220,255,.08)}
.config.selected{box-shadow:0 24px 70px rgba(0,0,0,.30),0 0 32px rgba(103,220,255,.08)}
.config>button,.cta,.lab-btn{position:relative;overflow:hidden}.config>button:after,.cta:after,.lab-btn:after{content:"";position:absolute;inset:-60% auto -60% -35%;width:28%;transform:rotate(16deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.20),transparent);transition:left .48s ease}.config>button:hover:after,.cta:hover:after,.lab-btn:hover:after{left:118%}
.lab-status{position:absolute;left:20px;top:72px;z-index:18;display:flex;align-items:center;gap:9px;padding:8px 11px;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:rgba(5,8,12,.68);backdrop-filter:blur(16px);box-shadow:0 12px 35px rgba(0,0,0,.24);pointer-events:none;transition:.24s}
.lab-status i{width:7px;height:7px;border-radius:50%;background:var(--cyan);box-shadow:0 0 14px var(--cyan);animation:statusPulse 2s ease-in-out infinite}.lab-status b{font:700 8px 'JetBrains Mono';letter-spacing:.08em;color:#effaff}.lab-status span{font:500 8px 'JetBrains Mono';color:#8fa1ae}.lab-status kbd{padding:2px 5px;border:1px solid rgba(255,255,255,.12);border-bottom-color:rgba(255,255,255,.25);border-radius:5px;background:rgba(255,255,255,.055);color:#bac9d3;font:600 7px 'JetBrains Mono'}
@keyframes statusPulse{50%{opacity:.42;transform:scale(.78)}}
.quality-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:13px 0 4px}.quality-summary div{padding:10px;border:1px solid rgba(255,255,255,.085);border-radius:12px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012))}.quality-summary b{display:flex;align-items:center;gap:6px;color:#edf6fa;font-size:9px}.quality-summary b:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 10px rgba(100,229,173,.55)}.quality-summary span{display:block;margin-top:5px;color:#82939f;font:500 7px 'JetBrains Mono';line-height:1.4}
.detail h3{max-width:92%}.part:hover{transform:translateX(3px)}.part.active{box-shadow:inset 3px 0 0 var(--cyan),0 10px 26px rgba(0,0,0,.16)}
.stage:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 120px rgba(0,0,0,.32);z-index:4}
.lab-bottom{padding-top:8px}.lab-hint{max-width:72%;line-height:1.5}
@media(max-width:980px){.modal{overflow:auto}.lab{grid-template-columns:1fr;min-height:100vh;height:auto}.lab-view{min-height:70vh}.detail{max-height:none}.quality-summary{grid-template-columns:1fr 1fr}.lab-status{top:118px}.lab-top{align-items:flex-start}.lab-actions{flex-wrap:wrap;justify-content:flex-end}}
@media(max-width:620px){.view-tabs{display:grid;grid-template-columns:1fr 1fr;width:100%}.lab-top{display:block;padding-right:46px}.lab-actions{margin-top:7px;justify-content:flex-start}.rgb-controls{max-width:100%;overflow:auto}.lab-view{min-height:76vh}.lab-status{left:12px;top:154px}.lab-status kbd,.lab-status span{display:none}.lab-bottom{left:12px;right:12px}.lab-hint{font-size:7px;max-width:76%}.quality-summary{grid-template-columns:1fr}.detail{padding:20px}.exploded-label{min-width:92px;max-width:135px;padding:6px 8px}}
@media(prefers-reduced-motion:reduce){.lab-status i,.config>button:after,.cta:after,.lab-btn:after{animation:none!important;transition:none!important}.config:hover{transform:none}}
`;document.head.appendChild(polishV31Style);

function v31RadialShadow(){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),g=x.createRadialGradient(128,128,8,128,128,126);g.addColorStop(0,'rgba(0,0,0,.74)');g.addColorStop(.38,'rgba(0,0,0,.46)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.needsUpdate=true;return t
}
const rebuildStudioV31=rebuildHardwareShowroom;
rebuildHardwareShowroom=function(b){
 rebuildStudioV31(b);if(!readoutShowroom)return;
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(7.8,5.2),new THREE.MeshBasicMaterial({map:v31RadialShadow(),transparent:true,depthWrite:false,opacity:.78}));shadow.rotation.x=-Math.PI/2;shadow.position.set(.10,-2.325,.18);shadow.renderOrder=1;readoutShowroom.add(shadow);
 const frontFill=new THREE.PointLight(0xd9efff,b.caseModel?.white ? .34 : .24,10,2);frontFill.position.set(2.4,.6,4.6);readoutShowroom.add(frontFill);
 const accent=b.theme||0x67dcff,lowRim=new THREE.PointLight(accent,.22,8,2);lowRim.position.set(-2.8,-1.15,2.1);readoutShowroom.add(lowRim)
};
function addV31ModelDetails(b){
 if(!threeRoot)return;const g=new THREE.Group();g.name='READOUT_V31_MICRODETAILS';g.userData.mountedOnly=true;const dark=mat(0x080b0e,.48,.50),metal=mat(0x88929b,.94,.15),brass=mat(0xb69452,.90,.16),h=homeLayout(b);
 // Faisceau GPU gainé : 8 ou 16 conducteurs réels, sans plaque décorative traversante.
 if(!b.integrated){const wires=/2 ×/.test(b.gpuVisual?.power||'')?16:12;for(let i=0;i<wires;i++){const row=Math.floor(i/4),col=i%4,offX=(col-1.5)*.015,offZ=(row-(Math.ceil(wires/4)-1)/2)*.015;const cable=createCable([new THREE.Vector3(h.gpu[0]+.58+offX,h.gpu[1]+.45,h.gpu[2]+offZ),new THREE.Vector3(.92+offX,-.14,-.22+offZ),new THREE.Vector3(1.25,-.02,-.78+offZ)],i%4===0?0x232a31:0x101419,.010);g.add(cable)}
  for(let k=0;k<2;k++){const comb=roundedPanel(.19,.035,.12,.012,dark);comb.position.set(.90+k*.18,-.13-k*.01,-.23-k*.22);g.add(comb)}
 }
 // Connectique arrière de la carte mère : USB, réseau et audio donnent une vraie profondeur au panneau I/O.
 const io=threeParts.mobo;if(io){const ioGroup=new THREE.Group();for(let i=0;i<4;i++){const usb=roundedPanel(.10,.055,.045,.010,mat(i<2?0x2f6f91:0x1b242b,.58,.34));usb.position.set(-.77,.64-i*.14,.12);ioGroup.add(usb)}const lan=roundedPanel(.15,.14,.055,.018,metal);lan.position.set(-.77,-.02,.12);ioGroup.add(lan);for(let i=0;i<3;i++){const jack=cyl(.025,.035,mat([0x78c9a2,0xe28d95,0x80aee8][i],.55,.28),18);jack.rotation.x=Math.PI/2;jack.position.set(-.77,-.30-i*.09,.13);ioGroup.add(jack)}ioGroup.userData.part='mobo';io.add(ioGroup)}
 // Condensateurs et selfs VRM autour du processeur.
 if(io){for(let i=0;i<7;i++){const cap=cyl(.035,.10,mat(0x59636c,.88,.18),18);cap.rotation.x=Math.PI/2;cap.position.set(-.46+i*.105,.73,.12);io.add(cap)}for(let i=0;i<5;i++){const choke=roundedPanel(.10,.10,.065,.012,dark);choke.position.set(-.61,.47-i*.13,.12);io.add(choke)}}
 // Pieds caoutchouc de l'alimentation et vis moletées du châssis.
 const psu=threeParts.psu;if(psu)for(const x of [-.70,.70])for(const z of [-.53,.53]){const foot=cyl(.055,.035,dark,20);foot.position.set(x,-.47,z);psu.add(foot)}
 const shell=threeParts.case;if(shell)for(const y of [-1.55,-.85,.85,1.55]){const screw=cyl(.035,.045,brass,22);screw.rotation.z=Math.PI/2;screw.position.set(2.37,y,-.86);shell.add(screw)}
 g.traverse(o=>{if(!o.userData.part)o.userData.part='case'});threeRoot.add(g)
}
const buildV31Base=buildModularPC;
buildModularPC=function(b){buildV31Base(b);addV31ModelDetails(b);updateLabStatusV31()};buildThreePC=buildModularPC;

function ensureLabStatusV31(){
 const stage=q('#stage');if(!stage)return null;let el=q('#lab-status');if(!el){el=document.createElement('div');el.id='lab-status';el.className='lab-status';el.innerHTML='<i></i><div><b id="lab-status-title">MONTAGE 3D</b><span id="lab-status-sub">Glisser pour tourner</span></div><kbd>1–4</kbd><kbd>R</kbd>';stage.appendChild(el)}return el
}
function updateLabStatusV31(part){
 const el=ensureLabStatusV31();if(!el)return;const labels={mounted:'MONTAGE COMPLET',internal:'COMPOSANTS INTERNES',xray:'VISION TECHNIQUE',exploded:'VUE ÉCLATÉE'};q('#lab-status-title').textContent=part?`INSPECTION · ${String(part).toUpperCase()}`:(labels[currentView]||'BUILD LAB');q('#lab-status-sub').textContent=part?'Glisser sur la pièce pour une vue 360°':currentView==='exploded'?'Choisir une pièce pour la soulever':'Glisser pour tourner · molette pour zoomer'
}
const setViewV31Base=setView;setView=function(v){setViewV31Base(v);updateLabStatusV31()};
const selectPartV31Base=selectPart;selectPart=function(id){selectPartV31Base(id);updateLabStatusV31(id)};
const focusPartV31Base=focusExplodedPart;focusExplodedPart=function(id){focusPartV31Base(id);updateLabStatusV31(id)};
const resetV31Base=resetCamera3D;resetCamera3D=function(){resetV31Base();updateLabStatusV31()};
const openLabV31Base=openLab;openLab=function(key){openLabV31Base(key);setTimeout(()=>{ensureLabStatusV31();updateLabStatusV31()},230)};
document.addEventListener('keydown',e=>{if(!q('#modal')?.classList.contains('show')||productViewer&&!productViewer.hidden||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const views={1:'mounted',2:'internal',3:'xray',4:'exploded'};if(views[e.key]){e.preventDefault();setView(views[e.key])}else if(e.key.toLowerCase()==='r'){e.preventDefault();resetCamera3D()}},true);

const detailV31Base=renderDetail;renderDetail=function(){
 detailV31Base();const b=currentBuild;if(!b)return;const price=q('#detail .bigprice');if(!price)return;const c=b.caseModel,clearance=c?Math.round(c.gpuMax-(b.gpuDims?.[0]||0)):null,coolingOk=!c||b.cooling!=='aio'||Math.max(c.topRad||0,c.frontRad||0)>=360,psuOk=(b.psuWatts||parseInt(b.psu)||0)>=(/RTX 5080|9070 XT/.test(b.gpu)?850:550);
 price.insertAdjacentHTML('afterend',`<div class="quality-summary"><div><b>${clearance===null?'FORMAT À VALIDER':clearance>=0?'GPU COMPATIBLE':'GPU TROP LONG'}</b><span>${clearance===null?'Dimensions à contrôler':Math.abs(clearance)+' mm '+(clearance>=0?'de marge':'de dépassement')}</span></div><div><b>${coolingOk?'REFROIDISSEMENT OK':'IMPLANTATION À REVOIR'}</b><span>${b.cooling==='aio'?'Radiateur vérifié':'Ventirad et hauteur contrôlés'}</span></div><div><b>${psuOk?'ALIMENTATION COHÉRENTE':'PUISSANCE À VALIDER'}</b><span>${b.psuWatts||parseInt(b.psu)||'—'} W · estimation dynamique</span></div></div>`)
};
// Corrige les cartes déjà générées quand on recalcule.
const computeV9=compute;compute=function(){if(selBudget!==null)generateDynamicBuilds();computeV9();if(selRes&&selMonitor&&selUsages.length&&selPriorities.length&&selBudget!==null&&selStyle!==null)renderCompositionControls();setTimeout(()=>{qa('.case-thumb').forEach((el,i)=>{if(builds[i])el.dataset.case=builds[i].case});drawBuildThumbs()},0)};

renderRes();renderAll();renderMonitors();const savedLevelV9=(()=>{try{return localStorage.getItem('readoutLevel')}catch(_){return null}})();if(savedLevelV9&&assistance[savedLevelV9])qa('.level-card').forEach(x=>x.classList.toggle('active',x.dataset.level===savedLevelV9));q('#video-state').textContent=location.protocol==='file:'?'V10 : lance le fichier via localhost pour le benchmark. La 3D modulaire fonctionne avec Three.js.':'V10 : 4 PC uniques + BuildLab 3D + démontage studio animé.';setGameplayPoster();renderBenchmarkPicks();

// Reversible quick-start demo.
const quickStartReadout=q('#quick-start');
if(quickStartReadout)quickStartReadout.onclick=()=>{selRes='1440p';selMonitor=monitors['1440p'][0].id;selUsages=[5];selPriorities=[4];selBudget=1;selStyle=0;customBudget=null;renderRes();renderMonitors();renderAll();compute()};
