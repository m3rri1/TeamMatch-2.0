export function Choice({ children, selected, onClick }) {
  return (
    <button
      type="button"
      className={selected ? "choice selected" : "choice"}
      onClick={onClick}
    >
      {children}

      <span className="choice-check">{selected ? "✓" : ""}</span>
    </button>
  );
}
