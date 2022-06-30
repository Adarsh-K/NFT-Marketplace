import { ethers } from 'ethers'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from "web3modal"
import {
	nftAddress,
	nftMarketplaceAddress
} from '../config'
import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function ListNFT() {
	const [fileUrl, setFileUrl] = useState(null);
	const [formInput, updateFormInput] = useState({ price: '', name: '', description: ''});
	const router = useRouter();

	async function onChange(e) {
		const file = e.target.files[0];
		try {
			const fileAdded = await client.add(file, { progress: p => console.log(`received: ${p}`) });
			const url = `https://ipfs.infura.io/ipfs/${fileAdded.path}`;
			setFileUrl(url);
		} catch (error) {
			console.log('Error uploading file: ', error);
		}
	}

	async function listNFT() {
		const { price, name, description } = formInput;
		if (!price || !name || !description || !fileUrl)
			return;

		const fileData = JSON.stringify({ name, description, image: fileUrl });
		try {
			const fileDataAdded = await client.add(fileData);
			const url = `https://ipfs.infura.io/ipfs/${fileDataAdded.path}`;
			listNFTHelper(url);
		} catch (error) {
			console.log('Error uploading form: ', error);
		}
	}

	async function listNFTHelper(url) {
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);

		const signer = provider.getSigner();
		const NFTContract = new ethers.Contract(nftAddress, NFT.abi, signer);
		let transaction = await NFTContract.mintToken(url);

		const tx = await transaction.wait();
		const event = tx.events[0];
		const value = event.args[2];
		const tokenId = value.toNumber();
		const price = ethers.utils.parseUnits(formInput.price, 'ether');

		const NFTMarketplaceContract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer);
		let listingPrice = await NFTMarketplaceContract.getListingPrice();
		listingPrice = listingPrice.toString();
		transaction = await NFTMarketplaceContract.listNFT(nftAddress, tokenId, price, { value: listingPrice });
		await transaction.wait();

		router.push('/');
	}

	return (
		<div className="flex justify-center">
			<div className="w-1/2 flex flex-col pb-12">
				<input 
					placeholder="Asset Name"
					className="mt-8 border rounded p-4"
					onChange={ e => updateFormInput({ ...formInput, name: e.target.value }) }
				/>
				<textarea
					placeholder="Asset Description"
					className="mt-2 border rounded p-4"
					onChange={ e => updateFormInput({ ...formInput, description: e.target.value } )}
				/>
				<input
					placeholder="Asset Price in MATIC"
					className="mt-2 border rounded p-4"
					onChange={ e => updateFormInput({ ...formInput, price: e.target.value }) }
				/>
				<input
					type="file"
					name="Asset"
					className="my-4"
					onChange={ onChange }
				/>
				{
				fileUrl && (
					<img className="rounded mt-4" width="350" src={fileUrl} />
				)
				}
				<button onClick={ listNFT } className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
					List NFT
				</button>
			</div>
		</div>
	)
}