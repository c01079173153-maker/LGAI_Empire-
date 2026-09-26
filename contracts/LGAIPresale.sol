// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LGAIPresale is Ownable, ReentrancyGuard {
    IERC20 public lgaiToken;
    uint256 public rate = 10000; // 1 ETH = 10,000 LGAI allocation
    bool public claimEnabled = false;

    // Database of allocations (who bought how much)
    mapping(address => uint256) public allocations;
    mapping(address => bool) public hasClaimed;

    uint256 public totalEthRaised;
    uint256 public totalTokensAllocated;

    event AllocationPurchased(address indexed buyer, uint256 ethSpent, uint256 allocatedTokens);
    event TokensClaimed(address indexed claimer, uint256 amount);
    event ClaimStatusUpdated(bool status);

    constructor() Ownable(msg.sender) {
        // Token address can be set later at TGE
    }

    // Phase 1: Buy Allocations
    function buyAllocation() public payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(!claimEnabled, "Presale has ended, claiming is active");
        
        uint256 allocatedTokens = msg.value * rate;
        
        allocations[msg.sender] += allocatedTokens;
        totalEthRaised += msg.value;
        totalTokensAllocated += allocatedTokens;

        emit AllocationPurchased(msg.sender, msg.value, allocatedTokens);
    }

    // Phase 2: Claim Tokens at TGE
    function claimTokens() public nonReentrant {
        require(claimEnabled, "Claiming is not active yet");
        require(!hasClaimed[msg.sender], "Already claimed");
        
        uint256 amount = allocations[msg.sender];
        require(amount > 0, "No allocation to claim");
        require(address(lgaiToken) != address(0), "Token not set");
        require(lgaiToken.balanceOf(address(this)) >= amount, "Not enough tokens in contract");

        hasClaimed[msg.sender] = true;
        require(lgaiToken.transfer(msg.sender, amount), "Transfer failed");

        emit TokensClaimed(msg.sender, amount);
    }

    // Admin Functions
    function setTokenAddress(address _token) public onlyOwner {
        lgaiToken = IERC20(_token);
    }

    function setClaimEnabled(bool _status) public onlyOwner {
        require(address(lgaiToken) != address(0), "Set token address first");
        claimEnabled = _status;
        emit ClaimStatusUpdated(_status);
    }

    function withdrawETH() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }

    function withdrawUnsoldTokens(uint256 amount) public onlyOwner {
        require(lgaiToken.transfer(owner(), amount), "Token withdrawal failed");
    }

    function setRate(uint256 newRate) public onlyOwner {
        rate = newRate;
    }
}
