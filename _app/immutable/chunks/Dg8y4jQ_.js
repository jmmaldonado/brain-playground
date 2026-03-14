import{i as ee,j as ae,d as se,n as te,k as re,e as ie,a as B,c as oe}from"./z7JRid-X.js";import{i as ue}from"./CvKCQNz6.js";import{h as L,a as le,aq as R,Q as U,U as F,e as j,l as fe,Y as ne,ar as ce,as as de,at as _e,c as P,p as ve,au as he,F as q,av as be,n as $,G as ye,aw as ge,q as ke,ax as Ae,ay as we,az as Se,aA as Ne,aB as pe,o as Ie,y as Ee,u as V,L as E,z as Te,f as me,A as Ce,D as Le,ao as Oe,aC as Me}from"./qPop1VOo.js";import{c as qe,a as ze,s as We,e as Pe,b as Ue,i as je}from"./DnGsyt9C.js";import{l as Y,p as I}from"./Q8vdk_92.js";function Be(e,a,s,t,r){var n;L&&le();var l=(n=a.$$slots)==null?void 0:n[s],u=!1;l===!0&&(l=a.children,u=!0),l===void 0||l(e,u?()=>t:t)}function $e(e,a){var s=void 0,t;R(()=>{s!==(s=a())&&(t&&(U(t),t=null),s&&(t=F(()=>{j(()=>s(e))})))})}function z(e,a,s=!1){if(e.multiple){if(a==null)return;if(!ce(a))return de();for(var t of e.options)t.selected=a.includes(C(t));return}for(t of e.options){var r=C(t);if(_e(r,a)){t.selected=!0;return}}(!s||a!==void 0)&&(e.selectedIndex=-1)}function G(e){var a=new MutationObserver(()=>{z(e,e.__value)});a.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),ne(()=>{a.disconnect()})}function Je(e,a,s=a){var t=new WeakSet,r=!0;fe(e,"change",l=>{var u=l?"[selected]":":checked",n;if(e.multiple)n=[].map.call(e.querySelectorAll(u),C);else{var h=e.querySelector(u)??e.querySelector("option:not([disabled])");n=h&&C(h)}s(n),P!==null&&t.add(P)}),j(()=>{var l=a();if(e===document.activeElement){var u=ve??P;if(t.has(u))return}if(z(e,l,r),r&&l===void 0){var n=e.querySelector(":checked");n!==null&&(l=C(n),s(l))}e.__value=l,r=!1}),G(e)}function C(e){return"__value"in e?e.__value:e.value}const T=Symbol("class"),m=Symbol("style"),K=Symbol("is custom element"),Q=Symbol("is html");function Ve(e){if(L){var a=!1,s=()=>{if(!a){if(a=!0,e.hasAttribute("value")){var t=e.value;W(e,"value",null),e.value=t}if(e.hasAttribute("checked")){var r=e.checked;W(e,"checked",null),e.checked=r}}};e.__on_r=s,ke(s),Ae()}}function Ye(e,a){a?e.hasAttribute("selected")||e.setAttribute("selected",""):e.removeAttribute("selected")}function W(e,a,s,t){var r=Z(e);L&&(r[a]=e.getAttribute(a),a==="src"||a==="srcset"||a==="href"&&e.nodeName==="LINK")||r[a]!==(r[a]=s)&&(a==="loading"&&(e[Ne]=s),s==null?e.removeAttribute(a):typeof s!="string"&&J(e).includes(a)?e[a]=s:e.setAttribute(a,s))}function De(e,a,s,t,r=!1,l=!1){if(L&&r&&e.tagName==="INPUT"){var u=e,n=u.type==="checkbox"?"defaultChecked":"defaultValue";n in s||Ve(u)}var h=Z(e),y=h[K],w=!h[Q];let k=L&&y;k&&$(!1);var f=a||{},S=e.tagName==="OPTION";for(var _ in a)_ in s||(s[_]=null);s.class?s.class=qe(s.class):s[T]&&(s.class=null),s[m]&&(s.style??(s.style=null));var g=J(e);for(const i in s){let o=s[i];if(S&&i==="value"&&o==null){e.value=e.__value="",f[i]=o;continue}if(i==="class"){var A=e.namespaceURI==="http://www.w3.org/1999/xhtml";ze(e,A,o,t,a==null?void 0:a[T],s[T]),f[i]=o,f[T]=s[T];continue}if(i==="style"){We(e,o,a==null?void 0:a[m],s[m]),f[i]=o,f[m]=s[m];continue}var c=f[i];if(!(o===c&&!(o===void 0&&e.hasAttribute(i)))){f[i]=o;var O=i[0]+i[1];if(O!=="$$")if(O==="on"){const b={},p="$$"+i;let v=i.slice(2);var N=re(v);if(ee(v)&&(v=v.slice(0,-7),b.capture=!0),!N&&c){if(o!=null)continue;e.removeEventListener(v,f[p],b),f[p]=null}if(o!=null)if(N)e[`__${v}`]=o,se([v]);else{let X=function(x){f[i].call(this,x)};f[p]=ae(v,e,X,b)}else N&&(e[`__${v}`]=void 0)}else if(i==="style")W(e,i,o);else if(i==="autofocus")ye(e,!!o);else if(!y&&(i==="__value"||i==="value"&&o!=null))e.value=e.__value=o;else if(i==="selected"&&S)Ye(e,o);else{var d=i;w||(d=te(d));var M=d==="defaultValue"||d==="defaultChecked";if(o==null&&!y&&!M)if(h[i]=null,d==="value"||d==="checked"){let b=e;const p=a===void 0;if(d==="value"){let v=b.defaultValue;b.removeAttribute(d),b.defaultValue=v,b.value=b.__value=p?v:null}else{let v=b.defaultChecked;b.removeAttribute(d),b.defaultChecked=v,b.checked=p?v:!1}}else e.removeAttribute(i);else M||g.includes(d)&&(y||typeof o!="string")?(e[d]=o,d in h&&(h[d]=ge)):typeof o!="function"&&W(e,d,o)}}}return k&&$(!0),f}function D(e,a,s=[],t=[],r=[],l,u=!1,n=!1){he(r,s,t,h=>{var y=void 0,w={},k=e.nodeName==="SELECT",f=!1;if(R(()=>{var _=a(...h.map(q)),g=De(e,y,_,l,u,n);f&&k&&"value"in _&&z(e,_.value);for(let c of Object.getOwnPropertySymbols(w))_[c]||U(w[c]);for(let c of Object.getOwnPropertySymbols(_)){var A=_[c];c.description===be&&(!y||A!==y[c])&&(w[c]&&U(w[c]),w[c]=F(()=>$e(e,()=>A))),g[c]=A}y=g}),k){var S=e;j(()=>{z(S,y.value,!0),G(S)})}f=!0})}function Z(e){return e.__attributes??(e.__attributes={[K]:e.nodeName.includes("-"),[Q]:e.namespaceURI===we})}var H=new Map;function J(e){var a=e.getAttribute("is")||e.nodeName,s=H.get(a);if(s)return s;H.set(a,s=[]);for(var t,r=e,l=Element.prototype;l!==r;){t=pe(r);for(var u in t)t[u].set&&s.push(u);r=Se(r)}return s}/**
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
 */const He={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var Re=ie("<svg><!><!></svg>");function Xe(e,a){const s=Y(a,["children","$$slots","$$events","$$legacy"]),t=Y(s,["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"]);Ie(a,!1);let r=I(a,"name",8,void 0),l=I(a,"color",8,"currentColor"),u=I(a,"size",8,24),n=I(a,"strokeWidth",8,2),h=I(a,"absoluteStrokeWidth",8,!1),y=I(a,"iconNode",24,()=>[]);const w=(..._)=>_.filter((g,A,c)=>!!g&&c.indexOf(g)===A).join(" ");ue();var k=Re();D(k,(_,g)=>({...He,...t,width:u(),height:u(),stroke:l(),"stroke-width":_,class:g}),[()=>(E(h()),E(n()),E(u()),V(()=>h()?Number(n())*24/Number(u()):n())),()=>(E(r()),E(s),V(()=>w("lucide-icon","lucide",r()?`lucide-${r()}`:"",s.class)))]);var f=Te(k);Pe(f,1,y,je,(_,g)=>{var A=Oe(()=>Me(q(g),2));let c=()=>q(A)[0],O=()=>q(A)[1];var N=oe(),d=me(N);Ue(d,c,!0,(M,i)=>{D(M,()=>({...O()}))}),B(_,N)});var S=Ce(f);Be(S,a,"default",{}),Le(k),B(e,k),Ee()}export{Xe as I,W as a,Je as b,Ve as r,Be as s};
