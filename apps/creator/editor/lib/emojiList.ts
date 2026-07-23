// apps/creator/editor/lib/emojiList.ts
// Curated emoji dataset backing reactjs-tiptap-editor's Emoji extension `suggestion.items`
// (the library ships the extension but not a default searchable list — bring-your-own,
// same as the upstream demo does with its own local emoji data file).

export interface EmojiEntry {
  name: string;
  char: string;
  keywords: string[];
}

export const EMOJI_LIST: EmojiEntry[] = [
  // Smileys
  { name: "grinning", char: "😀", keywords: ["happy", "smile", "grin"] },
  { name: "joy", char: "😂", keywords: ["laugh", "tears", "funny", "lol"] },
  { name: "smile", char: "😄", keywords: ["happy", "smile"] },
  { name: "wink", char: "😉", keywords: ["wink", "flirt"] },
  { name: "blush", char: "😊", keywords: ["happy", "blush", "shy"] },
  { name: "heart_eyes", char: "😍", keywords: ["love", "crush", "heart"] },
  { name: "thinking", char: "🤔", keywords: ["think", "hmm", "consider"] },
  { name: "neutral_face", char: "😐", keywords: ["meh", "neutral"] },
  { name: "sweat_smile", char: "😅", keywords: ["nervous", "relief", "sweat"] },
  { name: "cry", char: "😢", keywords: ["sad", "tear", "cry"] },
  { name: "sob", char: "😭", keywords: ["sad", "crying", "bawl"] },
  { name: "angry", char: "😠", keywords: ["mad", "angry"] },
  { name: "rage", char: "😡", keywords: ["mad", "furious", "rage"] },
  { name: "scream", char: "😱", keywords: ["shocked", "scared", "scream"] },
  { name: "sleeping", char: "😴", keywords: ["sleep", "tired", "zzz"] },
  { name: "sunglasses", char: "😎", keywords: ["cool", "sunglasses"] },
  { name: "partying_face", char: "🥳", keywords: ["party", "celebrate", "birthday"] },
  { name: "exploding_head", char: "🤯", keywords: ["mindblown", "shocked", "wow"] },
  { name: "nerd_face", char: "🤓", keywords: ["nerd", "geek", "glasses"] },
  { name: "smirk", char: "😏", keywords: ["smug", "smirk"] },

  // Gestures / people
  { name: "thumbsup", char: "👍", keywords: ["like", "approve", "yes", "good"] },
  { name: "thumbsdown", char: "👎", keywords: ["dislike", "no", "bad"] },
  { name: "clap", char: "👏", keywords: ["applause", "clap", "nice"] },
  { name: "raised_hands", char: "🙌", keywords: ["celebrate", "praise", "yay"] },
  { name: "wave", char: "👋", keywords: ["hello", "bye", "wave"] },
  { name: "pray", char: "🙏", keywords: ["please", "thanks", "pray"] },
  { name: "muscle", char: "💪", keywords: ["strong", "flex", "gym"] },
  { name: "point_up", char: "☝️", keywords: ["point", "up", "note"] },
  { name: "ok_hand", char: "👌", keywords: ["ok", "perfect", "good"] },
  { name: "fingers_crossed", char: "🤞", keywords: ["hope", "luck", "crossed"] },
  { name: "handshake", char: "🤝", keywords: ["deal", "agree", "handshake"] },
  { name: "eyes", char: "👀", keywords: ["look", "watch", "eyes"] },
  { name: "brain", char: "🧠", keywords: ["smart", "idea", "brain"] },

  // Objects / symbols
  { name: "heart", char: "❤️", keywords: ["love", "heart", "like"] },
  { name: "fire", char: "🔥", keywords: ["hot", "lit", "fire", "great"] },
  { name: "star", char: "⭐", keywords: ["star", "favorite"] },
  { name: "sparkles", char: "✨", keywords: ["sparkle", "new", "shiny"] },
  { name: "tada", char: "🎉", keywords: ["party", "celebrate", "congrats"] },
  { name: "rocket", char: "🚀", keywords: ["launch", "fast", "ship", "rocket"] },
  { name: "bulb", char: "💡", keywords: ["idea", "light", "bulb"] },
  { name: "warning", char: "⚠️", keywords: ["warning", "caution", "alert"] },
  { name: "white_check_mark", char: "✅", keywords: ["done", "check", "yes", "complete"] },
  { name: "x", char: "❌", keywords: ["no", "wrong", "cancel", "error"] },
  { name: "question", char: "❓", keywords: ["question", "confused", "help"] },
  { name: "exclamation", char: "❗", keywords: ["important", "alert", "exclaim"] },
  { name: "hundred", char: "💯", keywords: ["100", "perfect", "score"] },
  { name: "gear", char: "⚙️", keywords: ["settings", "config", "gear"] },
  { name: "lock", char: "🔒", keywords: ["lock", "secure", "private"] },
  { name: "unlock", char: "🔓", keywords: ["unlock", "open"] },
  { name: "bug", char: "🐛", keywords: ["bug", "issue", "error"] },
  { name: "hammer", char: "🔨", keywords: ["build", "fix", "tool"] },
  { name: "wrench", char: "🔧", keywords: ["fix", "tool", "settings"] },
  { name: "package", char: "📦", keywords: ["package", "box", "ship", "deploy"] },
  { name: "memo", char: "📝", keywords: ["note", "write", "memo", "todo"] },
  { name: "pushpin", char: "📌", keywords: ["pin", "important", "note"] },
  { name: "book", char: "📖", keywords: ["book", "read", "docs"] },
  { name: "chart_increasing", char: "📈", keywords: ["chart", "growth", "up", "stats"] },
  { name: "chart_decreasing", char: "📉", keywords: ["chart", "decline", "down"] },
  { name: "calendar", char: "📅", keywords: ["calendar", "date", "schedule"] },
  { name: "hourglass", char: "⏳", keywords: ["time", "wait", "hourglass"] },
  { name: "alarm_clock", char: "⏰", keywords: ["time", "clock", "reminder", "deadline"] },
  { name: "link", char: "🔗", keywords: ["link", "url", "chain"] },
  { name: "mag", char: "🔍", keywords: ["search", "find", "magnify"] },
  { name: "trophy", char: "🏆", keywords: ["win", "trophy", "achievement"] },
  { name: "target", char: "🎯", keywords: ["goal", "target", "aim"] },
  { name: "coffee", char: "☕", keywords: ["coffee", "break", "drink"] },
  { name: "computer", char: "💻", keywords: ["computer", "laptop", "code"] },
  { name: "phone", char: "📱", keywords: ["phone", "mobile"] },
  { name: "email", char: "📧", keywords: ["email", "mail", "message"] },
  { name: "speech_balloon", char: "💬", keywords: ["chat", "comment", "talk"] },
  { name: "bell", char: "🔔", keywords: ["notify", "alert", "bell"] },
];
