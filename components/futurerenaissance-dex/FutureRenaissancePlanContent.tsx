const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Future Renaissance · Casa Luma · Mexico City | Claude for Music",
  "startDate": "2026-10-29T16:00:00-06:00",
  "endDate": "2026-10-30T02:00:00-06:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "Private AXIS partnership presentation for a decentralised exchange: one night at Casa Luma, Mexico City, October 29 2026, where wallet connection, swaps, liquidity and onchain reward claims all happen on event grounds. A Claude community event during Mexico Tech Week, powered by AXIS.",
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
        aria-label="Future Renaissance DEX partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week 2026 · Claude community event</p>
          <h1>Future Renaissance · DEX partner</h1>
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
          <h2 id="future-product-function">NO ACCOUNT. NO KYC. SEVEN ONCHAIN ACTIONS IN ONE ROOM.</h2>
          <p>A DEX partner does not need an onboarding desk, because there is nothing to sign up for. A wallet connects in seconds, and every action that follows is executed by the guest, held by the guest, and readable by anyone on a public explorer.</p>
          <ul>
            <li><strong>Connect</strong>: There is no desk, no document scan and no wait for approval. A guest connects a wallet and is immediately able to do everything the night asks of them.</li>
            <li><strong>Deposit</strong>: A guest funds the address they control, at Casa Luma, and the balance is theirs at every moment of the process. Nothing sits in the partner's custody waiting on a withdrawal request.</li>
            <li><strong>Two Swaps</strong>: The mission is not to try the app. It is two swaps, both completed inside the venue, because the second one is what proves the guest can do it without help.</li>
            <li><strong>Liquidity</strong>: The most committed guests go past swapping and put liquidity into a pool for the duration of the event, which is the difference between a user and a participant.</li>
            <li><strong>Limit Order</strong>: A limit order is the one onchain action that keeps working after the guest puts the phone away. It is placed at the bar and can fill during the closing set.</li>
            <li><strong>Claim</strong>: At the end of the night the reward is taken by the guest's own transaction, into the guest's own wallet. There is no internal balance to be credited later.</li>
            <li><strong>Prove</strong>: Because every mechanic here settles onchain, the post-event report is not a claim about what happened. It is a list of transactions the partner can verify without trusting AXIS.</li>
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
