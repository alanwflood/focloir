import { parse } from "https://deno.land/std/flags/mod.ts";
import { Trie } from "./trie.ts";

const args = parse(Deno.args);
const filename = String(args._[0]);
const searchTerm = String(args._[1]).toLowerCase();

const decoder = new TextDecoder();
const text = decoder.decode(Deno.readFileSync(filename));
const words = text
  .replace(/\n/, " ")
  .split(" ")
  .map((str) => str.replace(/[^0-9a-z]/gi, "").toLowerCase());

const trie = new Trie();
trie.insert(words);
console.log(trie.search(searchTerm));
