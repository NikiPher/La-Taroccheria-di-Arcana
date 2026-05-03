import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import CardPicker from "../components/CardPicker";

const STEPS = ["deck", "type", "question", "cards", "interpreting"];

export default function NewReading() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [decks, setDecks] = useState([]);
  const [readingTypes, setReadingTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [question, setQuestion] = useState("");
  const [selectedCards, setSelectedCards] = useState([]);
  const [interpreting, setInterpreting] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.TarotDeck.filter({ is_active: true }),
      base44.entities.ReadingType.filter({ is_active: true }),
    ]).then(([d, t]) => {
      setDecks(d);
      setReadingTypes(t);
      setLoading(false);
    });
  }, []);

  const currentStep = STEPS[step];

  const handleCardSelection = (cards) => {
    setSelectedCards(cards);
    setStep(4);
    performReading(cards);
  };

  const performReading = async (cards) => {
    setInterpreting(true);

    const cardsDescription = cards.map((c, i) => {
      const pos = selectedType.positions?.[i];
      return `Posizione "${pos?.label || `Carta ${i + 1}`}" (${pos?.description || ""}): ${c.card_name} - Significato: ${c.upright_meaning || "N/A"}`;
    }).join("\n");

    const prompt = `Sei un esperto lettore di tarocchi, con una profonda conoscenza esoterica e psicologica dei simboli dei tarocchi. Fornisci una lettura dettagliata e significativa in italiano.

Tipo di lettura: ${selectedType.name}
${selectedType.description ? `Descrizione: ${selectedType.description}` : ""}
Mazzo: ${selectedDeck.name}
${question ? `Domanda del consultante: ${question}` : "Lettura generale senza domanda specifica."}

Carte estratte:
${cardsDescription}

Fornisci un'interpretazione profonda e dettagliata che:
1. Analizzi ogni carta nella sua posizione specifica
2. Consideri le relazioni tra le carte
3. Offra una sintesi generale della lettura
4. Dia consigli pratici basati sulle carte

Usa un tono mistico ma accessibile, scrivi in modo poetico ma chiaro. Usa emoji stellari (✦, ✧, ⭑) come separatori.`;

    const interpretation = await base44.integrations.Core.InvokeLLM({ prompt });

    const shareId = Math.random().toString(36).substring(2, 10);

    const reading = await base44.entities.Reading.create({
      title: question || `Lettura ${selectedType.name}`,
      deck_id: selectedDeck.id,
      deck_name: selectedDeck.name,
      reading_type_id: selectedType.id,
      reading_type_name: selectedType.name,
      question,
      cards,
      interpretation,
      share_id: shareId,
      is_shared: false,
    });

    setInterpreting(false);
    navigate(`/reading/${reading.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {["Mazzo", "Tipo", "Domanda", "Carte", "Lettura"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading transition-all ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary/20 text-primary border border-primary" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <span className="hidden sm:block text-xs font-body text-muted-foreground">{label}</span>
            {i < 4 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Choose Deck */}
        {currentStep === "deck" && (
          <StepWrapper key="deck">
            <h2 className="font-heading text-2xl tracking-wide text-center mb-2">Scegli il Mazzo</h2>
            <p className="font-body text-muted-foreground text-center text-lg mb-8">Seleziona il mazzo con cui vuoi lavorare</p>
            {decks.length === 0 ? (
              <p className="text-center text-muted-foreground font-body">Nessun mazzo disponibile. L'admin deve crearne uno.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map(deck => (
                  <button
                    key={deck.id}
                    onClick={() => { setSelectedDeck(deck); setStep(1); }}
                    className={`bg-card border rounded-xl overflow-hidden text-left hover:border-primary/50 transition-all ${
                      selectedDeck?.id === deck.id ? "border-primary glow-gold" : "border-border/30"
                    }`}
                  >
                    <div className="h-32 bg-secondary flex items-center justify-center">
                      {deck.cover_image ? (
                        <img src={deck.cover_image} alt={deck.name} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading text-sm tracking-wide">{deck.name}</h3>
                      {deck.description && <p className="font-body text-muted-foreground text-sm mt-1 line-clamp-2">{deck.description}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </StepWrapper>
        )}

        {/* Step 2: Choose Reading Type */}
        {currentStep === "type" && (
          <StepWrapper key="type">
            <h2 className="font-heading text-2xl tracking-wide text-center mb-2">Tipo di Lettura</h2>
            <p className="font-body text-muted-foreground text-center text-lg mb-8">Scegli la disposizione delle carte</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {readingTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type); setStep(2); }}
                  className="bg-card border border-border/30 rounded-xl p-6 text-left hover:border-primary/50 transition-all"
                >
                  <h3 className="font-heading text-sm tracking-wide mb-2">{type.name}</h3>
                  {type.description && <p className="font-body text-muted-foreground text-sm mb-3">{type.description}</p>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-heading">
                    {type.num_cards} carte
                  </span>
                  {type.positions && (
                    <div className="mt-3 space-y-0.5">
                      {type.positions.map((pos, i) => (
                        <p key={i} className="text-xs text-muted-foreground font-body">{i + 1}. {pos.label}</p>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-start mt-6">
              <Button variant="ghost" onClick={() => setStep(0)} className="font-body">
                <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
              </Button>
            </div>
          </StepWrapper>
        )}

        {/* Step 3: Question */}
        {currentStep === "question" && (
          <StepWrapper key="question">
            <h2 className="font-heading text-2xl tracking-wide text-center mb-2">La Tua Domanda</h2>
            <p className="font-body text-muted-foreground text-center text-lg mb-8">Concentrati su ciò che desideri sapere (opzionale)</p>
            <div className="max-w-lg mx-auto">
              <Textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="font-body text-lg min-h-[120px]"
                placeholder="Scrivi la tua domanda o lascia vuoto per una lettura generale..."
              />
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(1)} className="font-body">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
                </Button>
                <Button onClick={() => setStep(3)} className="font-heading tracking-wider text-xs">
                  Scegli le Carte <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </StepWrapper>
        )}

        {/* Step 4: Card Picker */}
        {currentStep === "cards" && (
          <StepWrapper key="cards">
            <CardPicker
              deck={selectedDeck}
              readingType={selectedType}
              onComplete={handleCardSelection}
              onBack={() => setStep(2)}
            />
          </StepWrapper>
        )}

        {/* Step 5: Interpreting */}
        {currentStep === "interpreting" && (
          <StepWrapper key="interpreting">
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-float" />
              <h2 className="font-heading text-2xl tracking-wide mb-3">Interpretando le carte...</h2>
              <p className="font-body text-muted-foreground text-lg">Le stelle si stanno allineando per la tua lettura</p>
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mt-8" />
            </div>
          </StepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
