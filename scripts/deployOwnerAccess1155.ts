import "./_loadEnv";
import { artifacts } from "hardhat";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function main() {
  const rpcUrl = required("OWNER_ACCESS_DEPLOY_RPC_URL");
  const privateKey = required("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
  const adminAddress = required("OWNER_ACCESS_ADMIN_ADDRESS");
  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const initialMinterAddress = process.env.OWNER_ACCESS_INITIAL_MINTER_ADDRESS ?? signer.address;
  const baseUri = process.env.OWNER_ACCESS_BASE_URI ?? "ipfs://spectra-owner-access/{id}.json";
  const contractMetadataUri =
    process.env.OWNER_ACCESS_CONTRACT_METADATA_URI ?? "ipfs://spectra-owner-access/contract.json";

  const artifact = await artifacts.readArtifact("SpectraOwnerAccess1155");
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy(adminAddress, initialMinterAddress, baseUri, contractMetadataUri);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`SpectraOwnerAccess1155 deployed to ${address}`);
  console.log(`Set EPISODES_OWNER_ERC1155_ADDRESS=${address}`);
  console.log(`Owner admin address: ${adminAddress}`);
  console.log(`Initial minter address: ${initialMinterAddress}`);
  console.log("Default role token IDs: owner=1 admin=2 aiagent=3");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
