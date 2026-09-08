import { motion } from 'framer-motion'

function ConfirmModal({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = true }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
      >
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-2">
          {title}
        </h2>
        <p className="text-sm text-[var(--color-charcoal)]/60 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-black/10 py-2.5 rounded-lg font-semibold text-[var(--color-charcoal)]/70 hover:bg-black/5 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-white transition-all hover:brightness-95 ${
              danger ? 'bg-red-600' : 'bg-[var(--color-primary)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ConfirmModal