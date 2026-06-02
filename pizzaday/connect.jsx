// AXIS RALLY — Connect / Onboard
const { useState: useStateC, useEffect: useEffectC } = React;

function Connect({ onDone }) {
  const [step, setStep] = useStateC(0); // 0 scanning, 1 detected, 2 calibrating, 3 ready
  const [progress, setProgress] = useStateC(0);

  useEffectC(() => {
    const id = setInterval(() => {
      setProgress(p => {
        const np = p + 2.5;
        if (np >= 30 && step === 0) setStep(1);
        if (np >= 60 && step === 1) setStep(2);
        if (np >= 100) {
          clearInterval(id);
          setStep(3);
        }
        return Math.min(np, 100);
      });
    }, 90);
    return () => clearInterval(id);
  }, []);

  const stages = [
    { label: 'SCANNING FOR CHIP', sub: 'PRESENT NFC TO READER' },
    { label: 'CHIP DETECTED', sub: 'IDENTIFIER · NFC·#0A·F2·19·8B' },
    { label: 'CALIBRATING', sub: 'BINDING TO OPERATOR PROFILE' },
    { label: 'OPERATOR ONLINE', sub: 'WELCOME · OPERATOR·X' },
  ];
  const s = stages[step];

  return (
    <div className="enter-fade" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px var(--pad-x) 80px',
    }}>
      <div style={{ width: '100%', maxWidth: 920, position: 'relative' }}>
        <div className="eyebrow" style={{ marginBottom: 32, justifyContent: 'center', width: 'fit-content', marginInline: 'auto' }}>
          STEP 01 / 04 · BIND
        </div>

        <h1 className="display" style={{
          fontSize: 'clamp(80px, 12vw, 180px)', textAlign: 'center',
          margin: '0 0 60px', lineHeight: 0.85,
        }}>
          PRESENT<br/><span style={{ color: 'var(--ink-3)' }}>YOUR CHIP.</span>
        </h1>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48,
          alignItems: 'center',
        }}>
          {/* reader visual */}
          <div style={{ position: 'relative', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Reticle size={320} animated label="NFC · 13.56 MHZ"/>
            <div style={{
              position: 'absolute', width: 180, height: 110, borderRadius: 12,
              border: '1px solid var(--line-3)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              boxShadow: '0 8px 32px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.15)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: 14, transition: 'transform .4s',
              transform: step >= 1 ? 'translateY(-4px) rotate(-2deg)' : 'translateY(8px) rotate(2deg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono-tight" style={{ color: 'var(--ink-3)' }}>AXIS·CHIP</span>
                <span style={{
                  width: 18, height: 14, border: '1px solid var(--ink-3)', borderRadius: 2,
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', inset: 2, border: '1px solid var(--ink-4)',
                    borderRadius: 1,
                  }}></span>
                </span>
              </div>
              <div>
                <div className="display-alt" style={{ fontSize: 14, letterSpacing: '0.04em' }}>0A·F2·19·8B</div>
                <div className="mono-tight" style={{ color: 'var(--ink-4)', marginTop: 4 }}>EP·07 · CDMX</div>
              </div>
            </div>

            {step >= 1 && (
              <div className="enter-fade" style={{
                position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
              }}>
                <span className="tag live"><span className="dot"></span>SIGNAL · LOCKED</span>
              </div>
            )}
          </div>

          {/* readout */}
          <Brackets className="glass" style={{ padding: 32 }}>
            <div className="mono" style={{ marginBottom: 14, color: 'var(--ink-3)' }}>
              READOUT · LIVE
            </div>
            <Glitch trigger={step}>
              <div className="display" style={{ fontSize: 44, marginBottom: 8 }}>{s.label}</div>
              <div className="mono" style={{ color: 'var(--ink-2)', marginBottom: 32 }}>{s.sub}</div>
            </Glitch>

            <EnergyBar value={progress} label="BIND"/>

            <div style={{
              marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14,
              borderTop: '1px solid var(--line)', paddingTop: 24,
            }}>
              {[
                { k: 'FIRMWARE', v: 'v2.4.1' },
                { k: 'ENCRYPT', v: 'AES·128' },
                { k: 'BATTERY', v: '—' },
              ].map(x => (
                <div key={x.k}>
                  <div className="mono-tight" style={{ color: 'var(--ink-4)', marginBottom: 4 }}>{x.k}</div>
                  <div className="display-alt" style={{ fontSize: 18 }}>{x.v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <button
                className="btn lg"
                disabled={step < 3}
                onClick={onDone}
                style={{ opacity: step < 3 ? 0.3 : 1, pointerEvents: step < 3 ? 'none' : 'auto' }}
              >
                ENTER MISSION MAP <span className="arr">→</span>
              </button>
            </div>
          </Brackets>
        </div>

        <div className="line-label" style={{ marginTop: 64 }}>
          <span>NO CHIP? VISIT THE DOOR DESK · 5 MIN · FREE</span>
        </div>
      </div>
    </div>
  );
}

window.Connect = Connect;
