import hre from "hardhat";

async function main() {
    const { ethers } = await hre.network.connect({
        network: "localhost",
    });

    const [currentAccount] = await ethers.getSigners();
    console.log("Current account:", currentAccount.address);

    const proxy = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
    const proxyAdmin = "0x2b961E3959b79326A8e7F64Ef0d2d825707669b5";
    const v2Implementation = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";

    const proxyAdminContract = await ethers.getContractAt("ProxyAdmin", proxyAdmin);
    const v2 = await ethers.getContractAt("Dorz2", v2Implementation);

    const encodedFunctionCall = v2.interface.encodeFunctionData("naik");
    console.log("Upgrading to V2...");
    const upgradeTx = await proxyAdminContract.connect(currentAccount).upgradeAndCall(proxy, v2Implementation, encodedFunctionCall);
    await upgradeTx.wait();
    console.log("Upgraded to V2");

    const v2Proxy = await ethers.getContractAt("Dorz2", proxy);
    const currentValue = await v2Proxy.getNaik();
    console.log("Current value after upgrade and call:", currentValue.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});