(self.AMP=self.AMP||[]).push({n:"amp-iframe",v:"1912201827130",f:(function(AMP,_){
    var h,aa="function"==typeof Object.create?Object.create:function(a){function b(){}b.prototype=a;return new b},n;if("function"==typeof Object.setPrototypeOf)n=Object.setPrototypeOf;else{var t;a:{var ba={a:!0},u={};try{u.__proto__=ba;t=u.a;break a}catch(a){}t=!1}n=t?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var v=n;function w(a,b){b=void 0===b?"":b;try{return decodeURIComponent(a)}catch(c){return b}};var ca=/(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;var x=self.AMP_CONFIG||{},da={thirdParty:x.thirdPartyUrl||"https://3p.ampproject.net",thirdPartyFrameHost:x.thirdPartyFrameHost||"ampproject.net",thirdPartyFrameRegex:("string"==typeof x.thirdPartyFrameRegex?new RegExp(x.thirdPartyFrameRegex):x.thirdPartyFrameRegex)||/^d-\d+\.ampproject\.net$/,cdn:x.cdnUrl||"https://cdn.ampproject.org",cdnProxyRegex:("string"==typeof x.cdnProxyRegex?new RegExp(x.cdnProxyRegex):x.cdnProxyRegex)||/^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/,localhostRegex:/^https?:\/\/localhost(:\d+)?$/,
    errorReporting:x.errorReportingUrl||"https://amp-error-reporting.appspot.com/r",localDev:x.localDev||!1,trustedViewerHosts:[/(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/,/(^|\.)gmail\.(com|dev)$/]};self.__AMP_LOG=self.__AMP_LOG||{user:null,dev:null,userForEmbed:null};var y=self.__AMP_LOG;function z(){if(!y.user)throw Error("failed to call initLogConstructor");return y.user}function A(){if(y.dev)return y.dev;throw Error("failed to call initLogConstructor");}function B(a,b,c,d,e){z().assert(a,b,c,d,e,void 0,void 0,void 0,void 0,void 0,void 0)};var C=Object.prototype.hasOwnProperty;function D(){var a,b=Object.create(null);a&&Object.assign(b,a);return b}function E(a){return a||{}};function F(){var a=100;this.fa=a;this.N=this.Y=0;this.G=Object.create(null)}F.prototype.has=function(a){return!!this.G[a]};F.prototype.get=function(a){var b=this.G[a];if(b)return b.access=++this.N,b.payload};F.prototype.put=function(a,b){this.has(a)||this.Y++;this.G[a]={payload:b,access:this.N};if(!(this.Y<=this.fa)){A().warn("lru-cache","Trimming LRU cache");a=this.G;var c=this.N+1,d;for(d in a){var e=a[d].access;if(e<c){c=e;var f=d}}void 0!==f&&(delete a[f],this.Y--)}};function ea(a,b){var c=a.length-b.length;return 0<=c&&a.indexOf(b,c)==c};E({c:!0,v:!0,a:!0,ad:!0,action:!0});var G,fa;
    function ha(a){var b;G||(G=self.document.createElement("a"),fa=self.__AMP_URL_CACHE||(self.__AMP_URL_CACHE=new F));var c=b?null:fa,d=G;if(c&&c.has(a))a=c.get(a);else{d.href=a;d.protocol||(d.href=d.href);var e={href:d.href,protocol:d.protocol,host:d.host,hostname:d.hostname,port:"0"==d.port?"":d.port,pathname:d.pathname,search:d.search,hash:d.hash,origin:null};"/"!==e.pathname[0]&&(e.pathname="/"+e.pathname);if("http:"==e.protocol&&80==e.port||"https:"==e.protocol&&443==e.port)e.port="",e.host=e.hostname;
    e.origin=d.origin&&"null"!=d.origin?d.origin:"data:"!=e.protocol&&e.host?e.protocol+"//"+e.host:e.href;c&&c.put(a,e);a=e}return a};function H(a,b){if(a.__AMP__EXPERIMENT_TOGGLES)var c=a.__AMP__EXPERIMENT_TOGGLES;else{a.__AMP__EXPERIMENT_TOGGLES=Object.create(null);c=a.__AMP__EXPERIMENT_TOGGLES;if(a.AMP_CONFIG)for(var d in a.AMP_CONFIG){var e=a.AMP_CONFIG[d];"number"===typeof e&&0<=e&&1>=e&&(c[d]=Math.random()<e)}if(a.AMP_CONFIG&&Array.isArray(a.AMP_CONFIG["allow-doc-opt-in"])&&0<a.AMP_CONFIG["allow-doc-opt-in"].length&&(d=a.AMP_CONFIG["allow-doc-opt-in"],e=a.document.head.querySelector('meta[name="amp-experiments-opt-in"]'))){e=
    e.getAttribute("content").split(",");for(var f=0;f<e.length;f++)-1!=d.indexOf(e[f])&&(c[e[f]]=!0)}Object.assign(c,ia(a));if(a.AMP_CONFIG&&Array.isArray(a.AMP_CONFIG["allow-url-opt-in"])&&0<a.AMP_CONFIG["allow-url-opt-in"].length){d=a.AMP_CONFIG["allow-url-opt-in"];e=a.location.originalHash||a.location.hash;a=Object.create(null);if(e)for(var g;g=ca.exec(e);)f=w(g[1],g[1]),g=g[2]?w(g[2].replace(/\+/g," "),g[2]):"",a[f]=g;for(e=0;e<d.length;e++)f=a["e-"+d[e]],"1"==f&&(c[d[e]]=!0),"0"==f&&(c[d[e]]=!1)}}var m=
    c;return!!m[b]}function ia(a){var b="";try{"localStorage"in a&&(b=a.localStorage.getItem("amp-experiment-toggles"))}catch(e){A().warn("EXPERIMENTS","Failed to retrieve experiments from localStorage.")}var c=b?b.split(/\s*,\s*/g):[];a=Object.create(null);for(var d=0;d<c.length;d++)0!=c[d].length&&("-"==c[d][0]?a[c[d].substr(1)]=!1:a[c[d]]=!0);return a};var ja={},I=(ja["ampdoc-fie"]={isTrafficEligible:function(){return!0},branches:[["21065001"],["21065002"]]},ja);function J(a,b){var c=a.ownerDocument.defaultView,d=c.__AMP_TOP||(c.__AMP_TOP=c),e=c!=d;var f=d;if(H(f,"ampdoc-fie")){f.__AMP_EXPERIMENT_BRANCHES=f.__AMP_EXPERIMENT_BRANCHES||{};for(var g in I)if(C.call(I,g)&&!C.call(f.__AMP_EXPERIMENT_BRANCHES,g))if(I[g].isTrafficEligible&&I[g].isTrafficEligible(f)){if(!f.__AMP_EXPERIMENT_BRANCHES[g]&&H(f,g)){var m=I[g].branches;f.__AMP_EXPERIMENT_BRANCHES[g]=m[Math.floor(Math.random()*m.length)]||null}}else f.__AMP_EXPERIMENT_BRANCHES[g]=null;f="21065002"===(f.__AMP_EXPERIMENT_BRANCHES?
    f.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"]:null)}else f=!1;var p=f;e&&!p?b=K(c,b)?L(c,b):null:(a=M(a),a=ka(a),b=K(a,b)?L(a,b):null);return b}function N(a,b){a=a.__AMP_TOP||(a.__AMP_TOP=a);return L(a,b)}function la(a,b){var c=M(a);c=ka(c);return L(c,b)}function M(a){return a.nodeType?N((a.ownerDocument||a).defaultView,"ampdoc").getAmpDoc(a):a}function ka(a){a=M(a);return a.isSingleDoc()?a.win:a}
    function L(a,b){K(a,b);var c=a.__AMP_SERVICES;c||(c=a.__AMP_SERVICES={});var d=c;a=d[b];a.obj||(a.obj=new a.ctor(a.context),a.ctor=null,a.context=null,a.resolve&&a.resolve(a.obj));return a.obj}function K(a,b){a=a.__AMP_SERVICES&&a.__AMP_SERVICES[b];return!(!a||!a.ctor&&!a.obj)};/*
     https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
    function ma(a,b){for(var c;a&&a!==c;a=a.parentElement)if(b(a))return a;return null}function na(a){return a.closest?a.closest(".i-amphtml-overlay"):ma(a,function(a){var b=a.matches||a.webkitMatchesSelector||a.mozMatchesSelector||a.msMatchesSelector||a.oMatchesSelector;return b?b.call(a,".i-amphtml-overlay"):!1})};function O(a,b){var c,d=this;this.da=N(a,"timer");this.ja=b;this.ga=c||0;this.F=-1;this.V=0;this.W=!1;this.ea=function(){d.F=-1;d.V=0;d.W=!0;d.ja();d.W=!1}}O.prototype.isPending=function(){return-1!=this.F};O.prototype.schedule=function(a){var b=a||this.ga;this.W&&10>b&&(b=10);var c=Date.now()+b;return!this.isPending()||-10>c-this.V?(this.cancel(),this.V=c,this.F=this.da.delay(this.ea,b),!0):!1};O.prototype.cancel=function(){this.isPending()&&(this.da.cancel(this.F),this.F=-1)};function oa(a,b){try{return JSON.parse(a)}catch(c){return b&&b(c),null}};function pa(a){if(!qa(a))return null;var b=a.indexOf("{");try{return JSON.parse(a.substr(b))}catch(c){return A().error("MESSAGING","Failed to parse message: "+a,c),null}}function qa(a){return"string"==typeof a&&0==a.indexOf("amp-")&&-1!=a.indexOf("{")};function ra(a,b){for(var c=[],d=0,e=0;e<a.length;e++){var f=a[e];b(f,e,a)?c.push(f):(d<e&&(a[d]=f),d++)}d<a.length&&(a.length=d)};var P,sa="Webkit webkit Moz moz ms O o".split(" ");function ta(a,b){var c;var d=a.style;P||(P=D());var e=P.zIndex;if(!e){e="zIndex";if(void 0===d.zIndex){var f;b:{for(f=0;f<sa.length;f++){var g=sa[f]+"ZIndex";if(void 0!==d[g]){f=g;break b}}f=""}void 0!==d[f]&&(e=f)}P.zIndex=e}d=e;d&&(a.style[d]=c?b+c:b)}function ua(a,b){void 0===b&&(b=a.hasAttribute("hidden"));b?a.removeAttribute("hidden"):a.setAttribute("hidden","")};function va(a,b,c){var d=a.listeningFors;!d&&c&&(d=a.listeningFors=Object.create(null));a=d||null;if(!a)return a;var e=a[b];!e&&c&&(e=a[b]=[]);return e||null}function wa(a,b,c){var d=c?b.getAttribute("data-amp-3p-sentinel"):"amp";a=va(a,d,!0);for(d=0;d<a.length;d++){var e=a[d];if(e.frame===b){var f=e;break}}f||(f={frame:b,events:Object.create(null)},a.push(f));return f.events}
    function xa(a){for(var b=E({sentinel:"unlisten"}),c=a.length-1;0<=c;c--){var d=a[c];if(!d.frame.contentWindow){a.splice(c,1);var e=d.events,f;for(f in e)e[f].splice(0,Infinity).forEach(function(a){a(b)})}}}
    function ya(a){if(!a.listeningFors){var b=function(b){if(b.data){var c=za(b.data);if(c&&c.sentinel){var e=b.source;var f=va(a,c.sentinel);if(f){for(var g,m=0;m<f.length;m++){var p=f[m],k=p.frame.contentWindow;if(k){var l;if(!(l=e==k))b:{for(l=e;l&&l!=l.parent;l=l.parent)if(l==k){l=!0;break b}l=!1}if(l){g=p;break}}else setTimeout(xa,0,f)}e=g?g.events:null}else e=f;var q=e;if(q){var r=q[c.type];if(r)for(r=r.slice(),e=0;e<r.length;e++)(0,r[e])(c,b.source,b.origin,b)}}}};a.addEventListener("message",
    b)}}function Q(a,b,c,d,e,f){function g(b,d,g,m){if("amp"==b.sentinel){if(d!=a.contentWindow)return;var k="null"==g&&f;if(p!=g&&!k)return}if(e||d==a.contentWindow)"unlisten"==b.sentinel?l():c(b,d,g,m)}var m=a.ownerDocument.defaultView;ya(m);d=wa(m,a,d);var p=ha(a.src).origin,k=d[b]||(d[b]=[]),l;k.push(g);return l=function(){if(g){var a=k.indexOf(g);-1<a&&k.splice(a,1);c=k=g=null}}}
    function Aa(a,b,c,d,e){if(a.contentWindow)for(d.type=c,d.sentinel=e?a.getAttribute("data-amp-3p-sentinel"):"amp",a=d,e&&(a="amp-"+JSON.stringify(d)),d=0;d<b.length;d++)e=b[d],e.win.postMessage(a,e.origin)}function za(a){"string"==typeof a&&(a="{"==a.charAt(0)?oa(a,function(a){A().warn("IFRAME-HELPER","Postmessage could not be parsed. Is it in a valid JSON format?",a)})||null:qa(a)?pa(a):null);return a}
    function R(a,b,c){var d=this;this.h=a;this.R=b;this.B=[];this.la=Q(this.h,"send-intersections",function(a,b,g){d.B.some(function(a){return a.win==b})||d.B.push({win:b,origin:g});c(a,b,g)},this.R,this.R)}R.prototype.send=function(a,b){ra(this.B,function(a){return!a.win.parent});Aa(this.h,this.B,a,b,this.R)};R.prototype.destroy=function(){this.la();this.B.length=0};var S=[[300,250],[320,50],[300,50],[320,100]];
    function Ba(a){var b=(a.getAttribute("allow")||"").trim();a.setAttribute("allow","execution-while-not-rendered 'none';"+b)};function T(a,b,c,d){return{left:a,top:b,width:c,height:d,bottom:b+d,right:a+c,x:a,y:b}}function Ca(a){for(var b=-Infinity,c=Infinity,d=-Infinity,e=Infinity,f=0;f<arguments.length;f++){var g=arguments[f];if(g&&(b=Math.max(b,g.left),c=Math.min(c,g.left+g.width),d=Math.max(d,g.top),e=Math.min(e,g.top+g.height),c<b||e<d))return null}return Infinity==c?null:T(b,d,c-b,e-d)}function U(a,b,c){return 0==b&&0==c||0==a.width&&0==a.height?a:T(a.left+b,a.top+c,a.width,a.height)};var Da=[0,.05,.1,.15,.2,.25,.3,.35,.4,.45,.5,.55,.6,.65,.7,.75,.8,.85,.9,.95,1],Ea=Date.now();function V(a,b){var c,d=this;this.O=a;this.o=null;this.T=this.X=!1;this.L=null;this.M=a.getViewport();this.Z=new R(b,c||!1,function(){Fa(d)});this.o=new Ga(function(a){for(var b=0;b<a.length;b++)delete a[b].target;d.Z.send("intersection",E({changes:a}))});this.o.tick(this.M.getRect());this.fire=function(){d.X&&d.T&&d.o.tick(d.M.getRect())}}
    function Fa(a){a.X=!0;a.o.observe(a.O.element);a.O.getVsync().measure(function(){a.T=a.O.isInViewport();a.fire()});var b=a.M.onScroll(a.fire),c=a.M.onChanged(a.fire);a.L=function(){b();c()}}V.prototype.onViewportCallback=function(a){this.T=a};V.prototype.destroy=function(){this.X=!1;this.o.disconnect();this.o=null;this.L&&(this.L(),this.L=null);this.Z.destroy();this.Z=null};
    function Ga(a){var b={threshold:Da};this.aa=a;var c=b&&b.threshold;c=c?Array.isArray(c)?c:[c]:[0];for(a=0;a<c.length;a++){var d=c[a];"number"===typeof d&&isFinite(d)}this.ka=c.sort();this.U=null;this.ca=void 0;this.j=[];this.w=this.C=null}h=Ga.prototype;h.disconnect=function(){this.j.length=0;Ha(this)};
    h.observe=function(a){for(var b=0;b<this.j.length;b++)if(this.j[b].element===a){A().warn("INTERSECTION-OBSERVER","should observe same element once");return}var c={element:a,currentThresholdSlot:0};this.U&&(b=Ia(this,c,this.U,this.ca))&&this.aa([b]);b=M(a);if(b.win.MutationObserver&&!this.C){this.w=new O(b.win,this.ia.bind(this,a));var d=J(a,"hidden-observer");this.C=d.add(this.ha.bind(this))}this.j.push(c)};
    h.unobserve=function(a){for(var b=0;b<this.j.length;b++)if(this.j[b].element===a){this.j.splice(b,1);0>=this.j.length&&Ha(this);return}A().warn("INTERSECTION-OBSERVER","unobserve non-observed element")};h.tick=function(a,b){b&&(a=U(a,-b.left,-b.top),b=U(b,-b.left,-b.top));this.U=a;this.ca=b;for(var c=[],d=0;d<this.j.length;d++){var e=Ia(this,this.j[d],a,b);e&&c.push(e)}c.length&&this.aa(c)};
    function Ia(a,b,c,d){var e=b.element,f=e.getLayoutBox(),g=e.getOwner(),m=g&&g.getLayoutBox(),p=Ca(f,m,c,d)||T(0,0,0,0),k=p;g=f;k=k.width*k.height;g=g.width*g.height;g=0===g?0:k/g;a=a.ka;k=0;var l=a.length;if(0==g)a=0;else{for(var q=(k+l)/2|0;k<q;)g<a[q]?l=q:k=q,q=(k+l)/2|0;a=l}var r=a;if(r==b.currentThresholdSlot)return null;b.currentThresholdSlot=r;c=d?null:c;d=p;a=f;if(k=c)d=U(d,-c.left,-c.top),a=U(a,-c.left,-c.top),k=U(k,-c.left,-c.top);var Ja={time:"undefined"!==typeof performance&&performance.now?
    performance.now():Date.now()-Ea,rootBounds:k,boundingClientRect:a,intersectionRect:d,intersectionRatio:g,target:e};return Ja}h.ha=function(){this.w.isPending()||this.w.schedule(16)};h.ia=function(a){var b=this,c=la(a,"viewport"),d=la(a,"resources");d.onNextPass(function(){b.tick(c.getRect())})};function Ha(a){a.C&&a.C();a.C=null;a.w&&a.w.cancel();a.w=null};var Ka={"AMP-FX-FLYING-CARPET":!0,"AMP-LIGHTBOX":!0,"AMP-STICKY-AD":!0,"AMP-LIGHTBOX-GALLERY":!0};var La="allowfullscreen allowpaymentrequest allowtransparency allow frameborder referrerpolicy scrolling tabindex".split(" "),Ma=0,Na=0;function W(a){a=AMP.BaseElement.call(this,a)||this;a.K=null;a.I=!1;a.S=!1;a.D=!1;a.ba=!1;a.P=null;a.h=null;a.J=!1;a.l=null;a.A="";a.iframeSrc=null;a.H=null;a.m=null;return a}var X=AMP.BaseElement;W.prototype=aa(X.prototype);W.prototype.constructor=W;
    if(v)v(W,X);else for(var Y in X)if("prototype"!=Y)if(Object.defineProperties){var Oa=Object.getOwnPropertyDescriptor(X,Y);Oa&&Object.defineProperty(W,Y,Oa)}else W[Y]=X[Y];W.na=X.prototype;h=W.prototype;h.isLayoutSupported=function(a){return"fixed"==a||"fixed-height"==a||"responsive"==a||"fill"==a||"flex-item"==a||"fluid"==a||"intrinsic"==a};
    function Pa(a,b,c){var d=window.location.href;c=void 0===c?"":c;a=a.element;var e=J(a,"url"),f=e.parse(b),g=f.hostname,m=f.protocol;f=f.origin;B(e.isSecure(b)||"data:"==m,"Invalid <amp-iframe> src. Must start with https://. Found %s",a);var p=e.parse(d);B(!Qa(c,"allow-same-origin")||f!=p.origin&&"data:"!=m,"Origin of <amp-iframe> must not be equal to container %sif allow-same-origin is set. See https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.",a);B(!(ea(g,
    "."+da.thirdPartyFrameHost)||ea(g,".ampproject.org")),"amp-iframe does not allow embedding of frames from ampproject.*: %s",b);return b}
    function Ra(a){var b=a.element.getLayoutBox(),c=Math.min(600,.75*a.getViewport().getSize().height);B(b.top>=c,"<amp-iframe> elements must be positioned outside the first 75% of the viewport or 600px from the top (whichever is smaller): %s  Current position %s. Min: %sPositioning rules don't apply for iframes that use `placeholder`.See https://github.com/ampproject/amphtml/blob/master/extensions/amp-iframe/amp-iframe.md#iframe-with-placeholder for details.",a.element,b.top,c)}
    function Qa(a,b){var c=new RegExp("\\s"+b+"\\s","i");return c.test(" "+a+" ")}function Sa(a,b){if(b){a=J(a.element,"url").parse(b);var c=a.hash;"data:"==a.protocol||c&&"#"!=c||(a=b.indexOf("#"),b=(-1==a?b:b.substring(0,a))+"#amp=1");return b}}
    h.firstAttachedCallback=function(){this.A=this.element.getAttribute("sandbox");var a;if(!(a=Sa(this,this.element.getAttribute("src"))))if(a=this.element.getAttribute("srcdoc")){B(!(" "+this.A+" ").match(/\s+allow-same-origin\s+/i),"allow-same-origin is not allowed with the srcdoc attribute %s.",this.element);if("undefined"!==typeof TextEncoder)var b=(new TextEncoder("utf-8")).encode(a);else{a=unescape(encodeURIComponent(a));b=new Uint8Array(a.length);for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);
    b[c]=d}}a=btoa;c=Array(b.length);for(d=0;d<b.length;d++)c[d]=String.fromCharCode(b[d]);b=c.join("");a="data:text/html;charset=utf-8;base64,"+a(b)}else a=void 0;var e=a;this.iframeSrc=Pa(this,e,this.A)};h.preconnectCallback=function(a){this.iframeSrc&&N(this.win,"preconnect").url(this.getAmpDoc(),this.iframeSrc,a)};
    h.buildCallback=function(){this.K=this.getPlaceholder();this.I=!!this.K;(this.J=this.element.hasAttribute("resizable"))&&this.element.setAttribute("scrolling","no");this.element.hasAttribute("frameborder")||this.element.setAttribute("frameborder","0");var a=this.element;if("no"!=a.getAttribute("scrolling")){var b=a.ownerDocument.createElement("i-amphtml-scroll-container");a.appendChild(b);a=b}this.H=a;Ta(this)};
    h.onLayoutMeasure=function(){Ua(this);var a=this.element;a:{var b=a.getLayoutBox();var c=b.height;b=b.width;for(var d=0;d<S.length;d++){var e=S[d][0],f=S[d][1];if(!(f>c||e>b)&&20>=c-f&&20>=b-e){c=!0;break a}}c=!1}this.S=c;c=this.element;b=c.getLayoutBox();this.D=10<b.width||10<b.height?!1:!na(c);if(c=this.S){c=this.win;b=!1;d=0;do Ka[a.tagName]?(d++,b=!1):(e=(c.getComputedStyle(a)||D()).position,"fixed"!=e&&"sticky"!=e||(b=!0)),a=a.parentElement;while(a&&"BODY"!=a.tagName);c=!(!b&&1>=d)}this.ba=c;
    this.l&&this.l.fire()};function Ua(a){if(a.h){var b=a.getViewport().getLayoutRect(a.h),c=a.getLayoutBox();a.P=U(b,-c.left,-c.top)}}h.getIntersectionElementLayoutBox=function(){if(!this.h)return AMP.BaseElement.prototype.getIntersectionElementLayoutBox.call(this);var a=this.getLayoutBox();this.P||Ua(this);return U(this.P,a.left,a.top)};
    h.layoutCallback=function(){var a=this;B(!this.ba,"amp-iframe is not used for displaying fixed ad. Please use amp-sticky-ad and amp-ad instead.");this.I||Ra(this);this.J&&B(this.getOverflowElement(),"Overflow element must be defined for resizable frames: %s",this.element);if(!this.iframeSrc)return Promise.resolve();if(this.D&&(Na++,1<Na))return console.error("Only 1 analytics/tracking iframe allowed per page. Please use amp-analytics instead or file a GitHub issue for your use case: https://github.com/ampproject/amphtml/issues/new"),
    Promise.resolve();var b=this.element.ownerDocument.createElement("iframe");this.h=b;this.applyFillContent(b);b.name="amp_iframe"+Ma++;this.I&&ta(b,-1);this.propagateAttributes(La,b);var c=b.getAttribute("allow")||"";c=c.replace("autoplay","autoplay-disabled");b.setAttribute("allow",c);Va(b,this.A);H(this.win,"pausable-iframe")&&Ba(this.h);b.src=this.iframeSrc;this.D||(this.l=new V(this,b));b.onload=function(){b.readyState="complete";a.$();a.D&&(a.iframeSrc=null,N(a.win,"timer").promise(5E3).then(function(){b.parentElement&&
    b.parentElement.removeChild(b);a.element.setAttribute("amp-removed","");a.h=null}))};Q(b,"embed-size",function(b){Wa(a,b.height,b.width)},void 0,void 0,!0);this.I&&Q(b,"embed-ready",this.$.bind(this));this.H.appendChild(b);return this.loadPromise(b).then(function(){a.H!=a.element&&N(a.win,"timer").delay(function(){a.mutateElement(function(){a.H.classList.add("amp-active")})},1E3)})};h.unlayoutOnPause=function(){return!Z(this)};h.pauseCallback=function(){Z(this)&&ua(this.h,!1)};
    h.resumeCallback=function(){Z(this)&&ua(this.h,!0)};function Z(a){var b;if(b=H(a.win,"pausable-iframe")&&!!a.h)a=a.h,b=!!a.featurePolicy&&-1!=a.featurePolicy.features().indexOf("execution-while-not-rendered")&&!a.featurePolicy.allowsFeature("execution-while-not-rendered");return b}h.unlayoutCallback=function(){if(this.h){var a=this.h;a.parentElement&&a.parentElement.removeChild(a);this.K&&this.togglePlaceholder(!0);this.h=null;this.l&&(this.l.destroy(),this.l=null)}return!0};h.viewportCallback=function(a){if(this.l)this.l.onViewportCallback(a)};
    h.getLayoutPriority=function(){return this.S?2:this.D?1:AMP.BaseElement.prototype.getLayoutPriority.call(this)};h.mutatedAttributesCallback=function(a){var b=a.src;void 0!==b&&(this.iframeSrc=Sa(this,b),this.h&&(this.h.src=Pa(this,this.iframeSrc,this.A)))};h.$=function(){var a=this;this.K&&this.getVsync().mutate(function(){a.h&&(ta(a.h,0),a.togglePlaceholder(!1))})};h.firstLayoutCompleted=function(){};
    h.throwIfCannotNavigate=function(){if(!Qa(this.A,"allow-top-navigation"))throw z().createError('"AMP.navigateTo" is only allowed on <amp-iframe> when its "sandbox" attribute contains "allow-top-navigation".');};
    function Wa(a,b,c){if(a.J)if(100>b)a.user().error("amp-iframe","Ignoring embed-size request because the resize height is less than 100px. If you are using amp-iframe to display ads, consider using amp-ad instead.",a.element);else{var d,e;b=parseInt(b,10);isNaN(b)||(d=Math.max(b+(a.element.offsetHeight-a.h.offsetHeight),b));c=parseInt(c,10);isNaN(c)||(e=Math.max(c+(a.element.offsetWidth-a.h.offsetWidth),c));void 0!==d||void 0!==e?a.attemptChangeSize(d,e).then(function(){void 0!==d&&a.element.setAttribute("height",
    d);void 0!==e&&a.element.setAttribute("width",e)},function(){}):a.user().error("amp-iframe","Ignoring embed-size request because no width or height value is provided",a.element)}else a.user().error("amp-iframe","Ignoring embed-size request because this iframe is not resizable",a.element)}
    function Ta(a){if(H(a.win,"iframe-messaging")){var b=a.element,c=b.getAttribute("src");c&&(a.m=J(b,"url").parse(c).origin);a.registerAction("postMessage",function(b){a.m?a.h.contentWindow.postMessage(b.args,a.m):z().error("amp-iframe",'"postMessage" action is only allowed with "src"attribute with an origin.')});if(a.m){var d=10,e=0,f=function(b){if(b.source===a.h.contentWindow)if(b.origin!==a.m)z().error("amp-iframe",'"message" received from unexpected origin: '+b.origin+". Only allowed from: "+a.m);
    else{if(a.getAmpDoc().getRootNode().activeElement!==a.h)var c=!1;else c=a.win.document.createElement("audio"),c.play(),c=c.paused?!1:!0;if(c){var g=b.data;try{var k=JSON.parse(JSON.stringify(g))}catch(r){z().error("amp-iframe",'Data from "message" event must be JSON.');return}var l=a.win;b=E({data:k});c={detail:b};Object.assign(c,void 0);"function"==typeof l.CustomEvent?b=new l.CustomEvent("amp-iframe:message",c):(l=l.document.createEvent("CustomEvent"),l.initCustomEvent("amp-iframe:message",!!c.bubbles,
    !!c.cancelable,b),b=l);var q=J(a.element,"action");q.trigger(a.element,"message",b,3)}else e++,z().error("amp-iframe",'"message" event may only be triggered from a user gesture.'),e>=d&&(z().error("amp-iframe",'Too many non-gesture-triggered "message" events; detaching event listener.'),a.win.removeEventListener("message",f))}};a.win.addEventListener("message",f)}}}h.ma=function(a){this.m=a};function Va(a,b){var c=b||"";a.setAttribute("sandbox",c)}(function(a){a.registerElement("amp-iframe",W)})(self.AMP);
    })});
