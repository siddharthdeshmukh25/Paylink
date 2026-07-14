import { db,json,userFrom,slugify } from './_shared.js'

export default async request=>{
  try{
    const user=await userFrom(request)
    if(!user)return json(401,{error:'Please sign in.'})
    const pages=(await db()).collection('pages')
    if(request.method==='GET')return json(200,{pages:await pages.find({uid:user.uid}).sort({updatedAt:-1}).toArray()})
    if(request.method!=='POST')return json(405,{error:'Method not allowed'})
    const input=await request.json(),isDraft=Boolean(input.draft)
    if(!isDraft&&(!input.username||!input.upiId||!input.courseName||!input.amount))return json(400,{error:'Name, UPI ID, course name and amount are required before publishing.'})
    if(!isDraft&&!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/.test(String(input.upiId).trim()))return json(400,{error:'Enter a valid UPI ID, for example name@bank.'})
    const existing=input.pageId?await pages.findOne({uid:user.uid,pageId:input.pageId}):(input.newPage?null:await pages.findOne({uid:user.uid,pageId:{$exists:false}}))
    const username=input.username??existing?.username??'',courseName=input.courseName??existing?.courseName??'',amount=input.amount??existing?.amount??''
    const pageId=existing?.pageId||crypto.randomUUID()
    let slug=existing?.published?existing.slug:slugify(courseName||'payment-page')
    const slugOwner=await pages.findOne({slug,pageId:{$ne:pageId}})
    if(slugOwner)slug=`${slug}-${pageId.slice(0,5)}`
    const page={uid:user.uid,pageId,username,email:user.email,phone:input.phone??existing?.phone??'',gender:input.gender??existing?.gender??'',upiId:input.upiId??existing?.upiId??'',courseName,amount:Number(amount)||0,paymentNote:input.paymentNote??existing?.paymentNote??'After payment, please send a screenshot.',logo:input.logo??existing?.logo??'',banner:input.banner??existing?.banner??'',themeColor:input.themeColor??existing?.themeColor??'#316bff',seoTitle:`${courseName||'Payment page'} | Pay online`,seoDescription:courseName&&username?`Make a secure UPI payment for ${courseName} by ${username}.`:'Secure UPI payment page.',keywords:[courseName,username,'UPI payment','online payment'].filter(Boolean).join(', '),socialLinks:input.socialLinks??existing?.socialLinks??{},slug,published:isDraft?(existing?.published||false):true,updatedAt:new Date()}
    const result=await pages.findOneAndUpdate({uid:user.uid,pageId},{'$set':page,'$setOnInsert':{createdAt:new Date(),views:0,qrScans:0,payClicks:0,shares:0}},{upsert:true,returnDocument:'after'})
    return json(200,{page:result})
  }catch(error){console.error(error);return json(500,{error:error.message||'Could not save page'})}
}
