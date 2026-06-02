// AXIS RALLY — Landing screen
const { useState: useStateL, useEffect: useEffectL, useRef: useRefL } = React;

function Landing({ onEnter, tweaks, setRoute }) {
  const D = window.DATA;
  const [heroMode, setHeroMode] = useStateL(tweaks.hero); // 'feed' | 'medal' | 'type'
  useEffectL(() => setHeroMode(tweaks.hero), [tweaks.hero]);

  return (
    <div className="enter-fade">
      {/* ──────────────── HERO ──────────────── */}
      <section style={{ padding: '160px var(--pad-x) 80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HeroEyebrow />

        {heroMode === 'feed' && <HeroFeed onEnter={onEnter} />}
        {heroMode === 'medal' && <HeroMedal onEnter={onEnter} />}
        {heroMode === 'type' && <HeroType onEnter={onEnter} />}

        {/* big bottom ticker — always present, identity of the page */}
        <div style={{ marginTop: 'auto', paddingTop: 80, borderTop: '1px solid var(--line)' }}>
          <div className="line-label" style={{ marginBottom: 18 }}>
            <span>LIVE FEED · PDQ·01 · ROMA NORTE · {D.feed.length * 17} CLEARS / DAY</span>
          </div>
          <LiveTicker items={D.feed} speed={50}/>
        </div>
      </section>

      <div className="divider"></div>

      {/* ──────────────── WHAT IT IS ──────────────── */}
      <section>
        <SectionHead
          code="§ 01 · PREMISE"
          title={<>NOT A<br/>PARTY.<br/><span style={{ color: 'var(--ink-3)' }}>A QUEST.</span></>}
          meta={<>ONE DAY / ONE BUILDING / ONE STACK OF PIZZA<br/><br/>QUESTS ARE PHYSICAL<br/>MEDALS ARE AUGMENTED<br/>RANK IS EARNED IN PERSON</>}
        />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, background: 'var(--line)', border: '1px solid var(--line)',
        }}>
          {[
            { n: '01', t: 'GRAB A CHIP', d: 'At the door desk you receive an NFC chip and a slice. The chip carries your identity and every quest you can attempt.', g: '◈' },
            { n: '02', t: 'CLEAR QUESTS', d: 'Tap stations, post, record, mint, debate, scan, rally — across three floors and the rooftop. Each clear unlocks one augmented medal.', g: '◊' },
            { n: '03', t: 'RANK UP', d: 'XP composes into title — Initiate, Slice, Pie, Capo, Monolith. Higher ranks reveal classified quests.', g: '◉' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg)', padding: '48px 36px 36px',
              position: 'relative', minHeight: 320,
            }}>
              <div style={{
                position: 'absolute', top: 24, right: 28,
                fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-4)',
              }}>{s.n} / 03</div>
              <div style={{
                fontFamily: 'var(--display-alt)', fontSize: 80, lineHeight: 1,
                color: 'var(--ink-5)', marginBottom: 16, marginTop: -12,
              }}>{s.g}</div>
              <div className="display" style={{ fontSize: 36, marginBottom: 16 }}>{s.t}</div>
              <div style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, maxWidth: 320 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* ──────────────── MISSION TYPES ──────────────── */}
      <section>
        <SectionHead
          code="§ 02 · QUEST INDEX"
          title={<>EIGHT WAYS<br/>TO EARN.</>}
          meta={<>NFC · POST · REC · MINT<br/>DEBATE · SCAN · GROUP · CLASSIFIED<br/><br/>EACH QUEST = ONE MEDAL</>}
        />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {D.missionTypes.map((m, i) => (
            <Brackets key={m.id} className="glass" style={{ padding: 24, minHeight: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <span className="mono">{m.code}</span>
                <span className="mono" style={{ color: 'var(--ink-4)' }}>{m.short}</span>
              </div>
              <div style={{
                fontFamily: 'var(--display-alt)', fontSize: 56, lineHeight: 1,
                marginBottom: 16, color: 'var(--ink)',
              }}>{m.glyph}</div>
              <div className="display" style={{ fontSize: 18, marginBottom: 8 }}>{m.name}</div>
              <div style={{ color: 'var(--ink-3)', fontSize: 12, lineHeight: 1.5 }}>{m.blurb}</div>
            </Brackets>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* ──────────────── RANK LADDER ──────────────── */}
      <section>
        <SectionHead
          code="§ 03 · RANK LADDER"
          title={<>FIVE TITLES.<br/>ONE BODY.</>}
          meta={<>NO PURCHASE / NO SHORTCUT<br/>RANK IS PROOF<br/>YOU WERE THERE</>}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--line)' }}>
          {D.ranks.map((r, i) => (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 240px 140px 120px',
              alignItems: 'center', gap: 24,
              padding: '28px 32px',
              borderBottom: i < D.ranks.length - 1 ? '1px solid var(--line)' : 'none',
              background: i === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
            }}>
              <div className="mono" style={{ color: 'var(--ink-4)' }}>0{r.index}</div>
              <div className="display" style={{ fontSize: 48 }}>{r.title}</div>
              <div style={{ color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.4 }}>{r.desc}</div>
              <div className="mono">≥ {r.req} XP</div>
              <div className="mono" style={{ textAlign: 'right' }}>
                {r.id === 'initiate' ? 'BASE' : r.id === 'monolith' ? 'MYTHIC' : 'EARNED'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* ──────────────── EPISODES ──────────────── */}
      <section>
        <SectionHead
          code="§ 04 · EPISODES"
          title={<>WHERE<br/>IT MEETS.</>}
          meta={<>FOUR EPISODES / 2026<br/>ALL CDMX · ROAMING VENUES<br/><br/>NEXT: 21·06 · ROMA NORTE</>}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--line)' }}>
          {D.episodes.map((e, i) => (
            <div key={e.id} style={{
              background: 'var(--bg)',
              display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 200px 120px',
              alignItems: 'center', gap: 24, padding: '36px 32px',
              transition: 'background .2s', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}>
              <div className="display" style={{ fontSize: 36 }}>{e.code}</div>
              <div>
                <div className="mono" style={{ marginBottom: 4 }}>CITY</div>
                <div className="display" style={{ fontSize: 28 }}>{e.city}</div>
              </div>
              <div>
                <div className="mono" style={{ marginBottom: 4 }}>VENUE</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{e.venue}</div>
              </div>
              <div>
                <div className="mono" style={{ marginBottom: 4 }}>DATE</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>{e.date}</div>
              </div>
              <div>
                <div className="mono" style={{ marginBottom: 4 }}>MISSIONS · CAPACITY</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
                  {e.missions} · {e.capacity}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`tag ${e.state === 'LIVE' ? 'live' : ''}`}>
                  {e.state === 'LIVE' && <span className="dot"></span>}
                  {e.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* ──────────────── ENTER ──────────────── */}
      <section style={{ textAlign: 'center', padding: '140px var(--pad-x)' }}>
        <div className="eyebrow" style={{ marginBottom: 32, justifyContent: 'center' }}>
          BEGIN · PDQ·01 · ROMA NORTE
        </div>
        <h2 className="display" style={{
          fontSize: 'clamp(80px, 14vw, 220px)', lineHeight: 0.85, margin: '0 0 48px',
        }}>READY<br/><span style={{ color: 'var(--ink-3)' }}>OPERATOR?</span></h2>
        <button className="btn lg" onClick={onEnter}>
          ENTER THE RALLY <span className="arr">→</span>
        </button>
        <div style={{ marginTop: 48, color: 'var(--ink-4)', fontSize: 11, fontFamily: 'var(--mono)' }}>
          NO WALLET REQUIRED · NFC ISSUED ON ARRIVAL · BRING THE BODY
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer style={{
        padding: '60px var(--pad-x) 80px',
        borderTop: '1px solid var(--line)',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 32,
      }}>
        <div>
          <div className="display" style={{ fontSize: 28, marginBottom: 12 }}>AXIS<br/>PDQ</div>
          <div className="mono">PIZZA DAY QUEST · 2026</div>
        </div>
        {[
          { h: 'EPISODES', items: ['PDQ·01 · ROMA NORTE', 'PDQ·02 · JUÁREZ', 'PDQ·03 · POLANCO', 'PILOT · CONDESA'] },
          { h: 'PROTOCOL', items: ['QUESTS', 'MEDALS', 'RANKS', 'CHIPS'] },
          { h: 'CONTACT',  items: ['@axispdq', 'press@axispdq', 'venues@axispdq', '+52 55 ··· ····'] },
        ].map(c => (
          <div key={c.h}>
            <div className="mono" style={{ marginBottom: 16 }}>{c.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.items.map(i => <span key={i} style={{ fontSize: 13, color: 'var(--ink-2)' }}>{i}</span>)}
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}

/* ─────── Hero variants ─────── */

function HeroEyebrow() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 48,
    }}>
      <div className="eyebrow">AXIS · PIZZA DAY QUEST / PDQ·01 · LIVE</div>
      <div className="mono" style={{ color: 'var(--ink-4)' }}>
        21·06·2026 — CHIHUAHUA 10 · ROMA NORTE · CDMX
      </div>
    </div>
  );
}

function HeroFeed({ onEnter }) {
  const D = window.DATA;
  const [list, setList] = useStateL(D.feed.slice(0, 6));
  const idxRef = useRefL(6);

  useEffectL(() => {
    const id = setInterval(() => {
      const next = D.feed[idxRef.current % D.feed.length];
      idxRef.current++;
      setList(prev => [next, ...prev.slice(0, 5)]);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, flex: 1, alignItems: 'start' }}>
      <div>
        <h1 className="display" style={{
          fontSize: 'clamp(80px, 13vw, 200px)', margin: '0 0 28px', letterSpacing: '-0.02em',
        }}>
          MEDALS<br/>FOR<br/><span style={{ color: 'var(--ink-3)' }}>PRESENCE.</span>
        </h1>
        <p style={{
          maxWidth: 540, fontSize: 17, lineHeight: 1.45,
          color: 'var(--ink-2)', margin: '0 0 36px',
        }}>
          AXIS PIZZA DAY QUEST is a one-day rally inside a three-storey building
          in Roma Norte. Every action in the room — a tap, a post, a recorded
          confession, a mint, a seat at the debate table — is logged on your
          NFC chip and rewarded with an augmented medal that ranks you in the field.
        </p>
        <div style={{ display: 'flex', gap: 14 }}>
          <button className="btn lg" onClick={onEnter}>
            ENTER THE RALLY <span className="arr">→</span>
          </button>
          <button className="btn lg ghost">VIEW PDQ·01</button>
        </div>

        {/* spec strip */}
        <div style={{
          marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0,
          borderTop: '1px solid var(--line)', paddingTop: 24,
        }}>
          {[
            { k: 'OPERATORS', v: '247' },
            { k: 'CLEARS · 1H', v: '184' },
            { k: 'LIVE QUESTS', v: '14' },
            { k: 'EPISODE', v: 'PDQ·01' },
          ].map(s => (
            <div key={s.k}>
              <div className="mono" style={{ marginBottom: 6 }}>{s.k}</div>
              <div className="display-alt" style={{ fontSize: 32, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* live feed cards */}
      <div style={{
        position: 'relative', alignSelf: 'stretch',
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: 24, border: '1px solid var(--line)', borderRadius: 4,
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="tag live"><span className="dot"></span>LIVE CLEARS</span>
          <span className="mono">FEED · TX/IN</span>
        </div>
        {list.map((it, i) => (
          <Glitch trigger={i === 0 ? list[0].who + idxRef.current : 'static-' + i + it.who} key={i + '-' + it.who} className="enter-fade">
            <div style={{
              display: 'grid', gridTemplateColumns: '36px 1fr auto',
              alignItems: 'center', gap: 14, padding: '14px 16px',
              border: '1px solid var(--line)', borderRadius: 3,
              background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
              opacity: 1 - i * 0.12,
            }}>
              <div style={{
                width: 32, height: 32, border: '1px solid var(--line-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--display-alt)', fontSize: 14,
              }}>{it.who[0]}</div>
              <div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
                  color: 'var(--ink-3)', marginBottom: 3,
                }}>
                  {it.who} · {it.rank}
                </div>
                <div className="display-alt" style={{ fontSize: 16 }}>{it.what}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono-tight" style={{ color: 'var(--ink-2)' }}>+{2 + (i % 5)} XP</div>
                <div className="mono-tight" style={{ color: 'var(--ink-4)' }}>{i === 0 ? 'NOW' : i + 's'}</div>
              </div>
            </div>
          </Glitch>
        ))}
        <span className="brk tl"></span>
        <span className="brk tr"></span>
        <span className="brk bl"></span>
        <span className="brk br"></span>
      </div>
    </div>
  );
}

function HeroMedal({ onEnter }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, flex: 1, alignItems: 'center',
    }}>
      <div>
        <h1 className="display" style={{
          fontSize: 'clamp(72px, 12vw, 180px)', margin: '0 0 28px',
        }}>
          AUGMENT<br/>THE<br/>PROOF.
        </h1>
        <p style={{ maxWidth: 520, fontSize: 17, lineHeight: 1.45, color: 'var(--ink-2)', margin: '0 0 36px' }}>
          Every cleared mission casts an AR medal — viewable through your chip on any surface in the room, and forever attached to your rank.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn lg" onClick={onEnter}>ENTER THE RALLY <span className="arr">→</span></button>
          <button className="btn lg ghost">SPEC SHEET</button>
        </div>
      </div>

      <div style={{ position: 'relative', height: 480 }}>
        <Medal variant="chrome" size={420}/>
        <Reticle size={500} animated/>
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className="tag live"><span className="dot"></span>AR · 60 FPS</span>
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 10, textAlign: 'right' }}>
          <div className="mono-tight" style={{ color: 'var(--ink-3)' }}>LOCK · 0.984</div>
          <div className="mono-tight" style={{ color: 'var(--ink-4)' }}>ID · M·07·∆</div>
        </div>
      </div>
    </div>
  );
}

function HeroType({ onEnter }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 className="display" style={{
        fontSize: 'clamp(120px, 22vw, 360px)', margin: '0', letterSpacing: '-0.03em',
        textAlign: 'center',
      }}>
        AXIS<br/>
        <span style={{ color: 'var(--ink-3)' }}>PDQ</span>
      </h1>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        maxWidth: 1100, margin: '48px auto 0', width: '100%',
      }}>
        <div style={{ maxWidth: 360 }}>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>
            One day. One building. Three floors and a terrace. Real chips, augmented medals, ranks that travel with you.
          </p>
        </div>
        <button className="btn lg" onClick={onEnter}>ENTER THE RALLY <span className="arr">→</span></button>
      </div>
    </div>
  );
}

window.Landing = Landing;
