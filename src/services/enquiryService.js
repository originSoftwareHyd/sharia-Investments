const ENQUIRIES_KEY = 'shariah-investments-enquiries'

function parseArray(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeArray(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const enquiryService = {
  getAll() {
    return parseArray(ENQUIRIES_KEY)
  },

  getById(id) {
    return parseArray(ENQUIRIES_KEY).find((e) => e.id === id) ?? null
  },

  create(data) {
    const enquiry = {
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
    }
    const existing = parseArray(ENQUIRIES_KEY)
    writeArray(ENQUIRIES_KEY, [...existing, enquiry])
    return enquiry
  },

  update(id, patch) {
    const all = parseArray(ENQUIRIES_KEY)
    const next = all.map((e) => (e.id === id ? { ...e, ...patch } : e))
    writeArray(ENQUIRIES_KEY, next)
    return next.find((e) => e.id === id) ?? null
  },

  delete(id) {
    const next = parseArray(ENQUIRIES_KEY).filter((e) => e.id !== id)
    writeArray(ENQUIRIES_KEY, next)
  },

  countUnread() {
    return parseArray(ENQUIRIES_KEY).filter((e) => !e.isRead && !e.isArchived).length
  },
}
