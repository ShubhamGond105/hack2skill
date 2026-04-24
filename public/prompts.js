// ── Topic pills per mode ─────────────────────────────────────────────────────
// System prompts live ONLY in api/chat.js (server-side, never exposed to browser).
// This file configures only the UI suggestion pills.

const PILLS = {
  general: [
    'How does Lok Sabha election work?',
    'What is Model Code of Conduct?',
    'How many phases are in a general election?',
    'What is FPTP voting system?',
    'How is the Prime Minister elected?',
    'What does Election Commission do?'
  ],
  state: [
    'How is a Chief Minister chosen?',
    'What is President\'s Rule?',
    'Difference between Lok Sabha and Vidhan Sabha?',
    'What is a by-election?',
    'How does Rajya Sabha election work?',
    'What is a floor test?'
  ],
  voter: [
    'How do I register to vote in India?',
    'What is EPIC voter ID card?',
    'Am I eligible to vote?',
    'What is NOTA?',
    'What are my rights at the polling booth?',
    'What if my name is missing from voter list?'
  ],
  evm: [
    'How does an EVM work?',
    'What is VVPAT?',
    'Is EVM tamper-proof?',
    'How is EVM tested before elections?',
    'Who manufactures EVMs in India?',
    'How are votes counted from EVM?'
  ],
  quiz: [
    'Test my knowledge on Lok Sabha',
    'Quiz me on voter rights',
    'Ask me about EVM and VVPAT',
    'Quiz on Election Commission history',
    'Test me on Indian Constitution articles'
  ]
};
