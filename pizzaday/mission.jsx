// AXIS RALLY — Mission Detail (dossier) + Tap simulation + Claim
const { useState: useStateMD, useEffect: useEffectMD, useRef: useRefMD } = React;

function MissionDetail({ mission, onClose, onComplete, medalVariant }) {
  const D = window.DATA;
  const typeInfo = D.missionTypes.find(t => t.id === mission.type);
  const [phase, setPhase] = useStateMD('brief'); // brief | tap | claiming | done
  const [progress, setProgress] = useStateMD(0);
  const [holdT, setHoldT] = useStateMD(0); // 0..100 how long user has held
  const holdRef = useRefMD(null);
  const claimRef = useRefMD(null);

  // Auto-progress for claiming phase
  useEffectMD(() => {
    if (phase !== 'claiming') return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress(p => {
        const np = p + 4;
        if (np >= 100) {
          clearInterval(id);
          setTimeout(() => setPhase('done'), 250);
          return 100;
        }
        return np;
      });
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  // Tap mechanic — press and hold
  const startHold = () => {
    if (phase !== 'tap') return;
    holdRef.current = setInterval(() => {
      setHoldT(t => {
        const nt = t + 3.5;
        if (nt >= 100) {
          clearInterval(holdRef.current);
          holdRef.current = null;
          setPhase('claiming');
          return 100;
        }
        return nt;
      });
    }, 40);
  };
  const endHold = () => {
    if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null; }
    if (phase === 'tap' && holdT < 100) setHoldT(0);
  };

  useEffectMD(() => () => {
    if (holdRef.current) clearInterval(holdRef.current);
  }, []);

  if (!mission) return null;

  const locked = mission.status === 'locked';
  const subTitle = mission.title.split(' — ')[1] || mission.title;

  return (
    <div className="enter-fade" style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{ width: '100%', maxWidth: 1100, position: 'relative' }}>
        {/* close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: -44, right: 0,
          background: 'transparent', border: '1px solid var(--line-2)',
          color: 'var(--ink-2)', width: 32, height: 32, borderRadius: 2,
          cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 14,
        }}>✕</button>

        {/* dossier */}
        <Brackets className="glass" style={{ padding: 0, overflow: 'hidden' }}>
          {/* header bar */}
          <div style={{
            padding: '16px 28px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', borderBottom: '1px solid var(--line)',
            background: 'rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <span className="mono" style={{ color: 'var(--ink-2)' }}>DOSSIER · {mission.code}</span>
              <span className="mono" style={{ color: 'var(--ink-4)' }}>· PDQ·01 ·</span>
              <span className="mono" style={{ color: 'var(--ink-4)' }}>ZONE {mission.zone}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {phase === 'brief' && <span className="tag live"><span className="dot"></span>READY</span>}
              {phase === 'tap'   && <span className="tag live"><span className="dot"></span>AWAITING TAP</span>}
              {phase === 'claiming' && <span className="tag live"><span className="dot"></span>CLAIMING</span>}
              {phase === 'done'  && <span className="tag live"><span className="dot"></span>CLEARED</span>}
            </div>
          </div>

          {phase === 'brief' && (
            <BriefView mission={mission} typeInfo={typeInfo} subTitle={subTitle}
              locked={locked}
              onStart={() => setPhase('tap')}
              onClose={onClose}/>
          )}

          {phase === 'tap' && (
            <TapView typeInfo={typeInfo} mission={mission}
              holdT={holdT} startHold={startHold} endHold={endHold}
              onBack={() => { setHoldT(0); setPhase('brief'); }}/>
          )}

          {phase === 'claiming' && (
            <ClaimingView progress={progress} mission={mission} typeInfo={typeInfo} medalVariant={medalVariant}/>
          )}

          {phase === 'done' && (
            <DoneView mission={mission} typeInfo={typeInfo} medalVariant={medalVariant}
              onContinue={() => onComplete(mission)}/>
          )}
        </Brackets>
      </div>
    </div>
  );
}

function BriefView({ mission, typeInfo, subTitle, onStart, onClose, locked }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', minHeight: 520 }}>
      <div style={{ padding: 40, borderRight: '1px solid var(--line)' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 18 }}>
          {typeInfo.code} · {typeInfo.name}
        </div>
        <h2 className="display" style={{ fontSize: 72, margin: '0 0 12px', lineHeight: 0.88 }}>
          {mission.title.split(' — ')[0]}
        </h2>
        <div className="display-alt" style={{ fontSize: 28, color: 'var(--ink-3)', marginBottom: 28 }}>
          {subTitle}
        </div>
        <div style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 460, marginBottom: 28 }}>
          {mission.desc}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16,
          padding: '20px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
        }}>
          {[
            { k: 'XP', v: '+' + mission.xp },
            { k: 'TIME', v: mission.time },
            { k: 'RARITY', v: mission.rarity.toUpperCase() },
            { k: 'PAYOFF', v: 'MEDAL' },
          ].map(s => (
            <div key={s.k}>
              <div className="mono-tight" style={{ color: 'var(--ink-4)', marginBottom: 4 }}>{s.k}</div>
              <div className="display-alt" style={{ fontSize: 20 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="mono" style={{ marginBottom: 12, color: 'var(--ink-3)' }}>EXECUTION</div>
          <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none', counterReset: 'step', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {executionSteps(mission.type).map((s, i) => (
              <li key={i} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                color: 'var(--ink-2)', fontSize: 13.5,
              }}>
                <span className="mono" style={{
                  minWidth: 28, color: 'var(--ink-4)', paddingTop: 2,
                }}>0{i+1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button className="btn ghost" onClick={onClose}>BACK</button>
          <button className="btn lg" onClick={onStart} disabled={locked}
            style={{ opacity: locked ? 0.3 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
            {locked ? 'CLASSIFIED' : 'BEGIN MISSION'} {!locked && <span className="arr">→</span>}
          </button>
        </div>
      </div>

      {/* payoff preview */}
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column' }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 18 }}>
          PAYOFF · MEDAL PREVIEW
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Reticle size={300} animated/>
          <Medal size={240} variant="chrome" type={typeInfo.glyph}/>
        </div>
        <div style={{
          marginTop: 24, padding: '16px 20px', border: '1px solid var(--line)', borderRadius: 4,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div className="mono-tight" style={{ color: 'var(--ink-4)', marginBottom: 4 }}>MEDAL · UNCLAIMED</div>
            <div className="display-alt" style={{ fontSize: 16 }}>{mission.payoff}</div>
          </div>
          <div className="mono" style={{ color: 'var(--ink-3)' }}>{mission.rarity.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

function executionSteps(type) {
  switch (type) {
    case 'nfc':    return ['Locate the marked station in the designated zone.', 'Hold the chip within 3 cm of the reader.', 'Wait for the LED to flash white.'];
    case 'social': return ['Open your social client. Public account required.', 'Compose a post including #PIZZADAYQUEST.', 'Show the QR at the door desk for verification.'];
    case 'record': return ['Step into the marked recording booth.', 'Tap the kiosk. Speak for up to 30 seconds.', 'Confirm the take. It will not be played publicly.'];
    case 'chain':  return ['Bring an EVM-compatible wallet on your phone.', 'Scan the booth\'s QR. Sign one free transaction.', 'Return to the door desk to confirm.'];
    case 'debate': return ['Take a numbered seat at the round table.', 'Listen to the moderator open the topic.', 'Speak when called, or hold the silence.'];
    case 'ar':     return ['Point the chip-bound device at the piece.', 'Hold for 8 seconds. Lock-on confirms green.', 'Release. The AR layer is now bound to you.'];
    case 'group':  return ['Gather a party of four holders.', 'All four must tap the same station within 60 seconds.', 'Convergence medal is minted to all four.'];
    case 'hidden': return ['Mission requires ORACLE rank or higher.', 'Coordinates redacted until threshold.', 'You will know when you are ready.'];
    default:       return [];
  }
}

function TapView({ typeInfo, mission, holdT, startHold, endHold, onBack }) {
  const isTap = mission.type === 'nfc' || mission.type === 'group';
  const verb = ({
    nfc: 'PRESS & HOLD TO TAP',
    social: 'PRESS & HOLD TO BROADCAST',
    record: 'PRESS & HOLD TO RECORD',
    chain: 'PRESS & HOLD TO MINT',
    debate: 'PRESS & HOLD TO TAKE SEAT',
    ar: 'PRESS & HOLD TO LOCK',
    group: 'PRESS & HOLD TO RALLY',
    hidden: '—',
  })[mission.type] || 'PRESS & HOLD';

  return (
    <div style={{ minHeight: 520, padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
      <div>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 14 }}>EXECUTING · {typeInfo.code}</div>
        <h2 className="display" style={{ fontSize: 64, margin: '0 0 14px', lineHeight: 0.9 }}>
          {isTap ? 'TAP\nTHE\nCHIP.' : verb.split(' ').slice(2).join(' ') + '.'}
        </h2>
        <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.5, maxWidth: 440 }}>
          {mission.desc}
        </p>
        <div style={{ marginTop: 32 }}>
          <EnergyBar value={holdT} label="HOLD"/>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button className="btn ghost" onClick={onBack}>CANCEL</button>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Reticle size={360} animated/>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
            onTouchStart={startHold} onTouchEnd={endHold}
            style={{
              width: 200, height: 200, borderRadius: '50%', cursor: 'pointer', appearance: 'none',
              background: holdT > 0 ? `conic-gradient(rgba(255,255,255,0.9) ${holdT*3.6}deg, rgba(255,255,255,0.06) 0)` : 'rgba(255,255,255,0.04)',
              border: '1px solid var(--line-3)',
              color: 'var(--ink)', fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              boxShadow: '0 0 40px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18)',
              transition: 'transform .1s', userSelect: 'none',
              transform: holdT > 0 ? 'scale(1.02)' : 'scale(1)',
            }}>
            <span style={{
              display: 'inline-block', padding: '8px 12px', border: '1px solid var(--line-3)',
              borderRadius: 999, background: 'rgba(0,0,0,0.5)',
            }}>{verb}</span>
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
          <span className="mono-tight" style={{ color: 'var(--ink-3)' }}>LOCK · {(holdT/100).toFixed(3)}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
          <span className="mono-tight" style={{ color: 'var(--ink-3)' }}>SIG · {typeInfo.code}</span>
        </div>
      </div>
    </div>
  );
}

function ClaimingView({ progress, mission, typeInfo, medalVariant }) {
  return (
    <div style={{ minHeight: 520, padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
      <div>
        <Glitch trigger={Math.floor(progress / 25)}>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 14 }}>
            CLAIM SEQUENCE · {Math.round(progress)}%
          </div>
          <h2 className="display" style={{ fontSize: 64, margin: '0 0 24px', lineHeight: 0.9 }}>
            {progress < 33 ? 'WRITING\nMEDAL.' :
             progress < 66 ? 'BINDING\nTO CHIP.' :
             progress < 95 ? 'SIGNING\nLEDGER.' : 'READY.'}
          </h2>
        </Glitch>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <EnergyBar value={Math.min(progress*1.2,100)} label="MINT"/>
          <EnergyBar value={Math.min(Math.max(0,progress-20)*1.2,100)} label="BIND"/>
          <EnergyBar value={Math.min(Math.max(0,progress-40)*1.4,100)} label="LOG"/>
        </div>
        <div style={{ marginTop: 28, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em', lineHeight: 1.6 }}>
          0x4f·a2··881e — node ax·mex·01 — signature OK<br/>
          medal #m·07·{Math.floor(progress*7).toString(16)} → operator·x<br/>
          ledger commit pending [{Math.round(progress)}%]
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Reticle size={400} animated/>
        <Medal size={300} variant={medalVariant} type={typeInfo.glyph}/>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <span className="tag live"><span className="dot"></span>MEDAL · WRITING</span>
        </div>
      </div>
    </div>
  );
}

function DoneView({ mission, typeInfo, medalVariant, onContinue }) {
  return (
    <div style={{ minHeight: 520, padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
      <div>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 14 }}>MISSION CLEARED · {mission.code}</div>
        <h2 className="display" style={{ fontSize: 88, margin: '0 0 12px', lineHeight: 0.85 }}>
          MEDAL<br/><span style={{ color: 'var(--ink-3)' }}>EARNED.</span>
        </h2>
        <div className="display-alt" style={{ fontSize: 22, marginBottom: 24 }}>
          {mission.payoff} · {mission.rarity.toUpperCase()}
        </div>

        <div style={{
          padding: '20px 24px', border: '1px solid var(--line)', borderRadius: 4,
          marginBottom: 24,
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12,
        }}>
          {[
            { k: '+ XP', v: '+' + mission.xp },
            { k: 'RANK', v: 'SLICE' },
            { k: 'NEXT', v: 'PIE' },
          ].map(s => (
            <div key={s.k}>
              <div className="mono-tight" style={{ color: 'var(--ink-4)', marginBottom: 4 }}>{s.k}</div>
              <div className="display-alt" style={{ fontSize: 22 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn lg" onClick={onContinue}>CONTINUE <span className="arr">→</span></button>
          <button className="btn ghost lg">SHARE</button>
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Reticle size={420} animated/>
        <Medal size={320} variant={medalVariant} type={typeInfo.glyph}/>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <span className="tag live"><span className="dot"></span>BOUND TO CHIP</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, textAlign: 'right' }}>
          <div className="mono-tight" style={{ color: 'var(--ink-3)' }}>SIG · M·{mission.code.replace('AX·','')}</div>
          <div className="mono-tight" style={{ color: 'var(--ink-4)' }}>FOREVER · YOURS</div>
        </div>
      </div>
    </div>
  );
}

window.MissionDetail = MissionDetail;
