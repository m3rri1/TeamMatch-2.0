import { useEffect, useMemo, useState } from "react";
import { createDemoProfiles } from "../../data/demoProfiles";
import { apiRequest, getAuthToken } from "../../services/api";
import { loadSavedProfiles } from "../../utils/profileStorage";

export default function Discover({
  setPage,
  onBack,
  profile,
  onLogout,
  requestCount = 0,
}) {
  const [filter, setFilter] = useState("All");
  const [focusFilter, setFocusFilter] = useState("All");
  const [interestFilter, setInterestFilter] = useState("All");
  const [profiles, setProfiles] = useState([]);
  const [connected, setConnected] = useState([]);
  const [pending, setPending] = useState([]);
  const [connecting, setConnecting] = useState([]);
  const [passed, setPassed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      try {
        setLoading(true);
        setError("");

        const token = getAuthToken();

        if (!token) {
          const localProfiles = loadSavedProfiles();
          const otherProfiles = localProfiles.filter(
            (item) => item.id !== profile?.id
          );

          if (!cancelled) {
            setProfiles([
              ...otherProfiles.map(mapProfile),
              ...createDemoProfiles().map(mapProfile),
            ]);
          }
          return;
        }

        const [data, connectionData] = await Promise.all([
          apiRequest("/api/profiles"),
          apiRequest("/api/connections"),
        ]);

        if (cancelled) return;

        const connectionList = Array.isArray(connectionData)
          ? connectionData
          : [];

        const myUserId = profile?.userId || profile?.user?.id;

        const connectedProfileIds = [];
        const pendingProfileIds = [];

        for (const connection of connectionList) {
          const otherUserId =
            String(connection.requester) === String(myUserId)
              ? connection.recipient
              : connection.requester;

          if (!otherUserId) continue;

          if (connection.status === "accepted") {
            connectedProfileIds.push(String(otherUserId));
          } else if (connection.status === "pending") {
            pendingProfileIds.push(String(otherUserId));
          }
        }

        const rawProfiles = [
          ...(Array.isArray(data)
            ? data
            : Array.isArray(data.profiles)
              ? data.profiles
              : []),
          ...createDemoProfiles(),
        ];

        const mappedProfiles = rawProfiles
          .filter((item) => {
            const currentId = profile?.id;
            const currentEmail = profile?.email?.toLowerCase();

            return !(
              (currentId &&
                (item._id === currentId || item.id === currentId)) ||
              (currentEmail && item.email?.toLowerCase() === currentEmail)
            );
          })
          .map(mapProfile);

        const connectedIds = new Set(connectedProfileIds);

        const connectedPeople = mappedProfiles.filter((person) =>
          connectedIds.has(String(person.userId))
        );

        setConnected(connectedPeople.map((person) => person.id));

        const pendingIds = new Set(pendingProfileIds);
        const pendingPeople = mappedProfiles.filter((person) =>
          pendingIds.has(String(person.userId))
        );

        setPending(pendingPeople.map((person) => person.id));

        setProfiles(mappedProfiles);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "We couldn't load teammates right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function cleanValues(values = []) {
      return [
        ...new Set(
          values
            .filter(Boolean)
            .map((value) => String(value).trim().toLowerCase())
            .filter(Boolean)
        ),
      ];
    }

    function profileSkills(person) {
      return cleanValues([
        ...(Array.isArray(person?.subskills) ? person.subskills : []),
        ...(Array.isArray(person?.skills) ? person.skills : []),
        person?.otherSkill,
      ]);
    }

    function profileInterests(person) {
      return cleanValues([
        ...(Array.isArray(person?.interests)
          ? person.interests.filter((x) => x !== "Other")
          : []),
        person?.otherInterest,
      ]);
    }

    function textTokens(value) {
      return cleanValues(
        String(value || "")
          .replace(/[^a-zA-Z0-9&+#.-]/g, " ")
          .split(/\s+/)
      ).filter((word) => word.length > 2);
    }

    function calculateMatch(person) {
      const mineSkills = profileSkills(profile);
      const theirSkills = profileSkills(person);
      const mineInterests = profileInterests(profile);
      const theirInterests = profileInterests(person);

      const sharedSkills = theirSkills.filter((skill) =>
        mineSkills.includes(skill)
      );

      const complementarySkills = theirSkills.filter(
        (skill) => !mineSkills.includes(skill)
      );

      const sharedInterests = theirInterests.filter((interest) =>
        mineInterests.includes(interest)
      );

      const sameIndustry =
        Boolean(profile.industry) &&
        Boolean(person.industry) &&
        profile.industry.trim().toLowerCase() ===
          person.industry.trim().toLowerCase();

      const sameLocation =
        Boolean(profile.location) &&
        Boolean(person.location) &&
        profile.location.trim().toLowerCase() ===
          person.location.trim().toLowerCase();

      const sameFocus =
        Boolean(profile.focusType) &&
        Boolean(person.focusType) &&
        profile.focusType === person.focusType;

      const myFocusText = textTokens(
        `${profile.focusType || ""} ${profile.focusDescription || ""}`
      );

      const theirFocusText = textTokens(
        `${person.focusType || ""} ${person.focusDescription || ""}`
      );

      const focusOverlap = theirFocusText.filter((word) =>
        myFocusText.includes(word)
      );

      let score = 35;
      const reasons = [];

      if (sameFocus) score += 15;
      if (sameIndustry) score += 15;
      if (sameLocation) score += 10;

      score += Math.min(sharedSkills.length * 8, 20);
      score += Math.min(complementarySkills.length * 5, 15);
      score += Math.min(sharedInterests.length * 10, 20);
      score += Math.min(focusOverlap.length * 5, 15);

      if (
        profile.focusType === "Investment Interest" &&
        person.focusType === "Startup Interest"
      ) {
        score += 20;
      }

      const roundedScore = Math.min(Math.round(score), 95);

      if (sharedInterests.length > 0) {
        reasons.push(`Shared interest: ${capitalize(sharedInterests[0])}`);
      }

      if (complementarySkills.length > 0) {
        reasons.push(
          `Complementary skills: ${complementarySkills
            .slice(0, 2)
            .map(capitalize)
            .join(" + ")}`
        );
      }

      if (sameIndustry) {
        reasons.push("Same field");
      }

      if (sameLocation) {
        reasons.push("Same location");
      }

      if (
        profile.focusType === "Investment Interest" &&
        person.focusType === "Startup Interest"
      ) {
        reasons.push("Startup + investor fit");
      }

      return {
        score: roundedScore,
        reasons: reasons.slice(0, 3),
      };
    }

    function capitalize(value) {
      return String(value || "").replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
    }

    function mapProfile(item, index = 0) {
      const firstName = item.firstName || item.user?.firstName || "";
      const lastName = item.lastName || item.user?.lastName || "";
      const name = `${firstName} ${lastName}`.trim() || "TeamMatch member";

      const skills = [
        ...(Array.isArray(item.subskills) ? item.subskills : []),
        ...(item.otherSkill ? [item.otherSkill] : []),
      ].filter(Boolean);

      const interests = [
        ...(Array.isArray(item.interests)
          ? item.interests.filter((x) => x !== "Other")
          : []),
        ...(item.otherInterest ? [item.otherInterest] : []),
      ].filter(Boolean);

      const matchData = calculateMatch(item);

      return {
        id: item._id || item.id || `profile-${index}`,
        userId: item.userId || item.user?.id || null,
        name,
        role: item.professionalRole || "TeamMatch member",
        field: item.industry || item.professionalRole || "Other",
        location: item.location || "",
        skills,
        interests,
        looking:
          item.focusDescription || item.focusType || "Open to collaboration",
        focusType: item.focusType || "",
        isDemo: Boolean(item.isDemo),
        match: matchData.score,
        reasons: matchData.reasons,
        initial: firstName?.[0]?.toUpperCase() || name[0]?.toUpperCase() || "T",
        photo:
          Array.isArray(item.photos) && item.photos.length > 0
            ? typeof item.photos[0] === "string"
              ? item.photos[0]
              : item.photos[0]?.url
            : null,
      };
    }

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const fields = useMemo(
    () => ["All", ...new Set(profiles.map((p) => p.field).filter(Boolean))],
    [profiles]
  );

  const focusOptions = [
    "All",
    "Passionate Interest",
    "Startup Interest",
    "Investment Interest",
  ];

  const interestOptions = useMemo(() => {
    const source =
      focusFilter === "All"
        ? profiles
        : profiles.filter((p) => p.focusType === focusFilter);
    return [
      "All",
      ...new Set(source.flatMap((p) => p.interests || []).filter(Boolean)),
    ];
  }, [profiles, focusFilter]);

  const filtered = profiles
    .filter((p) => filter === "All" || p.field === filter)
    .filter((p) => focusFilter === "All" || p.focusType === focusFilter)
    .filter(
      (p) =>
        interestFilter === "All" || (p.interests || []).includes(interestFilter)
    );

  const visiblePeople = filtered
    .filter((p) => !passed.includes(p.id))
    .sort((a, b) => b.match - a.match);

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
            onClick={() => setPage("requests")}
          >
            ♥ Requests
          </button>

          <button
            className="nav-link"
            type="button"
            onClick={() => setPage("chat")}
          >
            Chat
          </button>

          <button
            className="nav-link"
            type="button"
            onClick={() => setPage("profile")}
          >
            Profile
          </button>

          <button
            className="nav-link"
            type="button"
            onClick={() => {
              onLogout();
            }}
          >
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

      <main className="discover-page">
        <div className="page-topline">
           <span className="page-status">DISCOVERY</span>
        </div>

        <p className="eyebrow">FIND YOUR TEAM</p>
        <h1>People worth meeting.</h1>
        <p className="screen-subtitle">
          Explore people whose strengths and goals could complement your own.
        </p>

        {error && (
          <div className="connection-banner" style={{ marginTop: "24px" }}>
            <div>
              <span className="success-dot">!</span>
              <div>
                <strong>Couldn't load teammates</strong>
                <small>{error}</small>
              </div>
            </div>
            <button
              type="button"
              className="button button-light"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        <div className="discover-toolbar">
          <div className="filter-row">
            <strong style={{ width: "100%", fontSize: "12px" }}>Focus</strong>
            {focusOptions.map((item) => (
              <button
                type="button"
                key={item}
                className={focusFilter === item ? "filter active" : "filter"}
                onClick={() => {
                  setFocusFilter(item);
                  setInterestFilter("All");
                  setPassed([]);
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            className="filter-row"
            style={{ marginTop: "10px", alignItems: "center" }}
          >
            <strong style={{ fontSize: "12px" }}>Industry</strong>
            {fields.map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? "filter active" : "filter"}
                onClick={() => {
                  setFilter(item);
                  setPassed([]);
                }}
              >
                {item}
              </button>
            ))}
            <select
              value={interestFilter}
              onChange={(e) => {
                setInterestFilter(e.target.value);
                setPassed([]);
              }}
              style={{
                minWidth: "180px",
                padding: "9px 12px",
                border: "1px solid var(--line)",
                borderRadius: "999px",
                background: "white",
              }}
            >
              {interestOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "Any interest" : item}
                </option>
              ))}
            </select>
          </div>

          <span className="result-count">
            {loading ? "Loading..." : `${visiblePeople.length} profiles`}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="empty-mark">···</span>
            <h2>Finding people for you.</h2>
            <p>Loading profiles from TeamMatch.</p>
          </div>
        ) : (
          <>
            <div className="people-grid">
              {visiblePeople.map((person, index) => (
                <article className="person-card" key={person.id}>
                  <div className="card-head">
                    <span className="match-score">{person.match}% fit</span>
                    <span className="card-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="person-top">
                    {person.photo ? (
                      <img
                        className="avatar"
                        src={person.photo}
                        alt={person.name}
                      />
                    ) : (
                      <div className="avatar">{person.initial}</div>
                    )}
                    <div>
                      <h2>{person.name}</h2>
                      <p>
                        {person.role}
                        {person.field ? ` · ${person.field}` : ""}
                      </p>
                    </div>
                  </div>

                  {person.skills.length > 0 && (
                    <div className="tags">
                      {person.skills.slice(0, 5).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}

                  {person.interests.length > 0 && (
                    <div className="looking">
                      <small>Interested in</small>
                      <strong>
                        {person.interests.slice(0, 2).join(" · ")}
                      </strong>
                    </div>
                  )}

                  {person.prompts?.filter(
                    (prompt) => prompt?.question && prompt?.answer
                  ).length > 0 && (
                    <div className="looking">
                      <small>{person.prompts[0].question}</small>
                      <strong>{person.prompts[0].answer}</strong>
                    </div>
                  )}

                  <div className="looking">
                    <small>Focus</small>
                    <strong>{person.looking}</strong>
                  </div>

                  {person.reasons?.length > 0 && (
                    <div className="match-reasons">
                      <small>Why you match</small>
                      <div className="tags">
                        {person.reasons.map((reason) => (
                          <span key={reason}>{reason}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="card-actions">
                    <button
                      type="button"
                      className="reject"
                      onClick={() =>
                        setPassed((current) => [...current, person.id])
                      }
                    >
                      Pass
                    </button>

                    <button
                      type="button"
                      className="button button-dark card-connect"
                      disabled={
                        person.isDemo ||
                        connected.includes(person.id) ||
                        pending.includes(person.id) ||
                        connecting.includes(person.id)
                      }
                      onClick={async () => {
                        if (
                          connected.includes(person.id) ||
                          pending.includes(person.id)
                        ) {
                          return;
                        }

                        try {
                          setConnecting((current) => [...current, person.id]);

                          await apiRequest("/api/connections", {
                            method: "POST",
                            body: JSON.stringify({
                              profileId: person.id,
                            }),
                          });

                          setPending((current) => [
                            ...new Set([...current, person.id]),
                          ]);
                        } catch (err) {
                          setError(
                            err.message ||
                              "We couldn't send the connection request."
                          );
                        } finally {
                          setConnecting((current) =>
                            current.filter((id) => id !== person.id)
                          );
                        }
                      }}
                    >
                      {person.isDemo
                        ? "Demo profile"
                        : connected.includes(person.id)
                          ? "Connected ✓"
                          : pending.includes(person.id)
                            ? "Request sent"
                            : connecting.includes(person.id)
                              ? "Sending..."
                              : "Connect"}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {connected.length > 0 && (
              <div className="connection-banner">
                <div>
                  <span className="success-dot">✓</span>
                  <div>
                    <strong>Connection request sent</strong>
                    <small>Your next step is a conversation.</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="button button-light"
                  onClick={() => setPage("feedback")}
                >
                  Leave feedback →
                </button>
              </div>
            )}

            {visiblePeople.length === 0 && connected.length === 0 && (
              <div className="empty-state">
                <span className="empty-mark">—</span>
                <h2>No teammates found yet.</h2>
                <p>Create another profile or try a different category.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
