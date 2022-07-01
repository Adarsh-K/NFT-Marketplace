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
    <div className="grid grid-cols-2">
      {fileUrl ? (
        <img className="rounded m-4 w-1/2 h-full ml-60" src={fileUrl} />
      ) : (
        <div class="m-4 w-1/2 h-full ml-60">
          <div class="flex justify-center h-2/3">
            <label class="flex flex-col w-full h-full border-4 justify-center border-dashed hover:bg-gray-100 hover:border-gray-300">
                <div class="flex flex-col items-center justify-center pt-7">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="w-12 h-12 text-gray-400 group-hover:text-gray-600" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clip-rule="evenodd" />
                    </svg>
                    <p class="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        Select a photo</p>
                </div>
                <input type="file" name="Asset" class="opacity-0" onChange={ onChange } />
            </label>
          </div>
          <label class="block text-center mt-4 text-gray-500">Upload
              Image (jpg, png, svg, jpeg, gif)</label>
        </div>
      )
      }
      <div className="w-1/2 flex flex-col ml-4 pb-12">
        <input 
          placeholder="NFT Name"
          className="mt-4 border rounded p-4"
          onChange={ e => updateFormInput({ ...formInput, name: e.target.value }) }
        />
        <textarea
          placeholder="NFT Description"
          className="mt-2 border rounded p-4"
          onChange={ e => updateFormInput({ ...formInput, description: e.target.value } )}
        />
        <input
          placeholder="NFT Price in MATIC"
          className="mt-2 border rounded p-4"
          onChange={ e => updateFormInput({ ...formInput, price: e.target.value }) }
        />
        <button onClick={ listNFT } className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          List NFT
        </button>
      </div>
    </div>
	)
}