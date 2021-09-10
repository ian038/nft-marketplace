import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="Fullstack NFT Marketplace with Nextjs and Ethereum network" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Home
        </h1>
      </main>
    </div>
  )
}
