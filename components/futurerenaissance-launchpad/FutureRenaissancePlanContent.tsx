const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Future Renaissance · Casa Luma · Mexico City | Claude for Music",
  "startDate": "2026-10-29T16:00:00-06:00",
  "endDate": "2026-10-30T02:00:00-06:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "Private AXIS partnership presentation built for a creator launchpad: one night at Casa Luma, Mexico City, October 29 2026, where a 100-seat Claude workshop seats the music industry and the after party hosts a live launch in the room. Allocation is earned by participation and delivered as a named holder cohort.",
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
        aria-label="Future Renaissance Launchpad partnership presentation"
      >
        <header>
          <p>AXIS · Mexico Tech Week 2026 · Claude community event</p>
          <h1>Future Renaissance · Launchpad partner</h1>
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
          <h2 id="future-product-function">A LIVE LAUNCH IN FRONT OF 100 PEOPLE WHO WORK IN MUSIC.</h2>
          <p>The 17:00 workshop seats producers, artists, labels, managers and studios, which is the exact population a creator-launch product is built for. The launchpad does not sponsor this night, it runs one real launch inside it, opened in the room and filled by the people sitting in it.</p>
          <ul>
            <li><strong>Live Launch</strong>: A creator from the line-up launches through the platform during the after party, at an announced minute, with the room present. The launch is the event itself, not a link posted the next day.</li>
            <li><strong>Creator Desk</strong>: The 17:00 workshop is hands-on with a chair for every attendee. The exercise is building a launch draft with Claude on the platform, so the room learns the product by shipping something inside it.</li>
            <li><strong>Earned Allocation</strong>: The size of a guest's allocation comes from validated actions completed during the night. Inside this room money is not the qualifier, participation is.</li>
            <li><strong>The Curve</strong>: Launch progress is a scene on the main LED wall. Four hundred and fifty people watching the same number move is something a launch page on a phone can never reproduce.</li>
            <li><strong>Coded Artefact</strong>: The live-coding set writes music in code in front of the room, which gives the launch an artefact made where everyone could watch it happen. Pixelord already releases sound and 3D together onchain, and Verse Works, also on the line-up, ships work that is drawn from a hash when it is collected rather than handed over as a fixed file.</li>
            <li><strong>Room Gate</strong>: The opening window is restricted to guests validated by staff at Casa Luma. It widens later, but the founding holders are the people who were actually there.</li>
            <li><strong>Holder Cohort</strong>: After the night the launchpad receives its holder list as a described cohort, producers, labels, managers and studios, instead of an anonymous export of addresses.</li>
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
