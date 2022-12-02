const { assert } = require("chai");
const truffleAssertions = require("truffle-assertions");

const tokenContract = artifacts.require("./Token.sol");

require("chai").use(require("chai-as-promised")).should();

contract("Token", (accounts) => {
  let token;
  before(async () => {
    token = await tokenContract.new("Test", "TST", accounts[0]);
  });
  describe("deployment", async () => {
    it("deploys token successfully", async () => {
      const address = await token.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });
  });

  describe("TOKEN: metadata", async () => {
    it("has a name", async () => {
      const name = await token.name();
      name.should.equal("Test", "Name not set correctly");
    });

    it("has a symbol", async () => {
      const symbol = await token.symbol();
      symbol.should.equal("TST", "Symbol not set correctly");
    });

    it("has 18 decimals", async () => {
      const decimals = await token.decimals();
      decimals.toString().should.equal("18", "Decimals not set correctly");
    });

    it("should return totalSupply as 1 billion initially", async () => {
      const totalSupply = await token.totalSupply();
      totalSupply
        .toString()
        .should.equal("10000000000000000000000000000", "Total supply is not 0");
    });

    it("should return correct Hard Cap", async () => {
      const hard_cap = await token.hardCap();
      hard_cap
        .toString()
        .should.equal(
          "10000000000000000000000000000",
          "Hard cap not set correctly"
        );
    });
  });

  describe("TOKEN: transfers", async () => {
    it("should allow the users to transfer tokens", async () => {
      await token.transfer(accounts[2], "10000000000000000000");
      await token.transfer(accounts[3], "10000000000000000000", {
        from: accounts[2],
      });
      const balance = await token.balanceOf(accounts[3]);
      const balanceSender = await token.balanceOf(accounts[2]);
      balance
        .toString()
        .should.equal("10000000000000000000", "Transfer failed");
      balanceSender.toString().should.equal("0", "Transfer failed");
    });

    it("should not allow users to give approval to 0 address", async () => {
      await truffleAssertions.reverts(
        token.approve("0x0000000000000000000000000000000000000000", "100000", {
          from: accounts[3],
        }),
        "ERC20: approve to the zero address"
      );
    });

    it("should allow the users to give approval", async () => {
      await token.approve(accounts[4], "500000000", { from: accounts[3] });
      const approval = await token.allowance(accounts[3], accounts[4]);
      approval.toString().should.equal("500000000", "Allowance update failed");
    });

    it("should allow users to increase allowance", async () => {
      await token.increaseAllowance(accounts[4], "500000000", {
        from: accounts[3],
      });
      const approval = await token.allowance(accounts[3], accounts[4]);
      approval
        .toString()
        .should.equal("1000000000", "Allowance increase failed");
    });

    it("should allow users to decrease allowance", async () => {
      await token.decreaseAllowance(accounts[4], "500000000", {
        from: accounts[3],
      });
      const approval = await token.allowance(accounts[3], accounts[4]);
      approval
        .toString()
        .should.equal("500000000", "Allowance decrease failed");
    });

    it("should allow users to transfer from other wallets", async () => {
      await token.transferFrom(accounts[3], accounts[5], "100000000", {
        from: accounts[4],
      });
      const balance = await token.balanceOf(accounts[5]);
      balance.toString().should.equal("100000000", "Transfer failed");
      const approval = await token.allowance(accounts[3], accounts[4]);
      approval
        .toString()
        .should.equal("400000000", "Allowance not changed after transfer");
    });

    it("should not allow users to tranfer more than allowance", async () => {
      await truffleAssertions.reverts(
        token.transferFrom(accounts[3], accounts[5], "1000000000", {
          from: accounts[4],
        }),
        "ERC20: transfer amount exceeds allowance"
      );
    });

    it("should not allow users to decrease allowance below zero", async () => {
      await truffleAssertions.reverts(
        token.decreaseAllowance(accounts[4], "500000000", {
          from: accounts[3],
        }),
        "ERC20: decreased allowance below zero"
      );
    });

    it("should not allow transfer to 0 address", async () => {
      await truffleAssertions.reverts(
        token.transfer(
          "0x0000000000000000000000000000000000000000",
          "500000000",
          {
            from: accounts[3],
          }
        ),
        "ERC20: transfer to the zero address"
      );
    });

    it("should not allow transfer more than balance", async () => {
      await truffleAssertions.reverts(
        token.transfer(accounts[6], "500000000000000000000", {
          from: accounts[3],
        }),
        "ERC20: transfer amount exceeds balance"
      );
    });
  });
});
