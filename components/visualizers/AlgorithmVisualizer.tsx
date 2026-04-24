'use client';

import type { VisualizationConfig } from '@/types/visualizations';
import { VectorSearchVisualizer }    from './VectorSearchVisualizer';
import { BinarySearchVisualizer }    from './BinarySearchVisualizer';
import { RecursionTreeVisualizer }   from './RecursionTreeVisualizer';
import { BacktrackingTreeVisualizer } from './BacktrackingTreeVisualizer';
import { CostVisualizer }            from './CostVisualizer';

export function AlgorithmVisualizer({ config }: { config: VisualizationConfig }) {
  switch (config.type) {
    case 'vector-search':     return <VectorSearchVisualizer config={config} />;
    case 'binary-search':     return <BinarySearchVisualizer config={config} />;
    case 'recursion-tree':    return <RecursionTreeVisualizer config={config} />;
    case 'backtracking-tree': return <BacktrackingTreeVisualizer config={config} />;
    case 'cost-analysis':     return <CostVisualizer config={config} />;
  }
}
