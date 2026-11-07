import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, isDemo } from './supabase.js'
import { useAuth } from './auth.jsx'
import { team as sampleTeam } from '../data/sample.js'

const DEFAULT_ROLES = ['Director', 'Writer', 'Prompt Engineer', 'Editor', 'Sound', 'Budget Manager']

const demoPeople = sampleTeam.map((p) => ({
  id: p.id,
  name: p.name,
  photo_url: null,
  roles: p.roles,
  skills: p.skills,
  email: p.contact,
  phone: '',
  other_contact: '',
  notify_checklist: true,
  notify_budget: true,
  email_mode: 'daily',
}))

const TeamContext = createContext(null)

export function TeamProvider({ children }) {
  const { userId, signedIn } = useAuth()
  const [people, setPeople] = useState(isDemo ? demoPeople : [])
  const [roles, setRoles] = useState(isDemo ? DEFAULT_ROLES : [])
  const [loading, setLoading] = useState(!isDemo)

  const load = useCallback(async () => {
    const [p, r] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('roles').select('name').order('id'),
    ])
    if (p.data) setPeople(p.data)
    if (r.data) setRoles(r.data.map((x) => x.name))
    setLoading(false)
  }, [])

  // Load once signed in, then reload whenever anyone changes a profile or role.
  useEffect(() => {
    if (isDemo || !signedIn) return
    load()
    const channel = supabase
      .channel('team')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [signedIn, load])

  const me = people.find((p) => p.id === userId) || null

  async function updateMe(changes) {
    setPeople((list) => list.map((p) => (p.id === userId ? { ...p, ...changes } : p)))
    if (isDemo) return null
    const { error } = await supabase.from('profiles').update(changes).eq('id', userId)
    if (error) load()
    return error?.message || null
  }

  async function uploadPhoto(file) {
    if (isDemo) return { url: URL.createObjectURL(file) }
    const blob = await shrinkImage(file)
    const path = `${userId}/${Date.now()}.jpg`
    const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' })
    if (error) return { error: error.message }
    // Tidy up the old photo so storage doesn't fill up.
    const old = me?.photo_url?.split('/avatars/')[1]
    if (old) supabase.storage.from('avatars').remove([old])
    return { url: supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl }
  }

  // Adds a new team member and returns their id.
  async function addPerson(name) {
    if (isDemo) {
      const person = { ...demoPeople[0], id: 'p' + Date.now(), name, roles: [], skills: [], email: '' }
      setPeople((list) => [...list, person])
      return { id: person.id }
    }
    const { data, error } = await supabase.from('profiles').insert({ name }).select('id').single()
    if (error) return { error: error.message }
    await load()
    return { id: data.id }
  }

  async function addRole(name) {
    name = name.trim()
    if (!name || roles.some((r) => r.toLowerCase() === name.toLowerCase())) return null
    setRoles((list) => [...list, name])
    if (isDemo) return null
    const { error } = await supabase.from('roles').insert({ name })
    return error?.message || null
  }

  async function removeRole(name) {
    setRoles((list) => list.filter((r) => r !== name))
    if (isDemo) return null
    const { error } = await supabase.from('roles').delete().eq('name', name)
    return error?.message || null
  }

  const value = { people, roles, me, loading, updateMe, uploadPhoto, addPerson, addRole, removeRole }
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export const useTeam = () => useContext(TeamContext)

// Phone photos are huge; shrink to 400px so they load fast and use little storage.
async function shrinkImage(file, max = 400) {
  const img = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
}
