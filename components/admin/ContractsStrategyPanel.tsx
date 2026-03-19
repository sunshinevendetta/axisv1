export default function ContractsStrategyPanel() {
  const items = [
    {
      label: "Season Core",
      title: "Soulbound Membership 1155",
      body: "One stable season membership layer instead of spinning up a fresh membership contract for every episode.",
    },
    {
      label: "Identity",
      title: "Wallet + Member Registry",
      body: "Wallet remains the source of truth while email stays offchain or encrypted, linked through registry records and provenance fields.",
    },
    {
      label: "Automation",
      title: "Luma Sync Drives Access",
      body: "Luma events feed membership activation, per-event access, guestlists, and check-in state instead of manual token juggling.",
    },
    {
      label: "Per Event",
      title: "Badges Or Access By Episode",
      body: "Use event-level token IDs or registry entries for episode provenance without rebuilding the season core every time.",
    },
  ];

  return (
    <section className="px-3 pb-4 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 text-white backdrop-blur-2xl">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/52">Strategy Layer</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Luma-synced season membership, not contract sprawl.</h2>
          <p className="mt-3 text-sm leading-6 text-white/66">
            This HQ now points toward the operational architecture we actually need: one soulbound season core, one member registry, one event access layer, and Luma sync as the activation engine.
          </p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">{item.label}</div>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
