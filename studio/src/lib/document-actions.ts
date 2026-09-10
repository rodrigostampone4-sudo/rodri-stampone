import type { DocumentActionComponent } from 'sanity';

const blockedSingletonActions = new Set(['delete', 'duplicate', 'unpublish']);

/**
 * Keeps Sanity's native publish implementation and localizes only its visible
 * label for the content model used by this Studio.
 */
function localizePublishAction(nativeAction: DocumentActionComponent): DocumentActionComponent {
  const localizedAction: DocumentActionComponent = (props) => {
    const description = nativeAction(props);

    if (!description) {
      return null;
    }

    const label = props.type === 'event' && !props.published ? 'Publicar evento' : 'Publicar cambios';

    return {
      ...description,
      label,
    };
  };

  localizedAction.action = nativeAction.action;
  localizedAction.displayName = nativeAction.displayName;

  return localizedAction;
}

export function resolveDocumentActions(
  previousActions: DocumentActionComponent[],
  schemaType: string,
) {
  const availableActions =
    schemaType === 'siteSettings'
      ? previousActions.filter((action) => !blockedSingletonActions.has(action.action ?? ''))
      : previousActions;

  return availableActions.map((action) =>
    action.action === 'publish' ? localizePublishAction(action) : action,
  );
}
