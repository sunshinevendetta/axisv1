const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Future Renaissance · Casa Luma · Mexico City | Claude for Music",
  "startDate": "2026-10-29T16:00:00-06:00",
  "endDate": "2026-10-30T02:00:00-06:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "Private AXIS partnership presentation for a centralised exchange: one night at Casa Luma, Mexico City, October 29 2026, where verification, funding, first orders and drink redemption all happen in the room. A Claude community event during Mexico Tech Week, powered by AXIS.",
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
        aria-label="Future Renaissance Exchange partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week 2026 · Claude community event</p>
          <h1>Future Renaissance · Exchange partner</h1>
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
          <h2 id="future-product-function">ONE NIGHT. SEVEN EXCHANGE ACTIONS COMPLETED IN THE ROOM.</h2>
          <p>An exchange partner does not buy a logo on the bar menu. For one night at Casa Luma the product is where identity gets verified, where the first account gets funded, where the first order gets placed, and what releases the drink.</p>
          <ul>
            <li><strong>Verify</strong>: Account creation and identity verification happen at a staffed desk inside the venue, with a host who can fix a failed document scan while the guest is still standing there.</li>
            <li><strong>Deposit</strong>: The step that leaks hardest in a remote funnel happens here in a lit room with support present: a first deposit by card or local transfer, completed on site.</li>
            <li><strong>First Trade</strong>: A guest who has only ever read about the product places one real order, a convert or a first spot trade, with someone beside them who can explain the screen once.</li>
            <li><strong>Outcomes</strong>: The prediction-markets surface is the part of an exchange that genuinely works in a bar: guests take a position on something resolving that week and check it before they leave.</li>
            <li><strong>Invite</strong>: Referral works at Casa Luma because the person being invited is standing two metres away and can finish the flow before the drink is poured.</li>
            <li><strong>Withdraw</strong>: A guest moves funds out to their own wallet on the night. It is the fastest way to answer the custody question, because it is answered in front of the person asking it.</li>
            <li><strong>Retain</strong>: Unlike a giveaway, a verified account persists. It is a real, reachable, funded relationship the partner still holds weeks after Casa Luma empties.</li>
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
