import { Badge } from '@sanity/ui';

import type { EventStatus } from '../lib/event-status';

const statusLabels: Record<EventStatus, string> = {
  finished: 'Finalizado',
  hidden: 'Oculto',
  visible: 'Visible',
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge tone={status === 'visible' ? 'positive' : status === 'hidden' ? 'caution' : 'default'}>
      {statusLabels[status]}
    </Badge>
  );
}
