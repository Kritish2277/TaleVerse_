import React, { createContext, useState } from 'react'

const PresenceContext = createContext()

export function PresenceProvider({children}){
  const [presence, setPresence] = useState([])
  // typed users are part of presence entries (presence items may have a `typing` boolean)
  return (
    <PresenceContext.Provider value={{presence, setPresence}}>
      {children}
    </PresenceContext.Provider>
  )
}

export default PresenceContext
