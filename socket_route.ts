// app/api/socket/route.ts
import { Server } from 'socket.io'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const res = NextResponse.next()
  const io = new Server(res.socket.server)

  io.on('connection', (socket) => {
    // handle connections
  })

  res.socket.server.io = io
  return new Response('Socket server running')
}
