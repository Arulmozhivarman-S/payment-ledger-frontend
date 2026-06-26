import { useState } from "react";
import Banner from "./Banner.jsx";
import { decodeJwt, isoTime } from "../util.js";

export default function Access({ api, token, setToken }) {
  const [reg, setReg] = useState({ UserName: "", email: "", Password: "", role: "USER" });
  const [log, setLog] = useState({ email: "", role: "USER", password: "" });
  const [msg, setMsg] = useState(null);

  const claims = token ? decodeJwt(token) : null;

  const register = async () => {
    setMsg(null);
    try {
      const data = await api("POST", "/register", reg, { auth: false });
      if (data?.token) setToken(data.token);
      setMsg({ kind: "ok", label: "OK", msg: "Registered. Token issued and set as the active session." });
    } catch (e) {
      setMsg({ kind: "err", label: "ERROR", msg: e.message });
    }
  };

  const login = async () => {
    setMsg(null);
    try {
      const data = await api("POST", "/login", log, { auth: false });
      const t = data?.token || (typeof data === "string" ? data : "");
      if (!t) throw new Error("No token in response");
      setToken(t);
      setMsg({ kind: "ok", label: "OK", msg: "Signed in. Session is active." });
    } catch (e) {
      setMsg({ kind: "err", label: "ERROR", msg: e.message });
    }
  };

  return (
    <>
      <div className="head">
        <div className="eyebrow">01 &mdash; Access</div>
        <h1>Session &amp; identity</h1>
        <p>
          Register a user or sign in to mint a JWT. The token is attached as a bearer credential on
          every account and transfer request below.
        </p>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Register</h2>
          <div className="sub">Creates a user and returns a token.</div>
          <Field label="Username" value={reg.UserName} onChange={(v) => setReg({ ...reg, UserName: v })} placeholder="arul" />
          <Field label="Email" value={reg.email} onChange={(v) => setReg({ ...reg, email: v })} placeholder="arul@ledger.dev" />
          <Field label="Password" type="password" value={reg.Password} onChange={(v) => setReg({ ...reg, Password: v })} placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"} />
          <Select label="Role" value={reg.role} onChange={(v) => setReg({ ...reg, role: v })} />
          <div className="actions">
            <button className="act" onClick={register}>Register</button>
          </div>
        </div>

        <div className="card">
          <h2>Sign in</h2>
          <div className="sub">Authenticates an existing user.</div>
          <Field label="Email" value={log.email} onChange={(v) => setLog({ ...log, email: v })} placeholder="arul@ledger.dev" />
          <Field label="Password" type="password" value={log.password} onChange={(v) => setLog({ ...log, password: v })} placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"} />
          <Select label="Role" value={log.role} onChange={(v) => setLog({ ...log, role: v })} />
          <div className="actions">
            <button className="act" onClick={login}>Sign in</button>
            <button className="ghost" onClick={() => { setToken(""); setMsg(null); }}>Clear session</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>Active token</h2>
        <div className="sub">Held in this browser session and decoded locally &mdash; never sent anywhere but your API.</div>
        <div className="tokenbox">{token || "No token. Register or sign in to begin."}</div>
        {claims && (
          <div className="claims">
            <dl>
              {Object.entries(claims).map(([k, v]) => (
                <Fragmenty key={k} k={k} v={v} />
              ))}
            </dl>
          </div>
        )}
      </div>

      <Banner state={msg} />

      <div className="note">
        Auth routes default to <b style={{ fontFamily: "var(--mono)" }}>/login</b> and{" "}
        <b style={{ fontFamily: "var(--mono)" }}>/register</b> to match the controller. If the
        security chain permits <b style={{ fontFamily: "var(--mono)" }}>/auth/**</b> instead, set the
        API base accordingly so these stay public.
      </div>
    </>
  );
}

function Fragmenty({ k, v }) {
  const val = (k === "exp" || k === "iat") && typeof v === "number" ? isoTime(v * 1000) : String(v);
  return (
    <>
      <dt>{k}</dt>
      <dd>{val}</dd>
    </>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", mono }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className={mono ? "mono" : ""}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option>USER</option>
        <option>ADMIN</option>
      </select>
    </div>
  );
}
