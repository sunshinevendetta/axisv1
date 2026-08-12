const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: "Future Renaissance",
  startDate: "2026-10-28T22:00:00-06:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  maximumAttendeeCapacity: 120,
  description:
    "Future Renaissance is an AXIS event at Owl Condesa combining music, digital art, beer and canapés, partner activations, content capture, and post-event reporting.",
  location: {
    "@type": "Place",
    name: "Owl Condesa",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ciudad de México",
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
  sponsor: {
    "@type": "Organization",
    name: "PARTNER BRAND",
  },
  image: "https://axis.show/futurerenaissance/og.png",
  offers: {
    "@type": "Offer",
    price: "2500",
    priceCurrency: "USD",
    url: "https://axis.show/futurerenaissance",
  },
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
        aria-label="Future Renaissance partner proposal"
      >
        <header>
          <p>AXIS · Ciudad de México</p>
          <h1>Future Renaissance</h1>
          <p>October 28, 2026 · Owl Condesa · Capacity: 120 pax</p>
          <p>Partner placeholder: PARTNER BRAND · Investment: 2.5K USD</p>
        </header>

        <section aria-labelledby="future-concept">
          <h2 id="future-concept">The concept</h2>
          <p>Unexpected experiences in unusual places.</p>
          <p>
            AXIS combines a live event, art, music, partner onboarding, measurable
            reward mechanics, media capture, and cultural documentation in one
            night at Owl Condesa.
          </p>
        </section>

        <section aria-labelledby="future-hospitality">
          <h2 id="future-hospitality">Guest hospitality</h2>
          <p>
            The guest experience includes beer and canapés for up to 120 attendees.
            Partner actions, redemptions, media, and attendance are documented in
            the post-event report.
          </p>
        </section>

        <section aria-labelledby="future-deliverables">
          <h2 id="future-deliverables">Included deliverables</h2>
          <p>
            Music programming, digital art, projection mapping, LED integration,
            staff-guided activation, photography, video, an aftermovie, testimonial
            capture, social content, redemption tracking, and a written report.
          </p>
        </section>
      </article>
    </>
  );
}
