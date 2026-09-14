// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LegionAIToken
 * @dev ERC20 Token for LegionAI (LGAI) with an auto-burn mechanism.
 * 1 Billion Total Supply. 0.5% burn on every transfer.
 */
contract LegionAIToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant TARGET_SUPPLY = 500_000_000 * 10**18; // 50% of MAX_SUPPLY
    uint256 public constant BURN_RATE = 50; // 0.5% (basis points: 50 / 10000)

    // Exempt from burn (e.g., presale contract, owner)
    mapping(address => bool) public isExcludedFromBurn;

    constructor() ERC20("LegionAI", "LGAI") Ownable(msg.sender) {
        // Mint entire supply to the owner (Commander) initially
        _mint(msg.sender, MAX_SUPPLY);
        
        // Exclude owner from burn
        isExcludedFromBurn[msg.sender] = true;
    }

    function excludeFromBurn(address account, bool excluded) external onlyOwner {
        isExcludedFromBurn[account] = excluded;
    }

    /**
     * @dev Overrides the standard ERC20 _update function to implement the auto-burn mechanism.
     * OpenZeppelin v5 uses _update(from, to, amount) instead of _transfer, _mint, _burn separately.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        // If minting or burning directly, just process it normally
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        // Apply auto-burn if neither sender nor receiver is excluded, AND total supply hasn't reached the target
        if (!isExcludedFromBurn[from] && !isExcludedFromBurn[to] && totalSupply() > TARGET_SUPPLY) {
            uint256 burnAmount = (value * BURN_RATE) / 10000;
            
            // Ensure we don't burn past the TARGET_SUPPLY
            if (totalSupply() - burnAmount < TARGET_SUPPLY) {
                burnAmount = totalSupply() - TARGET_SUPPLY;
            }

            uint256 sendAmount = value - burnAmount;

            super._update(from, to, sendAmount);
            if (burnAmount > 0) {
                // Burn the tokens by sending them to the zero address
                super._update(from, address(0), burnAmount);
            }
        } else {
            super._update(from, to, value);
        }
    }
}
