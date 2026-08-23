import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import {effectiveDelegateId} from "../../../lib/authz";

export const dynamic="force-dynamic";
export const runtime="nodejs";

const GHR={
  address:"830 Boulevard de Léry - 83140 Six Fours Les Plages",
  website:"https://www.ghr-regionsud.fr/",
  websiteLabel:"www.ghr-regionsud.fr",
  email:"contact@ghr-region-sud.fr",
  iban:"FR76 1027 8097 1100 0206 6909 976",
  bic:"CMCIFR2A"
};

function escJson(value){return JSON.stringify(value).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026")}
function activityMap(items=[]){
 const has=(...names)=>items.some(v=>names.includes(String(v||"").trim()));
 return {
  hotel:has("Hôtel"),hotel2:has("Hôtel 2*","Hôtel 2★"),hotel3:has("Hôtel 3*","Hôtel 3★"),hotel4:has("Hôtel 4*","Hôtel 4★"),hotel5:has("Hôtel 5*","Hôtel 5★"),luxuryHotel:has("Hôtel de luxe"),
  restaurant:has("Restaurant Brasserie","Restaurant / Brasserie","Restaurant de plage"),cafeBar:has("Café Bar","Café / Bar"),nightclub:has("Discothèque"),ambianceBar:has("Bar à ambiance"),caterer:has("Traiteur organisateur de réception","Traiteur"),fastFood:has("Restauration rapide")
 };
}
function bulletinData(company={},membership={},contact={}){
 const year=Number(String(membership.startDate||"").slice(0,4))||new Date().getFullYear();
 const method=String(membership.paymentMethod||"").toLowerCase();
 return {
  company:{name:company.name||"",legalName:company.legalName||"",address:company.address||"",postalCode:company.postalCode||"",city:company.city||"",phone:company.phone||"",email:company.email||"",employees:company.employees||"",rooms:company.rooms||"",classification:company.classification||"",licenseType:company.licenseType||"",siret:company.siret||"",naf:company.naf||"",legalStatus:company.legalStatus||"",otherActivity:company.otherActivity||""},
  contact:{lastName:contact.lastName||"",firstName:contact.firstName||"",role:contact.role||"",phone:contact.phone||"",email:contact.email||""},
  membership:{year,type:membership.type||"",amount:Number(membership.amountExpected||0).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:2}),isNew:membership.type!=="Renouvellement",isRenewal:membership.type==="Renouvellement"},
  activity:activityMap(company.businessActivities||[]),
  options:{newsletterYes:!!membership.newsletter,newsletterNo:!membership.newsletter,insuranceYes:!!membership.insuranceInfo,insuranceNo:!membership.insuranceInfo,legalProtectionYes:!!membership.legalProtection,legalProtectionNo:!membership.legalProtection,communicationYes:!!membership.communicationConsent,communicationNo:!membership.communicationConsent},
  payment:{cheque:method.includes("chèque")||method.includes("cheque"),sepa:method.includes("sepa")||method.includes("prélèvement")||method.includes("prelevement"),transfer:method.includes("virement")},
  sepa:{accountHolder:membership.sepa?.accountHolder||"",address:membership.sepa?.address||"",postalCode:membership.sepa?.postalCode||"",city:membership.sepa?.city||"",country:membership.sepa?.country||"France",iban:membership.sepa?.iban||"",bic:membership.sepa?.bic||""},
  signature:{place:"",date:""}
 };
}

export async function POST(req){
 const auth=await effectiveDelegateId();
 if(auth.error)return NextResponse.json({error:"Authentification requise"},{status:auth.status||401});
 const body=await req.json().catch(()=>null);
 if(!body?.company||!body?.membership)return NextResponse.json({error:"Données du bulletin incomplètes"},{status:400});
 if(auth.delegateId&&body.company.ownerId!==auth.delegateId)return NextResponse.json({error:"Non autorisé"},{status:403});
 try{
  const root=path.join(process.cwd(),"public","bulletin");
  let html=await fs.readFile(path.join(root,"bulletin-template.html"),"utf8");
  const css=await fs.readFile(path.join(root,"bulletin-template.css"),"utf8");
  const logo=await fs.readFile(path.join(root,"logo-ghr-region-sud.png"));
  html=html.replace('<link rel="stylesheet" href="bulletin-template.css">',`<style>${css}</style>`)
    .replace('src="logo-ghr-region-sud.png"',`src="data:image/png;base64,${logo.toString("base64")}"`)
    .replace("</body>",`<script>\nconst __DATA__=${escJson(bulletinData(body.company,body.membership,body.contact||{}))};\nconst __GHR__=${escJson(GHR)};\ndocument.querySelectorAll('[data-config]').forEach(el=>{const key=el.dataset.config.split('.').pop(); if(__GHR__[key]!=null)el.textContent=__GHR__[key]});\nwindow.renderBulletin(__DATA__);\ndocument.title='Bulletin-adhesion-'+(${escJson(body.company.name||"GHR")}).replace(/[^a-z0-9_-]+/gi,'-');\nsetTimeout(()=>window.print(),450);\n</script></body>`);
  return new NextResponse(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e.message||"Impossible de générer le bulletin"},{status:500})}
}
