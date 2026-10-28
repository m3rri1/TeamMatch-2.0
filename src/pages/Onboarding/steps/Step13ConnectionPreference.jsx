import { Choice } from "../../../components/common/Choice";
import { Screen } from "../../../components/common/Screen";

export default function Step13ConnectionPreference({
  profile,
  update,
  skipConnectionPreference,
}) {
  return (
    <Screen
      kicker="13 · CONNECTION PREFERENCE"
      title="Do you have a connection preference?"
      subtitle="Optional. You can choose a preference or skip this step completely."
    >
      <div className="choice-grid">
        {["Women", "Men", "Everyone"].map((item) => (
          <Choice
            key={item}
            selected={profile.partnershipGender === item}
            onClick={() => update("partnershipGender", item)}
          >
            <span>{item}</span>
          </Choice>
        ))}
      </div>

      <div className="skip-area">
        <p>No preference? That is completely fine.</p>

        <button
          type="button"
          className="skip-btn"
          onClick={skipConnectionPreference}
        >
          Skip this step →
        </button>
      </div>
    </Screen>
  );
}
