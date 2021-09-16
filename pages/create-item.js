import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from "next/router";
import { nftAddress, nftMarketAddress } from '../config'
import Web3Modal from 'web3modal'
import Image from 'next/image'

import Nft from '../artifacts/contracts/Nft.sol/Nft.json'
import NftMarket from '../artifacts/contracts/NftMarket.sol/NftMarket.json'

const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
})

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, setFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    const handleChange = async (e) => {
        const file = e.target.files[0]
        try {
            const added = await client.add(file, { progress: prog => console.log(`Received: ${prog}`) })
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch(error) {
            console.log(error)
        }
    }

    const createItem = async () => {
        const { name, description, price } = formInput
        if(!name || !description || !price || !fileUrl) alert('All fields are required!')
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/$${added.path}`
            /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
            createSale(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    const createSale = async(url) => {
        const web3modal = new Web3Modal()
        const connect = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connect)
        const signer = provider.getSigner() 

        let contract = new ethers.Contract(nftAddress, Nft.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')
        
        contract = new ethers.Contract(nftMarketAddress, NftMarket.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()
        transaction = await contract.createMarketItem(nftAddress, tokenId, price, { value: listingPrice })
        await transaction.wait()
        router.push('/')
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input 
                placeholder='Asset Name'
                className='mt-8 border rounded p-4'
                onChange={e => setFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea 
                placeholder='Asset Description'
                className='mt-2 border rounded p-4'
                onChange={e => setFormInput({ ...formInput, description: e.target.value })}
                />
                <input 
                placeholder='Asset Price in Matic'
                className='mt-2 border rounded p-4'
                onChange={e => setFormInput({ ...formInput, price: e.target.value })}
                />
                <input 
                type='file'
                name='Asset'
                className='my-4'
                onChange={handleChange}
                />
                {
                    fileUrl && (
                        <Image className='rounded mt-4' width={350} height={350} src={fileUrl} alt="Asset Image" />
                    )
                }
                <button onClick={createItem} className='font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg'>
                    Create Digital Asset
                </button>
            </div>
        </div>
    )
}
 