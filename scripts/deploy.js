const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const NftMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NftMarket.deploy();
  await nftMarket.deployed();
  console.log("NFT Market deployed to:", nftMarket.address);

  const Nft = await hre.ethers.getContractFactory("NFT");
  const nft = await Nft.deploy(nftMarket.address);
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);

  let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
