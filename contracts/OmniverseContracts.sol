/* ══════════════════════════════════════════
   LGAI OMNIVERSE — SMART CONTRACTS
   ══════════════════════════════════════════ */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function mint(address to, uint256 amount) external;
}

// ──────────────────────────────────────────
// 1. DePIN Vault — GPU 기여도 → LGAI 자동 지급
// ──────────────────────────────────────────
contract DePINVault {
    address public owner;
    IERC20 public lgaiToken;

    struct Node {
        address wallet;
        uint256 gpuVram;       // GB 단위
        uint256 joinedAt;
        uint256 totalEarned;
        bool active;
    }

    mapping(address => Node) public nodes;
    address[] public nodeList;

    uint256 public rewardPerVramPerDay = 10 * 1e18; // 1GB당 하루 10 LGAI
    uint256 public lastDistribution;

    event NodeConnected(address indexed wallet, uint256 vram);
    event RewardDistributed(address indexed wallet, uint256 amount);

    constructor(address _lgai) {
        owner = msg.sender;
        lgaiToken = IERC20(_lgai);
        lastDistribution = block.timestamp;
    }

    function connectNode(uint256 _gpuVramGB) external {
        require(_gpuVramGB > 0, "GPU VRAM must be > 0");
        nodes[msg.sender] = Node(msg.sender, _gpuVramGB, block.timestamp, 0, true);
        nodeList.push(msg.sender);
        emit NodeConnected(msg.sender, _gpuVramGB);
    }

    // 누구나 호출 가능 — 자율 보상 분배 (매 24시간)
    function distributeRewards() external {
        require(block.timestamp >= lastDistribution + 1 days, "Too early");
        for (uint i = 0; i < nodeList.length; i++) {
            Node storage node = nodes[nodeList[i]];
            if (node.active) {
                uint256 reward = node.gpuVram * rewardPerVramPerDay;
                node.totalEarned += reward;
                lgaiToken.mint(node.wallet, reward);
                emit RewardDistributed(node.wallet, reward);
            }
        }
        lastDistribution = block.timestamp;
    }

    function getNodeCount() external view returns (uint256) { return nodeList.length; }
    function estimateDailyReward(uint256 vramGB) external view returns (uint256) { return vramGB * rewardPerVramPerDay; }
}

// ──────────────────────────────────────────
// 2. RWA Burn Engine — 실물 이자 → LGAI 자동 소각
// ──────────────────────────────────────────
contract RWABurnEngine {
    address public owner;
    IERC20 public lgaiToken;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    uint256 public totalBurned;
    uint256 public lastBurnTime;
    uint256 public treasuryEthBalance;

    event BurnExecuted(uint256 ethUsed, uint256 lgaiBurned, uint256 timestamp);

    constructor(address _lgai) {
        owner = msg.sender;
        lgaiToken = IERC20(_lgai);
        lastBurnTime = block.timestamp;
    }

    receive() external payable {
        treasuryEthBalance += msg.value;
    }

    // 누구나 호출 가능 — 매 24시간마다 자율 소각 실행
    function executeDailyBurn() external {
        require(block.timestamp >= lastBurnTime + 1 days, "Too early");
        require(treasuryEthBalance > 0, "No ETH in treasury");

        // 이자 수익의 10%를 소각에 사용
        uint256 burnBudget = treasuryEthBalance / 10;
        // 시뮬레이션: 1 ETH = 10,000 LGAI 기준으로 소각량 계산
        uint256 lgaiToBurn = (burnBudget * 10000) / 1e18;

        uint256 balance = lgaiToken.balanceOf(address(this));
        if (lgaiToBurn > balance) lgaiToBurn = balance;

        lgaiToken.transfer(BURN_ADDRESS, lgaiToBurn);
        totalBurned += lgaiToBurn;
        lastBurnTime = block.timestamp;

        emit BurnExecuted(burnBudget, lgaiToBurn, block.timestamp);
    }

    function getTreasuryInfo() external view returns (uint256 ethBal, uint256 burned, uint256 nextBurn) {
        return (treasuryEthBalance, totalBurned, lastBurnTime + 1 days);
    }
}

// ──────────────────────────────────────────
// 3. Social Launchpad — 팬 토큰 3-클릭 발행
// ──────────────────────────────────────────
contract SocialLaunchpad {
    address public owner;
    IERC20 public lgaiToken;

    struct CreatorToken {
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 priceInLGAI;
        address creator;
        uint256 sold;
    }

    mapping(uint256 => CreatorToken) public tokens;
    mapping(uint256 => mapping(address => uint256)) public balances;
    uint256 public tokenCount;

    uint256 public platformFeePercent = 5; // 5% to LGAI treasury

    event TokenLaunched(uint256 indexed tokenId, string name, address creator);
    event TokenPurchased(uint256 indexed tokenId, address buyer, uint256 amount);

    constructor(address _lgai) {
        owner = msg.sender;
        lgaiToken = IERC20(_lgai);
    }

    // Step 1~3: 3클릭 팬 토큰 발행
    function launchToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _priceInLGAI
    ) external returns (uint256 tokenId) {
        tokenId = tokenCount++;
        tokens[tokenId] = CreatorToken(_name, _symbol, _totalSupply, _priceInLGAI, msg.sender, 0);
        emit TokenLaunched(tokenId, _name, msg.sender);
    }

    // LGAI로만 팬 토큰 구매 강제
    function buyToken(uint256 _tokenId, uint256 _amount) external {
        CreatorToken storage ct = tokens[_tokenId];
        require(ct.sold + _amount <= ct.totalSupply, "Sold out");

        uint256 totalCost = ct.priceInLGAI * _amount;
        uint256 fee = (totalCost * platformFeePercent) / 100;
        uint256 creatorAmount = totalCost - fee;

        // LGAI로 결제 (LGAI 전용 결제 강제)
        lgaiToken.transfer(ct.creator, creatorAmount);
        lgaiToken.transfer(owner, fee); // 플랫폼 수수료 → LGAI treasury

        balances[_tokenId][msg.sender] += _amount;
        ct.sold += _amount;
        emit TokenPurchased(_tokenId, msg.sender, _amount);
    }

    function getAllTokens() external view returns (CreatorToken[] memory) {
        CreatorToken[] memory all = new CreatorToken[](tokenCount);
        for (uint i = 0; i < tokenCount; i++) all[i] = tokens[i];
        return all;
    }
}
