import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  const values = t("about.values", { returnObjects: true });

  return (
    <section className="page">
      <div className="wrap">
        <span className="eyebrow dark">{t("about.eyebrow")}</span>
        <h1>{t("about.title")}</h1>
        <p className="lead">{t("about.intro")}</p>

        <div className="prose">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
        </div>

        <div className="values">
          {values.map((v) => (
            <div className="value" key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}