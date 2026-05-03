import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ReadingTypeManager() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", num_cards: 3, positions: [], is_active: true });

  useEffect(() => { loadTypes(); }, []);

  const loadTypes = async () => {
    setLoading(true);
    const data = await base44.entities.ReadingType.list();
    setTypes(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", num_cards: 3, positions: [
      { index: 0, label: "Posizione 1", description: "" },
      { index: 1, label: "Posizione 2", description: "" },
      { index: 2, label: "Posizione 3", description: "" },
    ], is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (type) => {
    setEditing(type);
    setForm({
      name: type.name,
      description: type.description || "",
      num_cards: type.num_cards,
      positions: type.positions || [],
      is_active: type.is_active !== false,
    });
    setDialogOpen(true);
  };

  const updateNumCards = (n) => {
    const num = Math.max(1, Math.min(20, parseInt(n) || 1));
    const positions = Array.from({ length: num }, (_, i) => (
      form.positions[i] || { index: i, label: `Posizione ${i + 1}`, description: "" }
    ));
    setForm(p => ({ ...p, num_cards: num, positions }));
  };

  const updatePosition = (index, field, value) => {
    setForm(p => ({
      ...p,
      positions: p.positions.map((pos, i) => i === index ? { ...pos, [field]: value } : pos)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, positions: form.positions.map((p, i) => ({ ...p, index: i })) };
    if (editing) {
      await base44.entities.ReadingType.update(editing.id, data);
    } else {
      await base44.entities.ReadingType.create(data);
    }
    setSaving(false);
    setDialogOpen(false);
    loadTypes();
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminare questo tipo di lettura?")) return;
    await base44.entities.ReadingType.delete(id);
    loadTypes();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl tracking-wide">Tipi di Lettura</h1>
          <p className="font-body text-muted-foreground text-lg mt-1">Configura le disposizioni delle carte</p>
        </div>
        <Button onClick={openNew} className="font-heading tracking-wider text-xs">
          <Plus className="w-4 h-4 mr-2" /> Nuovo Tipo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-20">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-lg text-muted-foreground">Nessun tipo di lettura creato</p>
          <Button onClick={openNew} variant="outline" className="mt-4 font-heading tracking-wider text-xs">
            <Plus className="w-4 h-4 mr-2" /> Crea il primo tipo
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map(type => (
            <div key={type.id} className="bg-card border border-border/30 rounded-xl p-6 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading text-sm tracking-wide">{type.name}</h3>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(type)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(type.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {type.description && (
                <p className="font-body text-muted-foreground text-sm mb-3 line-clamp-2">{type.description}</p>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-heading">
                  {type.num_cards} carte
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${type.is_active !== false ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {type.is_active !== false ? 'Attivo' : 'Inattivo'}
                </span>
              </div>
              {type.positions && type.positions.length > 0 && (
                <div className="mt-3 space-y-1">
                  {type.positions.map((pos, i) => (
                    <p key={i} className="text-xs text-muted-foreground font-body">
                      {i + 1}. {pos.label}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wide">
              {editing ? "Modifica Tipo di Lettura" : "Nuovo Tipo di Lettura"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-heading text-xs tracking-wider">Nome</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 font-body" placeholder="es. Croce Celtica" />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Descrizione</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 font-body" rows={2} />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider">Numero di Carte</Label>
              <Input type="number" min={1} max={20} value={form.num_cards} onChange={e => updateNumCards(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="font-heading text-xs tracking-wider mb-2 block">Posizioni</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {form.positions.map((pos, i) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-heading w-6">{i + 1}.</span>
                      <Input
                        value={pos.label}
                        onChange={e => updatePosition(i, "label", e.target.value)}
                        className="font-body text-sm"
                        placeholder="Nome posizione"
                      />
                    </div>
                    <Input
                      value={pos.description}
                      onChange={e => updatePosition(i, "description", e.target.value)}
                      className="font-body text-sm ml-8"
                      placeholder="Descrizione (opzionale)"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
              <Label className="font-body">Attivo</Label>
            </div>
            <Button onClick={handleSave} disabled={!form.name || saving} className="w-full font-heading tracking-wider text-xs">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Salva" : "Crea Tipo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
