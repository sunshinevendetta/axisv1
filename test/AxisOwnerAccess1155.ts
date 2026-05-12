import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("AxisOwnerAccess1155", function () {
  it("lets the admin mint the owner access token", async function () {
    const [admin, ownerWallet] = await ethers.getSigners();
    const contract = await ethers.deployContract("AxisOwnerAccess1155", [
      admin.address,
      admin.address,
      "ipfs://owner-access/",
      "ipfs://owner-contract.json",
    ]);

    await expect(contract.mintOwner(ownerWallet.address))
      .to.emit(contract, "OwnerAccessMinted")
      .withArgs(ownerWallet.address, 1n, 1n);

    expect(await contract.balanceOf(ownerWallet.address, 1n)).to.equal(1n);
  });

  it("prevents peer-to-peer transfers so the keys stay soulbound", async function () {
    const [admin, ownerWallet, outsider] = await ethers.getSigners();
    const contract = await ethers.deployContract("AxisOwnerAccess1155", [
      admin.address,
      admin.address,
      "ipfs://owner-access/",
      "ipfs://owner-contract.json",
    ]);

    await contract.mintAdmin(ownerWallet.address);

    await expect(
      contract
        .connect(ownerWallet)
        .safeTransferFrom(ownerWallet.address, outsider.address, 2n, 1n, "0x"),
    ).to.be.revertedWith("AXIS_OWNER_ACCESS_NON_TRANSFERABLE");
  });

  it("lets the admin revoke a compromised access key", async function () {
    const [admin, aiAgent] = await ethers.getSigners();
    const contract = await ethers.deployContract("AxisOwnerAccess1155", [
      admin.address,
      admin.address,
      "ipfs://owner-access/",
      "ipfs://owner-contract.json",
    ]);

    await contract.mintAiAgent(aiAgent.address);
    await expect(contract.revoke(aiAgent.address, 3n, 1n))
      .to.emit(contract, "OwnerAccessRevoked")
      .withArgs(aiAgent.address, 3n, 1n);

    expect(await contract.balanceOf(aiAgent.address, 3n)).to.equal(0n);
  });

  it("lets a separate initial minter bootstrap keys while admin stays the root account", async function () {
    const [admin, initialMinter, ownerWallet] = await ethers.getSigners();
    const contract = await ethers.deployContract("AxisOwnerAccess1155", [
      admin.address,
      initialMinter.address,
      "ipfs://owner-access/",
      "ipfs://owner-contract.json",
    ]);

    await expect(contract.connect(initialMinter).mintOwner(ownerWallet.address))
      .to.emit(contract, "OwnerAccessMinted")
      .withArgs(ownerWallet.address, 1n, 1n);

    expect(await contract.balanceOf(ownerWallet.address, 1n)).to.equal(1n);
  });
});
