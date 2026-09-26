const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Future Renaissance · Casa Luma · Mexico City | Claude for Music",
  "startDate": "2026-10-29T16:00:00-06:00",
  "endDate": "2026-10-30T02:00:00-06:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "Private AXIS partnership presentation built for a digital-art marketplace: one night at Casa Luma, Mexico City, October 29 2026, where a 100-seat Claude workshop and a live-coding after party generate collectible work inside the room. The marketplace lists it, sells it, and reports it.",
  "location": {
    "@type": "Place",
    "name": "Casa Luma",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tinala 145, Roma Norte",
      "addressLocality": "Mexico City",
      "addressRegion": "CDMX",
      "addressCountry": "MX"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "AXIS",
    "url": "https://axis.show"
  },
  "image": "https://axis.show/futurerenaissanceextended/poster-horizontal.png"
};

export default function FutureRenaissancePlanContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSON_LD) }}
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
        aria-label="Future Renaissance Marketplace partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week 2026 · Claude community event</p>
          <h1>Future Renaissance · Marketplace partner</h1>
          <p>Thursday, October 29, 2026 · Casa Luma, Tinala 145, Roma Norte, CDMX · Mexico City</p>
          <p>Event window: 16:00 to 02:00</p>
        </header>

        <section aria-labelledby="future-product-night">
          <h2 id="future-product-night">The night</h2>
          <p>
            One night. From 17:00 to 21:00, a seated, hands-on Claude community
            workshop for 100 attendees from the music industry. At 21:00, with no
            gap, the same room becomes the Future Renaissance party, running to 02:00
            for 120 further guests. AXIS hosts and operates the night.
          </p>
        </section>

        <section aria-labelledby="future-product-function">
          <h2 id="future-product-function">THE ROOM GENERATES THE INVENTORY. THE MARKETPLACE RUNS IT.</h2>
          <p>This is a night that makes its own supply: Verse works that draw themselves from a hash the moment they are collected, Pixelord releases that ship sound and 3D together, and LED wall output the guests generated with Claude. A marketplace partner does not have to simulate scarcity here, it operates the market for work that did not exist before 17:00.</p>
          <ul>
            <li><strong>Live Mint</strong>: The live-coding set writes music as code in front of the room. States of that set are minted on the marketplace while it is still running, so the first collectors are people who watched it happen.</li>
            <li><strong>Hash Draw</strong>: A Verse generative work is not a fixed file. It reads a hash when it is collected and draws itself from that seed, so the guest's own collect is the act that creates their output.</li>
            <li><strong>Gallery Scene</strong>: Between sets the main LED wall runs the marketplace's own gallery view, showing what the room is collecting in real time. It is the product's actual interface at venue scale, not a logo card.</li>
            <li><strong>Guest Edition</strong>: Guests change the LED wall through Claude with their own photos, videos and prompts. The output they made is listed on the marketplace with the guest credited as its creator.</li>
            <li><strong>Bar Drop</strong>: One drop opens on the clock when the after-party doors open and 120 further guests arrive. Collecting inside that window is the action that releases the drink at the bar.</li>
            <li><strong>Royalty Ticker</strong>: When a piece sells in the room, the split going to the artist is displayed. Pixelord ships sound and 3D together onchain, and the room gets to see what that practice actually pays.</li>
            <li><strong>Night Shelf</strong>: Everything a guest collected across the night resolves into one set held at their own address. Months later it is still the record that they were in the room on October 29.</li>
          </ul>
        </section>

        <section aria-labelledby="future-product-packages">
          <h2 id="future-product-packages">Partnership packages</h2>
          <ul>
            <li><strong>Activity Partner — $2,500 USD</strong>: One product function inside the October 29 Claude community event. One authored activity with mission, staff validation, reward path, screen presence and reporting. Claude retains community-event status for the night. Partner integration is subordinate to it.</li>
            <li><strong>Category Exclusive Partner — $3,500 USD</strong>: Sole product in its category inside AXIS-controlled inventory for the night. A hero function with priority placement, deeper integration and dedicated product media. Exclusivity applies only to AXIS-controlled inventory and cannot override Claude or venue rights.</li>
          </ul>
          <p>Both packages are for this single night. Claude retains community-event status.</p>
        </section>
      </article>
    </>
  );
}
