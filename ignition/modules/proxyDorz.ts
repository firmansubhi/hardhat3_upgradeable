import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const proxyDorzModule = buildModule("ProxyDorzModule", (m) => {
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

  return { proxyAdmin, proxy };
});

const dorzModule =  buildModule("DorzModule", (m) => {
  const { proxy, proxyAdmin } = m.useModule(proxyDorzModule);

  const dorz = m.contractAt("Dorz", proxy);
  m.call(dorz, "initialize", []);

  return { dorz, proxy, proxyAdmin };
});

export default dorzModule;