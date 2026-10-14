import type { PreviewProps } from 'sanity';
import { styled } from 'styled-components';

const PreviewWrapper = styled.div`
  display: contents;

  /* Remove Sanity's thumbnail frame only within producer previews. */
  & [data-testid='Media'] > [data-border] {
    box-shadow: none;
  }
`;

export function ProducerPreview(props: PreviewProps) {
  return <PreviewWrapper>{props.renderDefault(props)}</PreviewWrapper>;
}
