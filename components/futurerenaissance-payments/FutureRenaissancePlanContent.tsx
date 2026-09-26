const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Future Renaissance · Casa Luma · Mexico City | Claude for Music",
  "startDate": "2026-10-29T16:00:00-06:00",
  "endDate": "2026-10-30T02:00:00-06:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "Private AXIS partnership presentation for a payments, card or stablecoin-rail product: one night at Casa Luma, Mexico City, on October 29, 2026, where the partner does not sponsor the bar but runs it as the payment rail for every drink sold and every drink AXIS funds.",
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
        aria-label="Future Renaissance Payments partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week 2026 · Claude community event</p>
          <h1>Future Renaissance · Payments partner</h1>
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
          <h2 id="future-product-function">THE PARTNER DOES NOT SPONSOR THE BAR. IT IS THE BAR'S RAIL.</h2>
          <p>Every guest in the room buys or claims a drink that night, which makes paying for a drink the most repeated action of the whole event. A payments partner owns that action end to end, with a real venue on the other side of it.</p>
          <ul>
            <li><strong>Issue</strong>: Cards are issued or provisioned on the spot: during the 17:00 workshop for the seated 100, then at the door from 21:00 for everyone arriving for the party.</li>
            <li><strong>Tap</strong>: The product's core action is the room's core action. A guest taps at Casa Luma's bar and is handed a drink, with no app-store detour and no code to read out.</li>
            <li><strong>Repeat</strong>: Nobody buys one drink between 21:00 and close. Repeat spend is what separates a payments partner from every other product on the floor: the same guest uses it again and again without being asked.</li>
            <li><strong>Tab</strong>: A guest tab is opened at check-in and closed before the guest leaves, so nothing is left hanging on a card behind the bar at four in the morning.</li>
            <li><strong>Allocation</strong>: AXIS funds a drink allocation for the night and buys soft drinks from the bar for the workshop. All of it is disbursed and settled over the partner's rail, so the hospitality budget itself becomes volume on the product.</li>
            <li><strong>Split</strong>: A round bought for a table is split instantly between the people standing at it, and anything charged wrong is reimbursed before that guest leaves the venue.</li>
            <li><strong>Merchant</strong>: The venue is a genuine merchant, not a simulation. Casa Luma sells the drinks, accepts the rail, and gets settled for exactly what it sold.</li>
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
