import { Contract, Interface, JsonRpcProvider, Wallet } from "ethers";
import { buildEpisodeRegistryPayload } from "@/src/lib/episodes";
import { readEpisodeCatalog, writeEpisodeCatalog } from "@/src/lib/episodes-store";

const EVENT_ACCESS_REGISTRY_ABI = [
  "function createEvent(string name, string metadataURI) returns (uint256 eventId)",
  "function updateEvent(uint256 eventId, string name, string metadataURI, bool active)",
  "event EventCreated(uint256 indexed eventId, string name, string metadataURI)",
];

const registryInterface = new Interface(EVENT_ACCESS_REGISTRY_ABI);

export async function syncEpisodeToRegistry(slug: string) {
  const rpcUrl = process.env.EPISODES_SYNC_RPC_URL;
  const privateKey = process.env.EPISODES_SYNC_PRIVATE_KEY;
  const registryAddress = process.env.SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS;

  if (!rpcUrl || !privateKey || !registryAddress) {
    throw new Error(
      "Missing sync configuration. Set EPISODES_SYNC_RPC_URL, EPISODES_SYNC_PRIVATE_KEY, and SPECTRA_EVENT_ACCESS_REGISTRY_ADDRESS.",
    );
  }

  const catalog = await readEpisodeCatalog();
  const index = catalog.findIndex((episode) => episode.slug === slug);

  if (index === -1) {
    throw new Error(`Episode "${slug}" was not found.`);
  }

  const episode = catalog[index];
  const payload = buildEpisodeRegistryPayload(episode);
  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(registryAddress, EVENT_ACCESS_REGISTRY_ABI, signer);

  if (episode.registryEventId) {
    const updateTx = await contract.updateEvent(
      episode.registryEventId,
      payload.name,
      payload.metadataURI,
      payload.active,
    );
    const receipt = await updateTx.wait();

    return {
      action: "updated" as const,
      transactionHash: receipt?.hash ?? updateTx.hash,
      registryEventId: episode.registryEventId,
    };
  }

  const createTx = await contract.createEvent(payload.name, payload.metadataURI);
  const receipt = await createTx.wait();

  let registryEventId: number | undefined;

  for (const log of receipt?.logs ?? []) {
    try {
      const parsedLog = registryInterface.parseLog(log);
      if (parsedLog?.name === "EventCreated") {
        registryEventId = Number(parsedLog.args.eventId);
        break;
      }
    } catch {
      // Ignore unrelated logs.
    }
  }

  if (registryEventId) {
    catalog[index] = {
      ...episode,
      registryEventId,
    };
    await writeEpisodeCatalog(catalog);
  }

  return {
    action: "created" as const,
    transactionHash: receipt?.hash ?? createTx.hash,
    registryEventId,
  };
}
