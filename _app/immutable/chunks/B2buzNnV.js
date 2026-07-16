import{c as w,a as y,b as O,s as B}from"./htmFxrAt.js";import"./CPszINM9.js";import{f as D,B as g,D as I,J as T,F as v}from"./CMBhS1Kw.js";import{I as A,s as C,a as f}from"./D-9RU9rA.js";import{l as P,s as Q,p as E,i as G}from"./rNHmbvmY.js";function tt(t,e){const a=P(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const n=[["path",{d:"M4 5h16"}],["path",{d:"M4 12h16"}],["path",{d:"M4 19h16"}]];A(t,Q({name:"menu"},()=>a,{get iconNode(){return n},children:(i,u)=>{var s=w(),o=D(s);C(o,e,"default",{}),y(i,s)},$$slots:{default:!0}}))}var H=O('<path opacity="0.2" filter="url(#gate-glow)"></path>'),L=O('<circle cy="35" r="6" fill="white" stroke-width="2.5"></circle>'),S=O('<svg class="h-[82px] w-[86px] overflow-visible" viewBox="0 0 86 82" aria-hidden="true"><!><defs><filter id="gate-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"></feGaussianBlur></filter></defs><path stroke-width="2.5"></path><!><text x="43" y="79" text-anchor="middle" class="select-none text-[12px] font-black fill-slate-700"> </text></svg>');function et(t,e){let a=E(e,"active",3,!1);const n={AND:"#2563eb",OR:"#16a34a",NOT:"#dc2626",NAND:"#7c3aed",NOR:"#ea580c",XOR:"#ca8a04"};function i(c){return c==="AND"||c==="NAND"?"M 16,8 L 43,8 A 27,27 0 0 1 43,62 L 16,62 Z":c==="OR"||c==="NOR"?"M 15,8 Q 31,35 15,62 Q 47,62 67,35 Q 47,8 15,8 Z":c==="NOT"?"M 18,12 L 18,58 L 62,35 Z":"M 8,8 Q 24,35 8,62 M 16,8 Q 32,35 16,62 Q 48,62 69,35 Q 48,8 16,8 Z"}function u(c){return c==="NOT"||c==="NAND"||c==="NOR"}var s=S(),o=g(s);{var r=c=>{var m=H();v(k=>{f(m,"d",k),f(m,"fill",n[e.type])},[()=>i(e.type)]),y(c,m)};G(o,c=>{a()&&c(r)})}var d=I(o,2),l=I(d);{var x=c=>{var m=L();v(()=>{f(m,"cx",e.type==="NOT"?68:73),f(m,"stroke",n[e.type])}),y(c,m)};G(l,c=>{u(e.type)&&c(x)})}var p=I(l),h=g(p,!0);T(p),T(s),v(c=>{f(d,"d",c),f(d,"fill",n[e.type]),f(d,"fill-opacity",a()?"0.28":"0.14"),f(d,"stroke",n[e.type]),B(h,e.type)},[()=>i(e.type)]),y(t,s)}function X(t){return t==="NOT"?1:2}function $(t,e){switch(t){case"AND":return e.every(Boolean);case"OR":return e.some(Boolean);case"NOT":return!e[0];case"NAND":return!e.every(Boolean);case"NOR":return!e.some(Boolean);case"XOR":return e.reduce((a,n)=>a!==n,!1)}}function _(t){return`${t.nodeId}:${t.role}:${t.index}`}function z(t,e){return`${_(t)}>${_(e)}`}function nt(t,e){return t.nodeId===e.nodeId&&t.role===e.role&&t.index===e.index}function R(t,e){return t.role==="source"&&e.role==="sink"?{from:t,to:e}:t.role==="sink"&&e.role==="source"?{from:e,to:t}:null}function M(t,e){return e.some(a=>a.id===t)}function Z(t,e,a){var s;const n=new Map;for(const o of a){if(o.from.role!=="source"||o.to.role!=="sink")continue;const r=o.from.nodeId,d=o.to.nodeId;n.has(r)||n.set(r,[]),(s=n.get(r))==null||s.push(d)}const i=new Set,u=[t];for(;u.length>0;){const o=u.shift();if(!(!o||i.has(o))){if(o===e)return!0;i.add(o),u.push(...n.get(o)??[])}}return!1}function j(t,e,a,n){const i=R(t,e);if(!i)return!1;const{from:u,to:s}=i;if(u.nodeId===s.nodeId)return!1;const o=M(u.nodeId,a),r=M(s.nodeId,a);return!(o&&r&&Z(s.nodeId,u.nodeId,n))}function ot(t,e,a,n){if(!j(e,a,n,t))return t;const i=R(e,a);if(!i)return t;const{from:u,to:s}=i,o={id:z(u,s),from:u,to:s};return[...t.filter(r=>!(r.to.nodeId===s.nodeId&&r.to.index===s.index)),o]}function at(t,e){return t.filter(a=>a.from.nodeId!==e&&a.to.nodeId!==e)}function W(t,e,a,n){const i={};for(const r of t.inputs)i[r.id]=n[r.id]??!1;for(const r of e)i[r.id]=!1;let u=!0,s=0;for(;u&&s<50;){u=!1,s+=1;for(const r of e){const d=[];for(let x=0;x<X(r.type);x+=1){const p=a.find(h=>h.to.nodeId===r.id&&h.to.index===x);d.push(p?i[p.from.nodeId]??!1:!1)}const l=$(r.type,d);i[r.id]!==l&&(i[r.id]=l,u=!0)}}const o={};for(const r of t.outputs){const d=a.find(l=>l.to.nodeId===r.id);o[r.id]=d?i[d.from.nodeId]??!1:!1}return{gateStates:Object.fromEntries(e.map(r=>[r.id,i[r.id]??!1])),outputStates:o}}function rt(t,e,a){return t.truthTable.map(n=>{const i=Object.fromEntries(t.inputs.map((o,r)=>[o.id,n.inputs[r]??!1])),u=W(t,e,a,i),s=t.outputs.map(o=>u.outputStates[o.id]??!1);return{correct:s.every((o,r)=>o===n.outputs[r]),inputs:n.inputs,outputs:s,expected:n.outputs}})}const st=86,it=82,b=92,N=56;function F(t){return t==="NOT"?[{x:-6,y:35}]:[{x:-6,y:21},{x:-6,y:49}]}function V(t){return t==="NOT"||t==="NAND"||t==="NOR"?{x:92,y:35}:t==="XOR"?{x:88,y:35}:{x:86,y:35}}function ut(t,e,a,n){const i=a.find(o=>o.id===t.nodeId);if(i)return{x:i.x+b+12,y:i.y+N/2};const u=n.find(o=>o.id===t.nodeId);if(u)return{x:u.x-12,y:u.y+N/2};const s=e.find(o=>o.id===t.nodeId);if(s){const o=t.role==="sink"?F(s.type)[t.index]:V(s.type);return{x:s.x+o.x,y:s.y+o.y}}return{x:0,y:0}}function ct(t,e){const a=Math.max(48,Math.abs(e.x-t.x)*.45);return`M ${t.x} ${t.y} C ${t.x+a} ${t.y}, ${e.x-a} ${e.y}, ${e.x} ${e.y}`}function dt(t,e){const a=[...t.map(n=>({x:n.x,y:n.y})),...e.map(n=>({x:n.x+b,y:n.y+N}))];return{minX:Math.min(...a.map(n=>n.x),0),minY:Math.min(...a.map(n=>n.y),0),maxX:Math.max(...a.map(n=>n.x),520),maxY:Math.max(...a.map(n=>n.y),360)}}export{et as G,tt as M,b as P,N as a,X as b,st as c,it as d,W as e,ut as f,ct as g,j as h,ot as i,dt as j,rt as k,at as r,nt as s};
