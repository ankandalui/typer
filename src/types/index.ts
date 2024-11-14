export interface CharacterData {
  char: string;
  charColor: string;
}

export interface WordData {
  word: string;
  indexFrom: number;
}

export interface Data {
  words: WordData[];
  characters: CharacterData[];
  cursorPosition: number;
}

export interface Statistics {
  round: number;
  wpm: number;
  accuracy: number;
}

export interface Quote {
  content: string;
  author: string;
}
