import { auth } from './firebase'

async function request(path, options = {}) {
  const token = auth.currentUser && await auth.currentUser.getIdToken()
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export const api = {
  me: () => request('pages'),
  save: page => request('pages', { method: 'POST', body: JSON.stringify(page) }),
  upload: body => request('upload', { method: 'POST', body: JSON.stringify(body) }),
  page: slug => request(`public-page?slug=${encodeURIComponent(slug)}`),
  analytics: () => request('analytics'),
  event: event => request('analytics', { method: 'POST', body: JSON.stringify(event) }),
  profile: () => request('profile'),
  saveProfile: profile => request('profile', { method: 'POST', body: JSON.stringify(profile) })
}
