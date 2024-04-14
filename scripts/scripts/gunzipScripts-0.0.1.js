"use strict";(()=>{var r=Uint8Array,e=Uint16Array,n=Uint32Array,a=new r([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),t=new r([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),o=new r([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),i=function(r,a){for(var t=new e(31),o=0;o<31;++o)t[o]=a+=1<<r[o-1];for(var i=new n(t[30]),o=1;o<30;++o)for(var f=t[o];f<t[o+1];++f)i[f]=f-t[o]<<5|o;return[t,i]},f=i(a,2),v=f[0],l=f[1];v[28]=258,l[258]=28;var c=i(t,0),u=c[0],d=c[1],s=new e(32768);for(p=0;p<32768;++p)w=(p&43690)>>>1|(p&21845)<<1,w=(w&52428)>>>2|(w&13107)<<2,w=(w&61680)>>>4|(w&3855)<<4,s[p]=((w&65280)>>>8|(w&255)<<8)>>>1;var w,p,h=function(r,n,a){for(var t=r.length,o=0,i=new e(n);o<t;++o)r[o]&&++i[r[o]-1];var f=new e(n);for(o=0;o<n;++o)f[o]=f[o-1]+i[o-1]<<1;var v;if(a){v=new e(1<<n);var l=15-n;for(o=0;o<t;++o)if(r[o])for(var c=o<<4|r[o],u=n-r[o],d=f[r[o]-1]++<<u,w=d|(1<<u)-1;d<=w;++d)v[s[d]>>>l]=c}else for(v=new e(t),o=0;o<t;++o)r[o]&&(v[o]=s[f[r[o]-1]++]>>>15-r[o]);return v},g=new r(288);for(p=0;p<144;++p)g[p]=8;var p;for(p=144;p<256;++p)g[p]=9;var p;for(p=256;p<280;++p)g[p]=7;var p;for(p=280;p<288;++p)g[p]=8;var p,b=new r(32);for(p=0;p<32;++p)b[p]=5;var p;var y=h(g,9,1);var E=h(b,5,1),m=function(r){for(var e=r[0],n=1;n<r.length;++n)r[n]>e&&(e=r[n]);return e},T=function(r,e,n){var a=e/8|0;return(r[a]|r[a+1]<<8)>>(e&7)&n},k=function(r,e){var n=e/8|0;return(r[n]|r[n+1]<<8|r[n+2]<<16)>>(e&7)},x=function(r){return(r+7)/8|0},S=function(a,t,o){(t==null||t<0)&&(t=0),(o==null||o>a.length)&&(o=a.length);var i=new(a.BYTES_PER_ELEMENT==2?e:a.BYTES_PER_ELEMENT==4?n:r)(o-t);return i.set(a.subarray(t,o)),i};var z=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],A=function(r,e,n){var a=new Error(e||z[r]);if(a.code=r,Error.captureStackTrace&&Error.captureStackTrace(a,A),!n)throw a;return a},U=function(e,n,i){var f=e.length;if(!f||i&&i.f&&!i.l)return n||new r(0);var l=!n||i,c=!i||i.i;i||(i={}),n||(n=new r(f*3));var d=function(e){var a=n.length;if(e>a){var t=new r(Math.max(a*2,e));t.set(n),n=t}},s=i.f||0,w=i.p||0,p=i.b||0,g=i.l,b=i.d,z=i.m,U=i.n,C=f*8;do{if(!g){s=T(e,w,1);var _=T(e,w+1,3);if(w+=3,_)if(_==1)g=y,b=E,z=9,U=5;else if(_==2){var D=T(e,w,31)+257,M=T(e,w+10,15)+4,N=D+T(e,w+5,31)+1;w+=14;for(var R=new r(N),B=new r(19),F=0;F<M;++F)B[o[F]]=T(e,w+F*3,7);w+=M*3;for(var L=m(B),P=(1<<L)-1,Y=h(B,L,1),F=0;F<N;){var j=Y[T(e,w,P)];w+=j&15;var q=j>>>4;if(q<16)R[F++]=q;else{var I=0,O=0;for(q==16?(O=3+T(e,w,3),w+=2,I=R[F-1]):q==17?(O=3+T(e,w,7),w+=3):q==18&&(O=11+T(e,w,127),w+=7);O--;)R[F++]=I}}var $=R.subarray(0,D),G=R.subarray(D);z=m($),U=m(G),g=h($,z,1),b=h(G,U,1)}else A(1);else{var q=x(w)+4,H=e[q-4]|e[q-3]<<8,J=q+H;if(J>f){c&&A(0);break}l&&d(p+H),n.set(e.subarray(q,J),p),i.b=p+=H,i.p=w=J*8,i.f=s;continue}if(w>C){c&&A(0);break}}l&&d(p+131072);for(var K=(1<<z)-1,Q=(1<<U)-1,V=w;;V=w){var I=g[k(e,w)&K],W=I>>>4;if(w+=I&15,w>C){c&&A(0);break}if(I||A(2),W<256)n[p++]=W;else if(W==256){V=w,g=null;break}else{var X=W-254;if(W>264){var F=W-257,Z=a[F];X=T(e,w,(1<<Z)-1)+v[F],w+=Z}var rr=b[k(e,w)&Q],er=rr>>>4;rr||A(3),w+=rr&15;var G=u[er];if(er>3){var Z=t[er];G+=k(e,w)&(1<<Z)-1,w+=Z}if(w>C){c&&A(0);break}l&&d(p+131072);for(var nr=p+X;p<nr;p+=4)n[p]=n[p-G],n[p+1]=n[p+1-G],n[p+2]=n[p+2-G],n[p+3]=n[p+3-G];p=nr}}i.l=g,i.p=V,i.b=p,i.f=s,g&&(s=1,i.m=z,i.d=b,i.n=U)}while(!s);return p==n.length?n:S(n,0,p)};var C=new r(0);var _=function(r){(r[0]!=31||r[1]!=139||r[2]!=8)&&A(6,"invalid gzip data");var e=r[3],n=10;e&4&&(n+=r[10]|(r[11]<<8)+2);for(var a=(e>>3&1)+(e>>4&1);a>0;a-=!r[n++]);return n+(e&2)},D=function(r){var e=r.length;return(r[e-4]|r[e-3]<<8|r[e-2]<<16|r[e-1]<<24)>>>0};function M(e,n){return U(e.subarray(_(e),-8),n||new r(D(e)))}var N=typeof TextDecoder<"u"&&new TextDecoder,R=0;try{N.decode(C,{stream:!0}),R=1}catch{}var B=()=>{var r;let e=document.querySelectorAll('script[type="text/javascript+gzip"][src]');for(let n of e)try{let e=n.src.match(/^data:(.*?)(?:;(base64))?,(.*)$/);if(!e)continue;let[a,t,o,i]=e,f=Uint8Array.from(o?atob(i):decodeURIComponent(i),(r=>r.charCodeAt(0))),v=(new TextDecoder).decode(M(f)),l=document.createElement("script");l.textContent=v,(r=n.parentNode)==null||r.replaceChild(l,n)}catch(r){console.error("Could not gunzip script",n,r)}};B();window.gunzipSync=M;window.gunzipScripts=B})();