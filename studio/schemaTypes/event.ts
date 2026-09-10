import { defineField, defineType } from 'sanity';

import { ManagedReferenceInput } from '../src/components/ManagedReferenceInput';
import { UppercaseStringInput } from '../src/components/UppercaseStringInput';
import { normalizeArtistName } from '../src/lib/artist-name';

export default defineType({
  name: 'event',
  title: 'Evento',
  type: 'document',
  groups: [
    { name: 'content', title: 'Datos del evento', default: true },
    { name: 'visibility', title: 'Visibilidad' },
    { name: 'advanced', title: 'Opciones avanzadas' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Artista',
      description: 'El nombre se guarda automáticamente en mayúsculas.',
      type: 'string',
      group: 'content',
      components: { input: UppercaseStringInput },
      validation: (Rule) => [
        Rule.required().error('El nombre del artista es obligatorio.'),
        Rule.uppercase().error('El nombre del artista debe estar en mayúsculas.'),
      ],
    }),
    defineField({
      name: 'date',
      title: 'Fecha',
      type: 'date',
      group: 'content',
      validation: (Rule) => Rule.required().error('Elegí una fecha para el evento.'),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      description: 'Elegí uno de la lista administrable de venues.',
      type: 'reference',
      to: [{ type: 'venue' }],
      components: { input: ManagedReferenceInput },
      group: 'content',
      validation: (Rule) => Rule.required().error('El venue es obligatorio.'),
    }),
    defineField({
      name: 'producer',
      title: 'Productora',
      description: 'Elegí una de la lista administrable de productoras.',
      type: 'reference',
      to: [{ type: 'producer' }],
      components: { input: ManagedReferenceInput },
      group: 'content',
      validation: (Rule) => Rule.required().error('La productora es obligatoria.'),
    }),
    defineField({
      name: 'url',
      title: 'Link de entradas',
      type: 'url',
      group: 'content',
      validation: (Rule) =>
        Rule.required()
          .uri({ scheme: ['http', 'https'] })
          .error('Ingresá un link de entradas válido (http o https).'),
    }),
    defineField({
      name: 'visible',
      title: 'Mostrar en la landing',
      type: 'boolean',
      initialValue: true,
      group: 'visibility',
    }),
    defineField({
      name: 'featured',
      title: 'Destacar evento',
      description: 'Los eventos destacados aparecen primero en la landing.',
      type: 'boolean',
      initialValue: false,
      group: 'visibility',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Fecha de expiración personalizada',
      description:
        'Opcional. Si queda vacío, se ocultará automáticamente al día siguiente a las 08:00 (hora de Argentina).',
      type: 'datetime',
      group: 'advanced',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      venue: 'venue.name',
    },
    prepare({ title, date, venue }) {
      const dateLabel = date
        ? new Intl.DateTimeFormat('es-AR', {
            dateStyle: 'medium',
            timeZone: 'America/Argentina/Buenos_Aires',
          }).format(new Date(`${date}T12:00:00Z`))
        : 'Fecha pendiente';

      return {
        title: title ? normalizeArtistName(title) : 'Evento sin artista',
        subtitle: [dateLabel, venue].filter(Boolean).join(' · '),
      };
    },
  },
});
