// ─── Vector Search ────────────────────────────────────────────────────────────

export interface VectorSearchStep {
  title: string;
  description: string;
  currentIndex: number | null;
  foundAt: number | null;
  phase: 'init' | 'comparing' | 'found' | 'not-found';
}

export interface VectorSearchConfig {
  type: 'vector-search';
  id: string;
  title: string;
  description: string;
  array: (number | string)[];
  target: number | string;
  steps: VectorSearchStep[];
}

// ─── Binary Search ────────────────────────────────────────────────────────────

export interface BinarySearchStep {
  title: string;
  description: string;
  left: number;
  right: number;
  mid: number | null;
  discarded: number[];
  phase: 'init' | 'comparing' | 'discard-left' | 'discard-right' | 'found' | 'not-found';
}

export interface BinarySearchConfig {
  type: 'binary-search';
  id: string;
  title: string;
  description: string;
  array: number[];
  target: number;
  steps: BinarySearchStep[];
}

// ─── Recursion Tree ───────────────────────────────────────────────────────────

export interface RecursionNode {
  id: string;
  label: string;
  returnValue?: string;
  children: RecursionNode[];
}

export interface RecursionTreeStep {
  title: string;
  description: string;
  activeNodeId: string | null;
  completedNodeIds: string[];
  phase: 'init' | 'calling' | 'base-case' | 'returning' | 'done';
}

export interface RecursionTreeConfig {
  type: 'recursion-tree';
  id: string;
  title: string;
  description: string;
  root: RecursionNode;
  steps: RecursionTreeStep[];
}

// ─── Backtracking Tree ────────────────────────────────────────────────────────

export interface BacktrackingNode {
  id: string;
  label: string;
  children: BacktrackingNode[];
}

export interface BacktrackingStep {
  title: string;
  description: string;
  activeNodeId: string | null;
  activePath: string[];
  prunedNodeIds: string[];
  solutionNodeIds: string[];
  phase: 'init' | 'exploring' | 'pruning' | 'solution' | 'backtracking' | 'done';
}

export interface BacktrackingConfig {
  type: 'backtracking-tree';
  id: string;
  title: string;
  description: string;
  root: BacktrackingNode;
  steps: BacktrackingStep[];
}

// ─── Cost Analysis ────────────────────────────────────────────────────────────

export type ComplexityClass = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(2ⁿ)';

export interface CostAnalysisStep {
  title: string;
  description: string;
  highlightedClass: ComplexityClass;
  example: string;
  algorithms: string[];
}

export interface CostAnalysisConfig {
  type: 'cost-analysis';
  id: string;
  title: string;
  description: string;
  steps: CostAnalysisStep[];
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type VisualizationConfig =
  | VectorSearchConfig
  | BinarySearchConfig
  | RecursionTreeConfig
  | BacktrackingConfig
  | CostAnalysisConfig;

export type VizType = VisualizationConfig['type'];
