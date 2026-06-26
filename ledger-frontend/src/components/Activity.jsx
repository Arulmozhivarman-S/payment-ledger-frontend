import { useState } from "react";
import Banner from "./Banner.jsx";
import Posting from "./Posting.jsx";

export default function Activity({ api }) {
  const [key, setKey] = useState("");
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchTransfer = async () => {
    setMsg(null);
    if (!key.trim()) return setMsg({ kind: "err", label: "ERROR", msg: "Enter an idempotency key to fetch." });
    try {
      const t = await api("GET", "/transfers/" + encodeURIComponent(key.trim()));
      setResult(t);
    } catch (e) {
      setResult(null);
      setMsg({ kind: "err", label: "ERROR", msg: e.message });
    }
  };

  return (
    <>
      <div className="head">
        <div className="eyebrow">04 &mdash; Activity</div>
        <h1>Replay a posting</h1>
        <p>
          Fetch any transfer by its idempotency key. This is the same read a client uses to confirm
          a retry resolved to a single committed transfer.
        </p>
      </div>

      <div className="card">
        <div className="field">
          <label>Idempotency key</label>
          <div className="with-btn">
            <input className="mono" value={key} placeholder="order-abc-123" onChange={(e) => setKey(e.target.value)} />
            <button className="ghost" onClick={fetchTransfer}>Fetch</button>
          </div>
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
