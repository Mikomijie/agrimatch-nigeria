import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

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
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-primary-dark)] backdrop-blur-sm border-b border-black/10">
        <span className="font-[var(--font-heading)] italic text-2xl text-white">
          AgriMatch
        </span>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">Marketplace</Link>
          <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/logistics" className="text-white/80 hover:text-white transition-colors">Logistics</Link>
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
        className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/hero-nigeria-farming.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <motion.div
          className="relative z-10 text-center px-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h1 className="font-[var(--font-heading)] text-4xl md:text-6xl text-white leading-tight">
            Nigeria's harvest spoils <span className="italic">before it reaches the market.</span>
          </h1>
          <p className="mt-4 text-white/90 text-lg mx-auto">
            AgriMatch connects Jos farmers directly to buyers — guaranteed pickup, guaranteed price, zero middlemen.
          </p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block mt-8">
            <Link
              to="/auth"
              className="inline-block bg-[var(--color-secondary)] text-white px-8 py-3 rounded-md font-medium tracking-wide hover:brightness-95 transition-all"
            >
              GET STARTED
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="bg-[var(--color-primary)] text-white px-6 md:px-10 py-6 md:py-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center text-xs md:text-sm tracking-wide">
        <span>40% OF PRODUCE SPOILS BEFORE SALE — WE'RE CUTTING THAT</span>
        <span>FRESH PRODUCE HARVESTED TODAY IN JOS HUB</span>
        <span>GUARANTEED PICKUP WITHIN 12 HOURS</span>
      </section>

      {/* Three role sections */}
      <AnimatedSection className="bg-[var(--color-surface)] px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="bg-[var(--color-primary-light)]/30 rounded-lg p-8 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs font-semibold text-[var(--color-primary-dark)] tracking-wide">
              01 / FOR FARMERS
            </p>
            <h2 className="font-[var(--font-heading)] text-xl mt-4 text-[var(--color-primary-dark)]">
              Command the value your soil deserves.
            </h2>
            <p className="mt-4 text-[var(--color-charcoal)]/80 text-sm leading-relaxed">
              Direct access to high-volume buyers across Nigeria. No intermediaries, no uncertainty. Real-time pricing and guaranteed logistics.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="bg-[var(--color-secondary-light)]/25 rounded-lg p-8 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs font-semibold text-[var(--color-secondary-dark)] tracking-wide">
              02 / FOR BUYERS
            </p>
            <h2 className="font-[var(--font-heading)] text-xl mt-4 text-[var(--color-secondary-dark)]">
              Sourcing with surgical precision.
            </h2>
            <p className="mt-4 text-[var(--color-charcoal)]/80 text-sm leading-relaxed">
              Trace every kilogram back to its origin, with documented harvest times and a verified Nigerian farmer network.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="bg-[var(--color-moss)]/20 rounded-lg p-8 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs font-semibold text-[var(--color-moss)] tracking-wide">
              03 / FOR TRANSPORTERS
            </p>
            <h2 className="font-[var(--font-heading)] text-xl mt-4 text-[var(--color-primary-dark)]">
              Every route paid, every load tracked.
            </h2>
            <p className="mt-4 text-[var(--color-charcoal)]/80 text-sm leading-relaxed">
              Join a network of vetted carriers with access to high-demand routes from Jos to urban hubs across Nigeria.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Why AgriMatch */}
      <AnimatedSection className="bg-[var(--color-background-warm)] px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
              The Problem We Solve
            </h2>
            <p className="mt-3 text-[var(--color-charcoal)]/70 max-w-2xl mx-auto">
              Built for Nigeria's farmers, buyers, and transporters. Technology that delivers real results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-lg border border-black/10 hover:shadow-lg transition-shadow group bg-[var(--color-surface)]"
            >
              <div className="w-12 h-12 bg-[var(--color-primary-light)]/40 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)] transition-colors">
                <span className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-primary-dark)] group-hover:text-white transition-colors">
                  01
                </span>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)]">
                40% Loss, Eliminated
              </h3>
              <p className="mt-3 text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
                No middlemen. Farmers get fair prices updated daily based on live market data across Nigeria.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-lg border border-black/10 hover:shadow-lg transition-shadow group bg-[var(--color-surface)]"
            >
              <div className="w-12 h-12 bg-[var(--color-secondary-light)]/40 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-secondary)] transition-colors">
                <span className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-secondary-dark)] group-hover:text-white transition-colors">
                  02
                </span>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)]">
                Every Harvest Traced
              </h3>
              <p className="mt-3 text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
                Every producer is vetted. Trace every kilogram from Jos farms back to your doorstep.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-lg border border-black/10 hover:shadow-lg transition-shadow group bg-[var(--color-surface)]"
            >
              <div className="w-12 h-12 bg-[var(--color-moss)]/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-moss)] transition-colors">
                <span className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-moss)] group-hover:text-white transition-colors">
                  03
                </span>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)]">
                12-Hour Guarantee
              </h3>
              <p className="mt-3 text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
                Farm to buyer in 12 hours. Coordinated, reliable transport network across Nigeria.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Animated Stats */}
      <AnimatedSection className="bg-[var(--color-surface)] px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center">
        <div>
          <Counter value="40" suffix="%" />
          <p className="text-xs text-[var(--color-charcoal)]/70 mt-1">
            Average post-harvest loss in traditional Nigerian supply chains
          </p>
        </div>
        <div>
          <Counter value="10" suffix="k+" />
          <p className="text-xs text-[var(--color-charcoal)]/70 mt-1">
            Verified smallholder farmers in the Jos Hub ecosystem
          </p>
        </div>
        <div>
          <Counter value="12" suffix="hrs" />
          <p className="text-xs text-[var(--color-charcoal)]/70 mt-1">
            Maximum time from harvest to logistics pickup
          </p>
        </div>
      </AnimatedSection>

      {/* USSD CTA */}
      <AnimatedSection className="bg-[var(--color-primary-dark)] text-white px-6 md:px-10 py-16 text-center">
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <p className="text-xs font-semibold tracking-wide text-[var(--color-primary-light)] uppercase mb-3">
            Low-Connectivity Mode
          </p>
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-white">
            No smartphone? No problem.
          </h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto text-sm leading-relaxed">
            Farmers without internet access can list produce and check orders via USSD — just like dialing *920#. Try the live simulator below.
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
            For Large Buyers
          </p>
          <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
            Need 500kg? We'll pool it.
          </h2>
          <p className="mt-4 text-[var(--color-charcoal)]/70 max-w-xl mx-auto text-sm leading-relaxed">
            One buyer request automatically splits across multiple verified farmers. No coordination needed on your end.
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
          Ready to bridge the <span className="italic">distance?</span>
        </motion.h2>
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
              JOIN THE NETWORK
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              to="/marketplace"
              className="inline-block border border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-md font-medium hover:bg-[var(--color-primary)]/5 transition-colors"
            >
              BROWSE MARKETPLACE
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      <footer className="border-t border-black/10 px-6 md:px-10 py-12 text-center bg-[var(--color-background-warm)]">
        <div className="max-w-2xl mx-auto">
          <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">
            AgriMatch
          </p>
          <div className="my-4 h-px bg-black/10" />
          <p className="text-[var(--color-charcoal)]/70 text-sm leading-relaxed">
            Empowering the backbone of Nigeria's economy through technology that respects the soil.
          </p>
          <div className="my-4 h-px bg-black/10" />
          <p className="text-[var(--color-charcoal)]/50 text-xs tracking-wide">
            © 2026 AgriMatch · Jos Regional Hub, Plateau State
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing