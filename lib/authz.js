import {getSession,setSession} from "./session";
import {getProfileById,publicProfile} from "./supabase";
export async function requireUser(){const session=await getSession();if(!session)return{error:"unauthorized",status:401};const profile=await getProfileById(session.profileId);if(!profile||profile.active===false)return{error:"inactive",status:403};return{session,profile}}
export async function sessionView(){const a=await requireUser();if(a.error)return a;let adminMode=null;if(a.profile.role==="admin"&&a.session.adminModeDelegateId){const target=await getProfileById(a.session.adminModeDelegateId);if(target&&target.active!==false&&target.role==="delegate")adminMode=publicProfile(target)}return{...a,user:publicProfile(a.profile),adminMode}}
export async function effectiveDelegateId(){const a=await sessionView();if(a.error)return a;if(a.profile.role==="delegate")return{...a,delegateId:a.profile.id};if(a.adminMode)return{...a,delegateId:a.adminMode.id};return{...a,delegateId:null}}
export async function updateAdminMode(session,delegateId){await setSession({...session,adminModeDelegateId:delegateId||null})}
