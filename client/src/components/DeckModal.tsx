import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TarotCarousel from './TarotCarousel'

interface DeckModalProps {
  isOpen: boolean
  onClose: () => void
  deckType: 'major' | 'minor'
  cards: string[]
  onSelect: (filename: string) => void
}

export default function DeckModal({ isOpen, onClose, deckType, cards, onSelect }: DeckModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="deck-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <h2 className="deck-modal-title">
              {deckType === 'major' ? 'Arcani Maggiori' : 'Arcani Minori'}
            </h2>
            <button className="deck-modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
            
            <TarotCarousel cards={cards} deckType={deckType} onSelect={(filename) => {
              onSelect(filename)
              onClose()
            }} />
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
