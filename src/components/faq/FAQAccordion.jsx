import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)
  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const open = index === openIndex
        return (
          <div className={`faq-item ${open ? 'is-open' : ''}`} key={item.question}>
            <button type="button" onClick={() => setOpenIndex(open ? -1 : index)} aria-expanded={open}>
              <span>{item.question}</span><ChevronDown size={18} />
            </button>
            {open && <div className="faq-answer"><p>{item.answer}</p></div>}
          </div>
        )
      })}
    </div>
  )
}
