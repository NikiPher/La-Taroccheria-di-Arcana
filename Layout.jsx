import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, Settings, Star, Home, Layers, User, LogOut, Trash2, ArrowLeft, Instagram, Facebook, Newspaper } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/i18n";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === "admin";

  const TAB_ROUTES = ["/", "/new-reading", "/journal", "/gallery", "/news"];
  const isTabRoute = TAB_ROUTES.includes(location.pathname);

  // Scroll position preservation per tab
  const scrollPositions = useRef({});
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    const prev = prevPathname.current;
    const next = location.pathname;
    // Save scroll position of the page we're leaving
    if (TAB_ROUTES.includes(prev)) {
      scrollPositions.current[prev] = window.scrollY;
    }
    // Restore scroll position for the new tab, or go to top
    if (TAB_ROUTES.includes(next)) {
      const saved = scrollPositions.current[next] ?? 0;
      requestAnimationFrame(() => window.scrollTo(0, saved));
    } else {
      window.scrollTo(0, 0);
    }
    prevPathname.current = next;
  }, [location.pathname]);

  const navItems = [
    { to: "/", label: t("home", lang), icon: Home },
    { to: "/new-reading", label: t("new_reading", lang), icon: Plus },
    { to: "/journal", label: t("journal", lang), icon: BookOpen },
    { to: "/gallery", label: t("gallery", lang), icon: Layers },
    { to: "/news", label: t("news", lang), icon: Newspaper },
  ];

  const adminItems = [
    { to: "/admin/decks", label: t("decks", lang), icon: Settings },
    { to: "/admin/reading-types", label: t("reading_types", lang), icon: Star },
  ];

  const handleLogout = () => base44.auth.logout();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isTabRoute && (
              <button
                onClick={() => navigate(-1)}
                className="select-none p-1.5 text-muted-foreground hover:text-foreground transition-colors md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-heading text-lg tracking-wider text-foreground">La TAROCCHERIA DI ARCANA</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} item={item} active={location.pathname === item.to} />
            ))}
            {isAdmin && (
              <>
                <div className="w-px h-6 bg-border mx-2" />
                {adminItems.map((item) => (
                  <NavLink key={item.to} item={item} active={location.pathname === item.to} />
                ))}
              </>
            )}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <button
              onClick={() => setLang(lang === "it" ? "en" : "it")}
              className="select-none text-xs font-heading px-2 py-1 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              {lang === "it" ? "EN" : "IT"}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                className="select-none flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-body">{user?.full_name?.split(' ')[0] || t("profile", lang)}</span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {isAdmin && (
                      <>
                        <div className="px-4 py-2 text-xs font-heading text-muted-foreground uppercase tracking-wider">{t("admin", lang)}</div>
                        {adminItems.map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setUserMenuOpen(false)}
                            className="select-none w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                          >
                            <item.icon className="w-4 h-4" /> {item.label}
                          </Link>
                        ))}
                        <div className="h-px bg-border" />
                      </>
                    )}
                    <button
                      onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                      className="select-none w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    >
                      <LogOut className="w-4 h-4" /> {t("logout", lang)}
                    </button>
                    <div className="h-px bg-border" />
                    <button
                      onClick={() => { setDeleteDialogOpen(true); setUserMenuOpen(false); }}
                      className="select-none w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> {t("delete_account", lang)}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet context={{ lang, isAdmin }} />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => { if (active) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`select-none flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all min-h-[44px] ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-body">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={lang === "en" ? "Delete Account" : "Elimina Account"}
        description={lang === "en" ? "Are you sure you want to delete your account? This action is irreversible." : "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile."}
        confirmLabel={lang === "en" ? "Delete" : "Elimina"}
        cancelLabel={lang === "en" ? "Cancel" : "Annulla"}
        onConfirm={handleDeleteAccount}
        destructive
      />

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 text-center hidden md:block">
        <p className="text-sm text-muted-foreground font-body mb-4">
          ✦ Taroccheria di Arcana — Il tuo viaggio nei tarocchi ✦
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="https://www.instagram.com/arcanamjr/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <Instagram className="w-4 h-4" /> Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61577542974146" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <Facebook className="w-4 h-4" /> Facebook
          </a>
          <a href="https://arcanamajor.gumroad.com/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <span className="text-sm">🛍</span> Gumroad
          </a>
          <a href="https://lataroccheria-di-arcana.qpmarketnetwork.com/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <span className="text-sm">🌙</span> QP Market
          </a>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      <Icon className="w-4 h-4" />
      {item.label}
    </Link>
  );
}
