const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config();

async function main() {

  const [owner, addr1, addr2, addr3, addr4, addr5,addr6,addr7,addr8,addr9,...addrs] = await ethers.getSigners();

  this.rba = await ethers.getContractFactory('RBAToken')
  this.Token = await ethers.getContractFactory("BattlefieldOfRenegades")
  this.Dividend = await ethers.getContractFactory("BattlefieldOfRenegadesDividendTracker")

  let router = process.env.ROUTER02MATIC
  let gameVaultWallet = addr1.address
  let safetyVaultWallet = addr2.address
  let bridgeVault = addr3.address
  

  this.rba = await this.rba.deploy()
  await this.rba.deployed()

  this.token = await this.Token.deploy(router, this.rba.address, gameVaultWallet, safetyVaultWallet, bridgeVault)
  await this.token.deployed();
    
  this.dividendTracker = await this.Dividend.deploy(this.rba.address, this.token.address)
  await this.dividendTracker.deployed()
  

  console.log("RBA deployed at:",this.rba.address)
  console.log("BOR deployed to:", this.token.address);
  console.log("DivTracker deployed to:", this.dividendTracker.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});