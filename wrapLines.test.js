import { test } from "node:test";
import assert from "node:assert/strict";
import { wrapLines } from "./wrapLines.js";

// One unit per character, so widths are easy to reason about
const measure = s => s.length;

test("short text stays on one line", () =>
{
    assert.deepEqual(wrapLines("GET 404", measure, 10), ["GET 404"]);
});

test("words wrap when the line is too wide", () =>
{
    assert.deepEqual(wrapLines("one two three", measure, 8), ["one two", "three"]);
});

test("a newline always starts a new line", () =>
{
    assert.deepEqual(wrapLines("GET\nheaders", measure, 20), ["GET", "headers"]);
});

test("a newline next to a wrapped line doesn't merge lines", () =>
{
    // The bug: "GET\n2nd" was one word, so "2nd" and "host" were drawn on the same row
    assert.deepEqual(wrapLines("GET\n2nd host", measure, 5), ["GET", "2nd", "host"]);
});

test("CRLF, blank lines and a word wider than the line", () =>
{
    assert.deepEqual(wrapLines("a\r\n\r\nb", measure, 5), ["a", "", "b"]);
    assert.deepEqual(wrapLines("abcdefgh ij", measure, 5), ["abcdefgh", "ij"]);
});
