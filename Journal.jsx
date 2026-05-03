import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, BookOpen, Plus, Search, Calendar, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Journal() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadReadings(); }, []);

  const loadReadings = async () => {
    setLoading(true);
    const data = await base44.entities.Reading.list("-created_date", 100);
    setReadings(data);
    setLoading(false);
  };

  const { refreshing, containerRef, onTouchStart, onTouchEnd } = usePullToRefresh(loadReadings);

  const handleDeleteClick = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    setReadings(prev => prev.filter(r => r.id !== deleteTarget));
    base44.entities.Reading.delete(deleteTarget);
    setDeleteTarget(null);
  };

  const filtered = readings.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.title || "").toLowerCase().includes(q) ||
      (r.question || "").toLowerCase().includes(q) ||
      (r.deck_name || "").toLowerCase().includes(q) ||
      (r.reading_type_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
    <ConfirmDialog
      open={!!deleteTarget}
      onOpenChange={(open) => !open && setDeleteTarget(null)}
      title="Elimina Lettura"
      description="Vuoi eliminare questa lettura? L'azione è irreversibile."
      confirmLabel="Elimina"
      onConfirm={confirmDelete}
      destructive
    />
    <div
      ref={containerRef}
      className="max-w-5xl mx-auto px-4 py-8"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {refreshing && (
        <div className="flex justify-center pb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl tracking-wide">Il Mio Diario</h1>
          <p className="font-body text-muted-foreground text-lg mt-1">Le tue letture dei tarocchi</p>
        </div>
        <Link to="/new-reading">
          <Button className="font-heading tracking-wider text-xs">
            <Plus className="w-4 h-4 mr-2" /> Nuova Lettura
          </Button>
        </Link>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 font-body"
          placeholder="Cerca nelle tue letture..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : readings.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-lg text-muted-foreground">Il tuo diario è ancora vuoto</p>
          <p className="font-body text-muted-foreground/70 mt-1">Inizia la tua prima lettura per riempirlo di saggezza</p>
          <Link to="/new-reading">
            <Button variant="outline" className="mt-6 font-heading tracking-wider text-xs">
              <Sparkles className="w-4 h-4 mr-2" /> Prima Lettura
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-lg text-muted-foreground">Nessun risultato per "{search}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reading, i) => (
            <motion.div
              key={reading.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/reading/${reading.id}`}
                className="block bg-card border border-border/30 rounded-xl p-5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm tracking-wide group-hover:text-primary transition-colors truncate">
                      {reading.title || "Lettura"}
                    </h3>
                    {reading.question && (
                      <p className="font-body text-muted-foreground text-sm mt-1 italic line-clamp-1">
                        "{reading.question}"
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground/70 font-body">
                        {reading.deck_name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body">
                        {reading.reading_type_name}
                      </span>
                      <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(reading.created_date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {reading.cards && (
                        <span className="text-xs text-muted-foreground font-body">
                          {reading.cards.length} carte
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(reading.id, e)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
