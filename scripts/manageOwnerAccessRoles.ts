import "./_loadEnv";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const OWNER_ACCESS_ABI = [
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function MINTER_ROLE() view returns (bytes32)",
  "function PAUSER_ROLE() view returns (bytes32)",
  "function URI_MANAGER_ROLE() view returns (bytes32)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
];

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function normalizeRoleName(roleName: string) {
  return roleName.trim().toUpperCase().replace(/[-\s]+/g, "_");
}

async function main() {
  const rpcUrl = process.env.OWNER_ACCESS_ADMIN_RPC_URL ?? required("OWNER_ACCESS_DEPLOY_RPC_URL");
  const privateKey =
    process.env.OWNER_ACCESS_ADMIN_PRIVATE_KEY ?? required("OWNER_ACCESS_DEPLOY_PRIVATE_KEY");
  const contractAddress =
    process.env.OWNER_ACCESS_CONTRACT_ADDRESS ?? required("EPISODES_OWNER_ERC1155_ADDRESS");
  const action = required("OWNER_ACCESS_ROLE_ACTION").trim().toLowerCase();
  const roleName = normalizeRoleName(required("OWNER_ACCESS_CONTRACT_ROLE"));
  const account = required("OWNER_ACCESS_ROLE_ACCOUNT");

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, OWNER_ACCESS_ABI, signer);

  let roleValue: string;

  if (roleName === "DEFAULT_ADMIN_ROLE") {
    roleValue = await contract.DEFAULT_ADMIN_ROLE();
  } else if (roleName === "MINTER_ROLE") {
    roleValue = await contract.MINTER_ROLE();
  } else if (roleName === "PAUSER_ROLE") {
    roleValue = await contract.PAUSER_ROLE();
  } else if (roleName === "URI_MANAGER_ROLE") {
    roleValue = await contract.URI_MANAGER_ROLE();
  } else {
    throw new Error("OWNER_ACCESS_CONTRACT_ROLE must be DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE, or URI_MANAGER_ROLE.");
  }

  const tx =
    action === "grant"
      ? await contract.grantRole(roleValue, account)
      : action === "revoke"
        ? await contract.revokeRole(roleValue, account)
        : (() => {
            throw new Error("OWNER_ACCESS_ROLE_ACTION must be grant or revoke.");
          })();

  console.log(`${action === "grant" ? "Granting" : "Revoking"} ${roleName} ${action === "grant" ? "to" : "from"} ${account}...`);
  const receipt = await tx.wait();
  console.log(`Role change confirmed in tx ${receipt?.hash ?? "pending"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
