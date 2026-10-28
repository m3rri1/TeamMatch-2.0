import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step01Basics({ profile, update }) {
  return (
    <Screen
      kicker="01 · BASICS"
      title="What should we call you?"
      subtitle="Use the name you'd like teammates to see."
    >
      <div className="field-grid">
        <Field label="First name">
          <input
            autoFocus
            placeholder="Ayushi"
            value={profile.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </Field>

        <Field label="Last name">
          <input
            placeholder="Savaliya"
            value={profile.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </Field>
      </div>
    </Screen>
  );
}
