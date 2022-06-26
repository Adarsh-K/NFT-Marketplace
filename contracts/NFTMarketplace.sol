// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _nftIds;
    Counters.Counter private _nftsSold;

    uint256 listingPrice = 0.01 ether;
    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    mapping(uint256 => nft) private idToNft;

    struct nft {
        uint256 nftId;
        address nftAddress;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool isSold;
    }

    event nftListed(
        uint256 indexed nftId,
        address indexed nftAddress,
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool isSold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function listNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0.1 ether, "Price must be greater than 0.1 matic");
        require(msg.value == listingPrice, "Sent the listing price");

        _nftIds.increment();
        uint256 newNftId = _nftIds.current();
        idToNft[newNftId] = nft(
            newNftId,
            nftAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)), // no owner yet
            price,
            false
        );

        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);

        emit nftListed(
            newNftId,
            nftAddress,
            tokenId,
            msg.sender,
            address(0), // no owner yet
            price,
            false
        );
    }

    function buyNFT(address nftAddress, uint256 nftId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToNft[nftId].price;
        uint256 tokenId = idToNft[nftId].tokenId;

        require(
            msg.value == price,
            "Price must be equal to the selling price of the NFT"
        );

        idToNft[nftId].seller.transfer(msg.value);
        IERC721(nftAddress).transferFrom(address(this), msg.sender, tokenId);

        idToNft[nftId].owner = payable(msg.sender);
        idToNft[nftId].isSold = true;
        _nftsSold.increment();
        payable(owner).transfer(listingPrice);
    }

    function fetchUnsoldNFTs() public view returns (nft[] memory) {
        uint256 numUnsoldNFTs = _nftIds.current() - _nftsSold.current();
        uint256 currIndex = 0;
        nft[] memory unsoldNFTs = new nft[](numUnsoldNFTs);

        for (uint256 id = 1; id < _nftIds.current() + 1; id++) {
            if (!idToNft[id].isSold) {
                nft memory currNFT = idToNft[id];
                unsoldNFTs[currIndex++] = currNFT;
            }
        }

        return unsoldNFTs;
    }

    function fetchUserNFTs() public view returns (nft[] memory) {
        uint256 numUserNFTs = 0;
        for (uint256 id = 1; id < _nftIds.current() + 1; id++) {
            if (idToNft[id].owner == msg.sender) {
                numUserNFTs++;
            }
        }

        uint256 currIndex = 0;
        nft[] memory userNFTs = new nft[](numUserNFTs);
        for (uint256 id = 1; id < _nftIds.current() + 1; id++) {
            if (idToNft[id].owner == msg.sender) {
                nft memory currNFT = idToNft[id];
                userNFTs[currIndex++] = currNFT;
            }
        }

        return userNFTs;
    }

    function fetchListedNFTs() public view returns (nft[] memory) {
        uint256 numListedNFTs = 0;
        for (uint256 id = 1; id < _nftIds.current() + 1; id++) {
            if (idToNft[id].seller == msg.sender) {
                numListedNFTs++;
            }
        }

        uint256 currIndex = 0;
        nft[] memory listedNFTs = new nft[](numListedNFTs);
        for (uint256 id = 1; id < _nftIds.current() + 1; id++) {
            if (idToNft[id].seller == msg.sender) {
                nft memory currNFT = idToNft[id];
                listedNFTs[currIndex++] = currNFT;
            }
        }

        return listedNFTs;
    }
}
