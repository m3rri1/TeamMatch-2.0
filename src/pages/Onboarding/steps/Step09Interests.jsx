import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";

export default function Step09Interests({ profile, update, toggleArray }) {
  return (
    <Screen
      kicker="09 · INTERESTS"
      title="What are you curious about?"
      subtitle="Choose the topics you'd genuinely enjoy exploring, discussing or building around."
    >
      {/* FIRST 8 INTERESTS */}
      <div className="interest-option-grid">
        {[
          "Technology",
          "Healthcare",
          "Finance",
          "Education",
          "AI & ML",
          "Marketing",
          "Design",
          "Entrepreneurship",
        ].map((interest) => (
          <button
            type="button"
            key={interest}
            className={
              profile.interests.includes(interest)
                ? "interest-option selected"
                : "interest-option"
            }
            onClick={() => toggleArray("interests", interest)}
          >
            <span>{interest}</span>

            <span className="interest-check">
              {profile.interests.includes(interest) ? "✓" : ""}
            </span>
          </button>
        ))}
      </div>

      {/* OTHER BUTTON */}
      <button
        type="button"
        className={
          profile.interests.includes("Other")
            ? "other-interest-button active"
            : "other-interest-button"
        }
        onClick={() => toggleArray("interests", "Other")}
      >
        <span>
          <strong>Other</strong>
          <small>See more interests</small>
        </span>

        <span className="other-arrow">
          {profile.interests.includes("Other") ? "⌃" : "⌄"}
        </span>
      </button>

      {/* ADDITIONAL 8 */}
      {profile.interests.includes("Other") && (
        <div className="more-interest-section">
          <div className="more-interest-heading">
            <div>
              <strong>More interests</strong>
              <span>Explore more areas</span>
            </div>
          </div>

          <div className="interest-option-grid">
            {[
              "Fashion",
              "Media & Content",
              "Science & Research",
              "Law & Policy",
              "Food & Hospitality",
              "Sports & Wellness",
              "Arts & Culture",
              "Travel & Lifestyle",
            ].map((interest) => (
              <button
                type="button"
                key={interest}
                className={
                  profile.interests.includes(interest)
                    ? "interest-option selected"
                    : "interest-option"
                }
                onClick={() => toggleArray("interests", interest)}
              >
                <span>{interest}</span>

                <span className="interest-check">
                  {profile.interests.includes(interest) ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>

          {/* CUSTOM OTHER INTEREST */}
          <div className="custom-interest-box">
            <Field label="Can't find your interest? Add your own">
              <input
                placeholder="e.g. Beauty, Gaming, Psychology, Jewellery..."
                value={profile.otherInterest || ""}
                onChange={(e) => update("otherInterest", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {/* SELECTED SUMMARY */}
      {profile.interests.filter((item) => item !== "Other").length > 0 && (
        <div className="selected-interest-summary">
          <strong>
            {profile.interests.filter((item) => item !== "Other").length +
              (profile.otherInterest ? 1 : 0)}{" "}
            interests selected
          </strong>

          <div>
            {profile.interests
              .filter((item) => item !== "Other")
              .map((interest) => (
                <span key={interest}>{interest}</span>
              ))}

            {profile.otherInterest && <span>{profile.otherInterest}</span>}
          </div>
        </div>
      )}
    </Screen>
  );
}
