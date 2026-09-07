import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition'

const DEFAULT_LANG = 'en-US'

type Options = {
  lang?: string
  onTranscript: (fullText: string) => void
  onError?: (message: string) => void
}

// Streams a live transcript into `onTranscript` as the user speaks. Each call
// carries the *whole* text (base text captured at start() + everything said
// so far), so callers can wire it straight into a normal string-setter —
// never a partial chunk that needs manual appending.
export function useSpeechToText({ lang = DEFAULT_LANG, onTranscript, onError }: Options) {
  const [isListening, setIsListening] = useState(false)
  const isSupported = ExpoSpeechRecognitionModule.isRecognitionAvailable()

  const baseTextRef = useRef('')
  const committedTextRef = useRef('')

  useSpeechRecognitionEvent('start', () => setIsListening(true))
  useSpeechRecognitionEvent('end', () => setIsListening(false))

  useSpeechRecognitionEvent('result', (event) => {
    const chunk = event.results[0]?.transcript ?? ''
    if (!chunk) return

    const spoken = committedTextRef.current
      ? `${committedTextRef.current} ${chunk}`
      : chunk

    if (event.isFinal) committedTextRef.current = spoken

    onTranscript(baseTextRef.current ? `${baseTextRef.current} ${spoken}` : spoken)
  })

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false)
    onError?.(event.message || event.error || 'Speech recognition error')
  })

  const start = useCallback(async (existingText = '') => {
    baseTextRef.current = existingText.trim()
    committedTextRef.current = ''

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
      if (!perm.granted) {
        onError?.('Microphone permission denied')
        return
      }
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: true,
        maxAlternatives: 1,
      })
    } catch (_) {
      onError?.('Could not start speech recognition')
    }
  }, [lang, onError])

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop()
  }, [])

  // Screens like OpeningOverlay replace themselves via navigation right after
  // submit — don't leave recognition running against a component that's gone.
  useEffect(() => () => ExpoSpeechRecognitionModule.stop(), [])

  return { isListening, isSupported, start, stop }
}
