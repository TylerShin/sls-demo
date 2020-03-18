const STOP_WORDS = [
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "if",
  "in",
  "into",
  "is",
  "it",
  "no",
  "of",
  "on",
  "or",
  "such",
  "that",
  "the",
  "their",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "was",
  "will",
  "with"
];

export function getWordsArraySplitBySpaceWithoutStopWords(text: string) {
  return text
    .trim()
    .split(" ")
    .filter(word => !STOP_WORDS.includes(word))
    .map(word => word.trim());
}
