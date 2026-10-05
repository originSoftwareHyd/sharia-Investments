import { appConfig } from '../config/appConfig'

export function openGmailCompose({ to = appConfig.contactEmail, subject = '', body = '' } = {}) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  })
  const url = `https://mail.google.com/mail/?${params.toString()}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
