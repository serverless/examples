export const metadata = {
  title: 'Next.js and Express on one domain',
  description: 'Two web apps sharing a custom domain, deployed with the Serverless Framework',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
