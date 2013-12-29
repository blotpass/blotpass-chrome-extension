(function() {/*
 A JavaScript implementation of the SHA family of hashes, as defined in FIPS
 PUB 180-2 as well as the corresponding HMAC implementation as defined in
 FIPS PUB 198a

 Copyright Brian Turek 2008-2012
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnson
*/
function k(a){throw a;}function s(a,e){var b=[],f=(1<<e)-1,c=a.length*e,d;for(d=0;d<c;d+=e)b[d>>>5]|=(a.charCodeAt(d/e)&f)<<32-e-d%32;return{value:b,binLen:c}}function u(a){var e=[],b=a.length,f,c;0!==b%2&&k("String of HEX type must be in byte increments");for(f=0;f<b;f+=2)c=parseInt(a.substr(f,2),16),isNaN(c)&&k("String of HEX type contains invalid characters"),e[f>>>3]|=c<<24-4*(f%8);return{value:e,binLen:4*b}}
function v(a){var e=[],b=0,f,c,d,g,h;-1===a.search(/^[a-zA-Z0-9=+\/]+$/)&&k("Invalid character in base-64 string");f=a.indexOf("=");a=a.replace(/\=/g,"");-1!==f&&f<a.length&&k("Invalid '=' found in base-64 string");for(c=0;c<a.length;c+=4){h=a.substr(c,4);for(d=g=0;d<h.length;d+=1)f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(h[d]),g|=f<<18-6*d;for(d=0;d<h.length-1;d+=1)e[b>>2]|=(g>>>16-8*d&255)<<24-8*(b%4),b+=1}return{value:e,binLen:8*b}}
function w(a,e){var b="",f=4*a.length,c,d;for(c=0;c<f;c+=1)d=a[c>>>2]>>>8*(3-c%4),b+="0123456789abcdef".charAt(d>>>4&15)+"0123456789abcdef".charAt(d&15);return e.outputUpper?b.toUpperCase():b}
function x(a,e){var b="",f=4*a.length,c,d,g;for(c=0;c<f;c+=3){g=(a[c>>>2]>>>8*(3-c%4)&255)<<16|(a[c+1>>>2]>>>8*(3-(c+1)%4)&255)<<8|a[c+2>>>2]>>>8*(3-(c+2)%4)&255;for(d=0;4>d;d+=1)b=8*c+6*d<=32*a.length?b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(g>>>6*(3-d)&63):b+e.b64Pad}return b}
function y(a){var e={outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(e.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(e.b64Pad=a.b64Pad)}catch(b){}"boolean"!==typeof e.outputUpper&&k("Invalid outputUpper formatting option");"string"!==typeof e.b64Pad&&k("Invalid b64Pad formatting option");return e}function z(a,e){var b=(a&65535)+(e&65535);return((a>>>16)+(e>>>16)+(b>>>16)&65535)<<16|b&65535}
function A(a,e,b,f,c){var d=(a&65535)+(e&65535)+(b&65535)+(f&65535)+(c&65535);return((a>>>16)+(e>>>16)+(b>>>16)+(f>>>16)+(c>>>16)+(d>>>16)&65535)<<16|d&65535}
function B(a,e){var b=[],f,c,d,g,h,C,t,j,D,l=[1732584193,4023233417,2562383102,271733878,3285377520],n=[1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1518500249,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,1859775393,
1859775393,1859775393,1859775393,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,2400959708,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782,3395469782];a[e>>>5]|=128<<24-e%32;a[(e+
65>>>9<<4)+15]=e;D=a.length;for(t=0;t<D;t+=16){f=l[0];c=l[1];d=l[2];g=l[3];h=l[4];for(j=0;80>j;j+=1)b[j]=16>j?a[j+t]:(b[j-3]^b[j-8]^b[j-14]^b[j-16])<<1|(b[j-3]^b[j-8]^b[j-14]^b[j-16])>>>31,C=20>j?A(f<<5|f>>>27,c&d^~c&g,h,n[j],b[j]):40>j?A(f<<5|f>>>27,c^d^g,h,n[j],b[j]):60>j?A(f<<5|f>>>27,c&d^c&g^d&g,h,n[j],b[j]):A(f<<5|f>>>27,c^d^g,h,n[j],b[j]),h=g,g=d,d=c<<30|c>>>2,c=f,f=C;l[0]=z(f,l[0]);l[1]=z(c,l[1]);l[2]=z(d,l[2]);l[3]=z(g,l[3]);l[4]=z(h,l[4])}return l}
window.jsSHA=function(a,e,b){var f=null,c=0,d=[0],g=0,h=null,g="undefined"!==typeof b?b:8;8===g||16===g||k("charSize must be 8 or 16");"HEX"===e?(0!==a.length%2&&k("srcString of HEX type must be in byte increments"),h=u(a),c=h.binLen,d=h.value):"ASCII"===e||"TEXT"===e?(h=s(a,g),c=h.binLen,d=h.value):"B64"===e?(h=v(a),c=h.binLen,d=h.value):k("inputFormat must be HEX, TEXT, ASCII, or B64");this.getHash=function(b,a,e){var g=null,h=d.slice(),n="";switch(a){case "HEX":g=w;break;case "B64":g=x;break;default:k("format must be HEX or B64")}"SHA-1"===
b?(null===f&&(f=B(h,c)),n=g(f,y(e))):k("Chosen SHA variant is not supported");return n};this.getHMAC=function(b,a,e,f,h){var n,p,m,E,r,F,G=[],H=[],q=null;switch(f){case "HEX":n=w;break;case "B64":n=x;break;default:k("outputFormat must be HEX or B64")}"SHA-1"===e?(m=64,F=160):k("Chosen SHA variant is not supported");"HEX"===a?(q=u(b),r=q.binLen,p=q.value):"ASCII"===a||"TEXT"===a?(q=s(b,g),r=q.binLen,p=q.value):"B64"===a?(q=v(b),r=q.binLen,p=q.value):k("inputFormat must be HEX, TEXT, ASCII, or B64");
b=8*m;a=m/4-1;m<r/8?("SHA-1"===e?p=B(p,r):k("Unexpected error in HMAC implementation"),p[a]&=4294967040):m>r/8&&(p[a]&=4294967040);for(m=0;m<=a;m+=1)G[m]=p[m]^909522486,H[m]=p[m]^1549556828;"SHA-1"===e?E=B(H.concat(B(G.concat(d),b+c)),b+F):k("Unexpected error in HMAC implementation");return n(E,y(h))}};})();