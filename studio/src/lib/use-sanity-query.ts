import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';

import { SANITY_API_VERSION } from './sanity-api';

interface QueryState<T> {
  data: T;
  error: Error | null;
  loading: boolean;
  refresh: () => void;
}

export function useSanityQuery<T>(query: string, initialData: T): QueryState<T> {
  const baseClient = useClient({ apiVersion: SANITY_API_VERSION });
  const client = useMemo(
    () => baseClient.withConfig({ perspective: 'drafts', useCdn: false }),
    [baseClient],
  );
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const nextData = await client.fetch<T>(query);
        if (!cancelled) {
          setData(nextData);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught : new Error('No se pudo cargar el contenido.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    const reloadOnFocus = () => void load();
    window.addEventListener('focus', reloadOnFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', reloadOnFocus);
    };
  }, [client, query, refreshKey]);

  return { data, error, loading, refresh };
}
