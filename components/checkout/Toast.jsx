// components/checkout/Toast.jsx
import { useEffect } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

const ICONS = { success:<Check size={14} className="text-green-600"/>, error:<X size={14} className="text-red-500"/>, info:<Info size={14} className="text-blue-500"/>, warning:<AlertCircle size={14} className="text-yellow-500"/> }
const BG    = { success:'bg-green-50 border-green-200', error:'bg-red-50 border-red-200', info:'bg-blue-50 border-blue-200', warning:'bg-yellow-50 border-yellow-200' }

function ToastItem({ toast, onRemove }) {
  useEffect(() => { const t = setTimeout(() => onRemove(toast.id), toast.duration || 3500); return () => clearTimeout(t) }, [toast.id])
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-2xl border shadow-lg pointer-events-auto ${BG[toast.type] || BG.info}`}>
      <span className="flex-shrink-0 mt-0.5">{ICONS[toast.type] || ICONS.info}</span>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-xs font-semibold text-gray-800 mb-0.5">{toast.title}</p>}
        <p className="text-xs text-gray-600">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 p-0.5 hover:opacity-70">
        <X size={11} className="text-gray-400"/>
      </button>
    </div>
  )
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove}/>)}
    </div>
  )
}
