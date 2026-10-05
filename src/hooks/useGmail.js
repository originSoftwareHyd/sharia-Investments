import { useCallback } from 'react'
import { appConfig } from '../config/appConfig'
import { openGmailCompose } from '../utils/gmailCompose'

export function useGmail() {
  return useCallback(() => {
    openGmailCompose({
      to: appConfig.contactEmail,
      subject: 'Question for Shariah Investments',
      body: 'Assalamu alaikum,\n\nI would like to get in touch regarding Shariah Investments.\n\n',
    })
  }, [])
}
