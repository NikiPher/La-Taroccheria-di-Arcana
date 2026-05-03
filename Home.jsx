import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Plus, Star, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36 px-4">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://media.base44.com/images/public/69ce32642d83d77b2832ce36/5b4b5f3b1_bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top'
          }} />
        
        <div className="absolute inset-0 bg-background/75" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            
            <div className="flex justify-center mb-8">
              <div className="relative">
                
                
              </div>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl tracking-wide text-foreground mb-6">La Taroccheria di Arcana

            </h1>
            <p className="font-body text-xl md:text-2xl text-muted-foreground mb-4 italic">
              La tua lettura personale dei tarocchi
            </p>
            <p className="font-body text-lg text-muted-foreground/70 max-w-xl mx-auto mb-12">
              Scegli il tuo mazzo, seleziona le carte con intenzione e ricevi interpretazioni profonde per guidare il tuo cammino.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <Link to="/new-reading">
              <Button size="lg" className="font-heading tracking-wider text-sm glow-gold w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nuova Lettura
              </Button>
            </Link>
            <Link to="/journal">
              <Button size="lg" variant="outline" className="font-heading tracking-wider text-sm w-full sm:w-auto border-border/50 hover:border-primary/50">
                <BookOpen className="w-4 h-4 mr-2" />
                Il Mio Diario
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>);

}
