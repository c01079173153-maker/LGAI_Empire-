// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LegionAIPresale
 * @dev The official Treasury/Presale contract for LGAI.
 * Accepts ETH and distributes LGAI tokens. Master Key controlled.
 */
contract LegionAIPresale is Ownable, ReentrancyGuard {
    IERC20 public token;
    
    // Token price in wei. E.g. 1 ETH = 1,000,000 LGAI => rate = 1000000
    uint256 public rate = 1000000; 
    
    // Total ETH raised
    uint256 public weiRaised;
    
    // Presale active status
    bool public presaleActive = true;

    event TokensPurchased(address indexed purchaser, uint256 value, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Token address cannot be 0");
        token = IERC20(_tokenAddress);
    }

    // Allows the Commander to toggle presale status
    function setPresaleActive(bool _active) external onlyOwner {
        presaleActive = _active;
    }

    // Allows the Commander to change the token rate
    function setRate(uint256 _newRate) external onlyOwner {
        rate = _newRate;
    }

    // Buy tokens function
    receive() external payable {
        buyTokens();
    }

    function buyTokens() public payable nonReentrant {
        require(presaleActive, "Presale is currently closed");
        require(msg.value > 0, "Cannot buy with 0 ETH");

        uint256 weiAmount = msg.value;
        uint256 tokenAmount = weiAmount * rate;

        // Ensure the contract has enough tokens to sell
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in Treasury");

        weiRaised += weiAmount;

        // Transfer tokens to buyer
        token.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, weiAmount, tokenAmount);
    }

    /**
     * @dev The ultimate Master Key function for the Commander.
     * Allows the owner to withdraw all accumulated ETH from the treasury to their own wallet.
     * Used for creating Liquidity Pools or operational funding.
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), balance);
    }

    /**
     * @dev Allows the Commander to recover unsold LGAI tokens after presale ends.
     */
    function withdrawUnsoldTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        token.transfer(owner(), balance);
    }
}
