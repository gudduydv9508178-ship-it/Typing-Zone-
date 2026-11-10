// Standard Hindi InScript (Mangal) Keyboard Mapping
// Maps physical QWERTY key characters (e.key) to Devanagari Unicode characters

export const HINDI_INSCRIPT_MAP: Record<string, string> = {
  // Number Row (Unshifted)
  '`': '़',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '0': '0',
  '-': '-',
  '=': 'ृ',

  // Number Row (Shifted)
  '~': '~',
  '!': '!',
  '@': '@',
  '#': '#',
  '$': '$',
  '%': '%',
  '^': '^',
  '&': '&',
  '*': '*',
  '(': '(',
  ')': ')',
  '_': 'ः',
  '+': 'ऋ',

  // Top Row (Unshifted)
  'q': 'ौ',
  'w': 'ै',
  'e': 'ा',
  'r': 'ी',
  't': 'ू',
  'y': 'ब',
  'u': 'ह',
  'i': 'ग',
  'o': 'द',
  'p': 'ज',
  '[': 'ड',
  ']': '़',
  '\\': '\\',

  // Top Row (Shifted)
  'Q': 'औ',
  'W': 'ऐ',
  'E': 'आ',
  'R': 'ई',
  'T': 'ऊ',
  'Y': 'भ',
  'U': 'ङ',
  'I': 'घ',
  'O': 'ध',
  'P': 'झ',
  '{': 'ढ',
  '}': 'ञ',
  '|': '|',

  // Home Row (Unshifted)
  'a': 'ो',
  's': 'े',
  'd': '्',
  'f': 'ि',
  'g': 'ु',
  'h': 'प',
  'j': 'र',
  'k': 'क',
  'l': 'त',
  ';': 'च',
  "'": 'ट',

  // Home Row (Shifted)
  'A': 'ओ',
  'S': 'ए',
  'D': 'अ',
  'F': 'इ',
  'G': 'उ',
  'H': 'फ',
  'J': 'ऱ',
  'K': 'ख',
  'L': 'थ',
  ':': 'छ',
  '"': 'ठ',

  // Bottom Row (Unshifted)
  'z': 'ॉ',
  'x': 'ं',
  'c': 'म',
  'v': 'न',
  'b': 'व',
  'n': 'ल',
  'm': 'स',
  ',': ',',
  '.': '.',
  '/': 'य',

  // Bottom Row (Shifted)
  'Z': 'ऑ',
  'X': 'ँ',
  'C': 'ण',
  'V': 'ऩ',
  'B': 'ऴ',
  'N': 'ळ',
  'M': 'श',
  '<': 'ष',
  '>': '।',
  '?': 'य़',
};

// Reverse map: Devanagari char -> { key: physical unshifted key, shift: boolean }
const SHIFTED_TO_BASE: Record<string, string> = {
  '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6',
  '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=',
  '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
};

export const HINDI_CHAR_TO_KEY: Record<string, { key: string; shift: boolean }> = {};

Object.entries(HINDI_INSCRIPT_MAP).forEach(([engKey, hindiChar]) => {
  const isUpperLetter = engKey >= 'A' && engKey <= 'Z';
  const isShiftedSymbol = engKey in SHIFTED_TO_BASE;
  const shift = isUpperLetter || isShiftedSymbol;
  const baseKey = isUpperLetter
    ? engKey.toLowerCase()
    : isShiftedSymbol
    ? SHIFTED_TO_BASE[engKey]
    : engKey;

  if (!HINDI_CHAR_TO_KEY[hindiChar]) {
    HINDI_CHAR_TO_KEY[hindiChar] = { key: baseKey, shift };
  }
});

// Display labels for QWERTY keys in Hindi InScript mode
export const HINDI_KEY_LABELS: Record<string, { unshifted: string; shifted: string }> = {
  '`': { unshifted: '़', shifted: '~' },
  '1': { unshifted: '1', shifted: '!' },
  '2': { unshifted: '2', shifted: '@' },
  '3': { unshifted: '3', shifted: '#' },
  '4': { unshifted: '4', shifted: '$' },
  '5': { unshifted: '5', shifted: '%' },
  '6': { unshifted: '6', shifted: '^' },
  '7': { unshifted: '7', shifted: '&' },
  '8': { unshifted: '8', shifted: '*' },
  '9': { unshifted: '9', shifted: '(' },
  '0': { unshifted: '0', shifted: ')' },
  '-': { unshifted: '-', shifted: 'ः' },
  '=': { unshifted: 'ृ', shifted: 'ऋ' },

  'q': { unshifted: 'ौ', shifted: 'औ' },
  'w': { unshifted: 'ै', shifted: 'ऐ' },
  'e': { unshifted: 'ा', shifted: 'आ' },
  'r': { unshifted: 'ी', shifted: 'ई' },
  't': { unshifted: 'ू', shifted: 'ऊ' },
  'y': { unshifted: 'ब', shifted: 'भ' },
  'u': { unshifted: 'ह', shifted: 'ङ' },
  'i': { unshifted: 'ग', shifted: 'घ' },
  'o': { unshifted: 'द', shifted: 'ध' },
  'p': { unshifted: 'ज', shifted: 'झ' },
  '[': { unshifted: 'ड', shifted: 'ढ' },
  ']': { unshifted: '़', shifted: 'ञ' },
  '\\': { unshifted: '\\', shifted: '|' },

  'a': { unshifted: 'ो', shifted: 'ओ' },
  's': { unshifted: 'े', shifted: 'ए' },
  'd': { unshifted: '्', shifted: 'अ' },
  'f': { unshifted: 'ि', shifted: 'इ' },
  'g': { unshifted: 'ु', shifted: 'उ' },
  'h': { unshifted: 'प', shifted: 'फ' },
  'j': { unshifted: 'र', shifted: 'ऱ' },
  'k': { unshifted: 'क', shifted: 'ख' },
  'l': { unshifted: 'त', shifted: 'थ' },
  ';': { unshifted: 'च', shifted: 'छ' },
  "'": { unshifted: 'ट', shifted: 'ठ' },

  'z': { unshifted: 'ॉ', shifted: 'ऑ' },
  'x': { unshifted: 'ं', shifted: 'ँ' },
  'c': { unshifted: 'म', shifted: 'ण' },
  'v': { unshifted: 'न', shifted: 'ऩ' },
  'b': { unshifted: 'व', shifted: 'ऴ' },
  'n': { unshifted: 'ल', shifted: 'ळ' },
  'm': { unshifted: 'स', shifted: 'श' },
  ',': { unshifted: ',', shifted: 'ष' },
  '.': { unshifted: '.', shifted: '।' },
  '/': { unshifted: 'य', shifted: 'य़' },
};
