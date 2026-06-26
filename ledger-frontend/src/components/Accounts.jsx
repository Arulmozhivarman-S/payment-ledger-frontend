import { useState } from "react";
import Banner from "./Banner.jsx";
import { fmtMinor, groupInt } from "../util.js";

export default function Accounts({ api }) {
  const [open, setOpen] = useState({ ownerUserId: "", currency: "USD", openingBalanceMinor: "10000" });
  const [getId, setGetId] = useState("");
  const [acc, setAcc] = useState(null);
  const [msg, setMsg] = useState(null);

  const openMinor = parseInt(open.openingBalanceMinor, 10);
  const openHint = Number.isFinite(openMinor)
    ? `= ${groupInt(Math.floor(Math.abs(openMinor) / 100))}.${String(Math.abs(openMinor) % 100).padStart(2, "0")} ${(open.currency || "").toUpperCase()}`
    : "enter an integer of minor units";

  const doOpen = async () => {
    setMsg(null);
    try {
      const a = await api("POST", "/accounts", {
        ownerUserId: parseInt(open.ownerUserId, 10),
        currency: (open.currency || "").toUpperCase(),
        openingBalanceMinor: parseInt(open.openingBalanceMinor, 10),
      });
      setAcc(a);
      setGetId(String(a.id));
      setMsg({ kind: "ok", label: "OK", msg: `Opened account <b>#${a.id}</b> for owner ${a.ownerUserId}.` });
    } catch (e) {
      setMsg({ kind: "err", label: "ERROR", msg: e.message });
    }
  };

  const doGet = async () => {
    setMsg(null);
    if (!getId.trim()) return setMsg({ kind: "err", label: "ERROR", msg: "Enter an account ID to read." });
    try {
      const a = await api("GET", "/accounts/" + encodeURIComponent(getId.trim()));
      setAcc(a);
    } catch (e) {
      setMsg({ kind: "err", label: "ERROR", msg: e.message });
    }
  };

  return (
    <>
      <div className="head">
        <div className="eyebrow">02 &mdash; Accounts</div>
        <h1>Open &amp; inspect</h1>
        <p>
          Open an account with an opening balance in minor units, or read a balance by ID. The
          opening balance is an integer of cents &mdash; 10000 is one hundred whole units.
        </p>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Open account</h2>
          <div className="sub">Owner, currency, opening balance.</div>
          <div className="row">
            <div className="field">
              <label>Owner user ID</label>
              <input className="mono" value={open.ownerUserId} placeholder="1" onChange={(e) => setOpen({ ...open, ownerUserId: e.target.value })} />
            </div>
            <div className="field">
              <label>Currency</label>
              <input className="mono" value={open.currency} maxLength={3} onChange={(e) => setOpen({ ...open, currency: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Opening balance &mdash; minor units</label>
            <input className="mono" value={open.openingBalanceMinor} onChange={(e) => setOpen({ ...open, openingBalanceMinor: e.target.value })} />
            <div className="hint">{openHint}</div>
          </div>
          <div className="actions">
            <button className="act" onClick={doOpen}>Open account</button>
          </div>
        </div>

        <div className="card">
          <h2>Read balance</h2>
          <div className="sub">Look up an account by its ID.</div>
          <div className="field">
            <label>Account ID</label>
            <div className="with-btn">
              <input className="mono" value={getId} placeholder="1" onChange={(e) => setGetId(e.target.value)} />
              <button className="ghost" onClick={doGet}>Read</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 16 }}>Balance readout</h2>
        <Readout acc={acc} />
      </div>

      <Banner state={msg} />
    </>
  );
}

function Readout({ acc }) {
  if (!acc) {
    return (
      <div className="readout empty">
        <div className="figure">No account loaded</div>
      </div>
    );
  }
  const f = fmtMinor(acc.balanceMinor);
  return (
    <div className="readout">
      <div className="meta">
        <span>ACCOUNT #{acc.id}</span>
        <span className="status-pill">{acc.status}</span>
      </div>
      <div className="figure">
        <span className="cur">{acc.currency}</span>
        {f.sign}
        {f.whole}
        <span className="cents">.{f.cents}</span>
      </div>
      <div className="raw">
        {acc.balanceMinor} minor units &middot; owner {acc.ownerUserId}
      </div>
    </div>
  );
}
