import { useCallback, useRef, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import Access from "./components/Access.jsx";
import Accounts from "./components/Accounts.jsx";
import Transfer from "./components/Transfer.jsx";
import Activity from "./components/Activity.jsx";

const load = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
};
const save = (k, v) => {
  try {
    v ? localStorage.setItem(k, v) : localStorage.removeItem(k);
  } catch {
    /* storage unavailable — degrade silently */
  }
};

const VIEWS = [
  { id: "access", label: "Access", Comp: Access },
  { id: "accounts", label: "Accounts", Comp: Accounts },
  { id: "transfer", label: "Transfer", Comp: Transfer },
  { id: "lookup", label: "Activity", Comp: Activity },
];

export default function App() {
  const defaultBase = import.meta.env.VITE_API_BASE ?? "";
  const [apiBase, setApiBaseState] = useState(() => load("ledger.base", defaultBase));
  const [token, setTokenState] = useState(() => load("ledger.token", ""));
  const [view, setView] = useState("access");
  const [busy, setBusy] = useState(false);
  const pending = useRef(0);

  const setApiBase = (v) => {
    setApiBaseState(v);
    save("ledger.base", v);
  };
  const setToken = (v) => {
    setTokenState(v || "");
    save("ledger.token", v || "");
  };

  const api = useCallback(
    async (method, path, body, opts = {}) => {
      const { auth = true, headers = {} } = opts;
      const h = { "Content-Type": "application/json", ...headers };
      if (auth && token) h.Authorization = "Bearer " + token;

      pending.current += 1;
      setBusy(true);
      let res, text;
      try {
        res = await fetch((apiBase || "").replace(/\/+$/, "") + path, {
          method,
          headers: h,
          body: body ? JSON.stringify(body) : undefined,
        });
        text = await res.text();
      } catch (e) {
        throw new Error(
          "Network error \u2014 is the API reachable" +
            (apiBase ? " at " + apiBase : " through the dev proxy") +
            "? " +
            e.message
        );
      } finally {
        pending.current -= 1;
        if (pending.current <= 0) {
          pending.current = 0;
          setBusy(false);
        }
      }

      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      if (!res.ok) {
        const msg =
          data && typeof data === "object"
            ? data.message || data.error || JSON.stringify(data)
            : data || res.statusText;
        throw new Error(`${res.status} \u2014 ${msg}`);
      }
      return data;
    },
    [apiBase, token]
  );

  return (
    <>
      <TopBar apiBase={apiBase} setApiBase={setApiBase} busy={busy} token={token} />
      <div className="shell">
        <nav className="rail">
          <div className="rail-eyebrow">Workspace</div>
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              className={"navbtn" + (view === v.id ? " active" : "")}
              onClick={() => setView(v.id)}
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              {v.label}
            </button>
          ))}
          <div className="rail-foot">
            balances in minor units
            <br />
            amounts as integers
            <br />
            postings always net zero
          </div>
        </nav>
        <main>
          {VIEWS.map(({ id, Comp }) => (
            <section key={id} className={"panel" + (view === id ? " active" : "")}>
              {view === id && <Comp api={api} token={token} setToken={setToken} />}
            </section>
          ))}
        </main>
      </div>
    </>
  );
}
