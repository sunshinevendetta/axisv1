import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("AxisFounderSeason1_1155", function () {
  async function deployFixture() {
    const [admin, applicant, collector] = await ethers.getSigners();
    const submissionRegistry = await ethers.deployContract("AxisSubmissionRegistry", [admin.address]);
    const founder = await ethers.deployContract("AxisFounderSeason1_1155", [
      admin.address,
      await submissionRegistry.getAddress(),
      "ipfs://founder/",
      "ipfs://contract-metadata.json",
      10,
    ]);

    await submissionRegistry.setFounderMembershipContract(await founder.getAddress());
    await submissionRegistry
      .connect(applicant)
      .createSubmission(ethers.id("artist@example.com"), "ipfs://submission-1");

    return { admin, applicant, collector, submissionRegistry, founder };
  }

  it("mints one founder token for an approved submission and links provenance", async function () {
    const { admin, applicant, submissionRegistry, founder } = await deployFixture();

    await submissionRegistry.connect(admin).setSubmissionApproval(1n, true);

    await expect(founder.connect(applicant).mintFounder(1n))
      .to.emit(founder, "FounderMinted")
      .withArgs(1n, 1n, applicant.address);

    expect(await founder.balanceOf(applicant.address, 1n)).to.equal(1n);
    expect(await founder.tokenIdToSubmissionId(1n)).to.equal(1n);
    expect(await founder.submissionIdToTokenId(1n)).to.equal(1n);

    const submission = await submissionRegistry.getSubmission(1n);
    expect(submission.minted).to.equal(true);
    expect(submission.mintedTokenId).to.equal(1n);
  });

  it("rejects minting when the submission is not approved or season is closed", async function () {
    const { admin, applicant, submissionRegistry, founder } = await deployFixture();

    await expect(founder.connect(applicant).mintFounder(1n)).to.be.revertedWithCustomError(
      founder,
      "SubmissionNotApproved",
    );

    await submissionRegistry.connect(admin).setSubmissionApproval(1n, true);
    await founder.connect(admin).closeSeason();

    await expect(founder.connect(applicant).mintFounder(1n)).to.be.revertedWithCustomError(
      founder,
      "SeasonAlreadyClosed",
    );
  });

  it("supports airdrops independently of submission-based mints", async function () {
    const { admin, collector, founder } = await deployFixture();

    await founder.connect(admin).airdrop([collector.address], 77n);

    expect(await founder.balanceOf(collector.address, 77n)).to.equal(1n);
    expect(await founder.getMintedTokenIdsByWallet(collector.address)).to.deep.equal([77n]);
  });
});
