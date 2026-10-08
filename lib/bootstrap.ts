import {env} from 'cloudflare:workers';
import {database} from './clinic';
export async function ensureSysadmin(){const db=database();if(await db.prepare("SELECT key FROM settings WHERE key='sysadmin-initialized'").first())return;const config=env as unknown as Record<string,string|undefined>;const hash=config.SYSADMIN_INITIAL_HASH,salt=config.SYSADMIN_INITIAL_SALT,email=config.SYSADMIN_ACCOUNT_EMAIL;if(!hash||!salt||!email)throw new Error('System administrator initialization is not configured.');const conflict=await db.prepare("SELECT email FROM staff WHERE username='sysadmin' AND email!=?").bind(email).first();if(conflict)throw new Error('System administrator username conflicts with an existing account.');const now=new Date().toISOString();await db.batch([
db.prepare("INSERT INTO staff(email,name,role,status,department,username,password_hash,password_salt,must_change) SELECT ?,'System Administrator','Admin','Active','','sysadmin',?,?,1 WHERE NOT EXISTS(SELECT 1 FROM staff WHERE email=?) AND NOT EXISTS(SELECT 1 FROM settings WHERE key='sysadmin-initialized')").bind(email,hash,salt,email),
db.prepare("UPDATE staff SET role='Admin',status='Active',username='sysadmin',password_hash=?,password_salt=?,must_change=1 WHERE email=? AND NOT EXISTS(SELECT 1 FROM settings WHERE key='sysadmin-initialized')").bind(hash,salt,email),
db.prepare("DELETE FROM sessions WHERE email=? AND NOT EXISTS(SELECT 1 FROM settings WHERE key='sysadmin-initialized')").bind(email),
db.prepare("INSERT INTO audit(actor,action,record_id,at) SELECT 'system','Initialized built-in sysadmin login',?,? WHERE NOT EXISTS(SELECT 1 FROM settings WHERE key='sysadmin-initialized')").bind(email,now),
db.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('sysadmin-initialized',?)").bind(now)
]);}
