import {
  ArrowRight,
  BarChart3,
  BookOpen,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

export default function SignInPage({
  authMode,
  setAuthMode,
  signIn,
  demoSignIn,
  demoLoading,
  loginError,
  setLoginError,
  registerName,
  setRegisterName,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  confirmPassword,
  setConfirmPassword,
}) {
  function switchMode() {
    setAuthMode(authMode === "login" ? "register" : "login");
    setLoginError("");
    setLoginPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase">
          <div className="auth-brand-row">
            <img src="/nexacampus.svg" alt="" />
            <span>
              Nexa<span>Campus</span>
              <small>ACADEMIC WORKSPACE</small>
            </span>
          </div>

          <div className="auth-showcase-copy">
            <div className="auth-kicker">
              <Sparkles size={13} /> CAMPUS, IN FOCUS
            </div>
            <h1>
              Make room for <em>what’s next.</em>
            </h1>
            <p>
              Student records, academic pathways, and the people behind every
              milestone—all in one considered workspace.
            </p>
          </div>

          <div className="auth-visual" aria-hidden="true">
            <div className="auth-orbit auth-orbit-one" />
            <div className="auth-orbit auth-orbit-two" />
            <span className="auth-spark auth-spark-one">✳</span>
            <span className="auth-spark auth-spark-two">✦</span>
            <div className="auth-insight-card">
              <div className="auth-insight-top">
                <span>
                  <BarChart3 size={13} /> CAMPUS OVERVIEW
                </span>
                <i />
              </div>
              <strong>Growing together</strong>
              <div className="auth-bars">
                {[35, 52, 43, 72, 57, 87, 68].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="auth-insight-bottom">
                <span>
                  <BookOpen size={12} /> Learning pathways
                </span>
                <b>+18%</b>
              </div>
            </div>
            <div className="auth-orbit-label">PEOPLE · PROGRESS · PURPOSE</div>
          </div>

          <div className="auth-showcase-footer">
            <span>Thoughtfully organized for campus teams</span>
            <span>
              <i /> PRIVATE WORKSPACE
            </span>
          </div>
        </section>

        <section className="auth-form-side">
          <form className="auth-card" onSubmit={signIn}>
            <div className="auth-card-heading">
              <span className="auth-card-eyebrow">
                {authMode === "login"
                  ? "YOUR WORKSPACE AWAITS"
                  : "JOIN YOUR CAMPUS"}
              </span>
              <h2>
                {authMode === "login" ? "Welcome back" : "Create an account"}
              </h2>
              <p>
                {authMode === "login"
                  ? "Sign in to pick up where your campus left off."
                  : "Create a standard account to explore campus records."}
              </p>
            </div>

            {authMode === "register" && (
              <label className="field">
                Full name
                <input
                  autoComplete="name"
                  required
                  minLength="2"
                  maxLength="80"
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  placeholder="Your full name"
                />
              </label>
            )}
            <label className="field">
              Email address
              <input
                type="email"
                autoComplete="username"
                maxLength="254"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="you@university.edu"
              />
            </label>
            <label className="field">
              Password
              <input
                type="password"
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
                required
                minLength="8"
                maxLength="128"
                pattern={
                  authMode === "register"
                    ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,128}"
                    : undefined
                }
                title="Use at least 8 characters, including uppercase, lowercase, and a number."
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder={
                  authMode === "register"
                    ? "At least 8 characters"
                    : "Enter your password"
                }
              />
            </label>
            {authMode === "register" && (
              <label className="field">
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                />
              </label>
            )}

            {loginError && <div className="form-error">{loginError}</div>}
            <button className="primary-button auth-submit" type="submit">
              <LockKeyhole size={15} />
              {authMode === "login"
                ? "Sign in with password"
                : "Create account"}
              <ArrowRight size={15} />
            </button>

            {authMode === "login" && (
              <>
                <div className="auth-divider">
                  <span>OR OPEN A DEMO WORKSPACE</span>
                </div>
                <div className="demo-access-list">
                  <button
                    className="demo-access-card demo-admin"
                    type="button"
                    disabled={Boolean(demoLoading)}
                    onClick={() => demoSignIn("admin")}
                  >
                    <span className="demo-access-icon">
                      <ShieldCheck size={17} />
                    </span>
                    <span className="demo-access-copy">
                      <strong>
                        {demoLoading === "admin"
                          ? "Opening admin workspace…"
                          : "Continue as admin"}
                      </strong>
                      <small>Manage students and curriculum</small>
                    </span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    className="demo-access-card demo-viewer"
                    type="button"
                    disabled={Boolean(demoLoading)}
                    onClick={() => demoSignIn("user")}
                  >
                    <span className="demo-access-icon">
                      <UserRound size={17} />
                    </span>
                    <span className="demo-access-copy">
                      <strong>
                        {demoLoading === "user"
                          ? "Opening viewer workspace…"
                          : "Continue as viewer"}
                      </strong>
                      <small>Explore records with read-only access</small>
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </>
            )}

            <div className="auth-note">
              {authMode === "login"
                ? "New to NexaCampus?"
                : "Already have an account?"}{" "}
              <button
                className="auth-mode-toggle"
                type="button"
                onClick={switchMode}
              >
                {authMode === "login" ? "Create an account" : "Sign in"}
              </button>
            </div>
          </form>
          <div className="auth-privacy-note">
            <i /> Your campus data stays in your workspace.
          </div>
        </section>
      </div>
    </main>
  );
}
