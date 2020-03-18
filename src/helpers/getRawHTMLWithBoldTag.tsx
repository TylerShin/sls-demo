import { getWordsArraySplitBySpaceWithoutStopWords } from "./getWordsWithoutStopWords";

export function getRawHTMLWithBoldTag(content: string, highlightText: string) {
  const highlightWords = getWordsArraySplitBySpaceWithoutStopWords(
    highlightText
  );

  return content
    .split(" ")
    .map(word => word.trim())
    .map(contentWord => {
      const matchWord = highlightWords.find(highlightWord =>
        contentWord.toLowerCase().startsWith(highlightWord.toLowerCase())
      );
      if (matchWord) {
        return `<b>${contentWord.slice(
          0,
          matchWord.length
        )}</b>${contentWord.slice(matchWord.length) || ""}`;
      } else {
        return contentWord;
      }
    })
    .join(" ");
}
