import {NextResponse} from "next/server";
import {effectiveDelegateId} from "../../../../lib/authz";
import {getGoogleConnection} from "../../../../lib/google-calendar";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const a=await effectiveDelegateId();
  if(a.error)return NextResponse.json({connected:false},{status:a.status});
  const profileId=a.delegateId||a.profile.id;
  const c=await getGoogleConnection(profileId);
  return NextResponse.json({connected:!!c?.refresh_token,email:c?.google_email||"",profileId},{headers:{"Cache-Control":"no-store"}})
 }catch(e){return NextResponse.json({connected:false,error:e.message},{status:500})}
}
