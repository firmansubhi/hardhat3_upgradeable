import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VestingModule", (m) => {
  const vesting = m.contract("Vesting");


  return { vesting };
});