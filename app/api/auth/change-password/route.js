import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/session";
import {supabaseConfig} from "../../../../lib/supabase";

export async function POST(req){
  try{
    const session=await getSession();
    if(!session?.authUserId)return NextResponse.json({error:"Session invalide"},{status:401});
    const {password}=await req.json();
    if(!password||String(password).length<8)return NextResponse.json({error:"Le mot de passe doit contenir au moins 8 caractères."},{status:400});
    const c=supabaseConfig();
    const r=await fetch(`${c.url}/auth/v1/admin/users/${encodeURIComponent(session.authUserId)}`,{
      method:"PUT",
      headers:{apikey:c.key,Authorization:`Bearer ${c.key}`,"Content-Type":"application/json"},
      body:JSON.stringify({password:String(password)})
    });
    if(!r.ok)return NextResponse.json({error:"Impossible de modifier le mot de passe."},{status:400});
    return NextResponse.json({ok:true});
  }catch(e){
    return NextResponse.json({error:e.message||"Modification impossible"},{status:500});
  }
}
