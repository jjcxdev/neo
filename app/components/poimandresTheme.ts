import type { CSSProperties } from "react";

type PrismTheme = { [key: string]: CSSProperties };

export const poimandresTheme: PrismTheme = {
  'code[class*="language-"]': {
    color: "#e4f0fb",
    background: "none",
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: 1.5,
    tabSize: 4,
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#e4f0fb",
    background: "#1b1e28",
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: 1.5,
    tabSize: 4,
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    padding: "1em",
    margin: "0.5em 0",
    overflow: "auto",
  },
  comment: {
    color: "#636da6",
    fontStyle: "italic",
  },
  prolog: {
    color: "#636da6",
  },
  doctype: {
    color: "#636da6",
  },
  cdata: {
    color: "#636da6",
  },
  punctuation: {
    color: "#81A1C1",
  },
  namespace: {
    opacity: 0.7,
  },
  property: {
    color: "#89DDFF",
  },
  tag: {
    color: "#89DDFF",
  },
  boolean: {
    color: "#ADD7FF",
  },
  number: {
    color: "#ADD7FF",
  },
  constant: {
    color: "#ADD7FF",
  },
  symbol: {
    color: "#ADD7FF",
  },
  deleted: {
    color: "#ADD7FF",
  },
  selector: {
    color: "#A6ACCD",
  },
  "attr-name": {
    color: "#A6ACCD",
  },
  string: {
    color: "#5DE4C7",
  },
  char: {
    color: "#5DE4C7",
  },
  builtin: {
    color: "#5DE4C7",
  },
  inserted: {
    color: "#5DE4C7",
  },
  operator: {
    color: "#89DDFF",
  },
  entity: {
    color: "#89DDFF",
    cursor: "help",
  },
  url: {
    color: "#89DDFF",
  },
  ".language-css .token.string": {
    color: "#89DDFF",
  },
  ".style .token.string": {
    color: "#89DDFF",
  },
  variable: {
    color: "#ADD7FF",
  },
  atrule: {
    color: "#89DDFF",
  },
  "attr-value": {
    color: "#89DDFF",
  },
  function: {
    color: "#ADD7FF",
  },
  "class-name": {
    color: "#ADD7FF",
  },
  keyword: {
    color: "#89DDFF",
  },
  regex: {
    color: "#5DE4C7",
  },
  important: {
    color: "#89DDFF",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
};
