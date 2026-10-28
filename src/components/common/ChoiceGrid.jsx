import { Choice } from "./Choice";

export function ChoiceGrid({ items, value, onChange }) {
  return (
    <div className="choice-grid">
      {items.map((item) => (
        <Choice
          key={item}
          selected={value === item}
          onClick={() => onChange(item)}
        >
          <span>{item}</span>
        </Choice>
      ))}
    </div>
  );
}
