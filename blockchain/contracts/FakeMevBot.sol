// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITrap {
    function executeArbitrage() external payable;
}

/**
 * @title FakeMevBot (시뮬레이션용 해커 봇)
 * @dev 실제 해커들이 사용하는 차익거래 봇의 구조를 모방한 컨트랙트입니다.
 */
contract FakeMevBot {
    function attack(address trapAddress) external payable {
        // 봇이 "executeArbitrage"를 호출하여 돈을 훔치려 시도합니다.
        // 이때 이 컨트랙트가 호출자가 되므로 덫에서는 msg.sender != tx.origin 이 성립합니다.
        ITrap(trapAddress).executeArbitrage{value: msg.value}();
    }
}
