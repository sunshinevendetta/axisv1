import ownerAccessArtifact from "@/artifacts/contracts/AxisOwnerAccess1155.sol/AxisOwnerAccess1155.json";
import { keccak256, toBytes } from "viem";

export const ownerAccessAbi = ownerAccessArtifact.abi;
export const ownerAccessBytecode = ownerAccessArtifact.bytecode as `0x${string}`;

export const OWNER_ACCESS_DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export const OWNER_ACCESS_CONTRACT_ROLES = {
  DEFAULT_ADMIN_ROLE: OWNER_ACCESS_DEFAULT_ADMIN_ROLE,
  MINTER_ROLE: keccak256(toBytes("MINTER_ROLE")),
  PAUSER_ROLE: keccak256(toBytes("PAUSER_ROLE")),
  URI_MANAGER_ROLE: keccak256(toBytes("URI_MANAGER_ROLE")),
} as const;

export const OWNER_ACCESS_PRESET_ROLES = ["owner", "admin", "aiagent"] as const;

export type OwnerAccessPresetRole = (typeof OWNER_ACCESS_PRESET_ROLES)[number];
export type OwnerAccessContractRoleName = keyof typeof OWNER_ACCESS_CONTRACT_ROLES;

export function normalizeOwnerAccessPresetRole(value: string): OwnerAccessPresetRole | "custom" {
  const normalized = value.trim().toLowerCase().replace(/[-_\s]+/g, "");

  if (normalized === "owner") {
    return "owner";
  }

  if (normalized === "admin") {
    return "admin";
  }

  if (normalized === "aiagent" || normalized === "agent") {
    return "aiagent";
  }

  return "custom";
}

export function normalizeOwnerAccessContractRoleName(value: string): OwnerAccessContractRoleName {
  const normalized = value.trim().toUpperCase().replace(/[-\s]+/g, "_");

  if (!(normalized in OWNER_ACCESS_CONTRACT_ROLES)) {
    throw new Error(
      "Contract role must be DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE, or URI_MANAGER_ROLE.",
    );
  }

  return normalized as OwnerAccessContractRoleName;
}

