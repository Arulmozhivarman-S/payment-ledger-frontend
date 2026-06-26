export default function Banner({ state }) {
  if (!state) return null;
  return (
    <div className={"banner show " + state.kind}>
      <span className="lab">{state.label}</span>
      <span className="msg" dangerouslySetInnerHTML={{ __html: state.msg }} />
    </div>
  );
}
