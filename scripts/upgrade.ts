import hre from "hardhat";

async function main() {
    const { ethers } = await hre.network.connect({
        network: "localhost",
    });

    const [currentAccount] = await ethers.getSigners();
    console.log("Current account:", currentAccount.address);

    const proxy = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const proxyAdmin = "0x75537828f2ce51be7289709686A69CbFDbB714F1";
    const v2Implementation = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const proxyAdminContract = await ethers.getContractAt("ProxyAdmin", proxyAdmin);
    const v2 = await ethers.getContractAt("V2", v2Implementation);

    const encodedFunctionCall = v2.interface.encodeFunctionData("decrease");

    console.log("Upgrading to V2...");
    const upgradeTx = await proxyAdminContract.connect(currentAccount).upgradeAndCall(proxy, v2Implementation, encodedFunctionCall);
    await upgradeTx.wait();
    console.log("Upgraded to V2");

    const v2Proxy = await ethers.getContractAt("V2", proxy);
    const currentValue = await v2Proxy.number();
    console.log("Current value after upgrade and call:", currentValue.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});