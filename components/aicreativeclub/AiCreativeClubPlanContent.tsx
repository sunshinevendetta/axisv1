const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Mexico City | Create and Delegate · AI Creative Club",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  startDate: "2026-12-04T16:00:00-06:00",
  endDate: "2026-12-05T02:00:00-06:00",
  description:
    "AI Creative Club Level 01 at Casa Luma on December 4, 2026: art and business content creation with Anana, GPT/Claude workflows and ElizaOS agents with Sunshine Vendetta, and complementary blockchain investment literacy. The workshop runs from 17:00 to 21:00 within the existing 16:00 to 02:00 event window, with cultural programming, gallery and social participation.",
  location: {
    "@type": "Place",
    name: "Casa Luma",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Tinala 145, Roma Norte",
      addressLocality: "Mexico City",
      addressRegion: "CDMX",
      addressCountry: "MX",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "AXIS",
    url: "https://axis.show",
  },
  image: "https://axis.show/aicreativeclub/poster.jpg",
};

export default function AiCreativeClubPlanContent() {
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
        aria-label="AI Creative Club venue presentation for Casa Luma"
      >
        <header>
          <p>AXIS · Level 01 / Main Workshops</p>
          <h1>AI Creative Club</h1>
          <p>Creative AI community event · Mexico City | Create and Delegate</p>
          <p>Organized by AXIS and the creative community · Produced by AXIS</p>
          <p>Host venue: Casa Luma</p>
          <p>Tinala 145, Roma Norte, CDMX</p>
          <p>December 4, 2026 · Mexico City</p>
          <p>Event window: 16:00 to 02:00</p>
          <p>Powered by: https://axis.show</p>
        </header>

        <section aria-labelledby="future-event">
          <h2 id="future-event">The event</h2>
          <p>
            The night runs in two halves at Casa Luma, the host venue, on
            Tinala 145 in Roma Norte, Mexico City, on December 4, 2026. The event window
            opens at 16:00 and closes at 02:00. From 17:00 to 21:00 it is a seated Creative AI
            community workshop for 100 artists, creators, business owners and curious newcomers. At
            21:00, with no gap, it becomes the AI Creative Club party, an AXIS club event running to 02:00, with 120 further guests arriving on top of
            the workshop attendees who stay on.
          </p>
          <p>
            The program brings together art and business content creation, AI agents,
            reusable workflows and blockchain investment literacy, alongside music,
            community, hospitality and media documentation.
          </p>
          <p>
            The workshop is seated and chairs are provided for every attendee. The
            event window opens at 16:00 so the room, the seating and
            the screen routing are ready before 17:00, and the workshop facilitators have
            access to the venue screen to run their presentation. AXIS buys soft
            drinks from the venue bar for the workshop room, and the bar stays open
            and sells to guests throughout. Registration runs on Luma through the
            organizers with prior approval, as a single list; event communications
            are issued by the organizers. Where operationally agreed, the venue can
            continue receiving its regular clientele.
          </p>
        </section>

        <section aria-labelledby="future-music">
          <h2 id="future-music">Music programming</h2>
          <p>
            Main room line up: Algorithmic Live Coding Music Creation, with three
            artists creating music with code in real time, curated by artists and
            AXIS, followed by a closing DJ and support DJ playing UK techno and
            techno.
          </p>
        </section>

        <section aria-labelledby="future-gallery">
          <h2 id="future-gallery">The Gallery</h2>
          <p>
            The Gallery is a distinct space within the event where the AI Creative Club digital art is presented. Digital works are curated into
            the space rather than treated as decoration, and the space is open
            across the night alongside the main room.
          </p>
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
            work. Any guest who brings photos or video, or simply interacts with
            the application, alters the visual experience running in real time on
            the main LED wall.
          </p>
        </section>

        <section aria-labelledby="future-creative-ai">
          <h2 id="future-creative-ai">Content creation, agents and workflows</h2>
          <p>
            Two beginner-friendly tracks share the seated workshop. Anana guides
            a visual brief, GPT or another base-image tool, Midjourney editing and
            a video extension for art, product imagery and business content.
            Sunshine Vendetta guides a real task, GPT/Claude workflow, review and
            reuse, plus an ElizaOS agent demonstration. Participants keep an image
            or edit and reusable task instructions. Blockchain investment literacy
            complements the two practical tracks. No prior technical knowledge is required.
          </p>
          <p>
            Facilitators guide tool setup and provide creative resources. Tool
            availability and any access requirements will be shared before the
            event. Guests bring creative intent and develop works together for
            the venue screens within the AI Creative Club visual language.
          </p>
        </section>

        <section aria-labelledby="future-hospitality">
          <h2 id="future-hospitality">Hospitality</h2>
          <p>
            AXIS funds a complimentary drink allocation for the night as part of the
            AI Creative Club hospitality system. The allocation supports guest
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
            entire AI Creative Club audiovisual system, including digital art,
            real-time graphics, live-coded visuals, Creative AI onboarding and activity
            information, not only the Creative AI layer.
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
            AXIS provides the AI Creative Club concept and creative direction,
            event and music programming, live coding programming, Creative AI activity
            integration and onboarding, interactive systems, digital art, visual
            software, the rendering workstation and routing, technical operators,
            Club micro-activity coordination, media direction, artist
            coordination, event documentation, complimentary drink allocation
            funding and production coordination.
          </p>
        </section>

        <section aria-labelledby="future-measurement">
          <h2 id="future-measurement">Measurement</h2>
          <p>
            AXIS operates a measured event. Attendance, check-ins, activity
            participation, CREATE and DELEGATE completions, workflow repeatability, mission
            completion, reward redemption, hospitality usage, screen interactions
            and content produced are recorded and summarized after the event.
          </p>
        </section>
      </article>
    </>
  );
}
