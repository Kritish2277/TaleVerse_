import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Welcome(){
  const navigate = useNavigate()
  
  return (
    <section className="welcome">
      <div className="welcome-card">
        <img 
  src="/welcome_image.png" 
  alt="Welcome illustration"
  className="w-60 md:w-72 mx-auto mb-6 hover:scale-105 transition"
/>
        <h2>Welcome to TaleVerse</h2>
        <p>Join a community of writers creating stories together. Earn points, discover amazing tales, and publish collaborative works.</p>
        <button className="btn primary" onClick={() => navigate('/why')}>Next</button>
      </div>
    </section>
  )
}
