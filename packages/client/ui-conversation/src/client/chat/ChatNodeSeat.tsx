import { memo, useMemo, useState } from 'react'
import { JsonBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChatNodeOwnerProps, ChatViewSlotProps } from '../contract/slots.ts'
import type { ChatNode } from '../contract/chat-nodes.ts'
import css from './ChatView.module.css'

interface ChatNodeSeatProps extends ChatNodeOwnerProps {
  readonly nodeKey: string
  /** Whether this row is the trailing flow row at mount; its mount plays the enter animation. */
  readonly entering: boolean
  readonly useSession: ChatViewSlotProps['useSession']
  readonly renderSlot: ChatViewSlotProps['renderSlot']
  readonly t: ChatViewSlotProps['t']
}

type RoutedChatNodeOwner = {
  [Kind in ChatNode['kind']]: ChatNodeOwnerProps & { readonly node: ChatNode<Kind> }
}[ChatNode['kind']]

/**
 * Memo guard: `entering` is mount-only presentation — as the flow tip advances
 * it moves from the previous tail row to the new one, and that churn must not
 * cross the memo boundary (the streaming contract holds neighbors at zero
 * re-renders). Every other prop compares by identity.
 */
function seatPropsEqual(prev: ChatNodeSeatProps, next: ChatNodeSeatProps): boolean {
  for (const key of Object.keys(prev) as (keyof ChatNodeSeatProps)[]) {
    if (key === 'entering') continue
    if (prev[key] !== next[key]) return false
  }
  return true
}

/** Subscribe and dispatch one stable Context key without observing sibling Nodes. */
export const ChatNodeSeat = memo(function ChatNodeSeat({
  nodeKey, entering, selectedCallId, cwd, openFile, inspectCall, forkAt,
  loadImage, fileMentions, useSession, renderSlot, t,
}: ChatNodeSeatProps) {
  const node = useSession(snapshot => snapshot.chat.nodes.get(nodeKey))
  const routedNode = node as ChatNode | undefined
  const owner = useMemo<ChatNodeOwnerProps | null>(() => node === undefined
    ? null
    : {
      selectedCallId,
      cwd,
      openFile,
      inspectCall,
      forkAt,
      loadImage,
      fileMentions,
    }, [node, selectedCallId, cwd, openFile, inspectCall, forkAt, loadImage, fileMentions])
  // The enter animation plays once, from the row's own mount: later entering
  // prop churn (the flow tip moving on) is ignored by the memo guard and by
  // the captured initial value, so the row never re-renders for it.
  const [entered] = useState(entering)
  if (routedNode === undefined || owner === null) return null
  // Runtime dispatch owns the correlation: every Node's discriminant is the
  // keyed-slot entry passed alongside that same Node. TypeScript does not
  // distribute an object containing a union into a union of objects itself.
  const routedOwner = { ...owner, node: routedNode } as RoutedChatNodeOwner
  return (
    <div
      className={css.flowItem}
      data-chat-anchor-key={routedNode.key}
      data-chat-flow-key={routedNode.key}
      data-chat-flow-kind={routedNode.kind}
      data-entering={entered || undefined}
    >
      {renderSlot('conversation.chat.node', routedOwner, {
        entryKey: routedNode.kind,
        hookContext: nodeKey,
        fallback: (
          <JsonBlock
            label={t('message.unknownSurface', { type: routedNode.kind })}
            payload={routedNode.data}
            truncatedLabel={total => t('json.truncated', { total })}
          />
        ),
      })}
    </div>
  )
}, seatPropsEqual)
