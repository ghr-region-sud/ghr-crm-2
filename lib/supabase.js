export function supabaseConfig(){const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("Supabase non configuré");return{url,key}}
export function sbHeaders(key,extra={}){return{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...extra}}
export async function rest(path,options={}){const c=supabaseConfig();return fetch(`${c.url}/rest/v1/${path}`,{...options,headers:sbHeaders(c.key,options.headers||{}),cache:"no-store"})}
export async function getProfileById(id){if(!id)return null;const r=await rest(`app_users?id=eq.${encodeURIComponent(id)}&select=*`);if(!r.ok)return null;return (await r.json())?.[0]||null}
export async function getProfileByAuthId(id){if(!id)return null;const r=await rest(`app_users?auth_user_id=eq.${encodeURIComponent(id)}&select=*`);if(!r.ok)return null;return (await r.json())?.[0]||null}
export function publicProfile(p){if(!p)return null;return{id:p.id,name:p.name,email:p.email,role:p.role,accessIds:p.access_ids||[],active:p.active!==false,sector:p.sector||""}}
