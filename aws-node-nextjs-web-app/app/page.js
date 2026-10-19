import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <img src="/lambda.svg" alt="" width={64} height={64} />
      <h1>Next.js on AWS Lambda Web Functions</h1>
      <p>
        This page is served by the Next.js standalone server, deployed with the
        Serverless Framework.
      </p>
      <p>
        <a href="/api/hello">/api/hello</a> returns JSON from a route handler.
      </p>
    </main>
  )
}
