// components/checkout/CheckoutFooter.jsx
export default function CheckoutFooter({ config }) {
  const { footerText, footerLinks = [] } = config

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-2.5 px-4">
      <div className="flex items-center justify-center gap-1 flex-wrap text-xs text-gray-400 max-w-lg mx-auto">
        {footerText && <span className="font-medium text-gray-500">{footerText}</span>}
        {footerText && footerLinks.length > 0 && <span>·</span>}
        {footerLinks.map((link, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span>·</span>}
            <a
              href={link.url || '#'}
              target={link.url?.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="hover:text-gray-600 hover:underline transition-colors"
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </div>
  )
}
