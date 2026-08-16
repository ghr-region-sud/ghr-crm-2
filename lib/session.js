import crypto from "node:crypto";
import {cookies} from "next/headers";

export const SESSION_COOKIE="ghr_session";
const TTL=60*60*12;
function secret(){const s=process.env.SESSION_SECRET;if(!s)throw new Error("SESSION_SECRET manquant");return s}
function enc(v){return Buffer.from(v).toString("base64url")}
function dec(v){return Buffer.from(v,"base64url").toString("utf8")}
function signature(body){return crypto.createHmac("sha256",secret()).update(body).digest("base64url")}
export function createToken(payload){const body=enc(JSON.stringify({...payload,exp:Math.floor(Date.now()/1000)+TTL}));return `${body}.${signature(body)}`}
export function verifyToken(token){try{const [body,sig]=String(token||"").split(".");if(!body||!sig)return null;const a=Buffer.from(sig),b=Buffer.from(signature(body));if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;const p=JSON.parse(dec(body));if(!p.exp||p.exp<Math.floor(Date.now()/1000))return null;return p}catch{return null}}
export async function getSession(){const store=await cookies();return verifyToken(store.get(SESSION_COOKIE)?.value)}
export async function setSession(payload){const store=await cookies();store.set(SESSION_COOKIE,createToken(payload),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:TTL})}
export async function clearSession(){const store=await cookies();store.set(SESSION_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0})}

// Backward-compatible state scoping helper for repositories that still contain
// an older state handler. New V8 routes use lib/authz.js directly.
export function visibleState(state, session){
  if(!state || typeof state !== "object") return state;
  if(!session || session.role === "admin") return state;
  const delegateId = session.delegateId || session.userId || session.profileId || session.id;
  if(!delegateId) return state;
  return {
    ...state,
    members: (state.members || []).filter(m => m.id === delegateId),
    companies: (state.companies || []).filter(c => c.ownerId === delegateId),
    notes: (state.notes || []).filter(n => n.target === "all" || n.target === delegateId),
  };
}
