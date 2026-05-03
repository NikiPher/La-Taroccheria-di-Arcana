import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Share2, ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function ReadingDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");

  useEffect(() => {
    base44.entities.Reading.filter({ id }).then(data => {
      if (data.length > 0) {
        setReading(data[0]);
        setNotes(data[0].personal_notes || "");
        setSavedNotes(data[0].personal_notes || "");
      }
      setLoading(false);
    });
  }, [id]);

  const saveNotes = () => {
    // Optimistic update
    const prev = savedNotes;
    setSavedNotes(notes);
    setReading(r => ({ ...r, personal_notes: notes }));
    base44.entities.Reading.update(reading.id, { personal_notes: notes }).catch(() => {
      setSavedNotes(prev);
      setNotes(prev);
    });
    toast({ title: "Note salvate", description: "Le tue note sono state aggiornate." });
  };

  const notesDirty = notes !== savedNotes;

  const toggleShare = async () => {
    const newShared = !reading.is_shared;
    await base44.entities.Reading.update(reading.id, { is_shared: newShared });
    setReading(prev => ({ ...prev, is_shared: newShared }));
    toast({
      title: newShared ? "Condivisione attivata" : "Condivisione disattivata",
      description: newShared ? "Il link è ora attivo." : "La lettura non è più accessibile pubblicamente.",
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/shared/${reading.share_id}`);
    toast({ title: "Link copiato!" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-lg text-muted-foreground">Lettura non trovata.</p>
        <Link to="/journal">
          <Button variant="outline" className="mt-4 font-heading tracking-wider text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Torna al diario
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/journal" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Torna al diario
      </Link>

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-heading text-2xl md:text-3xl tracking-wide mb-2">{reading.title || "Lettura"}</h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-body text-muted-foreground">
          <span>{reading.deck_name}</span>
          <span>·</span>
          <span>{reading.reading_type_name}</span>
          <span>·</span>
          <span>{new Date(reading.created_date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        {reading.question && (
          <p className="font-body text-xl italic text-foreground/80 mt-6 max-w-2xl mx-auto">
            "{reading.question}"
          </p>
        )}
      </div>

      {/* Cards + Interpretation unified */}
      <ReadingView cards={reading.cards} interpretation={reading.interpretation} />

      {/* Personal Notes */}
      <div className="mt-8 bg-card border border-border/30 rounded-xl p-6">
        <h2 className="font-heading text-base tracking-wide mb-4">Note Personali</h2>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="font-body text-base min-h-[100px]"
          placeholder="Aggiungi le tue riflessioni personali..."
        />
        <Button onClick={saveNotes} variant="outline" disabled={!notesDirty} className="mt-3 font-heading tracking-wider text-xs select-none">
          {notesDirty ? "Salva Note" : "Salvato ✓"}
        </Button>
      </div>

      {/* Sharing */}
      <div className="mt-6 bg-card border border-border/30 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <Share2 className="w-4 h-4 text-primary" />
          <Switch checked={reading.is_shared} onCheckedChange={toggleShare} />
          <Label className="font-body">
            {reading.is_shared ? "Condivisione attiva" : "Condividi lettura"}
          </Label>
        </div>
        {reading.is_shared && (
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-secondary px-3 py-2 rounded-lg text-sm font-mono text-muted-foreground truncate">
              {window.location.origin}/shared/{reading.share_id}
            </code>
            <Button variant="outline" size="sm" onClick={copyShareLink} className="shrink-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadingView({ cards, interpretation }) {
  return (
    <div className="space-y-6">
      {/* Cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(cards || []).map((card, i) => (
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

      {/* Interpretation woven in */}
      {interpretation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card/50 border border-border/20 rounded-xl p-6 md:p-8"
        >
          <div className="font-body text-lg leading-relaxed text-foreground/90 prose prose-invert max-w-none">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
