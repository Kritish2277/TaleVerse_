import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Splash(){
  const navigate = useNavigate()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome')
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])
  
  return (
    <section className="splash">
      <div className="splash-card">
        <Logo size={240} />
        <h1>Many voices. One story.</h1>
        <p>Welcome to TaleVerse — a collaborative storytelling space.</p>
      </div>
    </section>
  )
}

