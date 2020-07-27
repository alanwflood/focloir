# Focloir

Focloir (Pronounced Folk-Lore) is a Trie based word-lookup CLI built with [Deno](https://deno.land/) and [Typescript](https://www.typescriptlang.org/).

## Compiling

To compile Focloir first [install Deno locally](https://deno.land/#installation).

After this simply bundle the tool into a single fclr.js file by running `deno bundle src/mod.ts fclr.js` from the root of the project directory.

## Running

Focloir can be run with the command `deno run --allow-read fclr.js`

Running the above will explain the tools usages as following:

```
Usage: fclr [-h|--help] [file] [searchterm] [edit distance (default: 2)]

Examples:

// search for word in file:
   fclr dictionary.txt catnip

// search for word with edit distance of 3:
   fclr dictionary.txt playfil 3
```

There is an additional binary file `./fclr` which aliases the above deno command


## Tests

Focloir uses Deno's own test suite, just run `deno test`

## About

Focloir uses a [trie](https://en.wikipedia.org/wiki/Trie) based data-structure alongside the [Levenshtein distance algorithm](https://en.wikipedia.org/wiki/Levenshtein_distance) to perform edit distance based lookups.

## What's up with the name?

Focloir is Gaelic for dictionary. :smiley:
