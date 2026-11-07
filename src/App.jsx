import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Checklist from './pages/Checklist.jsx'
import Budget from './pages/Budget.jsx'
import Team from './pages/Team.jsx'
import Profile from './pages/Profile.jsx'
import ProfileEdit from './pages/ProfileEdit.jsx'
import Activity from './pages/Activity.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import WhoAreYou from './pages/WhoAreYou.jsx'
import { useAuth } from './lib/auth.jsx'
import { useTeam } from './lib/team.jsx'
import { isDemo } from './lib/supabase.js'

export default function App() {
  const { loading, signedIn, userId } = useAuth()
  const { people, loading: teamLoading } = useTeam()

  if (loading) return <div className="splash"><img src="/icon.svg" alt="Loading" width="56" height="56" /></div>
  if (!signedIn) return <Login />
  // Signed in with the team code, but this device doesn't know who you are yet (or that person was removed).
  if (!userId || (!teamLoading && !people.some((p) => p.id === userId))) return <WhoAreYou />

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/who" element={<WhoAreYou />} />
      <Route
        path="*"
        element={
          <div className="app">
            <Nav unread={3} />
            <main className="main">
              {isDemo && <p className="demo-strip">Demo mode · sample data, nothing is saved. Connect Supabase to go live (see SETUP.md).</p>}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checklist" element={<Checklist />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/team" element={<Team />} />
                <Route path="/team/:id" element={<Profile />} />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  )
}
