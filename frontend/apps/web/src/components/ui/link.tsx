import Link from 'next/link'

interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function Link({ href, children, className = '' }: LinkProps) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

