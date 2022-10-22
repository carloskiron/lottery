import { ethers } from "ethers";
import { Lottery, Lottery__factory } from "../typechain-types";

let contract: Lottery;
const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 1;

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
        TOKEN_RATIO,
        ethers.utils.parseEther(BET_PRICE.toFixed(18)),
        ethers.utils.parseEther(BET_FEE.toFixed(18))
    );

    const txReceipt = await contract.deployed();
    console.log({ txReceipt })

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
