import { useState } from "react";
import { useSilentState } from "use-silent-state";

export default function App() {
  const [renderCount, setRenderCount] = useState(0);
  const silent = useSilentState(0);

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>use-silent-state playground</h1>

      <section>
        <h2>Silent state (no re-render)</h2>
        <p>Current value: {silent.get()}</p>
        <button onClick={() => silent.set((n) => n + 1)}>
          increment silent (+1)
        </button>
        <p style={{ color: "#888", fontSize: "0.85rem" }}>
          The value above does NOT update live — no re-render is triggered.
        </p>
      </section>

      <hr />

      <section>
        <h2>Force re-render to see the value</h2>
        <p>Render count: {renderCount}</p>
        <button onClick={() => setRenderCount((n) => n + 1)}>
          force re-render
        </button>
        <p>Silent value after re-render: {silent.get()}</p>
      </section>
    </div>
  );
}
