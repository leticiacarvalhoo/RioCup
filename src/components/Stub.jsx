import { useTranslation } from "react-i18next";

export default function Stub({ titleKey }) {
  const { t } = useTranslation();

  return (
    <section className="page">
      <div className="wrap">
        <h1>{t(titleKey)}</h1>
        <p className="lead">{t("soon")}</p>
      </div>
    </section>
  );
}