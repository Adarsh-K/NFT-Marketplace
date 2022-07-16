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

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
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
    const data = await NFTMartketplaceContract.fetchListedNFTs();

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

    const soldNFTs = userNFTs.filter(i => i.sold);
    setSold(soldNFTs);
    setNfts(userNFTs);
    setLoadingState('loaded');
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTS listed</h1>);
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">NFTs Listed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} MATIC</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
        <div className="px-4">
        {
          Boolean(sold.length) && (
            <div>
              <h2 className="text-2xl py-2">NFTs sold</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  sold.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                      <img src={nft.image} className="rounded" />
                      <div className="p-4 bg-black">
                        <p className="text-2xl font-bold text-white">Price - {nft.price} MATIC</p>
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