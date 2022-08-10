
const { expect,} = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

  
  
  describe("GooseBumpsStaking Testing", function () {

    before(async function () {

      //get signers
      [owner, user1, user2, user3, user4 ] = await ethers.getSigners();

      //get provider
      this.provider = ethers.provider;
      
      //get contract factory
      this.LP = await ethers.getContractFactory("MockBUSD")  
      this.Reward = await ethers.getContractFactory("MockBUSD");
      this.Farm = await ethers.getContractFactory("GooseBumpsStaking")

      //deploy LP and Reward Contract
      this.LP = await this.LP.deploy()
      this.Reward  =await this.Reward.deploy()

      //Get instance of deployed LP and Reward  (address needed to deploy Farm)
       await this.LP.deployed()
       await this.Reward.deployed()

      //deploy Farm and get address
      this.Farm = await this.Farm.deploy(
        this.LP.address, this.Reward.address, user1.address, owner.address,10,100)
      await this.Farm.deployed()

    //Print out deployed contracts address
      console.log(` \n  LP deployed at: ${this.LP.address}
      \n  Reward deployed at: ${this.Reward.address}\n  Farm deployed at: ${this.Farm.address}`)

    });

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

    // describe('Get Operation', function() {
    //   it('Reads', async function(){

    //     console.log(`  rewardPerBlockTokenN: ${await this.Farm.rewardPerBlockTokenN()}
    //   \n rewardPerBlockTokenD: ${await this.Farm.rewardPerBlockTokenD()}
    //   \n lpToken: ${await this.Farm.lpToken()}
    //   \n rewardsToken: ${await this.Farm.rewardsToken()}
    //   \n REWARD_WALLET: ${await this.Farm.REWARD_WALLET()}`)

    //   })
      

    // })

    it('stakes', async function(){
      
      //Transfer from owner to user2 LP token to stake
      await this.LP.transfer(user2.address, utils.parseEther('1000'))
      //user2 approve Farm to use tokens
      await this.LP.connect(user2).approve(this.Farm.address, utils.parseEther('1000'))
      //stake
      await expect(this.Farm.connect(user2).stake(utils.parseEther('1000'))).to.emit(this.Farm, 'LogStake').withArgs(user2.address, utils.parseEther('1000'))
      
       //check staker info amount
       const {amount,startBlock,stakeRewards} = await this.Farm.staker(user2.address)
       console.log(`\n Amount staked: ${utils.formatEther(amount)}\n startBlock: ${startBlock}\n stakeRewards: ${stakeRewards}`)

       //print out TREASURY address
      console.log(`\n TREASURY address: ${ await this.Farm.TREASURY()}`)
       //check Treasury bal
      console.log(` TREASURY BAL: ${utils.formatEther(await this.LP.balanceOf(user1.address))}`)

      //reverts 1: require(_amount > 0, "Staking amount must be greater than zero");
      await expect(this.Farm.connect(user2).stake(utils.parseEther('0'))).to.be.revertedWith("Staking amount must be greater than zero")
      //reverts 2: require(staker[msg.sender].amount >= _amount, "Insufficient unstake");
      await expect(this.Farm.connect(user2).stake(utils.parseEther('1'))).to.be.revertedWith("Insufficient lpToken balance")

    })
    
    it('unstakes', async function(){
      //approve send of rewards
      await this.Reward.approve(this.Farm.address, utils.parseEther('1000'))
      //approve withdraw of LP from Treasury
      await this.LP.connect(user1).approve(this.Farm.address, utils.parseEther('1000'))
      //connect user 2 and unstake 500
      await expect(this.Farm.connect(user2).unstake(utils.parseEther('500'))).to.emit(this.Farm,'LogUnstake')
      //check staker info amount
      const {amount,startBlock,stakeRewards} = await this.Farm.staker(user2.address)
      console.log(` Amount Left: ${utils.formatEther(amount)}\n endBlock: ${await this.provider.getBlockNumber()}\n stakeRewards:${utils.formatEther(await this.Reward.balanceOf(user2.address))}`)

      //reverts 1: require(_amount > 0, "Unstaking amount must be greater than zero");
      await expect(this.Farm.connect(user2).unstake(utils.parseEther('0'))).to.be.revertedWith("Unstaking amount must be greater than zero")
      //reverts 2: require(staker[msg.sender].amount >= _amount, "Insufficient unstake");
      await expect(this.Farm.connect(user2).unstake(utils.parseEther('600'))).to.be.revertedWith("Insufficient unstake")

    })

    it('withdraws Rewards', async function(){
      await this.Reward.approve(this.Farm.address, utils.parseEther('10000'))
      expect(await this.Farm.connect(user2).withdrawRewards()).to.emit(this.Farm,'LogRewardsWithdrawal')

      //check staker info amount
      const {amount,startBlock,stakeRewards} = await this.Farm.staker(user2.address)
      console.log(` Amount Left: ${utils.formatEther(amount)}\n endBlock: ${await this.provider.getBlockNumber()}\n stakeRewards:${utils.formatEther(await this.Reward.balanceOf(user2.address))}`)

    })

    it('gets Total Rewards', async function(){
      console.log(`Total Rewards:${await this.Farm.getTotalRewards(user2.address)}`)
    })

    })



