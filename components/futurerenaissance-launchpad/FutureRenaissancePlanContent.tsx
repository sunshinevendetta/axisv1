const CIRCUIT_EVENTS = [
  {
    "@type": "MusicEvent",
    name: "Investors House After Hours",
    startDate: "2026-10-27",
    location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Mexico City", addressCountry: "MX" } },
  },
  {
    "@type": "MusicEvent",
    name: "Claude Official Party",
    startDate: "2026-10-28",
    location: { "@type": "Place", name: "Bar Oriente", address: { "@type": "PostalAddress", addressLocality: "Mexico City", addressCountry: "MX" } },
    sponsor: { "@type": "Organization", name: "Claude" },
  },
  {
    "@type": "MusicEvent",
    name: "Founders House After Hours",
    startDate: "2026-10-29",
    location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Mexico City", addressCountry: "MX" } },
  },
  {
    "@type": "MusicEvent",
    name: "Developers House After Hours",
    startDate: "2026-10-30",
    location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Mexico City", addressCountry: "MX" } },
  },
  {
    "@type": "MusicEvent",
    name: "AI House After Hours",
    startDate: "2026-10-31",
    location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Mexico City", addressCountry: "MX" } },
  },
  {
    "@type": "MusicEvent",
    name: "Wellness House After Hours / Closing",
    startDate: "2026-11-01",
    location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Mexico City", addressCountry: "MX" } },
  },
];

const EVENT_SERIES_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  name: "Future Renaissance · Mexico Tech Week After Hours",
  startDate: "2026-10-27",
  endDate: "2026-11-01",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  description:
    "A six-night AXIS-operated after-hours cultural circuit connecting the five Mexico Tech Town Houses and the official Claude party during Mexico Tech Week.",
  organizer: {
    "@type": "Organization",
    name: "AXIS",
    url: "https://axis.show",
  },
  image: "https://axis.show/futurerenaissanceextended/og-circuit.png",
  subEvent: CIRCUIT_EVENTS,
};

const SPONSOR_TIERS = [
  ["Single House Partner", "$2,000 USD", "One of the five Tech Town House events."],
  ["Claude Official Party Partner", "$2,500 USD", "Wednesday partner status beneath Claude; Claude retains presenting status."],
  ["Three-House Circuit", "$3,000 USD", "One central activation architecture adapted across any three Houses."],
  ["Tech Town Circuit", "$3,500 USD", "One sponsor system across all five Tech Town Houses."],
  ["Complete Week Partner", "$4,000 USD", "All five Houses plus permitted partner integration at the Claude Official Party."],
  ["Category Exclusive Circuit Partner", "$6,500 USD", "Complete circuit access with exclusivity limited to AXIS-controlled inventory and contractual rights."],
  ["Tech Town Presenting Partner", "$10,000 USD", "One position presenting the five House events only; never the Claude Official Party."],
];

export default function FutureRenaissanceExtendedPlanContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_SERIES_JSON_LD) }}
      />

      <style>{`
        .future-extended-a11y-content {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: normal;
          border: 0;
        }
      `}</style>

      <article
        className="future-extended-a11y-content"
        aria-label="Future Renaissance Mexico Tech Week After Hours partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week After Hours</p>
          <h1>Future Renaissance</h1>
          <p>October 27–November 1, 2026 · Mexico City · Six consecutive nights</p>
        </header>

        <section aria-labelledby="future-extended-proposition">
          <h2 id="future-extended-proposition">The proposition</h2>
          <p>
            Mexico Tech Town creates five concentrated daytime House communities.
            Future Renaissance extends those communities through a coordinated
            nighttime program of culture, music, technology, hospitality, missions,
            media, and measurable participation. AXIS hosts and operates this
            after-hours layer; it does not claim ownership of Mexico Tech Week or
            the Tech Town Houses.
          </p>
        </section>

        <section aria-labelledby="future-extended-circuit">
          <h2 id="future-extended-circuit">The complete circuit</h2>
          <ol>
            {CIRCUIT_EVENTS.map((event) => (
              <li key={event.name}>
                <strong>{event.name}</strong> — {event.startDate}
                {"sponsor" in event ? " · Bar Oriente · Presented by Claude" : ""}
              </li>
            ))}
          </ol>
          <p>Five Tech Town Houses, one official Claude party, and one continuous AXIS / Future Renaissance operating layer.</p>
        </section>

        <section aria-labelledby="future-extended-rights">
          <h2 id="future-extended-rights">Claude rights</h2>
          <p>
            Claude retains presenting status for Wednesday’s official party at Bar
            Oriente. AXIS hosts and produces the event. Other brands can participate
            only in permitted subordinate partner or activation roles. Presenting
            rights sold by AXIS apply exclusively to the five Tech Town House events.
          </p>
        </section>

        <section aria-labelledby="future-extended-system">
          <h2 id="future-extended-system">Mission and measurement system</h2>
          <p>
            Guests register, check in, act, validate, unlock, progress, collect, and
            complete. One product receives one clear function and one measurable
            behavior. AXIS reports attendance, mission completion, qualified actions,
            stage conversion, reward redemption, and content outputs. CPQA, CPA, CAC,
            ROI, LTV:CAC, and NPV are calculated only when sponsor-side data supports them.
          </p>
        </section>

        <section aria-labelledby="future-extended-commercial">
          <h2 id="future-extended-commercial">Partnership inventory</h2>
          <ul>
            {SPONSOR_TIERS.map(([name, price, scope]) => (
              <li key={name}><strong>{name} — {price}</strong>: {scope}</li>
            ))}
          </ul>
          <p>
            Circuit packages repeat one primary sponsor system with contextual House
            adaptations; they are not bundles of fully independent custom campaigns.
          </p>
        </section>
      </article>
    </>
  );
}
