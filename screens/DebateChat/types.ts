export type Side = 'for' | 'against'
export type WsMsg = { id: string; isMe: boolean; text: string; time: string; roundId: number }
export type RoundLabel = { roundId: number; label: string }

// Full round/message history sent back on `queue.matched` when the user is
// reconnecting into a debate already in progress (as opposed to a fresh match).
export type ResumeRound = {
  round_id: number
  round_type: string
  order: number
  started_at: string
  ended_at: string | null
  messages: {
    id: number
    user: { id: number; username: string }
    content: string
    created_at: string
    round_id: number
  }[]
}

// Server-authoritative rebuttal chess clock snapshot — attached to `round.advanced`,
// `message.new` (during REBUTTAL), and the `queue.matched` resume payload. Null
// whenever there's no live rebuttal clock (OPENING, or the round already ended).
export type RoundTime = {
  current_speaker_id: number | null
  turn_started_at: string | null
  turn_deadline: string | null
  pro_time_remaining_seconds: number | null
  con_time_remaining_seconds: number | null
  server_now: string
}

export type Judgement = {
  id: number
  winner: { id: number; username: string } | null
  argument_score_pro: number
  rebuttal_score_pro: number
  clarity_score_pro: number
  persuasion_score_pro: number
  argument_score_con: number
  rebuttal_score_con: number
  clarity_score_con: number
  persuasion_score_con: number
  overall_score_pro: number
  overall_score_con: number
  xp_delta_pro: number
  xp_delta_con: number
  reasoning: string
  strongest_moment: string
  coaching_tip_pro: string
  coaching_tip_con: string
  created_at: string
}

// Fixed "you" accent used throughout the chat (bubbles, send button) —
// deliberately not tied to the debate's category accent.
export const USER_BLUE = '#4FA9FF'

export const CLOCK_SECONDS = 2 * 60
export const CHAR_LIMIT = 400
export const PASTE_GUARD_LEN = 8

export const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🫢', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😮', '😯', '😲', '🥱', '😴', '🤤', '😪', '🫠', '🤐', '🥴',
  '🔥', '💯', '✨', '⚡', '💥', '💢', '💪', '👏', '🙌', '🤝', '👍', '👎', '👌', '🤌', '✌️', '🤞', '🫡', '🙏', '💀', '👀',
  '🎯', '🏆', '🥇', '🚀', '💡', '📈', '📉', '⚖️', '🧠', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❓', '❗',
]

export const ROUND_TYPE_LABELS: Record<string, string> = {
  OPENING: 'Opening',
  REBUTTAL: 'Rebuttal',
}

export const sideLabel = (s: Side) => (s === 'for' ? 'FOR' : 'AGAINST')
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
