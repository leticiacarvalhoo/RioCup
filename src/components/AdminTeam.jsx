import { useState } from "react";
import { useTranslation } from "react-i18next";
import usePersistentState from "../hooks/usePersistentState";
import { money } from "../utils/money";

const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

// Os nomes só vêm pré-carregados em desenvolvimento,
// para não irem no código do site publicado.
const initialTeam = import.meta.env.DEV
  ? [
      { id: 1, name: "Letícia", rate: 0 },
      { id: 2, name: "Lyssa", rate: 0 },
      { id: 3, name: "Victtor", rate: 0 },
      { id: 4, name: "Stephanie", rate: 0 },
      { id: 5, name: "Júlia", rate: 0 },
      { id: 6, name: "Helin", rate: 0 },
    ]
  : [];

const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const currentMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
const today = `${currentMonth}-${pad(now.getDate())}`;

export default function AdminTeam() {
  const { t } = useTranslation();
  const [team, setTeam] = usePersistentState("riocup-team", initialTeam);
  const [logs, setLogs] = usePersistentState("riocup-hours", []);
  const [month, setMonth] = useState(currentMonth);
  const [entry, setEntry] = useState({ memberId: "", date: today, hours: "" });
  const [newMember, setNewMember] = useState("");

  const monthLogs = logs
    .filter((l) => l.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));

  const hoursOf = (id) =>
    monthLogs.filter((l) => l.memberId === id).reduce((sum, l) => sum + l.hours, 0);
  const totalHours = team.reduce((sum, m) => sum + hoursOf(m.id), 0);
  const totalPay = team.reduce((sum, m) => sum + hoursOf(m.id) * m.rate, 0);
  const nameOf = (id) => team.find((m) => m.id === id)?.name ?? "?";

  function setRate(id, rate) {
    setTeam((list) => list.map((m) => (m.id === id ? { ...m, rate } : m)));
  }

  function addMember(event) {
    event.preventDefault();
    if (!newMember.trim()) return;
    setTeam((list) => [...list, { id: Date.now(), name: newMember.trim(), rate: 0 }]);
    setNewMember("");
  }

  function removeMember(id) {
    if (!window.confirm(t("admin.confirmRemove"))) return;
    setTeam((list) => list.filter((m) => m.id !== id));
    setLogs((list) => list.filter((l) => l.memberId !== id));
  }

  function addEntry(event) {
    event.preventDefault();
    const memberId = Number(entry.memberId || team[0]?.id);
    const hours = Number(entry.hours);
    if (!memberId || !entry.date || !(hours > 0)) return;
    setLogs((list) => [...list, { id: Date.now(), memberId, date: entry.date, hours }]);
    setEntry({ ...entry, hours: "" });
  }

  function removeEntry(id) {
    setLogs((list) => list.filter((l) => l.id !== id));
  }

  return (
    <div>
      <div className="month-bar">
        <label htmlFor="month">{t("admin.monthLabel")}</label>
        <input
          id="month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value || currentMonth)}
        />
      </div>

      {team.length === 0 ? (
        <p className="empty">{t("admin.noTeam")}</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("admin.employee")}</th>
                <th>{t("admin.hoursCol")}</th>
                <th>{t("admin.rateCol")}</th>
                <th>{t("admin.payCol")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{number.format(hoursOf(m.id))}</td>
                  <td>
                    <input
                      className="num-input"
                      type="number"
                      min="0"
                      step="0.5"
                      value={m.rate}
                      aria-label={t("admin.rateCol")}
                      onChange={(e) => setRate(m.id, Math.max(0, Number(e.target.value)))}
                    />
                  </td>
                  <td>{money(hoursOf(m.id) * m.rate)}</td>
                  <td>
                    <button type="button" className="chip" onClick={() => removeMember(m.id)}>
                      {t("admin.remove")}
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td>{t("admin.totalRow")}</td>
                <td>{number.format(totalHours)}</td>
                <td />
                <td>{money(totalPay)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <h3 className="admin-sub">{t("admin.logTitle")}</h3>
      <form className="inline-form" onSubmit={addEntry}>
        <select
          value={entry.memberId || team[0]?.id || ""}
          onChange={(e) => setEntry({ ...entry, memberId: e.target.value })}
          aria-label={t("admin.employee")}
        >
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={entry.date}
          onChange={(e) => setEntry({ ...entry, date: e.target.value })}
          aria-label={t("admin.dateLabel")}
        />
        <input
          type="number"
          min="0"
          step="0.25"
          value={entry.hours}
          onChange={(e) => setEntry({ ...entry, hours: e.target.value })}
          placeholder={t("admin.hoursPlaceholder")}
          aria-label={t("admin.hoursCol")}
        />
        <button className="button button-primary" type="submit">
          {t("admin.logAdd")}
        </button>
      </form>

      <h3 className="admin-sub">{t("admin.entriesTitle")}</h3>
      {monthLogs.length === 0 ? (
        <p className="empty">{t("admin.noEntries")}</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {monthLogs.map((l) => (
                <tr key={l.id}>
                  <td>{l.date.split("-").reverse().join(".")}</td>
                  <td>{nameOf(l.memberId)}</td>
                  <td>{number.format(l.hours)} h</td>
                  <td>
                    <button type="button" className="chip" onClick={() => removeEntry(l.id)}>
                      {t("admin.remove")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="admin-sub">{t("admin.addMemberTitle")}</h3>
      <form className="inline-form" onSubmit={addMember}>
        <input
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          placeholder={t("admin.memberPlaceholder")}
          aria-label={t("admin.memberPlaceholder")}
        />
        <button className="button button-primary" type="submit">
          {t("admin.add")}
        </button>
      </form>
    </div>
  );
}