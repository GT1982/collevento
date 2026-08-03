import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TarotCardPreviewProps {
  filename: string
  deckType: 'major' | 'minor'
  isActive: boolean
  onSelect: (filename: string) => void
  forceLoad?: boolean
}

export default function TarotCardPreview({
  filename,
  deckType,
  isActive,
  onSelect,
  forceLoad = false
}: TarotCardPreviewProps) {
  const [isRevealed, setIsRevealed] = useState(forceLoad)
  const [isVisible, setIsVisible] = useState(forceLoad)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          setIsRevealed(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const folder = deckType === 'major' ? 'arcani-maggiori' : 'arcani-minori'
  const src = `/resource/${folder}/${filename}`
  const displayName = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className={`tarot-card-scene ${isActive ? 'is-active' : ''}`} ref={ref}>
      <motion.div
        className="tarot-card-inner"
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        onClick={() => setIsRevealed((r) => !r)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="tarot-card-back" />
        <div className="tarot-card-front">
          {isVisible && <img src={src} alt={displayName} loading="lazy" />}

          {/* Overlay lives INSIDE the card face so it's never clipped by
              an ancestor's overflow:hidden (e.g. the Embla viewport). */}
          <div className="tarot-card-overlay">
            <span className="tarot-card-name">{displayName}</span>
            <button
              type="button"
              className="select-card-btn"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(filename)
              }}
              aria-label={`Seleziona la carta ${displayName}`}
            >
              Seleziona questa carta
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
