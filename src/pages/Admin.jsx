import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

const initialStock = [
  { id: 1, name: "Açaí", qty: 0 },
  { id: 2, name: "Tapioca", qty: 0 },
  { id: 3, name: "Coxinha", qty: 0 },
  { id: 4, name: "Pão de Queijo", qty: 0 },
  { id: 5, name: "Guaraná", qty: 0 },
];

export default function Admin() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [stock, setStock] = useState(initialStock);
  const [team, setTeam] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");

  function changeQty(id, amount) {
    setStock((items) =>
      items.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + amount) } : item
      )
    );
  }

  function addMember(event) {
    event.preventDefault();
    if (!memberName.trim()) return;
    setTeam((members) => [
      ...members,
      { id: Date.now(), name: memberName.trim(), role: memberRole.trim() },
    ]);
    setMemberName("");
    setMemberRole("");
  }

  function removeMember(id) {
    setTeam((members) => members.filter((m) => m.id !== id));
  }

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

        <div className="admin-section">
          <h2>{t("admin.stockTitle")}</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("admin.item")}</th>
                  <th>{t("admin.amount")}</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <div className="stepper">
                        <button type="button" aria-label="−" onClick={() => changeQty(item.id, -1)}>−</button>
                        <output>{item.qty}</output>
                        <button type="button" aria-label="+" onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <h2>{t("admin.teamTitle")}</h2>

          {team.length === 0 ? (
            <p className="empty">{t("admin.teamEmpty")}</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("admin.teamName")}</th>
                    <th>{t("admin.teamRole")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {team.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.role}</td>
                      <td>
                        <button type="button" className="chip" onClick={() => removeMember(m.id)}>
                          {t("admin.remove")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form className="inline-form" onSubmit={addMember}>
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder={t("admin.teamName")}
              aria-label={t("admin.teamName")}
            />
            <input
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              placeholder={t("admin.teamRole")}
              aria-label={t("admin.teamRole")}
            />
            <button className="button button-primary" type="submit">
              {t("admin.teamAdd")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}