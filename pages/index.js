import Head from 'next/head'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { nftAddress, nftMarketAddress } from '../config'
import styles from '../styles/Home.module.css'

import nft from '../artifacts/contracts/Nft.sol/Nft.json'
import nftMarket from '../artifacts/contracts/NftMarket.sol/NftMarket.json'

export default function Home() {
  const [nft, setNft] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNfts()
  }, [])

  const loadNfts = async () => {
    const provider = ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftAddress, Nft.abi, provider)
    const marketContract = new ethers.Contract(nftMarketAddress, NftMarket.abi, provider)
    const data = await marketContract.fetchMarketItems()
    const items = await Promise.add(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))
    setNft(items)
    setLoading(true)
  }

  if(loading && !nft.length) return (
    <h1 className='px-20 py-10 text3xl'>No items in market place</h1>
  )

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
