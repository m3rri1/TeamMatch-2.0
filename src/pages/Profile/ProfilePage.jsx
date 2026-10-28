import { ProfileSection } from "../../components/common/ProfileSection";

export default function ProfilePage({
  page,
  setPage,
  setStep,
  profile,
  setIsCreatingProfile,
  calculatedAge,
  featuredPassion,
  requireAuth,
  logout,
  back,
}) {
  return (
    <div className="app">
      <header className="navbar">
        <button className="brand" type="button" onClick={() => setPage("home")}>
          Team<span>Match</span>
        </button>

        <div className="nav-actions">
          <button
            className="nav-link"
            type="button"
            onClick={() => requireAuth("discover")}
          >
            Explore
          </button>

          <button
            className="nav-outline"
            type="button"
            onClick={() => {
              setIsCreatingProfile(false);
              setPage("onboarding");
              setStep(1);
            }}
          >
            Edit profile
          </button>

          <button className="nav-link" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="mobile-nav">
        <button
          type="button"
          className={page === "discover" ? "active" : ""}
          onClick={() => setPage("discover")}
        >
          <span className="chat-nav-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7 4.7-2.3Z" />
            </svg>
          </span>
          Explore
        </button>

        <button
          type="button"
          className={page === "requests" ? "active" : ""}
          onClick={() => setPage("requests")}
        >
          <span>♡</span>
          Requests
        </button>

        <button
          type="button"
          className={page === "chat" ? "active" : ""}
          onClick={() => setPage("chat")}
        >
          <span className="chat-nav-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.7 8.7 0 0 1-4-.98L3 21l1.98-5.5A8.5 8.5 0 1 1 21 11.5Z" />
            </svg>
          </span>
          Chat
        </button>

        <button
          type="button"
          className={page === "profile" ? "active" : ""}
          onClick={() => setPage("profile")}
        >
          <span className="chat-nav-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </span>
          Profile
        </button>
      </nav>

      <main className="profile-page">
<div className="page-topline">
  <a className="mobile-brand" href="/" aria-label="TeamMatch home">
    <img src="/teammatch-logo.png" alt="TeamMatch" />
  </a>

  <span className="page-status">PROFILE SAVED ✓</span>

  <button
    className="mobile-logout"
    type="button"
    onClick={logout}
  >
    Log out
  </button>
</div>

        <div className="profile-intro">
          <div>
            <p className="eyebrow">YOUR PROFILE</p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h1 style={{ marginBottom: "0" }}>
                {profile.firstName || "Your"} {profile.lastName}
              </h1>

              {profile.focusType === "Passionate Interest" &&
                featuredPassion && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "8px 12px",
                      borderRadius: "999px",
                      background: "var(--peach-soft)",
                      border: "1px solid #e6c7bc",
                      color: "var(--peach-dark)",
                      fontSize: "11px",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        opacity: 0.72,
                        fontSize: "9px",
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                      }}
                    >
                      Passionate Interest
                    </span>
                    <strong style={{ fontSize: "12px" }}>
                      {featuredPassion}
                    </strong>
                  </span>
                )}
            </div>

            <p className="profile-meta">
              {profile.professionalRole || "Student"} ·{" "}
              {profile.location || "India"}
              {calculatedAge ? ` · ${calculatedAge} years old` : ""}
            </p>
          </div>

          <div className="profile-intro-actions">
            <button
              className="button button-dark"
              type="button"
              onClick={() => requireAuth("discover")}
            >
              Find teammates <span>→</span>
            </button>

            <button
              className="button button-light"
              type="button"
              onClick={() => {
                setIsCreatingProfile(false);
                setPage("onboarding");
                setStep(1);
              }}
            >
              Edit profile
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "28px" }} />

        <div className="profile-layout">
          <div className="profile-card">
            {profile.photos.length > 0 ? (
              <img
                className="profile-photo"
                src={profile.photos[0].url}
                alt="Profile"
              />
            ) : (
              <div className="big-avatar">{profile.firstName?.[0] || "Y"}</div>
            )}

            <div className="profile-card-copy">
              <h2>
                {profile.firstName || "Your"} {profile.lastName}
              </h2>

              <p>{profile.about || "Tell people a little about yourself."}</p>
            </div>

            <ProfileSection title="Background">
              <div className="profile-detail-grid">
                <div>
                  <span>Role</span>
                  <strong>{profile.professionalRole || "Not added"}</strong>
                </div>

                <div>
                  <span>Area</span>
                  <strong>{profile.industry || "Not added"}</strong>
                </div>

                <div>
                  <span>Education</span>
                  <strong>{profile.education || "Not added"}</strong>
                </div>
              </div>
            </ProfileSection>

            {profile.prompts?.filter(
              (prompt) => prompt?.question && prompt?.answer
            ).length > 0 && (
              <ProfileSection title="My prompts">
                <div className="profile-prompts">
                  {profile.prompts
                    .filter((prompt) => prompt?.question && prompt?.answer)
                    .map((prompt, index) => (
                      <div
                        className="profile-prompt-card"
                        key={`${prompt.question}-${index}`}
                      >
                        <span className="prompt-question">
                          {prompt.question}
                        </span>
                        <p>{prompt.answer}</p>
                      </div>
                    ))}
                </div>
              </ProfileSection>
            )}

            <ProfileSection title="Skills">
              <div className="tags">
                {[
                  ...profile.subskills,
                  ...(profile.otherSkill ? [profile.otherSkill] : []),
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Interests">
              <div className="tags">
                {[
                  ...profile.interests.filter((item) => item !== "Other"),
                  ...(profile.otherInterest ? [profile.otherInterest] : []),
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </ProfileSection>

            {profile.focusType &&
              profile.focusType !== "Passionate Interest" && (
                <ProfileSection title={profile.focusType}>
                  <p>{profile.focusDescription}</p>
                </ProfileSection>
              )}

            {profile.focusType === "Passionate Interest" &&
              profile.focusDescription && (
                <ProfileSection title="About this interest">
                  <p>{profile.focusDescription}</p>
                </ProfileSection>
              )}

            {profile.partnershipGender && (
              <ProfileSection title="Connection preference">
                <p className="looking-highlight">{profile.partnershipGender}</p>
              </ProfileSection>
            )}
          </div>

          <aside className="profile-sidecard">
            <span className="mini-label">MATCHING PROFILE</span>

            <h3>Ready to find your next collaborator?</h3>

            <p>
              Your profile is ready to discover people with complementary
              strengths.
            </p>

            <button
              className="button button-dark button-wide"
              type="button"
              onClick={() => requireAuth("discover")}
            >
              Explore teammates <span>→</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
