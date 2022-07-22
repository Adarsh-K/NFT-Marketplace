import '../styles/globals.css'
import Link from 'next/link'
import { useRouter } from 'next/router'

function NFTMarketplace({ Component, pageProps }) {
	const router = useRouter();
  return (
    <div>
      <nav className="w-full flex md:justify-center justify-between items-center p-4">
        <div className="md:flex-[0.5] flex-initial justify-center items-center">
          <img src="/logo.png" alt="logo" className="w-32 cursor-pointer" onClick={() => router.push('/')}/>
        </div>
        <div className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
          <Link href="/">
            <a className="mr-6 text-white">
              Home
            </a>
          </Link>
          <Link href="/listNFT">
            <a className="mr-6 text-white">
              Sell NFT
            </a>
          </Link>
          <Link href="/userNFTs">
            <a className="mr-6 text-white">
              My NFTs
            </a>
          </Link>
          <Link href="/creatorDashboard">
            <a className="mr-6 text-white">
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