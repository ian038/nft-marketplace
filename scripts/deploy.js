const hre = require("hardhat");

async function main() {
  const NftMarket = await hre.ethers.getContractFactory("NftMarket");
  const nftMarket = await NftMarket.deploy();
  await nftMarket.deployed();
  console.log("NFT Market deployed to:", nftMarket.address);

  const Nft = await hre.ethers.getContractFactory("Nft");
  const nft = await Nft.deploy(nftMarket.address);
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
