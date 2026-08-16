import {NextResponse} from "next/server";
import {requireUser} from "../../../../lib/authz";
import {getGoogleConnection} from "../../../../lib/google-calendar";
export const dynamic="force-dynamic";
export async function GET(){try{const a=await requireUser();if(a.error)return NextResponse.json({connected:false},{status:a.status});const c=await getGoogleConnection(a.profile.id);return NextResponse.json({connected:!!c?.refresh_token,email:c?.google_email||""},{headers:{"Cache-Control":"no-store"}})}catch(e){return NextResponse.json({connected:false,error:e.message},{status:500})}}
