import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TarotCardPreviewProps {
  filename: string
  deckType: 'major' | 'minor'
  onSelect: (filename: string) => void
}

export default function TarotCardPreview({ filename, deckType, onSelect }: TarotCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '300px' }) // load 2-3 cards ahead
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const folder = deckType === 'major' ? 'arcani-maggiori' : 'arcani-minori'
  const src = `/resource/${folder}/${filename}`

  const handleClick = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="tarot-card-scene" ref={ref}>
      <motion.div 
        className="tarot-card-inner"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0, scale: isFlipped ? 1.15 : 1, zIndex: isFlipped ? 10 : 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        onClick={handleClick}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="tarot-card-back" />
        <div className="tarot-card-front">
          {isVisible && <img src={src} alt={filename} loading="lazy" />}
        </div>
      </motion.div>

      <button 
        className={`select-card-btn ${isFlipped ? 'visible' : ''}`}
        onClick={(e) => { e.stopPropagation(); onSelect(filename) }}
      >
        Select this card
      </button>
    </div>
  )
}
