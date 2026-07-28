import QuestionnaireForm from "@/components/QuestionnaireForm";

export default function Page({ searchParams }) {
  const utm = {
    utm_source: searchParams?.utm_source || null,
    utm_medium: searchParams?.utm_medium || null,
    utm_campaign: searchParams?.utm_campaign || null,
    utm_content: searchParams?.utm_content || null,
    utm_term: searchParams?.utm_term || null,
  };

  return <QuestionnaireForm utm={utm} />;
}
