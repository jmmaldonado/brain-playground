import{c as Y,a as x,d as He,f as w,s as _,t as X}from"../chunks/DjGUMVEO.js";import{i as $e}from"../chunks/Cw9VL3yu.js";import{o as Z}from"../chunks/DNpheoR9.js";import{f as q,o as ee,v as F,C as V,A as y,x as M,y as te,F as a,B as p,a8 as Ve,z as c,D as d}from"../chunks/8Rzht8bc.js";import{I as re,s as ae,e as je,i as ze,b as j}from"../chunks/C3Dv6SG7.js";import{i as H}from"../chunks/CxN0JJfg.js";import{t as Ne,s as Se}from"../chunks/DrI62OaI.js";import{S as P}from"../chunks/DFfcadVj.js";import{T as Ce}from"../chunks/D5dOeL5X.js";import{l as se,s as le}from"../chunks/B3Z62Ii7.js";import{p as Te}from"../chunks/B5XUwJUL.js";function Ie(v,f){const l=se(f,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.555.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M5 12h14"}],["path",{d:"m12 5 7 7-7 7"}]];re(v,le({name:"arrow-right"},()=>l,{get iconNode(){return r},children:(n,u)=>{var o=Y(),h=q(o);ae(h,f,"default",{}),x(n,o)},$$slots:{default:!0}}))}function Ae(v,f){const l=se(f,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.555.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m15 9-6 6"}],["path",{d:"m9 9 6 6"}]];re(v,le({name:"circle-x"},()=>l,{get iconNode(){return r},children:(n,u)=>{var o=Y(),h=q(o);ae(h,f,"default",{}),x(n,o)},$$slots:{default:!0}}))}const Oe=v=>{const f=["+","-","×"];v>2&&f.push("÷");const l=f[Math.floor(Math.random()*f.length)];let r=0,n=0,u=0;const o=10+v*5;switch(l){case"+":r=Math.floor(Math.random()*o)+1,n=Math.floor(Math.random()*o)+1,u=r+n;break;case"-":r=Math.floor(Math.random()*o)+1,n=Math.floor(Math.random()*r)+1,u=r-n;break;case"×":r=Math.floor(Math.random()*(o/2))+1,n=Math.floor(Math.random()*10)+1,u=r*n;break;case"÷":n=Math.floor(Math.random()*10)+1,u=Math.floor(Math.random()*10)+1,r=n*u;break}return{num1:r,num2:n,operator:l,result:u}},Be=(v,f)=>{let l=[];f===1?l=[3]:f===2?l=[1]:f===3?l=Math.random()>.5?[0]:[2]:f===4?l=[3,Math.random()>.5?0:2]:f>=5&&(l=[1,Math.random()>.5?0:2]);const r=[{value:v.num1,type:"number",isHidden:!1},{value:v.operator,type:"operator",isHidden:!1},{value:v.num2,type:"number",isHidden:!1},{value:v.result,type:"result",isHidden:!1}],n=[];l.forEach(o=>{r[o].isHidden=!0,n.push(r[o].value)});const u=2+Math.floor(f/2);for(let o=0;o<u;o++)if(r[l[0]].type==="operator"){const $=["+","-","×","÷"],m=$[Math.floor(Math.random()*$.length)];n.includes(m)||n.push(m)}else{let m=v.result+Math.floor(Math.random()*10)-5;m<0&&(m=Math.abs(m)+1),n.includes(m)||n.push(m)}for(let o=n.length-1;o>0;o--){const h=Math.floor(Math.random()*(o+1));[n[o],n[h]]=[n[h],n[o]]}return{puzzle:r,options:n}};var De=w('<div class="flex items-center gap-1 text-gray-500 text-xs"><!> <span> </span></div>'),Ee=w("<div><!></div>"),Fe=w("<button> </button>"),Pe=w('<span class="text-3xl sm:text-5xl font-bold text-gray-700"> </span>'),Re=w("<button> </button>"),Ge=w('<span class="text-3xl sm:text-5xl font-bold text-blue-500"> </span>'),Le=w("<button> </button>"),Ue=w('<span class="text-3xl sm:text-5xl font-bold text-gray-700"> </span>'),Je=w("<button> </button>"),Ke=w('<span class="text-3xl sm:text-5xl font-bold text-purple-600"> </span>'),Qe=w('<button class="bg-white hover:bg-gray-50 active:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-100 p-4 rounded-xl shadow-md border-b-4 border-gray-200 active:border-blue-300 active:translate-y-1 transition-all text-xl sm:text-2xl font-bold text-gray-700 flex items-center justify-center h-16 sm:h-20"> </button>'),We=w('<div class="max-w-lg mx-auto p-4 flex flex-col items-center gap-6 min-h-[500px]"><div class="w-full flex justify-between items-center bg-white p-3 rounded-xl shadow-sm"><div class="flex items-center gap-2"><span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase"> </span></div> <!> <div class="flex items-center gap-2 text-green-600 font-bold"><!> <span> </span></div></div> <!> <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-4 p-6 bg-white rounded-3xl shadow-lg w-full"><div class="flex items-center justify-center"><!></div> <div class="flex items-center justify-center"><!></div> <div class="flex items-center justify-center"><!></div> <span class="text-3xl sm:text-5xl font-bold text-gray-400">=</span> <div class="flex items-center justify-center"><!></div></div> <div class="w-full grid grid-cols-4 gap-3 sm:gap-4 mt-auto"></div> <button class="w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">Check <!></button></div>');function Xe(v,f){ee(f,!0);let l=F({score:0,highScore:0,level:1,failures:0}),r=V(F([])),n=V(F([])),u=V(null),o=V(null),h=V(0);Z(()=>{const t=P.load("math-fill");t&&(l.highScore=t.highScore,l.level=t.level||1,l.failures=t.failures||0),$()});function $(){const t=Oe(Math.ceil(l.level/2)),e=Be(t,l.level);p(r,e.puzzle.map(s=>({...s,userValue:null})),!0),p(n,e.options,!0),p(u,a(r).findIndex(s=>s.isHidden),!0),p(o,null)}function m(t){!a(r)[t].isHidden||a(o)||p(u,t,!0)}function R(t){return a(r).some(e=>e.isHidden&&e.userValue===t)}function oe(t){if(a(u)===null||a(o)||R(t))return;a(r)[a(u)].userValue=t;const e=a(r).findIndex((s,i)=>s.isHidden&&s.userValue===null&&i>a(u));if(e!==-1)p(u,e,!0);else{const s=a(r).findIndex(i=>i.isHidden&&i.userValue===null);p(u,s!==-1?s:a(u),!0)}}function ne(){if(a(r).some(g=>g.isHidden&&g.userValue===null))return;const t=g=>{const E=a(r)[g];return E.isHidden?E.userValue:E.value},e=Number(t(0)),s=String(t(1)),i=Number(t(2)),k=Number(t(3));let b=0;switch(s){case"+":b=e+i;break;case"-":b=e-i;break;case"×":b=e*i;break;case"÷":b=e/i;break;default:b=NaN}if(Math.abs(b-k)<.001){p(o,"correct"),Ve(h);const g=10*l.level+a(h)*5;l.score+=g,l.score>l.highScore&&(l.highScore=l.score),P.save("math-fill",l),a(h)%3===0&&l.level<10&&l.level++,setTimeout($,1500)}else p(o,"wrong"),p(h,0),l.failures++,P.save("math-fill",l),setTimeout(()=>{p(o,null),p(r,a(r).map(g=>g.isHidden?{...g,userValue:null}:g),!0),p(u,a(r).findIndex(g=>g.isHidden),!0)},1e3)}var S=We(),C=c(S),T=c(C),G=c(T),ie=c(G);d(G),d(T);var L=y(T,2);{var de=t=>{var e=De(),s=c(e);Ae(s,{size:14,class:"text-red-400"});var i=y(s,2),k=c(i,!0);d(i),d(e),M(()=>_(k,l.failures)),x(t,e)};H(L,t=>{l.failures>0&&t(de)})}var U=y(L,2),J=c(U);Ce(J,{size:18});var K=y(J,2),ue=c(K,!0);d(K),d(U),d(C);var Q=y(C,2);{var ce=t=>{var e=Ee(),s=c(e);{var i=b=>{var N=X("Correct! Awesome! 🎉");x(b,N)},k=b=>{var N=X("Oops! Try again. 💪");x(b,N)};H(s,b=>{a(o)==="correct"?b(i):b(k,!1)})}d(e),M(()=>j(e,1,`w-full p-4 rounded-xl text-center font-bold text-lg shadow-md ${a(o)==="correct"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`)),Ne(1,e,()=>Se),x(t,e)};H(Q,t=>{a(o)&&t(ce)})}var I=y(Q,2),A=c(I),fe=c(A);{var ve=t=>{var e=Fe();e.__click=()=>m(0);var s=c(e,!0);d(e),M(()=>{j(e,1,`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${a(u)===0?"border-blue-500 bg-blue-50 ring-4 ring-blue-200":"border-dashed border-gray-300 bg-gray-50"}`),_(s,a(r)[0].userValue??"?")}),x(t,e)},xe=t=>{var e=Pe(),s=c(e,!0);d(e),M(()=>{var i;return _(s,(i=a(r)[0])==null?void 0:i.value)}),x(t,e)};H(fe,t=>{var e;(e=a(r)[0])!=null&&e.isHidden?t(ve):t(xe,!1)})}d(A);var O=y(A,2),me=c(O);{var be=t=>{var e=Re();e.__click=()=>m(1);var s=c(e,!0);d(e),M(()=>{j(e,1,`w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${a(u)===1?"border-blue-500 bg-blue-50 ring-4 ring-blue-200":"border-dashed border-gray-300 bg-gray-50"}`),_(s,a(r)[1].userValue??"?")}),x(t,e)},pe=t=>{var e=Ge(),s=c(e,!0);d(e),M(()=>{var i;return _(s,(i=a(r)[1])==null?void 0:i.value)}),x(t,e)};H(me,t=>{var e;(e=a(r)[1])!=null&&e.isHidden?t(be):t(pe,!1)})}d(O);var B=y(O,2),he=c(B);{var ge=t=>{var e=Le();e.__click=()=>m(2);var s=c(e,!0);d(e),M(()=>{j(e,1,`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${a(u)===2?"border-blue-500 bg-blue-50 ring-4 ring-blue-200":"border-dashed border-gray-300 bg-gray-50"}`),_(s,a(r)[2].userValue??"?")}),x(t,e)},_e=t=>{var e=Ue(),s=c(e,!0);d(e),M(()=>{var i;return _(s,(i=a(r)[2])==null?void 0:i.value)}),x(t,e)};H(he,t=>{var e;(e=a(r)[2])!=null&&e.isHidden?t(ge):t(_e,!1)})}d(B);var W=y(B,4),ye=c(W);{var Me=t=>{var e=Je();e.__click=()=>m(3);var s=c(e,!0);d(e),M(()=>{j(e,1,`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${a(u)===3?"border-blue-500 bg-blue-50 ring-4 ring-blue-200":"border-dashed border-gray-300 bg-gray-50"}`),_(s,a(r)[3].userValue??"?")}),x(t,e)},we=t=>{var e=Ke(),s=c(e,!0);d(e),M(()=>{var i;return _(s,(i=a(r)[3])==null?void 0:i.value)}),x(t,e)};H(ye,t=>{var e;(e=a(r)[3])!=null&&e.isHidden?t(Me):t(we,!1)})}d(W),d(I);var D=y(I,2);je(D,21,()=>a(n),ze,(t,e)=>{var s=Qe();s.__click=()=>oe(a(e));var i=c(s,!0);d(s),M(k=>{s.disabled=k,_(i,a(e))},[()=>R(a(e))]),x(t,s)}),d(D);var z=y(D,2);z.__click=ne;var ke=y(c(z));Ie(ke,{}),d(z),d(S),M(t=>{_(ie,`Level ${l.level??""}`),_(ue,l.score),z.disabled=t},[()=>a(r).some(t=>t.isHidden&&t.userValue===null)||a(o)!==null]),x(v,S),te()}He(["click"]);function it(v,f){ee(f,!1),Z(()=>{Te.set("Math Detectives")}),$e(),Xe(v,{}),te()}export{it as component};
