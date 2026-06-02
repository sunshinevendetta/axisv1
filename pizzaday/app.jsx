// AXIS RALLY — root app, routing, tweaks
const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "hero": "feed",
  "medal": "chrome",
  "silver": "neutral",
  "type": "wide",
  "scanlines": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateA('landing'); // landing | connect | map | profile
  const [mission, setMission] = useStateA(null);
  const [me, setMe] = useStateA(window.DATA.me);

  // Density class on root
  const densityClass = ({ minimal: 'density-min', regular: 'density-reg', hud: 'density-hud' })[t.density] || 'density-reg';

  // Silver tone CSS vars
  useEffectA(() => {
    const root = document.documentElement;
    const tones = {
      neutral: { ink: '#f5f5f5', silver: '#c8c8c8' },
      warm:    { ink: '#f5f1e8', silver: '#d4cfc4' },
      cold:    { ink: '#eef3f6', silver: '#b8c4cc' },
    };
    const tone = tones[t.silver] || tones.neutral;
    root.style.setProperty('--ink', tone.ink);
    root.style.setProperty('--silver', tone.silver);
  }, [t.silver]);

  // Type pairing
  useEffectA(() => {
    const root = document.documentElement;
    if (t.type === 'wide') {
      root.style.setProperty('--display', '"Big Shoulders Display", sans-serif');
      root.style.setProperty('--display-alt', '"Antonio", sans-serif');
    } else if (t.type === 'mono') {
      root.style.setProperty('--display', '"JetBrains Mono", monospace');
      root.style.setProperty('--display-alt', '"JetBrains Mono", monospace');
    } else if (t.type === 'editorial') {
      root.style.setProperty('--display', '"Bodoni Moda", serif');
      root.style.setProperty('--display-alt', '"Antonio", sans-serif');
    }
  }, [t.type]);

  const handleComplete = (m) => {
    // award XP, add medal
    const typeInfo = window.DATA.missionTypes.find(x => x.id === m.type);
    const newMedal = { id: 'mx-' + Date.now(), type: m.type, label: m.payoff.toUpperCase(), ep: 'EP·07' };
    const updated = {
      ...me,
      xp: Math.min(me.xp + m.xp, me.nextReq),
      medals: [newMedal, ...me.medals],
    };
    setMe(updated);
    setMission(null);
  };

  const screen = ({ landing: 'LANDING', connect: 'BIND', map: 'MAP', profile: 'DOSSIER' })[route];

  return (
    <div className={`app-shell ${densityClass}`} data-screen-label={'00 ' + screen}>
      <BgStage/>
      {t.scanlines && <div className="scanlines"></div>}
      <div className="noise"></div>
      <RegMarks/>

      {/* top nav */}
      <nav className="topnav">
        <button className={route === 'landing' ? 'active' : ''} onClick={() => setRoute('landing')}>
          AXIS · PDQ
        </button>
        <span className="nav-sep"></span>
        <button className={route === 'connect' ? 'active' : ''} onClick={() => setRoute('connect')}>BIND</button>
        <button className={route === 'map' ? 'active' : ''} onClick={() => setRoute('map')}>MAP</button>
        <button className={route === 'profile' ? 'active' : ''} onClick={() => setRoute('profile')}>DOSSIER</button>
      </nav>
      <StatusPill/>

      <div className="content" key={route}>
        {route === 'landing' && (
          <Landing tweaks={t} onEnter={() => setRoute('connect')} setRoute={setRoute}/>
        )}
        {route === 'connect' && (
          <Connect onDone={() => setRoute('map')}/>
        )}
        {route === 'map' && (
          <MissionMap
            me={me}
            medalVariant={t.medal}
            onSelect={(m) => setMission(m)}
            onProfile={() => setRoute('profile')}
          />
        )}
        {route === 'profile' && (
          <Profile
            me={me}
            medalVariant={t.medal}
            onBack={() => setRoute('landing')}
            onMapBack={() => setRoute('map')}
          />
        )}
      </div>

      {mission && (
        <MissionDetail
          mission={mission}
          medalVariant={t.medal}
          onClose={() => setMission(null)}
          onComplete={handleComplete}
        />
      )}

      <HudStrip screen={screen}/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout"/>
        <TweakRadio label="Density" value={t.density}
          options={['minimal', 'regular', 'hud']}
          onChange={(v) => setTweak('density', v)}/>
        <TweakToggle label="Scanlines" value={t.scanlines}
          onChange={(v) => setTweak('scanlines', v)}/>

        <TweakSection label="Hero"/>
        <TweakRadio label="Hero treatment" value={t.hero}
          options={['feed', 'medal', 'type']}
          onChange={(v) => setTweak('hero', v)}/>

        <TweakSection label="Medal"/>
        <TweakRadio label="Medal style" value={t.medal}
          options={['chrome', 'coin', 'foil', 'poly']}
          onChange={(v) => setTweak('medal', v)}/>

        <TweakSection label="Palette"/>
        <TweakRadio label="Silver tone" value={t.silver}
          options={['neutral', 'warm', 'cold']}
          onChange={(v) => setTweak('silver', v)}/>

        <TweakSection label="Typography"/>
        <TweakRadio label="Type pairing" value={t.type}
          options={['wide', 'mono', 'editorial']}
          onChange={(v) => setTweak('type', v)}/>

        <TweakSection label="Demo"/>
        <TweakButton label="Reset operator" onClick={() => setMe(window.DATA.me)}/>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
