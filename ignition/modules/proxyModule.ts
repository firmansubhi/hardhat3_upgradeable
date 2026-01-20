import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const proxyModule = buildModule("proxyModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const dorz = m.contract("Dorz");

  const proxy = m.contract("TransparentUpgradeableProxy", [
	dorz,
	proxyAdminOwner,
	"0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
	proxy,
	"AdminChanged",
	"newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { implementation: dorz, proxyAdmin, proxy };
});

const dorzModule =  buildModule("CoinModule", (m) => {
  const { implementation, proxy, proxyAdmin } = m.useModule(proxyModule);

  const dorz = m.contractAt("Dorz", proxy);
  m.call(dorz, "initialize", [1]);

  return { implementation, dorz, proxy, proxyAdmin };
});

export default dorzModule;