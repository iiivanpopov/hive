/* eslint-disable react-hooks/immutability */
import { useEffect, useRef, useState } from 'react'

import { getRetry } from '@/lib/utils'

import { useEvent } from '../use-event/use-event'

/** The use web socket url type */
export type UseWebSocketUrl = (() => string) | string

/** The use web socket options type */
export interface UseWebSocketOptions {
  /** The list of protocols to use */
  protocols?: Array<'soap' | 'wasm'>
  /** The number of times to retry the connection */
  retry?: boolean | number
  /** The callback function that is called when the WebSocket connection is established */
  onConnected?: (webSocket: WebSocket) => void
  /** The callback function that is called when the WebSocket connection is closed */
  onDisconnected?: (event: CloseEvent, webSocket: WebSocket) => void
  /** The callback function that is called when an error occurs */
  onError?: (event: Event, webSocket: WebSocket) => void
  /** The callback function that is called when a message is received */
  onMessage?: (event: MessageEvent, webSocket: WebSocket) => void
}

export type UseWebSocketStatus = 'connected' | 'connecting' | 'disconnected' | 'failed'

/** The use web socket return type */
export interface UseWebSocketReturn {
  /** The WebSocket client */
  client?: WebSocket
  /** The close function */
  close: WebSocket['close']
  /** The send function */
  send: WebSocket['send']
  /** The status of the WebSocket connection */
  status: UseWebSocketStatus
  /** The open function */
  open: () => void
}

export function useWebSocket(url: UseWebSocketUrl, options?: UseWebSocketOptions): UseWebSocketReturn {
  const webSocketRef = useRef<WebSocket>(undefined)
  const retryCountRef = useRef(options?.retry ? getRetry(options.retry) : 0)
  const explicityCloseRef = useRef(false)

  const [status, setStatus] = useState<UseWebSocketStatus>('connecting')

  const send = (data: string | ArrayBufferLike | ArrayBufferView | Blob) =>
    webSocketRef.current?.send(data)

  const close = () => {
    explicityCloseRef.current = true
    webSocketRef.current?.close()
  }

  const init = useEvent(() => {
    webSocketRef.current = new WebSocket(
      typeof url === 'function' ? url() : url,
      options?.protocols,
    )
    setStatus('connecting')

    const webSocket = webSocketRef.current
    if (!webSocket)
      return

    webSocket.onopen = () => {
      setStatus('connected')
      options?.onConnected?.(webSocket)
    }

    webSocket.onerror = (event) => {
      setStatus('failed')
      options?.onError?.(event, webSocket)
    }

    webSocket.onmessage = event => options?.onMessage?.(event, webSocket)

    webSocket.onclose = (event) => {
      setStatus('disconnected')
      options?.onDisconnected?.(event, webSocket)
      if (explicityCloseRef.current)
        return

      if (retryCountRef.current > 0) {
        retryCountRef.current -= 1
        return init()
      }
      retryCountRef.current = options?.retry ? getRetry(options.retry) : 0
    }
  })

  useEffect(() => {
    init()

    return () => {
      if (!webSocketRef.current)
        return
      webSocketRef.current.close()
      webSocketRef.current = undefined
    }
  }, [url])

  const open = () => {
    explicityCloseRef.current = false
    init()
  }

  return { client: webSocketRef.current, close, open, send, status }
}
