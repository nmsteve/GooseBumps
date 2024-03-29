// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract GooseBumpsStaking is Ownable, Pausable {
    
    struct StakerInfo {
        uint256 amount;
        uint256 startBlock;
        uint256 stakeRewards;
    }

    // Staker Info
    mapping(address => StakerInfo) public staker;

    uint256 public immutable rewardPerBlockTokenN;
    uint256 public immutable rewardPerBlockTokenD; // Must be greater than zero

    IERC20 public immutable lpToken;
    IERC20 public immutable rewardsToken;

    address public TREASURY;
    address public REWARD_WALLET;

    event LogStake(address indexed from, uint256 amount);
    event LogUnstake(
        address indexed from,
        uint256 amount,
        uint256 amountRewards
    );
    event LogRewardsWithdrawal(address indexed to, uint256 amount);
    event LogSetTreasury(address indexed newTreasury);
    event LogSetRewardWallet(address indexed newRewardWallet);

    constructor(
        IERC20 _lpToken,
        IERC20 _rewardsToken,
        address _treasury,
        address _rewardWallet,
        uint256 _rewardPerBlockTokenN,
        uint256 _rewardPerBlockTokenD
    ) {
        require(address(_lpToken) != address(0), 'lpToken: cannot be address zero' );
        lpToken = _lpToken;
        require(address(_rewardsToken) != address(0), 'rewardsToken: cannot be address zero' );
        rewardsToken = _rewardsToken;
        require(address(_treasury) != address(0), 'TREASURY: cannot be address zero' );
        TREASURY = _treasury;
        require(address(_rewardWallet) != address(0), 'REWARD_WALLET: cannot be address zero' );
        REWARD_WALLET = _rewardWallet;
        rewardPerBlockTokenN = _rewardPerBlockTokenN;
        rewardPerBlockTokenD = _rewardPerBlockTokenD;
    }

    function stake(uint256 _amount) external whenNotPaused {
        require(_amount > 0, "Staking amount must be greater than zero");

        require(
            lpToken.balanceOf(msg.sender) >= _amount,
            "Insufficient lpToken balance"
        );

        if (staker[msg.sender].amount > 0) {
            staker[msg.sender].stakeRewards = getTotalRewards(msg.sender);
        }

        require(
            lpToken.transferFrom(msg.sender, TREASURY, _amount),
            "TransferFrom fail"
        );

        staker[msg.sender].amount += _amount;
        staker[msg.sender].startBlock = block.number;
        emit LogStake(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external whenNotPaused {
        require(_amount > 0, "Unstaking amount must be greater than zero");
        require(staker[msg.sender].amount >= _amount, "Insufficient unstake");

        uint256 amountWithdraw = _withdrawRewards();
        staker[msg.sender].amount -= _amount;
        staker[msg.sender].startBlock = block.number;
        staker[msg.sender].stakeRewards = 0;

        require(
            lpToken.transferFrom(TREASURY, msg.sender, _amount),
            "TransferFrom fail"
        );

        emit LogUnstake(msg.sender, _amount, amountWithdraw);
    }

    function _withdrawRewards() internal returns (uint256) {
        uint256 amountWithdraw = getTotalRewards(msg.sender);
        if (amountWithdraw > 0) {
            require(
                rewardsToken.transferFrom(
                    REWARD_WALLET,
                    msg.sender,
                    amountWithdraw
                ),
                "TransferFrom fail"
            );
        }
        return amountWithdraw;
    }

    function withdrawRewards() external whenNotPaused {
        uint256 amountWithdraw = _withdrawRewards();
        require(amountWithdraw > 0, "Insufficient rewards balance");
        staker[msg.sender].startBlock = block.number;
        staker[msg.sender].stakeRewards = 0;

        emit LogRewardsWithdrawal(msg.sender, amountWithdraw);
    }

    function getTotalRewards(address _staker) public view returns (uint256) {
        uint256 newRewards = ((block.number - staker[_staker].startBlock) *
            staker[_staker].amount *
            rewardPerBlockTokenN) / rewardPerBlockTokenD;
        return newRewards + staker[_staker].stakeRewards;
    }

    function setTreasury(address _tresuary) external onlyOwner {
        require(address( _tresuary) != address(0), 'TREASURY: cannot be address zero' );
        require(address(TREASURY) != address(0), 'TREASURY:setting to same value' );
        TREASURY = _tresuary;
        emit LogSetTreasury(TREASURY);
    }

    function setRewardWallet(address _rewardWallet) external onlyOwner {
         require(address( _rewardWallet) != address(0), 'TREASURY: cannot be address zero' );
        require(address(REWARD_WALLET) != address(0), 'TREASURY:setting to same value' );
        REWARD_WALLET = _rewardWallet;
        emit LogSetRewardWallet(REWARD_WALLET);
    }

    function setPause() external onlyOwner {
        _pause();
    }

    function setUnpause() external onlyOwner {
        _unpause();
    }
}