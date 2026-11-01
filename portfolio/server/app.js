import express from 'express';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';
import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = express();
app.disable('x-powered-by');
app.use(express.json({limit:'64kb'}));
const dirname = path.dirname(fileURLToPath(import.meta.url));
// Local development works out of the box. For production use Supabase or an
// explicitly configured persistent, private filesystem volume.
const storageFile = process.env.CONTACT_STORAGE_FILE || path.join(dirname, 'data', 'contact-messages.jsonl');
const attempts = new Map();
app.post('/api/contact', async (req,res) => {
 const now=Date.now(), ip=req.ip, recent=(attempts.get(ip)||[]).filter(t=>now-t<15*60*1000);
 if(recent.length>=10) return res.status(429).json({error:'Too many messages. Please wait a little and try again.'});
 recent.push(now);attempts.set(ip,recent);
 if(attempts.size>10000) for(const [key,times] of attempts) if(times.every(t=>now-t>=15*60*1000)) attempts.delete(key);
 const {name,email,message,website} = req.body || {};
 if (website) return res.status(400).json({error:'Unable to submit your message.'});
 if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) return res.status(400).json({error:'Please provide a valid name, email, and message (at least 10 characters).'});
 const record={name:name.trim(),email:email.trim(),message:message.trim()};
 try {
  if(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY){
   const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false},realtime:{transport:WebSocket}});
   const {error}=await db.from('contact_messages').insert(record);
   if(error) throw error;
  } else if(process.env.SUPABASE_URL || process.env.SUPABASE_SERVICE_ROLE_KEY){
   return res.status(503).json({error:'Contact storage is partially configured. Please try again later.'});
  } else if(process.env.NODE_ENV === 'production' && !process.env.CONTACT_STORAGE_FILE){
   return res.status(503).json({error:'Contact storage is not configured for production. Please try again later.'});
  } else {
   await mkdir(path.dirname(storageFile),{recursive:true,mode:0o700});
   await appendFile(storageFile,JSON.stringify({...record,created_at:new Date().toISOString()})+'\n',{encoding:'utf8',mode:0o600});
  }
  // Storage and notification are separate: never report email as sent if SMTP failed.
  let notification='not_configured';
  if(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD){
   try {
    const transport=nodemailer.createTransport({
     host:process.env.SMTP_HOST || 'smtp.gmail.com',
     port:Number(process.env.SMTP_PORT || 465),
     secure:process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
     auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD},
     connectionTimeout:10000, greetingTimeout:10000, socketTimeout:15000
    });
    await transport.sendMail({
     from:process.env.GMAIL_USER,
     to:process.env.CONTACT_RECIPIENT || 'divyu931@gmail.com',
     replyTo:record.email,
     subject:'New portfolio enquiry',
     text:`New enquiry from your portfolio\n\nName: ${record.name}\nEmail: ${record.email}\n\nMessage:\n${record.message}\n\nReply to this email to respond directly.`
    });
    notification='sent';
   } catch(err) { console.error('Email notification failed:',err.message); notification='failed'; }
  }
  return res.status(201).json({ok:true,notification});
 } catch(err) { console.error('Contact storage failed:',err.message); return res.status(502).json({error:'Your message could not be delivered. Please try again later.'}); }
});
// Portfolio content is public, but only the configured Supabase Auth user can edit it.
function settingsDb(){
 if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
 try{return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false},realtime:{transport:WebSocket}})}catch(e){console.error('Invalid portfolio configuration:',e.message);return null}
}
const validText=(v,max,required=true)=>typeof v==='string' && v.length<=max && (!required || v.trim().length>0);
const validUrl=(v,required=false)=>{
 if(!validText(v,600,required)) return false;
 if(!v.trim()) return !required;
 try { const u=new URL(v);return u.protocol==='https:' && !u.username && !u.password; } catch{return false;}
};
const validImage=v=>validText(v,600) && ((v.startsWith('/') && !v.startsWith('//')) || validUrl(v,true));
function validateSettings(s){
 if(!s || typeof s!=='object' || Array.isArray(s))return null;
 const fields=[['firstName',80],['lastName',80],['headline1',100],['headline2',100],['headlineEm',100],['aboutLead',400],['aboutBody',1800],['education',1200],['roles',1000],['skills',3000],['achievements',3000]];
 if(fields.some(([k,max])=>!validText(s[k],max)) || !validImage(s.portrait) || !validImage(s.heroImage))return null;
 const p=s.profile;
 if(!p || !validText(p.email,254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || !/^\d{8,15}$/.test(p.whatsapp) || !validUrl(p.linkedin) || !validUrl(p.github) || !validUrl(p.resume))return null;
 if(!Array.isArray(s.projects)||s.projects.length>12)return null;
 const sectionNames=['about','skills','projects','achievements','beyond'];if(!s.sections || sectionNames.some(k=>typeof s.sections[k]!=='boolean'))return null;
 if(s.projects.some(p=>!p || !validText(p.name,100) || !validText(p.category,100) || !validText(p.tags,250,false) || !validText(p.award,150,false) || !['trust','bright','weather'].includes(p.type) || !validText(p.description,600) || !validText(p.detail,1500) || !validUrl(p.live,true) || !validUrl(p.repo) || !validImage(p.image)))return null;
 const clean={}; for(const [k] of fields)clean[k]=s[k].trim();
 clean.portrait=s.portrait.trim();clean.heroImage=s.heroImage.trim();clean.sections=Object.fromEntries(sectionNames.map(k=>[k,s.sections[k]]));
 clean.profile={email:p.email.trim(),whatsapp:p.whatsapp,linkedin:p.linkedin.trim(),github:p.github.trim(),resume:p.resume.trim()};
 clean.projects=s.projects.map(p=>({name:p.name.trim(),category:p.category.trim(),description:p.description.trim(),detail:p.detail.trim(),live:p.live.trim(),repo:p.repo.trim(),image:p.image.trim(),tags:p.tags.trim(),award:p.award.trim(),type:p.type}));
 return clean;
}
app.get('/api/portfolio',async(req,res)=>{
 const db=settingsDb();if(!db){res.set('Cache-Control','no-store');return res.json({content:null})}
 try {const {data,error}=await db.from('portfolio_settings').select('content').eq('id','main').maybeSingle();if(error)throw error;res.set('Cache-Control','no-store');return res.json({content:data?.content||null});}
 catch(e){console.error('Portfolio read failed:',e.message);return res.status(502).json({error:'Could not load portfolio settings.'});}
});
app.post('/api/portfolio',async(req,res)=>{
 const db=settingsDb();if(!db || !process.env.ADMIN_USER_ID)return res.status(503).json({error:'Admin access is not configured.'});
 const match=/^Bearer (\S+)$/.exec(req.get('Authorization')||'');if(!match)return res.status(401).json({error:'Please sign in first.'});
 try {const {data,error}=await db.auth.getUser(match[1]);if(error||!data?.user)return res.status(401).json({error:'Your session is invalid or expired.'});if(data.user.id!==process.env.ADMIN_USER_ID)return res.status(403).json({error:'This account is not authorized to edit the portfolio.'});return res.json({ok:true});}
 catch(e){console.error('Admin verification failed:',e.message);return res.status(502).json({error:'Could not verify your account.'});}
});
app.put('/api/portfolio',async(req,res)=>{
 const db=settingsDb();if(!db || !process.env.ADMIN_USER_ID)return res.status(503).json({error:'Admin access is not configured.'});
 const match=/^Bearer (\S+)$/.exec(req.get('Authorization')||'');if(!match)return res.status(401).json({error:'Please sign in first.'});
 try {
  const {data,error}=await db.auth.getUser(match[1]);
  if(error || !data?.user)return res.status(401).json({error:'Your session is invalid or expired. Please sign in again.'});
  if(data.user.id!==process.env.ADMIN_USER_ID)return res.status(403).json({error:'This account is not authorized to edit the portfolio.'});
  const clean=validateSettings(req.body?.content);if(!clean)return res.status(400).json({error:'Please check all required fields, email, WhatsApp number, and HTTPS links.'});
  const result=await db.from('portfolio_settings').upsert({id:'main',content:clean,updated_at:new Date().toISOString()},{onConflict:'id'});
  if(result.error)throw result.error;
  return res.json({ok:true,content:clean});
 } catch(e){console.error('Portfolio save failed:',e.message);return res.status(502).json({error:'Could not save your changes. Please try again.'});}
});
// Creates a short-lived upload token only after server-side owner verification.
app.post('/api/portfolio-media',async(req,res)=>{
 const db=settingsDb();if(!db || !process.env.ADMIN_USER_ID)return res.status(503).json({error:'Admin access is not configured.'});
 const match=/^Bearer (\S+)$/.exec(req.get('Authorization')||'');if(!match)return res.status(401).json({error:'Please sign in first.'});
 try {
  const {data,error}=await db.auth.getUser(match[1]);if(error||!data?.user)return res.status(401).json({error:'Session expired. Please sign in again.'});
  if(data.user.id!==process.env.ADMIN_USER_ID)return res.status(403).json({error:'Not authorized.'});
  const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};const {type,size}=req.body||{};
  if(!types[type] || !Number.isInteger(size) || size<1 || size>3*1024*1024)return res.status(400).json({error:'Choose a JPG, PNG or WebP image under 3 MB.'});
  const path=`images/${randomUUID()}.${types[type]}`;
  const {data:signed,error:signError}=await db.storage.from('portfolio-media').createSignedUploadUrl(path);
  if(signError)throw signError;
  const {data:publicData}=db.storage.from('portfolio-media').getPublicUrl(path);
  return res.json({path,token:signed.token,publicUrl:publicData.publicUrl});
 }catch(e){console.error('Image upload authorization failed:',e.message);return res.status(502).json({error:'Could not prepare upload. Check the Storage bucket setup.'});}
});
export default app;
