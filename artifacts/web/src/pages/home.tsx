import { motion, type Variants } from "framer-motion";
import { Link } from "wouter";
import {
  Palette,
  Coffee,
  Camera,
  Gem,
  Scissors,
  Leaf,
  Shirt,
  Star,
  MapPin,
  Calendar,
  Clock,
  Instagram,
  Facebook,
  Map,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// @ts-ignore
import heroImg from "../assets/images/hero.png";
// @ts-ignore
import spotlight1Img from "../assets/images/spotlight-1.png";
// @ts-ignore
import spotlight2Img from "../assets/images/spotlight-2.png";

export default function Home() {
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-secondary/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <a href="#" className="font-serif font-bold text-2xl tracking-tight text-primary flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                Sauga Artisan Festival
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-foreground hover:text-accent transition-colors font-medium">About</a>
              <a href="#details" className="text-foreground hover:text-accent transition-colors font-medium">Details</a>
              <a href="#vendors" className="text-foreground hover:text-accent transition-colors font-medium">Vendors</a>
              <Link href="/apply">
                <Button className="bg-primary hover:bg-[#4A1F6B] text-white rounded-full px-6 py-5 text-base shadow-md transition-all hover:scale-105">
                  Apply as a Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-white to-muted/80 z-10 mix-blend-overlay"></div>
          {heroImg ? (
            <img src={heroImg} alt="Sauga Artisan Festival scene" className="w-full h-full object-cover opacity-30" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-muted"></div>
          )}
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary font-medium text-sm mb-6 border border-primary/10">
              <Star className="h-4 w-4 text-accent" />
              <span>Call for Independent Makers</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-serif font-bold text-primary mb-6 leading-tight">
              Share your craft with the <span className="text-accent italic">community.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-foreground/80 mb-10 leading-relaxed max-w-2xl">
              Join us for a curated outdoor artisan market celebrating handmade goods, creativity, and local craftsmanship.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-primary hover:bg-[#4A1F6B] text-white rounded-full px-8 py-7 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  Apply as a Vendor
                </Button>
              </Link>
              <a href="#about">
                <Button variant="outline" size="lg" className="rounded-full px-8 py-7 text-lg border-primary/20 text-primary hover:bg-primary/5 transition-all">
                  Learn About the Event
                </Button>
              </a>
            </motion.div>

            <motion.div variants={fadeIn} className="mt-12 flex items-center gap-6 text-sm font-medium text-foreground/70">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Saturday, August 9, 2025
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Mississauga, ON
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. Vendor Invitation Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-primary mb-6">Your work deserves to be seen.</h2>
            <p className="text-lg text-foreground/70">
              We are looking for passionate makers, artists, and independent brands to create a vibrant, high-quality shopping experience for our community.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { icon: Palette, label: "Art & Painting" },
              { icon: Coffee, label: "Ceramics & Pottery" },
              { icon: Gem, label: "Handmade Jewelry" },
              { icon: Scissors, label: "Textiles & Fiber" },
              { icon: Camera, label: "Illustration" },
              { icon: Leaf, label: "Plants & Botanicals" },
              { icon: Shirt, label: "Clothing & Apparel" },
              { icon: Star, label: "Candles & Goods" },
            ].map((category, idx) => (
              <motion.div key={idx} variants={fadeIn} className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-2xl border border-secondary hover:bg-secondary/60 transition-colors cursor-default">
                <category.icon className="h-10 w-10 text-accent mb-4" strokeWidth={1.5} />
                <span className="font-medium text-primary text-center">{category.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { title: "Strong Community", desc: "Connect with fellow artisans and engaged locals who appreciate handmade goods." },
              { title: "Supportive Environment", desc: "We handle the marketing and logistics so you can focus on sharing your craft." },
              { title: "Curated Vendor Mix", desc: "Thoughtfully selected participants to ensure variety and quality across the market." },
              { title: "Beautiful Setting", desc: "A scenic outdoor venue designed to make your products look their absolute best." },
            ].map((benefit, idx) => (
              <motion.div key={idx} variants={fadeIn} className="p-8 rounded-3xl bg-muted relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-accent transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out"></div>
                <h3 className="text-xl font-serif font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Event Details Section */}
      <section id="details" className="py-24 bg-secondary/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-4xl font-serif font-bold text-primary mb-8">Event Details</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Calendar className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary font-serif">Saturday, August 9, 2025</h4>
                    <p className="text-foreground/70 mt-1">Mark your calendars for our inaugural event.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary font-serif">10:00 AM – 5:00 PM</h4>
                    <p className="text-foreground/70 mt-1">Vendor load-in begins at 7:30 AM.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary font-serif">Mississauga, ON</h4>
                    <p className="text-foreground/70 mt-1">Exact venue details shared upon acceptance.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-primary/10">
                  <p className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-secondary text-primary font-bold shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Public Entry is FREE
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-xl border border-secondary p-2"
            >
              <div className="w-full h-full bg-gradient-to-br from-muted via-secondary to-white rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5A2D82 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <Map className="h-16 w-16 text-primary/30 mb-4" />
                <div className="relative z-10 bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-accent animate-bounce" />
                  <div>
                    <div className="font-bold text-primary font-serif">Mississauga, ON</div>
                    <div className="text-xs text-foreground/60">Event Location</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Vendor Spotlight Section */}
      <section className="py-24 bg-[#F4EEFB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-xs mb-3">
                <Star className="h-3 w-3" />
                <span>New vendors featured weekly</span>
              </div>
              <h2 className="text-4xl font-serif font-bold text-primary">Vendor Spotlight</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="bg-white rounded-3xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted">
                {spotlight1Img ? (
                  <img src={spotlight1Img} alt="Ceramic artisan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-secondary to-muted"></div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full">
                  Ceramics
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-bold text-primary mb-2">Earth & Fire Studio</h3>
                <p className="text-foreground/70 mb-6 line-clamp-2">
                  Hand-thrown functional ceramics inspired by nature. Each piece is unique and crafted with locally sourced clay and custom glazes.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-accent hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="bg-white rounded-3xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted">
                {spotlight2Img ? (
                  <img src={spotlight2Img} alt="Baker" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-secondary to-muted"></div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full">
                  Baked Goods
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-bold text-primary mb-2">Wildflower Bakery</h3>
                <p className="text-foreground/70 mb-6 line-clamp-2">
                  Small-batch artisan sourdough and botanical pastries made with organic, locally milled flour and seasonal ingredients.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-accent hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Our Growing Lineup Section */}
      <section id="vendors" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">Our Growing Lineup</h2>
            <p className="text-lg text-foreground/70">Join these amazing local brands at the market.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="aspect-square rounded-2xl bg-secondary/30 border border-secondary/50 flex flex-col items-center justify-center p-6 hover:bg-secondary/60 transition-colors cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="font-serif font-bold text-accent text-xl">V{i + 1}</span>
                </div>
                <span className="font-medium text-primary text-center">Vendor Brand</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. About the Event Section */}
      <section className="py-24 bg-[#E6D9F5]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <Star className="h-10 w-10 text-accent mx-auto mb-8" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-8 leading-snug">
            "We believe in the power of handmade. This market is a celebration of the makers who pour their heart into their craft."
          </h2>
          <p className="text-lg text-primary/80 leading-relaxed max-w-2xl mx-auto">
            The Sauga Artisan Festival was born from a desire to connect talented local creators with a community that values authenticity and craftsmanship. We're building more than just a shopping destination—we're creating an experience where stories are shared and creativity thrives.
          </p>
        </div>
      </section>

      {/* 8. Vendor CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#4A1F6B] z-0"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8">Ready to Share Your Craft?</h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Applications are reviewed on a rolling basis. Secure your spot at this summer's most anticipated maker event.
            </p>
            <Link href="/apply">
              <Button size="lg" className="bg-white text-primary hover:bg-secondary rounded-full px-10 py-8 text-xl font-bold shadow-2xl hover:shadow-white/20 transition-all hover:scale-105">
                Apply as a Vendor Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white py-12 border-t border-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <a href="#" className="font-serif font-bold text-xl text-primary flex items-center justify-center md:justify-start gap-2 mb-2">
                <Star className="h-4 w-4 text-accent" />
                Sauga Artisan Festival
              </a>
              <p className="text-foreground/60 text-sm">Organized by the Sauga Artisan Festival Collective</p>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-foreground/60 hover:text-accent transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-accent transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-secondary/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/50">
            <p>art@saugaartisanfest.ca</p>
            <p>© 2025 Sauga Artisan Festival. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
