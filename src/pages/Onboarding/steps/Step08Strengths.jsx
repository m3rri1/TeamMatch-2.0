import { Field } from "../../../components/common/Field";
import { Screen } from "../../../components/common/Screen";
import { skillData } from "../../../data/skills";

export default function Step08Strengths({
  openSkillCategory,
  setOpenSkillCategory,
  showOtherSkills,
  setShowOtherSkills,
  profile,
  update,
  toggleArray,
}) {
  return (
    <Screen
      kicker="08 · STRENGTHS"
      title="What are your skills?"
      subtitle="Choose a category first. You’ll only see its specific skills when you open it."
    >
      {(() => {
        const mainSkillCategories = [
          "Technology",
          "Business",
          "Finance",
          "Design",
          "Fashion & Beauty",
          "Media & Content",
          "Healthcare",
          "Science & Research",
        ];

        const otherSkillCategories = [
          "Engineering",
          "Education",
          "Law & Policy",
          "Architecture & Real Estate",
          "Food & Hospitality",
          "Agriculture & Environment",
          "Arts & Culture",
          "Sports & Wellness",
        ];

        const renderCategory = (category) => {
          const selected = profile.skills.includes(category);
          const open = openSkillCategory === category;

          return (
            <div
              key={category}
              className={
                selected ? "skill-category selected" : "skill-category"
              }
            >
              <button
                type="button"
                className="skill-category-header"
                onClick={() => {
                  toggleArray("skills", category);
                  setOpenSkillCategory(open ? null : category);
                }}
              >
                <span>{category}</span>
                <span className="skill-category-check">
                  {selected ? "✓" : "+"}
                </span>
              </button>

              {selected && open && (
                <div className="skill-options">
                  {skillData[category].map((subskill) => (
                    <button
                      type="button"
                      key={subskill}
                      className={
                        profile.subskills.includes(subskill)
                          ? "subskill active"
                          : "subskill"
                      }
                      onClick={() => toggleArray("subskills", subskill)}
                    >
                      {subskill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="skill-area-selector">
            <div className="skill-category-grid">
              {mainSkillCategories.map(renderCategory)}
            </div>

            <button
              type="button"
              className={
                "skill-other-toggle" + (showOtherSkills ? " active" : "")
              }
              onClick={() => {
                setShowOtherSkills(!showOtherSkills);
                setOpenSkillCategory(null);
              }}
            >
              <span>
                <strong>Other</strong>
                <small>Explore more fields</small>
              </span>
              <span className="other-toggle-icon">
                {showOtherSkills ? "−" : "+"}
              </span>
            </button>

            {showOtherSkills && (
              <div className="other-skill-panel">
                <div className="other-panel-heading">
                  <div>
                    <strong>More areas</strong>
                    <span>Choose from these additional fields.</span>
                  </div>
                </div>

                <div className="skill-category-grid">
                  {otherSkillCategories.map(renderCategory)}
                </div>
              </div>
            )}

            {profile.skills.includes("Other") && (
              <div className="other-custom-box">
                <Field label="Add a skill not listed above">
                  <input
                    placeholder="e.g. Jewellery design, event planning, dance..."
                    value={profile.otherSkill}
                    onChange={(e) => update("otherSkill", e.target.value)}
                  />
                </Field>
              </div>
            )}

            <button
              type="button"
              className={
                profile.skills.includes("Other")
                  ? "custom-skill-trigger active"
                  : "custom-skill-trigger"
              }
              onClick={() => {
                toggleArray("skills", "Other");
                setShowOtherSkills(true);
              }}
            >
              <span>Can’t find your skill?</span>
              <strong>Add your own →</strong>
            </button>

            {(profile.subskills.length > 0 ||
              profile.otherSkill.trim() !== "") && (
              <div className="selected-skills-summary">
                <div>
                  <strong>
                    {profile.subskills.length +
                      (profile.otherSkill.trim() ? 1 : 0)}{" "}
                    skills selected
                  </strong>
                  <span>You can change these anytime.</span>
                </div>

                <div className="selected-skill-tags">
                  {profile.subskills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}

                  {profile.otherSkill.trim() && (
                    <span>{profile.otherSkill}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </Screen>
  );
}
