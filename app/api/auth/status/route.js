import {NextResponse} from "next/server";import {rest} from "../../../../lib/supabase";
export const dynamic="force-dynamic";
export async function GET(){try{const r=await rest("app_users?select=id&limit=1");if(!r.ok)throw new Error(await r.text());const rows=await r.json();return NextResponse.json({initialized:rows.length>0})}catch{return NextResponse.json({initialized:false,configured:false})}}
