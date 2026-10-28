import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function Requests({
  setPage,
  onBack,
  profile,
  page,
  requestCount = 0,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const [myProfile, connectionData, profileData] = await Promise.all([
        apiRequest("/api/profiles/me"),
        apiRequest("/api/connections"),
        apiRequest("/api/profiles"),
      ]);

      const currentProfile = myProfile?.profile || myProfile || {};
      const myUserId =
        currentProfile.userId || profile?.userId || profile?.user?.id;

      const connections = Array.isArray(connectionData) ? connectionData : [];

      const allProfiles = Array.isArray(profileData)
        ? profileData
        : Array.isArray(profileData?.profiles)
          ? profileData.profiles
          : [];

      const incoming = connections.filter(
        (connection) =>
          connection.status === "pending" &&
          String(connection.recipient) === String(myUserId)
      );

      const cards = incoming
        .map((connection) => {
          const person = allProfiles.find(
            (item) => String(item.userId) === String(connection.requester)
          );

          if (!person) return null;

          const firstName = person.firstName || "";
          const lastName = person.lastName || "";
          const name = `${firstName} ${lastName}`.trim() || "TeamMatch member";

          const skills = [
            ...(Array.isArray(person.subskills) ? person.subskills : []),
            ...(person.otherSkill ? [person.otherSkill] : []),
          ].filter(Boolean);

          const interests = [
            ...(Array.isArray(person.interests)
              ? person.interests.filter((item) => item !== "Other")
              : []),
            ...(person.otherInterest ? [person.otherInterest] : []),
          ].filter(Boolean);

          const photo =
            Array.isArray(person.photos) && person.photos.length > 0
              ? typeof person.photos[0] === "string"
                ? person.photos[0]
                : person.photos[0]?.url
              : null;

          return {
            connection,
            person,
            name,
            skills,
            interests,
            photo,
            initial:
              firstName?.[0]?.toUpperCase() || name[0]?.toUpperCase() || "T",
          };
        })
        .filter(Boolean);

      setRequests(cards);
    } catch (err) {
      setError(err.message || "We couldn't load your requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function respond(connectionId, status) {
    try {
      setBusyId(connectionId);

      await apiRequest(`/api/connections/${connectionId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setRequests((current) =>
        current.filter(
          (item) => String(item.connection._id) !== String(connectionId)
        )
      );
    } catch (err) {
      setError(err.message || "We couldn't update this request.");
    } finally {
      setBusyId(null);
    }
  }

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
            onClick={() => setPage("discover")}
          >
            Explore
          </button>

          <button
            className="nav-link"
            type="button"
            onClick={() => setPage("profile")}
          >
            Profile
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
  <span className="request-nav-icon">
    ♡
    {requestCount > 0 && (
      <span className="request-badge">
        {requestCount > 9 ? "9+" : requestCount}
      </span>
    )}
  </span>
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
          
          <span className="page-status">CONNECTIONS</span>
        </div>

        <p className="eyebrow">YOUR PEOPLE</p>

        <h1>Connection requests.</h1>

        <p className="screen-subtitle">People who want to connect with you.</p>

        {error && (
          <div className="connection-banner" style={{ marginTop: "24px" }}>
            <div>
              <span className="success-dot">!</span>
              <div>
                <strong>Something went wrong</strong>
                <small>{error}</small>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <span className="empty-mark">···</span>
            <h2>Loading requests.</h2>
            <p>Checking your connection requests.</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-mark">♡</span>
            <h2>No new requests.</h2>
            <p>
              When someone wants to connect with you, their request will appear
              here.
            </p>

            <button
              className="button button-dark"
              type="button"
              onClick={() => setPage("discover")}
            >
              Explore teammates →
            </button>
          </div>
        ) : (
          <div className="people-grid">
            {requests.map(
              ({
                connection,
                person,
                name,
                skills,
                interests,
                photo,
                initial,
              }) => (
                <article className="person-card" key={connection._id}>
                  <div className="card-head">
                    <span className="match-score">NEW REQUEST</span>
                  </div>

                  <div className="person-top">
                    {photo ? (
                      <img className="avatar" src={photo} alt={name} />
                    ) : (
                      <div className="avatar">{initial}</div>
                    )}

                    <div>
                      <h2>{name}</h2>
                      <p>
                        {person.professionalRole || "TeamMatch member"}
                        {person.industry ? ` · ${person.industry}` : ""}
                      </p>
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div className="tags">
                      {skills.slice(0, 5).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}

                  {interests.length > 0 && (
                    <div className="looking">
                      <small>Interested in</small>
                      <strong>{interests.slice(0, 2).join(" · ")}</strong>
                    </div>
                  )}

                  <div className="looking">
                    <small>Focus</small>
                    <strong>
                      {person.focusDescription ||
                        person.focusType ||
                        "Open to collaboration"}
                    </strong>
                  </div>

                  {person.about && (
                    <p className="person-about">{person.about}</p>
                  )}

                  <div className="card-actions">
                    <button
                      type="button"
                      className="reject"
                      disabled={busyId === connection._id}
                      onClick={() => respond(connection._id, "rejected")}
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      className="button button-dark card-connect"
                      disabled={busyId === connection._id}
                      onClick={() => respond(connection._id, "accepted")}
                    >
                      {busyId === connection._id ? "Updating..." : "Accept"}
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
