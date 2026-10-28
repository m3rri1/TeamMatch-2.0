import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step06Education({ profile, update }) {
  return (
    <Screen
      kicker="06 · EDUCATION"
      title="What's your current education?"
      subtitle="This helps people understand your background at a glance."
    >
      <Field label="Education level">
        <select
          value={profile.education}
          onChange={(e) => update("education", e.target.value)}
        >
          <option value="">Select education level</option>
          <option>Undergraduate</option>
          <option>Graduated</option>
          <option>Post-graduated</option>
          <option>Ongoing Post-graduate</option>
        </select>
      </Field>
    </Screen>
  );
}
