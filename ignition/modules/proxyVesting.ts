import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const proxyVesting = buildModule("ProxyVesting", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const vesting = m.contract("Vesting");

  const proxy = m.contract("TransparentUpgradeableProxy", [
	vesting,
	proxyAdminOwner,
	"0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
	proxy,
	"AdminChanged",
	"newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { implementation: vesting, proxyAdmin, proxy };
});

const vestingModule =  buildModule("VestingModule", (m) => {
  const { implementation, proxy, proxyAdmin } = m.useModule(proxyVesting);

  const vesting = m.contractAt("Vesting", proxy);

  const dorzProxy = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
  const EthtoUsd = "0x694AA1769357215DE4FAC081bf1f309aDC325306";


  m.call(vesting, "initialize", [dorzProxy, EthtoUsd]);

  return { implementation, vesting, proxy, proxyAdmin };
});

export default vestingModule;