import React from 'react'
import { HandlerAdder } from './handler-adder'

type Props = {
  /** Optional node ID to get buttons from (for reply/callback handlers) */
  sourceNodeId?: string
}

export function HandlerBuilder({ sourceNodeId }: Props) {
  return (
    <div className="space-y-4">
      <HandlerAdder sourceNodeId={sourceNodeId} />
    </div>
  )
}