// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LotteryToken} from "./LotteryToken.sol";

contract Lottery is Ownable {
    //State Machine
    /// @notice Address of the token used as payment for the bets
    LotteryToken public paymentToken;
    /// @notice Amount of tokens given per ETH paid
    uint256 public purchaseRatio;
    /// @notice Amount of tokens required for placing a bet that goes for the prize pool
    uint256 public betPrice;
    /// @notice Amount of tokens required for placing a bet that goes for the owner pool
    uint256 public betFee;
    /// @notice Amount of tokens in the prize pool
    uint256 public prizePool;
    /// @notice Amount of tokens in the owner pool
    uint256 public ownerPool;
    /// @notice Flag indicating if the lottery is open for bets
    bool public betsOpen;
    /// @notice Timestamp of the lottery next closing date
    uint256 public betsClosingTime;
    /// @notice Mapping of prize available for withdraw for each account
    mapping(address => uint256) public prize;

    /// @dev List of bet slots
    address[] _slots;

    /// @notice Constructor function
    /// @param tokenName Name of the token used for payment
    /// @param tokenSymbol Symbol of the token used for payment
    /// @param _purchaseRatio Amount of ETH charged per Token
    /// @param _betPrice Amount of tokens required for placing a bet that goes for the prize pool
    /// @param _betFee Amount of tokens required for placing a bet that goes for the owner pool
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 _purchaseRatio,
        uint256 _betPrice,
        uint256 _betFee
    ) {
        paymentToken = new LotteryToken(tokenName, tokenSymbol);
        purchaseRatio = _purchaseRatio;
        betPrice = _betPrice;
        betFee = _betFee;
    }

    modifier whenBetsClosed() {
        require(!betsOpen, "Lottery: Bets are not closed");
        _;
    }

    modifier whenBetsOpen() {
        require(betsOpen, "Lottery: Bets are not open");
        _;
    }

    /// @param _closingTime target time in seconds expressed in epoch time for the bets to close
    function openBets(uint256 _closingTime) public onlyOwner whenBetsClosed {
        require(
            _closingTime > block.timestamp,
            "Closing time must be in the future!"
        );
        betsClosingTime = _closingTime;
        betsOpen = true;
    }

    function purchaseTokens(uint256 amount) public payable {
        require(betsOpen, "Bets are not open");
        paymentToken.mint(msg.sender, amount * purchaseRatio);
    }

    /// @notice Charge the bet price and create a new bet slot with the sender address
    function bet() public whenBetsOpen {
        ownerPool += betFee;
        prizePool += betPrice;
        _slots.push(msg.sender);
        paymentToken.transferFrom(msg.sender, address(this), betPrice + betFee);
    }

    /// @notice Call the bet function `times` times
    function betMany(uint256 times) public {
        require(times > 0);
        while (times > 0) {
            bet();
            times--;
        }
    }

    // @notice Close the lottery and calculates the prize, if any
    /// @dev Anyone can call this function if the owner fails to do so
    function closeLottery() public {
        require(
            block.timestamp >= betsClosingTime,
            "Lottery: Too soon to close"
        );
        require(betsOpen, "Lottery: Already closed");
        if (_slots.length > 0) {
            uint256 winnerIndex = getRandomNumber() % _slots.length;
            address winner = _slots[winnerIndex];
            prize[winner] += prizePool;
            prizePool = 0;
            delete (_slots);
        }
        betsOpen = false;
    }

    function getRandomNumber() public view returns (uint256) {
        return block.difficulty;
    }

    // @notice Withdraw `amount` from that accounts prize pool
    function prizeWithdraw(uint256 amount) public {
        require(amount <= prize[msg.sender], "Not enough prize");
        prize[msg.sender] -= amount;
        paymentToken.transfer(msg.sender, amount);
    }

    /// @notice Withdraw `amount` from the owner pool
    function ownerWithdraw(uint256 amount) public onlyOwner {
        require(amount <= ownerPool, "Not enough fees collected");
        ownerPool -= amount;
        paymentToken.transfer(msg.sender, amount);
    }

    /// @notice Burn `amount` tokens and give the equivalent ETH back to user
    function returnTokens(uint256 amount) public {
        paymentToken.burnFrom(msg.sender, amount);
        payable(msg.sender).transfer(amount / purchaseRatio);
    }
}
