import { defineField, defineType } from 'sanity';

import { ProducerPreview } from '../src/components/ProducerPreview';

export default defineType({
  name: 'producer',
  title: 'Productora',
  type: 'document',
  components: {
    preview: ProducerPreview,
  },
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
