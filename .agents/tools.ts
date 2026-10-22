// Phrase Solver's tools for the homelab MCP server (~/homelab/mcp): Wheel of Fortune style puzzles.
import type { Http, Kit } from "../../mcp/kit";

export default (k: Kit) => {
  const z = k.z;
  const solve = async (http: Http, puzzle: string, exclude: string): Promise<string[]> =>
    (await http.get("/solve", { puzzle, exclude })).solutions;

  return k.app({
    name: "phrase-solver",
    title: "Phrase Solver",
    description:
      "Solves Wheel of Fortune style word puzzles (Phrase Solver) from a pattern of known letters and blanks, plus letters known not to be in it. A partly filled-in phrase, a hangman pattern or a Wheel of Fortune board.",
    url: "http://127.0.0.1:3002",
    reads: {
      solve: k.tool({
        title: "Solve a puzzle",
        description:
          "Fill-ins for a puzzle, ranked by how common each word is in English text. Returns phrases (up to 30, each word ranked on its own, so not in order of how much sense the phrase makes) and, for each word, its likeliest fill-ins (up to 25). A blank never takes a letter shown in the puzzle or excluded, as on the show. A word with no match is ?.",
        input: {
          puzzle: z
            .string()
            .min(1)
            .describe(
              "Known letters, _ for each blank, a space between words (wh__l _f f_rt_n_). Other characters are dropped, so don't is dont. At most 24 words of 24 letters",
            ),
          exclude: z.string().default("").describe("Letters known not to be in the puzzle (rstle)"),
        },
        async run(a, http) {
          const puzzle = a.puzzle
            .toLowerCase()
            .replace(/[^a-z_\s]/g, "")
            .trim()
            .replace(/\s+/g, " ");
          if (!puzzle) throw new Error("The puzzle has no letters or blanks.");
          const exclude = a.exclude.toLowerCase().replace(/[^a-z]/g, "");
          const shown = [...new Set(puzzle.replace(/[^a-z]/g, ""))].join("");
          const words = puzzle.split(" ");
          const [phrases, each] = await Promise.all([
            solve(http, puzzle, exclude),
            // Each word alone, with the rest of the board's letters excluded as the whole puzzle would.
            Promise.all(words.map((w) => (w.includes("_") ? solve(http, w, exclude + shown) : [w]))),
          ]);
          return { phrases, words: words.map((pattern, i) => ({ pattern, options: each[i] })) };
        },
      }),
    },
  });
};
