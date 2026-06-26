import { useEffect, useRef, useCallback } from 'react'

export function useWebSocket() {
  const wsRef = useRef(null)
  const handlersRef = useRef(new Map())
  const reconnectTimerRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = 'localhost:8000'
    const url = `${protocol}//${host}/ws`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const handler = handlersRef.current.get(data.type)
        if (handler) handler(data)
      } catch (err) {
        console.error('WebSocket message parse error:', err)
      }
    }

    ws.onclose = () => {
      reconnectTimerRef.current = setTimeout(connect, 2000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const on = useCallback((type, handler) => {
    handlersRef.current.set(type, handler)
    return () => handlersRef.current.delete(type)
  }, [])

  const sendGesture = useCallback((gesture, handX, handY) => {
    send({
      type: 'gesture',
      gesture,
      handX,
      handY,
      timestamp: Date.now() / 1000,
    })
  }, [send])

  return { send, on, sendGesture, ws: wsRef }
}
