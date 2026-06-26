import { useState } from "react";
import Banner from "./Banner.jsx";
import Posting from "./Posting.jsx";
import { genKey, majorToMinor } from "../util.js";

export default function Transfer({ api }) {
  const [form, setForm] = useState({ src: "", dst: "", amount: "", currency: "USD", key: "" });
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState(null);

  const minor = majorToMinor(form.amount);
  const amtHint = Number.isFinite(minor) ? `= ${minor} minor units` : "enter an amount";

  const post = async () => {
    setMsg(null);
    let key = form.key.trim();
    if (!key) {
      key = genKey();
      setForm((f) => ({ ...f, key }));
    }
    try {
      const t = await api(
        "POST",
        "/transfers",
        {
          sourceAccountId: parseInt(form.src, 10),
          destAccountId: parseInt(form.dst, 10),
          amountMinor: majorToMinor(form.amount),
          currency: (form.currency || "").toUpperCase(),
        },
        { headers: { "Idempotency-Key": key } }
      );
      setResult(t);
      setMsg({ kind: "ok", label: "OK", msg: `Transfer <b>${t.status}</b> &mdash; net effect across both legs is zero.` });
    } catch (e) {
      setMsg({ kind: "err", label: "ERROR", msg: e.message });
    }
  };

  return (
    <>
      <div className="head">
        <div className="eyebrow">03 &mdash; Transfer</div>
        <h1>Move money</h1>
        <p>
          One transfer writes one debit and one credit. The idempotency key makes a retry a no-op
          &mdash; send the same key twice and money moves exactly once.
        </p>
      </div>

      <div className="card">
        <div className="row">
          <div className="field">
            <label>Source account</label>
            <input className="mono" value={form.src} placeholder="1" onChange={(e) => setForm({ ...form, src: e.target.value })} />
          </div>
          <div className="field">
            <label>Destination account</label>
            <input className="mono" value={form.dst} placeholder="2" onChange={(e) => setForm({ ...form, dst: e.target.value })} />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>Amount</label>
            <input className="mono" value={form.amount} placeholder="25.00" onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <div className="hint">{amtHint}</div>
          </div>
          <div className="field">
            <label>Currency</label>
            <input className="mono" value={form.currency} maxLength={3} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Idempotency key</label>
          <div className="with-btn">
            <input className="mono" value={form.key} placeholder="order-abc-123" onChange={(e) => setForm({ ...form, key: e.target.value })} />
            <button className="ghost" onClick={() => setForm({ ...form, key: genKey() })}>Generate</button>
          </div>
        </div>
        <div className="actions">
          <button className="act" onClick={post}>Post transfer</button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <Posting t={result} />
        </div>
      )}

      <Banner state={msg} />
    </>
  );
}
