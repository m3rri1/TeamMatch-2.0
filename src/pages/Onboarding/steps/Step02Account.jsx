import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step02Account({ profile, update }) {
  return (
    <Screen
      kicker="02 · ACCOUNT"
      title="What's your email?"
      subtitle="We'll use it to keep your account secure and contact you about connections."
    >
      <Field label="Email address">
        <input
          autoFocus
          type="email"
          placeholder="you@example.com"
          value={profile.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </Field>
    </Screen>
  );
}
