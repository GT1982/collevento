import React from 'react'
import { motion } from 'framer-motion'

interface DeckCardProps {
  title: string
  subtitle: string
  onClick: () => void
}

export default function DeckCard({ title, subtitle, onClick }: DeckCardProps) {
  return (
    <motion.div
      className="deck-card"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="deck-card-content">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </motion.div>
  )
}
