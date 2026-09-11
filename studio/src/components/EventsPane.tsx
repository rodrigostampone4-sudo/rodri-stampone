import { AddIcon } from '@sanity/icons/Add';
import { EditIcon } from '@sanity/icons/Edit';
import { RefreshIcon } from '@sanity/icons/Refresh';
import { SearchIcon } from '@sanity/icons/Search';
import { Badge, Button, Stack, TextInput } from '@sanity/ui';
import { useMemo, useState } from 'react';
import { IntentButton } from 'sanity';
import type { UserComponent } from 'sanity/desk';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PaneLayout,
  PanelCard,
  SectionTitle,
} from './PaneLayout';
import { EventStatusBadge } from './EventStatusBadge';
import {
  formatEventDate,
  getEventStatus,
  isEventDateInPast,
  isUpcomingEvent,
} from '../lib/event-status';
import { eventsQuery } from '../lib/queries';
import type { EventRecord } from '../lib/types';
import { useSanityQuery } from '../lib/use-sanity-query';

type EventTab = 'upcoming' | 'past' | 'all';

const tabs: Array<{ id: EventTab; label: string }> = [
  { id: 'upcoming', label: 'Próximos' },
  { id: 'past', label: 'Pasados' },
  { id: 'all', label: 'Todos' },
];

function matchesTab(event: EventRecord, tab: EventTab) {
  if (tab === 'all') {
    return true;
  }

  if (tab === 'past') {
    return isEventDateInPast(event.date) || getEventStatus(event) === 'finished';
  }

  return Boolean(event.date) && isUpcomingEvent(event);
}

export const EventsPane: UserComponent = () => {
  const { data, error, loading, refresh } = useSanityQuery<EventRecord[]>(eventsQuery, []);
  const [tab, setTab] = useState<EventTab>('upcoming');
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es-AR');

    return data
      .filter((event) => matchesTab(event, tab))
      .filter((event) => {
        if (!normalizedSearch) {
          return true;
        }

        return [event.title, event.venue].some((value) =>
          value?.toLocaleLowerCase('es-AR').includes(normalizedSearch),
        );
      })
      .sort((left, right) => {
        const direction = tab === 'past' ? -1 : 1;
        return direction * (left.date ?? '').localeCompare(right.date ?? '');
      });
  }, [data, search, tab]);

  const counts = useMemo(
    () =>
      tabs.reduce<Record<EventTab, number>>(
        (result, currentTab) => ({
          ...result,
          [currentTab.id]: data.filter((event) => matchesTab(event, currentTab.id)).length,
        }),
        { all: data.length, past: 0, upcoming: 0 },
      ),
    [data],
  );

  return (
    <PaneLayout
      actions={
        <>
          <Button
            aria-label="Actualizar eventos"
            icon={RefreshIcon}
            mode="bleed"
            onClick={refresh}
            text="Actualizar"
          />
          <IntentButton
            icon={AddIcon}
            intent="create"
            params={{ type: 'event' }}
            text="Nuevo evento"
            tone="primary"
          />
        </>
      }
      description="Administrá las fechas que aparecen en la landing."
      title="Eventos"
    >
      <PanelCard>
        <Stack gap={4}>
          <div className="rs-tabs" aria-label="Filtrar eventos" role="group">
            {tabs.map((currentTab) => (
              <button
                aria-pressed={tab === currentTab.id}
                className="rs-tab"
                key={currentTab.id}
                onClick={() => setTab(currentTab.id)}
                type="button"
              >
                {currentTab.label}
                <span className="rs-count">{counts[currentTab.id]}</span>
              </button>
            ))}
          </div>
          <div className="rs-filter-bar">
            <label>
              <span className="rs-search-label">Buscar por título o lugar</span>
              <TextInput
                aria-label="Buscar por título o lugar"
                clearButton
                className="rs-search-input"
                icon={SearchIcon}
                onChange={(event) => setSearch(event.currentTarget.value)}
                onClear={() => setSearch('')}
                placeholder="Ej. Niceto Club"
                value={search}
              />
            </label>
          </div>
        </Stack>
      </PanelCard>

      <section aria-labelledby="rs-events-list-title">
        <SectionTitle>
          <span id="rs-events-list-title">
            {tab === 'upcoming' ? 'Próximos eventos' : tab === 'past' ? 'Eventos pasados' : 'Todos los eventos'}
          </span>
        </SectionTitle>
        <PanelCard>
          {loading && data.length === 0 ? <LoadingState /> : null}
          {error ? <ErrorState message="No pudimos cargar los eventos." onRetry={refresh} /> : null}
          {!loading && !error && filteredEvents.length === 0 ? (
            <EmptyState
              action={
                <IntentButton
                  icon={AddIcon}
                  intent="create"
                  params={{ type: 'event' }}
                  text="Nuevo evento"
                  tone="primary"
                />
              }
            >
              {search ? 'No encontramos eventos con esa búsqueda.' : 'No hay eventos en esta vista.'}
            </EmptyState>
          ) : null}
          <div className="rs-event-list">
            {filteredEvents.map((event) => (
              <article className="rs-event-row" key={event._id}>
                <span className="rs-event-row__date">{formatEventDate(event.date)}</span>
                <div className="rs-event-row__main">
                  <span className="rs-event-row__title">{event.title || 'Evento sin título'}</span>
                  <span className="rs-event-row__meta">{event.venue || 'Lugar pendiente'}</span>
                </div>
                <div className="rs-event-row__actions rs-event-row__status">
                  <EventStatusBadge status={getEventStatus(event)} />
                  {event.featured ? (
                    <Badge tone="primary">
                      Destacado
                    </Badge>
                  ) : null}
                </div>
                <div className="rs-event-row__actions">
                  <IntentButton
                    icon={EditIcon}
                    intent="edit"
                    mode="ghost"
                    params={{ id: event._id, type: 'event' }}
                    text="Editar evento"
                  />
                </div>
              </article>
            ))}
          </div>
        </PanelCard>
      </section>
    </PaneLayout>
  );
};
