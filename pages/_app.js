import '../styles/globals.css'
import Link from 'next/link'

function NFTMarketplace({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">NFT Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">
              Home
            </a>
          </Link>
          <Link href="/listNFT">
            <a className="mr-6 text-pink-500">
              Sell NFT
            </a>
          </Link>
          <Link href="/userNFTs">
            <a className="mr-6 text-pink-500">
              My NFTs
            </a>
          </Link>
          <Link href="/creatorDashboard">
            <a className="mr-6 text-pink-500">
              Creator Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default NFTMarketplace