import {NextResponse} from "next/server";
import {requireUser} from "../../../../lib/authz";
import {getProfileById} from "../../../../lib/supabase";
import {getGoogleConnection,refreshAccessToken} from "../../../../lib/google-calendar";
export const dynamic="force-dynamic";
export async function POST(req){
 try{
  const a=await requireUser();if(a.error)return NextResponse.json({error:"Authentification requise"},{status:a.status});
  const b=await req.json();const profileId=b.profileId||a.profile.id;
  if(a.profile.role!=="admin"&&profileId!==a.profile.id)return NextResponse.json({error:"Accès refusé"},{status:403});
  const target=await getProfileById(profileId);if(!target||target.active===false)return NextResponse.json({error:"Délégué introuvable"},{status:404});
  const c=await getGoogleConnection(profileId);if(!c?.refresh_token)return NextResponse.json({error:"Google Agenda non connecté pour ce délégué",connected:false},{status:409});
  const origin=new URL(req.url).origin,token=await refreshAccessToken(c,origin),ap=b.appointment||{};
  const start=`${ap.date}T${ap.startTime||"09:00"}:00`,end=`${ap.date}T${ap.endTime||"10:00"}:00`;
  const contact=b.contact?[b.contact.firstName,b.contact.lastName].filter(Boolean).join(" "):"";
  const event={summary:ap.title||`Rendez-vous · ${b.companyName||"GHR"}`,location:ap.location||"",description:[b.companyName?`Entreprise : ${b.companyName}`:"",contact?`Contact : ${contact}`:"",b.contact?.phone?`Téléphone : ${b.contact.phone}`:"",ap.note||""].filter(Boolean).join("\n"),start:{dateTime:start,timeZone:"Europe/Paris"},end:{dateTime:end,timeZone:"Europe/Paris"}};
  const r=await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify(event),cache:"no-store"});
  const j=await r.json();if(!r.ok)return NextResponse.json({error:j.error?.message||"Création Google Agenda impossible"},{status:r.status});
  return NextResponse.json({ok:true,eventId:j.id,htmlLink:j.htmlLink});
 }catch(e){return NextResponse.json({error:e.message||"Erreur Google Agenda"},{status:500})}
}
