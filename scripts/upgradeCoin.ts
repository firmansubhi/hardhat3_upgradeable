import hre from "hardhat";

async function main() {
    const { ethers } = await hre.network.connect({
        network: "localhost",
    });

    const [currentAccount] = await ethers.getSigners();
    console.log("Current account:", currentAccount.address);

    const proxy = "0xE9061F92bA9A3D9ef3f4eb8456ac9E552B3Ff5C8";
    const proxyAdmin = "0x402FB5eeB68a61575413359431433103F3F386CB";
    const v2Implementation = "0xC92B72ecf468D2642992b195bea99F9B9BB4A838";

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