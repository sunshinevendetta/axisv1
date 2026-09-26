const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Future Renaissance · Casa Luma · Mexico City | Claude for Music",
  "startDate": "2026-10-29T16:00:00-06:00",
  "endDate": "2026-10-30T02:00:00-06:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "Private AXIS partnership presentation built for a wallet product: one night at Casa Luma, Mexico City, October 29 2026, where the wallet is the door, the signature, the bar tab and the address that is still reachable the next morning.",
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
        aria-label="Future Renaissance Wallet partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week 2026 · Claude community event</p>
          <h1>Future Renaissance · Wallet partner</h1>
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
          <h2 id="future-product-function">SEVEN MOMENTS IN ONE NIGHT WHERE THE WALLET IS THE ONLY THING THAT WORKS.</h2>
          <p>A wallet partner does not buy a logo above the bar. For one evening the wallet is the credential at the door, the signature that validates a mission, the thing that opens a drink, and the only address still reachable the next morning.</p>
          <ul>
            <li><strong>Connect</strong>: Entry and wallet connection are the same movement, so the wallet is opened while a host is standing there to help.</li>
            <li><strong>Passport</strong>: The night's mission passport is issued into the wallet, which makes the wallet the thing a guest needs to move through the evening.</li>
            <li><strong>Sign</strong>: Mission validation is a signature from the guest's own key, so a completed action is provable rather than asserted by staff.</li>
            <li><strong>Fund</strong>: The hardest step in any wallet funnel is the first funded balance. The four seated hours are the rare window where someone will actually finish it.</li>
            <li><strong>Collect</strong>: The room generates one-of-one work all evening. The wallet is where a guest actually keeps the piece they were standing in front of.</li>
            <li><strong>Redeem</strong>: A completed action authorises a drink at the venue bar. The guest learns that the wallet is what paid for it.</li>
            <li><strong>Keep</strong>: When the closing DJ finishes, the wallet is the one channel that still resolves. Everything AXIS reports back is anchored to it.</li>
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
