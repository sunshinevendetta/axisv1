import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SpectraSubmissionRegistry", function () {
  it("stores submissions and indexes them by applicant", async function () {
    const [admin, applicant] = await ethers.getSigners();
    const registry = await ethers.deployContract("SpectraSubmissionRegistry", [admin.address]);

    await registry.connect(applicant).createSubmission(ethers.id("artist@example.com"), "ipfs://submission-1");

    const submission = await registry.getSubmission(1n);
    const submissionIds = await registry.getSubmissionsByApplicant(applicant.address);

    expect(submission.applicant).to.equal(applicant.address);
    expect(submission.metadataURI).to.equal("ipfs://submission-1");
    expect(submission.approved).to.equal(false);
    expect(submission.minted).to.equal(false);
    expect(submissionIds).to.deep.equal([1n]);
  });

  it("only lets the applicant update metadata before minting", async function () {
    const [admin, applicant, stranger] = await ethers.getSigners();
    const registry = await ethers.deployContract("SpectraSubmissionRegistry", [admin.address]);

    await registry.connect(applicant).createSubmission(ethers.id("artist@example.com"), "ipfs://submission-1");

    await expect(
      registry.connect(stranger).updateSubmissionMetadata(1n, "ipfs://new-uri"),
    ).to.be.revertedWithCustomError(registry, "NotApplicant");

    await registry.connect(applicant).updateSubmissionMetadata(1n, "ipfs://new-uri");

    const submission = await registry.getSubmission(1n);
    expect(submission.metadataURI).to.equal("ipfs://new-uri");
  });

  it("only accepts mint notifications from the configured founder contract", async function () {
    const [admin, applicant, founderContract, stranger] = await ethers.getSigners();
    const registry = await ethers.deployContract("SpectraSubmissionRegistry", [admin.address]);

    await registry.connect(applicant).createSubmission(ethers.id("artist@example.com"), "ipfs://submission-1");
    await registry.setFounderMembershipContract(founderContract.address);

    await expect(
      registry.connect(stranger).markMinted(1n, 99n),
    ).to.be.revertedWithCustomError(registry, "UnauthorizedFounderContract");

    await registry.connect(founderContract).markMinted(1n, 99n);

    const submission = await registry.getSubmission(1n);
    expect(submission.minted).to.equal(true);
    expect(submission.mintedTokenId).to.equal(99n);
  });
});
