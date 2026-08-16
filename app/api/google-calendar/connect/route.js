import {NextResponse} from "next/server";
import {effectiveDelegateId} from "../../../../lib/authz";
import {createToken} from "../../../../lib/session";
import {GOOGLE_SCOPE,googleConfig} from "../../../../lib/google-calendar";
export const dynamic="force-dynamic";
export async function GET(req){
 try{
  const a=await effectiveDelegateId();if(a.error)return NextResponse.redirect(new URL("/?google=unauthorized",req.url));
  const profileId=a.delegateId||a.profile.id;
  const origin=new URL(req.url).origin,{clientId,redirectUri}=googleConfig(origin);
  const state=createToken({kind:"google-calendar",profileId,returnTo:"/?page=calendar"});
  const q=new URLSearchParams({client_id:clientId,redirect_uri:redirectUri,response_type:"code",scope:GOOGLE_SCOPE,access_type:"offline",prompt:"consent",include_granted_scopes:"true",state});
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
 }catch(e){return NextResponse.redirect(new URL(`/?google_error=${encodeURIComponent(e.message||"configuration")}`,req.url))}
}
