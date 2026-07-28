// Transforma el array CARS de quierorenting.es (index.html linea ~1122) al
// esquema nuevo de Supabase (brands/models/vehicles) y genera un SQL listo
// para pegar en el SQL Editor en cuanto exista el proyecto Supabase.
//
// Uso: node scripts/generate-catalog-seed.mjs > supabase/seed_catalog_real.sql

const CARS = [
  {b:'SEAT',m:'Ibiza',s:'1.0 MPI 70kW 80CV',t:'Compacto',fuel:'Gasolina',g:'Manual',p:264,cv:80,cons:'5.5L/100km',plazas:5,img:'fotos/seat-ibiza.jpg',cat:'turismo',feat:false,badge:null},
  {b:'Opel',m:'Corsa',s:'1.2T 100cv GS-Line AT',t:'Compacto',fuel:'Gasolina',g:'Automático',p:345,cv:100,cons:'5.5L/100km',plazas:5,img:'fotos/opel-corsa.jpg',cat:'turismo',feat:false,badge:null},
  {b:'Volkswagen',m:'Polo',s:'MATCH 1.0 TSI 95CV',t:'Compacto',fuel:'Gasolina',g:'Manual',p:307,cv:95,cons:'5.1L/100km',plazas:5,img:'fotos/vw-polo.jpg',cat:'turismo',feat:true,badge:null},
  {b:'Volkswagen',m:'Polo',s:'Style 1.0 TSI 95CV DSG',t:'Compacto',fuel:'Gasolina',g:'Automático',p:307,cv:95,cons:'5.3L/100km',plazas:5,img:'fotos/vw-polo.jpg',cat:'turismo',feat:false,badge:null},
  {b:'Dacia',m:'Sandero',s:'TCe 90 Comfort',t:'Compacto',fuel:'Gasolina',g:'Manual',p:320,cv:90,cons:'5.5L/100km',plazas:5,img:'fotos/dacia-sandero.jpg',cat:'turismo',feat:false,badge:null},
  {b:'Renault',m:'Captur',s:'TCe 90 Equilibre',t:'SUV',fuel:'Gasolina',g:'Manual',p:313,cv:90,cons:'5.8L/100km',plazas:5,img:'fotos/renault-captur.jpg',cat:'suv',feat:false,badge:null},
  {b:'Renault',m:'Captur',s:'E-Tech Full Hybrid Techno 160CV',t:'SUV',fuel:'Híbrido',g:'Automático',p:409,cv:160,cons:'4.4L/100km',plazas:5,img:'fotos/renault-captur.jpg',cat:'hibrido',feat:false,badge:'Híbrido',oferta:true},
  {b:'Toyota',m:'Yaris',s:'120H 116CV ACTIVE',t:'Compacto',fuel:'Híbrido',g:'Automático',p:343,cv:116,cons:'3.9L/100km',plazas:5,img:'fotos/toyota-yaris.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Volkswagen',m:'T-Cross',s:'1.0 TSI 81kW',t:'SUV',fuel:'Gasolina',g:'Automático',p:420,cv:110,cons:'5.4L/100km',plazas:5,img:'fotos/vw-tcross.jpg',cat:'suv',feat:false,badge:'SUV'},
  {b:'Mazda',m:'CX-30',s:'e-SKYACTIV G MHEV 140CV MT',t:'SUV',fuel:'Híbrido',g:'Manual',p:350,cv:140,cons:'5.2L/100km',plazas:5,img:'fotos/mazda-cx30.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Volkswagen',m:'Taigo',s:'1.0 TSI 70kW 95CV',t:'SUV',fuel:'Gasolina',g:'Manual',p:351,cv:95,cons:'5.4L/100km',plazas:5,img:'fotos/vw-taigo.jpg',cat:'suv',feat:false,badge:'SUV'},
  {b:'Volkswagen',m:'Taigo',s:'TSI 116CV DSG',t:'SUV',fuel:'Gasolina',g:'Automático',p:356,cv:116,cons:'5.3L/100km',plazas:5,img:'fotos/vw-taigo.jpg',cat:'suv',feat:true,badge:'SUV'},
  {b:'Ford',m:'Puma',s:'Trend 1.0 Ecoboost Mhev 95CV',t:'Compacto',fuel:'Híbrido',g:'Manual',p:399,cv:95,cons:'5.0L/100km',plazas:5,img:'fotos/ford-puma.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Ford',m:'Puma',s:'ST Line 1.0 Ecoboost Mhev 125CV',t:'Compacto',fuel:'Híbrido',g:'Manual',p:399,cv:125,cons:'5.3L/100km',plazas:5,img:'fotos/ford-puma.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Kia',m:'Stonic',s:'Concept 1.0 T-GDI MHEV 85kW',t:'SUV',fuel:'Híbrido',g:'Manual',p:340,cv:115,cons:'5.3L/100km',plazas:5,img:'fotos/kia-stonic.jpg',cat:'suv',feat:false,badge:'SUV',oferta:true},
  {b:'Opel',m:'Combo',s:'L 650Kg 1.5 S&S MT',t:'Furgoneta',fuel:'Diesel',g:'Manual',p:339,cv:100,cons:'5.6L/100km',plazas:6,img:'fotos/opel-combo.jpg',cat:'furgoneta',feat:false,badge:null},
  {b:'Hyundai',m:'Tucson',s:'1.6 TGDi Essential 150CV',t:'SUV',fuel:'Gasolina',g:'Manual',p:366,cv:150,cons:'7.5L/100km',plazas:5,img:'fotos/hyundai-tucson.jpg',cat:'suv',feat:false,badge:'SUV',oferta:true},
  {b:'Hyundai',m:'Tucson',s:'1.6 TGDi Klass 150CV',t:'SUV',fuel:'Gasolina',g:'Manual',p:366,cv:150,cons:'7.5L/100km',plazas:5,img:'fotos/hyundai-tucson.jpg',cat:'suv',feat:false,badge:'SUV'},
  {b:'Hyundai',m:'Tucson',s:'1.6 HEV AT Klass 239CV',t:'SUV',fuel:'Híbrido',g:'Automático',p:530,cv:239,cons:'5.6L/100km',plazas:5,img:'fotos/hyundai-tucson.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Renault',m:'Symbioz',s:'E-Tech Full Hybrid 145CV Techno',t:'SUV',fuel:'Híbrido',g:'Automático',p:406,cv:145,cons:'4.6L/100km',plazas:5,img:'fotos/renault-symbioz.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Renault',m:'Symbioz',s:'Evolution MHEV 103kW',t:'SUV',fuel:'Híbrido',g:'Automático',p:406,cv:140,cons:'5.6L/100km',plazas:5,img:'fotos/renault-symbioz.jpg',cat:'hibrido',feat:true,badge:'Híbrido'},
  {b:'Citroën',m:'C4',s:'PureTech 130 S&S EAT8 Max',t:'SUV',fuel:'Gasolina',g:'Automático',p:372,cv:130,cons:'6.2L/100km',plazas:5,img:'fotos/citroen-c4-130.jpg',cat:'suv',feat:false,badge:null},
  {b:'Citroën',m:'C4',s:'Hybrid 145 ë-DCS6 Max',t:'SUV',fuel:'Híbrido',g:'Automático',p:409,cv:145,cons:'4.8L/100km',plazas:5,img:'fotos/citroen-c4-hybrid.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'KGM',m:'Tívoli',s:'G15 Urban Plus 4x2',t:'SUV',fuel:'Gasolina',g:'Manual',p:410,cv:135,cons:'7.0L/100km',plazas:5,img:'fotos/kgm-tivoli.jpg',cat:'suv',feat:false,badge:null},
  {b:'Peugeot',m:'Partner',s:'1.5 BlueHDi S&S Standard',t:'Furgoneta',fuel:'Diesel',g:'Manual',p:429,cv:100,cons:'5.6L/100km',plazas:6,img:'fotos/peugeot-partner.jpg',cat:'furgoneta',feat:false,badge:null},
  {b:'Ebro',m:'S400',s:'1.5 DHE HEV Excellence CVT',t:'SUV',fuel:'Híbrido',g:'Automático',p:430,cv:211,cons:'5.3L/100km',plazas:5,img:'fotos/ebro-s400.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Toyota',m:'Yaris Cross',s:'130H e-CVT 5P ACTIVE',t:'Compacto',fuel:'Híbrido',g:'Automático',p:431,cv:130,cons:'4.2L/100km',plazas:5,img:'fotos/toyota-yaris-cross.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Jeep',m:'Avenger',s:'1.2 Altitude 74kW 100CV',t:'SUV',fuel:'Gasolina',g:'Manual',p:439,cv:100,cons:'5.8L/100km',plazas:5,img:'fotos/jeep-avenger.jpg',cat:'suv',feat:false,badge:null},
  {b:'Škoda',m:'Octavia',s:'2.0 TDI 110kW Limo Selection',t:'Compacto',fuel:'Diesel',g:'Automático',p:426,cv:150,cons:'5.4L/100km',plazas:5,img:'fotos/skoda-octavia.jpg',cat:'turismo',feat:false,badge:'Diesel'},
  {b:'Volkswagen',m:'T-Roc',s:'1.5 eTSI 85kW 116CV DSG',t:'SUV',fuel:'Híbrido',g:'Automático',p:428,cv:116,cons:'5.7L/100km',plazas:5,img:'fotos/vw-troc.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Audi',m:'A3 Sportback',s:'TFSI S tronic',t:'Compacto',fuel:'Gasolina',g:'Automático',p:459,cv:116,cons:'5.5L/100km',plazas:5,img:'fotos/audi-a3.jpg',cat:'turismo',feat:false,badge:null},
  {b:'Mazda',m:'CX-5',s:'2.5 e-SKYACTIV-G MHEV Centre-line',t:'SUV',fuel:'Híbrido',g:'Automático',p:495,cv:141,cons:'7.5L/100km',plazas:5,img:'fotos/mazda-cx5.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Mazda',m:'CX-5',s:'2.5t e-SkyActiv-G MHEV Homura',t:'SUV',fuel:'Híbrido',g:'Automático',p:495,cv:194,cons:'6.8L/100km',plazas:5,img:'fotos/mazda-cx5.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'KGM',m:'Korando',s:'G15 4x2 Urban Plus 109kW',t:'SUV',fuel:'Gasolina',g:'Manual',p:475,cv:128,cons:'7.5L/100km',plazas:5,img:'fotos/kgm-korando.jpg',cat:'suv',feat:false,badge:null},
  {b:'Volkswagen',m:'Tiguan',s:'MÁS 1.5 eTSI 150CV DSG',t:'SUV',fuel:'Híbrido',g:'Automático',p:483,cv:150,cons:'6.8L/100km',plazas:5,img:'fotos/vw-tiguan.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Volkswagen',m:'Tiguan',s:'1.5 eTSI 130CV DSG',t:'SUV',fuel:'Híbrido',g:'Automático',p:483,cv:130,cons:'6.6L/100km',plazas:5,img:'fotos/vw-tiguan.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Alfa Romeo',m:'Junior',s:'Ibrida 1.2 Core 145cv eDCT6',t:'SUV',fuel:'Híbrido',g:'Automático',p:485,cv:145,cons:'4.8L/100km',plazas:5,img:'fotos/alfa-romeo-junior.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Nissan',m:'Qashqai',s:'Acenta e-Power 190cv',t:'SUV',fuel:'Híbrido',g:'Automático',p:495,cv:190,cons:'4.4L/100km',plazas:5,img:'fotos/nissan-qashqai-epower.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Renault',m:'Austral',s:'Techno Mild Hybrid 160cv',t:'SUV',fuel:'Híbrido',g:'Automático',p:499,cv:150,cons:'6.4L/100km',plazas:5,img:'fotos/renault-austral.jpg',cat:'hibrido',feat:true,badge:'Híbrido'},
  {b:'Škoda',m:'Karoq',s:'2.0 TDI DSG',t:'SUV',fuel:'Diesel',g:'Automático',p:499,cv:150,cons:'5.4L/100km',plazas:5,img:'fotos/skoda-karoq.jpg',cat:'suv',feat:false,badge:'Diesel'},
  {b:'Škoda',m:'Elroq',s:'82kWh Batterie 210KW',t:'SUV',fuel:'Eléctrico',g:'Automático',p:538,cv:286,cons:'15.2kWh/100km',plazas:5,img:'fotos/skoda-elroq.jpg',cat:'hibrido',feat:false,badge:'EV'},
  {b:'Mazda',m:'6e',s:'RW Takumi 245kW Gran Autonomía',t:'Compacto',fuel:'Eléctrico',g:'Automático',p:582,cv:250,cons:'16.6kWh/100km',plazas:5,img:'fotos/mazda-6e.jpg',cat:'hibrido',feat:false,badge:'EV'},
  {b:'Nissan',m:'Interstar',s:'L2H2 2.3D 135CV',t:'Furgoneta',fuel:'Diesel',g:'Manual',p:546,cv:135,cons:'8.2L/100km',plazas:3,img:'fotos/nissan-interstar.jpg',cat:'furgoneta',feat:false,badge:null},
  {b:'Fiat',m:'Ducato',s:'35 L2H2 Bluehdi',t:'Furgoneta',fuel:'Diesel',g:'Manual',p:499,cv:140,cons:'6.3L/100km',plazas:3,img:'fotos/fiat-ducato.jpg',cat:'furgoneta',feat:false,badge:null},
  {b:'Nissan',m:'X-Trail',s:'MY25 1.5 E-Power 204CV Acenta',t:'SUV',fuel:'Híbrido',g:'Automático',p:565,cv:204,cons:'5.7L/100km',plazas:5,img:'fotos/nissan-xtrail.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Foton',m:'Tunland',s:'2.4D 4WD AT',t:'Todoterreno',fuel:'Diesel',g:'Automático',p:599,cv:162,cons:'8.5L/100km',plazas:5,img:'fotos/foton-tunland.jpg',cat:'4x4',feat:false,badge:null},
  {b:'Renault',m:'Rafale',s:'Techno E-Tech Full Hybrid 200CV',t:'SUV',fuel:'Híbrido',g:'Automático',p:589,cv:200,cons:'4.8L/100km',plazas:5,img:'fotos/renault-rafale.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Renault',m:'Espace',s:'Techno E-Tech Full Hybrid 200CV',t:'SUV',fuel:'Híbrido',g:'Automático',p:590,cv:200,cons:'4.9L/100km',plazas:7,img:'fotos/renault-espace.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'KGM',m:'Musso',s:'Sports D22 DTR 4X4 PRO',t:'Todoterreno',fuel:'Diesel',g:'Manual',p:495,cv:202,cons:'8.7L/100km',plazas:5,img:'fotos/kgm-musso.jpg',cat:'4x4',feat:false,badge:null},
  {b:'Subaru',m:'Crosstrek',s:'2.0i Hybrid Field CVT',t:'SUV',fuel:'Híbrido',g:'Automático',p:625,cv:145,cons:'7.7L/100km',plazas:5,img:'fotos/subaru-crosstrek.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Subaru',m:'Forester',s:'2.0i Hybrid Field CVT',t:'SUV',fuel:'Híbrido',g:'Automático',p:719,cv:152,cons:'8.1L/100km',plazas:5,img:'fotos/subaru-forester.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'MAXUS',m:'T60 Max',s:'2.0D 4WD AT',t:'Todoterreno',fuel:'Diesel',g:'Automático',p:705,cv:215,cons:'9.1L/100km',plazas:5,img:'fotos/maxus-t60.jpg',cat:'4x4',feat:false,badge:null},
  {b:'Mitsubishi',m:'Outlander',s:'PHEV Híbrido Enchufable 4WD',t:'SUV',fuel:'PHEV',g:'Automático',p:699,cv:306,cons:'2.6L/100km',plazas:5,img:'fotos/mitsubishi-outlander.jpg',cat:'hibrido',feat:false,badge:'PHEV'},
  {b:'Omoda',m:'9',s:'Híbrido 1.5 TGDI Premium',t:'SUV',fuel:'Híbrido',g:'Automático',p:779,cv:195,cons:'6.5L/100km',plazas:7,img:'fotos/omoda-9.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Subaru',m:'Outback',s:'2.5 Touring Lineatronic',t:'SUV',fuel:'Gasolina',g:'Automático',p:799,cv:169,cons:'8.6L/100km',plazas:5,img:'fotos/subaru-outback.jpg',cat:'suv',feat:false,badge:null},
  {b:'KGM',m:'Rexton',s:'D22 DTR Pro 4x4',t:'SUV',fuel:'Diesel',g:'Automático',p:829,cv:202,cons:'8.4L/100km',plazas:7,img:'fotos/kgm-rexton.jpg',cat:'suv',feat:false,badge:'Diesel'},
  {b:'SEAT',m:'Arona',s:'1.0 TSI St&Sp Style Plus',t:'Compacto',fuel:'Gasolina',g:'Manual',p:289,cv:110,cons:'5.3L/100km',plazas:5,img:'fotos/seat-arona.jpg',cat:'turismo',feat:false,badge:null},
  {b:'Toyota',m:'Proace',s:'CITY VAN 50kWh EV L1 GX',t:'Furgoneta',fuel:'Eléctrico',g:'Automático',p:346,cv:136,cons:'17.3kWh/100km',plazas:3,img:'fotos/toyota-proace-city.jpg',cat:'hibrido',feat:false,badge:'EV'},
  {b:'Mazda',m:'3',s:'2.5 e-Skyactiv-G Centre-line',t:'Compacto',fuel:'Híbrido',g:'Manual',p:424,cv:186,cons:'6.4L/100km',plazas:5,img:'fotos/mazda-3-2.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'MG',m:'ZS',s:'1.5 Hybrid',t:'SUV',fuel:'Híbrido',g:'Automático',p:451,cv:196,cons:'5.4L/100km',plazas:5,img:'fotos/mg-zs-1.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Volkswagen',m:'Golf',s:'Match EHYBRID',t:'Compacto',fuel:'Híbrido',g:'Automático',p:493,cv:204,cons:'1.0L/100km',plazas:5,img:'fotos/volkswagen-golf-match.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Ebro',m:'s700',s:'1.6 TGDI Luxury 7 DCT',t:'SUV',fuel:'Gasolina',g:'Automático',p:499,cv:197,cons:'8.0L/100km',plazas:5,img:'fotos/ebro-s700-1.jpg',cat:'suv',feat:false,badge:null},
  {b:'Ebro',m:'s800 PHEV',s:'1.5 TGDI 1DHT 2WD [2025] - Luxury7',t:'SUV',fuel:'PHEV',g:'Automático',p:583,cv:245,cons:'1.5L/100km',plazas:5,img:'fotos/ebro-s800-phev.jpg',cat:'hibrido',feat:false,badge:'PHEV'},
  {b:'MAXUS',m:'Deliver 9',s:'Maxus Deliver 9 2.0D L3H2 150',t:'Furgoneta',fuel:'Diesel',g:'Manual',p:649,cv:150,cons:'9.0L/100km',plazas:3,img:'fotos/maxus-deliver-9.jpg',cat:'diesel',feat:false,badge:'Diesel'},
  {b:'Citroën',m:'C4',s:'1.2 Hybrid MHEV 145 Business',t:'SUV',fuel:'Híbrido',g:'Automático',p:372,cv:145,cons:'5.5L/100km',plazas:5,img:'fotos/citroen-c4-business.jpg',cat:'hibrido',feat:true,badge:'EXCLUSIVO',oferta:true},
  {b:'Opel',m:'Combo Cargo',s:'L 650Kg 1.5 S&S MT E6',t:'Furgoneta',fuel:'Diesel',g:'Manual',p:339,cv:100,cons:'5.6L/100km',plazas:6,img:'fotos/opel-combo-cargo.jpg',cat:'diesel',feat:false,badge:'Diesel'},
  {b:'Peugeot',m:'Rifter',s:'Active Business Standard BHDI 100',t:'Furgoneta',fuel:'Diesel',g:'Manual',p:345,cv:100,cons:'5.4L/100km',plazas:3,img:'fotos/peugeot-rifter-active.png',cat:'diesel',feat:false,badge:'Diesel'},
  {b:'Omoda',m:'5',s:'HEV Business 1.5 TGDI 224CV',t:'SUV',fuel:'Híbrido',g:'Automático',p:411,cv:224,cons:'5.4L/100km',plazas:5,img:'fotos/omoda-5-hev.png',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Peugeot',m:'2008',s:'Allure Hybrid 110 eDCS6',t:'SUV',fuel:'Híbrido',g:'Automático',p:432,cv:110,cons:'5.0L/100km',plazas:5,img:'fotos/peugeot-2008.png',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Jaecoo',m:'5',s:'HEV 1.5 TGDI 224CV BUSINESS',t:'SUV',fuel:'Híbrido',g:'Automático',p:447,cv:224,cons:'5.4L/100km',plazas:5,img:'fotos/jaecoo-5-hev.png',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Peugeot',m:'3008',s:'1.2 Allure EDCS6',t:'SUV',fuel:'Híbrido',g:'Automático',p:449,cv:130,cons:'5.8L/100km',plazas:5,img:'fotos/peugeot-3008-1.png',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Ford',m:'Kuga',s:'Titanium 1.5 EcoBoost 4x2 110KW',t:'SUV',fuel:'Híbrido',g:'Manual',p:459,cv:150,cons:'6.5L/100km',plazas:5,img:'fotos/ford-kuga.jpg',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Toyota',m:'C-HR',s:'1.8 ADVANCE HYBRID 140 e-CVT',t:'SUV',fuel:'Híbrido',g:'Automático',p:469,cv:140,cons:'4.3L/100km',plazas:5,img:'fotos/toyota-c-hr.png',cat:'hibrido',feat:false,badge:'Híbrido'},
  {b:'Jeep',m:'Compass',s:'1.2 MHEV Altitude 110',t:'SUV',fuel:'Híbrido',g:'Automático',p:495,cv:110,cons:'6.3L/100km',plazas:5,img:'fotos/jeep-compass-1.png',cat:'hibrido',feat:false,badge:'Híbrido',oferta:true},
  {b:'Mazda',m:'CX-60',s:'e-SKYACTIV D MHEV 8AT EXCLUSIVE-LINE',t:'SUV',fuel:'Híbrido',g:'Automático',p:518,cv:200,cons:'5.3L/100km',plazas:5,img:'fotos/mazda-cx-60.png',cat:'hibrido',feat:false,badge:'Híbrido',oferta:true},
  {b:'Jaecoo',m:'7',s:'PHEV 1.5 TGDI 279CV BUSINESS',t:'SUV',fuel:'PHEV',g:'Automático',p:531,cv:279,cons:'1.5L/100km',plazas:5,img:'fotos/jaecoo-7-phev.png',cat:'hibrido',feat:false,badge:'PHEV'},
  {b:'Toyota',m:'Hilux',s:'MY25 GX 2.4B 150 CV 6AT 4X4',t:'SUV',fuel:'Diesel',g:'Automático',p:635,cv:150,cons:'8.5L/100km',plazas:5,img:'fotos/toyota-hilux-my25.png',cat:'diesel',feat:false,badge:'Diesel'},
  {b:'Omoda',m:'7',s:'PHEV 1.5T 279CV PREMIUM',t:'SUV',fuel:'PHEV',g:'Automático',p:679,cv:279,cons:'1.5L/100km',plazas:5,img:'fotos/omoda-7-phev.png',cat:'hibrido',feat:false,badge:'PHEV'},
  {b:'Cupra',m:'Formentor',s:'1.5 eTSI 150CV DSG',t:'SUV',fuel:'Gasolina',g:'Automático',p:430,cv:150,cons:'6.7L/100km',plazas:5,img:'fotos/cupra-formentor.jpg',cat:'turismo',feat:false,badge:null},
  {b:'MG',m:'ZS',s:'HEV 1.5T 197CV Automático',t:'SUV',fuel:'Híbrido',g:'Automático',p:369,cv:197,cons:'6.5L/100km',plazas:5,img:'fotos/mg-zs.jpg',cat:'hibrido',feat:true,badge:'ECO · Oferta',oferta:true},
];

const FUEL_MAP = { Gasolina: "gasolina", Híbrido: "hibrido", Eléctrico: "electrico", Diesel: "diesel", PHEV: "phev" };
const TRANSMISSION_MAP = { Manual: "manual", Automático: "automatico" };

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseConsumption(cons) {
  const match = cons.match(/^([\d.]+)\s*(.+)$/);
  if (!match) return { value: null, unit: null };
  return { value: match[1], unit: match[2].toLowerCase() };
}

function sqlStr(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

// --- Marcas ---
const brandNames = [...new Set(CARS.map((c) => c.b))].sort();
const brandSlugs = new Map(brandNames.map((name) => [name, slugify(name)]));

// --- Modelos (marca + modelo unicos) ---
const modelKey = (car) => `${car.b}::${car.m}`;
const modelsMap = new Map();
for (const car of CARS) {
  const key = modelKey(car);
  if (!modelsMap.has(key)) {
    modelsMap.set(key, {
      brand: car.b,
      name: car.m,
      slug: `renting-${brandSlugs.get(car.b)}-${slugify(car.m)}`,
    });
  }
}

// --- SQL ---
const lines = [];
lines.push("-- Generado desde el array CARS de quierorenting.es (80 vehiculos, " + new Date().toISOString().slice(0, 10) + ")");
lines.push("-- Pegar en el SQL Editor de Supabase DESPUES de aplicar 0001_init.sql");
lines.push("");

lines.push("insert into brands (name, slug) values");
lines.push(
  brandNames.map((name) => `  (${sqlStr(name)}, ${sqlStr(brandSlugs.get(name))})`).join(",\n") + "\non conflict (slug) do nothing;"
);
lines.push("");

lines.push("insert into models (brand_id, name, slug)");
lines.push("select b.id, m.name, m.slug from (values");
lines.push(
  [...modelsMap.values()]
    .map((m) => `  (${sqlStr(brandSlugs.get(m.brand))}, ${sqlStr(m.name)}, ${sqlStr(m.slug)})`)
    .join(",\n")
);
lines.push(") as m(brand_slug, name, slug)");
lines.push("join brands b on b.slug = m.brand_slug");
lines.push("on conflict (slug) do nothing;");
lines.push("");

const usedVersionSlugs = new Map();
function uniqueVersionSlug(modelSlug, version) {
  let slug = slugify(version) || "base";
  const key = `${modelSlug}::${slug}`;
  if (usedVersionSlugs.has(key)) {
    const n = usedVersionSlugs.get(key) + 1;
    usedVersionSlugs.set(key, n);
    slug = `${slug}-${n}`;
  } else {
    usedVersionSlugs.set(key, 1);
  }
  return slug;
}

lines.push("insert into vehicles (");
lines.push(
  "  model_id, version, version_slug, category, fuel_type, transmission, monthly_price_cents,"
);
lines.push("  horsepower, consumption_value, consumption_unit, seats, is_featured, is_offer, badge_text");
lines.push(")");
lines.push("select mo.id, v.version, v.version_slug, v.category::vehicle_category, v.fuel_type::fuel_type,");
lines.push("       v.transmission::transmission_type, v.monthly_price_cents, v.horsepower,");
lines.push("       v.consumption_value::numeric, v.consumption_unit, v.seats, v.is_featured, v.is_offer, v.badge_text");
lines.push("from (values");

const vehicleRows = CARS.map((car) => {
  const modelSlug = modelsMap.get(modelKey(car)).slug;
  const versionSlug = uniqueVersionSlug(modelSlug, car.s);
  const { value: consValue, unit: consUnit } = parseConsumption(car.cons);
  const fuelType = FUEL_MAP[car.fuel];
  const transmission = TRANSMISSION_MAP[car.g];
  if (!fuelType) throw new Error(`Combustible desconocido: ${car.fuel} (${car.b} ${car.m})`);
  if (!transmission) throw new Error(`Cambio desconocido: ${car.g} (${car.b} ${car.m})`);

  return `  (${sqlStr(modelSlug)}, ${sqlStr(car.s)}, ${sqlStr(versionSlug)}, ${sqlStr(car.cat)}, ${sqlStr(fuelType)}, ${sqlStr(transmission)}, ${car.p * 100}, ${car.cv ?? "null"}, ${consValue ? sqlStr(consValue) : "null"}, ${consUnit ? sqlStr(consUnit) : "null"}, ${car.plazas ?? "null"}, ${car.feat ? "true" : "false"}, ${car.oferta ? "true" : "false"}, ${sqlStr(car.badge)})`;
});

lines.push(vehicleRows.join(",\n"));
lines.push(") as v(model_slug, version, version_slug, category, fuel_type, transmission, monthly_price_cents,");
lines.push("       horsepower, consumption_value, consumption_unit, seats, is_featured, is_offer, badge_text)");
lines.push("join models mo on mo.slug = v.model_slug");
lines.push("on conflict (model_id, version_slug) do nothing;");
lines.push("");
lines.push(`-- Total: ${CARS.length} vehiculos, ${brandNames.length} marcas, ${modelsMap.size} modelos.`);
lines.push("-- Las imagenes (main_image_url) se dejan sin asignar: se suben a Supabase Storage");
lines.push("-- en un paso aparte, copiando desde quiero-renting/fotos/.");

console.log(lines.join("\n"));
