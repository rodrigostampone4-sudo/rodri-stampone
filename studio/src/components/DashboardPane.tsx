import { createImageUrlBuilder } from '@sanity/image-url';
import { AddIcon } from '@sanity/icons/Add';
import { EditIcon } from '@sanity/icons/Edit';
import { RefreshIcon } from '@sanity/icons/Refresh';
import { Button, Stack, Text } from '@sanity/ui';
import { IntentButton, useClient } from 'sanity';
import { usePaneRouter, type UserComponent } from 'sanity/desk';
import { useMemo } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PaneLayout,
  PanelCard,
  SectionTitle,
} from './PaneLayout';
import { EventStatusBadge } from './EventStatusBadge';
import { getEventStatus, formatEventDate, isUpcomingEvent } from '../lib/event-status';
import { eventsQuery, siteSettingsQuery } from '../lib/queries';
import { SANITY_API_VERSION } from '../lib/sanity-api';
import type { EventRecord, SiteSettingsRecord } from '../lib/types';
import { useSanityQuery } from '../lib/use-sanity-query';

export const DashboardPane: UserComponent = () => {
  const client = useClient({ apiVersion: SANITY_API_VERSION });
  const eventsState = useSanityQuery<EventRecord[]>(eventsQuery, []);
  const settingsState = useSanityQuery<SiteSettingsRecord | null>(siteSettingsQuery, null);
  const { ChildLink } = usePaneRouter();

  const upcomingEvents = eventsState.data
    .filter((event) => Boolean(event.date) && isUpcomingEvent(event))
    .sort((left, right) => (left.date ?? '').localeCompare(right.date ?? ''));
  const activeLinks = settingsState.data?.links?.filter((link) => link.enabled !== false).length ?? 0;
  const profileName = settingsState.data?.name || 'Rodrigo Stampone';
  const profileInitials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const profileImageUrl = useMemo(() => {
    if (!settingsState.data?.profileImage?.asset?._ref) {
      return undefined;
    }

    return createImageUrlBuilder(client)
      .image(settingsState.data.profileImage)
      .width(96)
      .height(96)
      .fit('crop')
      .auto('format')
      .url();
  }, [client, settingsState.data?.profileImage]);

  const refresh = () => {
    eventsState.refresh();
    settingsState.refresh();
  };

  return (
    <PaneLayout
      actions={
        <Button
          aria-label="Actualizar resumen"
          icon={RefreshIcon}
          mode="bleed"
          onClick={refresh}
          text="Actualizar"
        />
      }
      description="Administrá el contenido de tu landing."
      title="Inicio"
    >
      <section aria-labelledby="rs-upcoming-title">
        <div className="rs-events-heading">
          <SectionTitle>
            <span id="rs-upcoming-title">Próximos eventos</span>
          </SectionTitle>
          <div className="rs-events-heading__actions">
            <IntentButton
              icon={AddIcon}
              intent="create"
              params={{ type: 'event' }}
              text="Nuevo evento"
              tone="primary"
            />
            <ChildLink childId="events">
              <span className="rs-text-link">Ver todos</span>
            </ChildLink>
          </div>
        </div>
        <PanelCard>
          {eventsState.loading && eventsState.data.length === 0 ? <LoadingState /> : null}
          {eventsState.error ? (
            <ErrorState message="No pudimos cargar los próximos eventos." onRetry={eventsState.refresh} />
          ) : null}
          {!eventsState.loading && !eventsState.error && upcomingEvents.length === 0 ? (
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
              No hay próximos eventos.
            </EmptyState>
          ) : null}
          <div className="rs-event-list">
            {upcomingEvents.map((event) => (
              <article className="rs-event-row" key={event._id}>
                <span className="rs-event-row__date">{formatEventDate(event.date)}</span>
                <div className="rs-event-row__main">
                  <span className="rs-event-row__title">{event.title || 'Evento sin título'}</span>
                  <span className="rs-event-row__meta">{event.venue || 'Lugar pendiente'}</span>
                </div>
                <EventStatusBadge status={getEventStatus(event)} />
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

      <div className="rs-grid rs-grid--two">
        <PanelCard>
          <Stack gap={3}>
            <SectionTitle>Links</SectionTitle>
            {settingsState.loading && !settingsState.data ? <LoadingState label="Cargando links" /> : null}
            {settingsState.error ? (
              <ErrorState message="No pudimos cargar los links." onRetry={settingsState.refresh} />
            ) : null}
            {!settingsState.loading && !settingsState.error && !settingsState.data ? (
              <EmptyState>La configuración del sitio todavía no está disponible.</EmptyState>
            ) : null}
            {!settingsState.loading && !settingsState.error && settingsState.data ? (
              <div className="rs-summary">
                <div>
                  <Text muted size={1}>
                    Activos en la landing
                  </Text>
                  <span className="rs-summary__value">{activeLinks} activos</span>
                </div>
                <IntentButton
                  intent="edit"
                  mode="ghost"
                  params={{ id: 'siteSettings', type: 'siteSettings' }}
                  text="Administrar"
                />
              </div>
            ) : null}
          </Stack>
        </PanelCard>

        <PanelCard>
          <Stack gap={3}>
            <SectionTitle>Perfil</SectionTitle>
            {settingsState.loading && !settingsState.data ? <LoadingState label="Cargando perfil" /> : null}
            {settingsState.error ? (
              <ErrorState message="No pudimos cargar el perfil." onRetry={settingsState.refresh} />
            ) : null}
            {!settingsState.loading && !settingsState.error && !settingsState.data ? (
              <EmptyState>El perfil todavía no está configurado.</EmptyState>
            ) : null}
            {!settingsState.loading && !settingsState.error && settingsState.data ? (
              <>
                <div className="rs-profile-summary">
                  <div className="rs-avatar">
                    {profileImageUrl ? (
                      <img
                        alt={`Foto de perfil de ${profileName}`}
                        className="rs-avatar__image"
                        height="48"
                        src={profileImageUrl}
                        width="48"
                      />
                    ) : (
                      <span aria-hidden="true">{profileInitials || 'RS'}</span>
                    )}
                  </div>
                  <Stack gap={2}>
                    <span className="rs-profile-summary__name">{profileName}</span>
                    <span className="rs-profile-summary__handle">
                      {settingsState.data.instagramHandle
                        ? `@${settingsState.data.instagramHandle.replace(/^@/, '')}`
                        : 'Instagram pendiente'}
                    </span>
                  </Stack>
                </div>
                <IntentButton
                  intent="edit"
                  mode="ghost"
                  params={{ id: 'siteSettings', type: 'siteSettings' }}
                  text="Editar"
                />
              </>
            ) : null}
          </Stack>
        </PanelCard>
      </div>
    </PaneLayout>
  );
};
