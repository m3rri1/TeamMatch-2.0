import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step03Birthday({ profile, calculatedAge, update }) {
  return (
    <Screen
      kicker="03 · ABOUT YOU"
      title="When were you born?"
      subtitle="Only your age is shown publicly — your exact date stays private."
    >
      <Field label="Date of birth">
        <input
          autoFocus
          className="large-input"
          type="date"
          value={profile.birthday}
          onChange={(e) => update("birthday", e.target.value)}
        />
      </Field>

      {calculatedAge !== "" && (
        <div className="inline-info">
          <span className="info-icon">✓</span>

          <div>
            <strong>Age calculated automatically</strong>
            <span>Your profile will show {calculatedAge} years old.</span>
          </div>
        </div>
      )}
    </Screen>
  );
}
