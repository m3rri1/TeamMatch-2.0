import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step05Location({ profile, update }) {
  return (
    <Screen
      kicker="05 · LOCATION"
      title="Where are you based?"
      subtitle="We'll use your city to make nearby connections easier to discover."
    >
      <Field label="Current city">
        <select
          value={profile.location}
          onChange={(e) => update("location", e.target.value)}
        >
          <option value="">Select your city</option>
          <option>Ahmedabad</option>
          <option>Surat</option>
          <option>Mumbai</option>
          <option>Bangalore</option>
          <option>Delhi</option>
          <option>Pune</option>
          <option>Hyderabad</option>
          <option>Other</option>
        </select>
      </Field>
    </Screen>
  );
}
