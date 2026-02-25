import React from 'react'
import { HandlerAdder } from './handler-adder'
import { HandlersList } from './HandlersList'
import { Separator } from '@/components/ui/separator'

type Props = {
  /** Optional node ID to get buttons from (for reply/callback handlers) */
  sourceNodeId?: string
}

export function HandlerBuilder({ sourceNodeId }: Props) {
  return (
    <div className="space-y-4">
      <HandlersList sourceNodeId={sourceNodeId} showHandle={false} />
      <Separator />
      <HandlerAdder sourceNodeId={sourceNodeId} />
    </div>
  )
}