const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  it("Should mint NFT, execute listing & buying", async function () {
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const market = await NFTMarketplace.deploy();
    await market.deployed();
    const marketAddress = market.address;
    
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftAddress = nft.address;
    
    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();
    const sellingPrice = ethers.utils.parseUnits('10', 'ether');

    await nft.mintToken("https://www.mytokenlocation.com");
    await nft.mintToken("https://www.mytokenlocation2.com");

    await market.listNFT(nftAddress, 1, sellingPrice, { value: listingPrice });
    await market.listNFT(nftAddress, 2, sellingPrice, { value: listingPrice });

    const [_, buyerAddress] = await ethers.getSigners();
    await market.connect(buyerAddress).buyNFT(nftAddress, 1, { value: sellingPrice});

    const allNFTs = await market.fetchListedNFTs();
    const unsoldNFTs = await market.fetchUnsoldNFTs();
    console.log(allNFTs);
    console.log(unsoldNFTs);
  });
});
