import ApiMessage from './api-message'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <img src="/lambda.svg" alt="" width={64} height={64} />
      <h1>Next.js and Express on one domain</h1>
      <p>
        This page comes from the Next.js web app. Your browser fetched the
        response below from <code>/api/hello</code> on the same domain, which
        reaches the Express web app.
      </p>
      <ApiMessage />
    </main>
  )
}
