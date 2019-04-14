const _ = require('lodash');
const { solve } = require('./');

solve('t__g_ __r___t', 'rstlnempcag')
.then(results => {
  console.log(`t__g_ __r___t`);
  console.log(_.take(results, 5));
})

solve('_ou _ll _r_ gr___ __o_l_' , 'd')
.then(results => {
  console.log(`_ou _ll _r_ _r___ __o_l_`);
  console.log(_.take(results, 5));
});

solve('_ _e_u_i_u_ __y ou_si_e')
.then(results => {
  console.log(`_ _e_u_i_u_ __y ou_si_e`);
  console.log(_.take(results, 5));
});

solve('_o__ ___ine__ _o__and _ente_')
.then(results => {
  console.log(`_o__ ___ine__ _o__and _ente_`);
  console.log(_.take(results, 5));
});

solve('__e _____er _n __e r_e')
.then(results => {
  console.log(`__e _____er _n __e r_e`);
  console.log(_.take(results, 5));
});
//

solve('_s ___d l_c_ ___ld h__e it' )
.then(results => {
  console.log(`_s ___d l_c_ ___ld h__e it`);
  console.log(_.take(results, 5));
});

solve('__au__ is in ___ ___ _f ___ ____ld_r' , 'wxp')
.then(results => {
  console.log(`__au__ is in ___ ___ _f ___ ____ld_r`);
  console.log(_.take(results, 5));
});


