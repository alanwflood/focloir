import { blue, red, green } from "https://deno.land/std/fmt/colors.ts";

/**
 * A node within the Trie, containing the finished word if it's the final letter in a sequence and additional letters that can come after it.
 *
 * @example new TrieNode("batman")
 */
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

/**
 * `Tree-based data structure` used to hold associative arrays of keys linking nodes together.
 *
 * This implementation is used as a dictionary lookup for words, linking letters together as nodes.
 *
 * @see {@link https://en.wikipedia.org/wiki/Trie|Trie on Wikipedia}
 */
export class Trie implements TrieInterface {
  private rootNode: TrieNode = new TrieNode();

  /**
   * Seperate the given `word` into letters and insert it into the Trie data structure as a series of linked nodes.
   */
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

  /**
   * Insert a single word, or array of words into the Trie
   */
  insert(words: string | string[]): void {
    Array.isArray(words)
      ? words.forEach((word) => this.insertWord(word))
      : this.insertWord(words);
  }

  /**
   * Using the Levenshtein algorithm, recursively check edit distances between words to find a similar one in the Trie.
   *
   * @see {@Link https://en.wikipedia.org/wiki/Levenshtein_distance|Levenshtein Distance on Wikipedia}
   */
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

  /**
   * Searchs previously inserted words for a word similar to the `word` argument
   *
   * @example Trie.search("batman", 2);
   *
   * @param {string} word - searchs the Trie for this word or something similar
   * @param {number} maxCost - determines how many edits can be made to find the `word`
   */
  search(word: string, maxCost: number = 2) {
    const rows = [...Array(word.length + 1).keys()];
    const results: Set<string> = new Set();

    this.rootNode.children.forEach((node, letter) => {
      this.searchRecursive(node, letter, word, rows, results, maxCost);
    });

    // As per requirements, return "Word not found" if results are 0
    if (results.size === 0) return red("Word not found");

    const result = results.values().next().value;

    // As per requirements, return "Correct" if result is equal to the `word` argument
    return result === word ? green("Correct") : blue(result);
  }
}
