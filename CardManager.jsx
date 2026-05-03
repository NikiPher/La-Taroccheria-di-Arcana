import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import MobileSelect from "@/components/MobileSelect";

const EMPTY_CARD = {
  name: "", arcana_type: "major", suit: "none", number: 0,
  upright_meaning: "", reversed_meaning: "", keywords: "", sort_order: 0
};

export default function CardManager({ deck, onBack }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [form, setForm] = useState(EMPTY_CARD);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCards(); }, [deck.id]);

  const loadCards = async () => {
    setLoading(true);
    const data = await base44.entities.TarotCard.filter({ deck_id: deck.id }, 'sort_order');
    setCards(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditingCard(null);
    setForm({ ...EMPTY_CARD, sort_order: cards.length });
    setDialogOpen(true);
  };

  const openEdit = (card) => {
    setEditingCard(card);
    setForm({
      name: card.name, arcana_type: card.arcana_type || "major",
      suit: card.suit || "none", number: card.number || 0,
      upright_meaning: card.upright_meaning || "",
      reversed_meaning: card.reversed_meaning || "",
      keywords: card.keywords || "", sort_order: card.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image: file_url }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, deck_id: deck.id };
    if (editingCard) {
      await base44.entities.TarotCard.update(editingCard.id, data);
    } else {
      await base44.entities.TarotCard.create(data);
    }
    setSaving(false);
    setDialogOpen(false);
    loadCards();
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminare questa carta?")) return;
    await base44.entities.TarotCard.delete(id);
    loadCards();
  };

  const suitLabels = { none: "—", wands: "Bastoni", cups: "Coppe", swords: "Spade", pentacles: "Denari" };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Torna ai mazzi
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl tracking-wide">{deck.name}</h1>
          <p className="font-body text-muted-foreground text-lg mt-1">{cards.length} carte</p>
        </div>
        <Button onClick={openNew} className="font-heading tracking-wider text-xs">
          <Plus className="w-4 h-4 mr-2" /> Nuova Carta
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-body text-lg text-muted-foreground">Nessuna carta in questo mazzo</p>
          <Button onClick={openNew} variant="outline" className="mt-4 font-heading tracking-wider text-xs">
            <Plus className="w-4 h-4 mr-2" /> Aggiungi la prima carta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cards.map(card => (
            <div key={card.id} className="bg-card border border-border/30 rounded-lg overflow-hidden group hover:border-primary/30 transition-all">
              <div className="aspect-[2/3] bg-secondary flex items-center justify-center relative">
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-heading text-xs text-muted-foreground text-center px-2">{card.name}</span>
                )}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(card)} className="p-2 bg-primary/20 rounded-full text-primary hover:bg-primary/30">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(card.id)} className="p-2 bg-destructive/20 rounded-full text-destructive hover:bg-destructive/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-2 text-center">
                <p className="font-heading text-xs tracking-wide truncate">{card.name}</p>
                <p className="text-xs text-muted-foreground font-body">{card.arcana_type === "major" ? "Arcano Maggiore" : suitLabels[card.suit]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">
              {editingCard ? "Modifica Carta" : "Nuova Carta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-heading text-xs tracking-wider">Nome</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 font-body" placeholder="es. Il Matto" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-heading text-xs tracking-wider">Tipo Arcano</Label>
                <MobileSelect
                  label="Tipo Arcano"
                  value={form.arcana_type}
                  onValueChange={v => setForm(p => ({ ...p, arcana_type: v }))}
                  options={[
                    { value: "major", label: "Arcano Maggiore" },
                    { value: "minor", label: "Arcano Minore" },
                  ]}
                />
              </div>
              <div>
                <Label className="font-heading text-xs tracking-wider">Seme</Label>
                <MobileSelect
                  label="Seme"
                  value={form.suit}
                  onValueChange={v => setForm(p => ({ ...p, suit: v }))}
                  options={[
                    { value: "none", label: "Nessuno" },
                    { value: "wands", label: "Bastoni" },
                    { value: "cups", label: "Coppe" },
                    { value: "swords", label: "Spade" },
                    { value: "pentacles", label: "Denari" },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-heading text-xs tracking-wider">Numero</Label>
                <Input type="number" value={form.number} onChange={e => setForm(p => ({ ...p, number: parseInt(e.target.value) || 0 }))} className="mt-1" />
              </div>
              <div>
                <Label className="font-heading text-xs tracking-wider">Ordine</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Immagine</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Significato Dritto</Label>
              <Textarea value={form.upright_meaning} onChange={e => setForm(p => ({ ...p, upright_meaning: e.target.value }))} className="mt-1 font-body" rows={2} />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Significato Rovescio</Label>
              <Textarea value={form.reversed_meaning} onChange={e => setForm(p => ({ ...p, reversed_meaning: e.target.value }))} className="mt-1 font-body" rows={2} />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Parole Chiave</Label>
              <Input value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} className="mt-1 font-body" placeholder="es. libertà, inizio, avventura" />
            </div>
            <Button onClick={handleSave} disabled={!form.name || saving} className="w-full font-heading tracking-wider text-xs">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingCard ? "Salva" : "Crea Carta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
