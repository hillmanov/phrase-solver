import { expect, test } from "bun:test";
import { appTools } from "../../tools/test-kit";

const t = await appTools("phrase-solver");

test("solve: phrases and each word's fill-ins", async () => {
  const r = await t.read("solve", { puzzle: "wh__l _f f_rt_n_", exclude: "s" });
  expect(r.phrases[0]).toBe("wheel of fortune");
  expect(r.phrases.length).toBeLessThanOrEqual(30);
  expect(r.words.map((w: any) => w.pattern)).toEqual(["wh__l", "_f", "f_rt_n_"]);
  expect(r.words[0].options).toContain("wheel");
  expect(r.words[2].options).toContain("fortune");
});

test("solve: drops punctuation, keeps shown words, and never fills a blank with a shown or excluded letter", async () => {
  const r = await t.read("solve", { puzzle: "DON'T  ST_P  B_L__V_NG", exclude: "a" });
  expect(r.words.map((w: any) => w.pattern)).toEqual(["dont", "st_p", "b_l__v_ng"]);
  expect(r.words[0].options).toEqual(["dont"]);
  expect(r.words[2].options).toContain("believing");
  for (const o of r.words[1].options) expect(o[2]).not.toMatch(/[dontspblvga]/);
});

test("solve: a word with no match is ?, and an empty puzzle is turned down", async () => {
  expect((await t.read("solve", { puzzle: "zzqx_" })).phrases).toEqual(["?"]);
  await expect(t.read("solve", { puzzle: "!!!" })).rejects.toThrow("no letters");
});
