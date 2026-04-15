import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, '')
  : window.location.origin
let socket

// connect with optional token (jwt) for authenticated sockets
export function connect(token){
  if(socket){
    // if token changed, recreate connection
    if(token && socket && socket.auth && socket.auth.token === token) return socket
    disconnect()
  }
  const opts = token ? { auth: { token }, transports:['websocket','polling'] } : { transports:['websocket','polling'] }
  socket = io(URL, opts)
  return socket
}

export function disconnect(){ if(socket){ socket.disconnect(); socket = null } }

export default { connect, disconnect }
