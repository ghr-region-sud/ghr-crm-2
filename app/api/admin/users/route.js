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

async function profileByAuthId(authUserId){
  if(!authUserId)return null;
  const r=await rest(`app_users?auth_user_id=eq.${encodeURIComponent(authUserId)}&select=*`);
  if(!r.ok)throw new Error(await r.text());
  return (await r.json())?.[0]||null;
}

async function patchProfile(id,patch){
  const r=await rest(`app_users?id=eq.${encodeURIComponent(id)}`,{
    method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(patch)
  });
  if(!r.ok)throw new Error(await r.text());
  return (await r.json())?.[0]||null;
}

async function repairHijackedAdminId(memberId){
  if(!memberId)return null;
  const row=await getProfileById(memberId);
  if(!row||row.role!=="admin")return row;

  // Une ancienne version pouvait déplacer le profil admin sur l'id métier d'un délégué.
  // Le bootstrap crée toujours l'admin avec id === auth_user_id : on restaure donc cet id.
  if(!row.auth_user_id||row.auth_user_id===memberId){
    throw new Error("Cet identifiant est déjà utilisé par un compte administrateur. Aucune modification n’a été effectuée.");
  }
  const canonical=await getProfileById(row.auth_user_id);
  if(canonical&&canonical.id!==row.id){
    throw new Error("Le compte administrateur nécessite une vérification avant ce rattachement.");
  }
  await patchProfile(row.id,{id:row.auth_user_id});
  return null;
}

async function assertAuthIdentityAvailable(authUserId,targetId){
  const linked=await profileByAuthId(authUserId);
  if(!linked)return null;
  if(linked.id===targetId)return linked;
  if(linked.role==="admin"){
    throw new Error("Cette adresse email appartient au compte administrateur et ne peut pas être attribuée à un délégué.");
  }
  throw new Error(`Cette adresse email est déjà associée au délégué « ${linked.name||"existant"} ».`);
}

async function saveDelegateProfile({targetProfile,memberId,authUser,name,email,sector,active}){
  const targetId=memberId||targetProfile?.id||authUser.id;
  if(targetProfile){
    return await patchProfile(targetProfile.id,{
      auth_user_id:authUser.id,
      name,email,role:"delegate",active,sector
    });
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
    const cleanMemberId=String(memberId||"").trim();
    if(!name||!cleanEmail)return NextResponse.json({error:"Nom et email requis"},{status:400});

    // 1) Pour un ancien délégué, son id métier est prioritaire. On répare au passage
    //    l'ancien bug qui pouvait avoir déplacé le profil admin sur cet id.
    if(cleanMemberId)await repairHijackedAdminId(cleanMemberId);
    let targetProfile=cleanMemberId?await getProfileById(cleanMemberId):null;

    // 2) L'identité Supabase Auth peut déjà exister : on la rattache, on ne la recrée pas.
    let authUser=await findAuthUserByEmail(cleanEmail);
    if(!authUser){
      if(!password)return NextResponse.json({error:"Mot de passe temporaire requis pour un nouveau compte"},{status:400});
      authUser=await createAuthUser({name,email:cleanEmail,password});
    }

    // 3) Une même identité Auth ne peut jamais appartenir à deux profils métier.
    const alreadyLinked=await assertAuthIdentityAvailable(authUser.id,cleanMemberId||targetProfile?.id||authUser.id);
    if(!targetProfile&&alreadyLinked?.role==="delegate")targetProfile=alreadyLinked;

    // Si aucun memberId n'est fourni, un profil déjà connu par email peut être réutilisé.
    if(!targetProfile&&!cleanMemberId){
      const byEmail=await profileByEmail(cleanEmail);
      if(byEmail){
        if(byEmail.role==="admin")throw new Error("Cette adresse email appartient au compte administrateur.");
        targetProfile=byEmail;
      }
    }

    // 4) Un mot de passe saisi sur un compte Auth déjà existant devient son nouveau mot de passe.
    authUser=await updateAuthUser(authUser.id,{name,email:cleanEmail,password:password||undefined});

    const saved=await saveDelegateProfile({
      targetProfile,memberId:cleanMemberId||undefined,authUser,name,email:cleanEmail,sector,active:active!==false
    });
    return NextResponse.json({user:publicProfile(saved),linkedExistingAuth:true});
  }catch(e){
    const msg=e?.message||"Activation impossible";
    const status=/administrateur|déjà associée|vérification/.test(msg)?409:500;
    return NextResponse.json({error:msg},{status});
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
