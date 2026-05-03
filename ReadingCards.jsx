import { motion } from "framer-motion";

export default function ReadingCards({ cards }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border/30 rounded-xl overflow-hidden"
        >
          <div className="relative aspect-[2/3] bg-secondary flex items-center justify-center">
            {card.card_image ? (
              <img
                src={card.card_image}
                alt={card.card_name}
                className={`w-full h-full object-cover ${card.is_reversed ? "rotate-180" : ""}`}
              />
            ) : (
              <span className={`font-heading text-xs text-center px-2 text-muted-foreground ${card.is_reversed ? "rotate-180" : ""}`}>
                {card.card_name}
              </span>
            )}
            {card.is_reversed && (
              <div className="absolute top-2 right-2 bg-accent/80 text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-full font-heading">
                Rovescio
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="font-heading text-xs tracking-wide text-center mb-1">{card.card_name}</p>
            <p className="text-[11px] text-primary text-center font-body">{card.position_label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
