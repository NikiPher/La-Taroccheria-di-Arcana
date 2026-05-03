import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function SharedReading() {
  const { shareId } = useParams();
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    base44.entities.Reading.filter({ share_id: shareId }).then(data => {
      if (data.length > 0 && data[0].is_shared) {
        setReading(data[0]);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-xl tracking-wide mb-2">Lettura non disponibile</h2>
        <p className="font-body text-muted-foreground text-lg">
          Questa lettura non esiste o non è stata condivisa.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-2xl md:text-3xl tracking-wide mb-2">{reading.title || "Lettura dei Tarocchi"}</h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-body text-muted-foreground">
          <span>{reading.deck_name}</span>
          <span>·</span>
          <span>{reading.reading_type_name}</span>
          <span>·</span>
          <span>{new Date(reading.created_date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        {reading.question && (
          <p className="font-body text-xl italic text-foreground/80 mt-6 max-w-xl mx-auto">
            "{reading.question}"
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {(reading.cards || []).map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border/30 rounded-xl overflow-hidden"
          >
            <div className="relative aspect-[2/3] bg-secondary flex items-center justify-center">
              {card.card_image ? (
                <img
                  src={card.card_image}
                  alt={card.card_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading text-xs text-center px-2 text-muted-foreground">
                  {card.card_name}
                </span>
              )}
            </div>
            <div className="p-3 text-center">
              <p className="font-heading text-xs tracking-wide">{card.card_name}</p>
              <p className="text-[11px] text-primary font-body mt-0.5">{card.position_label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interpretation */}
      {reading.interpretation && (
        <div className="bg-card/50 border border-border/20 rounded-xl p-6 md:p-8">
          <div className="font-body text-lg leading-relaxed text-foreground/90 prose prose-invert max-w-none">
            <ReactMarkdown>{reading.interpretation}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="text-center mt-12 py-8 border-t border-border/30">
        <p className="font-body text-muted-foreground">
          ✦ Taroccheria di Arcana ✦
        </p>
      </div>
    </div>
  );
}
