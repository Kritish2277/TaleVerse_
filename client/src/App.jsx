import { useState, useEffect, useContext } from "react";
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Splash from './pages/Splash'
import Welcome from './pages/Welcome'
import WhyJoin from './pages/WhyJoin'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import CreateStory from './pages/CreateStory'
import Profile from './pages/Profile'
import Story from './pages/Story'
import AuthContext from './context/AuthContext'

function RequireAuth({ children }) {
  const { token } = useContext(AuthContext)
  const location = useLocation()
  if (!token) return <Navigate to="/auth" state={{ from: location }} replace />
  return children
}

export default function App(){
  const location = useLocation()
  const showHeader = ['/home', '/stories', '/leaderboard', '/create', '/profile'].some(path => location.pathname.startsWith(path))

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    document.body.classList.add("theme-transition")
    setTimeout(() => document.body.classList.remove("theme-transition"), 400)
  }, [theme])
  
  return (
    <div className="app-root">
      {showHeader && <Header />}
      <main className={`main-content ${showHeader ? 'with-header' : 'fullscreen'}`}>
        <Routes>
          <Route path="/" element={<Splash/>} />
          <Route path="/welcome" element={<Welcome/>} />
          <Route path="/why" element={<WhyJoin/>} />
          <Route path="/auth" element={<Auth/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/stories/:id" element={<Story/>} />
          <Route path="/leaderboard" element={<Leaderboard/>} />
          <Route path="/create" element={<RequireAuth><CreateStory/></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>} />
        </Routes>
      </main>
    </div>
  )
}
