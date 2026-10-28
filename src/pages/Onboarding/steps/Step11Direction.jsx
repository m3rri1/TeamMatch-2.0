import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step11Direction({ profile, update }) {
  return (
    <Screen
      kicker="11 · DIRECTION"
      title="What are you interested in?"
      subtitle="Choose the direction that best describes what you want to explore."
    >
      <div className="focus-grid">
        {[
          [
            "Passionate Interest",
            "A topic, cause or area you genuinely care about.",
          ],
          [
            "Startup Interest",
            "An idea, venture or product you want to explore.",
          ],
          ["Investment Interest", "Ideas or businesses you'd like to support."],
        ].map(([title, desc], index) => (
          <button
            type="button"
            key={title}
            className={
              profile.focusType === title ? "focus-card selected" : "focus-card"
            }
            onClick={() => update("focusType", title)}
          >
            <span className="focus-number">0{index + 1}</span>

            <strong>{title}</strong>

            <small>{desc}</small>
          </button>
        ))}
      </div>

      <Field label="Tell us more">
        <textarea
          rows="6"
          placeholder="I'm especially interested in..."
          value={profile.focusDescription}
          onChange={(e) => update("focusDescription", e.target.value)}
        />

        <div className="field-footer">
          <span>Minimum 15 characters</span>
        </div>
      </Field>
    </Screen>
  );
}
