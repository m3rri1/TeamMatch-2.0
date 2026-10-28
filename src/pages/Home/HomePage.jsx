export default function HomePage({
  setPage,
  profileSaved,
  requireAuth,
  startProfile,
  logout,
}) {
  return (
    <div className="app home-page">
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

          <button className="nav-outline" type="button" onClick={startProfile}>
            {profileSaved ? "My profile" : "Get started"}
          </button>

          <button className="nav-link" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <nav className="mobile-nav">
        <button type="button" onClick={() => setPage("discover")}>
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

        <button type="button" onClick={() => setPage("requests")}>
          <span>♡</span>
          Requests
        </button>

        <button type="button" onClick={() => setPage("chat")}>
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

        <button type="button" onClick={() => setPage("profile")}>
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

      <nav className="mobile-nav">
        <button type="button" onClick={() => requireAuth("discover")}>
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

        <button type="button" onClick={() => requireAuth("requests")}>
          <span>♡</span>
          Requests
        </button>

        <button type="button" onClick={() => requireAuth("chat")}>
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

        <button type="button" onClick={startProfile}>
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

      <main className="hero">
        <section className="hero-copy">
          <div className="eyebrow-row">
            <span className="eyebrow-dot" />
            <p className="eyebrow">A smarter way to find your people</p>
          </div>

          <h1>
            Build something
            <span> worth building.</span>
          </h1>

          <p className="hero-sub">
            TeamMatch helps students, graduates and aspiring founders find
            teammates who complement their skills, interests and ambitions.
          </p>

          <div className="hero-actions">
            <button
              className="button button-dark"
              type="button"
              onClick={startProfile}
            >
              {profileSaved ? "View my profile" : "Create your profile"}{" "}
              <span>→</span>
            </button>

            <button
              className="button button-light"
              type="button"
              onClick={() => requireAuth("discover")}
            >
              Explore teammates
            </button>
          </div>

          <div className="hero-proof">
            <div className="proof-avatars">
              <span>R</span>
              <span>P</span>
              <span>A</span>
              <span>+</span>
            </div>

            <div>
              <strong>Built for complementary teams</strong>
              <small>Skills • interests • startup goals</small>
            </div>
          </div>
        </section>

        <section className="hero-visual" aria-label="TeamMatch match preview">
          <div className="orbit-card orbit-card-back" />

          <div className="match-card">
            <div className="match-card-head">
              <div>
                <span className="mini-label">Recommended for you</span>
                <strong>94% fit</strong>
              </div>

              <span className="spark">✦</span>
            </div>

            <div className="match-profile">
              <div className="avatar avatar-large">P</div>

              <div>
                <h3>Priya Sharma</h3>
                <p>Medical Student · Healthcare</p>
              </div>
            </div>

            <div className="match-tags">
              <span>Healthcare</span>
              <span>Research</span>
              <span>Leadership</span>
            </div>

            <div className="match-divider" />

            <div className="match-meta">
              <div>
                <span>Looking for</span>
                <strong>Technical Co-founder</strong>
              </div>

              <div className="match-badge">Strong match</div>
            </div>
          </div>

          <div className="floating-note note-top">
            <span>01</span>
            <strong>Skills</strong>
            <small>Complementary</small>
          </div>

          <div className="floating-note note-bottom">
            <span>02</span>
            <strong>Goals</strong>
            <small>Aligned</small>
          </div>
        </section>
      </main>

      <section className="home-strip">
        <div>
          <span>01</span>
          <strong>Tell us what you bring</strong>
          <small>Skills, interests and experience</small>
        </div>

        <div>
          <span>02</span>
          <strong>Discover better matches</strong>
          <small>Meet people with complementary strengths</small>
        </div>

        <div>
          <span>03</span>
          <strong>Build together</strong>
          <small>Connect, meet and create something real</small>
        </div>
      </section>
    </div>
  );
}
