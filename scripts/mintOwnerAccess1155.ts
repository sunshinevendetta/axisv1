import "./_loadEnv";
import { artifacts } from "hardhat";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const OWNER_ACCESS_ABI = [
  "function OWNER_TOKEN_ID() view returns (uint256)",
  "function ADMIN_TOKEN_ID() view returns (uint256)",
  "function AI_AGENT_TOKEN_ID() view returns (uint256)",
  "function mint(address recipient, uint256 tokenId, uint256 amount)",
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
  await artifacts.readArtifact("AxisOwnerAccess1155");

  const rpcUrl = process.env.OWNER_ACCESS_MINT_RPC_URL ?? required("OWNER_ACCESS_DEPLOY_RPC_URL");
  const privateKey =
    process.env.OWNER_ACCESS_MINT_PRIVATE_KEY ?? required("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
  const contractAddress = required("OWNER_ACCESS_CONTRACT_ADDRESS");
  const recipient = required("OWNER_ACCESS_RECIPIENT");
  const requestedRole = normalizeRole(process.env.OWNER_ACCESS_ROLE ?? "owner");
  const amount = BigInt(process.env.OWNER_ACCESS_AMOUNT ?? "1");

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, OWNER_ACCESS_ABI, signer);

  let tx;

  if (requestedRole === "owner") {
    tx = await contract.mintOwner(recipient);
    console.log(`Minting owner key to ${recipient}...`);
  } else if (requestedRole === "admin") {
    tx = await contract.mintAdmin(recipient);
    console.log(`Minting admin key to ${recipient}...`);
  } else if (requestedRole === "aiagent" || requestedRole === "agent") {
    tx = await contract.mintAiAgent(recipient);
    console.log(`Minting aiagent key to ${recipient}...`);
  } else {
    const tokenId = BigInt(required("OWNER_ACCESS_TOKEN_ID"));
    tx = await contract.mint(recipient, tokenId, amount);
    console.log(`Minting custom role token ${tokenId} x${amount} to ${recipient}...`);
  }

  const receipt = await tx.wait();
  console.log(`Mint confirmed in tx ${receipt?.hash ?? "pending"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
