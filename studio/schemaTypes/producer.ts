import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'producer',
  title: 'Productora',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (Rule) => Rule.required().error('El nombre de la productora es obligatorio.'),
    }),
    defineField({
      name: 'logo',
      title: 'Logo (opcional)',
      type: 'image',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
    },
  },
});
