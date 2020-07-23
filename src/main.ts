// import { readFileStr } from "https://deno.land/std/fs/mod.ts";
// import { red, green, blue, bold } from "https://deno.land/std/fmt/colors.ts";

class TrieNode {
  key: string | undefined;
  parent: TrieNode | undefined;
  children: Map<string, TrieNode>;
  isEndOfWord: Boolean;

  constructor(key: string, parent: TrieNode, isEndOfWord = false) {
    this.key = key;
    this.parent = parent;
    this.children = new Map();
    this.isEndOfWord = isEndOfWord;
  }
}

interface TrieInterface {
  editCount: number;
  insert(word: string): void;
  contains(word: string): boolean;
  similar(word: string): string;
}

class Trie implements TrieInterface {
  private rootNode: TrieNode = {
    key: undefined,
    parent: undefined,
    children: new Map(),
    isEndOfWord: false
  };

  insert(word: string) {
    let currentNode: TrieNode = this.rootNode;

    word.split("").forEach((letter: string, index) => {
      let nextNode: TrieNode | undefined = currentNode.children.get(letter);

      const isLastLetter = index === word.length - 1;
      if (isLastLetter || nextNode === undefined) {
        if (nextNode === undefined) nextNode = new TrieNode(letter, currentNode);
        if (isLastLetter) nextNode.isEndOfWord = true;
        currentNode.children.set(letter, nextNode);
      }

      currentNode = nextNode;
    });
  }

  contains(word: string) {
    let currentNode: TrieNode = this.rootNode;

    word.split("").forEach((letter: string) => {
      const nextNode: TrieNode | undefined = currentNode.children.get(letter);

      if (nextNode !== undefined) {
        currentNode = nextNode;
      } else {
        return false;
      }
    });
    return true;
  }

  private searchRecursive(
    node: TrieNode,
    letter: string,
    word: string,
    previousRow: ReadonlyArray<number>,
    result: string[],
    maxCost: number
  ) {
    const previousColumn = word.length;
    const currentRow = [previousRow[0] + 1];

    for (let column = 1; column <= previousColumn; column++) {
      let replaceCost: number;
      let insertCost = currentRow[column - 1] + 1;
      let deleteCost = previousRow[column] + 1;
      if (word[column - 1] !== letter) {
        replaceCost = previousRow[ column - 1 ] + 1;
      } else {
        replaceCost = previousRow[ column - 1 ];
      }

      currentRow[column] = Math.min(
        deleteCost,
        insertCost,
        replaceCost
      );

    return currentRow[-1]
    }
  }

  search(word: string, maxCost: number = 2) {
    const currentRow = [...Array(word.length + 1).keys()];
    const results: string[] = [];

    this.rootNode.children.forEach((trieNode: TrieNode, letter: String) => {
      this.searchRecursive(trieNode, letter, word, currentRow, results, maxCost)
    })
    
    let currentNode: TrieNode = this.rootNode;

    word.split("").forEach((letter: string) => {
      const nextNode: TrieNode | undefined = currentNode.children.get(letter);

      if (nextNode !== undefined) {
        currentNode = nextNode;
      } else {
        ;
      }
    });
    return true;
  }

  }
}
