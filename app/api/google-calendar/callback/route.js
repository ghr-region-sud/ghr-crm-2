import {NextResponse} from "next/server";
import {verifyToken} from "../../../../lib/session";
import {googleConfig,getGoogleConnection,saveGoogleConnection} from "../../../../lib/google-calendar";
export const dynamic="force-dynamic";
export async function GET(req){
 const url=new URL(req.url),origin=url.origin;
 try{
  if(url.searchParams.get("error"))return NextResponse.redirect(new URL(`/?google=denied`,origin));
  const code=url.searchParams.get("code"),payload=verifyToken(url.searchParams.get("state"));
  if(!code||payload?.kind!=="google-calendar"||!payload.profileId)throw new Error("Retour OAuth invalide");
  const {clientId,clientSecret,redirectUri}=googleConfig(origin);
  const body=new URLSearchParams({client_id:clientId,client_secret:clientSecret,code,grant_type:"authorization_code",redirect_uri:redirectUri});
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,cache:"no-store"});
  const tok=await r.json();if(!r.ok)throw new Error(tok.error_description||tok.error||"Échange OAuth impossible");
  let email="";
  try{const u=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${tok.access_token}`},cache:"no-store"});if(u.ok)email=(await u.json()).email||""}catch{}
  const old=await getGoogleConnection(payload.profileId);
  await saveGoogleConnection({profile_id:payload.profileId,google_email:email,refresh_token:tok.refresh_token||old?.refresh_token||"",access_token:tok.access_token,expires_at:new Date(Date.now()+Number(tok.expires_in||3600)*1000).toISOString(),scope:tok.scope||""});
  return NextResponse.redirect(new URL("/?google=connected&page=calendar",origin));
 }catch(e){return NextResponse.redirect(new URL(`/?google_error=${encodeURIComponent(e.message||"oauth")}`,origin))}
}
