import { db, json, userFrom } from './_shared.js'

export default async request => {
  try {
    const user = await userFrom(request)
    if (!user) return json(401, { error: 'Please sign in.' })
    const profiles = (await db()).collection('profiles')
    if (request.method === 'GET') {
      const profile = await profiles.findOne({ uid: user.uid }, { projection: { _id: 0 } })
      return json(200, { profile: profile || { uid: user.uid, email: user.email, fullName: user.name || '', photoURL: user.picture || '' } })
    }
    if (request.method !== 'POST') return json(405, { error: 'Method not allowed' })
    const input = await request.json()
    const profile = { uid: user.uid, email: user.email, fullName: String(input.fullName || '').trim().slice(0, 80), photoURL: String(input.photoURL || '').trim().slice(0, 2000), updatedAt: new Date() }
    await profiles.updateOne({ uid: user.uid }, { $set: profile, $setOnInsert: { createdAt: new Date() } }, { upsert: true })
    return json(200, { profile })
  } catch (error) { return json(500, { error: error.message || 'Could not update profile' }) }
}
