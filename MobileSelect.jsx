import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export default function MobileSelect({ value, onValueChange, placeholder, options, label }) {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const selected = options.find(o => o.value === value);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="mt-1"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="mt-1 w-full flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm font-body text-foreground shadow-sm"
      >
        <span>{selected?.label || placeholder}</span>
        <span className="text-muted-foreground">▾</span>
      </button>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-heading tracking-wide text-sm">{label}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-1 pb-8">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onValueChange(o.value); setDrawerOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-body text-sm transition-all ${
                  value === o.value ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
