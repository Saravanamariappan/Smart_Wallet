// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SmartWallet is Ownable {
    

    event Deposit(address indexed sender, uint256 amount);
    event Executed(address indexed target, uint256 value, bytes data);
    event TokenTransferred(address indexed token, address indexed to, uint256 amount);


    constructor() Ownable(msg.sender) {}

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Deposit(msg.sender, msg.value);
    }


    function execute(
        address payable _to,
        uint256 _value,
        bytes calldata _data
    ) external onlyOwner returns (bytes memory) {
        require(address(this).balance >= _value, "Insufficient ETH balance");

        (bool success, bytes memory result) = _to.call{value: _value}(_data);
        require(success, "Transaction failed");

        emit Executed(_to, _value, _data);
        return result;
    }


    function sendETH(address payable _to, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient ETH balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH Transfer failed");

        emit Executed(_to, _amount, "");
    }

   
    function sendToken(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");

        bool success = token.transfer(_to, _amount);
        require(success, "Token transfer failed");

        emit TokenTransferred(_tokenAddress, _to, _amount);
    }


    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }
}