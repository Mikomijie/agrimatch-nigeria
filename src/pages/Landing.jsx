import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LeafIcon } from '../components/NavIcons'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

function AnimatedSection({ children, className = '' }) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      {children}
    </motion.section>
  )
}

function Counter({ value, suffix = '' }) {
  return (
    <motion.p
      className="font-[var(--font-heading)] text-4xl md:text-5xl font-bold text-[var(--color-secondary)]"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {value}{suffix}
    </motion.p>
  )
}

function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-primary-dark)] backdrop-blur-sm border-b border-black/10">
        <span className="font-[var(--font-heading)] italic text-2xl text-white flex items-center gap-2">
          <LeafIcon className="text-[var(--color-primary-light)]" />
          AgriMatch
        </span>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">Marketplace</Link>
          <Link to="/bulk-order" className="text-white/80 hover:text-white transition-colors">Bulk Orders</Link>
          <Link to="/ussd" className="text-white/80 hover:text-white transition-colors">USSD</Link>
        </nav>
        <Link
          to="/auth"
          className="text-xs font-semibold text-white border-2 border-white/40 px-4 py-2 rounded-lg hover:border-white/80 transition-colors"
        >
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <section
        className="relative h-[500px] md:h-[620px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/hero-nigeria-farming.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <motion.div
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="text-[var(--color-primary-light)] text-xs font-bold tracking-widest uppercase mb-4">
            Nigeria's Harvest Coordination Platform
          </p>
          <h1 className="font-[var(--font-heading)] text-4xl md:text-6xl text-white leading-tight mb-6">
            Sell your harvest <span className="italic">before you pick it.</span>
          </h1>
          <p className="text-white/85 text-lg max-w-xl mx-auto mb-8">
            Escrow-backed payments. Automatic order pooling across farmers. Verified delivery with photos. Built for Nigerian agriculture.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                to="/auth"
                className="inline-block bg-[var(--color-secondary)] text-white px-8 py-3 rounded-md font-bold tracking-wide hover:brightness-95 transition-all"
              >
                START FOR FREE
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                to="/marketplace"
                className="inline-block bg-white/10 border border-white/40 text-white px-8 py-3 rounded-md font-bold tracking-wide hover:bg-white/20 transition-all"
              >
                BROWSE MARKETPLACE
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="bg-[var(--color-primary)] text-white px-6 md:px-10 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs md:text-sm tracking-wide font-semibold">
        <span>🔒 ESCROW PROTECTION ON EVERY ORDER</span>
        <span>⚡ PRE-ORDER HARVESTS BEFORE THEY'RE PICKED</span>
        <span>🚛 VERIFIED DELIVERY WITH PHOTO PROOF</span>
      </section>

      {/* Three role sections */}
      <AnimatedSection className="bg-[var(--color-surface)] px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
              Built for everyone in the value chain
            </h2>
            <p className="mt-3 text-[var(--color-charcoal)]/70 max-w-xl mx-auto text-sm">
              Farmers, buyers, and transporters each get tools built specifically for their role.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="bg-[var(--color-primary-light)]/30 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <p className="text-xs font-semibold text-[var(--color-primary-dark)] tracking-wide mb-4">
                01 / FOR FARMERS
              </p>
              <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-primary-dark)] mb-4">
                Know your buyer before you harvest.
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-charcoal)]/80">
                <li>✓ List future harvests and get pre-orders</li>
                <li>✓ Receive payment directly — no middlemen</li>
                <li>✓ Works via USSD without smartphone</li>
                <li>✓ Real-time order notifications</li>
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="bg-[var(--color-secondary-light)]/25 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <p className="text-xs font-semibold text-[var(--color-secondary-dark)] tracking-wide mb-4">
                02 / FOR BUYERS
              </p>
              <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-secondary-dark)] mb-4">
                Order more than one farmer can supply.
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-charcoal)]/80">
                <li>✓ Pool orders automatically across farmers</li>
                <li>✓ Escrow holds your money until delivery</li>
                <li>✓ Pre-order upcoming harvests</li>
                <li>✓ Track every delivery in real time</li>
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="bg-[var(--color-moss)]/20 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <p className="text-xs font-semibold text-[var(--color-moss)] tracking-wide mb-4">
                03 / FOR TRANSPORTERS
              </p>
              <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-primary-dark)] mb-4">
                Accept loads, earn per delivery.
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-charcoal)]/80">
                <li>✓ Browse available loads near you</li>
                <li>✓ Upload pickup and delivery photos</li>
                <li>✓ Payment released on confirmed delivery</li>
                <li>✓ Build your delivery reputation</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* What makes us different */}
      <AnimatedSection className="bg-[var(--color-background-warm)] px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
              Not a marketplace. A coordination platform.
            </h2>
            <p className="mt-3 text-[var(--color-charcoal)]/70 max-w-2xl mx-auto text-sm">
              Generic marketplaces handle listings. AgriMatch handles trust, logistics, and value chain coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-lg border border-black/10 hover:shadow-lg transition-shadow group bg-[var(--color-surface)]"
            >
              <div className="w-12 h-12 bg-[var(--color-primary-light)]/40 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)] transition-colors">
                <span className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-primary-dark)] group-hover:text-white transition-colors">01</span>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-3">
                Escrow Protection
              </h3>
              <p className="text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
                Buyer pays into escrow. Farmer receives funds only after the buyer confirms delivery quality. No more payment disputes, no more cash risk.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-lg border border-black/10 hover:shadow-lg transition-shadow group bg-[var(--color-surface)]"
            >
              <div className="w-12 h-12 bg-[var(--color-secondary-light)]/40 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-secondary)] transition-colors">
                <span className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-secondary-dark)] group-hover:text-white transition-colors">02</span>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-3">
                Automatic Order Pooling
              </h3>
              <p className="text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
                Need 500kg but no single farmer has that much? AgriMatch splits your order automatically across multiple verified farmers. One order. Multiple sources. Zero coordination.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-lg border border-black/10 hover:shadow-lg transition-shadow group bg-[var(--color-surface)]"
            >
              <div className="w-12 h-12 bg-[var(--color-moss)]/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-moss)] transition-colors">
                <span className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-moss)] group-hover:text-white transition-colors">03</span>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-3">
                Future Harvest Pre-orders
              </h3>
              <p className="text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
                Farmers list crops that haven't been harvested yet. Buyers reserve and pay in advance. Farmers know their income before touching a hoe.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Animated Stats */}
      <AnimatedSection className="bg-[var(--color-surface)] px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center">
        <div>
          <Counter value="40" suffix="%" />
          <p className="text-xs text-[var(--color-charcoal)]/70 mt-2 max-w-xs mx-auto">
            Of Nigerian produce is lost annually due to broken market linkages — AgriMatch exists to eliminate this
          </p>
        </div>
        <div>
          <Counter value="3" suffix=" roles" />
          <p className="text-xs text-[var(--color-charcoal)]/70 mt-2 max-w-xs mx-auto">
            Farmers, buyers, and transporters all coordinated on one platform — no external tools needed
          </p>
        </div>
        <div>
          <Counter value="0" suffix="%" />
          <p className="text-xs text-[var(--color-charcoal)]/70 mt-2 max-w-xs mx-auto">
            Listing fee for farmers. AgriMatch earns only when farmers earn — aligned incentives from day one
          </p>
        </div>
      </AnimatedSection>

      {/* How it works */}
      <AnimatedSection className="bg-[var(--color-background-warm)] px-6 md:px-10 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
              From harvest to delivery in 4 steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Farmer Lists', desc: 'Lists fresh or upcoming harvest with price, quantity, and location.' },
              { step: '02', title: 'Buyer Orders', desc: 'Pays via escrow. Large orders are pooled across multiple farmers automatically.' },
              { step: '03', title: 'Transporter Delivers', desc: 'Accepts the load, uploads pickup photo, delivers to buyer.' },
              { step: '04', title: 'Funds Released', desc: 'Buyer confirms quality. Escrow releases payment to farmer instantly.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-[var(--font-heading)] text-white font-bold">{item.step}</span>
                </div>
                <h3 className="font-bold text-[var(--color-charcoal)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--color-charcoal)]/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* USSD CTA */}
      <AnimatedSection className="bg-[var(--color-primary-dark)] text-white px-6 md:px-10 py-16 text-center">
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <p className="text-xs font-semibold tracking-wide text-[var(--color-primary-light)] uppercase mb-3">
            Built for Rural Nigeria
          </p>
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-white">
            No smartphone? No problem.
          </h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto text-sm leading-relaxed">
            Farmers in low-connectivity areas can list produce, check orders, and receive payment alerts via USSD — the same way they check their airtime balance. Try the live simulator.
          </p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block mt-8">
            <Link
              to="/ussd"
              className="inline-block bg-white text-[var(--color-primary-dark)] px-8 py-3 rounded-md font-bold tracking-wide hover:brightness-95 transition-all"
            >
              TRY USSD SIMULATOR →
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Bulk Order CTA */}
      <AnimatedSection className="bg-[var(--color-secondary)]/10 px-6 md:px-10 py-16 text-center">
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <p className="text-xs font-semibold tracking-wide text-[var(--color-secondary-dark)] uppercase mb-3">
            For Large Buyers & Off-takers
          </p>
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
            Need a truckload? We'll pool it.
          </h2>
          <p className="mt-4 text-[var(--color-charcoal)]/70 max-w-xl mx-auto text-sm leading-relaxed">
            One request. Multiple farmers. Automatic coordination. AgriMatch finds the farmers, splits the order, and coordinates delivery — you just confirm when it arrives.
          </p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block mt-8">
            <Link
              to="/bulk-order"
              className="inline-block bg-[var(--color-secondary)] text-white px-8 py-3 rounded-md font-bold tracking-wide hover:brightness-95 transition-all"
            >
              PLACE BULK ORDER →
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Footer CTA */}
      <AnimatedSection className="text-center py-16 px-6 bg-[var(--color-background-warm)]">
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]"
        >
          The harvest is ready. <span className="italic">Are you?</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 text-[var(--color-charcoal)]/60 max-w-md mx-auto text-sm"
        >
          Join farmers, buyers, and transporters already using AgriMatch to move Nigerian produce faster, safer, and fairer.
        </motion.p>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-6 flex gap-4 justify-center flex-wrap"
        >
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              to="/auth"
              className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-md font-medium hover:brightness-95 transition-all"
            >
              JOIN AS FARMER
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              to="/auth"
              className="inline-block border border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-md font-medium hover:bg-[var(--color-primary)]/5 transition-colors"
            >
              JOIN AS BUYER
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      <footer className="border-t border-black/10 px-6 md:px-10 py-12 text-center bg-[var(--color-background-warm)]">
        <div className="max-w-2xl mx-auto">
          <p className="font-[var(--font-heading)] italic text-[var(--color-charcoal)] text-lg flex items-center justify-center gap-2">
            <LeafIcon className="text-[var(--color-primary)]" />
            AgriMatch
          </p>
          <div className="my-4 h-px bg-black/10" />
          <p className="text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
            Empowering Nigerian farmers through technology that respects the soil and rewards the work.
          </p>
          <div className="my-4 h-px bg-black/10" />
          <p className="text-[var(--color-charcoal)]/50 text-xs tracking-wide">
            © 2026 AgriMatch · Benin City, Edo State · Built with Pxxl, Sabilytics & SendByte
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing