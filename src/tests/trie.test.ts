import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Trie, SearchResponse as res } from "../trie.ts";

const words = [
  "car",
  "dog",
  "dot",
  "first",
  "fork",
  "fort",
  "human",
  "playful",
  "python",
  "sweet",
  "very",
  "wonderful",
];
const t = new Trie();
t.insert(words);

Deno.test({
  name: "Trie Search",
  fn(): void {
    let stub = t.search("car");
    assertEquals("Correct", stub.payload);
    assertEquals(res.FOUND, stub.response);

    stub = t.search("cir");
    assertEquals("car", stub.payload);
    assertEquals(res.FOUND_SIMILAR, stub.response);

    stub = t.search("dog");
    assertEquals("Correct", stub.payload);
    assertEquals(res.FOUND, stub.response);

    stub = t.search("human");
    assertEquals("Correct", stub.payload);
    assertEquals(res.FOUND, stub.response);

    stub = t.search("veey");
    assertEquals("very", stub.payload);
    assertEquals(res.FOUND_SIMILAR, stub.response);

    stub = t.search("playful");
    assertEquals("Correct", stub.payload);
    assertEquals(res.FOUND, stub.response);

    stub = t.search("playfil");
    assertEquals("playful", stub.payload);
    assertEquals(res.FOUND_SIMILAR, stub.response);

    stub = t.search("notarilword");
    assertEquals("Word not found", stub.payload);
    assertEquals(res.NOT_FOUND, stub.response);
  },
});
