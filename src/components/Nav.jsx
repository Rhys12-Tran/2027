import { Link, NavLink } from 'react-router-dom'
import { HomeIcon, CheckIcon, MoneyIcon, TeamIcon, ActivityIcon, BellIcon, SettingsIcon } from './Icons.jsx'

const tabs = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/checklist', label: 'Checklist', Icon: CheckIcon },
  { to: '/budget', label: 'Budget', Icon: MoneyIcon },
  { to: '/team', label: 'Team', Icon: TeamIcon },
  { to: '/activity', label: 'Activity', Icon: ActivityIcon },
]

// Phone: top bar + bottom tabs. Desktop (900px+): left sidebar. CSS decides which shows.
export default function Nav({ unread = 0 }) {
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />Film Crew HQ</Link>
        <div className="topbar-actions">
          <Link to="/activity" className="icon-btn" aria-label={`Notifications, ${unread} new`}>
            <BellIcon />
            {unread > 0 && <span className="badge">{unread}</span>}
          </Link>
          <Link to="/settings" className="icon-btn" aria-label="Settings"><SettingsIcon /></Link>
        </div>
      </header>

      <nav className="tabbar" aria-label="Main">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <aside className="sidebar" aria-label="Main">
        <Link to="/" className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />Film Crew HQ</Link>
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}>
            <Icon />
            {label}
            {to === '/activity' && unread > 0 && <span className="badge">{unread}</span>}
          </NavLink>
        ))}
        <div className="spacer" />
        <NavLink to="/settings" className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}>
          <SettingsIcon />
          Settings
        </NavLink>
      </aside>
    </>
  )
}
