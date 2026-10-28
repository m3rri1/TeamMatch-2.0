import Step01Basics from "./steps/Step01Basics";
import Step02Account from "./steps/Step02Account";
import Step03Birthday from "./steps/Step03Birthday";
import Step04Identity from "./steps/Step04Identity";
import Step05Location from "./steps/Step05Location";
import Step06Education from "./steps/Step06Education";
import Step07Background from "./steps/Step07Background";
import Step08Strengths from "./steps/Step08Strengths";
import Step09Interests from "./steps/Step09Interests";
import Step10YourStory from "./steps/Step10YourStory";
import Step11Direction from "./steps/Step11Direction";
import Step12YourPrompts from "./steps/Step12YourPrompts";
import Step13ConnectionPreference from "./steps/Step13ConnectionPreference";
import Step14ProfilePhoto from "./steps/Step14ProfilePhoto";

export default function OnboardingPage({
  isEditing,
  setPage,
  step,
  openSkillCategory,
  setOpenSkillCategory,
  showOtherSkills,
  setShowOtherSkills,
  profile,
  backendSaving,
  calculatedAge,
  update,
  toggleArray,
  stepComplete,
  next,
  skipConnectionPreference,
  back,
  finishProfile,
}) {
  return (
    <div className="app onboarding-page">
      <div className="onboarding-shell">
        <aside className="onboarding-aside">
          <button
            className="brand brand-aside"
            type="button"
            onClick={() => setPage("home")}
          >
            Team<span>Match</span>
          </button>

          <div className="aside-content">
            <p className="aside-kicker">
              {isEditing ? "EDIT YOUR PROFILE" : "CREATE YOUR PROFILE"}
            </p>

            <h2>Good teams start with knowing what makes you different.</h2>

            <p>
              A few quick questions help us understand your strengths and create
              more useful recommendations.
            </p>
          </div>

          <div className="aside-footer">
            <div className="aside-check">✓</div>

            <div>
              <strong>Your profile stays in your control.</strong>
              <small>You decide what you share.</small>
            </div>
          </div>
        </aside>

        <main className="onboarding-main">
          <div className="onboarding-topbar">
            <button className="back-btn" type="button" onClick={back}>
              ← Back
            </button>

            <div className="step-count">
              <span>Step</span>
              <strong>{String(step).padStart(2, "0")}</strong>
              <span>of 13</span>
            </div>
          </div>

          <div className="progress-track">
            <div style={{ width: `${(step / 13) * 100}%` }} />
          </div>

          <div className="onboarding-content">
            {step === 1 && <Step01Basics profile={profile} update={update} />}
            {step === 2 && <Step02Account profile={profile} update={update} />}
            {step === 3 && (
              <Step03Birthday
                profile={profile}
                calculatedAge={calculatedAge}
                update={update}
              />
            )}
            {step === 4 && <Step04Identity profile={profile} update={update} />}
            {step === 5 && <Step05Location profile={profile} update={update} />}
            {step === 6 && (
              <Step06Education profile={profile} update={update} />
            )}
            {step === 7 && (
              <Step07Background profile={profile} update={update} />
            )}
            {step === 8 && (
              <Step08Strengths
                openSkillCategory={openSkillCategory}
                setOpenSkillCategory={setOpenSkillCategory}
                showOtherSkills={showOtherSkills}
                setShowOtherSkills={setShowOtherSkills}
                profile={profile}
                update={update}
                toggleArray={toggleArray}
              />
            )}
            {step === 9 && (
              <Step09Interests
                profile={profile}
                update={update}
                toggleArray={toggleArray}
              />
            )}
            {step === 10 && (
              <Step10YourStory profile={profile} update={update} />
            )}
            {step === 11 && (
              <Step11Direction profile={profile} update={update} />
            )}
            {step === 12 && (
              <Step12YourPrompts profile={profile} update={update} />
            )}
            {step === 13 && (
              <Step13ConnectionPreference
                profile={profile}
                update={update}
                skipConnectionPreference={skipConnectionPreference}
              />
            )}
            {step === 14 && (
              <Step14ProfilePhoto
                profile={profile}
                update={update}
                finishProfile={finishProfile}
              />
            )}

            <div className="form-actions">
              {step < 14 ? (
                <button
                  className="button button-dark button-wide"
                  type="button"
                  onClick={next}
                  disabled={!stepComplete}
                >
                  Continue <span>→</span>
                </button>
              ) : step === 13 ? (
                <button
                  className="button button-dark button-wide"
                  type="button"
                  onClick={next}
                >
                  Continue <span>→</span>
                </button>
              ) : (
                <button
                  className="button button-dark button-wide"
                  type="button"
                  onClick={finishProfile}
                  disabled={backendSaving}
                >
                  {backendSaving
                    ? "Saving profile…"
                    : isEditing
                      ? "Save changes"
                      : "Create my profile"}{" "}
                  <span>{backendSaving ? "" : "→"}</span>
                </button>
              )}

              {isEditing && step < 14 && (
                <button
                  className="button button-light button-wide"
                  type="button"
                  onClick={finishProfile}
                  disabled={backendSaving}
                >
                  {backendSaving ? "Saving profile…" : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
