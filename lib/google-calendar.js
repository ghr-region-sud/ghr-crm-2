import {rest} from "./supabase";

export const GOOGLE_SCOPE="openid email https://www.googleapis.com/auth/calendar.events";
export function googleConfig(origin){
  const clientId=process.env.GOOGLE_CLIENT_ID;
  const clientSecret=process.env.GOOGLE_CLIENT_SECRET;
  if(!clientId||!clientSecret)throw new Error("Google Agenda non configuré");
  return {clientId,clientSecret,redirectUri:`${origin}/api/google-calendar/callback`};
}
export async function getGoogleConnection(profileId){
  const r=await rest(`google_calendar_connections?profile_id=eq.${encodeURIComponent(profileId)}&select=*`);
  if(!r.ok)return null;
  return (await r.json())?.[0]||null;
}
export async function saveGoogleConnection(row){
  const r=await rest("google_calendar_connections?on_conflict=profile_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify({...row,updated_at:new Date().toISOString()})});
  if(!r.ok)throw new Error(await r.text());
  return (await r.json())?.[0]||row;
}
export async function deleteGoogleConnection(profileId){
  const r=await rest(`google_calendar_connections?profile_id=eq.${encodeURIComponent(profileId)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
  if(!r.ok)throw new Error(await r.text());
}
export async function refreshAccessToken(connection,origin){
  if(connection.access_token&&connection.expires_at&&new Date(connection.expires_at).getTime()>Date.now()+60000)return connection.access_token;
  if(!connection.refresh_token)throw new Error("Reconnectez Google Agenda pour obtenir un jeton d’actualisation.");
  const {clientId,clientSecret}=googleConfig(origin);
  const body=new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:connection.refresh_token,grant_type:"refresh_token"});
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,cache:"no-store"});
  const j=await r.json();
  if(!r.ok)throw new Error(j.error_description||j.error||"Actualisation Google impossible");
  const expiresAt=new Date(Date.now()+Number(j.expires_in||3600)*1000).toISOString();
  await saveGoogleConnection({profile_id:connection.profile_id,google_email:connection.google_email||"",refresh_token:connection.refresh_token,access_token:j.access_token,expires_at:expiresAt,scope:j.scope||connection.scope||""});
  return j.access_token;
}
