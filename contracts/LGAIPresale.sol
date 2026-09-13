// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LGAIPresale is Ownable, ReentrancyGuard {
    IERC20 public lgaiToken;
    uint256 public rate = 10000; // 1 ETH = 10,000 LGAI
    uint256 public referralBonusPercent = 5; // 5% bonus for referrer

    // Events
    event TokensPurchased(address indexed buyer, uint256 ethSpent, uint256 tokensBought);
    event ReferralPaid(address indexed referrer, address indexed buyer, uint256 bonusAmount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        lgaiToken = IERC20(_tokenAddress);
    }

    // Function to buy tokens
    function buyTokens(address referrer) public payable nonReentrant {
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        uint256 ethAmount = msg.value;
        uint256 tokensToBuy = ethAmount * rate;

        // Check if contract has enough tokens
        require(lgaiToken.balanceOf(address(this)) >= tokensToBuy, "Not enough tokens in presale contract");

        // Send tokens to buyer
        require(lgaiToken.transfer(msg.sender, tokensToBuy), "Token transfer failed");
        emit TokensPurchased(msg.sender, ethAmount, tokensToBuy);

        // Handle referral
        if (referrer != address(0) && referrer != msg.sender) {
            uint256 bonusTokens = (tokensToBuy * referralBonusPercent) / 100;
            // Check if contract has enough tokens for bonus
            if (lgaiToken.balanceOf(address(this)) >= bonusTokens) {
                require(lgaiToken.transfer(referrer, bonusTokens), "Referral token transfer failed");
                emit ReferralPaid(referrer, msg.sender, bonusTokens);
            }
        }
    }

    // Function to withdraw collected ETH to owner
    function withdrawETH() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }

    // Function to withdraw remaining tokens (e.g. when presale ends)
    function withdrawTokens(uint256 amount) public onlyOwner {
        require(lgaiToken.transfer(owner(), amount), "Token withdrawal failed");
    }

    // Update rate
    function setRate(uint256 newRate) public onlyOwner {
        rate = newRate;
    }
}
