import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SpectraEventAccessRegistry", function () {
  it("creates events and assigns attendee or artist access", async function () {
    const [admin, attendee, artist] = await ethers.getSigners();
    const registry = await ethers.deployContract("SpectraEventAccessRegistry", [admin.address]);

    await registry.createEvent("Episode 3", "/api/episodes/episode-3/metadata");
    await registry.setAccess(1n, attendee.address, 1);
    await registry.setAccess(1n, artist.address, 2);

    const eventConfig = await registry["getEvent(uint256)"](1n);

    expect(eventConfig.name).to.equal("Episode 3");
    expect(eventConfig.metadataURI).to.equal("/api/episodes/episode-3/metadata");
    expect(eventConfig.exists).to.equal(true);
    expect(eventConfig.active).to.equal(true);
    expect(await registry.getAccess(1n, attendee.address)).to.equal(1n);
    expect(await registry.getAccess(1n, artist.address)).to.equal(2n);
  });

  it("rejects invalid wallets, inactive events, and mismatched batches", async function () {
    const [admin, attendee] = await ethers.getSigners();
    const registry = await ethers.deployContract("SpectraEventAccessRegistry", [admin.address]);

    await registry.createEvent("Episode 4", "/api/episodes/episode-4/metadata");
    await registry.deactivateEvent(1n);

    await expect(registry.setAccess(1n, attendee.address, 1)).to.be.revertedWithCustomError(
      registry,
      "InvalidEvent",
    );

    await expect(registry.clearAccess(1n, ethers.ZeroAddress)).to.be.revertedWithCustomError(
      registry,
      "InvalidWallet",
    );

    await expect(
      registry.batchSetAccess(1n, [attendee.address], [1, 2]),
    ).to.be.revertedWithCustomError(registry, "ArrayLengthMismatch");
  });

  it("respects pause state for mutating actions", async function () {
    const [admin, attendee] = await ethers.getSigners();
    const registry = await ethers.deployContract("SpectraEventAccessRegistry", [admin.address]);

    await registry.createEvent("Episode 5", "/api/episodes/episode-5/metadata");
    await registry.pause();

    await expect(registry.createEvent("Episode 6", "/api/episodes/episode-6/metadata"))
      .to.be.revertedWithCustomError(registry, "EnforcedPause");

    await expect(registry.clearAccess(1n, attendee.address)).to.be.revertedWithCustomError(
      registry,
      "EnforcedPause",
    );
  });
});
