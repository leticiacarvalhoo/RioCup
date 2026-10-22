import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const { user, signIn, previewAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/admin" replace />;

  async function submit(event) {
    event.preventDefault();
    const result = await signIn(email, password);
    if (result.error) setError(t(`login.error.${result.error}`));
  }

  return (
    <section className="page">
      <div className="wrap">
        <div className="auth-card">
          <span className="eyebrow dark">{t("login.eyebrow")}</span>
          <h1>{t("login.title")}</h1>
          <p className="lead">{t("login.intro")}</p>

          <form onSubmit={submit}>
            <label className="field">
              <span>{t("login.email")}</span>
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="field">
              <span>{t("login.password")}</span>
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>

            <button className="button button-primary" type="submit">
              {t("login.submit")}
            </button>

            {error && <p className="status error" role="alert">{error}</p>}

            {import.meta.env.DEV && (
              <button type="button" className="button button-outline" onClick={previewAdmin}>
                {t("login.preview")}
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}