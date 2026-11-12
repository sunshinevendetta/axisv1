const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Mexico City | Create and Delegate · AI Creative Club",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  startDate: "2026-12-04T17:00:00-06:00",
  endDate: "2026-12-05T02:00:00-06:00",
  description:
    "AI Creative Club Level 01 at Casa Luma on December 4, 2026: art and business content creation with Anana, AI workflows and agent integrations with Sunshine Vendetta, and investing business profits onchain. A four-trader onsite tournament awards a prize to the first trader to reach the goal. Onchain art combines national, international and onsite creators. The workshop runs from 17:30 to 21:00 within the existing 17:00 to 02:00 event window, with cultural programming, gallery and social participation.",
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
          <p>Event window: 17:00 to 02:00</p>
          <p>Powered by: https://axis.show</p>
        </header>

        <section aria-labelledby="future-event">
          <h2 id="future-event">The event</h2>
          <p>
            The night runs in two halves at Casa Luma, the host venue, on
            Tinala 145 in Roma Norte, Mexico City, on December 4, 2026. The event window
            opens at 17:00 and closes at 02:00. From 17:30 to 21:00 it is a seated Creative AI
            community workshop for 100 artists, creators, business owners and curious newcomers. At
            21:30, after a short break, it becomes the AI Creative Club party, an AXIS club event running to 02:00, with 120 further guests arriving on top of
            the workshop attendees who stay on.
          </p>
          <p>
            The program brings together art and business content creation, AI agents,
            workflow automation and investing business profits onchain, alongside the tournament,
            community, hospitality and media documentation.
          </p>
          <p>
            The workshop is seated and chairs are provided for every attendee. The
            event window opens at 17:00 so the room, the seating and
            the screen routing are ready before 17:30, and the workshop facilitators have
            access to the venue screen to run their presentation. AXIS buys soft
            drinks from the venue bar for the workshop room, and the bar stays open
            and sells to guests throughout. Registration runs on Luma through the
            organizers with prior approval, as a single list; event communications
            are issued by the organizers. Where operationally agreed, the venue can
            continue receiving its regular clientele.
          </p>
        </section>

        <section aria-labelledby="future-music">
          <h2 id="future-music">Trading tournament and after-party</h2>
          <p>Four traders compete onsite. The first to reach the goal wins a prize.
            Trader names, the goal and prize will be announced. The after-party
            remains a secondary social continuation after the core program.</p>
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
          <h2 id="future-digital-artists">Onchain art selection</h2>
          <p>A curated selection of national and international onchain artists,
            alongside people creating onsite. Individual artists and works will
            be announced.</p>
        </section>

        <section aria-labelledby="future-creative-ai">
          <h2 id="future-creative-ai">Content creation, agents and workflows</h2>
          <p>
            Two beginner-friendly tracks share the seated workshop. Anana guides
            a visual brief, a base-image tool, image editing and
            a video extension for art, product imagery and business content.
            Sunshine Vendetta guides a real task, AI workflow, review and
            reuse, plus an agent integration demonstration. Participants keep an image
            or edit and reusable task instructions. The core journey is to create content for a business, automate its workflows
            with AI agents, then explore investing its profits onchain. No prior technical knowledge is required.
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
            real-time graphics, tournament participation, Creative AI onboarding and activity
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
            workshop and tournament programming, tournament participation, Creative AI activity
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
