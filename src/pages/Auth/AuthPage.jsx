export default function AuthPage({
  setPage,
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  authLoading,
  handleAuthSubmit,
}) {
  return (
    <div
      className="app centered"
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#faf9f7",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#fff",
          border: "1px solid rgba(31, 29, 26, 0.10)",
          borderRadius: "28px",
          padding: "42px",
          boxShadow: "0 24px 70px rgba(31, 29, 26, 0.10)",
        }}
      >
        <button
          className="brand"
          type="button"
          onClick={() => setPage("home")}
          style={{ marginBottom: "42px" }}
        >
          Team<span>Match</span>
        </button>

        <p className="eyebrow">YOUR TEAMMATCH ACCOUNT</p>
        <h1 style={{ marginBottom: "12px" }}>
          {authMode === "login" ? "Welcome back." : "Create your account."}
        </h1>
        <p className="screen-subtitle" style={{ marginBottom: "30px" }}>
          {authMode === "login"
            ? "Sign in to access your profile and discover teammates."
            : "One account keeps your profile and connections together."}
        </p>

        {authError && (
          <div
            role="alert"
            style={{
              padding: "14px 16px",
              borderRadius: "14px",
              marginBottom: "20px",
              background: "#fff3f0",
              border: "1px solid #f1c8bd",
              color: "#8a3325",
              fontSize: "14px",
            }}
          >
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>
          <div className="field" style={{ marginBottom: "18px" }}>
            <label>Email</label>
            <input
              autoFocus
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
            />
          </div>

          <div className="field" style={{ marginBottom: "24px" }}>
            <label>Password</label>
            <input
              type="password"
              autoComplete={
                authMode === "login" ? "current-password" : "new-password"
              }
              placeholder="At least 6 characters"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
          </div>

          <button
            className="button button-dark button-wide"
            type="submit"
            disabled={authLoading}
          >
            {authLoading
              ? "Please wait…"
              : authMode === "login"
                ? "Sign in"
                : "Create account"}
            {!authLoading && <span>→</span>}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(31, 29, 26, 0.08)",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#777", fontSize: "14px" }}>
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>{" "}
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthError("");
            }}
            style={{
              border: 0,
              background: "transparent",
              padding: 0,
              font: "inherit",
              fontWeight: 700,
              cursor: "pointer",
              color: "#1f1d1a",
            }}
          >
            {authMode === "login" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
