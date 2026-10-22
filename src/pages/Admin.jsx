import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import AdminStock from "../components/AdminStock";
import AdminTeam from "../components/AdminTeam";

export default function Admin() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState("stock");

  return (
    <section className="page">
      <div className="wrap">
        <div className="admin-bar">
          <div>
            <h1>{t("admin.title")}</h1>
            <p className="lead">{user.email}</p>
          </div>
          <button className="button button-outline" onClick={signOut}>
            {t("admin.signOut")}
          </button>
        </div>

        <p className="notice">{t("admin.demoNote")}</p>

        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "stock"}
            className={`tab ${tab === "stock" ? "active" : ""}`}
            onClick={() => setTab("stock")}
          >
            {t("admin.stockTitle")}
          </button>
          <button
            role="tab"
            aria-selected={tab === "team"}
            className={`tab ${tab === "team" ? "active" : ""}`}
            onClick={() => setTab("team")}
          >
            {t("admin.teamTitle")}
          </button>
        </div>

        {tab === "stock" ? <AdminStock /> : <AdminTeam />}
      </div>
    </section>
  );
}