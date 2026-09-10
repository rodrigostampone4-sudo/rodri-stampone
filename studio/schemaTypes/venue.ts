import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (Rule) => Rule.required().error('El nombre del venue es obligatorio.'),
    }),
    defineField({
      name: 'mapsUrl',
      title: 'Link de Google Maps (opcional)',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] }).error('Ingresá un link completo de Google Maps.'),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'mapsUrl',
    },
  },
});
