// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// 유니스왑 V2 라우터 인터페이스 (자동 상장용)
interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract AutoLpLauncher {
    address public owner;
    IERC20 public lgaiToken;
    IUniswapV2Router02 public uniswapRouter;
    
    bool public isLaunched = false;
    uint256 public presaleRate = 10000; // 1 ETH = 10,000 LGAI

    event AutonomousLaunch(uint256 ethAdded, uint256 tokensAdded, uint256 timestamp);

    constructor(address _tokenAddress, address _routerAddress) {
        owner = msg.sender;
        lgaiToken = IERC20(_tokenAddress);
        uniswapRouter = IUniswapV2Router02(_routerAddress);
    }

    // 누구나 이 함수를 호출할 수 있음 (탈중앙화 상장 시스템)
    function finalizePresaleAndLaunch() external {
        require(!isLaunched, "Already launched on DEX");
        
        uint256 contractEthBalance = address(this).balance;
        uint256 contractTokenBalance = lgaiToken.balanceOf(address(this));

        require(contractEthBalance > 0, "No ETH collected");
        require(contractTokenBalance > 0, "No LGAI tokens for LP");

        // 유니스왑 라우터에 모든 LGAI 토큰 권한 위임
        lgaiToken.approve(address(uniswapRouter), contractTokenBalance);

        // 자율 유동성 풀(LP) 생성 및 상장 
        // 획득한 LP 토큰은 데드 주소(address(0))로 보내 영구 소각 (러그풀 불가능)
        uniswapRouter.addLiquidityETH{value: contractEthBalance}(
            address(lgaiToken),
            contractTokenBalance,
            0, 
            0, 
            address(0), // LP Tokens burned instantly
            block.timestamp + 300
        );

        isLaunched = true;
        emit AutonomousLaunch(contractEthBalance, contractTokenBalance, block.timestamp);
    }

    // 스마트 컨트랙트가 외부에서 ETH를 받을 수 있도록 허용
    receive() external payable {}
}
