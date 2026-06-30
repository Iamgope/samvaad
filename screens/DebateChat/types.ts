export type Side = 'for' | 'against'
export type WsMsg = { id: string; isMe: boolean; text: string; time: string; roundId: number }
export type RoundLabel = { roundId: number; label: string }

export const CLOCK_SECONDS = 2 * 60
export const CHAR_LIMIT = 400
export const PASTE_GUARD_LEN = 8

export const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣',
  '😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗',
  '🤔','🤭','🫢','🤫','🤥','😶','😐','😑','😬','🙄','😮','😯','😲','🥱','😴','🤤','😪','🫠','🤐','🥴',
  '🔥','💯','✨','⚡','💥','💢','💪','👏','🙌','🤝','👍','👎','👌','🤌','✌️','🤞','🫡','🙏','💀','👀',
  '🎯','🏆','🥇','🚀','💡','📈','📉','⚖️','🧠','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❓','❗',
]

export const ROUND_TYPE_LABELS: Record<string, string> = {
  OPENING:  'OPENING ROUND',
  REBUTTAL: 'REBUTTAL ROUND',
}

export const sideLabel = (s: Side) => (s === 'for' ? 'FOR' : 'AGAINST')
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
