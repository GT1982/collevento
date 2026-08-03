import React, { useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TarotCarousel = React.lazy(() => import('./TarotCarousel'))

interface DeckModalProps {
  isOpen: boolean
  onClose: () => void
  deckType: 'major' | 'minor'
  cards: string[]
  onSelect: (filename: string) => void
}

export default function DeckModal({ isOpen, onClose, deckType, cards, onSelect }: DeckModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && modalRef.current) {
        // simple focus trap: keep focus inside modal
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); (last as HTMLElement).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); (first as HTMLElement).focus();
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      // focus close button
      setTimeout(() => closeBtnRef.current?.focus(), 0)
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
            ref={modalRef}
          >
            <h2 className="deck-modal-title">
              {deckType === 'major' ? 'Arcani Maggiori' : 'Arcani Minori'}
            </h2>
            <button ref={closeBtnRef} className="deck-modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
            
            <Suspense fallback={null}>
              <TarotCarousel cards={cards} deckType={deckType} onSelect={(filename) => {
                onSelect(filename)
                onClose()
              }} />
            </Suspense>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
