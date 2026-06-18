import { useRef, useState } from 'react';
import { useSilentState, useWatchSilentState } from 'use-silent-state';
import type { SilentState } from 'use-silent-state';

function WatchedDisplay({ silent }: { silent: SilentState<number> }) {
  const renderCount = useRef(0);
  renderCount.current++;
  const value = useWatchSilentState(silent);

  return (
    <div style={{ background: '#f0f4ff', padding: '1rem', borderRadius: '6px' }}>
      <p>
        Watched value: <strong>{value}</strong>
      </p>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>Render count: {renderCount.current}</p>
    </div>
  );
}

export default function App() {
  const [renderCount, setRenderCount] = useState(0);
  const silent = useSilentState(0);

  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '600px' }}>
      <h1>use-silent-state playground</h1>

      <section>
        <h2>Silent state (no re-render)</h2>
        <p>
          Value from get(): <strong>{silent.get()}</strong>
        </p>
        <button onClick={() => silent.set((n) => n + 1)}>increment (+1)</button>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>
          Il valore sopra non si aggiorna — nessun re-render viene triggerato.
        </p>
      </section>

      <hr />

      <section>
        <h2>Force parent re-render</h2>
        <p>Parent render count: {renderCount}</p>
        <button onClick={() => setRenderCount((n) => n + 1)}>force re-render</button>
        <p>
          Value from get() after re-render: <strong>{silent.get()}</strong>
        </p>
      </section>

      <hr />

      <section>
        <h2>useWatchSilentState (re-renders on change)</h2>
        <WatchedDisplay silent={silent} />
        <br />
        <button onClick={() => silent.set((n) => n + 1)}>increment (+1)</button>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>
          Questo componente si ri-renderizza ad ogni modifica tramite la subscription.
        </p>
      </section>
    </div>
  );
}
