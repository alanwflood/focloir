import { parse } from "https://deno.land/std/flags/mod.ts";
import { Trie, SearchResponse as res } from "./trie.ts";
import { red, green, blue } from "https://deno.land/std/fmt/colors.ts";
const { args } = Deno;

function displayHelpText(): void {
  console.log(
    "Usage: fclr [-h|--help] [file] [searchterm] [edit distance (default: 2)]"
  );
  console.log();
  console.log("Examples:");
  console.log();
  console.log("// search for word in file:\n   fclr dictionary.txt catnip");
  console.log();
  console.log(
    "// search for word with edit distance of 3:\n   fclr dictionary.txt playfil 3"
  );
}

(function main(): void {
  const parsedArgs = parse(args);

  if (parsedArgs.h || parsedArgs.help || parsedArgs._.length === 0) {
    return displayHelpText();
  }

  if (parsedArgs._.length === 1) {
    console.log(red("Error - Missing Search Term"));
    return displayHelpText();
  }

  const filename = String(parsedArgs._[0]);
  const searchTerm = String(parsedArgs._[1]).toLowerCase();
  const maxCost = parsedArgs._[2] !== undefined ? Number(parsedArgs._[2]) : 2;

  const decoder = new TextDecoder();
  const text = decoder.decode(Deno.readFileSync(filename));
  const words = text
    .replace(/\n/g, " ")
    .split(" ")
    .map((str) => str.replace(/[^0-9a-z]/gi, "").toLowerCase());

  const trie = new Trie();
  trie.insert(words);
  const result = trie.search(searchTerm, maxCost);

  switch (result.response) {
    case res.FOUND:
      return console.log(green(result.payload));
    case res.FOUND_SIMILAR:
      return console.log(blue(result.payload));
    case res.NOT_FOUND:
      return console.log(red(result.payload));
  }
})();
