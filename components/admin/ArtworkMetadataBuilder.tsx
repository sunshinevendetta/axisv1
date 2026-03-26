"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type {
  ARAppCollectStatus,
  EpisodeCollectibleRecord,
  EpisodeCollectiblesCatalog,
} from "@/src/content/collectibles";
import type { AssetKind } from "@/src/lib/grove";

type BuilderDefaults = {
  slug: string;
  label: string;
  number: number;
  chainId?: number;
  episodeLabel?: string;
  episodeDate?: string;
  contractAddress?: string;
  baseUri?: string;
  collectionMetadataUri?: string;
  image?: string;
  origin?: string;
};

type TokenDraft = {
  tokenId: string;
  status: ARAppCollectStatus;
  remaining: string;
  name: string;
  artist: string;
  description: string;
  image: string;
  animationUrl: string;
  mediaKind: string;
};

type UploadMode = "image" | "model";

type GroveUploadResult = {
  file_name: string;
  gateway_url: string | null;
  uri: string | null;
  status_url?: string | null;
  public_url?: string | null;
};

type Props = {
  defaults: BuilderDefaults;
};

const collectOptions: Array<{ label: string; value: ARAppCollectStatus }> = [
  { label: "Open now", value: "live" },
  { label: "Not yet", value: "coming-soon" },
  { label: "Finished", value: "sold-out" },
];

function toTokenDraft(tokenId: number): TokenDraft {
  return {
    tokenId: tokenId.toString(),
    status: "coming-soon",
    remaining: "0",
    name: "",
    artist: "",
    description: "",
    image: "",
    animationUrl: "",
    mediaKind: "",
  };
}

function inferSecondaryMediaKind(fileName: string): string {
  const normalized = fileName.split("?")[0].toLowerCase();
  if (normalized.endsWith(".glb") || normalized.endsWith(".gltf")) return "model";
  if (normalized.endsWith(".mp4") || normalized.endsWith(".webm") || normalized.endsWith(".mov") || normalized.endsWith(".m4v")) return "video";
  if (normalized.endsWith(".mp3") || normalized.endsWith(".wav") || normalized.endsWith(".ogg")) return "audio";
  return "other";
}

function buildDraftTitleFromFileName(fileName: string) {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ensureTokenDraftCount(current: TokenDraft[], targetCount: number) {
  if (current.length >= targetCount) {
    return current;
  }

  const next = [...current];
  let nextTokenId = next.length ? Number(next[next.length - 1]?.tokenId || "0") + 1 : 1;
  while (next.length < targetCount) {
    next.push(toTokenDraft(nextTokenId));
    nextTokenId += 1;
  }
  return next;
}

function batchTargetIndexes(current: TokenDraft[], targetCount: number, mode: UploadMode) {
  const preferredIndexes = current
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => (mode === "image" ? !token.image.trim() : !token.animationUrl.trim()))
    .map(({ index }) => index);

  if (preferredIndexes.length >= targetCount) {
    return preferredIndexes.slice(0, targetCount);
  }

  const used = new Set(preferredIndexes);
  const fallbackIndexes = current
    .map((_, index) => index)
    .filter((index) => !used.has(index));

  return [...preferredIndexes, ...fallbackIndexes].slice(0, targetCount);
}

