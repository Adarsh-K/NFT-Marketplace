import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import {
	nftAddress,
	nftMarketplaceAddress
} from '../config'
import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"

export default function Home() {
	const [nfts, setNfts] = useState([]);
	const [loadingState, setLoadingState] = useState('not-loaded');
	useEffect(() => {
		loadNFTs()
	}, []);

	async function loadNFTs() {
		const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/M3BZBEFdM0YpHsqvXICBDH8GwqSHxpnS");
		const NFTContract = new ethers.Contract(nftAddress, NFT.abi, provider);
		const NFTMartketplaceContract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, provider);
		const data = await NFTMartketplaceContract.fetchUnsoldNFTs();
		const unsoldNFTs = await Promise.all(data.map(async nft => {
			const nftUri = await NFTContract.tokenURI(nft.nftId);
			const meta = await axios.get(nftUri);
			const price = ethers.utils.formatUnits(nft.price.toString(), 'ether');
			
			return {
				price,
				nftId: nft.nftId.toNumber(),
				seller: nft.seller,
				owner: nft.owner,
				image: meta.data.image,
				name: meta.data.name,
				description: meta.data.description,
			};
		}));

		setNfts(unsoldNFTs);
		setLoadingState('loaded');
	}

	async function buyNFT(nft) {
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);

		const signer = provider.getSigner();
		const NFTMartketplaceContract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer);

		const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
		const transaction = await NFTMartketplaceContract.buyNFT(nftAddress, nft.nftId, { value: price });
		await transaction.wait();
		loadNFTs();
	}
	
	if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)

	return (
	<div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, idx) => (
              <div key={idx} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} MATIC</p>
                  <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNFT(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
	)
}
