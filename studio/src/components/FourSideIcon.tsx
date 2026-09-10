export function FourSideIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 128 128"
    >
      <mask id="four-side-icon-mask">
        <image
          height="128"
          href="/static/4side-isotipo-white.png"
          width="128"
        />
      </mask>
      <rect
        fill="currentColor"
        height="128"
        mask="url(#four-side-icon-mask)"
        width="128"
      />
    </svg>
  );
}
