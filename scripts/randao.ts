import { ethers } from "hardhat";
import { Lottery, LotteryToken } from "../typechain-types";

let contract: Lottery;
let token: LotteryToken;
const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 1;

async function randao() {

    const contractFactory = await ethers.getContractFactory("Lottery");

    contractFactory.deploy(
        "LotteryToken",
        "LT0",
        TOKEN_RATIO,
        ethers.utils.parseEther(BET_PRICE.toFixed(18)),
        ethers.utils.parseEther(BET_FEE.toFixed(18))
    ).then(async (result: any) => {
        result.deployed().then(async (contract: Lottery) => {
            const currentBlock = await ethers.provider.getBlock("latest");
            const randomNumber = await contract.getRandomNumber();
            console.log(
                `Block number: ${currentBlock.number}\nBlock difficulty: ${currentBlock.difficulty}\nRandom number from this block difficulty: ${randomNumber}`
            );
            await ethers.provider.send("evm_mine", [currentBlock.timestamp + 1]);
            const currentBlock2 = await ethers.provider.getBlock("latest");
            const randomNumber2 = await contract.getRandomNumber();
            console.log(
                `Block number: ${currentBlock2.number}\nBlock difficulty: ${currentBlock2.difficulty}\nRandom number from this block difficulty: ${randomNumber2}`
            );
            await ethers.provider.send("evm_mine", [currentBlock2.timestamp + 1]);
            const currentBlock3 = await ethers.provider.getBlock("latest");
            const randomNumber3 = await contract.getRandomNumber();
            console.log(
                `Block number: ${currentBlock3.number}\nBlock difficulty: ${currentBlock3.difficulty}\nRandom number from this block difficulty: ${randomNumber3}`
            );
            await ethers.provider.send("evm_mine", [currentBlock3.timestamp + 1]);
            const currentBlock4 = await ethers.provider.getBlock("latest");
            const randomNumber4 = await contract.getRandomNumber();
            console.log(
                `Block number: ${currentBlock4.number}\nBlock difficulty: ${currentBlock4.difficulty}\nRandom number from this block difficulty: ${randomNumber4}`
            );
            await ethers.provider.send("evm_mine", [currentBlock4.timestamp + 1]);
            const currentBlock5 = await ethers.provider.getBlock("latest");
            const randomNumber5 = await contract.getRandomNumber();
            console.log(
                `Block number: ${currentBlock5.number}\nBlock difficulty: ${currentBlock5.difficulty}\nRandom number from this block difficulty: ${randomNumber5}`
            );
        });
    });
}

randao().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});