import React, { useCallback, useEffect, useState, Suspense } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
const TarotCardPreview = React.lazy(() => import('./TarotCardPreview'))

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
    const clamp = Math.max(-6, Math.min(6, diff))
    const abs = Math.abs(clamp)
    const angle = clamp * 8 // degrees per step
    const tx = clamp * 80
    const ty = -Math.abs(clamp) * 18
    const rotateY = clamp * -8
    const scale = clamp === 0 ? 1.16 : Math.max(0.7, 1 - abs * 0.06)
    const z = 100 - abs
    const opacity = abs > 6 ? 0 : 1 - Math.min(0.6, abs * 0.12)
    return {
      transform: `translateX(${tx}px) translateY(${ty}px) rotate(${angle}deg) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: z,
      transition: 'transform 300ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease',
      opacity,
      transformOrigin: 'center bottom' as const,
      pointerEvents: 'auto' as const
    }
  }

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef} tabIndex={0} aria-label="Tarot carousel viewport">
        <div className="embla__container">
          {cards.map((card, idx) => (
            <div className="embla__slide" key={card}>
              <div className="fan-slide" style={computeStyle(idx)}>
                {Math.abs(idx - selectedIndex) <= 3 ? (
                  <Suspense fallback={null}>
                    <TarotCardPreview filename={card} deckType={deckType} onSelect={onSelect} forceLoad />
                  </Suspense>
                ) : (
                  <div className="tarot-placeholder" aria-hidden="true" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