function toPublicUrl(value: string) {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function draftToRecord(defaults: BuilderDefaults, draft: EpisodeCollectibleRecord, tokens: TokenDraft[]): EpisodeCollectibleRecord {
  return {
    ...draft,
    slug: draft.slug.trim(),
    claimOpen: Boolean(draft.claimOpen),
    chainId: draft.chainId || defaults.chainId,
    contractAddress: draft.contractAddress?.trim() || defaults.contractAddress || undefined,
    baseUri: draft.baseUri?.trim() || defaults.baseUri || undefined,
    collectionMetadataUri: draft.collectionMetadataUri?.trim() || defaults.collectionMetadataUri || undefined,
    nfcBaseUrl: draft.nfcBaseUrl?.trim() || undefined,
    tokens: tokens
      .map((token) => {
        const tokenId = Number(token.tokenId);
        const episodeLink = `/arapp/collect/${draft.slug}/${tokenId}`;
        return {
          tokenId,
          status: token.status,
          remaining: Number(token.remaining || "0"),
          metadata: {
            name: token.name.trim(),
            description: token.description.trim(),
            image: token.image.trim(),
            animation_url: token.animationUrl.trim(),
            external_url: episodeLink,
            attributes: [
              { trait_type: "Episode", value: defaults.episodeLabel || `Episode ${defaults.number}` },
              { trait_type: "Date", value: defaults.episodeDate || "TBD" },
              { trait_type: "Artist", value: token.artist.trim() || "Unknown Artist" },
              { trait_type: "Title", value: token.name.trim() || `Artwork ${tokenId}` },
              { trait_type: "Edition", value: token.remaining.trim() && token.remaining !== "0" ? `${token.remaining.trim()} available` : "Open collect" },
              { trait_type: "Format", value: token.animationUrl.trim() ? "Artwork + media" : "Artwork" },
              { trait_type: "Surface", value: "Episode collectible" },
              { trait_type: "Claim Status", value: token.status },
            ],
            properties: {
              title: token.name.trim() || `Artwork ${tokenId}`,
              episode: defaults.episodeLabel || `Episode ${defaults.number}`,
              date: defaults.episodeDate || "TBD",
              artist: token.artist.trim() || "Unknown Artist",
              subtitle: token.description.trim(),
              edition: token.remaining.trim() && token.remaining !== "0" ? `${token.remaining.trim()} available` : "Open collect",
              format: token.animationUrl.trim() ? "Artwork + media" : "Artwork",
              surface: "Episode collectible",
              delivery: "Added to wallet after collect",
              utilities: [],
              chips: [],
              model: token.animationUrl.trim(),
              mediaKind: token.mediaKind.trim(),
            },
          },
        };
      })
      .filter((token) => Number.isInteger(token.tokenId) && token.tokenId >= 0 && token.metadata.name),
  };
}

function recordToTokenDrafts(record: EpisodeCollectibleRecord): TokenDraft[] {
  if (!record.tokens.length) {
    return [toTokenDraft(1)];
  }

  return record.tokens.map((token) => ({
    tokenId: token.tokenId.toString(),
    status: token.status,
    remaining: token.remaining.toString(),
    name: token.metadata.name ?? "",
    artist: token.metadata.properties?.artist ?? token.metadata.attributes.find((item) => item.trait_type === "Artist")?.value ?? "",
    description: token.metadata.description ?? "",
    image: token.metadata.image ?? "",
    animationUrl: token.metadata.animation_url ?? "",
    mediaKind: token.metadata.properties?.mediaKind ?? "",
  }));
}

function buildEpisodeContractJson(record: EpisodeCollectibleRecord, defaults: BuilderDefaults) {
  return {
    name: defaults.label,
    description: `${defaults.label} collection profile for OpenSea and compatible marketplaces.`,
    image: defaults.image || record.tokens[0]?.metadata.image || "",
    external_link: `/arapp/collect/${record.slug}`,
    seller_fee_basis_points: 0,
    fee_recipient: "0x0000000000000000000000000000000000000000",
  };
}

function downloadJson(filename: string, content: unknown) {
  const blob = new Blob([`${JSON.stringify(content, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function stepName(step: 1 | 2 | 3 | 4) {
  if (step === 1) return "Episode setup";
  if (step === 2) return "Upload files";
  if (step === 3) return "Review artworks";
  return "Go live";
}

function clearTokenFile(token: TokenDraft, mode: UploadMode): TokenDraft {
  return mode === "image"
    ? { ...token, image: "" }
    : { ...token, animationUrl: "", mediaKind: "" };
}

export default function ArtworkMetadataBuilder({ defaults }: Props) {
  const [catalog, setCatalog] = useState<EpisodeCollectiblesCatalog | null>(null);
  const [draft, setDraft] = useState<EpisodeCollectibleRecord | null>(null);
  const [tokens, setTokens] = useState<TokenDraft[]>([toTokenDraft(1)]);
  const [feedback, setFeedback] = useState("");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [groveBatchFiles, setGroveBatchFiles] = useState<File[]>([]);
  const [groveBatchKind, setGroveBatchKind] = useState<AssetKind>("image");
  const [groveResults, setGroveResults] = useState<GroveUploadResult[]>([]);
  const [uploadingTokenKey, setUploadingTokenKey] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void fetch("/api/admin/collectibles", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load artwork metadata builder.");
        }

        const data = (await response.json()) as EpisodeCollectiblesCatalog;
        setCatalog(data);
      })
      .catch((error) => {
        setFeedback(error instanceof Error ? error.message : "Failed to load artwork metadata builder.");
      });
  }, []);

  useEffect(() => {
    if (!catalog) {
      return;
    }

    const existing = catalog.episodes.find((entry) => entry.slug === defaults.slug);
    const nextDraft: EpisodeCollectibleRecord = existing ?? {
      slug: defaults.slug,
      claimOpen: false,
      chainId: defaults.chainId,
      contractAddress: defaults.contractAddress,
      baseUri: defaults.baseUri,
      collectionMetadataUri: defaults.collectionMetadataUri,
      tokens: [],
    };

    setDraft(nextDraft);
    setTokens(recordToTokenDrafts(nextDraft));
  }, [catalog, defaults]);

  const generatedRecord = useMemo(() => (draft ? draftToRecord(defaults, draft, tokens) : null), [defaults, draft, tokens]);
  const readyArtworkCount = useMemo(
    () => tokens.filter((token) => token.name.trim() && token.image.trim()).length,
    [tokens],
  );
  const claimReadyCount = useMemo(
    () => generatedRecord?.tokens.filter((token) => token.metadata.name && token.metadata.image).length ?? 0,
    [generatedRecord],
  );

  function updateToken(index: number, key: keyof TokenDraft, value: string) {
    setTokens((current) =>
      current.map((token, tokenIndex) => (tokenIndex === index ? { ...token, [key]: value } : token)),
    );
  }

  async function runGroveUpload(files: File[], assetKind: AssetKind, title: string, description: string) {
    const body = new FormData();
    body.append("title", title);
    body.append("collection_name", defaults.label);
    body.append("asset_kind", assetKind);
    body.append("description", description);
    body.append("external_url", `${defaults.origin ?? ""}/arapp/collect/${defaults.slug}`);
    for (const file of files) {
      body.append("files", file, file.name);
    }

    const response = await fetch("/api/admin/grove-upload", {
      method: "POST",
      body,
    });

    const data = (await response.json()) as {
      ok?: boolean;
      error?: string;
      details?: string;
      results?: GroveUploadResult[];
    };

    if (!response.ok || !data.ok || !data.results) {
      throw new Error(data.details || data.error || "Upload failed.");
    }

    return data.results;
  }

  function appendBatchFiles(nextFiles: File[]) {
    setGroveBatchFiles((current) => {
      const map = new Map<string, File>();
      for (const file of current) {
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      }
      for (const file of nextFiles) {
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      }
      return Array.from(map.values());
    });
  }

  function removeBatchFile(index: number) {
    setGroveBatchFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  function bestResultUrl(result: GroveUploadResult | undefined) {
    if (!result) {
      return "";
    }

    return result.public_url || result.gateway_url || result.uri || result.status_url || "";
  }

  async function uploadBatchToGrove() {
    if (!groveBatchFiles.length) {
      setFeedback("Pick one or more files first.");
      return;
    }

    try {
      setFeedback("Uploading files to Grove...");
      const results = await runGroveUpload(groveBatchFiles, groveBatchKind, defaults.label, `${defaults.label} artwork upload`);
      setGroveResults(results);
      setTokens((current) => {
        const uploadMode: UploadMode = groveBatchKind === "image" ? "image" : "model";
        const availableEmptyCount = current.filter((token) => (uploadMode === "image" ? !token.image.trim() : !token.animationUrl.trim())).length;
        const extraSlotsNeeded = Math.max(0, results.length - availableEmptyCount);
        const next = ensureTokenDraftCount(current, current.length + extraSlotsNeeded);
        const targetIndexes = batchTargetIndexes(next, results.length, uploadMode);

        return next.map((token, index) => {
          const resultIndex = targetIndexes.indexOf(index);
          const result = resultIndex >= 0 ? results[resultIndex] : undefined;
          if (!result) {
            return token;
          }

          const publicUrl = bestResultUrl(result);
          if (!publicUrl) {
            return token;
          }

          const guessedTitle = buildDraftTitleFromFileName(result.file_name);
          const shouldFillPrimary = uploadMode === "image";
          const shouldFillSecondary = uploadMode === "model";

          return {
            ...token,
            name: token.name || guessedTitle,
            image: shouldFillPrimary ? publicUrl : token.image,
            animationUrl: shouldFillSecondary ? publicUrl : token.animationUrl,
            mediaKind: shouldFillSecondary ? groveBatchKind : token.mediaKind,
          };
        });
      });
      setActiveStep(3);
      setFeedback(results.some((result) => !bestResultUrl(result))
        ? "Upload finished, but some files still do not have a public Grove link yet. Review the results list before saving."
        : "Upload complete. I filled the artwork cards for you. Review the titles, add artist and description, then save.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  async function uploadTokenFile(tokenIndex: number, mode: UploadMode, file: File | null) {
    if (!file) return;

    try {
      const token = tokens[tokenIndex];
      setUploadingTokenKey(`${tokenIndex}-${mode}`);
      setFeedback(`Uploading ${file.name} to Grove...`);
      const results = await runGroveUpload(
        [file],
        mode === "image" ? "image" : "model",
        token.name || `${defaults.label} artwork ${token.tokenId}`,
        token.description || `${defaults.label} artwork ${token.tokenId}`,
      );
      const publicUrl = bestResultUrl(results[0]);
      if (!publicUrl) {
        throw new Error("Upload finished but Grove did not return a gateway URL.");
      }
      updateToken(tokenIndex, mode === "image" ? "image" : "animationUrl", publicUrl);
      if (mode !== "image") {
        updateToken(tokenIndex, "mediaKind", inferSecondaryMediaKind(file.name));
      }
      setGroveResults((current) => [...results, ...current].slice(0, 12));
      setActiveStep(3);
      setFeedback(`${file.name} uploaded. The Grove link has been filled in for this artwork.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploadingTokenKey("");
    }
  }

  function saveToCatalog(openClaim = true) {
    if (!generatedRecord) {
      return;
    }

    startTransition(() => {
      void (async () => {
        const episodeToSave: EpisodeCollectibleRecord = {
          ...generatedRecord,
          claimOpen: openClaim ? claimReadyCount > 0 : generatedRecord.claimOpen,
          tokens: generatedRecord.tokens.map((token) => ({
            ...token,
            status: openClaim && claimReadyCount > 0 && token.metadata.name && token.metadata.image && token.status === "coming-soon"
              ? "live"
              : token.status,
          })),
        };

        const response = await fetch("/api/admin/collectibles", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ episode: episodeToSave }),
        });
        const data = (await response.json()) as {
          episode?: EpisodeCollectibleRecord;
          episodes?: EpisodeCollectibleRecord[];
          error?: string;
        };

        if (!response.ok || !data.episode || !data.episodes) {
          setFeedback(data.error ?? "Failed to save artwork metadata.");
          return;
        }

        setCatalog((current) =>
          current
            ? {
                ...current,
                episodes: data.episodes ?? current.episodes,
              }
            : null,
        );
        setDraft(data.episode);
        setTokens(recordToTokenDrafts(data.episode));
        setActiveStep(4);
        setFeedback(openClaim && claimReadyCount > 0
          ? "Artwork synced and claim opened. NFC links now point to the live claim pages."
          : "Artwork JSON synced. Collect pages and NFC links now read this episode config.");
      })().catch((error) => {
        setFeedback(error instanceof Error ? error.message : "Failed to save artwork metadata.");
      });
    });
  }

  function applyContractValues() {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        slug: defaults.slug,
        chainId: defaults.chainId || current.chainId,
        contractAddress: defaults.contractAddress?.trim() || current.contractAddress || "",
        baseUri: defaults.baseUri?.trim() || `${defaults.origin ?? ""}/api/arapp/collect/${defaults.slug}/metadata`,
        collectionMetadataUri:
          defaults.collectionMetadataUri?.trim() || `${defaults.origin ?? ""}/api/episodes/${defaults.slug}/metadata`,
        nfcBaseUrl: current.nfcBaseUrl || defaults.origin || "",
      };
    });
    setActiveStep(2);
    setFeedback("Deploy settings pulled in. Contract address, metadata links, and website URL were refreshed for this episode.");
  }

  if (!draft || !generatedRecord) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/58">
        Loading artwork metadata builder…
      </div>
    );
  }

  const episodeLink = `/arapp/collect/${generatedRecord.slug}`;
  const starterBaseUri = `${defaults.origin ?? ""}/api/arapp/collect/${generatedRecord.slug}/metadata`;
  const starterCollectionUri = `${defaults.origin ?? ""}/api/episodes/${generatedRecord.slug}/metadata`;
  const previewBaseUrl = (draft.nfcBaseUrl ?? defaults.origin ?? "").trim().replace(/\/$/, "");
  const tokenLinks = generatedRecord.tokens.map((token) => ({
    tokenId: token.tokenId,
    claimUrl: `${previewBaseUrl}${episodeLink}/${token.tokenId}`,
    metadataUrl: `${starterBaseUri}/${token.tokenId}.json`,
    nfcUrl: `${previewBaseUrl}${episodeLink}/${token.tokenId}`,
  }));
  const wizardSteps: Array<{ id: 1 | 2 | 3 | 4; title: string; detail: string }> = [
    { id: 1, title: "Episode setup", detail: "Load deploy settings and set the website URL." },
    { id: 2, title: "Upload files", detail: "Send one or many artwork files to Grove." },
    { id: 3, title: "Review artworks", detail: "Check title, artist, description, and optional extras." },
    { id: 4, title: "Go live", detail: "Open claim, copy NFC links, and sync to site." },
  ];
  const nextActionText =
    activeStep === 1
      ? "Load the deployed episode settings, then move into uploads."
      : activeStep === 2
        ? "Add files to the queue and press the upload button."
        : activeStep === 3
          ? "Check each artwork card, then continue to publishing."
          : "Sync the setup and copy the NFC links.";

  return (
    <div className="mt-5 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:p-5">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Artwork Claim Wizard</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Build the episode claim experience without touching blockchain jargon.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
              Load the episode settings, upload the artwork files, review each token card, then publish the direct claim links for NFC chips. The wizard writes the artwork JSON for you.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[480px]">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Episode contract</div>
              <div className="mt-2 break-all text-sm text-white/82">{draft.contractAddress || "Not loaded yet"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Artwork cards ready</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{readyArtworkCount}</div>
              <div className="text-xs text-white/44">out of {tokens.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Claim links ready</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{claimReadyCount}</div>
              <div className="text-xs text-white/44">direct token pages</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {wizardSteps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                activeStep === step.id
                  ? "border-white/22 bg-white text-black"
                  : "border-white/10 bg-black/25 text-white hover:border-white/16 hover:bg-white/[0.04]"
              }`}
            >
              <div className={`text-[10px] uppercase tracking-[0.2em] ${activeStep === step.id ? "text-black/60" : "text-white/42"}`}>
                Step {step.id}
              </div>
              <div className="mt-2 text-sm font-medium">{step.title}</div>
              <div className={`mt-2 text-xs leading-5 ${activeStep === step.id ? "text-black/70" : "text-white/56"}`}>
                {step.detail}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/30 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">What to do now</div>
              <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">{stepName(activeStep)}</div>
              <div className="mt-1 text-sm text-white/56">{nextActionText}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                <span className="text-white/42">Loaded:</span> {draft.contractAddress ? "yes" : "waiting"}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                <span className="text-white/42">Queue:</span> {groveBatchFiles.length}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                <span className="text-white/42">Ready:</span> {claimReadyCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className={`rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${activeStep === 1 ? "" : "hidden"}`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Step 1</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Connect this wizard to the deployed episode</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Click one button to bring the deploy settings into this wizard. Then confirm the website URL that should be used in the public NFC links.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyContractValues}
                className="rounded-2xl border border-white/16 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-black"
              >
                Pull Deploy Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="rounded-2xl border border-white/14 bg-black/30 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/76"
              >
                Next: Upload Files
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Episode summary</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Episode</div>
                  <div className="mt-2 text-sm text-white/82">{defaults.label}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Episode contract</div>
                  <div className="mt-2 break-all text-sm text-white/82">{draft.contractAddress || "Not loaded yet"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Website URL for NFC</div>
                  <div className="mt-2 break-all text-sm text-white/82">{draft.nfcBaseUrl || defaults.origin || "Not set yet"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Claim state</div>
                  <div className="mt-2 text-sm text-white/82">{draft.claimOpen ? "Open when synced" : "Closed until you open it"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Simple controls</div>
              <div className="mt-4 space-y-4">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Can people collect now?</span>
                  <select
                    value={draft.claimOpen ? "open" : "closed"}
                    onChange={(event) => setDraft((current) => (current ? { ...current, claimOpen: event.target.value === "open" } : current))}
                    className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="closed">No, keep claim closed</option>
                    <option value="open">Yes, open claim</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Main website URL for NFC links</span>
                  <input
                    value={draft.nfcBaseUrl ?? defaults.origin ?? ""}
                    onChange={(event) => setDraft((current) => (current ? { ...current, nfcBaseUrl: event.target.value } : current))}
                    placeholder="https://axis.show"
                    className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${activeStep === 2 ? "" : "hidden"}`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Step 2</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Upload the artwork files</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Upload one file or many files. Each uploaded file becomes one ERC-1155 token card automatically. You can still upload files one by one later if needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={uploadBatchToGrove}
                disabled={!groveBatchFiles.length}
                className="rounded-2xl border border-white/16 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-black disabled:opacity-40"
              >
                Upload Queue To Grove
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="rounded-2xl border border-white/14 bg-black/30 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/76"
              >
                Next: Review Artworks
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">File type</span>
                  <select
                    value={groveBatchKind}
                    onChange={(event) => setGroveBatchKind(event.target.value as AssetKind)}
                    className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="image">Image</option>
                    <option value="model">3D / GLB</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Choose files</span>
                  <input
                    type="file"
                    multiple
                    onChange={(event) => appendBatchFiles(Array.from(event.target.files ?? []))}
                    className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none file:mr-4 file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-[0.16em] file:text-black"
                  />
                </label>
              </div>
              <div className="mt-4 rounded-[24px] border border-white/12 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Main action</div>
                    <div className="mt-1 text-sm text-white/78">
                      {groveBatchFiles.length
                        ? `${groveBatchFiles.length} file${groveBatchFiles.length === 1 ? "" : "s"} ready to upload`
                        : "Add files to the queue first"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={uploadBatchToGrove}
                    disabled={!groveBatchFiles.length}
                    className="rounded-2xl border border-white/16 bg-white px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-black disabled:opacity-40"
                  >
                    Upload To Grove Now
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <label className="rounded-2xl border border-white/14 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/76">
                  Add More Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(event) => appendBatchFiles(Array.from(event.target.files ?? []))}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setGroveBatchFiles([])}
                  disabled={!groveBatchFiles.length}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/58 disabled:opacity-40"
                >
                  Clear Queue
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/58">
                If you upload 7 files here, the wizard prepares 7 artwork token cards for this episode.
              </div>
              <div className="mt-4 space-y-2">
                {groveBatchFiles.length ? (
                  groveBatchFiles.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-white/70">
                      <div className="min-w-0">
                        <div className="truncate">{file.name}</div>
                        <div className="mt-1 text-white/42">{Math.max(1, Math.round(file.size / 1024 / 1024 * 10) / 10)} MB</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBatchFile(index)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white/58"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/46">
                    No files in the upload queue yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Recent Grove results</div>
              {groveResults.length ? (
                <div className="mt-4 space-y-2">
                  {groveResults.map((result, index) => (
                    <div key={`${result.file_name}-${bestResultUrl(result) || result.status_url || "pending"}-${index}`} className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-xs leading-5 text-white/66">
                      <div>{result.file_name}</div>
                      <div className="mt-1 break-all font-mono text-white/74">{bestResultUrl(result) || "Still processing at Grove"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/46">
                  Upload results will appear here and the wizard will fill the artwork cards automatically.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${activeStep === 3 ? "" : "hidden"}`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Step 3</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Review each artwork</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Keep it simple. For each artwork, make sure the title, artist, description, and main file are correct. Everything else is optional.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTokens((current) => [...current, toTokenDraft(current.length ? Number(current[current.length - 1].tokenId || "0") + 1 : 1)])}
                className="rounded-2xl border border-white/14 bg-black/30 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/76"
              >
                Add Another Artwork
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="rounded-2xl border border-white/16 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-black"
              >
                Next: Go Live
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {tokens.map((token, index) => (
              <div key={`${token.tokenId}-${index}`} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Artwork #{token.tokenId || "new"}</div>
                    <div className="mt-1 text-sm text-white/70">Upload the file, set the title, set the artist, and add a short description.</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="rounded-2xl border border-white/14 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/76">
                      Upload main file
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          void uploadTokenFile(index, "image", file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <label className="rounded-2xl border border-white/14 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/76">
                      Upload 3D / video
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          void uploadTokenFile(index, "model", file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setTokens((current) => current.map((item, itemIndex) => itemIndex === index ? clearTokenFile(item, "image") : item))}
                      disabled={!token.image}
                      className="rounded-2xl border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/58 disabled:opacity-40"
                    >
                      Remove main file
                    </button>
                    <button
                      type="button"
                      onClick={() => setTokens((current) => current.map((item, itemIndex) => itemIndex === index ? clearTokenFile(item, "model") : item))}
                      disabled={!token.animationUrl}
                      className="rounded-2xl border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/58 disabled:opacity-40"
                    >
                      Remove 3D / video
                    </button>
                    <button
                      type="button"
                      onClick={() => setTokens((current) => current.filter((_, tokenIndex) => tokenIndex !== index))}
                      disabled={tokens.length === 1}
                      className="rounded-2xl border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/58 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[120px_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    {token.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={toPublicUrl(token.image)} alt={token.name || `Artwork ${token.tokenId}`} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-[11px] uppercase tracking-[0.16em] text-white/28">
                        No art yet
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2 xl:col-span-4">
                      <div className="grid gap-3 xl:grid-cols-2">
                        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Main artwork file</div>
                          <div className="mt-2 break-all text-xs leading-5 text-white/72">{token.image || "No file uploaded yet"}</div>
                        </div>
                        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">3D / video file</div>
                          <div className="mt-2 break-all text-xs leading-5 text-white/72">{token.animationUrl || "No extra media uploaded yet"}</div>
                        </div>
                      </div>
                    </div>
                    <label className="space-y-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Artwork number</span>
                      <input value={token.tokenId} onChange={(event) => updateToken(index, "tokenId", event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Claim status</span>
                      <select value={token.status} onChange={(event) => updateToken(index, "status", event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none">
                        {collectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Artwork title</span>
                      <input value={token.name} onChange={(event) => updateToken(index, "name", event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Artist</span>
                      <input value={token.artist} onChange={(event) => updateToken(index, "artist", event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Description</span>
                      <textarea value={token.description} onChange={(event) => updateToken(index, "description", event.target.value)} rows={4} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
                    </label>
                    <details className="space-y-2 sm:col-span-2 xl:col-span-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-white/48">Optional advanced fields</summary>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <label className="space-y-2">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">How many can collect?</span>
                          <input value={token.remaining} onChange={(event) => updateToken(index, "remaining", event.target.value)} placeholder="Optional. Leave 0 if there is no limit." className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
                        </label>
                        <label className="space-y-2 sm:col-span-2">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Main artwork file URL</span>
                          <input value={token.image} onChange={(event) => updateToken(index, "image", event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
                        </label>
                        <label className="space-y-2 sm:col-span-2 xl:col-span-3">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-white/48">Optional 3D / video URL</span>
                          <input value={token.animationUrl} onChange={(event) => updateToken(index, "animationUrl", event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
                        </label>
                      </div>
                    </details>
                  </div>
                </div>
                {uploadingTokenKey.startsWith(`${index}-`) ? (
                  <div className="mt-3 text-xs text-white/56">Uploading to Grove...</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${activeStep === 4 ? "" : "hidden"}`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Step 4</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Go live and write the NFC links</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Once the artwork cards look right, sync them to the site. Then copy or download the direct artwork links and use those on the NFC chips.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => saveToCatalog(true)}
                  disabled={isPending}
                  className="rounded-2xl border border-white/16 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-black disabled:opacity-60"
                >
                  {isPending ? "Saving" : "Sync And Open Claim"}
                </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Direct claim links</div>
              <p className="mt-2 text-xs leading-5 text-white/56">
                The important output is one direct artwork link per token. That is the link the NFC chip should open.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => downloadJson(`${generatedRecord.slug}-contract.json`, buildEpisodeContractJson(generatedRecord, defaults))} className="rounded-2xl border border-white/14 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/76">
                  Download Master Metadata
                </button>
                <button type="button" onClick={() => generatedRecord.tokens.forEach((token) => downloadJson(`${token.tokenId}.json`, token.metadata))} className="rounded-2xl border border-white/14 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/76">
                  Download All Artwork JSON
                </button>
                <button type="button" onClick={() => downloadJson(`${generatedRecord.slug}-nfc-links.json`, tokenLinks)} className="rounded-2xl border border-white/14 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/76">
                  Download NFC Links
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-6 text-white/66">
                <div>Episode room: {previewBaseUrl}{episodeLink}</div>
                <div>Use on NFC chips: direct artwork links only</div>
                <div>Claim state after save: {claimReadyCount > 0 ? "opens automatically" : "stays closed until at least one artwork is ready"}</div>
                <div>Direct claim pages ready: {tokenLinks.length}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">NFC links ready to write</div>
              <p className="mt-2 text-xs leading-5 text-white/56">
                Each chip should point straight to the artwork claim page.
              </p>
              <div className="mt-4 space-y-3">
                {tokenLinks.length ? (
                  tokenLinks.map((link) => (
                    <div key={`nfc-${link.tokenId}`} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-white/66">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Artwork #{link.tokenId}</div>
                      <div className="mt-2 break-all font-mono text-white/76">{link.nfcUrl}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/52">
                    Finish at least one artwork card and the NFC links will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Claim page preview</div>
              <p className="mt-2 text-xs leading-5 text-white/56">
                This is the direct artwork page people should land on from the NFC chip before they mint.
              </p>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-black/30 p-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Episode room</div>
                <div className="mt-2 text-lg text-white">{defaults.label}</div>
                <div className="mt-1 text-sm text-white/56">{generatedRecord.claimOpen ? "Claim is open now" : "Claim is closed until you open it"}</div>
                <div className="mt-4 space-y-3">
                  {generatedRecord.tokens.length ? (
                    generatedRecord.tokens.slice(0, 4).map((token) => (
                      <div key={`preview-${token.tokenId}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white">{token.metadata.name}</div>
                            <div className="mt-1 text-xs text-white/52">{token.metadata.properties?.artist || "Unknown Artist"}</div>
                          </div>
                          <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/52">
                            #{token.tokenId}
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-[96px_1fr]">
                          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                            {token.metadata.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={toPublicUrl(token.metadata.image)} alt={token.metadata.name} className="h-24 w-full object-cover" />
                            ) : (
                              <div className="flex h-24 items-center justify-center text-[11px] uppercase tracking-[0.16em] text-white/28">
                                No art yet
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 text-xs leading-5 text-white/62">
                            <div>{token.metadata.description || "Short artwork story goes here."}</div>
                            <div className="font-mono text-white/48">{previewBaseUrl}{episodeLink}/{token.tokenId}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/52">
                      Add at least one artwork to preview the claim page.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <details className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-white/44">
                Advanced technical contract links
              </summary>
              <p className="mt-3 text-xs leading-5 text-white/56">
                Only use this if you need the temporary contract metadata links again for deploy or marketplace setup.
              </p>
              <div className="mt-4 grid gap-3 text-xs text-white/68">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Base URI for deploy</div>
                  <div className="mt-2 break-all font-mono">{starterBaseUri}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Collection info URI for deploy</div>
                  <div className="mt-2 break-all font-mono">{starterCollectionUri}</div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="sticky bottom-3 z-20 mt-4 rounded-[24px] border border-white/12 bg-black/85 p-3 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/38">Wizard controls</div>
            <div className="mt-1 text-sm text-white/60">Step {activeStep} of 4. Main actions now push you to the next step automatically.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveStep((current) => Math.max(1, current - 1) as 1 | 2 | 3 | 4)}
              disabled={activeStep === 1}
              className="rounded-2xl border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/62 disabled:opacity-35"
            >
              Previous
            </button>
            {activeStep === 1 ? (
              <button type="button" onClick={applyContractValues} className="rounded-2xl border border-white/16 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-black">
                Pull Deploy Settings
              </button>
            ) : null}
            {activeStep === 2 ? (
              <button type="button" onClick={uploadBatchToGrove} disabled={!groveBatchFiles.length} className="rounded-2xl border border-white/16 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-black disabled:opacity-40">
                Upload Queue
              </button>
            ) : null}
            {activeStep === 3 ? (
              <button type="button" onClick={() => setActiveStep(4)} className="rounded-2xl border border-white/16 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-black">
                Continue To Publish
              </button>
            ) : null}
            {activeStep === 4 ? (
              <button type="button" onClick={saveToCatalog} disabled={isPending} className="rounded-2xl border border-white/16 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-black disabled:opacity-40">
                {isPending ? "Saving" : "Sync To Site"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveStep((current) => Math.min(4, current + 1) as 1 | 2 | 3 | 4)}
              disabled={activeStep === 4}
              className="rounded-2xl border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/76 disabled:opacity-35"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {feedback ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/70">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
