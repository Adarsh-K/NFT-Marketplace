import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import {
	nftAddress,
	nftMarketplaceAddress
} from '../config'
import NFT from "../utils/NFT.json"
import NFTMarketplace from "../utils/NFTMarketplace.json"
import NFTCards from '../components/nftCards'
import { useRouter } from 'next/router'

export default function Home() {
	const router = useRouter();
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

		router.push('/userNFTs');
	}
	
	if (loadingState === 'loaded' && !nfts.length) return (
    <h1 className="px-20 py-20 text-white text-center text-3xl">No NFTs in the marketplace! No worries, sell one yourself... <br/> Head to the Sell NFT tab</h1>
  )

	return (
    <div className="flex w-full justify-center items-center 2xl:px-20">
      <div className="flex flex-col md: px-4">
        <h2 className="text-4xl text-center text-white pt-6">Buy NFTs</h2>
        <div className="flex flex-wrap justify-center items-center mt-10">
          {nfts.reverse().map((nft, i) => (
            <NFTCards key={i} nft={nft} hasButton={true} buyNFT={buyNFT}/>
          ))}
        </div>
      </div>
    </div>
	)
}
