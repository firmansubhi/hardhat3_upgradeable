//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import "./Dorz.sol";

contract Vesting2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    Dorz public myToken;

    AggregatorV3Interface internal dataFeed;

    //price simulation for USD & ETH for testing
    int256 public usdEthPrice;
    int256 public myCoinUsdPrice;

    //20% = 2000 basis points
    int256 public APR_RATE;

    //variable to store the increment value of the vesting order
    uint256 public dataIncrement;

    receive() external payable {}

    constructor() {
        _disableInitializers();
    }

    function initialize(
        address dorzProxy,
        address EthtoUsd
    ) public initializer {
        __Ownable_init(msg.sender);

        usdEthPrice = 1000 * 10 ** 8; // 1 eth = 1000 usd
        myCoinUsdPrice = 100 * 10 ** 8; // 1 usd = 100 dorz
        APR_RATE = 2000;
        dataIncrement = 0;

        //address chainlink for get ETH to USD price
        dataFeed = AggregatorV3Interface(EthtoUsd);

        myToken = Dorz(dorzProxy);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    /**
     * @notice Allow the owner of the contract to withdraw ETH
     */
    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "You have insufficient balance");

        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Unable to withdraw");
    }

    /**
     * @notice get ETH balance
     */
    function vdETHBalance()
        public
        view
        onlyOwner
        returns (uint256 tokenAmount)
    {
        uint256 ownerBalance = address(this).balance;
        return ownerBalance;
    }

    struct Vest {
        address userAddress;
        uint256 order;
        uint256 dataID;
        bool isInitialized;
    }

    struct VestData {
        int256 amount;
        int256 aprAmount;
        uint256 lockUpTime;
        uint256 coinClaimed;
        uint256 claimTime;
        bool claimStatus;
    }

    mapping(address => mapping(uint256 => Vest)) public Vests;
    mapping(uint256 => VestData) public VestingData;

    /**
     * @notice return USD price per 1 ETH
     */
    function getPriceUSDperETH() public view returns (int256) {
        //uncomment to return real price from aggregator
        //(, int256 answer, , , ) = dataFeed.latestRoundData();
        //return answer;

        //return mock up data
        return usdEthPrice;
    }

    /**
     * @notice return OThree price per 1 USD
     */
    function getPriceMyCoinperUSD() public view returns (int256) {
        //return mock up data
        return myCoinUsdPrice;
    }

    /**
     * @notice return USD value and APR in USD from ETH to be paid
     */
    function getUSDAmount(int256 ethQty) public view returns (int256, int256) {
        require(ethQty > 0, "Vesting amount has to be greater than $0");

        int256 usdPrice = getPriceUSDperETH();
        int256 val = (usdPrice * ethQty) / 1e8;
        int256 apr = (((usdPrice * ethQty) * APR_RATE) / 10000) / 1e8;

        return (val, apr);
    }

    /**
     * @notice return ETH value and APR in USD from USD to be paid
     */
    function getETHAmount(int256 usdQty) public view returns (int256, int256) {
        require(usdQty > 0, "Vesting amount has to be greater than $0");

        int256 usdPrice = getPriceUSDperETH();
        int256 val = (usdQty * 10 ** 8) / usdPrice;
        int256 apr = ((usdQty * APR_RATE) / 10000);

        return (val, apr);
    }

    event CreateVest(
        address buyer,
        uint256 amountOfETH,
        int256 amountOfUSD,
        int256 amountOfAPR,
        uint256 lockTime
    );

    event ClaimVest(
        address sender,
        uint256 coinQty,
        int256 amountOfUSD,
        int256 amountOfAPR
    );

    function createVest(
        uint256 orderNumber
    ) public payable returns (int256, int256, uint256) {
        require(msg.value > 0, "Vesting amount has to be greater than $0");
        require(orderNumber > 0, "This ID is not valid");

        bool isExist = checkVestOrderExist(orderNumber);
        require(!isExist, "This ID has been used");

        int256 val = int256(msg.value);
        (int256 amount, int256 apr) = getUSDAmount(val);
        uint256 lockUpTime = block.timestamp - 1 days;
        uint256 claimTime;
        uint256 coinClaimed;

        buildVest(orderNumber, amount, apr, lockUpTime, claimTime, coinClaimed);

        emit CreateVest(msg.sender, msg.value, amount, apr, lockUpTime);

        return (amount, apr, lockUpTime);
    }

    function buildVest(
        uint256 orderNumber,
        int256 amount,
        int256 apr,
        uint256 lockUpTime,
        uint256 claimTime,
        uint256 coinClaimed
    ) public payable {
        dataIncrement++;

        Vests[msg.sender][orderNumber] = Vest({
            userAddress: msg.sender,
            order: orderNumber,
            dataID: dataIncrement,
            isInitialized: true
        });

        VestingData[dataIncrement] = VestData({
            amount: amount,
            aprAmount: apr,
            lockUpTime: lockUpTime,
            coinClaimed: coinClaimed,
            claimTime: claimTime,
            claimStatus: false
        });
    }

    function checkVestOrderExist(uint256 order) public view returns (bool) {
        return Vests[msg.sender][order].isInitialized;
    }

    function getVestDataID(
        uint256 orderNumber
    ) public view returns (bool, uint256) {
        uint256 dataID;

        bool isExist = checkVestOrderExist(orderNumber);

        if (isExist) {
            dataID = Vests[msg.sender][orderNumber].dataID;
            return (true, dataID);
        } else {
            return (false, dataID);
        }
    }

    function getVest(
        uint256 orderNumber
    ) public view returns (int256, int256, uint256, uint256, uint256, bool) {
        (bool isExist, uint256 dataID) = getVestDataID(orderNumber);
        require(isExist, "Your account is not valid");

        return (
            VestingData[dataID].amount,
            VestingData[dataID].aprAmount,
            VestingData[dataID].lockUpTime,
            VestingData[dataID].coinClaimed,
            VestingData[dataID].claimTime,
            VestingData[dataID].claimStatus
        );
    }

    function claimVest(uint256 orderNumber) public payable returns (uint256) {
        (bool isExist, uint256 id) = getVestDataID(orderNumber);
        require(isExist, "Your account is not valid");

        require(!VestingData[id].claimStatus, "Withdraw had been made");

        require(
            (VestingData[id].lockUpTime <= block.timestamp),
            "Withdrawal period is not valid"
        );

        int256 total = VestingData[id].amount + VestingData[id].aprAmount;
        int256 myCoinPrice = getPriceMyCoinperUSD();
        int256 coinQty = (total * myCoinPrice) / 1e8;
        uint256 qty = uint256(coinQty);

        uint256 vestingBalance = myToken.balanceOf(address(this));
        require((vestingBalance >= qty), "Insufficient supply");

        bool sent = myToken.transfer(msg.sender, qty);
        require(sent, "System error, please try again later");

        VestingData[id].coinClaimed = qty;
        VestingData[id].claimTime = block.timestamp;
        VestingData[id].claimStatus = true;

        emit ClaimVest(
            msg.sender,
            qty,
            VestingData[id].amount,
            VestingData[id].aprAmount
        );

        return qty;
    }

    function version() public pure returns (string memory) {
        return "2.0";
    }

    function updateAPR() external {
        APR_RATE += 1000;
    }
}
