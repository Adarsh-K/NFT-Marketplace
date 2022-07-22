import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import {
	nftAddress,
	nftMarketplaceAddress
} from '../config'
import NFT from "../utils/NFT.json"
import NFTMarketplace from "../utils/NFTMarketplace.json"
import NFTCards from './nftCards'

export default function UserNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  useEffect(() => {
    loadNFTs()
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
      
		const NFTContract = new ethers.Contract(nftAddress, NFT.abi, provider);
		const NFTMartketplaceContract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer);
    const data = await NFTMartketplaceContract.fetchUserNFTs();

		const userNFTs = await Promise.all(data.map(async nft => {
			const nftUri = await NFTContract.tokenURI(nft.nftId);
			const meta = await axios.get(nftUri);
			const price = ethers.utils.formatUnits(nft.price.toString(), 'ether');
			
			return {
				price,
				nftId: nft.nftId.toNumber(),
				seller: nft.seller,
				owner: nft.owner,
				image: meta.data.image,
			};
		}));

    setNfts(userNFTs)
    setLoadingState('loaded') 
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
  
  return (
    <div className="flex w-full justify-center items-center 2xl:px-20">
      <div className="flex flex-col md:p-12 py-12 px-4">
        <div className="flex flex-wrap justify-center items-center mt-10">
          {nfts.reverse().map((nft, i) => (
            <NFTCards key={i} nft={nft} hasButton={false} />
          ))}
        </div>
      </div>
    </div>
  )
}