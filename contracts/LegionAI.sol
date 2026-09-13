// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Legion AI (LGAI)
 * @dev Implementation of the Legion AI Token.
 * - Total Supply: 1,000,000,000 LGAI
 * - Tax System: 4% Total Tax on transfers (2% Liquidity, 2% CEO Wallet)
 * 
 * Powered by a 10,000 AI Agent Legion Ecosystem.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract LegionAI is Context, IERC20, Ownable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) private _isExcludedFromFee;

    string private constant _name = "Legion AI";
    string private constant _symbol = "LGAI";
    uint8 private constant _decimals = 18;
    uint256 private constant _totalSupply = 1_000_000_000 * 10**_decimals;

    uint256 public liquidityFee = 2; // 2%
    uint256 public devFee = 2;       // 2%
    uint256 public totalFee = 4;     // 4% total

    address public devWallet;

    constructor(address _devWallet) {
        require(_devWallet != address(0), "Dev wallet cannot be zero address");
        devWallet = _devWallet;
        
        _balances[_msgSender()] = _totalSupply;
        
        // Exclude owner and dev wallet from fee
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;
        _isExcludedFromFee[devWallet] = true;

        emit Transfer(address(0), _msgSender(), _totalSupply);
    }

    function name() public pure returns (string memory) { return _name; }
    function symbol() public pure returns (string memory) { return _symbol; }
    function decimals() public pure returns (uint8) { return _decimals; }
    function totalSupply() public pure override returns (uint256) { return _totalSupply; }
    function balanceOf(address account) public view override returns (uint256) { return _balances[account]; }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        return true;
    }

    function _approve(address owner, address spender, uint256 amount) private {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(address sender, address recipient, uint256 amount) private {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");

        uint256 taxAmount = 0;

        // Calculate tax if neither sender nor recipient is excluded
        if (!_isExcludedFromFee[sender] && !_isExcludedFromFee[recipient]) {
            taxAmount = (amount * totalFee) / 100;
        }

        uint256 transferAmount = amount - taxAmount;

        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        unchecked {
            _balances[sender] = senderBalance - amount;
            _balances[recipient] += transferAmount;
        }
        
        emit Transfer(sender, recipient, transferAmount);

        if (taxAmount > 0) {
            uint256 devShare = (taxAmount * devFee) / totalFee;
            uint256 liquidityShare = taxAmount - devShare;

            _balances[devWallet] += devShare;
            emit Transfer(sender, devWallet, devShare);

            _balances[address(this)] += liquidityShare;
            emit Transfer(sender, address(this), liquidityShare);
        }
    }

    function setDevWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Wallet cannot be zero address");
        devWallet = newWallet;
    }

    function setFees(uint256 _liquidityFee, uint256 _devFee) external onlyOwner {
        require(_liquidityFee + _devFee <= 10, "Total fee cannot exceed 10%");
        liquidityFee = _liquidityFee;
        devFee = _devFee;
        totalFee = _liquidityFee + _devFee;
    }
}
