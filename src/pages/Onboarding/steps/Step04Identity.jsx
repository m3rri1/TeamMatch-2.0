import { ChoiceGrid } from "../../../components/common/ChoiceGrid";
import { Screen } from "../../../components/common/Screen";

export default function Step04Identity({ profile, update }) {
  return (
    <Screen
      kicker="04 · ABOUT YOU"
      title="How do you identify?"
      subtitle="Choose the option that feels most comfortable for you."
    >
      <ChoiceGrid
        items={["Woman", "Man", "Non-binary", "Other"]}
        value={profile.gender}
        onChange={(item) => update("gender", item)}
      />
    </Screen>
  );
}
