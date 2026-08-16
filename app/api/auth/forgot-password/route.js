import {NextResponse} from "next/server";
import {supabaseConfig} from "../../../../lib/supabase";

export async function POST(req){
  try{
    const {email}=await req.json();
    if(!email)return NextResponse.json({error:"Adresse email requise"},{status:400});
    const c=supabaseConfig();
    const site=(process.env.NEXT_PUBLIC_APP_URL||"https://crm-app-ghr-region-sud.vercel.app").replace(/\/$/,"");
    const r=await fetch(`${c.url}/auth/v1/recover?redirect_to=${encodeURIComponent(`${site}/auth/reset-password`)}`,{
      method:"POST",headers:{apikey:c.key,"Content-Type":"application/json"},body:JSON.stringify({email})
    });
    if(!r.ok){const j=await r.json().catch(()=>({}));console.error("Password recovery error",j);}
    return NextResponse.json({message:"Si un compte correspond à cette adresse, un email de réinitialisation vient d’être envoyé."});
  }catch(e){return NextResponse.json({error:"Impossible d’envoyer l’email pour le moment"},{status:500})}
}
