import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import TarotCardPreview from './TarotCardPreview'

interface TarotCarouselProps {
  cards: string[]
  deckType: 'major' | 'minor'
  onSelect: (filename: string) => void
}

export default function TarotCarousel({ cards, deckType, onSelect }: TarotCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    dragFree: true
  })
  
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onInit(emblaApi)
    emblaApi.on('reInit', onInit)
  }, [emblaApi, onInit])

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {cards.map((card) => (
          <div className="embla__slide" key={card}>
            <TarotCardPreview filename={card} deckType={deckType} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  )
}
