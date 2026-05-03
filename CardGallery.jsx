import { useState, useEffect, useRef } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function CardGallery() {
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDecks = async () => {
    const data = await base44.entities.TarotDeck.filter({ is_active: true });
    setDecks(data);
    if (data.length > 0) setSelectedDeck(data[0]);
  };

  const { refreshing, containerRef, onTouchStart, onTouchEnd } = usePullToRefresh(loadDecks);

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    if (!selectedDeck) return;
    setLoading(true);
    base44.entities.TarotCard.filter({ deck_id: selectedDeck.id }, "sort_order").then((data) => {
      setCards(data);
      setLoading(false);
    });
  }, [selectedDeck]);

  return (
    <div
      ref={containerRef}
      className="max-w-7xl mx-auto px-4 py-10"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-2 tracking-wide">Galleria Carte</h1>
      <p className="font-body text-muted-foreground mb-8">Esplora le carte di ogni mazzo.</p>

      {/* Deck tabs */}
      {decks.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => setSelectedDeck(deck)}
              className={`font-heading tracking-wider text-sm px-4 py-2 rounded-lg border transition-all ${
                selectedDeck?.id === deck.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {deck.name}
            </button>
          ))}
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-center text-muted-foreground font-body py-20">Nessuna carta trovata in questo mazzo.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group flex flex-col items-center bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
            >
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs font-heading">?</span>
                </div>
              )}
              <div className="p-2 text-center w-full">
                <p className="font-heading text-xs text-foreground leading-tight truncate">{card.name}</p>
                {card.keywords && (
                  <p className="font-body text-xs text-muted-foreground mt-0.5 truncate">{card.keywords}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
