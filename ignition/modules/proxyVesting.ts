import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const proxyVesting = buildModule("ProxyVesting", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const vesting = m.contract("Vesting");

  const proxyVest = m.contract("TransparentUpgradeableProxy", [
	vesting,
	proxyAdminOwner,
	"0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
	proxyVest,
	"AdminChanged",
	"newAdmin"
  );

  const proxyAdminVest = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { implementation: vesting, proxyAdminVest, proxyVest };
});

const vestingModule =  buildModule("VestingModule", (m) => {
  const { implementation, proxyVest, proxyAdminVest } = m.useModule(proxyVesting);

  const vesting = m.contractAt("Vesting", proxyVest);

  const dorzProxy = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
  const EthtoUsd = "0x694AA1769357215DE4FAC081bf1f309aDC325306";


  m.call(vesting, "initialize", [dorzProxy, EthtoUsd]);

  return { implementation, vesting, proxyVest, proxyAdminVest };
});

export default vestingModule;