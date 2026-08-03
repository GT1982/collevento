# FEATURE: Refactor della selezione Arcani Maggiori e Arcani Minori

## Contesto

L'applicazione è sviluppata con:

- React
- Vite
- TypeScript

Il sito è un'app fantasy dedicata alla lettura dei Tarocchi.

L'attuale esperienza utente presenta un problema:

Quando l'utente clicca su:

- Arcani Maggiori
- Arcani Minori

viene semplicemente renderizzata una lunga lista di carte sotto la pagina.

Questa soluzione è poco moderna, poco immersiva e rende difficile la selezione.

L'obiettivo è sostituire completamente questo comportamento con un'esperienza premium.

---

# OBIETTIVO

La selezione delle carte deve diventare uno degli elementi principali dell'esperienza del sito.

L'interazione deve ricordare videogiochi come:

- Hearthstone
- Magic The Gathering Arena
- Diablo IV UI
- Baldur's Gate 3
- Apple Cover Flow

L'utente deve avere la sensazione di scegliere una carta da un vero mazzo magico.

---

# NON MODIFICARE

Mantenere:

- palette colori
- immagini
- font
- tema fantasy
- logica applicativa esistente
- struttura dei dati delle carte

Modificare esclusivamente la UX della selezione.

---

# NUOVA ARCHITETTURA

Creare componenti dedicati.

```
components/
    tarot/
        TarotSelectionModal.tsx
        TarotCarousel.tsx
        TarotCard.tsx
        TarotSearch.tsx
        TarotHeader.tsx
        TarotFooter.tsx
        NavigationArrows.tsx
```

Separare chiaramente:

UI

logica

stato

animazioni

---

# LIBRERIE

Utilizzare:

Embla Carousel

per il carosello.

Utilizzare:

Framer Motion

per tutte le animazioni.

Utilizzare:

React Portal

per il Modal.

---

# MODAL

Quando l'utente clicca

Arcani Maggiori

oppure

Arcani Minori

aprire un Modal fullscreen.

Il Modal deve essere renderizzato tramite Portal.

Lo sfondo deve avere:

background:

rgba(0,0,0,.82)

backdrop-filter:

blur(10px)

Il body deve avere:

overflow:hidden

finché il popup è aperto.

---

# LAYOUT

Centro dello schermo.

Massima larghezza:

1200px

Massima altezza:

90vh

Responsive.

---

# HEADER

Mostrare:

Titolo

(es. Arcani Maggiori)

Campo ricerca

Pulsante chiusura

---

# RICERCA

Campo ricerca in tempo reale.

Placeholder:

"Cerca una carta..."

Filtrare il carosello senza ricaricare.

---

# CAROSELLO

Usare Embla Carousel.

Desktop

5-7 carte visibili

Tablet

3 carte

Mobile

1 carta

La carta centrale deve essere:

più grande

perfettamente leggibile

illuminata

Le laterali devono essere:

più piccole

leggermente sfocate

ruotate

trasparenti

Stile:

Cover Flow.

---

# NAVIGAZIONE

Supportare:

mouse drag

touch swipe

wheel

arrow keys

frecce laterali

---

# CARTA

Ogni carta deve avere:

bordo dorato

ombra fantasy

texture elegante

hover glow

border-radius coerente con il sito

---

# HOVER

Hover animation:

scale(1.08)

translateY(-8px)

rotateY(5deg)

box-shadow dorato

transition

300ms ease

---

# CARTA ATTIVA

La carta selezionata deve avere:

Glow dorato

Scala

1.12

Outline luminoso

Leggera animazione di pulsazione

---

# CLICK

Quando viene cliccata una carta:

eseguire

piccolo flip 3D

glow

conferma

Successivamente:

chiudere automaticamente il modal

salvare la carta selezionata

aggiornare la UI principale

---

# PREVIEW

Sotto il carosello mostrare:

Nome carta

Numero

Breve descrizione

Pulsante

"Seleziona"

---

# ANIMAZIONI

Utilizzare Framer Motion.

Animazione apertura:

opacity

0 -> 1

scale

0.9 -> 1

blur

10px -> 0

Animazione chiusura:

reverse.

Animazione carte:

spring

stiffness media

movement naturale.

---

# ACCESSIBILITÀ

Supportare:

ESC

TAB

ENTER

SPACE

Focus trap

ARIA labels

---

# PERFORMANCE

Utilizzare:

React.memo

useMemo

useCallback

per evitare render inutili.

Lazy loading immagini.

Renderizzare solo le carte visibili quando possibile.

---

# TYPESCRIPT

Definire interfacce dedicate.

Esempio:

```ts
interface TarotCard {
    id: string;
    name: string;
    number: number;
    image: string;
    description?: string;
    arcana: "major" | "minor";
}
```

Evitare:

any

cast inutili

duplicazione.

---

# STATO

Gestire lo stato tramite React Hooks.

Separare:

selectedCard

filteredCards

searchQuery

modalOpen

activeDeck

---

# CODICE

Seguire queste regole:

- componenti piccoli
- funzioni pure
- codice leggibile
- nessuna duplicazione
- commenti solo dove realmente utili

---

# UX

L'utente deve percepire:

eleganza

fluidità

magia

mistero

premium experience

La scelta della carta deve essere coinvolgente e piacevole.

---

# RIMUOVERE

Eliminare completamente il comportamento attuale che mostra tutte le carte sotto la pagina.

La selezione deve avvenire esclusivamente tramite il Modal.

---

# DELIVERABLE

Implementare:

✅ Modal fullscreen

✅ Embla Carousel

✅ Framer Motion

✅ Ricerca

✅ Selezione carta

✅ Responsive

✅ Accessibilità

✅ TypeScript pulito

✅ Componenti modulari

Il risul

tato finale deve sembrare un'applicazione moderna e premium, mantenendo perfettamente l'identità fantasy medievale del progetto.


# BONUS (implementare se compatibile con il progetto)

Se la struttura del progetto lo consente:

- aggiungere un leggero effetto particellare (lucciole/polvere magica) nello sfondo del modal;
- aggiungere un bagliore animato attorno alla carta selezionata;
- aggiungere una lieve parallasse durante lo spostamento del mouse;
- aggiungere un'animazione di "ventaglio" all'apertura del mazzo;
- mantenere il bundle leggero evitando dipendenze non necessarie;
- utilizzare CSS Modules, Tailwind o lo styling già presente nel progetto senza introdurre un nuovo framework CSS.
