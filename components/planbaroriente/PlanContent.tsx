// Server-rendered semantic content for /planbaroriente.
//
// The visible page is a pair of iframes (HorizontalDeck / VerticalDeck) that
// load standalone HTML decks. Those iframes are opaque to crawlers, AI agents
// and screen readers, so this component mirrors the deck's real content as
// plain, server-rendered HTML in the page DOM. It is visually hidden but fully
// readable by machines, and carries JSON-LD structured data for the two events.

const EVENTS_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MusicEvent",
      name: "AXIS · Bar Oriente · Noche Uno",
      startDate: "2026-06-18T22:00:00-06:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      description:
        "Noche uno del programa de junio de AXIS: lanzamiento de Brugee Records con takeover del Cuarto Rosa en Bar Oriente. Lineup: Sunshine Vendetta, Coronela b2b Chino Marley, Santi Santana.",
      location: {
        "@type": "Place",
        name: "Bar Oriente — Cuarto Rosa",
        address: { "@type": "PostalAddress", addressLocality: "Ciudad de México", addressCountry: "MX" },
        geo: { "@type": "GeoCoordinates", latitude: 19.42008, longitude: -99.16534 },
      },
      performer: [
        { "@type": "Person", name: "Saturna (Carolina)", sameAs: "https://www.instagram.com/saturna.___" },
        { "@type": "Person", name: "Isaac Olmos", sameAs: "https://www.instagram.com/isolmos" },
        { "@type": "Person", name: "Lulú (Ludmila Poma)", sameAs: "https://www.instagram.com/lulu_musicdj" },
        { "@type": "Person", name: "Malu GO (María Luz Gómez Oliva)", sameAs: "https://www.instagram.com/malugomezoliva" },
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
        // JSON-LD structured data for the two events.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENTS_JSON_LD) }}
      />

      {/*
        Keep the text mirror in the DOM and accessibility tree for crawlers,
        AI agents and screen readers, but out of the visual deck experience.
        Not display:none — that removes it from the tree and many crawlers.
      */}
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

      {/*
        Crawlable, screen-reader-readable mirror of the deck. Positioned off the
        visual flow but NOT display:none (which would hide it from many crawlers).
      */}
      <article className="pbo-a11y-content" aria-label="AXIS · Programa de Junio · Propuesta de Sede (texto)">
        <header>
          <p>Temporada del Mundial, Ciudad de México</p>
          <h1>AXIS — Programa de Junio</h1>
          <p>18 y 25 de junio · Dos eventos · Una sede: Bar Oriente (Cuarto Rosa)</p>
          <p>
            Propuesta de takeover del Cuarto Rosa, dos noches. Ubicación: 19.42008° N, 99.16534° W,
            Ciudad de México, junio 2026.
          </p>
        </header>

        <section aria-labelledby="pbo-h-axis">
          <h2 id="pbo-h-axis">Qué es AXIS y por qué junio</h2>
          <p>Experiencias inesperadas en lugares inusuales.</p>
          <p>
            AXIS opera integrando eventos presenciales, expresiones artísticas, música, transmisiones
            en vivo, acceso digital, participación onchain, mecánicas de recompensa y documentación
            cultural. Para junio, buscamos que las dos noches en Bar Oriente funcionen como un sistema
            completo de acceso, recompensas, medios y registro cultural.
          </p>
          <ul>
            <li>Eventos físicos</li>
            <li>Arte y música</li>
            <li>Transmisión en vivo</li>
            <li>Acceso por wallet</li>
            <li>Flujos de recompensa</li>
            <li>Documentación</li>
          </ul>
          <p>No afiliado a la FIFA. Solo contexto de la temporada del Mundial. No se reclaman derechos oficiales.</p>
        </section>

        <section aria-labelledby="pbo-h-program">
          <h2 id="pbo-h-program">Dos Noches — Calendario en Bar Oriente</h2>
          <p>Dos eventos, una sede. Fechas: 18 + 25 de junio. Formato: 2 × takeover del Cuarto Rosa, dos noches completas.</p>
          <ul>
            <li>Noche 1 — 18 de junio — Bar Oriente, Cuarto Rosa</li>
            <li>Noche 2 — 25 de junio — Bar Oriente, Cuarto Rosa</li>
          </ul>
        </section>

        <section aria-labelledby="pbo-h-venue">
          <h2 id="pbo-h-venue">Las Sedes — Bar Oriente, Cuarto Rosa</h2>
          <p>
            Uno de los destinos de vida nocturna más fuertes de la Ciudad de México, con una audiencia
            cultural comprobada. Queremos el Cuarto Rosa porque es el espacio con el público y la energía
            correctos para montar el formato completo.
          </p>
          <p>
            Para Bar Oriente significa dos noches activadas con programación, producción y contenido sin
            costo en producción extra para la casa: nosotros llenamos el cuarto, traemos el line-up y el
            arte digital, y la sede gana tráfico y material de marca de esas fechas, así como una
            experiencia inmersiva y diferente en las noches de evento.
          </p>
        </section>

        <section aria-labelledby="pbo-h-n1">
          <h2 id="pbo-h-n1">Lineup — Bar Oriente · 18 jun · Noche Uno</h2>
          <p>Release party · Brugee Records. La noche uno es el lanzamiento de Brugee Records, un nuevo sello que debuta en Bar Oriente. El takeover del Cuarto Rosa va en sintonía con esa agenda.</p>
          <dl>
            <dt>Sunshine Vendetta</dt>
            <dd>
              Fundador del sello WEIRDNXC, con más de 3M de reproducciones en plataformas. En su programa
              de radio Hyperbass ha recibido a invitados como X-Coast, Opium Hum, Pixelord, Miss Jay y más,
              y sacó a Altern 8 durante la pandemia para realizar su primer radio show en más de 10 años de
              pausa. Para esta noche presenta un set de house especial.
            </dd>
            <dt>Coronela b2b Chino Marley</dt>
            <dd>
              Chino Marley ha tocado con Yamagucci y abrió para Tom &amp; Collins, el dúo mexicano detrás de
              Terms &amp; Conditions. Coronela es una de las nuevas propuestas de la escena.
            </dd>
            <dt>Santi Santana</dt>
            <dd>
              DJ de la Ciudad de México (@santisantanamx), conocido por su paso por Acapulco Shore (MTV).
              Más de 89K seguidores; cierra la noche con un set de house.
            </dd>
          </dl>
        </section>

                <section aria-labelledby="pbo-h-n2">
          <h2 id="pbo-h-n2">Lineup — Bar Oriente · 25 jun · Noche Dos</h2>
          <p>Ritmos de la noche · Black Studio.</p>
          <p>Nacimos de las sombras.</p>
          <dl>
            <dt>Saturna</dt>
            <dd />
            <dt>Isaac Olmos</dt>
            <dd />
            <dt>Lulú</dt>
            <dd />
            <dt>Malu GO</dt>
            <dd />
          </dl>
        </section>

        <section aria-labelledby="pbo-h-format">
          <h2 id="pbo-h-format">Formato del Evento</h2>
          <p>Cada evento AXIS reúne cultura, captura y la capa de recompensas en un mismo espacio.</p>
          <h3>A. Cultura</h3>
          <ul>
            <li>Galería de arte — obras visuales dentro del entorno del evento.</li>
            <li>Sets de DJ — programación en vivo grabada para uso posterior al evento.</li>
            <li>Video mapping — visuales espaciales integrados en la sede en el Cuarto Rosa con proyectores.</li>
          </ul>
          <h3>B. Medios en sede</h3>
          <ul>
            <li>Propuesta de intervención — nos encantaría intervenir su LED wall con una experiencia inmersiva.</li>
            <li>Livestream — transmisión en vivo o grabada capturada en sitio.</li>
            <li>Fotografía — archivo fotográfico y video post evento.</li>
          </ul>
          <h3>C. Producción de contenido</h3>
          <ul>
            <li>Aftermovie — material de resumen editado para uso de la sede.</li>
            <li>Captura de testimonios — frases de invitados y artistas cuando estén disponibles.</li>
            <li>Coleccionables — momentos seleccionados se convierten en activos digitales.</li>
          </ul>
          <h3>D. Sistema de acceso</h3>
          <ul>
            <li>Boletos por wallet — los invitados acceden mediante pases basados en wallet.</li>
            <li>Cubos NFC — interacciones via Tap para ejecutar dinámicas especiales.</li>
            <li>Onboarding — instrucciones claras entregadas en sitio.</li>
          </ul>
          <h3>E. Capa de activación</h3>
          <ul>
            <li>Guiado por staff — el staff guía a los invitados por el flujo de recompensas.</li>
            <li>Créditos de consumo — nuestro sponsor pagará créditos de consumo para que los invitados gasten en el lugar.</li>
            <li>Guestlist para invitados — pedimos cupos a la sede para invitar personas con coleccionables digitales vinculados a wallet.</li>
          </ul>
          <h3>F. Crecimiento + reportes</h3>
          <ul>
            <li>Amplificación social — los invitados publican, etiquetan o comparten para extenderla.</li>
            <li>Flujo de recompensas — el sistema integral de acceso y canje.</li>
            <li>Insights post-evento — coleccionables digitales, canjes, contenido y asistencia después.</li>
          </ul>
        </section>

        <section aria-labelledby="pbo-h-system">
          <h2 id="pbo-h-system">Cómo Funciona el Sistema</h2>
          <p>Un flujo continuo; AXIS está presente en cada paso que toca el invitado.</p>
          <ol>
            <li>AXIS financia el evento.</li>
            <li>AXIS construye la capa de recompensas.</li>
            <li>Los invitados llegan al sitio.</li>
            <li>El staff guía a los invitados.</li>
            <li>Los invitados tocan cubos NFC.</li>
            <li>Pantallas de onboarding.</li>
            <li>Canjear coleccionables digitales por wallet.</li>
            <li>Desbloquear créditos para bebidas y beneficios.</li>
            <li>Publicar, etiquetar, compartir.</li>
            <li>Intervención interactiva visual on site.</li>
            <li>AXIS captura todo.</li>
            <li>La sede recibe los insights.</li>
          </ol>
          <p>Fases: A. Financiar y construir · B. Activación en sitio · C. Capturar y reportar.</p>
        </section>

        <section aria-labelledby="pbo-h-offer">
          <h2 id="pbo-h-offer">Lo que construimos en Bar Oriente</h2>
          <p>
            Dos noches de takeover del Cuarto Rosa (18 jun y 25 jun). Propuesta de lo que montamos juntos
            en la sede, no una venta. Acceso, recompensas, contenido, capturas, testimonios, amplificación
            y documentación, todo construido dentro de Bar Oriente.
          </p>
          <p>Lo que montamos incluye:</p>
          <ul>
            <li>Branding en wallet</li>
            <li>Créditos de consumo para invitados</li>
            <li>Guestlist para invitados</li>
            <li>Activación NFC</li>
            <li>Pantallas de onboarding</li>
            <li>Pantallas de recompensa</li>
            <li>Intervención LED</li>
            <li>Projection mapping</li>
            <li>Galería de arte</li>
            <li>Emplazamiento en transmisión</li>
            <li>Fotografía</li>
            <li>Aftermovie</li>
            <li>Captura de testimonios</li>
            <li>Coleccionables</li>
            <li>Amplificación social</li>
            <li>Capturas de emplazamiento</li>
            <li>Reporte de asistencia</li>
            <li>Insights de coleccionables digitales por wallet</li>
            <li>Insights de acceso</li>
            <li>Reporte de canjes</li>
          </ul>
        </section>

        <section aria-labelledby="pbo-h-contact">
          <h2 id="pbo-h-contact">Contacto</h2>
          <p>Omar Ceja — Fundador, AXIS</p>
          <ul>
            <li>Correo: <a href="mailto:omar.ceja@protonmail.com">omar.ceja@protonmail.com</a></li>
            <li>Web: <a href="https://axis.show">axis.show</a></li>
            <li>
              Redes: <a href="https://instagram.com/axishow" rel="noopener noreferrer">instagram.com/axishow</a>
              {" · "}
              <a href="https://x.com/axishow" rel="noopener noreferrer">x.com/axishow</a>
            </li>
          </ul>
          <p>Unexpected experiences in unusual places. Ciudad de México, junio 2026. © MMXXVI AXIS®, axis.show</p>
        </section>
      </article>
    </>
  );
}
