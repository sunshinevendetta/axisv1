const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: "Future Renaissance · First Official Anthropic Claude AI Community Party",
  startDate: "2026-10-28T22:00:00-06:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  description:
    "Future Renaissance is an AXIS Tech Week Mexico Edition flagship event combining art, music, technology, culture, AI, code, community, hospitality, interactive activities and live media. It hosts the first official Anthropic Claude AI community party.",
  location: {
    "@type": "Place",
    name: "Bar Oriente",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mexico City",
      addressCountry: "MX",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "AXIS",
    url: "https://axis.show",
  },
  image: "https://axis.show/futurerenaissance-bar-oriente/poster-horizontal.png",
};

export default function FutureRenaissancePlanContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSON_LD) }}
      />

      <style>{`
        .future-a11y-content {
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
        className="future-a11y-content"
        aria-label="Future Renaissance venue presentation for Bar Oriente"
      >
        <header>
          <p>AXIS · Tech Week Mexico Edition</p>
          <h1>Future Renaissance</h1>
          <p>First Official Anthropic Claude AI Community Party</p>
          <p>October 28, 2026 · Mexico City</p>
          <p>Powered by: https://axis.show</p>
        </header>

        <section aria-labelledby="future-event">
          <h2 id="future-event">The event</h2>
          <p>
            Future Renaissance is an AXIS Tech Week Mexico Edition flagship event
            in Mexico City on October 28, 2026, hosted at Bar Oriente. Roughly 250
            Future Renaissance guests are expected.
          </p>
          <p>
            The program brings together art, music, technology, culture, AI, code,
            community, interaction, hospitality and media documentation as one
            authored environment.
          </p>
          <p>
            The expected attendance figure describes the Future Renaissance
            audience, not the absolute capacity of the venue. Where operationally
            agreed, the venue can continue receiving its regular clientele.
          </p>
        </section>

        <section aria-labelledby="future-music">
          <h2 id="future-music">Music programming</h2>
          <p>
            Main room line up: Algorithmic Live Coding Music Creation, with three
            artists creating music with code in real time, curated by Claude and
            AXIS, followed by a closing DJ and support DJ playing UK techno and
            techno.
          </p>
          <p>Cuarto Rosa line up: a special activity by Suno.</p>
        </section>

        <section aria-labelledby="future-digital-artists">
          <h2 id="future-digital-artists">Digital art line up</h2>
          <p>Verse Works, Pixelord and The Public.</p>
          <p>
            Verse is a London platform for generative and digital art, founded in
            2022 to give work made with code the curatorial treatment a gallery
            gives a painting. Its programme has presented artists including Zancan
            and Mark Titchner, and it has run live minting at Frieze. A Verse
            generative work reads a hash when it is collected and draws itself from
            that seed, so no two outputs are the same.
          </p>
          <p>
            Pixelord is Alexey Devyanin, a producer and co-founder of Hyperboloid
            Records. Across records such as Places, Human.exe and Hypnorave he moves
            between IDM, breakbeat, bass and glitch, and his recent work releases
            sound and 3D visuals together onchain. He has also written music for
            audiovisual installations, including one at the Polytechnic Museum in
            Moscow.
          </p>
          <p>
            The public is billed as part of the line up because the room makes the
            work. Everyone attending receives a free month of the Claude Pro plan
            plus a fixed 50 USD in API credits, and any guest who brings photos or
            video, or simply interacts with the application, alters the visual
            experience running in real time on the main LED wall.
          </p>
        </section>

        <section aria-labelledby="future-claude">
          <h2 id="future-claude">Claude activity layer</h2>
          <p>
            Future Renaissance hosts the first official Anthropic Claude AI
            community party. Claude operates as an activity layer inside the event
            rather than as branding or a sponsor booth.
          </p>
          <p>
            Participating guests receive complimentary Claude access and Claude
            credits as part of the official activity. Exact entitlement parameters
            are confirmed with Anthropic before the event.
          </p>
          <p>
            Guests bring creative intent, Claude interprets that intent and assists
            the coding process, Claude Code generates or modifies the controlled
            code, and a visual runtime renders the final output to the venue
            screens. Claude does not render the visuals directly. All live output is
            constrained by the Future Renaissance visual language, and a fallback
            scene protects the displays.
          </p>
        </section>

        <section aria-labelledby="future-hospitality">
          <h2 id="future-hospitality">Hospitality</h2>
          <p>
            AXIS funds a complimentary drink allocation for the night as part of the
            Future Renaissance hospitality system. The allocation supports guest
            arrival, circulation, social atmosphere and participation.
          </p>
          <p>
            Venue guests may access part of the complimentary allocation while it is
            available and according to venue service rules. The allocation is not
            unlimited, and participation never requires alcohol consumption.
          </p>
        </section>

        <section aria-labelledby="future-venue-requirements">
          <h2 id="future-venue-requirements">Venue requirements</h2>
          <p>
            Venue-provided display infrastructure is required. The screens carry the
            entire Future Renaissance audiovisual system, including digital art,
            real-time graphics, live-coded visuals, Claude onboarding and activity
            information, not only the Claude layer.
          </p>
          <p>
            The venue also provides audio and DJ infrastructure where available,
            reliable internet with a wired production connection preferred, power,
            technical access and a technical contact, bar operation, security,
            staffing and capacity management.
          </p>
        </section>

        <section aria-labelledby="future-axis">
          <h2 id="future-axis">What AXIS operates</h2>
          <p>
            AXIS provides the Future Renaissance concept and creative direction,
            event and music programming, live coding programming, Claude activity
            integration and onboarding, interactive systems, digital art, visual
            software, the rendering workstation and routing, technical operators,
            Tech Week micro-activity coordination, media direction, artist
            coordination, event documentation, complimentary drink allocation
            funding and production coordination.
          </p>
        </section>

        <section aria-labelledby="future-measurement">
          <h2 id="future-measurement">Measurement</h2>
          <p>
            AXIS operates a measured event. Attendance, check-ins, activity
            participation, Claude activations, live coding interaction, mission
            completion, reward redemption, hospitality usage, screen interactions
            and content produced are recorded and summarized after the event.
          </p>
        </section>
      </article>
    </>
  );
}
