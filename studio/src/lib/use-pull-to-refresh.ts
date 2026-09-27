import { useEffect } from 'react';

import { installPullToRefresh } from './pull-to-refresh';

export function usePullToRefresh() {
  useEffect(() => installPullToRefresh(document, () => window.location.reload()), []);
}
