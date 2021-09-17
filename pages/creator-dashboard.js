import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import axios from 'axios'
import { nftaddress, nftmarketaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([])
    const [sold, setSold] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadNFTs()
    }, [])

    const loadNFTs = async () => {    
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const data = await marketContract.fetchItemsCreated()
        
        const items = await Promise.all(data.map(async i => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
            image: meta.data.image
          }
          return item
        }))

        const soldItems = items.filter(i => i.sold) 

        setSold(soldItems)
        setNfts(items)
        setLoading(false) 
    }

    return (
        <div>
            <div className='p-4'>
                <h2 className='text-2xl py-2'>Items Created</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                           <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <Image className="rounded" width={320} height={225} src={nft.image} alt="Item Created Image" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl mb-4 font-bold text-white">Price: {nft.price} ETH</p>
                                </div>
                           </div> 
                        ))
                    }
                </div>
            </div>
            <div className='px-4'>
                {
                    Boolean(sold.length) && (
                        <div className='text-2xl py-2'>
                            <h2>Items Sold</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {
                                    sold.map((nft, i) => (
                                        <div key={i} className="border shadow rounded-xl overflow-hidden">
                                            <Image className="rounded" width={320} height={225} src={nft.image} alt="Item Sold Image" />
                                            <div className="p-4 bg-black">
                                                <p className="text-2xl mb-4 font-bold text-white">Price: {nft.price} ETH</p>
                                            </div>
                                        </div> 
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}