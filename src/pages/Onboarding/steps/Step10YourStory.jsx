import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step10YourStory({ profile, update }) {
  return (
    <Screen
      kicker="10 · YOUR STORY"
      title="Tell us a little about yourself."
      subtitle="A good teammate profile feels human. Keep it clear, short and personal."
    >
      <Field label="About you">
        <textarea
          autoFocus
          rows="7"
          maxLength="300"
          placeholder="I'm a CSE student who enjoys building products, solving problems and learning from people in different fields..."
          value={profile.about}
          onChange={(e) => update("about", e.target.value)}
        />

        <div className="field-footer">
          <span>Minimum 20 characters</span>

          <strong>{profile.about.length}/300</strong>
        </div>
      </Field>
    </Screen>
  );
}
