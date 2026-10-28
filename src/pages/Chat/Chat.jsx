import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function Chat({
  setPage,
  onBack,
  profile,
  requestCount = 0,
}) {
  const [people, setPeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadChat() {
    try {
      setLoading(true);
      setError("");

      const [connectionData, profileData, meData] = await Promise.all([
        apiRequest("/api/connections"),
        apiRequest("/api/profiles"),
        apiRequest("/api/profiles/me"),
      ]);

      const me = meData?.profile || meData || {};

      const currentUserId =
        me.userId || me.user?.id || profile?.userId || profile?.user?.id;

      if (!currentUserId) {
        throw new Error("Could not identify your account.");
      }

      setMyUserId(String(currentUserId));

      const accepted = (
        Array.isArray(connectionData) ? connectionData : []
      ).filter((c) => c.status === "accepted");

      const allProfiles = Array.isArray(profileData)
        ? profileData
        : Array.isArray(profileData?.profiles)
          ? profileData.profiles
          : [];

      const connectedPeople = accepted
        .map((connection) => {
          const otherUserId =
            String(connection.requester) === String(currentUserId)
              ? connection.recipient
              : connection.requester;

          const person = allProfiles.find(
            (item) => String(item.userId) === String(otherUserId)
          );

          if (!person) return null;

          return {
            userId: String(otherUserId),
            connectionId: connection._id,
            name:
              `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
              "TeamMatch member",
            role: person.professionalRole || person.industry || "",
            photo:
              Array.isArray(person.photos) && person.photos.length
                ? typeof person.photos[0] === "string"
                  ? person.photos[0]
                  : person.photos[0]?.url
                : null,
            initial: (person.firstName || "T").charAt(0).toUpperCase(),
          };
        })
        .filter(Boolean);

      setPeople(connectedPeople);

      // On mobile, show the connections list first. Desktop opens the first chat.
      if (
        !selectedUserId &&
        connectedPeople.length > 0 &&
        !window.matchMedia("(max-width: 760px)").matches
      ) {
        setSelectedUserId(connectedPeople[0].userId);
      }
    } catch (err) {
      setError(err.message || "Could not load your chats.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(userId) {
    if (!userId) return;

    try {
      setError("");

      const data = await apiRequest(`/api/messages/${userId}`);

      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch (err) {
      setError(err.message || "Could not load messages.");
    }
  }

  useEffect(() => {
    loadChat();
  }, []);


useEffect(() => {
  if (!selectedUserId) return;

  let cancelled = false;
  let fetching = false;

  const refreshMessages = async () => {
    if (fetching) return;

    fetching = true;

    try {
      const data = await apiRequest(`/api/messages/${selectedUserId}`);
      const latestMessages = Array.isArray(data)
        ? data
        : data.messages || [];

      if (!cancelled) {
        setMessages(latestMessages);
      }
    } catch (err) {
      if (!cancelled) {
        console.error("Could not refresh messages:", err.message);
      }
    } finally {
      fetching = false;
    }
  };

  // Load immediately, then check for new messages every 3 seconds.
  refreshMessages();

  const intervalId = setInterval(refreshMessages, 3000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}, [selectedUserId]);


  async function sendMessage() {
    const message = draft.trim();

    if (!message || !selectedUserId) return;

    try {
      setError("");

      const data = await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: selectedUserId,
          text: message,
        }),
      });

      const newMessage = data.message || data;

      setMessages((current) => [...current, newMessage]);

      setDraft("");
    } catch (err) {
      setError(err.message || "Could not send message.");
    }
  }

  async function removeConnection() {
    const selected = people.find((person) => person.userId === selectedUserId);

    if (!selected) return;

    const confirmed = window.confirm(
      `Remove ${selected.name} from your connections?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/api/connections/${selected.connectionId}`, {
        method: "DELETE",
      });

      setPeople((current) =>
        current.filter(
          (person) => person.connectionId !== selected.connectionId
        )
      );

      setSelectedUserId(null);
      setMessages([]);
    } catch (err) {
      setError(err.message || "Could not remove connection.");
    }
  }

  const selected = people.find((person) => person.userId === selectedUserId);

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

      <main className={`discover-page chat-page ${selectedUserId ? "is-chat-open" : ""}`}>
        <div className="chat-intro">
        <div className="page-topline">
          <button className="back-btn" type="button" onClick={onBack}>
            ← Back
          </button>

          <span className="page-status">MESSAGES</span>
        </div>

        <p className="eyebrow">YOUR CONVERSATIONS</p>

        <h1>Talk to your people.</h1>

        <p className="screen-subtitle">
          Chat with people you have connected with.
        </p>
        </div>

        {error && (
          <div className="connection-banner" style={{ marginTop: "20px" }}>
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

            <h2>Loading chats.</h2>
          </div>
        ) : people.length === 0 ? (
          <div className="empty-state">
            <span className="empty-mark">♡</span>

            <h2>No conversations yet.</h2>

            <p>You need to accept a connection before you can chat.</p>

            <button
              className="button button-dark"
              type="button"
              onClick={() => setPage("discover")}
            >
              Find teammates →
            </button>
          </div>
        ) : (
          <div className="chat-layout">
            <section
              className={`profile-card chat-people ${
                selectedUserId ? "has-selection" : ""
              }`}
              style={{ padding: "14px" }}
            >
              <div className="chat-list-heading">
                <div>
                  <strong>Connections</strong>
                  <small>{people.length} {people.length === 1 ? "person" : "people"}</small>
                </div>
              </div>

              {people.map((person) => (
                <button
                  key={person.userId}
                  type="button"
                  onClick={() => setSelectedUserId(person.userId)}
                  className={`chat-person-row ${selectedUserId === person.userId ? "selected" : ""}`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "13px",
                    border: 0,
                    borderRadius: "16px",
                    background: selectedUserId === person.userId ? "var(--peach-soft)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {person.photo ? (
                    <img
                      src={person.photo}
                      alt={person.name}
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="avatar">{person.initial}</div>
                  )}

                  <div className="chat-person-details">
                    <strong>{person.name}</strong>

                    <small
                      style={{
                        display: "block",
                        color: "#777",
                        marginTop: "3px",
                      }}
                    >
                      {person.role}
                    </small>
                  </div>
                  <span className="chat-row-chevron" aria-hidden="true">›</span>
                </button>
              ))}
            </section>

            <section
              className={`profile-card chat-conversation ${
                selectedUserId ? "has-selection" : ""
              }`}
              style={{
                minHeight: "520px",
                display: "flex",
                flexDirection: "column",
                padding: "24px",
              }}
            >
              {!selected && (
                <div className="chat-desktop-placeholder">
                  <span>✳</span>
                  <strong>Your conversations</strong>
                  <p>Select a connection to start chatting.</p>
                </div>
              )}
              {selected && (
                <>
                  <div
                    className="chat-conversation-header"
                    style={{
                      paddingBottom: "18px",
                      borderBottom: "1px solid var(--line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "15px",
                    }}
                  >
                    <div className="chat-person-heading">
                      <button
                        className="chat-mobile-back"
                        type="button"
                        onClick={() => setSelectedUserId(null)}
                        aria-label="Back to connections"
                      >
                        ←
                      </button>
                      <div className="chat-person-heading-copy">
                        <strong
                          style={{
                            fontSize: "20px",
                          }}
                        >
                          {selected.name}
                        </strong>

                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {selected.role}
                        </small>
                      </div>
                    </div>

                    <div
                      className="chat-header-actions"
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      <button
                        className="button button-dark"
                        type="button"
                        onClick={() => {
                          localStorage.setItem(
                            "teammatch_feedback_person",
                            JSON.stringify(selected)
                          );
                          setPage("feedback");
                        }}
                      >
                        Give feedback
                      </button>
                      <button
                        className="button button-light"
                        type="button"
                        onClick={removeConnection}
                      >
                        Remove connection
                      </button>
                    </div>
                  </div>

                  <div
                    className="chat-message-list"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "20px 0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {messages.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#888",
                          margin: "auto",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "28px",
                            marginBottom: "8px",
                          }}
                        >
                          💬
                        </div>

                        <strong>Start the conversation</strong>

                        <div
                          style={{
                            marginTop: "5px",
                          }}
                        >
                          Say hello 👋
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine =
                          String(message.sender) === String(myUserId);

                        return (
                          <div
                            key={message._id || message.id}
                            style={{
                              alignSelf: isMine ? "flex-end" : "flex-start",
                              maxWidth: "75%",
                              padding: "11px 15px",
                              borderRadius: "16px",
                              background: isMine ? "#1f1d1a" : "#f1efec",
                              color: isMine ? "#fff" : "#1f1d1a",
                            }}
                          >
                            {message.text}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div
                    className="chat-composer"
                    style={{
                      display: "flex",
                      gap: "10px",
                      paddingTop: "15px",
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendMessage();
                        }
                      }}
                      placeholder="Write a message..."
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    />

                    <button
                      className="button button-dark"
                      type="button"
                      onClick={sendMessage}
                    >
                      Send
                    </button>
                  </div>

                  <small
                    style={{
                      marginTop: "8px",
                      color: "#888",
                    }}
                  >
                    Text chat only. Messages cannot be edited or deleted.
                  </small>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
