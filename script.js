// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PRIMAClaimV2 is Ownable {
    IERC20 public immutable prima;
    uint256 public immutable amount; // 50e18

    constructor(address token, uint256 fixedAmount) Ownable(msg.sender) {
        require(token != address(0), "token=0");
        require(fixedAmount > 0, "amt=0");
        prima = IERC20(token);
        amount = fixedAmount;
    }

    function claim() external {
        // balance check is redundant; failed transfer will revert anyway
        bool ok = prima.transfer(msg.sender, amount);
        require(ok, "transfer failed");
        // no event -> saves ~2k gas; add if you want on-chain logs
    }

    function recover(address token, uint256 amt) external onlyOwner {
        require(IERC20(token).transfer(owner(), amt), "recover failed");
    }
}