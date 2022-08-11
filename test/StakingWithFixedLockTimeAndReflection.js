
const { expect,} = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");
const {setTimeout} = require("timers/promises")

  
  
  describe("StakingWithFixedLockTimeAndReflection", function () {

    before(async function () {

      //get signers
      [owner, rewardWallet,user1, user2, user3, user4 ] = await ethers.getSigners();

      //get provider
      this.provider = ethers.provider;
      
      //get contract factory
      this.LP = await ethers.getContractFactory("MockBUSD")  
      this.Reward = await ethers.getContractFactory("MockBUSD");
      this.Farm = await ethers.getContractFactory("GooseBumpsStakingWithFixedLockTimeAndReflection")
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
      

      //set Lock duration
      await expect(this.Farm.setLockTime(1)).to.emit(this.Farm, "LogSetLockTime").withArgs(1)

    //Print out deployed contracts addres
      console.log(`\nLP deployed at: ${this.LP.address}`)
      console.log(`Reward deployed at: ${this.Reward.address}`) 
      console.log(`Farm deployed at: ${this.Farm.address}`)
     });

   
    it('stakes-1', async function(){
      
      //Transfer from owner to user1 LP token to stake
      await this.LP.transfer(user1.address, utils.parseEther('1000'))
      //user1 approve Farm to use tokens
      await this.LP.connect(user1).approve(this.ST.address, utils.parseEther('1000'))
    
      //stake User1
      console.log('\x1b[33m%s\x1b[0m', 'User1')
      await expect(this.Farm.connect(user1).stake(
        utils.parseEther('1000'))).to.emit(
          this.Farm, 'LogStake').withArgs(user1.address, utils.parseEther('1000'))
      
       //check staker info amount
       const {amount,startBlock,stakeRewards} = await this.Farm.staker(user1.address)
       console.log(`\n\tAmount staked: ${utils.formatEther(amount)}`)
       console.log(`\tstartBlock: ${startBlock}`) 
       console.log(`\tstakeRewards: ${stakeRewards}`)

       //print out TREASURY address
      console.log(`\n\tTREASURY address: ${ await this.Farm.TREASURY()}`)
       //check Treasury bal
      console.log(`\tTREASURY BaL: ${utils.formatEther(await this.LP.balanceOf(this.ST.address))}`)
      console.log(`\tPending Rewards ${await this.RD.pendingReward(user1.address)}`)

      //reverts 1: require(_amount > 0, "Staking amount must be greater than zero");
      await expect(this.Farm.connect(user1).stake(
        utils.parseEther('0'))).to.be.revertedWith(
          "Staking amount must be greater than zero")

      //reverts 2: require(staker[msg.sender].amount >= _amount, "Insufficient unstake");
      await expect(this.Farm.connect(user1).stake(
        utils.parseEther('1'))).to.be.revertedWith("Insufficient stakeToken balance")


    //stake user2
    console.log('\x1b[33m%s\x1b[0m', 'User2')
    //Transfer from owner to user1 LP token to stake
    await this.LP.transfer(user2.address, utils.parseEther('500'))
    //user1 approve Farm to use tokens
    await this.LP.connect(user2).approve(this.ST.address, utils.parseEther('500'))
  
    //stake User2
    await expect(this.Farm.connect(user2).stake(
      utils.parseEther('500'))).to.emit(
        this.Farm, 'LogStake').withArgs(user2.address, utils.parseEther('500'))

    // //check staker info amount
    setTimeout('10000')
    const {amount2,startBlock2,stakeRewards2} = await this.Farm.staker(user2.address)
    console.log(`\n\tAmount staked: ${amount2}`)
    console.log(`\tstartBlock: ${startBlock2}`) 
    console.log(`\tstakeRewards: ${stakeRewards2}`)

    //check Treasury bal
   console.log(`\tTREASURY BaL: ${utils.formatEther(await this.LP.balanceOf(this.ST.address))}`)
   console.log(`\tPending Rewards ${await this.RD.pendingReward(user2.address)}`)

    })

    it('stakes-2', async function(){
      
        //Transfer from owner to user1 LP token to stake
        await this.LP.transfer(user1.address, utils.parseEther('1000'))
        //user1 approve Farm to use tokens
        await this.LP.connect(user1).approve(this.ST.address, utils.parseEther('1000'))
      
        //stake User1
        console.log('\x1b[33m%s\x1b[0m', 'User1')
        await expect(this.Farm.connect(user1).stake(
          utils.parseEther('1000'))).to.emit(
            this.Farm, 'LogStake').withArgs(user1.address, utils.parseEther('1000'))
        
         //check staker info amount
         const {amount,startBlock,stakeRewards} = await this.Farm.staker(user1.address)
         console.log(`\n\tAmount staked: ${utils.formatEther(amount)}`)
         console.log(`\tstartBlock: ${startBlock}`) 
         console.log(`\tstakeRewards: ${stakeRewards}`)
  
         //print out TREASURY address
        console.log(`\n\tTREASURY address: ${ await this.Farm.TREASURY()}`)
         //check Treasury bal
        console.log(`\tTREASURY BaL: ${utils.formatEther(await this.LP.balanceOf(this.ST.address))}`)
        console.log(`\tPending Rewards ${await this.RD.pendingReward(user1.address)}`)
  
        //reverts 1: require(_amount > 0, "Staking amount must be greater than zero");
        await expect(this.Farm.connect(user1).stake(
          utils.parseEther('0'))).to.be.revertedWith(
            "Staking amount must be greater than zero")
  
        //reverts 2: require(staker[msg.sender].amount >= _amount, "Insufficient unstake");
        await expect(this.Farm.connect(user1).stake(
          utils.parseEther('1'))).to.be.revertedWith("Insufficient stakeToken balance")
  
  
      //stake user2
      console.log('\x1b[33m%s\x1b[0m', 'User2')
      //Transfer from owner to user1 LP token to stake
      await this.LP.transfer(user2.address, utils.parseEther('500'))
      //user1 approve Farm to use tokens
      await this.LP.connect(user2).approve(this.ST.address, utils.parseEther('500'))
    
      //stake User2
      await expect(this.Farm.connect(user2).stake(
        utils.parseEther('500'))).to.emit(
          this.Farm, 'LogStake').withArgs(user2.address, utils.parseEther('500'))
  
      // //check staker info amount
      setTimeout('10000')
      const {amount2,startBlock2,stakeRewards2} = await this.Farm.staker(user2.address)
      console.log(`\n\tAmount staked: ${amount2}`)
      console.log(`\tstartBlock: ${startBlock2}`) 
      console.log(`\tstakeRewards: ${stakeRewards2}`)
  
      //check Treasury bal
     console.log(`\tTREASURY BaL: ${utils.formatEther(await this.LP.balanceOf(this.ST.address))}`)
     console.log(`\tPending Rewards ${await this.RD.pendingReward(user2.address)}`)
  
      })

    
    it('unstakes', async function(){

     
  
      //approve send of rewards
      await this.Reward.transfer(rewardWallet.address,utils.parseEther('1000000') )
      await this.Reward.connect(rewardWallet).approve(this.Farm.address, utils.parseEther('3000'))
      //approve withdraw of LP from Treasury

      //connect user 1 and unstake 500
      await expect(this.Farm.connect(user1).unstake(utils.parseEther('500'))).to.emit(this.Farm,'LogUnstake')
      //check staker info amount
      const {amount,startBlock,stakeRewards} = await this.Farm.staker(user1.address)
      console.log(`Amount Left: ${utils.formatEther(amount)}`)
      console.log(`endBlock: ${await this.provider.getBlockNumber()}`)
      console.log(`stakeRewards:${utils.formatEther(await this.Reward.balanceOf(user1.address))}`)

       //reverts 1: require(_amount > 0, "Unstaking amount must be greater than zero");
       await expect(this.Farm.connect(user1).unstake(
        utils.parseEther('0'))).to.be.revertedWith(
          "Unstaking amount must be greater than zero")

      //reverts 2: require(staker[msg.sender].amount >= _amount, "Insufficient unstake");
      await expect(this.Farm.connect(user1).unstake(
        utils.parseEther('1600'))).to.be.revertedWith("Insufficient unstake")

    
    })

    it('withdraws Rewards', async function(){
        
      await this.Reward.connect(rewardWallet).approve(this.Farm.address, utils.parseEther('3000'))
      expect(await this.Farm.connect(user1).withdrawRewards()).to.emit(this.Farm,'LogRewardsWithdrawal')

      //check staker info amount
      const {amount,startBlock,stakeRewards} = await this.Farm.staker(user1.address)
      console.log(`Amount Left: ${utils.formatEther(amount)}`)
      console.log(` endBlock: ${await this.provider.getBlockNumber()}`)
      console.log(`stakeRewards:${utils.formatEther(await this.Reward.balanceOf(user1.address))}`)

    })

    it('gets Total Rewards', async function(){
        console.log(`Total Rewards:${await this.Farm.getTotalRewards(user1.address)}`)
        const{amount,rewardDebt,} =await this.RD.getUserInfo(user1.address)
        console.log(`Rewards rewardDebt:${amount}`)

    })

    describe('Set Operations', function(){
      
      it('sets Treasury', async function(){
        await expect(this.Farm.setTreasury(user3.address)).to.emit(
          this.Farm,"LogSetTreasury").withArgs(user3.address)
      })

      it('sets Reward Wallet', async function(){
        await expect(
          this.Farm.setRewardWallet(user4.address)).to.emit(
            this.Farm, "LogSetRewardWallet").withArgs(user4.address)
      })

      it('sets pause', async function(){
        await expect(this.Farm.setPause()).to.emit(this.Farm, "Paused").withArgs(owner.address)
        expect(await this.Farm.paused()).to.be.equals(true)
      })

      it('sets Unpause', async function(){
        await expect(this.Farm.setUnpause()).to.emit(this.Farm, "Unpaused").withArgs(owner.address)
        expect(await this.Farm.paused()).to.be.equals(false)
      })


    })

    describe('StakingTreasury', function (){
        it('setStakingVault', async function(){
            await expect(this.ST.setStakingVault(
                user1.address)).to.emit(
                    this.ST, 'LogSetStakingVault').withArgs(user1.address)
        })

        it('setMinAmountReflection', async function(){
            await expect(this.ST.setMinAmountReflection(
                1)).to.emit(
                    this.ST, 'LogSetMinAmountReflection').withArgs(1)
        })

        it('setReflectionsDistributor', async function(){
            await expect(this.ST.setReflectionsDistributor(
                user1.address)).to.emit(
                    this.ST, 'LogSetReflectionsDistributor').withArgs(user1.address)
        })
    })

    describe('ReflectionsDistributor', function (){
        it('setTreasury', async function(){
            await expect(this.RD.setTreasury(
                user1.address)).to.emit(
                    this.RD, 'LogSetTreasury').withArgs(user1.address)
        })

        it('setMinAmountReflection', async function(){
            await expect(this.RD.setMinAmountReflection(
                1)).to.emit(
                    this.RD, 'LogSetMinAmountReflection').withArgs(1)
        })
    })


    })



