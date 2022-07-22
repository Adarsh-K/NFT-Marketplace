export default function NFTCards({ nft, hasButton, buyNFT}) {
  return(
    <div className={`bg-${hasButton ? '[#181918]' : 'transparent'} m-4 flex flex-1
      2xl:min-w-[450px]
      2xl:max-w-[500px]
      sm:min-w-[270px]
      sm:max-w-[300px]
      min-w-full
      flex-col p-3 rounded-md hover:shadow-2xl`}
    >
      <div className={`flex flex-col items-center w-full mt-${hasButton ? '3' : '0'}`}>
          {
            hasButton && (
            <div className="display-flex justify-start w-full mb-4 p-2">
              <p className="text-pink-500 text-base">Name: <span className='text-white'>{nft.name}</span></p>
              <p className="text-pink-500 text-base">Desc: <span className='text-white'>{nft.description}</span></p>
            </div>
            )
          }
        <img
          src={nft.image}
          alt="nature"
          className="w-full h-64 2xl:h-96 rounded-md shadow-lg object-cover"
        />
        {
          hasButton ? (
            <button className="w-full bg-pink-500 text-white font-bold p-3 px-5 w-max rounded-3xl -mt-5 shadow-2xl" onClick={() => buyNFT(nft)}>Buy @{nft.price} MATIC</button>
          ) : (
          <div className="bg-pink-500 p-3 px-5 w-max rounded-3xl -mt-5 shadow-2xl">
            <p className="text-white font-bold">{nft.price} MATIC</p>
          </div>
          )
        }
      </div>
    </div>
  )
}