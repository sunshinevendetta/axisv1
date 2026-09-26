const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Future Renaissance · Casa Luma · Mexico City | Claude for Music",
  "startDate": "2026-10-29T16:00:00-06:00",
  "endDate": "2026-10-30T02:00:00-06:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "Private AXIS partnership presentation for a lending, yield or staking protocol: one night at Casa Luma, Mexico City, on October 29, 2026, where a deposit is opened in a seated 100-person workshop, runs through the night, and is settled and withdrawn before the guest goes home.",
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
        aria-label="Future Renaissance DeFi partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week 2026 · Claude community event</p>
          <h1>Future Renaissance · DeFi partner</h1>
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
          <h2 id="future-product-function">A POSITION OPENED AT 17:00 AND CLOSED BEFORE THE ROOM EMPTIES.</h2>
          <p>A protocol partner does not buy a logo above the bar. It gets four seated hours in which a guest reads the terms, deposits with a person beside them, watches the position run, and closes it the same night.</p>
          <ul>
            <li><strong>Deposit</strong>: The first deposit is made at a staffed onboarding point inside the workshop, with a host beside the guest for the step that normally happens alone at one in the morning.</li>
            <li><strong>Terms</strong>: Four seated hours are the rare window where somebody will actually read what they are depositing into. Staff walk the risk and terms page before any confirmation is taken.</li>
            <li><strong>Accrue</strong>: The position stays open from the workshop through the live coding set to the closing DJ, so the guest spends the night with the thing they read about actually doing something.</li>
            <li><strong>Settle</strong>: At the closing DJ the room settles together. Each position is closed at a staffed point and the guest sees exactly what it came to, with nothing estimated beforehand.</li>
            <li><strong>Bar Tab</strong>: The literal mechanic: a settled position is what releases the guest's drink at the bar. AXIS funds the allocation, so the drink is covered whatever the position returns.</li>
            <li><strong>Claim</strong>: Points, incentives or reward tokens the protocol issues are claimed in the room at close, not left sitting in an interface the guest will never open again.</li>
            <li><strong>Withdraw</strong>: Withdrawal is completed before the guest leaves Casa Luma. A position opened and closed the same night is a complete, honest funnel rather than an abandoned one.</li>
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
