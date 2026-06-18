// Server-rendered semantic content for /okxproposal.
//
// The visible page is a pair of iframes (HorizontalDeck / VerticalDeck) that
// load standalone HTML decks. Those iframes are opaque to crawlers, AI agents
// and screen readers, so this component mirrors the deck's real content as
// plain, server-rendered HTML in the page DOM.

const EVENTS_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MusicEvent",
      name: "AXIS - Bar Oriente - 25 de junio",
      startDate: "2026-06-25T22:00:00-06:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      description:
        "Programa de junio de AXIS: takeover del Cuarto Rosa en Bar Oriente el 25 de junio. Lineup: Saturna, Isaac Olmos, Lulu y Malu GO.",
      location: {
        "@type": "Place",
        name: "Bar Oriente - Cuarto Rosa",
        address: { "@type": "PostalAddress", addressLocality: "Ciudad de Mexico", addressCountry: "MX" },
        geo: { "@type": "GeoCoordinates", latitude: 19.42008, longitude: -99.16534 },
      },
      performer: [
        { "@type": "Person", name: "Saturna (Carolina)", sameAs: "https://www.instagram.com/saturna.___" },
        { "@type": "Person", name: "Isaac Olmos", sameAs: "https://www.instagram.com/isolmos" },
        { "@type": "Person", name: "Lulu (Ludmila Poma)", sameAs: "https://www.instagram.com/lulu_musicdj" },
        { "@type": "Person", name: "Malu GO (Maria Luz Gomez Oliva)", sameAs: "https://www.instagram.com/malugomezoliva" },
      ],
      organizer: { "@type": "Organization", name: "AXIS", url: "https://axis.show" },
      image: "https://axis.show/fifa/25jun.webp",
    },
  ],
};

export default function PlanContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENTS_JSON_LD) }}
      />

      <style>{`
        .pbo-a11y-content {
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

      <article className="pbo-a11y-content" aria-label="AXIS Programa de Junio Propuesta de Sede">
        <header>
          <p>Temporada del Mundial, Ciudad de Mexico</p>
          <h1>AXIS - Programa de Junio</h1>
          <p>25 de junio - Un evento - Una sede: Bar Oriente (Cuarto Rosa)</p>
          <p>
            Propuesta de takeover del Cuarto Rosa, una noche. Ubicacion: 19.42008 N, 99.16534 W,
            Ciudad de Mexico, junio 2026.
          </p>
        </header>

        <section aria-labelledby="pbo-h-axis">
          <h2 id="pbo-h-axis">Que es AXIS y por que junio</h2>
          <p>Experiencias inesperadas en lugares inusuales.</p>
          <p>
            AXIS integra eventos presenciales, expresiones artisticas, musica, transmisiones en vivo,
            acceso digital, participacion en OKX app, mecanicas de recompensa y documentacion cultural.
            Para junio, buscamos que la noche en Bar Oriente funcione como un sistema completo de
            acceso, recompensas, medios y registro cultural.
          </p>
        </section>

        <section aria-labelledby="pbo-h-program">
          <h2 id="pbo-h-program">Una Noche - Calendario en Bar Oriente</h2>
          <p>Un evento, una sede. Fecha: 25 de junio. Formato: takeover del Cuarto Rosa, una noche completa.</p>
        </section>

        <section aria-labelledby="pbo-h-venue">
          <h2 id="pbo-h-venue">La Sede - Bar Oriente, Cuarto Rosa</h2>
          <p>
            Para la marca significa una noche activada con programacion, produccion y contenido sin
            costo extra para los involucrados: AXIS llena el cuarto, trae el line-up y el arte digital,
            y la marca gana trafico, usuarios y contenido de esa fecha.
          </p>
        </section>

        <section aria-labelledby="pbo-h-lineup">
          <h2 id="pbo-h-lineup">Lineup - Bar Oriente - 25 jun</h2>
          <p>Ritmos de la noche - Black Studio.</p>
          <dl>
            <dt>Saturna</dt>
            <dd />
            <dt>Isaac Olmos</dt>
            <dd />
            <dt>Lulu</dt>
            <dd />
            <dt>Malu GO</dt>
            <dd />
          </dl>
        </section>

        <section aria-labelledby="pbo-h-offer">
          <h2 id="pbo-h-offer">Lo que construimos en Bar Oriente</h2>
          <p>
            Una noche de takeover del Cuarto Rosa (25 jun). Acceso, recompensas, contenido, capturas,
            testimonios, amplificacion y documentacion, todo construido dentro de Bar Oriente.
          </p>
        </section>
      </article>
    </>
  );
}
