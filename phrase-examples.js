import { solve } from './index.js';

const take5 = (a) => a.slice(0, 5);

const puzzles = [
  ['t__g_ __r___t', 'rstlnempcag'],
  ['_ou _ll _r_ gr___ __o_l_', 'd'],
  ['_ _e_u_i_u_ __y ou_si_e', ''],
  ['_o__ ___ine__ _o__and _ente_', ''],
  ['__e _____er _n __e r_e', ''],
  ['_s ___d l_c_ ___ld h__e it', ''],
  ['__au__ is in ___ ___ _f ___ ____ld_r', 'wxp'],
];

for (const [puzzle, exclude] of puzzles) {
  solve(puzzle, exclude).then((results) => {
    console.log(puzzle);
    console.log(take5(results));
  });
}
