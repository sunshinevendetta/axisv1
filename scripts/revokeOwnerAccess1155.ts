import "./_loadEnv";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const OWNER_ACCESS_ABI = ["function revoke(address account, uint256 tokenId, uint256 amount)"];

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function main() {
  const rpcUrl = process.env.OWNER_ACCESS_ADMIN_RPC_URL ?? required("OWNER_ACCESS_DEPLOY_RPC_URL");
  const privateKey =
    process.env.OWNER_ACCESS_ADMIN_PRIVATE_KEY ?? required("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
  const contractAddress =
    process.env.OWNER_ACCESS_CONTRACT_ADDRESS ?? required("EPISODES_OWNER_ERC1155_ADDRESS");
  const compromisedWallet = required("OWNER_ACCESS_REVOKE_ACCOUNT");
  const tokenId = BigInt(required("OWNER_ACCESS_REVOKE_TOKEN_ID"));
  const amount = BigInt(process.env.OWNER_ACCESS_REVOKE_AMOUNT ?? "1");

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, OWNER_ACCESS_ABI, signer);

  console.log(`Revoking token ${tokenId} x${amount} from ${compromisedWallet}...`);
  const tx = await contract.revoke(compromisedWallet, tokenId, amount);
  const receipt = await tx.wait();
  console.log(`Revocation confirmed in tx ${receipt?.hash ?? "pending"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
