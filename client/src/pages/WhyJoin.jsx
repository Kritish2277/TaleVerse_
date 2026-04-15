import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function WhyJoin(){
  const navigate = useNavigate()
  
  return (
    <section className="why">
      <div className="why-card" style={{textAlign: 'left'}}>
        <h2 style={{textAlign: 'left'}}>Why Join TaleVerse?</h2>
        <p style={{textAlign: 'left'}}>Discover what makes our community special</p>
        <ul style={{
          listStyle: 'disc',
          paddingLeft: '20px',
          margin: '24px 0',
          textAlign: 'left',
          lineHeight: 1.7
        }}>
          <li style={{ 
            marginBottom: '16px', 
            fontSize: '16px',
            color: 'var(--text)',
            lineHeight: '1.6'
          }}>Write stories collaboratively with a global community</li>
          <li style={{ 
            marginBottom: '16px', 
            fontSize: '16px',
            color: 'var(--text)',
            lineHeight: '1.6'
          }}>Earn points and climb the leaderboard</li>
          <li style={{ 
            marginBottom: '16px', 
            fontSize: '16px',
            color: 'var(--text)',
            lineHeight: '1.6'
          }}>Share your imagination with readers worldwide</li>
          <li style={{ 
            fontSize: '16px',
            color: 'var(--text)',
            lineHeight: '1.6'
          }}>Read stories from talented writers in the community</li>
        </ul>
        <button className="btn primary" onClick={() => navigate('/auth')}>Next</button>
      </div>
    </section>
  )
}
