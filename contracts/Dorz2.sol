// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract Dorz2 is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    uint256 public upgradeIncrement;

    function initialize(uint _num) public initializer {
        __ERC20_init("DORZ", "DORZ");
        __Ownable_init(msg.sender);

        _mint(msg.sender, 1000_000_000 * 10 ** decimals());
        upgradeIncrement = _num;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function version() public pure returns (string memory) {
        return "2.0.0";
    }

    function vdAddress() public view returns (address tokenAmount) {
        address ownerBalance = address(this);
        return ownerBalance;
    }

    function naik() external {
        upgradeIncrement += 1;
    }

    function getNaik() public view returns (uint256 angka) {
        return upgradeIncrement;
    }
}
