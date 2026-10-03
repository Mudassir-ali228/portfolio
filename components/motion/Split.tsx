import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Scribble } from "../art/Scribble";

/**
 * Splits text into masked words (and optionally characters) so each piece
 * can rise from behind its own mask. Rendered on the server, so the markup is
 * complete before any script runs.
 *
 * Character mode hides itself from assistive tech: give the parent an
 * aria-label. Word mode reads normally.
 */
export function Split({ text, by = "chars" }: { text: string; by?: "chars" | "words" }) {
  const words = text.split(" ");
  // `--i` is the piece's position in the whole string, for CSS stagger.
  let n = 0;
  const piece = (content: string, key: number) => (
    <span key={key} className="split-c" style={{ "--i": n++ } as CSSProperties}>
      {content}
    </span>
  );
  const body = words.map((word, i) => (
    <Fragment key={i}>
      <span className="split-w">
        {by === "chars" ? Array.from(word).map((ch, j) => piece(ch, j)) : piece(word, 0)}
      </span>
      {i < words.length - 1 ? " " : null}
    </Fragment>
  ));
  return by === "chars" ? <span aria-hidden="true">{body}</span> : <>{body}</>;
}

/**
 * Words that brighten one by one as the paragraph scrolls through. A phrase in
 * curly quotes is set in italic and gets a pen loop drawn round it.
 */
export function ScrubText({ text }: { text: string }) {
  const words = text.split(" ");
  const out: ReactNode[] = [];
  let quoted: string[] | null = null;

  words.forEach((word, i) => {
    const space = i < words.length - 1 ? " " : null;
    if (word.includes("\u201c")) quoted = [];
    if (quoted) {
      quoted.push(word);
      if (word.includes("\u201d")) {
        const phrase = quoted;
        out.push(
          <Fragment key={i}>
            <span className="relative whitespace-nowrap">
              {phrase.map((w, j) => (
                <Fragment key={j}>
                  <span className="scrub-w italic">{w}</span>
                  {j < phrase.length - 1 ? " " : null}
                </Fragment>
              ))}
              <Scribble kind="loop" seed={29} className="left-0 top-0 h-full w-full" />
            </span>
            {space}
          </Fragment>,
        );
        quoted = null;
      }
      return;
    }
    out.push(
      <Fragment key={i}>
        <span className="scrub-w">{word}</span>
        {space}
      </Fragment>,
    );
  });

  return <>{out}</>;
}
