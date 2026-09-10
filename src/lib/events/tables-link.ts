interface TablesEvent {
  title: string;
  date: string;
}

const eventDateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function buildEventTablesWhatsAppUrl(tablesUrl: string, event: TablesEvent): string {
  const url = new URL(tablesUrl);
  const date = eventDateFormatter.format(new Date(`${event.date}T12:00:00Z`));

  url.searchParams.set(
    'text',
    `Hola, quisiera recibir información sobre mesas para ${event.title} el ${date}.`,
  );

  return url.toString();
}
