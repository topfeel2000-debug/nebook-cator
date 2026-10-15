import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {books,searchBooks,fields} from '../../../lib/catalog';

export const dynamic='force-dynamic';
type Row=Record<string,unknown>;
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
const str=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
async function admin(){const user=await getChatGPTUser();const configured=(env as unknown as Record<string,string>).ADMIN_USER_IDS||'';const allowed=configured.split(',').map(v=>v.trim()).filter(Boolean);if(import.meta.env.DEV)allowed.push('local_seedy');return user&&allowed.includes(user.userId)?user:null;}
async function body(req:Request){if(Number(req.headers.get('content-length')||0)>2900000)throw new Error('too_large');const raw=await req.text();if(raw.length>2900000)throw new Error('too_large');return JSON.parse(raw);}
function validImage(value:unknown){if(!value)return null;if(typeof value!=='string'||value.length>2800000)throw new Error('attachment');const m=value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);if(!m)throw new Error('attachment');let data:string;try{data=atob(m[2]);}catch{throw new Error('attachment');}if(data.length>2097152)throw new Error('attachment');const valid=m[1]==='png'?data.startsWith('\x89PNG\r\n\x1a\n'):m[1]==='jpeg'?data.startsWith('\xff\xd8\xff'):data.startsWith('RIFF')&&data.slice(8,12)==='WEBP';if(!valid)throw new Error('attachment');return value;}
function publicTicket(row:Row){const {token_hash,email,client_hash,note,assignee,...safe}=row;void token_hash;void email;void client_hash;void note;void assignee;return safe;}
async function run(req:Request){
 const path=new URL(req.url).pathname.replace('/api/','');const db=env.DB!;
 if(req.method!=='GET'&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'origin'},403);
 if(path==='catalog'&&req.method==='GET'){const p=new URL(req.url).searchParams;return json({results:searchBooks(Object.fromEntries(fields.map(f=>[f,p.get(f)||''])),p.get('available')!=='false'),sample:true,checkedAt:Date.now()});}
 if(path.startsWith('availability/')&&req.method==='GET'){const book=books.find(b=>b.id===path.split('/')[1]);return book?json({book,checkedAt:Date.now(),sample:true}):json({error:'not_found'},404);}
 if(path==='session'){return json({admin:!!(await admin()),local:import.meta.env.DEV});}
 if(!db)return json({error:'database_unavailable'},503);
 if(path==='tickets'&&req.method==='POST'){
   const b=await body(req);const type=str(b.type,40),subject=str(b.subject,160),message=str(b.message,4000),email=str(b.email,254);
   if(!['missing','routeIssue','facility','other'].includes(type)||!subject||!message||!/^\S+@\S+\.\S+$/.test(email))return json({error:'validation'},400);
   const now=Date.now(),clientHash=await hash(req.headers.get('cf-connecting-ip')||'local');
   const recent=await db.prepare('SELECT count(*) AS n FROM tickets WHERE client_hash=? AND created_at>?').bind(clientHash,now-900000).first<{n:number}>();if((recent?.n||0)>=10)return json({error:'rate_limit'},429);
   const id='Q-'+crypto.randomUUID().slice(0,8).toUpperCase(),token=crypto.randomUUID()+crypto.randomUUID();
   const book=books.find(book=>book.id===b.bookId);const context=JSON.stringify(book?{bookId:book.id,title:book.title,registration:book.registration,callNumber:book.callNumber,shelf:book.shelf,step:Math.max(0,Math.min(4,Number(b.step)||0)),sample:true}:{sample:true});
   const attachment=validImage(b.attachment);
   await db.batch([db.prepare('INSERT INTO tickets (id,token_hash,type,subject,message,email,context,attachment,status,assignee,response,note,created_at,updated_at,client_hash,version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)').bind(id,await hash(token),type,subject,message,email,context,attachment,'received','','','',now,now,clientHash),db.prepare('INSERT INTO ticket_events (id,ticket_id,status,response,actor,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),id,'received','','patron',now)]);
   return json({id,token},201);
 }
 if(path.startsWith('tickets/')&&req.method==='GET'){
   const id=path.split('/')[1],token=req.headers.get('X-Inquiry-Token')||'';
   const ticket=await db.prepare('SELECT * FROM tickets WHERE id=? AND token_hash=?').bind(id,await hash(token)).first<Row>();if(!ticket)return json({error:'not_found'},404);
   const events=await db.prepare('SELECT status,response,created_at FROM ticket_events WHERE ticket_id=? ORDER BY created_at ASC').bind(id).all();return json({ticket:publicTicket(ticket),events:events.results});
 }
 if(path.startsWith('admin/')){
   const user=await admin();if(!user)return json({error:'unauthorized'},403);
   if(path==='admin/tickets'&&req.method==='GET'){const rows=await db.prepare('SELECT id,type,subject,status,assignee,created_at,updated_at,context FROM tickets ORDER BY updated_at DESC LIMIT 500').all();return json(rows.results);}
   const id=path.split('/')[2];
   if(req.method==='GET'){const row=await db.prepare('SELECT * FROM tickets WHERE id=?').bind(id).first<Row>();if(!row)return json({error:'not_found'},404);const {token_hash,client_hash,...ticket}=row;void token_hash;void client_hash;const events=await db.prepare('SELECT status,response,actor,created_at FROM ticket_events WHERE ticket_id=? ORDER BY created_at ASC').bind(id).all();return json({ticket,events:events.results});}
   if(req.method==='PATCH'){
    const b=await body(req),status=str(b.status,20),response=str(b.response,4000),note=str(b.note,4000),assignee=str(b.assignee,100),version=Number(b.version);
    if(!['received','processing','answered','closed'].includes(status)||((status==='answered'||status==='closed')&&!response)||!Number.isInteger(version))return json({error:'validation'},400);
    const now=Date.now();const result=await db.batch([
     db.prepare('UPDATE tickets SET status=?,response=?,note=?,assignee=?,updated_at=?,version=version+1 WHERE id=? AND version=?').bind(status,response,note,assignee,now,id,version),
     db.prepare('INSERT INTO ticket_events (id,ticket_id,status,response,actor,created_at) SELECT ?,id,?,?,?,? FROM tickets WHERE id=? AND updated_at=? AND version=?').bind(crypto.randomUUID(),status,response,user.userId,now,id,now,version+1)
    ]);if(result[0].meta.changes!==1)return json({error:'conflict'},409);return json({ok:true});
   }
 }
 return json({error:'not_found'},404);
}
async function handle(req:Request){try{return await run(req);}catch(e){const reason=e instanceof Error?e.message:'';if(['attachment','too_large'].includes(reason))return json({error:reason},400);if(e instanceof SyntaxError)return json({error:'validation'},400);console.error('API request failed',e instanceof Error?e.name:'unknown');return json({error:'server'},500);}}
export const GET=handle;export const POST=handle;export const PATCH=handle;
