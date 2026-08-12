const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: "Future Renaissance",
  startDate: "2026-10-28T22:00:00-06:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  maximumAttendeeCapacity: 120,
  description:
    "Future Renaissance is an AXIS Tech Week Mexico Edition flagship event combining art, music, technology, culture, hospitality, missions, and live media.",
  location: {
    "@type": "Place",
    name: "Owl Condesa",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mexico City",
      addressCountry: "MX",
    },
  },
  performer: [
    { "@type": "Person", name: "Saturna" },
    { "@type": "Person", name: "Isaac Olmos" },
    { "@type": "Person", name: "Lulú" },
    { "@type": "Person", name: "Malu GO" },
  ],
  organizer: {
    "@type": "Organization",
    name: "AXIS",
    url: "https://axis.show",
  },
  image: "https://axis.show/futurerenaissance/poster-horizontal.png",
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
        aria-label="Future Renaissance sponsor presentation"
      >
        <header>
          <p>AXIS · Tech Week Mexico Edition</p>
          <h1>Future Renaissance</h1>
          <p>October 28, 2026 · Owl Condesa · Mexico City</p>
        </header>

        <section aria-labelledby="future-event">
          <h2 id="future-event">The event</h2>
          <p>
            Future Renaissance is an AXIS Tech Week Mexico Edition flagship event
            in Mexico City in October 2026. The event is designed for 120 attendees.
          </p>
          <p>
            The program brings together art, music, technology, culture,
            hospitality, missions, livestreaming, and media documentation.
          </p>
        </section>

        <section aria-labelledby="future-sponsor-system">
          <h2 id="future-sponsor-system">Sponsor activation system</h2>
          <p>
            The sponsor system is designed around one required sponsor action per
            attendee: 120 attendees and 120 required [brand] actions.
          </p>
          <p>
            Event Partner investment is $2,500 USD for a complete 120-person
            activation including mission design, rewards, validation, staff
            execution, product integration, media capture, live measurement, and
            post-event reporting.
          </p>
        </section>

        <section aria-labelledby="future-presenting-product">
          <h2 id="future-presenting-product">Exclusive Presenting Product</h2>
          <p>
            The single Exclusive Presenting Product position is $3,500 USD. It
            includes everything in Event Partner plus a signature product
            experience, category exclusivity, priority integration, dedicated
            product media, 30-day continuation, one additional smaller AXIS
            activation, and extended performance reporting.
          </p>
        </section>

        <section aria-labelledby="future-measurement">
          <h2 id="future-measurement">Measurement and proof</h2>
          <p>
            AXIS reports attendance, mission completion rate, qualified actions,
            stage conversion, and reward redemption. CPQA, CPA, CAC, ROI, LTV:CAC,
            and NPV are calculated after the event from verified results when
            sponsor-side economic data supports them.
          </p>
        </section>
      </article>
    </>
  );
}
