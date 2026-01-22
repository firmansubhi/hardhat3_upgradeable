import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DorzModule", (m) => {
  const dorz = m.contract("Dorz");
  return { dorz };
});