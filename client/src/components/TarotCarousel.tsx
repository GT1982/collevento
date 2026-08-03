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
    try {
      const slideCount = typeof emblaApi.slideNodes === 'function' ? emblaApi.slideNodes().length : (emblaApi.slideNodes?.length ?? 0)
      console.log('Embla API ready', { slides: slideCount })
    } catch (e) { console.warn('Embla API inspect failed', e) }
    onInit(emblaApi)
    if (typeof emblaApi.on === 'function') emblaApi.on('reInit', onInit)
    return () => { if (typeof emblaApi.off === 'function') emblaApi.off('reInit', onInit) }
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
