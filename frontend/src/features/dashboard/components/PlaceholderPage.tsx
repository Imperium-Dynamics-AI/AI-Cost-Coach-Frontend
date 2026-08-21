type PlaceholderPageProps = {
  title: string;
};

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="app-shell-box rounded-3xl px-6 py-16">
      <p className="text-base font-bold text-[#19226880]">Overview</p>
      <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">{title}</h1>
      <p className="mt-3 text-lg text-purple md:text-xl">
        This screen will load from the API once it is connected.
      </p>
    </section>
  );
}

export function ResourcesPlaceholder() {
  return <PlaceholderPage title="Resources" />;
}

export function OpportunitiesPlaceholder() {
  return <PlaceholderPage title="Opportunities" />;
}

export function PlannerPlaceholder() {
  return <PlaceholderPage title="Planner" />;
}

export function AiCoachPlaceholder() {
  return <PlaceholderPage title="AI Coach" />;
}

export function SettingsPlaceholder() {
  return <PlaceholderPage title="Settings" />;
}
