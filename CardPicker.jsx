import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RotateCcw, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CardPicker({ deck, readingType, onComplete, onBack }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState(new Set());

  const numNeeded = readingType.num_cards;
  const positions = readingType.positions || [];

  useEffect(() => {
    base44.entities.TarotCard.filter({ deck_id: deck.id }, 'sort_order').then(data => {
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setLoading(false);
    });
  }, [deck.id]);

  const currentPosition = positions[selectedCards.length] || { label: `Carta ${selectedCards.length + 1}`, description: "" };

  const toggleCard = (card) => {
    if (selectedCards.length >= numNeeded) return;
    if (selectedCards.find(c => c.card_id === card.id)) return;

    const selection = {
      card_id: card.id,
      card_name: card.name,
      card_image: card.image,
      position_label: currentPosition.label,
      position_description: currentPosition.description,
      is_reversed: false,
      upright_meaning: card.upright_meaning,
    };

    const newSelected = [...selectedCards, selection];
    setSelectedCards(newSelected);
    setFlippedCards(prev => new Set([...prev, card.id]));

    if (newSelected.length === numNeeded) {
      setTimeout(() => onComplete(newSelected), 800);
    }
  };

  const resetSelection = () => {
    setSelectedCards([]);
    setFlippedCards(new Set());
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-lg text-muted-foreground">Nessuna carta in questo mazzo. L'admin deve aggiungerle.</p>
        <Button variant="ghost" onClick={onBack} className="mt-4 font-body min-h-[44px] select-none">
          <ArrowLeft className="w-4 h-4 mr-2" /> Torna indietro
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl tracking-wide mb-2">Scegli le Carte</h2>
        {selectedCards.length < numNeeded ? (
          <div>
            <p className="font-body text-primary text-lg">
              {currentPosition.label}
              <span className="text-muted-foreground"> — {selectedCards.length + 1}/{numNeeded}</span>
            </p>
            {currentPosition.description && (
              <p className="font-body text-muted-foreground text-sm mt-1">{currentPosition.description}</p>
            )}
          </div>
        ) : (
          <p className="font-body text-primary text-lg">Tutte le carte selezionate!</p>
        )}
      </div>

      {selectedCards.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {selectedCards.map((card, i) => (
            <div key={i} className="bg-card border border-primary/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-primary font-heading">{i + 1}.</span>
              <span className="text-xs font-body">{card.card_name}</span>

            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {cards.map((card, i) => {
          const isSelected = flippedCards.has(card.id);
          const isDisabled = selectedCards.length >= numNeeded && !isSelected;
          const cardClass = isSelected
            ? "ring-2 ring-primary glow-gold"
            : isDisabled
            ? "opacity-30 cursor-not-allowed"
            : "hover:scale-105 hover:ring-1 hover:ring-primary/50 cursor-pointer";

          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01, duration: 0.2 }}
              onClick={() => !isSelected && !isDisabled && toggleCard(card)}
              disabled={isSelected || isDisabled}
              className={`aspect-[2/3] rounded-lg overflow-hidden relative transition-all select-none ${cardClass}`}
            >
              {isSelected ? (
                <div className="w-full h-full bg-card border border-primary/30 flex flex-col items-center justify-center p-1">
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-[8px] font-heading text-primary text-center leading-tight">{card.name}</span>
                  )}
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 border border-border/50 flex items-center justify-center">
                  {deck.card_back_image ? (
                    <img src={deck.card_back_image} alt="dorso" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 border border-accent/30 rounded-full flex items-center justify-center">
                      <span className="text-accent/50 text-[8px]">✦</span>
                    </div>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack} className="font-body min-h-[44px] select-none">
          <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
        </Button>
        <Button variant="outline" onClick={resetSelection} className="font-body min-h-[44px] select-none" disabled={selectedCards.length === 0}>
          <RotateCcw className="w-4 h-4 mr-2" /> Ricomincia
        </Button>
      </div>
    </div>
  );
}
