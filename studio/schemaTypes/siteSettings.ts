import { defineArrayMember, defineField, defineType } from 'sanity';

import { renderPermanentLinkIcon } from '../src/components/PermanentLinkIcon';
import {
  SiteSettingsInput,
  SiteSettingsLinksField,
} from '../src/components/SiteSettingsInput';

const permanentLinkKinds = [
  { title: 'Instagram personal', value: 'profileInstagram' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'WhatsApp', value: 'whatsapp' },
  { title: 'Mesas', value: 'tables' },
  { title: 'Grupo de WhatsApp', value: 'whatsappGroup' },
  { title: 'Otro', value: 'custom' },
];

export default defineType({
  name: 'siteSettings',
  title: 'Configuración del sitio',
  type: 'document',
  components: {
    input: SiteSettingsInput,
  },
  groups: [
    { name: 'profile', title: 'Perfil', default: true },
    { name: 'links', title: 'Links' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      group: 'profile',
      validation: (Rule) => Rule.required().error('El nombre es obligatorio.'),
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Usuario de Instagram',
      type: 'string',
      description: 'Podés ingresarlo con o sin @.',
      group: 'profile',
    }),
    defineField({
      name: 'profileImage',
      title: 'Foto de perfil',
      type: 'image',
      options: { hotspot: true },
      group: 'profile',
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Describí brevemente la imagen para personas que no pueden verla.',
          validation: (Rule) =>
            Rule.required()
              .max(160)
              .warning('Agregá un texto alternativo antes de publicar una imagen nueva.'),
        }),
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
      group: 'profile',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      group: 'links',
      components: {
        field: SiteSettingsLinksField,
      },
      of: [
        defineArrayMember({
          name: 'permanentLink',
          title: 'Link permanente',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Nombre',
              type: 'string',
              validation: (Rule) => Rule.required().error('El nombre del link es obligatorio.'),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required()
                  .uri({ scheme: ['http', 'https'] })
                  .error('Ingresá un link completo (http o https).'),
            }),
            defineField({
              name: 'kind',
              title: 'Tipo',
              type: 'string',
              options: { list: permanentLinkKinds },
              validation: (Rule) => Rule.required().error('Elegí un tipo de link.'),
            }),
            defineField({
              name: 'enabled',
              title: 'Mostrar en la landing',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
              kind: 'kind',
            },
            prepare({ title, subtitle, kind }) {
              return {
                title,
                subtitle,
                media: renderPermanentLinkIcon(kind),
              };
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((links) => {
          if (!Array.isArray(links)) {
            return true;
          }

          const profileLinks = (links as Array<{ kind?: string }>).filter(
            (link) => link?.kind === 'profileInstagram',
          );

          return profileLinks.length <= 1 || 'Solo puede haber un Instagram personal.';
        }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'instagramHandle',
      media: 'profileImage',
    },
  },
});
