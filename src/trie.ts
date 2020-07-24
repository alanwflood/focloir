import { blue, red, green } from "https://deno.land/std/fmt/colors.ts";

class TrieNode {
  word: string | undefined;
  children: Map<string, TrieNode>;

  constructor(word?: string) {
    this.word = word;
    this.children = new Map();
  }
}

interface TrieInterface {
  insert(word: string): void;
  contains(word: string): boolean;
  search(word: string, maxCost: number): string;
}

export class Trie implements TrieInterface {
  private rootNode: TrieNode = new TrieNode();

  private insertWord(word: string): void {
    let currentNode: TrieNode = this.rootNode;

    word.split("").forEach((letter) => {
      let child = currentNode.children.get(letter);

      if (child === undefined) {
        child = new TrieNode(word);
        currentNode.children.set(letter, child);
      }

      currentNode = child;
    });

    if (currentNode.word !== word) currentNode.word = word;
  }

  insert(words: string | string[]): void {
    Array.isArray(words)
      ? words.forEach((word) => this.insertWord(word))
      : this.insertWord(words);
  }

  contains(word: string) {
    let currentNode: TrieNode = this.rootNode;

    for (let i = 0; i < word.length; i++) {
      let letter = word.charAt(i);
      const nextNode = currentNode.children.get(letter);
      if (nextNode !== undefined) currentNode = nextNode;
      else return false;
    }
    return true;
  }

  private searchRecursive(
    node: TrieNode,
    letter: string,
    word: string,
    previousRow: ReadonlyArray<number>,
    results: Set<string>,
    maxCost: number
  ) {
    const previousColumn = word.length;
    const currentRow = [previousRow[0] + 1];

    for (let column = 1; column <= previousColumn; column++) {
      let replaceCost: number;
      const insertCost = currentRow[column - 1] + 1;
      const deleteCost = previousRow[column] + 1;

      if (word[column - 1] !== letter) {
        replaceCost = previousRow[column - 1] + 1;
      } else {
        replaceCost = previousRow[column - 1];
      }

      currentRow[column] = Math.min(deleteCost, insertCost, replaceCost);
    }

    if (currentRow[previousColumn] <= maxCost && node.word !== undefined) {
      results.add(node.word);
    }

    if (Math.min(...currentRow) <= maxCost) {
      node.children.forEach((node, letter) => {
        this.searchRecursive(node, letter, word, currentRow, results, maxCost);
      });
    }
  }

  search(word: string, maxCost: number = 2) {
    const currentRow = [...Array(word.length + 1).keys()];
    const results: Set<string> = new Set();

    this.rootNode.children.forEach((node, letter) => {
      this.searchRecursive(node, letter, word, currentRow, results, maxCost);
    });

    return results.size > 0
      ? `Looking for: ${blue(word)}\nFound: ${green(
          results.values().next().value
        )}`
      : `Could not find word similar to: ${red(word)}`;
  }
}
