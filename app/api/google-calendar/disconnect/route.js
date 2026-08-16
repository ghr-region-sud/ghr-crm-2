import {NextResponse} from "next/server";
import {requireUser} from "../../../../lib/authz";
import {deleteGoogleConnection} from "../../../../lib/google-calendar";
export const dynamic="force-dynamic";
export async function GET(req){try{const a=await requireUser();if(!a.error)await deleteGoogleConnection(a.profile.id);return NextResponse.redirect(new URL("/?google=disconnected",req.url))}catch{return NextResponse.redirect(new URL("/?google=disconnect_error",req.url))}}
