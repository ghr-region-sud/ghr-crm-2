import {NextResponse} from "next/server";
import {effectiveDelegateId} from "../../../../lib/authz";
import {deleteGoogleConnection} from "../../../../lib/google-calendar";
export const dynamic="force-dynamic";
export async function GET(req){try{const a=await effectiveDelegateId();if(!a.error){const profileId=a.delegateId||a.profile.id;await deleteGoogleConnection(profileId)}return NextResponse.redirect(new URL("/?google=disconnected",req.url))}catch{return NextResponse.redirect(new URL("/?google=disconnect_error",req.url))}}
