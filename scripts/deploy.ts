import { ethers } from "ethers";
import { Lottery, Lottery__factory } from "../typechain-types";
import * as config from "../config";

let contract: Lottery;

async function main() {
  //Getting my account
  const signer = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    ethers.getDefaultProvider("goerli")
  );

  const contractFactory = new Lottery__factory(signer);
  contract = await contractFactory.deploy(
    "G2LotteryToken",
    "G2T",
    config.TOKEN_RATIO,
    ethers.utils.parseEther(config.BET_PRICE.toFixed(18)),
    ethers.utils.parseEther(config.BET_FEE.toFixed(18))
  );

  const txReceipt = await contract.deployed();
  console.log({ txReceipt });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
