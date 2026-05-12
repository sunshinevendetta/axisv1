import { network } from "hardhat";
import { buildEpisodeRegistryPayload, getEpisodeFromCatalog } from "../src/lib/episodes";
import { readEpisodeCatalog } from "../src/lib/episodes-store";

const { ethers } = await network.connect();

async function main() {
  const registryAddress = process.env.AXIS_EVENT_ACCESS_REGISTRY_ADDRESS;
  const slug = process.env.EPISODE_SLUG;
  const existingEventId = process.env.AXIS_EVENT_ID;

  if (!registryAddress) {
    throw new Error("AXIS_EVENT_ACCESS_REGISTRY_ADDRESS is required.");
  }

  if (!slug) {
    throw new Error("EPISODE_SLUG is required.");
  }

  const catalog = await readEpisodeCatalog();
  const episode = getEpisodeFromCatalog(catalog, slug);

  if (!episode) {
    throw new Error(`Episode slug "${slug}" does not exist in the catalog.`);
  }

  const payload = buildEpisodeRegistryPayload(episode);
  const [signer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("AxisEventAccessRegistry", registryAddress, signer);

  if (existingEventId) {
    const tx = await registry.updateEvent(existingEventId, payload.name, payload.metadataURI, payload.active);
    await tx.wait();
    console.log(`Updated onchain event ${existingEventId} from catalog entry ${slug}.`);
    return;
  }

  const tx = await registry.createEvent(payload.name, payload.metadataURI);
  const receipt = await tx.wait();
  console.log(`Created onchain event from catalog entry ${slug}. Tx: ${receipt?.hash ?? "pending"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
