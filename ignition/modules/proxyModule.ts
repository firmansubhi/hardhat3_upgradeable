import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const proxyModule = buildModule("proxyModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const coin = m.contract("Dorz");

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
  const { implementation, proxy, proxyAdmin } = m.useModule(proxyModule);

  const coin = m.contractAt("Dorz", proxy);
  m.call(coin, "initialize", [1]);

  return { implementation, coin, proxy, proxyAdmin };
});

export default coinModule;