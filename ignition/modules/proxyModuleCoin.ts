import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const proxyModuleCoin = buildModule("proxyModuleCoin", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const coin = m.contract("DORZ");

  const proxy = m.contract("TransparentUpgradeableProxy", [
	coin,
	proxyAdminOwner,
	"0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
	proxy,
	"AdminChanged",
	"newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { implementation: coin, proxyAdmin, proxy };
});

const coinModule =  buildModule("CoinModule", (m) => {
  const { implementation, proxy, proxyAdmin } = m.useModule(proxyModuleCoin);

  const coin = m.contractAt("DORZ", proxy);


  

  m.call(coin, "initialize", []);

  return { implementation, coin, proxy, proxyAdmin };
});

export default coinModule;