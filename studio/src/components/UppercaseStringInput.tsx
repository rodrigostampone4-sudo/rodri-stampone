import { set, unset, type StringInputProps } from 'sanity';

import { normalizeArtistName } from '../lib/artist-name';
import './studio.css';

export function UppercaseStringInput(props: StringInputProps) {
  return (
    <div className="rs-uppercase-input">
      {props.renderDefault({
        ...props,
        elementProps: {
          ...props.elementProps,
          onChange: (event) => {
            const value = normalizeArtistName((event.currentTarget as HTMLInputElement).value);
            props.onChange(value ? set(value) : unset());
          },
        },
      })}
    </div>
  );
}
