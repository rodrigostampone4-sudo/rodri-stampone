import { useMemo, type HTMLProps, type KeyboardEvent, type Ref } from 'react';
import {
  ReferenceInputOptionsProvider,
  type EditReferenceLinkComponentProps,
  type ReferenceInputOptions,
  type ReferenceInputProps,
  useReferenceInputOptions,
} from 'sanity';

type ReferenceLinkProps = Omit<HTMLProps<HTMLAnchorElement>, 'children'> &
  EditReferenceLinkComponentProps & { ref?: Ref<HTMLAnchorElement> };

export function ManagedReferenceInput(props: ReferenceInputProps) {
  const inheritedOptions = useReferenceInputOptions();
  const SelectReferenceLink = useMemo<
    NonNullable<ReferenceInputOptions['EditReferenceLinkComponent']>
  >(
    () =>
      function SelectReferenceLink(referenceLinkProps) {
        const {
          children,
          documentId: _documentId,
          documentType: _documentType,
          parentRefPath: _parentRefPath,
          template: _template,
          onClick,
          onKeyDown,
          ref,
          ...elementProps
        } = referenceLinkProps as unknown as ReferenceLinkProps;
        const selectReference = () => props.onPathFocus(['_ref']);

        const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
          onKeyDown?.(event);

          if (!event.defaultPrevented && event.key === ' ') {
            event.preventDefault();
            selectReference();
          }
        };

        return (
          <a
            {...elementProps}
            href="#"
            ref={ref}
            role="button"
            onClick={(event) => {
              event.preventDefault();
              onClick?.(event);
              selectReference();
            }}
            onKeyDown={handleKeyDown}
          >
            {children}
          </a>
        );
      },
    [props.onPathFocus],
  );

  return (
    <ReferenceInputOptionsProvider
      {...inheritedOptions}
      disableNew={false}
      EditReferenceLinkComponent={SelectReferenceLink}
    >
      {props.renderDefault(props)}
    </ReferenceInputOptionsProvider>
  );
}
