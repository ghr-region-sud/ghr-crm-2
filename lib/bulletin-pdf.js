import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';

const REF_W=1323, REF_H=1871;
const BLUE=rgb(0.09,0.27,0.66);
const WHITE=rgb(1,1,1);
const TINT=rgb(0.995,0.985,0.965);

const sx=(x,w)=>x*w/REF_W;
const sy=(y,h)=>h-y*h/REF_H;

function clean(v){
  if(v===null||v===undefined)return '';
  return String(v).trim();
}
function amount(v){
  const n=Number(v||0);
  return n?new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n):'';
}
function activityFlags(items=[]){
  const set=new Set((items||[]).map(v=>String(v||'').trim()));
  const has=(...xs)=>xs.some(x=>set.has(x));
  return {
    hotel:has('Hôtel'),hotel2:has('Hôtel 2*','Hôtel 2★'),hotel3:has('Hôtel 3*','Hôtel 3★'),
    hotel4:has('Hôtel 4*','Hôtel 4★'),hotel5:has('Hôtel 5*','Hôtel 5★'),luxuryHotel:has('Hôtel de luxe'),
    restaurant:has('Restaurant Brasserie','Restaurant / Brasserie','Restaurant de plage'),
    cafeBar:has('Café Bar','Café / Bar'),nightclub:has('Discothèque'),ambianceBar:has('Bar à ambiance'),
    caterer:has('Traiteur organisateur de réception','Traiteur'),fastFood:has('Restauration rapide')
  };
}
function fitSize(font,text,maxWidth,start,min=4.2){
  let size=start;
  while(size>min && font.widthOfTextAtSize(text,size)>maxWidth)size-=0.2;
  return size;
}
function coverPx(page,{x,y,w,h},pageW,pageH,color=WHITE){
  page.drawRectangle({x:sx(x,pageW),y:sy(y+h,pageH),width:sx(w,pageW),height:h*pageH/REF_H,color});
}
function valuePx(page,font,text,box,pageW,pageH,{size=6.0,color=BLUE,align='right',bold=true,bg=WHITE,pad=2}={}){
  coverPx(page,box,pageW,pageH,bg);
  const t=clean(text); if(!t)return;
  const maxW=sx(box.w-pad*2,pageW);
  const fs=fitSize(font,t,maxW,size,4.1);
  const tw=font.widthOfTextAtSize(t,fs);
  let x=sx(box.x+pad,pageW);
  if(align==='right')x=sx(box.x+box.w-pad,pageW)-tw;
  else if(align==='center')x=sx(box.x,pageW)+(sx(box.w,pageW)-tw)/2;
  const y=sy(box.y+box.h-2,pageH);
  page.drawText(t,{x,y,size:fs,font,color});
}
function drawCheckPx(page,x,y,pageW,pageH,size=13){
  const kx=sx(x,pageW), ky=sy(y+size,pageH), s=size*pageW/REF_W;
  page.drawLine({start:{x:kx+s*.12,y:ky+s*.42},end:{x:kx+s*.38,y:ky+s*.15},thickness:1.15,color:BLUE});
  page.drawLine({start:{x:kx+s*.37,y:ky+s*.15},end:{x:kx+s*.88,y:ky+s*.82},thickness:1.15,color:BLUE});
}
function clearHeaderYear(page,font,year,pageW,pageH){
  const box={x:495,y:212,w:235,h:60};
  coverPx(page,box,pageW,pageH,WHITE);
  const label='ANNÉE '+year;
  const fs=14.2, tw=font.widthOfTextAtSize(label,fs);
  page.drawText(label,{x:sx(500,pageW),y:sy(251,pageH),size:fs,font,color:rgb(.84,.56,.08)});
}
function clearCotisationYear(page,font,year,pageW,pageH){
  // Replace only the year embedded in the static sentence.
  coverPx(page,{x:230,y:1343,w:88,h:32},pageW,pageH,WHITE);
  page.drawText(String(year),{x:sx(242,pageW),y:sy(1368,pageH),size:5.2,font,color:rgb(.05,.05,.05)});
}

