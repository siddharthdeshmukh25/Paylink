import { MongoClient } from 'mongodb'
import admin from 'firebase-admin'
let client

// Keep database failures quick and actionable. Without a selection timeout the
// MongoDB driver can wait longer than Netlify's 30-second function limit.
export async function db(){
  if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is not configured')
  if(!client){
    const pendingClient=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000,connectTimeoutMS:8000})
    try{await pendingClient.connect();client=pendingClient}
    catch(error){await pendingClient.close().catch(()=>{});throw new Error(`MongoDB connection failed: ${error.message}`)}
  }
  return client.db('nexforge_paypages')
}
export function json(status,body){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}})}
export async function userFrom(request){const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return null;if(!admin.apps.length){const privateKey=process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g,'\n');if(!privateKey||!process.env.FIREBASE_ADMIN_CLIENT_EMAIL)throw new Error('Firebase Admin credentials are not configured');admin.initializeApp({credential:admin.credential.cert({projectId:process.env.FIREBASE_ADMIN_PROJECT_ID,clientEmail:process.env.FIREBASE_ADMIN_CLIENT_EMAIL,privateKey})})}return admin.auth().verifyIdToken(token)}
export function slugify(value){return String(value||'page').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,42)||'page'}
