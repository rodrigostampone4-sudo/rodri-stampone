import { useTools, type LayoutProps } from 'sanity';
import { useRouterState } from 'sanity/router';

import { StudioNotFound } from './StudioNotFound';

export function StudioLayout(props: LayoutProps) {
  const activeToolName = useRouterState((state) =>
    typeof state.tool === 'string' ? state.tool : undefined,
  );
  const tools = useTools();
  const hasActiveTool = !activeToolName || tools.some((tool) => tool.name === activeToolName);

  if (hasActiveTool) {
    return props.renderDefault(props);
  }

  return <StudioNotFound />;
}
