type HeadlineProps = { title: string; subtitle?: string };
export function Headline({ title, subtitle }: HeadlineProps) {
  return (
    <section className="headline">
      <h1 className="title">{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </section>
  );
}