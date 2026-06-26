import { decodeJwt } from "../util.js";

export default function TopBar({ apiBase, setApiBase, busy, token }) {
  const claims = token ? decodeJwt(token) : null;
  const who = token ? claims?.sub || claims?.email || "authenticated" : "no session";

  return (
    <header className="topbar">
      <div className="brand">
        <span className="mark">Ledger</span>
        <span className="tag">double-entry money movement</span>
      </div>
      <div className="topbar-right">
        <div className="base-field">
          <label htmlFor="base">API base</label>
          <input
            id="base"
            value={apiBase}
            spellCheck={false}
            placeholder="(dev proxy)"
            onChange={(e) => setApiBase(e.target.value.trim())}
          />
        </div>
        <div className="session-chip">
          <span className={"dot" + (busy ? " busy" : token ? " live" : "")} />
          <span>{who}</span>
        </div>
      </div>
    </header>
  );
}
