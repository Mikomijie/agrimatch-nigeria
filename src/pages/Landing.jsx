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
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-primary-dark)] border-b border-black/10">
        <span className="font-[var(--font-heading)] italic text-2xl text-white flex items-center gap-2">
          <LeafIcon className="text-[var(--color-primary-light)]" />
          AgriMatch
        </span>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
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
        className="relative h-[520px] md:h-[640px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/hero-nigeria-farming.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <motion.div
          className="relative z-10 text-center px-6 max-w-2xl mx-auto"
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
          <p className="text-white/85 text-base md:text-lg max-w-lg mx-auto mb-8">
            Farmers list produce and get paid via escrow. Buyers pool orders across multiple farmers. Transporters deliver with photo verification.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                to="/auth"
                className="inline-block bg-[var(--color-secondary)] text-white px-7 py-3 rounded-md font-bold hover:brightness-95 transition-all"
              >
                GET STARTED
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                to="/marketplace"
                className="inline-block bg-white/10 border border-white/40 text-white px-7 py-3 rounded-md font-bold hover:bg-white/20 transition-all"
              >
                BROWSE MARKET
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="bg-[var(--color-primary)] text-white px-6 md:px-10 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-xs md:text-sm tracking-wide font-semibold">
        <span>Escrow protection on every order</span>
        <span>Pre-order harvests before they are picked</span>
        <span>Verified delivery with photo proof</span>
      </section>

      {/* Three differentiators */}
      <AnimatedSection className="bg-[var(--color-surface)] px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
              Not a marketplace. A coordination platform.
            </h2>
            <p className="mt-3 text-[var(--color-charcoal)]/60 max-w-lg mx-auto text-sm">
              Generic platforms handle listings. AgriMatch handles trust, logistics, and the entire value chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={fadeUp}
              className="p-8 rounded-xl bg-white border border-black/8 hover:shadow-lg transition-shadow group"
            >
              <div className="w-12 h-12 bg-[var(--color-primary-light)]/40 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)] transition-colors">
                <span className="font-[var(--font-heading)] font-bold text-[var(--color-primary-dark)] group-hover:text-white transition-colors">01</span>
              </div>
              <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)] mb-2">Escrow Payments</h3>
              <p className="text-sm text-[var(--color-charcoal)]/60 leading-relaxed">
                Buyers pay into escrow. Farmers receive funds only after delivery is confirmed. No cash risk on either side.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="p-8 rounded-xl bg-white border border-black/8 hover:shadow-lg transition-shadow group"
            >
              <div className="w-12 h-12 bg-[var(--color-secondary-light)]/40 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[var(--color-secondary)] transition-colors">
                <span className="font-[var(--font-heading)] font-bold text-[var(--color-secondary-dark)] group-hover:text-white transition-colors">02</span>
              </div>
              <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)] mb-2">Order Pooling</h3>
              <p className="text-sm text-[var(--color-charcoal)]/60 leading-relaxed">
                Need 500kg but no single farmer has enough? AgriMatch splits your order across multiple verified farmers automatically.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="p-8 rounded-xl bg-white border border-black/8 hover:shadow-lg transition-shadow group"
            >
              <div className="w-12 h-12 bg-[var(--color-moss)]/30 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[var(--color-moss)] transition-colors">
                <span className="font-[var(--font-heading)] font-bold text-[var(--color-moss)] group-hover:text-white transition-colors">03</span>
              </div>
              <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)] mb-2">Future Harvest Pre-orders</h3>
              <p className="text-sm text-[var(--color-charcoal)]/60 leading-relaxed">
                Farmers list crops not yet harvested. Buyers reserve and pay in advance. Farmers know their income before picking a single tomato.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* How it works */}
      <AnimatedSection className="bg-[var(--color-background-warm)] px-6 md:px-10 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)] mb-12">
            From harvest to payment in 4 steps
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Farmer Lists', desc: 'Fresh or upcoming harvest with price and location.' },
              { step: '02', title: 'Buyer Orders', desc: 'Pays via escrow. Large orders pool across farmers.' },
              { step: '03', title: 'Transporter Delivers', desc: 'Accepts load, uploads pickup and delivery photos.' },
              { step: '04', title: 'Funds Released', desc: 'Buyer confirms quality. Farmer receives payment.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-[var(--font-heading)] text-white font-bold text-sm">{item.step}</span>
                </div>
                <h3 className="font-bold text-sm text-[var(--color-charcoal)] mb-1">{item.title}</h3>
                <p className="text-xs text-[var(--color-charcoal)]/55 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection className="bg-[var(--color-surface)] px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <Counter value="40" suffix="%" />
          <p className="text-xs text-[var(--color-charcoal)]/60 mt-2 max-w-xs mx-auto">
            Of Nigerian produce lost annually due to broken market linkages
          </p>
        </div>
        <div>
          <Counter value="0" suffix="%" />
          <p className="text-xs text-[var(--color-charcoal)]/60 mt-2 max-w-xs mx-auto">
            Listing fee for farmers. AgriMatch earns only when farmers earn
          </p>
        </div>
        <div>
          <Counter value="3" suffix=" roles" />
          <p className="text-xs text-[var(--color-charcoal)]/60 mt-2 max-w-xs mx-auto">
            Farmers, buyers, and transporters all coordinated on one platform
          </p>
        </div>
      </AnimatedSection>

      {/* USSD CTA */}
      <AnimatedSection className="bg-[var(--color-primary-dark)] text-white px-6 md:px-10 py-16 text-center">
        <motion.div variants={fadeUp}>
          <p className="text-xs font-semibold tracking-wide text-[var(--color-primary-light)] uppercase mb-3">
            Built for Rural Nigeria
          </p>
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-white mb-4">
            No smartphone? No problem.
          </h2>
          <p className="text-white/75 max-w-md mx-auto text-sm leading-relaxed mb-8">
            Farmers in low connectivity areas can list produce and check orders via USSD the same way they check their airtime balance.
          </p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
            <Link
              to="/ussd"
              className="inline-block bg-white text-[var(--color-primary-dark)] px-8 py-3 rounded-md font-bold hover:brightness-95 transition-all"
            >
              TRY USSD SIMULATOR
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Bulk order CTA */}
      <AnimatedSection className="bg-[var(--color-secondary)]/10 px-6 md:px-10 py-16 text-center">
        <motion.div variants={fadeUp}>
          <p className="text-xs font-semibold tracking-wide text-[var(--color-secondary-dark)] uppercase mb-3">
            For Large Buyers
          </p>
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)] mb-4">
            Need a truckload? We will pool it.
          </h2>
          <p className="text-[var(--color-charcoal)]/60 max-w-md mx-auto text-sm leading-relaxed mb-8">
            One request. Multiple farmers. Automatic coordination. You just confirm when it arrives.
          </p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
            <Link
              to="/bulk-order"
              className="inline-block bg-[var(--color-secondary)] text-white px-8 py-3 rounded-md font-bold hover:brightness-95 transition-all"
            >
              PLACE BULK ORDER
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Footer CTA */}
      <AnimatedSection className="text-center py-16 px-6 bg-[var(--color-background-warm)]">
        <motion.h2
          variants={fadeUp}
          className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]"
        >
          The harvest is ready. <span className="italic">Are you?</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 text-[var(--color-charcoal)]/55 max-w-sm mx-auto text-sm"
        >
          Join farmers, buyers, and transporters moving Nigerian produce faster, safer, and fairer.
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="mt-6 flex gap-3 justify-center flex-wrap"
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
          <p className="text-[var(--color-charcoal)]/60 text-sm">
            Empowering Nigerian farmers through technology that respects the soil and rewards the work.
          </p>
          <div className="my-4 h-px bg-black/10" />
          <p className="text-[var(--color-charcoal)]/40 text-xs tracking-wide">
            © 2026 AgriMatch · Benin City, Edo State · Built with Pxxl, Sabilytics and SendByte
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing