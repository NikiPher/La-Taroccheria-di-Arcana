import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Loader2, Plus, Pencil, Trash2, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";

export default function News({ lang = "it", isAdmin = false }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", title_en: "", content: "", content_en: "", image: "", is_published: true, pinned: false });

  useEffect(() => { loadNews(); }, []);

  const loadNews = async () => {
    setLoading(true);
    const all = await base44.entities.News.list("-created_date", 50);
    setNews(isAdmin ? all : all.filter(n => n.is_published));
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", title_en: "", content: "", content_en: "", image: "", is_published: true, pinned: false });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title || "", title_en: item.title_en || "", content: item.content || "", content_en: item.content_en || "", image: item.image || "", is_published: item.is_published ?? true, pinned: item.pinned ?? false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    if (editing) {
      await base44.entities.News.update(editing.id, form);
    } else {
      await base44.entities.News.create(form);
    }
    setDialogOpen(false);
    loadNews();
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminare questa notizia?")) return;
    await base44.entities.News.delete(id);
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image: file_url }));
    setUploading(false);
  };

  const sorted = [...news].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl tracking-wide">{t("news_title", lang)}</h1>
          <p className="font-body text-muted-foreground text-lg mt-1">{t("news_subtitle", lang)}</p>
        </div>
        {isAdmin && (
          <Button onClick={openNew} className="font-heading tracking-wider text-xs">
            <Plus className="w-4 h-4 mr-2" /> {t("new_news", lang)}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-body text-lg text-muted-foreground">{t("no_news", lang)}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sorted.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/30 rounded-xl overflow-hidden"
            >
              {item.image && (
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-heading mb-2">
                        <Pin className="w-3 h-3" /> {t("pinned", lang)}
                      </span>
                    )}
                    <h2 className="font-heading text-lg tracking-wide">
                      {lang === "en" && item.title_en ? item.title_en : item.title}
                    </h2>
                    <p className="font-body text-muted-foreground text-sm mt-1">
                      {new Date(item.created_date).toLocaleDateString(lang === "en" ? "en-GB" : "it-IT", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="font-body text-foreground/80 mt-3 leading-relaxed whitespace-pre-wrap">
                      {lang === "en" && item.content_en ? item.content_en : item.content}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editing ? t("edit", lang) : t("new_news", lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="font-body text-xs">{t("title", lang)} (IT)</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 font-body" />
            </div>
            <div>
              <Label className="font-body text-xs">{t("title_en", lang)}</Label>
              <Input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))} className="mt-1 font-body" />
            </div>
            <div>
              <Label className="font-body text-xs">{t("content", lang)} (IT)</Label>
              <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="mt-1 font-body min-h-[100px]" />
            </div>
            <div>
              <Label className="font-body text-xs">{t("content_en", lang)}</Label>
              <Textarea value={form.content_en} onChange={e => setForm(p => ({ ...p, content_en: e.target.value }))} className="mt-1 font-body min-h-[100px]" />
            </div>
            <div>
              <Label className="font-body text-xs">{t("add_image", lang)}</Label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 text-xs font-body text-muted-foreground" />
              {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary mt-1" />}
              {form.image && <img src={form.image} className="mt-2 rounded-lg w-full h-32 object-cover" />}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))} />
                <Label className="font-body text-xs">{t("published", lang)}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.pinned} onCheckedChange={v => setForm(p => ({ ...p, pinned: v }))} />
                <Label className="font-body text-xs">{t("pinned", lang)}</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1 font-heading tracking-wider text-xs">{t("save", lang)}</Button>
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="font-body">{t("cancel", lang)}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
