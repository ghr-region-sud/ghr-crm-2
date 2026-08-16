import {NextResponse} from "next/server";
import {requireUser} from "../../../../lib/authz";
import {supabaseConfig,rest,publicProfile,getProfileById} from "../../../../lib/supabase";

async function admin(){
  const a=await requireUser();
  if(a.error)return a;
  if(a.profile.role!=="admin")return{error:"forbidden",status:403};
  return a;
}

function authHeaders(){
  const c=supabaseConfig();
  return {c,headers:{apikey:c.key,Authorization:`Bearer ${c.key}`,"Content-Type":"application/json"}};
}

async function listAuthUsers(){
  const {c,headers}=authHeaders();
  const r=await fetch(`${c.url}/auth/v1/admin/users?page=1&per_page=1000`,{headers,cache:"no-store"});
  if(!r.ok)throw new Error(await r.text());
  const data=await r.json();
  return Array.isArray(data)?data:(data?.users||[]);
}

async function findAuthUserByEmail(email){
  const target=String(email||"").trim().toLowerCase();
  const users=await listAuthUsers();
  return users.find(u=>String(u?.email||"").trim().toLowerCase()===target)||null;
}

async function createAuthUser({name,email,password}){
  const {c,headers}=authHeaders();
  const r=await fetch(`${c.url}/auth/v1/admin/users`,{
    method:"POST",headers,
    body:JSON.stringify({email,password,email_confirm:true,user_metadata:{name}})
  });
  if(r.ok)return await r.json();

  // Une ancienne tentative peut avoir déjà créé l'identité Auth sans profil app_users.
  // Dans ce cas on rattache automatiquement l'identité existante au lieu d'échouer.
  const raw=await r.text();
  if(r.status===422||raw.includes("email_exists")){
    const existing=await findAuthUserByEmail(email);
    if(existing)return existing;
  }
  throw new Error(raw||"Création du compte impossible");
}

async function updateAuthUser(authUserId,{name,email,password}){
  const {c,headers}=authHeaders();
  const body={user_metadata:{name}};
  if(email)body.email=email;
  if(password)body.password=password;
  const r=await fetch(`${c.url}/auth/v1/admin/users/${encodeURIComponent(authUserId)}`,{
    method:"PUT",headers,body:JSON.stringify(body)
  });
  if(!r.ok)throw new Error(await r.text());
  return await r.json();
}

async function profileByEmail(email){
  const r=await rest(`app_users?email=eq.${encodeURIComponent(email)}&select=*`);
  if(!r.ok)throw new Error(await r.text());
  return (await r.json())?.[0]||null;
}

async function saveDelegateProfile({profile,memberId,authUser,name,email,sector,active}){
  const targetId=memberId||profile?.id||authUser.id;

  // Si un profil existe déjà pour cet email, on le met à jour et, pour un ancien
  // délégué, on aligne son id sur l'id métier afin de conserver toutes ses entreprises.
  if(profile){
    const r=await rest(`app_users?id=eq.${encodeURIComponent(profile.id)}`,{
      method:"PATCH",headers:{Prefer:"return=representation"},
      body:JSON.stringify({
        ...(profile.id!==targetId?{id:targetId}:{}),
        auth_user_id:authUser.id,
        name,email,role:"delegate",active,sector
      })
    });
    if(!r.ok)throw new Error(await r.text());
    return (await r.json())[0];
  }

  const r=await rest("app_users",{
    method:"POST",headers:{Prefer:"return=representation"},
    body:JSON.stringify({
      id:targetId,
      auth_user_id:authUser.id,
      name,email,role:"delegate",access_ids:[],active,sector
    })
  });
  if(!r.ok)throw new Error(await r.text());
  return (await r.json())[0];
}

export async function GET(){
  const a=await admin();
  if(a.error)return NextResponse.json({error:"Non autorisé"},{status:a.status});
  const r=await rest("app_users?role=eq.delegate&select=*&order=name.asc");
  if(!r.ok)return NextResponse.json({error:await r.text()},{status:500});
  return NextResponse.json({users:(await r.json()).map(publicProfile)});
}

export async function POST(req){
  try{
    const a=await admin();
    if(a.error)return NextResponse.json({error:"Non autorisé"},{status:a.status});
    const {name,email,password,sector="",active=true,memberId}=await req.json();
    const cleanEmail=String(email||"").trim().toLowerCase();
    if(!name||!cleanEmail)return NextResponse.json({error:"Nom et email requis"},{status:400});

    let profile=await profileByEmail(cleanEmail);
    let authUser=profile?null:await findAuthUserByEmail(cleanEmail);

    if(profile){
      // Le profil métier existe déjà : on retrouve son identité Auth et on réactive/actualise.
      const users=await listAuthUsers();
      authUser=users.find(u=>u.id===profile.auth_user_id)||users.find(u=>String(u.email||"").toLowerCase()===cleanEmail)||null;
    }

    if(!authUser){
      if(!password)return NextResponse.json({error:"Mot de passe temporaire requis pour un nouveau compte"},{status:400});
      authUser=await createAuthUser({name,email:cleanEmail,password});
    }else if(password){
      // Si l'admin fournit un mot de passe temporaire, il devient le nouveau mot de passe du compte existant.
      authUser=await updateAuthUser(authUser.id,{name,email:cleanEmail,password});
    }else{
      authUser=await updateAuthUser(authUser.id,{name,email:cleanEmail});
    }

    const saved=await saveDelegateProfile({profile,memberId,authUser,name,email:cleanEmail,sector,active:active!==false});
    return NextResponse.json({user:publicProfile(saved),linkedExistingAuth:!!profile||!!authUser});
  }catch(e){
    return NextResponse.json({error:e?.message||"Activation impossible"},{status:500});
  }
}

export async function PATCH(req){
  try{
    const a=await admin();
    if(a.error)return NextResponse.json({error:"Non autorisé"},{status:a.status});
    const {id,name,email,sector,active,password}=await req.json();
    const current=await getProfileById(id);
    if(!current||current.role!=="delegate")return NextResponse.json({error:"Utilisateur introuvable"},{status:404});
    const patch={};
    if(name!==undefined)patch.name=name;
    if(email!==undefined)patch.email=String(email).trim().toLowerCase();
    if(sector!==undefined)patch.sector=sector;
    if(active!==undefined)patch.active=!!active;
    const r=await rest(`app_users?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(patch)});
    if(!r.ok)return NextResponse.json({error:await r.text()},{status:500});
    if(password||email||name){
      await updateAuthUser(current.auth_user_id,{name:name??current.name,email:email?String(email).trim().toLowerCase():undefined,password});
    }
    return NextResponse.json({user:publicProfile((await r.json())[0])});
  }catch(e){
    return NextResponse.json({error:e?.message||"Modification impossible"},{status:500});
  }
}
