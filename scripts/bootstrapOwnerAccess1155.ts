import "./_loadEnv";
import { artifacts } from "hardhat";
import { Contract, ContractFactory, JsonRpcProvider, Wallet } from "ethers";

const OWNER_ACCESS_ABI = [
  "function mintOwner(address recipient)",
  "function mintAdmin(address recipient)",
  "function mintAiAgent(address recipient)",
];

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function normalizeRole(role: string) {
  return role.trim().toLowerCase().replace(/[-_\s]+/g, "");
}

async function main() {
  const rpcUrl = required("OWNER_ACCESS_DEPLOY_RPC_URL");
  const privateKey = required("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
  const adminAddress = required("OWNER_ACCESS_ADMIN_ADDRESS");
  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const initialMinterAddress = process.env.OWNER_ACCESS_INITIAL_MINTER_ADDRESS ?? signer.address;
  const recipient = process.env.OWNER_ACCESS_RECIPIENT ?? adminAddress;
  const role = normalizeRole(process.env.OWNER_ACCESS_ROLE ?? "owner");
  const baseUri = process.env.OWNER_ACCESS_BASE_URI ?? "ipfs://spectra-owner-access/{id}.json";
  const contractMetadataUri =
    process.env.OWNER_ACCESS_CONTRACT_METADATA_URI ?? "ipfs://spectra-owner-access/contract.json";

  const artifact = await artifacts.readArtifact("SpectraOwnerAccess1155");
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy(adminAddress, initialMinterAddress, baseUri, contractMetadataUri);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`SpectraOwnerAccess1155 deployed to ${address}`);

  const connected = new Contract(address, OWNER_ACCESS_ABI, signer);

  if (role === "owner") {
    await (await connected.mintOwner(recipient)).wait();
  } else if (role === "admin") {
    await (await connected.mintAdmin(recipient)).wait();
  } else if (role === "aiagent" || role === "agent") {
    await (await connected.mintAiAgent(recipient)).wait();
  } else {
    throw new Error("OWNER_ACCESS_ROLE must be owner, admin, or aiagent for bootstrap.");
  }

  console.log(`Minted ${role} key to ${recipient}`);
  console.log("");
  console.log("Add these to your .env:");
  console.log(`EPISODES_OWNER_ERC1155_ADDRESS=${address}`);
  console.log(`EPISODES_OWNER_ERC1155_TOKEN_ID=1,2`);
  console.log(`EPISODES_OWNER_RPC_URL=${rpcUrl}`);
  console.log("");
  console.log(`Owner admin address: ${adminAddress}`);
  console.log(`Initial minter address: ${initialMinterAddress}`);
  if (initialMinterAddress.toLowerCase() !== adminAddress.toLowerCase()) {
    console.log(
      "Recommendation: after bootstrap, have the admin key review whether the initial minter should keep MINTER_ROLE or be revoked.",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
