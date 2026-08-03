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
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onInit = useCallback((api: any) => {
    try {
      console.log('Embla init - slides:', api.slideNodes().length, 'containerWidth:', api.containerNode().clientWidth, 'slideCount:', api.slideNodes().length)
    } catch (e) { console.warn('Embla init log failed', e) }
    setScrollSnaps(api.scrollSnapList())
    try { if (typeof api.selectedScrollSnap === 'function') setSelectedIndex(api.selectedScrollSnap()) } catch(e) {}
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    try {
      const slideCount = typeof emblaApi.slideNodes === 'function' ? emblaApi.slideNodes().length : (emblaApi.slideNodes?.length ?? 0)
      console.log('Embla API ready', { slides: slideCount })
    } catch (e) { console.warn('Embla API inspect failed', e) }
    onInit(emblaApi)
    const update = () => {
      try {
        const idx = typeof emblaApi.selectedScrollSnap === 'function' ? emblaApi.selectedScrollSnap() : 0
        setSelectedIndex(idx)
      } catch(e){ }
    }
    if (typeof emblaApi.on === 'function') {
      emblaApi.on('reInit', onInit)
      emblaApi.on('select', update)
      emblaApi.on('scroll', update)
    }
    return () => {
      if (typeof emblaApi.off === 'function') {
        emblaApi.off('reInit', onInit)
        emblaApi.off('select', update)
        emblaApi.off('scroll', update)
      }
    }
  }, [emblaApi, onInit])

  function computeStyle(i:number){
    const diff = i - selectedIndex
    const clamp = Math.max(-4, Math.min(4, diff))
    const abs = Math.abs(clamp)
    const tx = clamp * 90
    const rotate = clamp * -8
    const scale = diff === 0 ? 1.12 : Math.max(0.7, 1 - abs * 0.06)
    const z = 100 - abs
    const opacity = abs > 5 ? 0 : 1 - Math.min(0.6, abs * 0.12)
    return {
      transform: `translateX(${tx}px) rotateY(${rotate}deg) scale(${scale})`,
      zIndex: z,
      transition: 'transform 300ms ease, opacity 300ms ease',
      opacity,
      transformOrigin: 'center bottom' as const,
      pointerEvents: diff === 0 ? 'auto' as const : 'auto' as const
    }
  }

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {cards.map((card, idx) => (
            <div className="embla__slide" key={card}>
              <div className="fan-slide" style={computeStyle(idx)}>
                <TarotCardPreview filename={card} deckType={deckType} onSelect={onSelect} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
