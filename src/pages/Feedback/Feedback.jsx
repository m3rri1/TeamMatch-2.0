import { useState } from "react";
import { Field } from "../../components/common/Field";

export default function Feedback({ setPage, onBack }) {
  const [feedbackPerson] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("teammatch_feedback_person") || "null"
      );
    } catch {
      return null;
    }
  });
  const [didMeet, setDidMeet] = useState(null);
  const [ratings, setRatings] = useState({
    communication: 0,
    teamwork: 0,
    leadership: 0,
    confidence: 0,
  });

  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const rate = (key, value) => {
    setRatings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  if (submitted) {
    return (
      <div className="app centered">
        <div className="success-box">
          <div className="success-icon">✓</div>

          <p className="eyebrow">FEEDBACK RECEIVED</p>

          <h1>Thanks for helping TeamMatch grow.</h1>

          <p>
            Your feedback helps improve future connections and the quality of
            the community.
          </p>

          <button
            className="button button-dark"
            type="button"
            onClick={() => setPage("discover")}
          >
            Back to teammates <span>→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="feedback-page">
        <div className="page-topline">
          <button className="back-btn" type="button" onClick={onBack}>
            ← Back
          </button>

          <span className="page-status">POST-MEETING</span>
        </div>

        <p className="eyebrow">AFTER YOUR MEETING</p>

        <h1>How did it feel?</h1>

        <p className="screen-subtitle">
          A few honest ratings help TeamMatch understand what makes a great
          teammate.
        </p>

        <div className="feedback-layout">
          <section className="feedback-card">
            <div className="feedback-person">
              <div className="avatar">{feedbackPerson?.initial || "T"}</div>

              <div>
                <h2>{feedbackPerson?.name || "Your connection"}</h2>
                <p>{feedbackPerson?.role || "TeamMatch connection"}</p>
              </div>
            </div>

            <div
              style={{ padding: "18px 0", borderBottom: "1px solid #ebe9e2" }}
            >
              <strong>Did you meet this person?</strong>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  className={
                    didMeet === true
                      ? "button button-dark"
                      : "button button-light"
                  }
                  onClick={() => setDidMeet(true)}
                >
                  Yes, we met
                </button>
                <button
                  type="button"
                  className={
                    didMeet === false
                      ? "button button-dark"
                      : "button button-light"
                  }
                  onClick={() => setDidMeet(false)}
                >
                  Not yet
                </button>
              </div>
            </div>

            <div className="rating-list">
              {Object.keys(ratings).map((key) => (
                <div className="rating-row" key={key}>
                  <div>
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </strong>

                    <span>Rate this quality</span>
                  </div>

                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={n <= ratings[key] ? "star active" : "star"}
                        onClick={() => rate(key, n)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Field label="Anything you'd like to share?">
              <textarea
                rows="6"
                placeholder="What worked well? What could make the connection better?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </Field>

            <button
              className="button button-dark button-wide submit-btn"
              type="button"
              onClick={() => {
                if (didMeet === null) return;
                setSubmitted(true);
              }}
              disabled={didMeet === null}
            >
              Submit feedback <span>→</span>
            </button>
          </section>

          <aside className="feedback-sidecard">
            <span className="mini-label">WHY IT MATTERS</span>

            <h3>Great teams are built on more than skills.</h3>

            <p>
              Feedback helps surface communication, reliability and
              collaboration — qualities that a profile cannot always show.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
