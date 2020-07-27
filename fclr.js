// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("https://deno.land/std/_util/assert", [], function (exports_1, context_1) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_1 && context_1.id;
    function assert(expr, msg = "") {
        if (!expr) {
            throw new DenoStdInternalError(msg);
        }
    }
    exports_1("assert", assert);
    return {
        setters: [],
        execute: function () {
            DenoStdInternalError = class DenoStdInternalError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "DenoStdInternalError";
                }
            };
            exports_1("DenoStdInternalError", DenoStdInternalError);
        }
    };
});
System.register("https://deno.land/std/flags/mod", ["https://deno.land/std/_util/assert"], function (exports_2, context_2) {
    "use strict";
    var assert_ts_1;
    var __moduleName = context_2 && context_2.id;
    function get(obj, key) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return obj[key];
        }
    }
    function getForce(obj, key) {
        const v = get(obj, key);
        assert_ts_1.assert(v != null);
        return v;
    }
    function isNumber(x) {
        if (typeof x === "number")
            return true;
        if (/^0x[0-9a-f]+$/i.test(String(x)))
            return true;
        return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
    }
    function hasKey(obj, keys) {
        let o = obj;
        keys.slice(0, -1).forEach((key) => {
            o = (get(o, key) ?? {});
        });
        const key = keys[keys.length - 1];
        return key in o;
    }
    function parse(args, { "--": doubleDash = false, alias = {}, boolean = false, default: defaults = {}, stopEarly = false, string = [], unknown = (i) => i, } = {}) {
        const flags = {
            bools: {},
            strings: {},
            unknownFn: unknown,
            allBools: false,
        };
        if (boolean !== undefined) {
            if (typeof boolean === "boolean") {
                flags.allBools = !!boolean;
            }
            else {
                const booleanArgs = typeof boolean === "string" ? [boolean] : boolean;
                for (const key of booleanArgs.filter(Boolean)) {
                    flags.bools[key] = true;
                }
            }
        }
        const aliases = {};
        if (alias !== undefined) {
            for (const key in alias) {
                const val = getForce(alias, key);
                if (typeof val === "string") {
                    aliases[key] = [val];
                }
                else {
                    aliases[key] = val;
                }
                for (const alias of getForce(aliases, key)) {
                    aliases[alias] = [key].concat(aliases[key].filter((y) => alias !== y));
                }
            }
        }
        if (string !== undefined) {
            const stringArgs = typeof string === "string" ? [string] : string;
            for (const key of stringArgs.filter(Boolean)) {
                flags.strings[key] = true;
                const alias = get(aliases, key);
                if (alias) {
                    for (const al of alias) {
                        flags.strings[al] = true;
                    }
                }
            }
        }
        const argv = { _: [] };
        function argDefined(key, arg) {
            return ((flags.allBools && /^--[^=]+$/.test(arg)) ||
                get(flags.bools, key) ||
                !!get(flags.strings, key) ||
                !!get(aliases, key));
        }
        function setKey(obj, keys, value) {
            let o = obj;
            keys.slice(0, -1).forEach(function (key) {
                if (get(o, key) === undefined) {
                    o[key] = {};
                }
                o = get(o, key);
            });
            const key = keys[keys.length - 1];
            if (get(o, key) === undefined ||
                get(flags.bools, key) ||
                typeof get(o, key) === "boolean") {
                o[key] = value;
            }
            else if (Array.isArray(get(o, key))) {
                o[key].push(value);
            }
            else {
                o[key] = [get(o, key), value];
            }
        }
        function setArg(key, val, arg = undefined) {
            if (arg && flags.unknownFn && !argDefined(key, arg)) {
                if (flags.unknownFn(arg, key, val) === false)
                    return;
            }
            const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
            setKey(argv, key.split("."), value);
            const alias = get(aliases, key);
            if (alias) {
                for (const x of alias) {
                    setKey(argv, x.split("."), value);
                }
            }
        }
        function aliasIsBoolean(key) {
            return getForce(aliases, key).some((x) => typeof get(flags.bools, x) === "boolean");
        }
        for (const key of Object.keys(flags.bools)) {
            setArg(key, defaults[key] === undefined ? false : defaults[key]);
        }
        let notFlags = [];
        if (args.includes("--")) {
            notFlags = args.slice(args.indexOf("--") + 1);
            args = args.slice(0, args.indexOf("--"));
        }
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (/^--.+=/.test(arg)) {
                const m = arg.match(/^--([^=]+)=(.*)$/s);
                assert_ts_1.assert(m != null);
                const [, key, value] = m;
                if (flags.bools[key]) {
                    const booleanValue = value !== "false";
                    setArg(key, booleanValue, arg);
                }
                else {
                    setArg(key, value, arg);
                }
            }
            else if (/^--no-.+/.test(arg)) {
                const m = arg.match(/^--no-(.+)/);
                assert_ts_1.assert(m != null);
                setArg(m[1], false, arg);
            }
            else if (/^--.+/.test(arg)) {
                const m = arg.match(/^--(.+)/);
                assert_ts_1.assert(m != null);
                const [, key] = m;
                const next = args[i + 1];
                if (next !== undefined &&
                    !/^-/.test(next) &&
                    !get(flags.bools, key) &&
                    !flags.allBools &&
                    (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                    setArg(key, next, arg);
                    i++;
                }
                else if (/^(true|false)$/.test(next)) {
                    setArg(key, next === "true", arg);
                    i++;
                }
                else {
                    setArg(key, get(flags.strings, key) ? "" : true, arg);
                }
            }
            else if (/^-[^-]+/.test(arg)) {
                const letters = arg.slice(1, -1).split("");
                let broken = false;
                for (let j = 0; j < letters.length; j++) {
                    const next = arg.slice(j + 2);
                    if (next === "-") {
                        setArg(letters[j], next, arg);
                        continue;
                    }
                    if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                        setArg(letters[j], next.split("=")[1], arg);
                        broken = true;
                        break;
                    }
                    if (/[A-Za-z]/.test(letters[j]) &&
                        /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                        setArg(letters[j], next, arg);
                        broken = true;
                        break;
                    }
                    if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                        setArg(letters[j], arg.slice(j + 2), arg);
                        broken = true;
                        break;
                    }
                    else {
                        setArg(letters[j], get(flags.strings, letters[j]) ? "" : true, arg);
                    }
                }
                const [key] = arg.slice(-1);
                if (!broken && key !== "-") {
                    if (args[i + 1] &&
                        !/^(-|--)[^-]/.test(args[i + 1]) &&
                        !get(flags.bools, key) &&
                        (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                        setArg(key, args[i + 1], arg);
                        i++;
                    }
                    else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
                        setArg(key, args[i + 1] === "true", arg);
                        i++;
                    }
                    else {
                        setArg(key, get(flags.strings, key) ? "" : true, arg);
                    }
                }
            }
            else {
                if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                    argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
                }
                if (stopEarly) {
                    argv._.push(...args.slice(i + 1));
                    break;
                }
            }
        }
        for (const key of Object.keys(defaults)) {
            if (!hasKey(argv, key.split("."))) {
                setKey(argv, key.split("."), defaults[key]);
                if (aliases[key]) {
                    for (const x of aliases[key]) {
                        setKey(argv, x.split("."), defaults[key]);
                    }
                }
            }
        }
        if (doubleDash) {
            argv["--"] = [];
            for (const key of notFlags) {
                argv["--"].push(key);
            }
        }
        else {
            for (const key of notFlags) {
                argv._.push(key);
            }
        }
        return argv;
    }
    exports_2("parse", parse);
    return {
        setters: [
            function (assert_ts_1_1) {
                assert_ts_1 = assert_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/alan/Sites/Personal/focloir/src/trie", [], function (exports_3, context_3) {
    "use strict";
    var TrieNode, SearchResponse, Trie;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            TrieNode = class TrieNode {
                constructor(word) {
                    this.word = word;
                    this.children = new Map();
                }
            };
            (function (SearchResponse) {
                SearchResponse[SearchResponse["NOT_FOUND"] = 0] = "NOT_FOUND";
                SearchResponse[SearchResponse["FOUND"] = 1] = "FOUND";
                SearchResponse[SearchResponse["FOUND_SIMILAR"] = 2] = "FOUND_SIMILAR";
            })(SearchResponse || (SearchResponse = {}));
            exports_3("SearchResponse", SearchResponse);
            Trie = class Trie {
                constructor() {
                    this.rootNode = new TrieNode();
                }
                insertWord(word) {
                    let currentNode = this.rootNode;
                    word.split("").forEach((letter) => {
                        let child = currentNode.children.get(letter);
                        if (child === undefined) {
                            child = new TrieNode(word);
                            currentNode.children.set(letter, child);
                        }
                        currentNode = child;
                    });
                    if (currentNode.word !== word)
                        currentNode.word = word;
                }
                insert(words) {
                    Array.isArray(words)
                        ? words.forEach((word) => this.insertWord(word))
                        : this.insertWord(words);
                }
                searchRecursive(node, letter, word, previousRow, results, maxCost) {
                    const previousColumn = word.length;
                    const currentRow = [previousRow[0] + 1];
                    for (let column = 1; column <= previousColumn; column++) {
                        let replaceCost;
                        const insertCost = currentRow[column - 1] + 1;
                        const deleteCost = previousRow[column] + 1;
                        if (word[column - 1] !== letter) {
                            replaceCost = previousRow[column - 1] + 1;
                        }
                        else {
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
                search(word, maxCost = 2) {
                    const rows = [...Array(word.length + 1).keys()];
                    const results = new Set();
                    this.rootNode.children.forEach((node, letter) => {
                        this.searchRecursive(node, letter, word, rows, results, maxCost);
                    });
                    if (results.size === 0) {
                        return {
                            response: SearchResponse.NOT_FOUND,
                            payload: "Word not found",
                        };
                    }
                    const result = results.values().next().value;
                    return result === word
                        ? {
                            response: SearchResponse.FOUND,
                            payload: "Correct",
                        }
                        : {
                            response: SearchResponse.FOUND_SIMILAR,
                            payload: result,
                        };
                }
            };
            exports_3("Trie", Trie);
        }
    };
});
System.register("https://deno.land/std/fmt/colors", [], function (exports_4, context_4) {
    "use strict";
    var noColor, enabled, ANSI_PATTERN;
    var __moduleName = context_4 && context_4.id;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    exports_4("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
        return enabled;
    }
    exports_4("getColorEnabled", getColorEnabled);
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
        };
    }
    function run(str, code) {
        return enabled
            ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
            : str;
    }
    function reset(str) {
        return run(str, code([0], 0));
    }
    exports_4("reset", reset);
    function bold(str) {
        return run(str, code([1], 22));
    }
    exports_4("bold", bold);
    function dim(str) {
        return run(str, code([2], 22));
    }
    exports_4("dim", dim);
    function italic(str) {
        return run(str, code([3], 23));
    }
    exports_4("italic", italic);
    function underline(str) {
        return run(str, code([4], 24));
    }
    exports_4("underline", underline);
    function inverse(str) {
        return run(str, code([7], 27));
    }
    exports_4("inverse", inverse);
    function hidden(str) {
        return run(str, code([8], 28));
    }
    exports_4("hidden", hidden);
    function strikethrough(str) {
        return run(str, code([9], 29));
    }
    exports_4("strikethrough", strikethrough);
    function black(str) {
        return run(str, code([30], 39));
    }
    exports_4("black", black);
    function red(str) {
        return run(str, code([31], 39));
    }
    exports_4("red", red);
    function green(str) {
        return run(str, code([32], 39));
    }
    exports_4("green", green);
    function yellow(str) {
        return run(str, code([33], 39));
    }
    exports_4("yellow", yellow);
    function blue(str) {
        return run(str, code([34], 39));
    }
    exports_4("blue", blue);
    function magenta(str) {
        return run(str, code([35], 39));
    }
    exports_4("magenta", magenta);
    function cyan(str) {
        return run(str, code([36], 39));
    }
    exports_4("cyan", cyan);
    function white(str) {
        return run(str, code([37], 39));
    }
    exports_4("white", white);
    function gray(str) {
        return run(str, code([90], 39));
    }
    exports_4("gray", gray);
    function bgBlack(str) {
        return run(str, code([40], 49));
    }
    exports_4("bgBlack", bgBlack);
    function bgRed(str) {
        return run(str, code([41], 49));
    }
    exports_4("bgRed", bgRed);
    function bgGreen(str) {
        return run(str, code([42], 49));
    }
    exports_4("bgGreen", bgGreen);
    function bgYellow(str) {
        return run(str, code([43], 49));
    }
    exports_4("bgYellow", bgYellow);
    function bgBlue(str) {
        return run(str, code([44], 49));
    }
    exports_4("bgBlue", bgBlue);
    function bgMagenta(str) {
        return run(str, code([45], 49));
    }
    exports_4("bgMagenta", bgMagenta);
    function bgCyan(str) {
        return run(str, code([46], 49));
    }
    exports_4("bgCyan", bgCyan);
    function bgWhite(str) {
        return run(str, code([47], 49));
    }
    exports_4("bgWhite", bgWhite);
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    function rgb8(str, color) {
        return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_4("rgb8", rgb8);
    function bgRgb8(str, color) {
        return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_4("bgRgb8", bgRgb8);
    function rgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([38, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 39));
        }
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    exports_4("rgb24", rgb24);
    function bgRgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([48, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 49));
        }
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    exports_4("bgRgb24", bgRgb24);
    function stripColor(string) {
        return string.replace(ANSI_PATTERN, "");
    }
    exports_4("stripColor", stripColor);
    return {
        setters: [],
        execute: function () {
            noColor = globalThis.Deno?.noColor ?? true;
            enabled = !noColor;
            ANSI_PATTERN = new RegExp([
                "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
                "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
            ].join("|"), "g");
        }
    };
});
System.register("file:///home/alan/Sites/Personal/focloir/src/mod", ["https://deno.land/std/flags/mod", "file:///home/alan/Sites/Personal/focloir/src/trie", "https://deno.land/std/fmt/colors"], function (exports_5, context_5) {
    "use strict";
    var mod_ts_1, trie_ts_1, colors_ts_1, args;
    var __moduleName = context_5 && context_5.id;
    function displayHelpText() {
        console.log("Usage: fclr [-h|--help] [file] [searchterm]");
        console.log();
        console.log("Examples:");
        console.log();
        console.log("// search for word file:\n   fclr dictionary.txt catnip");
    }
    return {
        setters: [
            function (mod_ts_1_1) {
                mod_ts_1 = mod_ts_1_1;
            },
            function (trie_ts_1_1) {
                trie_ts_1 = trie_ts_1_1;
            },
            function (colors_ts_1_1) {
                colors_ts_1 = colors_ts_1_1;
            }
        ],
        execute: function () {
            args = Deno.args;
            (function main() {
                const parsedArgs = mod_ts_1.parse(args);
                if (parsedArgs.h || parsedArgs.help || parsedArgs._.length === 0) {
                    return displayHelpText();
                }
                if (parsedArgs._.length > 0 && parsedArgs._.length < 2) {
                    console.log(colors_ts_1.red("Error - Missing Search Term"));
                    return displayHelpText();
                }
                const filename = String(parsedArgs._[0]);
                const searchTerm = String(parsedArgs._[1]).toLowerCase();
                const decoder = new TextDecoder();
                const text = decoder.decode(Deno.readFileSync(filename));
                const words = text
                    .replace(/\n/, " ")
                    .split(" ")
                    .map((str) => str.replace(/[^0-9a-z]/gi, "").toLowerCase());
                const trie = new trie_ts_1.Trie();
                trie.insert(words);
                const result = trie.search(searchTerm);
                switch (result.response) {
                    case trie_ts_1.SearchResponse.FOUND:
                        console.log(colors_ts_1.green(result.payload));
                    case trie_ts_1.SearchResponse.FOUND_SIMILAR:
                        console.log(colors_ts_1.blue(result.payload));
                    case trie_ts_1.SearchResponse.NOT_FOUND:
                        console.log(colors_ts_1.red(result.payload));
                }
            })();
        }
    };
});

__instantiate("file:///home/alan/Sites/Personal/focloir/src/mod", false);
