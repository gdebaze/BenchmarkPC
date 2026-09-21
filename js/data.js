const I={
 gpu5080:'https://assets.nvidia.partners/images/png/5080-Front.png',gpu9070:'https://www.amd.com/content/dam/amd/en/images/products/graphics/2849100-radeon-rx-9070.png',gpu9070xt:'https://www.amd.com/content/dam/amd/en/images/products/graphics/2849000-radeon-rx-9070xt.png',gpu9060:'https://m.media-amazon.com/images/I/71P5MZJfSPL._AC_SL1500_.jpg',
 cpu9600:'https://cdn.vatanbilgisayar.com/Upload/PRODUCT/amd/thumb/146831-1_large.jpg',cpu9800:'https://arteus.pe/cdn/shop/files/100-1000001084WOF-3_b4996c3c-35d0-40a5-b46c-b0665e39ffa9_800x.jpg?v=1750891694',
 mobo650:'https://asset.msi.com/resize/image/global/product/product_16923410806ad51a9eb642dd9c894921f216fb24a7.png62405b38c58fe0f07fcef2367d8a9ba1/600.png',mobo850:'https://asset.msi.com/resize/image/global/product/product_173554513843b6cb5f2654b81c01c27e5cb47e62dd.png62405b38c58fe0f07fcef2367d8a9ba1/600.png',mobo870:'https://dlcdnwebimgs.asus.com/gain/BC73DCE6-8A1C-41A4-A7A2-E5AFB87B1C2E/w717/h525',
 ram:'https://www.corsair.com/uk/en/p/memory/cmh32gx5m2b5600c36k/vengeance-rgb-32gb-2x16gb-ddr5-dram-5600mhz-c36-memory-kit-black-cmh32gx5m2b5600c36k',ramImg:'https://m.media-amazon.com/images/I/61uXihcspEL._AC_SL1500_.jpg',ssd:'https://images.samsung.com/is/image/samsung/p6pim/ca/mz-v9p1t0b-am/gallery/ca-990-pro-nvme-m2-ssd-mz-v9p1t0b-am-534359102?$650_519_PNG$',
 aio240:'https://www.arctic.de/media/8c/93/c4/1708698960/Liquid_Freezer_III_240_Black_G00.png',aio360:'https://assets.corsair.com/image/upload/c_pad,q_auto,h_1024,w_1024,f_auto/products/Custom-Cooling/CW-9061023-WW/Gallery/TITAN_360_RX_LCD_BLACK_01.webp',air:'https://m.media-amazon.com/images/I/61ZMCsyd51L._SL1500_.jpg',psu:'https://assets.corsair.com/image/upload/c_pad,q_auto,h_1024,w_1024,f_auto/products/Power-Supply-Units/base-rmx-2024-config/Gallery/RMx_1000_01.webp',
 caseH6:'https://nzxt.com/cdn/shop/files/h6-flow-rgb-plus-black-hero.png?v=1755221705&width=1200',caseH5:'https://m.media-amazon.com/images/I/51wAv5q4adL._AC_SL1000_.jpg',caseNorth:'https://m.media-amazon.com/images/I/71Wv9A5VqWL._AC_SL1500_.jpg',caseO11:'https://m.media-amazon.com/images/I/71j0tO2xjEL._AC_SL1500_.jpg',caseH9:'https://nzxt.com/cdn/shop/files/h9-flow-rgb-plus-black-hero.png?v=1755221705&width=1200'
};
const LOCAL_MONITOR_IMAGES={
 oledG9_49:'assets/images/oled-g9-49.webp',
 neoG9_57_front:'assets/images/neo-g9-57-front.webp',
 neoG9_57_angle:'assets/images/neo-g9-57-angle.webp',
 alien500:'assets/images/alienware-aw2524hf.webp',
 rog480:'assets/images/rog-pg27aqdp.webp',
 alien34:'assets/images/alienware-aw3423dwf.webp',
 samsung34:'assets/images/samsung-34.webp'
};
const resolutions=[
 {id:'1080p',name:'Full HD',sub:'1920×1080 · priorité FPS',factor:1},
 {id:'1440p',name:'QHD',sub:'2560×1440 · équilibre',factor:.74},
 {id:'UWQHD',name:'UltraWide QHD',sub:'3440×1440 · immersion 21:9',factor:.61},
 {id:'4K',name:'4K UHD',sub:'3840×2160 · netteté maximale',factor:.46}
];
const monitors={
 '1080p':[
  {id:'aoc24',name:'AOC 24G4X',size:'23,8″',hz:180,panel:'Fast IPS',price:'≈ 160 €',badge:'Accessible',img:'https://cdn.sanity.io/images/hf5b3axp/production/042b8850320be136a729ca3b3890384248b2adc0-2011x2000.png?auto=format&fit=max&w=1920',url:'https://www.aoc.com/fr/gaming/monitors/24g4x'},
  {id:'asus259',name:'ROG Strix XG259CMS',size:'24,5″',hz:310,panel:'Fast IPS',price:'≈ 350 €',badge:'310 Hz',img:'https://dlcdnwebimgs.asus.com/gain/F0D898EA-1E88-4334-B379-3792D484FFA2/w717/h525/fwebp',url:'https://rog.asus.com/fr/monitors/23-to-24-5-inches/rog-strix-xg259cms/'},
  {id:'alien500',name:'Alienware AW2524HF',size:'24,5″',hz:500,panel:'Fast IPS',price:'≈ 549 €',badge:'Esport 500 Hz',img:LOCAL_MONITOR_IMAGES.alien500,url:'https://www.dell.com/fr-fr/shop/%C3%A9cran-de-gaming-alienware-500-hz-aw2524hf/apd/210-bjph/moniteurs-et-accessoires-de-moniteur'}],
 '1440p':[
  {id:'msi274',name:'MSI MAG 274QRF QD E2',size:'27″',hz:180,panel:'Rapid IPS / QD',price:'≈ 330 €',badge:'Polyvalent',img:'https://storage-asset.msi.com/global/picture/image/feature/monitor/MAG274QRF-QD-E2/kv-pd.png',url:'https://fr.msi.com/Monitor/MAG-274QRF-QD-E2'},
  {id:'lg480',name:'LG UltraGear 27GX790A-B',size:'27″',hz:480,panel:'OLED',price:'≈ 700 €',badge:'OLED 480 Hz',img:'https://www.lg.com/content/dam/channel/wcms/fr/images/moniteurs/lg-27gx790a/gallery/ultragear-gaming-27gx790a-2025-gallery-gallery-01-2010.jpg/jcr%3Acontent/renditions/thum-1600x1062.jpeg',url:'https://www.lg.com/fr/moniteurs/gaming/lg-27gx790a-b-moniteur-ultragear/'},
  {id:'rog480',name:'ROG Swift OLED PG27AQDP',size:'26,5″',hz:480,panel:'WOLED',price:'≈ 800 €',badge:'OLED premium',img:LOCAL_MONITOR_IMAGES.rog480,url:'https://rog.asus.com/fr/monitors/27-to-31-5-inches/rog-swift-oled-pg27aqdp/'}],
 'UWQHD':[
  {id:'alien34',name:'Alienware AW3423DWF',size:'34″',hz:165,panel:'QD-OLED',price:'≈ 800 €',badge:'QD-OLED',img:LOCAL_MONITOR_IMAGES.alien34,url:'https://www.dell.com/fr-fr/shop/%C3%A9cran-de-gaming-incurv%C3%A9-qd-oled-alienware-34-aw3423dwf/apd/210-bfrq/moniteurs-et-accessoires-de-moniteur'},
  {id:'samsung34',name:'Samsung Odyssey OLED G8',size:'34″',hz:175,panel:'OLED',price:'≈ 900 €',badge:'Smart OLED',img:LOCAL_MONITOR_IMAGES.samsung34,url:'https://www.samsung.com/fr/monitors/gaming/odyssey-oled-g8-34-inch-oled-ultra-wqhd-ls34dg850suxen/'},
  {id:'oledg949',name:'Samsung Odyssey OLED G9 G95SD',size:'49″',hz:240,panel:'OLED 1800R',price:'≈ 1 500 €',badge:'Dual QHD 240 Hz',img:LOCAL_MONITOR_IMAGES.oledG9_49,url:'https://www.samsung.com/fr/monitors/gaming/odyssey-oled-g9-g95sd-49-inch-oled-dual-qhd-ls49dg954suxen/'}],
 '4K':[
  {id:'g8',name:'Samsung Odyssey OLED G8 G80SD',size:'32″',hz:240,panel:'OLED',price:'≈ 850 €',badge:'4K OLED',img:'https://images.samsung.com/is/image/samsung/p6pim/fr/ls32dg800suxen/gallery/fr-odyssey-oled-g8-g80sd-ls32dg800suxen-542585097?$1164_776_PNG$=',url:'https://www.samsung.com/fr/monitors/gaming/odyssey-oled-g8-g80sd-32-inch-240hz-oled-uhd-ls32dg800suxen/'},
  {id:'lg32',name:'LG UltraGear 32GS95UE-B',size:'32″',hz:240,panel:'OLED Dual Mode',price:'≈ 950 €',badge:'4K240 / FHD480',img:'https://www.lg.com/content/dam/channel/wcms/fr/images/moniteurs/32gs95ue-b/gallery/01-2010/ultragear-32gs95ue-gallery-01-2010.jpg/jcr%3Acontent/renditions/thum-1600x1062.jpeg',url:'https://www.lg.com/fr/moniteurs/gaming/lg-32gs95ue-b-moniteur-ultragear/'},
  {id:'neog957',name:'Samsung Odyssey Neo G9 G95NC',size:'57″',hz:240,panel:'VA Mini LED',price:'≈ 2 000 €',badge:'Dual UHD 240 Hz',img:LOCAL_MONITOR_IMAGES.neoG9_57_front,img2:LOCAL_MONITOR_IMAGES.neoG9_57_angle,url:'https://www.fnac.com/mp50526144/Ecran-LCD-Samsung-S57CG954NU-57-silver/w-4'}]
};
const usages=[['Esport compétitif','Valorant · CS2 · Fortnite'],['AAA / Ultra','Cyberpunk · Alan Wake · RT'],['Création / 3D','Blender · montage · rendu'],['Streaming','Jeu + OBS + multitâche'],['Simulation','Racing · flight sim · ultrawide'],['Polyvalent','Travail + jeu + création']];
const priorities=[['FPS maximum','CPU gaming + GPU équilibré'],['Qualité d’image','GPU plus fort · VRAM'],['Silence','refroidissement + airflow'],['Création','plus de cœurs + RAM'],['Équilibre','aucun gros compromis']];
const budgets=[['500–900 €','optimisé au maximum',850],['1 000–1 500 €','excellent rapport performances/prix',1450],['1 700–2 300 €','performance avancée',2200],['2 500–4 000 €','haut de gamme personnalisé',3500],['Budget personnalisé','montant exact',1200]];
const styles=[['Stealth noir','sobre · sans RGB'],['RGB premium','verre + éclairage'],['Blanc minimal','clean setup'],['Bois / studio','type Fractal North']];
const games={
 cyberpunk:{name:'Cyberpunk 2077',mult:.78,video:'WRraPvv__Tk',source:'zWORMz Gaming · RTX 5080 · 1080p/1440p/4K · Ultra/RT',creator:'zWORMz Gaming',starts:{'4K':22,'1440p':611,'UWQHD':611,'1080p':923}},
 fortnite:{name:'Fortnite',mult:1.48,video:'UpHmi3tsGNU',source:'RTX Gaming · RTX 5080 · 1080p/1440p/4K · Max/Low',creator:'RTX Gaming',starts:{'4K':95,'1440p':188,'UWQHD':188,'1080p':338}},
 cs2:{name:'Counter-Strike 2',mult:2.05,video:'lFc6348w7Oo',source:'Jansn Benchmarks · RTX 5080 · 1080p/1440p/4K · Max/Low',creator:'Jansn Benchmarks',starts:{'4K':29,'1440p':146,'UWQHD':146,'1080p':263}},
 alan:{name:'Alan Wake 2',mult:.67,video:'SEYkwp5GefA',source:'Blackout Builds · RTX 5080 · 4K/1440p · RT Ultra/DLSS',creator:'Blackout Builds',starts:{'4K':0,'1440p':628,'UWQHD':628,'1080p':628}},
 forza:{name:'Forza Horizon 5',mult:1.2,video:'uRpW3J00xg8',source:'zWORMz Gaming · RTX 5080 · 1080p/1440p/4K Max',creator:'zWORMz Gaming',starts:{'4K':23,'1440p':329,'UWQHD':329,'1080p':535}},
 rdr2:{name:'Red Dead Redemption 2',mult:1.04,video:'5hoibIOHXcQ',source:'MxBenchmarkPC · RTX 5080 · 1440p/4K Ultra',creator:'MxBenchmarkPC',starts:{'4K':151,'1440p':433,'UWQHD':433,'1080p':433}}
};
const quality={low:1.38,high:1.12,ultra:1,cinematic:.86};
let selRes=null,selMonitor=null,selUsages=[],selPriorities=[],selBudget=null,selStyle=null,customBudget=null,benchKey=null,renderMode='raster',game='cyberpunk',qualityMode='ultra',visualMode='gameplay',soundMode='muted',customGameplayId=null,lastGameplayKey='';
const builds=[
 {key:'smart',tier:'SMART',base:1079,target:'1080p / 1440p accessible',case:'Fractal Design North TG',caseType:'north',caseDims:[447,215,469],caseImg:I.caseNorth,cpu:'Ryzen 5 7500F',cpuImg:I.cpu9600,gpu:'SAPPHIRE PULSE Radeon RX 9060 XT 8 Go',gpuImg:I.gpu9060,mobo:'MSI B650M Gaming Plus WiFi',moboImg:I.mobo650,moboFormat:'mATX',ram:'32 Go DDR5-6000',ramImg:I.ramImg,ramRgb:false,ssd:'WD_BLACK SN770 1 To',ssdImg:I.ssd,cooler:'Thermalright Peerless Assassin 120 SE',coolerImg:I.air,psu:'Corsair RM650x · 650 W',psuImg:I.psu,score:93.2,rt:33,cooling:'air',gpuDims:[200,109.25,40.6],gpuFans:2,gpuRgb:false,theme:0xc99b67},
 {key:'balanced',tier:'BALANCED',base:1579,target:'Le meilleur équilibre 1440p',case:'NZXT H6 Flow RGB',caseType:'h6',caseDims:[415,287,435],caseImg:I.caseH6,cpu:'Ryzen 5 9600X',cpuImg:I.cpu9600,gpu:'SAPPHIRE PULSE Radeon RX 9070 16 Go',gpuImg:I.gpu9070,mobo:'MSI MAG B850 TOMAHAWK MAX WIFI',moboImg:I.mobo850,moboFormat:'ATX',ram:'32 Go DDR5-6000 CL30',ramImg:I.ramImg,ramRgb:true,ssd:'Samsung 990 PRO 2 To',ssdImg:I.ssd,cooler:'NZXT Kraken 360 RGB',coolerImg:I.aio360,psu:'Corsair RM750e · 750 W Gold',psuImg:I.psu,score:140.9,rt:67.6,cooling:'aio',gpuDims:[280,120.25,51.5],gpuFans:2,gpuRgb:false,theme:0x67dcff},
 {key:'performance',tier:'PERFORMANCE',base:2129,target:'1440p très haut FPS / 4K',case:'Lian Li O11D EVO RGB',caseType:'o11',caseDims:[478,290,471],caseImg:I.caseO11,cpu:'Ryzen 7 9800X3D',cpuImg:I.cpu9800,gpu:'SAPPHIRE NITRO+ Radeon RX 9070 XT 16 Go',gpuImg:I.gpu9070xt,mobo:'MSI MAG X870E TOMAHAWK WIFI',moboImg:I.mobo870,moboFormat:'ATX',ram:'32 Go DDR5-6000 CL30 RGB',ramImg:I.ramImg,ramRgb:true,ssd:'Samsung 990 PRO 2 To',ssdImg:I.ssd,cooler:'Corsair TITAN 360 RX RGB',coolerImg:I.aio360,psu:'Corsair RM850e · 850 W Gold',psuImg:I.psu,score:156.6,rt:78,cooling:'aio',gpuDims:[330.8,128.5,65.68],gpuFans:3,gpuRgb:true,theme:0x8e7dff},
 {key:'dream',tier:'DREAM',base:2879,target:'4K premium + création lourde',case:'HYTE Y70',caseType:'y70',caseDims:[470,320,470],caseImg:'https://cdn.sanity.io/images/mqc7p4g4/production/917e2c8c8e179426269b209c2c979e8a43a1a471-3480x2460.jpg?auto=format&fit=clip&q=92&w=1200',cpu:'Ryzen 9 9950X3D',cpuImg:I.cpu9800,gpu:'GeForce RTX 5080 Founders Edition',gpuImg:I.gpu5080,mobo:'MSI MAG X870E TOMAHAWK WIFI',moboImg:I.mobo870,moboFormat:'ATX',ram:'64 Go DDR5-6000 RGB',ramImg:I.ramImg,ramRgb:true,ssd:'Samsung 990 PRO 4 To',ssdImg:I.ssd,cooler:'Corsair TITAN 360 RX LCD',coolerImg:I.aio360,psu:'Corsair RM1000x · 1000 W',psuImg:I.psu,score:166.9,rt:98.3,cooling:'aio',gpuDims:[304,137,40],gpuFans:2,gpuRgb:false,theme:0xff4bd8}
];
