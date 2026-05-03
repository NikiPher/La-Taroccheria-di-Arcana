import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CardManager from "../../components/admin/CardManager";

export default function DeckManager() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });

  useEffect(() => { loadDecks(); }, []);

  const loadDecks = async () => {
    setLoading(true);
    const data = await base44.entities.TarotDeck.list();
    setDecks(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditingDeck(null);
    setForm({ name: "", description: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (deck) => {
    setEditingDeck(deck);
    setForm({ name: deck.name, description: deck.description || "", is_active: deck.is_active !== false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editingDeck) {
      await base44.entities.TarotDeck.update(editingDeck.id, form);
    } else {
      await base44.entities.TarotDeck.create(form);
    }
    setSaving(false);
    setDialogOpen(false);
    loadDecks();
  };

  const handleDelete = async (id) => {
    if (!confirm("Sei sicuro di voler eliminare questo mazzo e tutte le sue carte?")) return;
    const cards = await base44.entities.TarotCard.filter({ deck_id: id });
    for (const card of cards) {
      await base44.entities.TarotCard.delete(card.id);
    }
    await base44.entities.TarotDeck.delete(id);
    if (selectedDeck?.id === id) setSelectedDeck(null);
    loadDecks();
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, cover_image: file_url }));
  };

  const handleBackUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, card_back_image: file_url }));
  };

  if (selectedDeck) {
    return <CardManager deck={selectedDeck} onBack={() => setSelectedDeck(null)} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl tracking-wide">Gestione Mazzi</h1>
          <p className="font-body text-muted-foreground text-lg mt-1">Crea e gestisci i tuoi mazzi di tarocchi</p>
        </div>
        <Button onClick={openNew} className="font-heading tracking-wider text-xs">
          <Plus className="w-4 h-4 mr-2" /> Nuovo Mazzo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-20">
          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-lg text-muted-foreground">Nessun mazzo creato</p>
          <Button onClick={openNew} variant="outline" className="mt-4 font-heading tracking-wider text-xs">
            <Plus className="w-4 h-4 mr-2" /> Crea il primo mazzo
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <div
              key={deck.id}
              className="bg-card border border-border/30 rounded-xl overflow-hidden hover:border-primary/30 transition-all group"
            >
              <div
                className="h-40 bg-secondary flex items-center justify-center cursor-pointer"
                onClick={() => setSelectedDeck(deck)}
              >
                {deck.cover_image ? (
                  <img src={deck.cover_image} alt={deck.name} className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer" onClick={() => setSelectedDeck(deck)}>
                    <h3 className="font-heading text-sm tracking-wide">{deck.name}</h3>
                    {deck.description && (
                      <p className="font-body text-muted-foreground text-sm mt-1 line-clamp-2">{deck.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button onClick={() => openEdit(deck)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(deck.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${deck.is_active !== false ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {deck.is_active !== false ? 'Attivo' : 'Inattivo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">
              {editingDeck ? "Modifica Mazzo" : "Nuovo Mazzo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-heading text-xs tracking-wider">Nome</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="mt-1 font-body"
                placeholder="es. Rider-Waite-Smith"
              />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Descrizione</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="mt-1 font-body"
                rows={3}
              />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Immagine Copertina</Label>
              <Input type="file" accept="image/*" onChange={handleCoverUpload} className="mt-1" />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Immagine Dorso Carta</Label>
              <Input type="file" accept="image/*" onChange={handleBackUpload} className="mt-1" />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))}
              />
              <Label className="font-body">Attivo</Label>
            </div>
            <Button onClick={handleSave} disabled={!form.name || saving} className="w-full font-heading tracking-wider text-xs">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingDeck ? "Salva Modifiche" : "Crea Mazzo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
