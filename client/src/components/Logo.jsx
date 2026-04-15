import React from 'react'

export default function Logo({size=40, alt='TaleVerse'}){
  const style = {width: size, height: size, display: 'inline-block', objectFit: 'contain'}
  return (
    <img
      src="/logo.png"
      alt={alt}
      className="logo-img"
      style={style}
      onError={(e) => {
        // try alternate filename then fallback to inline SVG
        if (e.target.dataset.tried === 'alt') {
          e.target.onerror = null
          e.target.style.display = 'none'
          const wrapper = e.target.parentNode
          if (wrapper) {
            const ns = 'http://www.w3.org/2000/svg'
            const svg = document.createElementNS(ns, 'svg')
            svg.setAttribute('viewBox', '0 0 64 64')
            svg.setAttribute('width', size)
            svg.setAttribute('height', size)
            svg.innerHTML = `<rect x="6" y="12" width="24" height="36" rx="2" fill="#6C63FF" opacity="0.12" /><path d="M10 14c8-4 18-4 26 0v34c-8-4-18-4-26 0V14z" fill="#6C63FF" /><circle cx="46" cy="18" r="6" fill="#A29BFE" opacity="0.9"/>`
            wrapper.appendChild(svg)
          }
        } else {
          e.target.dataset.tried = 'alt'
          e.target.src = '/logo.png'
        }
      }}
    />
  )
}
