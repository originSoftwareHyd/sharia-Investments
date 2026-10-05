import { Link } from 'react-router-dom'

export function Button({ as = 'link', to, href, children, variant = 'primary', className = '', ...props }) {
  const classes = `button button--${variant} ${className}`.trim()
  if (as === 'button') return <button className={classes} {...props}>{children}</button>
  if (as === 'a') return <a className={classes} href={href} {...props}>{children}</a>
  return <Link className={classes} to={to} {...props}>{children}</Link>
}
