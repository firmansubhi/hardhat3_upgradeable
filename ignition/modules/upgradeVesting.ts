import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import vestingModule from "./proxyVesting.js";


const upgradeVesting = buildModule("ProxyVesting4", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const { implementation, proxyVest, proxyAdminVest } = m.useModule(vestingModule);

  const vesting2 = m.contract("Vesting4");

  const encodedFunctionCall = m.encodeFunctionCall(vesting2, "naik", []);

  m.call(proxyAdminVest, "upgradeAndCall", [proxyVest, vesting2, encodedFunctionCall], {
    from: proxyAdminOwner,
  });

  return { proxyAdminVest, proxyVest };
});

const demoV2Module = buildModule("Vesting4Module", (m) => {
  const { proxyVest } = m.useModule(upgradeVesting);

  const demo = m.contractAt("Vesting4", proxyVest);

  return { demo };
});

export default demoV2Module;