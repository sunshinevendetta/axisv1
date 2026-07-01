const TRADING_ARENA_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Trading Arena at Bar Oriente",
  description:
    "Trading Arena en Bar Oriente: el torneo de trading mas intenso jamas realizado en LATAM, con Human Traders, AI Agents, mercados en movimiento y leaderboards en vivo.",
  about: {
    "@type": "Place",
    name: "Bar Oriente",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ciudad de Mexico",
      addressCountry: "MX",
    },
  },
  author: { "@type": "Organization", name: "AXIS", url: "https://axis.show" },
  image: "https://axis.show/tradingarena/baroriente.jpg",
};

export default function TradingArenaContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TRADING_ARENA_JSON_LD) }}
      />
      <style>{`
        .ta-a11y-content {
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
      <article className="ta-a11y-content" aria-label="Trading Arena Proposal">
        <header>
          <h1>Trading Arena en Bar Oriente</h1>
          <p>El torneo de trading mas intenso jamas realizado en LATAM.</p>
          <p>Dos categorias: Human Traders y AI Agents. Meta: 250 asistentes.</p>
          <p>Horario sugerido: torneo desde 4 PM, transicion 21:00 y afterparty 22:00.</p>
        </header>
        <section>
          <h2>Formato</h2>
          <p>
            El objetivo es transformar a Bar Oriente en el punto de encuentro donde trading,
            tecnologia, competencia, cultura y comunidad convergen en una experiencia en vivo.
            Trading Arena es una competencia de trading en vivo donde solo importa una cosa:
            El mayor profit gana. Todos compiten bajo las mismas reglas, el mismo mercado y el mismo
            limite de tiempo. Durante cuatro horas, Bar Oriente se transforma en una arena donde
            250 traders, builders, AI agents y espectadores siguen cada operacion en pantallas
            gigantes, leaderboards en vivo y un sistema clasificatorio de eliminacion directa
            por liquidacion.
          </p>
        </section>
        <section>
          <h2>Necesidades de sede</h2>
          <p>
            Bar Oriente provee espacio, operacion, staff, acceso, seguridad, barra, posible comida,
            pantallas y continuidad hacia la noche. Cuarto Rosa se usa para talks y demos durante el
            evento; los karaoke rooms superiores se usan para networking y actividades especiales.
            La propuesta contempla bebidas incluidas y food.
          </p>
        </section>
        <section>
          <h2>Opciones comerciales</h2>
          <p>
            Opcion A: paquete todo incluido con sede, bebidas, comida, staff y soporte operativo.
            Opcion B: sede y operacion base, con AXIS trayendo marcas patrocinadoras para bebidas y comida.
          </p>
        </section>
        <section>
          <h2>Transicion a After Party</h2>
          <p>
            Los asistentes pueden quedarse en el Cuarto Rosa o el salon de Karaoke haciendo networking
            mientras el DJ inicia abajo para comenzar el after party y permitir el acceso al publico general.
            A las 22:00 inicia el afterparty con acceso a publico general, clientes de Bar Oriente junto
            a los asistentes que han decidido quedarse a disfrutar el cierre.
          </p>
        </section>
      </article>
    </>
  );
}
