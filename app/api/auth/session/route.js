import {NextResponse} from "next/server";import {sessionView} from "../../../../lib/authz";
export const dynamic="force-dynamic";
export async function GET(){const a=await sessionView();if(a.error)return NextResponse.json({user:null},{status:a.status});return NextResponse.json({user:a.user,adminMode:a.adminMode})}
