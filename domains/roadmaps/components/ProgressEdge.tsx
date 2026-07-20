import React, { useMemo, useState } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';

export function ProgressEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const [isHovered, setIsHovered] = useState(false);
  const { setEdges } = useReactFlow();

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  const status = data?.status as 'locked' | 'animating' | 'completed' | undefined;
  
  // Calculate approximate length for the dash animation
  const approxLength = useMemo(() => {
    return Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY) + 100;
  }, [sourceX, sourceY, targetX, targetY]);

  // Base style (gray, thin)
  const baseStroke = selected ? '#6366f1' : (isHovered && status !== 'completed' ? '#94a3b8' : '#cbd5e1');
  const baseStrokeWidth = selected ? 4 : (isHovered && status !== 'completed' ? 3 : 2);
  const baseFilter = selected && status !== 'completed' && status !== 'animating' ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))' : 'none';

  // Active style (green, glowing, or indigo if selected)
  const activeStroke = selected ? '#6366f1' : '#10b981';
  const activeStrokeWidth = selected ? 4 : ((status === 'completed' && isHovered) ? 4 : 3);
  const activeFilter = selected 
    ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))' 
    : (status === 'completed' ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' : 'none');

  return (
    <>
      {/* Invisible thicker path for easier hovering */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Base locked path */}
      <BaseEdge
        id={`${id}-base`}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: baseStroke,
          strokeWidth: baseStrokeWidth,
          filter: baseFilter,
          transition: 'stroke-width 0.2s, stroke 0.2s, filter 0.2s',
        }}
      />

      {/* Animated or Completed overlay path */}
      {(status === 'animating' || status === 'completed') && (
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke={activeStroke}
          strokeWidth={activeStrokeWidth}
          strokeLinecap="round"
          filter={activeFilter}
          style={{
            ...style,
            strokeDasharray: status === 'animating' ? approxLength : 'none',
            strokeDashoffset: status === 'animating' ? approxLength : 0,
            animation: status === 'animating' ? `drawEdge 700ms ease-in-out forwards` : 'none',
            transition: 'stroke-width 0.2s, filter 0.2s',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip on hover if completed */}
      {status === 'completed' && isHovered && !selected && (
        <foreignObject
          width={120}
          height={40}
          x={labelX - 60}
          y={labelY - 20}
          className="pointer-events-none"
        >
          <div className="flex items-center justify-center w-full h-full">
            <div className="px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-200">
              Completed
            </div>
          </div>
        </foreignObject>
      )}

      {/* Remove Button on hover or selected */}
      {(isHovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200 cursor-pointer"
              onClick={onEdgeClick}
              title="Remove connection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Inject keyframes just once (it's okay to have multiple, but normally put in a global sheet. We'll leave it simple here) */}
      {status === 'animating' && (
        <style>
          {`
            @keyframes drawEdge {
              to {
                stroke-dashoffset: 0;
              }
            }
          `}
        </style>
      )}
    </>
  );
}
