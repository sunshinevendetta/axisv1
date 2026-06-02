// AXIS RALLY — Profile (rank + medal cabinet)
const { useState: useStatePr } = React;

function Profile({ me, onBack, onMapBack, medalVariant }) {
  const D = window.DATA;
  const [selectedMedal, setSelectedMedal] = useStatePr(null);
  const pct = (me.xp / me.nextReq) * 100;

  return (
    <div className="enter-fade" style={{ padding: '120px var(--pad-x) 80px' }}>
      {/* header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'flex-end', marginBottom: 36, gap: 32 }}>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>STEP 04 / 04 · DOSSIER</div>
          <h1 className="display" style={{ fontSize: 'clamp(56px, 8vw, 120px)', margin: 0, lineHeight: 0.88 }}>
            {me.handle}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn ghost" onClick={onMapBack}>← MISSION MAP</button>
          <button className="btn ghost" onClick={onBack}>EXIT FIELD</button>
        </div>
      </div>

      {/* rank panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
        <Brackets className="glass" style={{ padding: 36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ marginBottom: 10, color: 'var(--ink-3)' }}>CURRENT RANK</div>
              <div className="display" style={{ fontSize: 88, lineHeight: 0.88, marginBottom: 18 }}>
                {me.rank}
              </div>
              <div style={{ marginBottom: 18 }}>
                <EnergyBar value={pct} label={`→ ${me.nextRank}`}/>
              </div>
              <div className="mono" style={{ color: 'var(--ink-3)' }}>
                {me.xp} / {me.nextReq} XP · {me.nextReq - me.xp} TO NEXT
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {D.ranks.map((r, i) => {
                  const earned = r.req <= me.xp;
                  const isCurrent = r.title === me.rank;
                  return (
                    <div key={r.id} style={{
                      display: 'grid', gridTemplateColumns: '32px 1fr auto',
                      alignItems: 'center', gap: 12,
                      padding: '8px 0',
                      borderBottom: i < D.ranks.length - 1 ? '1px dashed var(--line)' : 'none',
                      opacity: earned ? 1 : 0.5,
                    }}>
                      <span className="mono" style={{ color: isCurrent ? 'var(--ink)' : 'var(--ink-4)' }}>
                        0{r.index}
                      </span>
                      <span className="display-alt" style={{
                        fontSize: 16, color: isCurrent ? 'var(--ink)' : earned ? 'var(--ink-2)' : 'var(--ink-4)',
                      }}>{r.title}</span>
                      <span className="mono-tight" style={{ color: 'var(--ink-4)' }}>
                        {earned ? '✓' : `≥${r.req}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Brackets>

        <Brackets className="glass" style={{ padding: 36 }}>
          <div className="mono" style={{ marginBottom: 18, color: 'var(--ink-3)' }}>OPERATOR · DATA</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
            {[
              { k: 'CHIP ID', v: me.chip },
              { k: 'JOINED', v: me.joined },
              { k: 'MEDALS', v: String(me.medals.length).padStart(2,'0') },
              { k: 'EPISODES', v: '03 · ATTENDED' },
              { k: 'CLEARS · 24H', v: '4' },
              { k: 'AVG · RARITY', v: 'RARE' },
            ].map(x => (
              <div key={x.k}>
                <div className="mono-tight" style={{ color: 'var(--ink-4)', marginBottom: 4 }}>{x.k}</div>
                <div className="display-alt" style={{ fontSize: 18 }}>{x.v}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            <div className="mono" style={{ marginBottom: 10, color: 'var(--ink-3)' }}>NEXT MILESTONE</div>
            <div className="display-alt" style={{ fontSize: 16, color: 'var(--ink-2)' }}>
              Clear 6 more quests to unlock <span style={{ color: 'var(--ink)' }}>PIE</span> — hidden quests surface.
            </div>
          </div>
        </Brackets>
      </div>

      {/* medal cabinet */}
      <div style={{ marginTop: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <h2 className="display" style={{ fontSize: 'clamp(48px, 7vw, 92px)', margin: 0, lineHeight: 0.9 }}>
            MEDAL<br/>CABINET
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm">ALL</button>
            <button className="btn sm ghost">PDQ·01</button>
            <button className="btn sm ghost">PDQ·00</button>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {me.medals.map(m => {
            const typeInfo = D.missionTypes.find(t => t.id === m.type);
            return (
              <Brackets key={m.id} className="glass"
                style={{ padding: 18, cursor: 'pointer', transition: 'transform .15s' }}
                onClick={() => setSelectedMedal({ ...m, typeInfo })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span className="mono">{m.ep}</span>
                  <span className="mono" style={{ color: 'var(--ink-4)' }}>{typeInfo?.short}</span>
                </div>
                <div style={{ position: 'relative', aspectRatio: '1', marginBottom: 16 }}>
                  <Medal size="100%" variant={medalVariant} type={typeInfo?.glyph}/>
                </div>
                <div className="display-alt" style={{ fontSize: 14, marginBottom: 4 }}>{m.label}</div>
                <div className="mono-tight" style={{ color: 'var(--ink-4)' }}>BOUND · {me.chip.slice(-5)}</div>
              </Brackets>
            );
          })}

          {/* empty slots */}
          {Array.from({ length: Math.max(0, 8 - me.medals.length) }).map((_, i) => (
            <div key={'slot-'+i} style={{
              padding: 18, border: '1px dashed var(--line-2)', borderRadius: 4,
              aspectRatio: 'auto', minHeight: 220, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: 'var(--ink-5)',
            }}>
              <div className="display-alt" style={{ fontSize: 32, marginBottom: 8 }}>+</div>
              <div className="mono-tight">SLOT EMPTY</div>
            </div>
          ))}
        </div>
      </div>

      {/* medal detail modal */}
      {selectedMedal && (
        <div onClick={() => setSelectedMedal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)', zIndex: 300, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 40,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 720 }}>
            <Brackets className="glass" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 24px', borderBottom: '1px solid var(--line)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span className="mono" style={{ color: 'var(--ink-2)' }}>
                  MEDAL · {selectedMedal.label} · {selectedMedal.ep}
                </span>
                <button onClick={() => setSelectedMedal(null)} style={{
                  background: 'transparent', border: 0, color: 'var(--ink-2)',
                  cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 12,
                }}>CLOSE ✕</button>
              </div>
              <div style={{ padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
                <div style={{ position: 'relative', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Reticle size={300} animated/>
                  <Medal size={240} variant={medalVariant} type={selectedMedal.typeInfo?.glyph}/>
                </div>
                <div>
                  <div className="mono" style={{ marginBottom: 12, color: 'var(--ink-3)' }}>
                    {selectedMedal.typeInfo?.code} · AR · BOUND
                  </div>
                  <div className="display" style={{ fontSize: 40, marginBottom: 16, lineHeight: 0.95 }}>
                    {selectedMedal.label}
                  </div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
                    Earned at {selectedMedal.ep} via {selectedMedal.typeInfo?.name.toLowerCase()}.
                    View in AR by holding your chip-bound device against any flat surface.
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn">VIEW IN AR <span className="arr">→</span></button>
                    <button className="btn ghost">CERTIFICATE</button>
                  </div>
                </div>
              </div>
            </Brackets>
          </div>
        </div>
      )}
    </div>
  );
}

window.Profile = Profile;