export async function buildBulletinPdf(referenceBytes,company={},membership={},contact={}){
  const src=await PDFDocument.load(referenceBytes);
  const out=await PDFDocument.create();
  const [page]=await out.copyPages(src,[0]);
  out.addPage(page);
  const pageW=page.getWidth(), pageH=page.getHeight();
  const font=await out.embedFont(StandardFonts.HelveticaBold);
  const year=Number(String(membership.startDate||'').slice(0,4))||Number(membership.year)||new Date().getFullYear();
  clearHeaderYear(page,font,year,pageW,pageH);
  clearCotisationYear(page,font,year,pageW,pageH);

  // Clean every technical placeholder from the validated reference before injecting CRM data.
  // The reference remains the visual master; these masks only remove variable labels such as {company.name}.
  [
   {x:185,y:690,w:220,h:120},{x:590,y:690,w:205,h:120},
   {x:195,y:1018,w:335,h:235},{x:570,y:1018,w:225,h:235},
   {x:625,y:1525,w:170,h:165}
  ].forEach(b=>coverPx(page,b,pageW,pageH,WHITE));
  [
   {x:1060,y:792,w:225,h:370},{x:1055,y:1260,w:230,h:55},{x:1080,y:1445,w:205,h:90}
  ].forEach(b=>coverPx(page,b,pageW,pageH,TINT));

  // Membership type checkboxes.
  if(membership.type==='Renouvellement') drawCheckPx(page,440,297,pageW,pageH,13);
  else drawCheckPx(page,201,297,pageW,pageH,13);

  const V=(box,text,opt)=>valuePx(page,font,text,box,pageW,pageH,opt);
  // 1. Etablissement
  V({x:642,y:416,w:145,h:28},company.name);
  V({x:620,y:452,w:167,h:28},company.legalName);
  V({x:620,y:488,w:167,h:28},company.address);
  V({x:220,y:524,w:175,h:28},company.postalCode);
  V({x:640,y:524,w:147,h:28},company.city);
  V({x:190,y:560,w:205,h:29},company.phone);
  V({x:635,y:560,w:152,h:29},company.email);

  // 2. Contact referent
  V({x:195,y:697,w:205,h:32},contact.lastName);
  V({x:590,y:697,w:197,h:32},contact.firstName);
  V({x:575,y:735,w:212,h:32},contact.role);
  V({x:215,y:772,w:185,h:32},contact.phone);
  V({x:590,y:772,w:197,h:32},contact.email);

  // 3. Activite checkboxes
  const a=activityFlags(company.businessActivities||[]);
  const checks={hotel:[58,961],hotel2:[160,961],hotel3:[264,961],hotel4:[58,1001],hotel5:[160,1001],luxuryHotel:[264,1001],restaurant:[58,1040],cafeBar:[160,1040],nightclub:[264,1040],ambianceBar:[58,1080],caterer:[160,1080],fastFood:[264,1080]};
  Object.entries(checks).forEach(([k,[x,y]])=>{if(a[k])drawCheckPx(page,x,y,pageW,pageH,13)});
  V({x:575,y:1028,w:212,h:30},company.otherActivity);
  V({x:205,y:1066,w:240,h:30},company.employees);
  V({x:630,y:1066,w:157,h:30},company.rooms);
  V({x:215,y:1103,w:230,h:30},company.classification);
  V({x:225,y:1140,w:220,h:30},company.licenseType);
  V({x:240,y:1177,w:205,h:30},company.siret);
  V({x:625,y:1177,w:162,h:30},company.naf);
  V({x:390,y:1214,w:397,h:30},company.legalStatus);

  // 4. Adhesion & cotisation
  V({x:605,y:1344,w:182,h:32},amount(membership.amountExpected));
  V({x:575,y:1381,w:212,h:32},membership.type);
  V({x:625,y:1419,w:162,h:32},year);

  // 5. Options - put a check in Oui or Non
  const optionRows=[
    [membership.newsletter,494,1541,558],
    [membership.insuranceInfo,494,1579,558],
    [membership.legalProtection,494,1617,558],
    [membership.communicationConsent,494,1655,558]
  ];
  optionRows.forEach(([yes,xYes,y,xNo])=>drawCheckPx(page,yes?xYes:xNo,y,pageW,pageH,12));

  // 6. Payment method
  const method=String(membership.paymentMethod||'').toLowerCase();
  const payY=method.includes('chèque')||method.includes('cheque')?481:method.includes('sepa')||method.includes('prélèvement')||method.includes('prelevement')?513:method.includes('virement')?548:null;
  if(payY)drawCheckPx(page,838,payY,pageW,pageH,13);

  // 7. SEPA (tinted background)
  const tint=TINT;
  V({x:1070,y:804,w:205,h:30},membership.sepa?.accountHolder,{bg:tint});
  V({x:1070,y:841,w:205,h:30},membership.sepa?.address,{bg:tint});
  V({x:1100,y:878,w:175,h:30},membership.sepa?.postalCode,{bg:tint});
  V({x:1110,y:915,w:165,h:30},membership.sepa?.city,{bg:tint});
  V({x:1105,y:952,w:170,h:30},membership.sepa?.country||'France',{bg:tint});
  V({x:1090,y:1027,w:185,h:30},membership.sepa?.iban,{bg:tint,size:5.4});
  V({x:1090,y:1104,w:185,h:30},membership.sepa?.bic,{bg:tint});
  V({x:1065,y:1272,w:210,h:30},amount(membership.amountExpected),{bg:tint});

  // 8. Validation intentionally blank unless supplied.
  V({x:1085,y:1455,w:190,h:30},membership.signaturePlace||'',{bg:tint});
  V({x:1085,y:1492,w:190,h:30},membership.signatureDate||'',{bg:tint});

  out.setTitle(`Bulletin d'adhésion - ${clean(company.name)||'GHR Région Sud'}`);
  out.setSubject(`Bulletin d'adhésion ${year}`);
  out.setCreator('CRM GHR Région Sud');
  out.setProducer('CRM GHR Région Sud');
  return await out.save({useObjectStreams:false});
}
