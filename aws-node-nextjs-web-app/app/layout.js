export const metadata = {
  title: 'Next.js on AWS Lambda Web Functions',
  description: 'A Next.js app deployed with the Serverless Framework',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
