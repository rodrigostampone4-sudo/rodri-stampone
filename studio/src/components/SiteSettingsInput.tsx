import { ArrowTopRightIcon } from '@sanity/icons/ArrowTopRight';
import { Heading, Text } from '@sanity/ui';
import { useEffect } from 'react';
import type { FieldProps, ObjectInputProps } from 'sanity';
import { usePaneRouter } from 'sanity/structure';

import { landingUrl } from '../lib/landing-url';
import './studio.css';

type SettingsSection = 'links' | 'profile';

const sectionConfig: Record<
  SettingsSection,
  { description: string; fieldNames: string[]; note?: string; title: string }
> = {
  links: {
    description:
      'Agregá, editá y ordená los accesos que aparecen en la landing. Para cambiar el orden de presentación, arrastralos.',
    fieldNames: ['links'],
    title: 'Links permanentes',
  },
  profile: {
    description: 'Actualizá la identidad pública que acompaña al contenido de la landing.',
    fieldNames: ['name', 'instagramHandle', 'profileImage', 'bio'],
    note: 'La foto, el nombre, el usuario y la bio se publican juntos cuando confirmás los cambios.',
    title: 'Perfil público',
  },
};

function getSettingsSection(routerPanesState: ReturnType<typeof usePaneRouter>['routerPanesState']) {
  const paneIds = routerPanesState.flatMap((group) => group.map((pane) => pane.id));

  for (let index = paneIds.length - 1; index >= 0; index -= 1) {
    if (paneIds[index] === 'links' || paneIds[index] === 'profile') {
      return paneIds[index] as SettingsSection;
    }
  }

  return undefined;
}

export function SiteSettingsLinksField(props: FieldProps) {
  const { routerPanesState } = usePaneRouter();
  const section = getSettingsSection(routerPanesState);

  return props.renderDefault(
    section === 'links' ? { ...props, description: undefined, title: undefined } : props,
  );
}

export function SiteSettingsInput(props: ObjectInputProps) {
  const { routerPanesState } = usePaneRouter();
  const section = getSettingsSection(routerPanesState);

  useEffect(() => {
    if (section) {
      props.onFieldGroupSelect(section);
    }
  }, [props.onFieldGroupSelect, section]);

  if (!section) {
    return props.renderDefault(props);
  }

  const config = sectionConfig[section];
  const fieldNames = new Set(config.fieldNames);
  const visibleFields = props.members.filter(
    (member) => member.kind === 'field' && fieldNames.has(member.name),
  );

  return (
    <div className="rs-settings-editor">
      <header className="rs-settings-editor__header">
        <div className="rs-settings-editor__intro">
          <Text className="rs-eyebrow" muted size={1} weight="semibold">
            Edición directa
          </Text>
          <div className="rs-settings-editor__title-group">
            <Heading as="h2" size={3}>
              {config.title}
            </Heading>
            <Text className="rs-settings-editor__description" muted size={2}>
              {config.description}
            </Text>
          </div>
        </div>
        <a
          className="rs-settings-editor__landing"
          href={landingUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ArrowTopRightIcon />
          <span>Ver landing</span>
        </a>
      </header>

      {visibleFields.length > 0 ? (
        <div className="rs-settings-editor__fields">
          {props.renderDefault({ ...props, groups: [], members: visibleFields })}
        </div>
      ) : (
        <div className="rs-settings-editor__loading" role="status">
          <Text muted>Preparando editor…</Text>
        </div>
      )}

      {config.note ? (
        <Text className="rs-settings-editor__note" muted size={1}>
          {config.note}
        </Text>
      ) : null}
    </div>
  );
}
