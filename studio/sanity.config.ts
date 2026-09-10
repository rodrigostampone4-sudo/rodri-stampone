import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { HomeIcon } from '@sanity/icons/Home';
import { LinkIcon } from '@sanity/icons/Link';
import { PinIcon } from '@sanity/icons/Pin';
import { UserIcon } from '@sanity/icons/User';
import { UsersIcon } from '@sanity/icons/Users';
import { schemaTypes } from './schemaTypes';
import { DashboardPane } from './src/components/DashboardPane';
import { EventsPane } from './src/components/EventsPane';
import { FourSideIcon } from './src/components/FourSideIcon';
import { resolveDocumentActions } from './src/lib/document-actions';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID?.trim();
const dataset = process.env.SANITY_STUDIO_DATASET?.trim() || 'production';

export default defineConfig({
  name: 'default',
  title: 'Rodrigo Stampone',
  icon: FourSideIcon,
  // An empty value keeps local schema work/builds possible until the project is
  // connected interactively; no placeholder project ID is invented.
  projectId: projectId ?? '',
  dataset,
  document: {
    actions: (previousActions, context) =>
      resolveDocumentActions(previousActions, context.schemaType),
    comments: {
      enabled: false,
    },
  },
  tasks: {
    enabled: false,
  },
  releases: {
    enabled: false,
  },
  scheduledDrafts: {
    enabled: false,
  },
  plugins: [
    structureTool({
      icon: FourSideIcon,
      name: 'panel',
      structure: (S) => {
        const eventsPane = () =>
          S.component(EventsPane).id('events').title('Eventos');
        const profilePane = () =>
          S.document()
            .id('profile')
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Perfil')
            .views([S.view.form().id('profile').title('Perfil')]);
        const linksPane = () =>
          S.document()
            .id('links')
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Links')
            .views([S.view.form().id('links').title('Links')]);
        const homePane = S.component(DashboardPane)
          .id('home')
          .title('Inicio')
          .child(eventsPane());

        return S.list()
          .title('Panel')
          .items([
            S.listItem()
              .title('Inicio')
              .id('home')
              .icon(HomeIcon)
              .child(homePane),
            S.listItem()
              .title('Eventos')
              .id('events')
              .icon(CalendarIcon)
              .child(eventsPane()),
            S.listItem()
              .title('Venues')
              .id('venues')
              .icon(PinIcon)
              .child(S.documentTypeList('venue').title('Venues')),
            S.listItem()
              .title('Productoras')
              .id('producers')
              .icon(UsersIcon)
              .child(S.documentTypeList('producer').title('Productoras')),
            S.listItem()
              .title('Links')
              .id('links')
              .icon(LinkIcon)
              .child(linksPane()),
            S.listItem()
              .title('Perfil')
              .id('profile')
              .icon(UserIcon)
              .child(profilePane()),
          ]);
      },
      title: 'Panel',
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (previousTemplates) =>
      previousTemplates.filter((template) => template.schemaType !== 'siteSettings'),
  },
});
