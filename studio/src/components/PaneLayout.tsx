import type { ComponentProps, ReactNode } from 'react';
import { ArrowTopRightIcon } from '@sanity/icons/ArrowTopRight';
import { Box, Card, Heading, Stack, Text } from '@sanity/ui';

import { landingUrl } from '../lib/landing-url';
import './studio.css';

interface PaneLayoutProps {
  actions?: ReactNode;
  children: ReactNode;
  contentGap?: ComponentProps<typeof Stack>['gap'];
  description: string;
  eyebrow?: string;
  title: string;
}

export function PaneLayout({
  actions,
  children,
  contentGap = 4,
  description,
  eyebrow = 'Panel de contenido',
  title,
}: PaneLayoutProps) {
  return (
    <Card className="rs-pane" tone="inherit">
      <div className="rs-pane__scroll">
        <Box padding={4}>
          <div className="rs-pane__inner">
            <header className="rs-pane__header">
              <div className="rs-pane__intro">
                <Text className="rs-eyebrow" muted size={1} weight="semibold">
                  {eyebrow}
                </Text>
                <TextGroup>
                  <Heading as="h1" size={3}>
                    {title}
                  </Heading>
                  <Text className="rs-pane__description" muted size={2}>
                    {description}
                  </Text>
                </TextGroup>
              </div>
              <div className="rs-pane__header-actions">{actions}</div>
            </header>

            <div className="rs-pane__landing">
              <a href={landingUrl} rel="noopener noreferrer" target="_blank">
                <ArrowTopRightIcon />
                <span>Ver landing</span>
              </a>
            </div>

            <Stack gap={contentGap}>{children}</Stack>
          </div>
        </Box>
      </div>
    </Card>
  );
}

export function PanelCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`rs-card ${className}`} muted padding={4} radius={3} tone="inherit">
      {children}
    </Card>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="rs-section-title">
      <Heading as="h2" size={1}>
        {children}
      </Heading>
    </div>
  );
}

export function TextGroup({ children }: { children: ReactNode }) {
  return <div className="rs-text-group">{children}</div>;
}

export function LoadingState({ label = 'Cargando contenido' }: { label?: string }) {
  return (
    <div className="rs-feedback" role="status">
      <span className="rs-spinner" aria-hidden="true" />
      <Text muted>{label}</Text>
    </div>
  );
}

export function ErrorState({
  message = 'Ocurrió un problema al cargar el contenido.',
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rs-feedback rs-feedback--error" role="alert">
      <Text>{message}</Text>
      <button className="rs-inline-button" onClick={onRetry} type="button">
        Reintentar
      </button>
    </div>
  );
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rs-empty">
      <Text weight="semibold">{children}</Text>
      {action ? <div className="rs-empty__action">{action}</div> : null}
    </div>
  );
}
