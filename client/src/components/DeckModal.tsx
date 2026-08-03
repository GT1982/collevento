import React, { useEffect, useRef, Suspense } from 'react'
import { createPortal } from 'react-dom'
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
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          ;(last as HTMLElement).focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          ;(first as HTMLElement).focus()
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeBtnRef.current?.focus(), 0)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Lazily grab / create the portal root once, on the client only.
  const getPortalRoot = () => {
    if (typeof document === 'undefined') return null
    let root = document.getElementById('tarot-modal-root')
    if (!root) {
      root = document.createElement('div')
      root.id = 'tarot-modal-root'
      document.body.appendChild(root)
    }
    return root
  }

  const portalRoot = getPortalRoot()
  if (!portalRoot) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="deck-modal-backdrop"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="deck-modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label={deckType === 'major' ? 'Arcani Maggiori' : 'Arcani Minori'}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <div className="deck-modal-header">
              <h2 className="deck-modal-title">
                {deckType === 'major' ? 'Arcani Maggiori' : 'Arcani Minori'}
              </h2>
              <button
                ref={closeBtnRef}
                className="deck-modal-close"
                onClick={onClose}
                aria-label="Chiudi"
              >
                &times;
              </button>
            </div>

            <Suspense fallback={<div className="deck-modal-loading">Sto mescolando il mazzo…</div>}>
              <TarotCarousel
                cards={cards}
                deckType={deckType}
                onSelect={(filename) => {
                  onSelect(filename)
                  onClose()
                }}
              />
            </Suspense>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  )
}
