import Head from 'next/head'
import Image from 'next/image'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { nftAddress, nftMarketAddress } from '../config'

import NFT from '../artifacts/contracts/Nft.sol/Nft.json'
import nftMarket from '../artifacts/contracts/NftMarket.sol/NftMarket.json'

export default function Home() {
  const [nft, setNft] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNfts()
  }, [])

  const loadNfts = async () => {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftMarketAddress, nftMarket.abi, provider)
    const data = await marketContract.fetchMarketItems()
    const items = await Promise.all(data.map(async i => {
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

  const buyNft = async (nft) => {
    const web3modal = new Web3Modal()
    const connect = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connect)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftMarketAddress, nftMarket.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNfts()
  }

  if(loading && !nft.length) return (
    <h1 className='px-20 py-10 text3xl'>No items in market place</h1>
  )

  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="Fullstack NFT Marketplace with Nextjs and Ethereum network" />
      </Head>

      <main>
        <div className='flex justify-center'>
          <div className='px-4' style={{ maxWidth: '1600px' }}>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
              {
                nft.map((n, i) => (
                  <div key={i} className='border shadow rounded-xl overflow-hidden'>
                    <Image src={n.image} alt='Nft Image' />
                    <div className='p-4'>
                      <p style={{ height: '64px' }} className='text-2xl font-semibold'>{n.name}</p>
                      <div style={{ height: '70px', overflow: 'hidden' }}>
                        <p className="text-gray-400">{n.description}</p>
                      </div>
                    </div>
                    <div className='p-4 bg-black'>
                      <p className='text-2xl mb-4 font-bold text-white'>{n.price} Matic</p>
                      <button className='w-full bg-blue-500 text-white font-bold py-2 px-12 rounded' onClick={() => buyNft(nft)}>
                        Buy
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
