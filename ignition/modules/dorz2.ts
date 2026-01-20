import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Dorz2Module", (m) => {
  const dorz2 = m.contract("Dorz2");


  return { dorz2 };
});