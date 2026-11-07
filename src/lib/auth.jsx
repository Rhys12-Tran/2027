import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isDemo } from './supabase.js'
import { me as DEMO_ME } from '../data/sample.js'

// Everyone signs in to one shared team account using the team code (its password).
// Which person you are is picked from the team list and remembered on this device.
const TEAM_LOGIN = 'team@example.com'
const PERSON_KEY = 'fch-person'

const readPerson = () => {
  try {
    return localStorage.getItem(PERSON_KEY)
  } catch {
    return null
  }
}
const writePerson = (id) => {
  try {
    id ? localStorage.setItem(PERSON_KEY, id) : localStorage.removeItem(PERSON_KEY)
  } catch {
    // Private browsing: the choice just won't survive a reload.
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = still checking, null = signed out
  const [session, setSession] = useState(isDemo ? null : undefined)
  const [personId, setPersonId] = useState(() => (isDemo ? readPerson() || DEMO_ME : readPerson()))

  useEffect(() => {
    if (isDemo) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const value = {
    loading: session === undefined,
    signedIn: isDemo || !!session,
    userId: personId,

    async signInWithCode(code) {
      const { error } = await supabase.auth.signInWithPassword({ email: TEAM_LOGIN, password: code })
      if (!error) return null
      if (/invalid/i.test(error.message)) return "That code isn't right. Check with your team leader."
      if (/rate limit|too many/i.test(error.message)) return 'Too many tries. Wait a minute and try again.'
      return error.message
    },

    choosePerson(id) {
      writePerson(id)
      setPersonId(id)
    },

    async signOut() {
      writePerson(null)
      setPersonId(null)
      if (!isDemo) await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
