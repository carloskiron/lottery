import { expect } from "chai";
import { ethers } from "hardhat";
import { Lottery } from "../typechain-types";
import * as config from "../config";

describe("lotteryContract", () => {
  let lotteryContract: Lottery;

  beforeEach(async function () {
    const lotteryFactory = await ethers.getContractFactory("Lottery");
    lotteryContract = await lotteryFactory.deploy(
      "G2LotteryToken",
      "G2T",
      config.TOKEN_RATIO,
      ethers.utils.parseEther(config.BET_PRICE.toFixed(18)),
      ethers.utils.parseEther(config.BET_FEE.toFixed(18))
    );
    await lotteryContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("bets are closed", async function () {
      const [, eoa] = await ethers.getSigners();
      await expect(lotteryContract.connect(eoa).bet()).to.be.revertedWith(
        "Lottery: Bets are not open"
      );
    });

    it("returns random numbers", async function () {
      const [, eoa] = await ethers.getSigners();
      const randomNumberTab: Number[] = [];

      for (let i = 0; i < 1000; i++) {
        randomNumberTab.push(
          Number(await lotteryContract.connect(eoa).getRandomNumber())
        );
        const currentBlock = await ethers.provider.getBlock("latest");
        await ethers.provider.send("evm_mine", [currentBlock.timestamp + 1]);
      }

      const duplicates = randomNumberTab.filter(
        (item, index) => randomNumberTab.indexOf(item) !== index
      );

      console.log(randomNumberTab);

      expect(duplicates.length).to.be.equal(0);
    });
  });
});
