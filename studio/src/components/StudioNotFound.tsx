import { useEffect, useRef } from 'react';
import { Card } from '@sanity/ui';
import { StudioNavbar, ToolLink } from 'sanity';

import { FourSideIcon } from './FourSideIcon';
import './studio.css';

export function StudioNotFound() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <Card className="rs-studio-not-found" height="fill" tone="inherit">
      <StudioNavbar />
      <main className="rs-studio-not-found__main">
        <section aria-labelledby="rs-studio-not-found-title" className="rs-studio-not-found__content">
          <div className="rs-studio-not-found__brand" aria-hidden="true">
            <FourSideIcon />
          </div>
          <p className="rs-studio-not-found__eyebrow">Panel de contenido</p>
          <p className="rs-studio-not-found__code" aria-hidden="true">
            404
          </p>
          <h1 id="rs-studio-not-found-title" ref={titleRef} tabIndex={-1}>
            Sección no encontrada
          </h1>
          <p className="rs-studio-not-found__description">
            La dirección no corresponde a una sección disponible del panel.
          </p>
          <ToolLink className="rs-studio-not-found__action" name="panel">
            Volver al panel
          </ToolLink>
        </section>
      </main>
    </Card>
  );
}
