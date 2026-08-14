import { useCallback, useEffect, useMemo, useRef } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { AgentNode, type AgentNodeData } from './AgentNode'
import { useResearchStore } from '@/store/researchStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { AgentRuntime } from '@/types'

const nodeTypes = { agent: AgentNode }

/**
 * The chain runs top to bottom.
 *
 * A horizontal chain of four 212px cards is ~800px wide, which cannot fit the
 * agent panel (300–560px) without zooming out past the point where the labels
 * are readable. Stacking them matches the panel's proportions, so the graph
 * renders at 1:1 and every agent name stays legible.
 */
const NODE_GAP_Y = 66
/** A slight horizontal stagger keeps it from reading as a plain list. */
const NODE_OFFSET_X = 18

function buildNodes(agents: AgentRuntime[]): Node<AgentNodeData>[] {
  return agents.map((agent, index) => ({
    id: agent.id,
    type: 'agent',
    position: { x: index % 2 === 0 ? 0 : NODE_OFFSET_X, y: index * NODE_GAP_Y },
    data: {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.status,
      duration: agent.duration,
      note: agent.note,
    },
    draggable: false,
    selectable: false,
  }))
}

/**
 * Edge styling encodes flow direction: the link *into* the running agent
 * animates and glows, links behind it are solid emerald (data already passed),
 * links ahead stay dim.
 */
function buildEdges(agents: AgentRuntime[], reduced: boolean): Edge[] {
  return agents.slice(0, -1).map((agent, index) => {
    const next = agents[index + 1]
    const passed = agent.status === 'done' || agent.status === 'warn'
    const flowing = passed && next.status === 'running'

    const color = flowing ? '#F97316' : passed ? '#10B981' : 'rgba(255,255,255,0.10)'

    return {
      id: `${agent.id}->${next.id}`,
      source: agent.id,
      target: next.id,
      type: 'smoothstep',
      animated: flowing && !reduced,
      style: {
        stroke: color,
        strokeWidth: flowing ? 2 : 1.5,
        filter: flowing ? 'drop-shadow(0 0 6px rgba(249,115,22,0.7))' : undefined,
        transition: 'stroke 0.5s ease',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
        width: 14,
        height: 14,
      },
    }
  })
}

/**
 * Live pipeline graph.
 *
 * Nodes come straight from the store, which is fed by the backend's `step`
 * events — so the graph is a view of the real run, not a scripted animation.
 * Interaction is disabled (no panning, dragging or zooming): it is a status
 * display, and letting it be knocked out of frame would only cost the user.
 */
function AgentGraphInner({ className }: { className?: string }) {
  const agents = useResearchStore((s) => s.agents)
  const reduced = useReducedMotion()
  const container = useRef<HTMLDivElement>(null)
  const { fitView } = useReactFlow()

  const nextNodes = useMemo(() => buildNodes(agents), [agents])
  const nextEdges = useMemo(() => buildEdges(agents, reduced), [agents, reduced])

  const [nodes, setNodes] = useNodesState<AgentNodeData>(nextNodes)
  const [edges, setEdges] = useEdgesState<Edge>(nextEdges)

  // React Flow owns node state internally, so push store updates into it.
  useEffect(() => setNodes(nextNodes), [nextNodes, setNodes])
  useEffect(() => setEdges(nextEdges), [nextEdges, setEdges])

  /**
   * Re-fit whenever the viewport changes size.
   *
   * The `fitView` prop only fires once, at init — and at that moment the panel
   * is still mid-open (its width is being animated) and this component has just
   * been lazy-loaded, so it measures a container that is not yet its final
   * size and the graph ends up cropped. Watching the element covers the panel
   * animation, the drag-resize handle, and window resizes with one path.
   */
  const refit = useCallback(() => {
    // rAF so the fit reads post-layout dimensions.
    requestAnimationFrame(() =>
      fitView({ padding: 0.14, maxZoom: 1, minZoom: 0.2, duration: reduced ? 0 : 200 }),
    )
  }, [fitView, reduced])

  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(refit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [refit])

  // Also re-fit when the roster itself changes size.
  useEffect(refit, [nextNodes.length, refit])

  return (
    <div ref={container} className={className} role="img" aria-label={describeGraph(agents)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        // fitView refuses to go below `minZoom`, which defaults to 0.5 — too
        // high to fit a long roster in a narrow panel, so lower the floor.
        minZoom={0.2}
        maxZoom={1}
        fitViewOptions={{ padding: 0.14, maxZoom: 1, minZoom: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.06)" />
      </ReactFlow>
    </div>
  )
}

/** `useReactFlow` needs a provider above it, so the export wraps one. */
export function AgentGraph({ className }: { className?: string }) {
  return (
    <ReactFlowProvider>
      <AgentGraphInner className={className} />
    </ReactFlowProvider>
  )
}

/** Screen readers get the pipeline state as a sentence, not a picture. */
function describeGraph(agents: AgentRuntime[]): string {
  const parts = agents.map((agent) => {
    const label = { idle: 'waiting', running: 'running', done: 'complete', warn: 'skipped', error: 'failed' }[
      agent.status
    ]
    return `${agent.name}: ${label}`
  })
  return `Agent pipeline. ${parts.join('. ')}.`
}
