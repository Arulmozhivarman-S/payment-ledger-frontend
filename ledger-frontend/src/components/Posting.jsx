import { fmtMinor, isoTime } from "../util.js";

export default function Posting({ t }) {
  const f = fmtMinor(t.amountMinor);
  const amt = `${t.currency} ${f.whole}.${f.cents}`;
  return (
    <div className="posting">
      <div className="posting-top">
        <span style={{ fontFamily: "var(--display)", fontSize: 14 }}>
          {t.status === "COMPLETED" ? "Posted" : "Rejected"}
        </span>
        <span className="id">{t.transferId || ""}</span>
      </div>
      <div className="legs">
        <div className="leg debit">
          <div className="dir">DEBIT &mdash; money leaves</div>
          <div className="amt">&minus;{amt}</div>
          <div className="who">account #{t.sourceAccountId}</div>
        </div>
        <div className="legline" />
        <div className="leg credit">
          <div className="dir">CREDIT &mdash; money enters</div>
          <div className="amt">+{amt}</div>
          <div className="who">account #{t.destAccountId}</div>
        </div>
      </div>
      <div className="posting-foot">
        <span>key &middot; {t.idempotencyKey}</span>
        <span>{isoTime(t.createdAt)}</span>
      </div>
    </div>
  );
}
