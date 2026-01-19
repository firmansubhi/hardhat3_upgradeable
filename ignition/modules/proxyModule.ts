import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const proxyModule = buildModule("ProxyModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const v1 = m.contract("V1");
  const v2 = m.contract("V2");

  const proxy = m.contract("TransparentUpgradeableProxy", [
    v1,
    proxyAdminOwner,
    "0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { implementation: v1, proxyAdmin, proxy };
});

const v1Module = buildModule("V1Module", (m) => {
  const { implementation, proxy, proxyAdmin } = m.useModule(proxyModule);

  const v1 = m.contractAt("V1", proxy);
  m.call(v1, "initialValue", [10]);

  return { implementation, v1, proxy, proxyAdmin };
});

export default v1Module;