import { useEffect, useRef, useState } from 'react'

// ponytail: single shared IntersectionObserver per hook instance, fine for dashboard-scale DOM
export function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)

    // safety net: never leave content permanently hidden (e.g. observer never
    // fires for off-screen/zero-size elements, or fires before paint).
    const safety = setTimeout(() => setVisible(true), 1200)

    return () => {
      io.disconnect()
      clearTimeout(safety)
    }
  }, [])

  return { ref, visible }
}
