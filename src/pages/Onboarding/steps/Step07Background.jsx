import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";
import { skillData } from "../../../data/skills";

export default function Step07Background({ profile, update }) {
  return (
    <Screen
      kicker="07 · BACKGROUND"
      title="Tell us what you do."
      subtitle="Keep it simple. Your skills and interests will give us the rest."
    >
      <Field label="Main industry / area">
        <select
          value={profile.industry}
          onChange={(e) => update("industry", e.target.value)}
        >
          <option value="">Select your main area</option>

          {Object.keys(skillData).map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}

          <option>Other</option>
        </select>
      </Field>

      <div className="professional-fields">
        <Field label="Current role / field">
          <input
            autoFocus
            placeholder="e.g. CSE student, fashion designer, founder..."
            value={profile.professionalRole}
            onChange={(e) => update("professionalRole", e.target.value)}
          />
        </Field>
      </div>
    </Screen>
  );
}
