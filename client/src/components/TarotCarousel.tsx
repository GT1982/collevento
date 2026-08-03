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

  const onInit = useCallback((api: any) => {
    try {
      console.log('Embla init - slides:', api.slideNodes().length, 'containerWidth:', api.containerNode().clientWidth, 'slideCount:', api.slideNodes().length)
    } catch (e) { console.warn('Embla init log failed', e) }
    setScrollSnaps(api.scrollSnapList())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    console.log('Embla API ready', { options: emblaApi.options(), slides: emblaApi.slideNodes().length })
    onInit(emblaApi)
    emblaApi.on('reInit', onInit)
    return () => emblaApi.off && emblaApi.off('reInit', onInit)
  }, [emblaApi, onInit])

  return (
    <div className="embla">
      {/* embla viewport must receive the ref from useEmblaCarousel */}
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {cards.map((card) => (
            <div className="embla__slide" key={card}>
              <TarotCardPreview filename={card} deckType={deckType} onSelect={onSelect} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
