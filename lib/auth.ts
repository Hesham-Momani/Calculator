import { database } from './clinic';
import {getPasswordPolicy} from './password-policy';
export const COOKIE='__Host-clinic-session';
const encoder=new TextEncoder();
const hex=(v:ArrayBuffer|Uint8Array)=>Array.from(new Uint8Array(v instanceof Uint8Array?v.buffer:v)).map(x=>x.toString(16).padStart(2,'0')).join('');
export const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export async function digest(s:string){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256));}
export async function strong(password:unknown){const policy=await getPasswordPolicy();return typeof password==='string'&&password.length>=policy.minLength&&password.length<=128;}
export function validUsername(v:unknown){return typeof v==='string'&&/^[a-zA-Z][a-zA-Z0-9._-]{2,39}$/.test(v);}
export async function verify(password:string,hash:string,salt:string){const actual=await passwordHash(password,salt);let diff=actual.length^hash.length;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^(hash.charCodeAt(i)||0);return diff===0;}
export function token(req:Request){return req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
export async function currentStaff(req:Request){const t=token(req);if(!/^[a-f0-9]{64}$/.test(t))return null;const a=await database().prepare("SELECT s.email,s.name,s.role,s.status,s.department,s.last_login,s.username,s.must_change FROM sessions se JOIN staff s ON s.email=se.email WHERE se.token_hash=? AND se.expires_at>? AND s.status='Active'").bind(await digest(t),Date.now()).first<any>();if(a&&!(await getPasswordPolicy()).requireChange)a.must_change=0;return a;}
export function publicStaff(a:any){if(!a)return null;return {email:a.email,name:a.name,role:a.role,status:a.status,department:a.department,username:a.username,last_login:a.last_login,must_change:a.must_change};}
export async function newSession(email:string){const raw=random();const now=Date.now();await database().batch([database().prepare('DELETE FROM sessions WHERE expires_at<?').bind(now),database().prepare('INSERT INTO sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await digest(raw),email,now+8*60*60*1000)]);return `${COOKIE}=${raw}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
