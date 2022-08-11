
const { expect,} = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

  
  
  describe.only("StakingWithReflection", function () {

    before(async function () {

      //get signers
      [owner, rewardWallet,user1, user2, user3, user4 ] = await ethers.getSigners();

      //get provider
      this.provider = ethers.provider;
      
      //get contract factory
      this.LP = await ethers.getContractFactory("MockBUSD")  
      this.Reward = await ethers.getContractFactory("MockBUSD");
      this.Farm = await ethers.getContractFactory("GooseBumpsStakingWithReflection")
      this.RD = await ethers.getContractFactory("ReflectionsDistributor")
      this.ST =  await ethers.getContractFactory("StakingTreasury")


      //deploy LP and Reward Contract
      this.LP = await this.LP.deploy()
      this.Reward  =await this.Reward.deploy()


      //Get instance of deployed LP and Reward  (address needed to deploy Farm)
       await this.LP.deployed()
       await this.Reward.deployed()

       //deploy Farm and get address (set ST/StakingContract)
      this.Farm = await this.Farm.deploy(
        this.LP.address, this.Reward.address, rewardWallet.address,10,100)
         await this.Farm.deployed()

       //Deploy StakingTreasury
       this.ST = await this.ST.deploy(this.Farm.address, this.LP.address)
       await this.ST.deployed()

       //Set takingTreasury
       await this.Farm.setTreasury(this.ST.address)

      //Deploy RelectionsDistributor
      this.RD = await this.RD.deploy(this.LP.address, this.ST.address)
      await this.RD.deployed()

      //Set  setReflectionsDistributor
      await this.ST. setReflectionsDistributor(this.RD.address)
      

    //Print out deployed contracts addres
      console.log(` \n  LP deployed at: ${this.LP.address}
      \n Reward deployed at: ${this.Reward.address}\n  
      Farm deployed at: ${this.Farm.address}`)
     });

    // describe('Set Operations', function(){
      
    //   it('sets Treasury', async function(){
    //     await expect(this.Farm.setTreasury(user3.address)).to.emit(
    //       this.Farm,"LogSetTreasury").withArgs(user3.address)
    //   })

    //   it('sets Reward Wallet', async function(){
    //     await expect(
    //       this.Farm.setRewardWallet(user4.address)).to.emit(
    //         this.Farm, "LogSetRewardWallet").withArgs(user4.address)
    //   })

    //   it('sets pause', async function(){
    //     await expect(this.Farm.setPause()).to.emit(this.Farm, "Paused").withArgs(owner.address)
    //     expect(await this.Farm.paused()).to.be.equals(true)
    //   })

    //   it('sets Unpause', async function(){
    //     await expect(this.Farm.setUnpause()).to.emit(this.Farm, "Unpaused").withArgs(owner.address)
    //     expect(await this.Farm.paused()).to.be.equals(false)
    //   })


    // })

    it('stakes', async function(){
      
      //Transfer from owner to stakingVault LP token to stake
      await this.LP.transfer(user1.address, utils.parseEther('1000'))
      //stakingVault approve Farm to use tokens
      await this.LP.connect(user1).approve(this.ST.address, utils.parseEther('1000'))
    
      //await this.ST.connect(stakingVault).deposit(user1.address,utils.parseEther('1000'))
      //stake
      await expect(this.Farm.connect(user1).stake(
        utils.parseEther('1000'))).to.emit(
          this.Farm, 'LogStake').withArgs(user1.address, utils.parseEther('1000'))
      
      //  //check staker info amount
      //  const {amount,startBlock,stakeRewards} = await this.Farm.staker(stakingVault.address)
      //  console.log(`\n Amount staked: ${utils.formatEther(amount)}\n startBlock: ${startBlock}\n stakeRewards: ${stakeRewards}`)

      //  //print out TREASURY address
      // console.log(`\n TREASURY address: ${ await this.Farm.TREASURY()}`)
      //  //check Treasury bal
      // console.log(` TREASURY BAL: ${utils.formatEther(await this.LP.balanceOf(user1.address))}`)

      // //reverts 1: require(_amount > 0, "Staking amount must be greater than zero");
      // await expect(this.Farm.connect(stakingVault).stake(utils.parseEther('0'))).to.be.revertedWith("Staking amount must be greater than zero")
      // //reverts 2: require(staker[msg.sender].amount >= _amount, "Insufficient unstake");
      // await expect(this.Farm.connect(stakingVault).stake(utils.parseEther('1'))).to.be.revertedWith("Insufficient lpToken balance")

    })
    
    // it('unstakes', async function(){
    //   //approve send of rewards
    //   await this.Reward.approve(this.Farm.address, utils.parseEther('1000'))
    //   //approve withdraw of LP from Treasury
    //   await this.LP.connect(user1).approve(this.Farm.address, utils.parseEther('1000'))
    //   //connect user 2 and unstake 500
    //   await expect(this.Farm.connect(stakingVault).unstake(utils.parseEther('500'))).to.emit(this.Farm,'LogUnstake')
    //   //check staker info amount
    //   const {amount,startBlock,stakeRewards} = await this.Farm.staker(stakingVault.address)
    //   console.log(` Amount Left: ${utils.formatEther(amount)}\n endBlock: ${await this.provider.getBlockNumber()}\n stakeRewards:${utils.formatEther(await this.Reward.balanceOf(stakingVault.address))}`)

    //   //reverts 1: require(_amount > 0, "Unstaking amount must be greater than zero");
    //   await expect(this.Farm.connect(stakingVault).unstake(utils.parseEther('0'))).to.be.revertedWith("Unstaking amount must be greater than zero")
    //   //reverts 2: require(staker[msg.sender].amount >= _amount, "Insufficient unstake");
    //   await expect(this.Farm.connect(stakingVault).unstake(utils.parseEther('600'))).to.be.revertedWith("Insufficient unstake")

    // })

    // it('withdraws Rewards', async function(){
    //   await this.Reward.approve(this.Farm.address, utils.parseEther('10000'))
    //   expect(await this.Farm.connect(stakingVault).withdrawRewards()).to.emit(this.Farm,'LogRewardsWithdrawal')

    //   //check staker info amount
    //   const {amount,startBlock,stakeRewards} = await this.Farm.staker(stakingVault.address)
    //   console.log(` Amount Left: ${utils.formatEther(amount)}\n endBlock: ${await this.provider.getBlockNumber()}\n stakeRewards:${utils.formatEther(await this.Reward.balanceOf(stakingVault.address))}`)

    // })

    // it('gets Total Rewards', async function(){
    //   console.log(`Total Rewards:${await this.Farm.getTotalRewards(stakingVault.address)}`)
    // })

    })



