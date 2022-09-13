(function(){var e={8836:function(e,t,n){"use strict";var r=n(144),s=n(998),o=n(7394),i=function(){var e=this,t=e._self._c;return t(s.Z,[t("notifications"),t(o.Z5,[t("router-view")],1)],1)},a=[],c=n(629),u={name:"App",async created(){await this.getDashboard()},methods:{...(0,c.nv)(["getDashboard"])},computed:{...(0,c.rn)(["path","pathFrom"])}},l=u,d=n(1001),f=(0,d.Z)(l,i,a,!1,null,null,null),p=f.exports,g=n(707),h=n.n(g);r["default"].use(h());var m=new(h())({theme:{dark:!0},icons:{iconfont:"mdiSvg"}}),y=n(6132),v=n(7847),w=n(7666),b=n(5317),k=n(4765),F=n.n(k);r["default"].use(F()).use(w.Z,{icons:b}),new r["default"]({store:v.Z,vuetify:m,router:y.Z,render:e=>e(p)}).$mount("#app")},6132:function(e,t,n){"use strict";var r=n(144),s=n(8345),o=n(7847),i=n(7356);r["default"].use(s.ZP).use(i.Z);const a=(e,t)=>({name:e,path:t,component:()=>n(1413)(`./${e}`)}),c=[a("Dashboard","/"),a("Login","/login"),a("Register","/register"),{path:"*",redirect:{name:"Dashboard"}}],u=new s.ZP({routes:c,mode:"history"});u.beforeEach((({name:e},{name:t},n)=>{o.Z.commit("setLoading",!0),o.Z.commit("setPath",e),o.Z.commit("setPathFrom",t),n()})),t["Z"]=u},7847:function(e,t,n){"use strict";n(8675),n(7380),n(1118);var r=n(144),s=n(629),o=n(9367),i=n(9669),a=n.n(i),c=n(6132),u=n(1354),l=n.n(u);const d=a().create({baseURL:"https://e2ee-bs-app.cloud/api",withCredentials:!0});function f(e,t){try{const n=l().AES.decrypt(e.toString(),t),r=n.toString(l().enc.Utf8);if(r)return JSON.parse(r)}catch{return null}}function p(e){let t=0,n=0;e.map((e=>(n+=e.byteLength,e)));var r=new ArrayBuffer(n),s=new Uint8Array(r);return e.forEach((e=>{s.set(new Uint8Array(e.buffer||e,e.byteOffset),t),t+=e.byteLength})),r}r["default"].use(s.ZP);const g=new s.ZP.Store({state:{user:null,newUser:null,socket:null,path:null,pathFrom:null,currentMessage:null,currentFetchedFile:null,currentMultiple:null,files:[],tempDecryptedFiles:[],messages:[],fetchingFiles:{type:null,running:!1},currentDownload:{messageId:null,percentage:0},loading:!1},mutations:{setNewUser(e,t){e.newUser=t},setUser(e,t){e.user=t},setSocket(e,t){e.socket=t},setPath(e,t){e.path=t},setFiles(e,t){e.files=t},setTempDecryptedFiles(e,t){e.tempDecryptedFiles=t},setCurrentMessage(e,t){e.currentMessage=t},setFetchingFiles(e,t){e.fetchingFiles=t},setCurrentFetchedFile(e,t){e.currentFetchedFile=t},setMessages(e,t){e.messages=t},setCurrentDownloadMessage(e,t){e.currentDownload.messageId=t},setCurrentDownloadPercentage(e,t){e.currentDownload.percentage=t},setCurrentMultiple(e,t){e.currentMultiple=t},setLoading(e,t){e.loading=t},setPathFrom(e,t){e.pathFrom=t}},actions:{async initSocket({commit:e},t){const n=(0,o.ZP)("https://e2ee-bs-app.cloud",{withCredentials:!0,autoConnect:!1});if(e("setSocket",n),e("setUser",t),n.on("connect",(()=>{console.log("connected"),n.emit("connectUser")})),n.on("disconnect",(()=>{console.log("disconnected"),n.connect()})),n.on("connect_error",(e=>{console.log(e)})),n.connect(),"serviceWorker"in navigator)try{const e=await navigator.serviceWorker.register("/sw.js",{scope:"/"});e.installing?console.log("Service worker installing"):e.waiting?console.log("Service worker installed"):e.active&&console.log("Service worker active")}catch(r){console.error(`Registration failed with ${r}`)}},async getDashboard({state:e,commit:t,dispatch:n}){const{data:{user:r,success:s}}=await d.get("/");return 0==s&&"Login"!=e.path&&"Register"!=e.path?(c.Z.push("/login"),t("setSocket",null),t("setUser",null)):r&&!e.user&&(n("initSocket",r),"Dashboard"!=e.path)?c.Z.push("/"):void 0},async handleLogin({state:e,dispatch:t},{username:n,password:r}){const{data:{errorMessage:s,user:o}}=await d.post("/login",{username:n,password:r});return s?{errorMessage:s}:(e.user||(await t("initSocket",o),c.Z.push("/")),{})},async handleLogout({dispatch:e}){await d.delete("/logout"),e("logOut")},logOut({state:e,commit:t}){if(!e.user)return c.Z.push("/login");t("setUser",null),t("setSocket",null),c.Z.push("/login")},async handleRegister({commit:e},{username:t,password:n,token:r}){const{data:{errors:s,newUser:o}}=await d.post("/register",{username:t,password:n,token:r});return s?{errors:s}:(e("setNewUser",o),c.Z.push("/login"),{})},async handleGetMessages({dispatch:e}){const{data:{messages:t,success:n}}=await d.get("/messages");return 0==n?e("logOut"):t.map((e=>({...e,files:[]})))},async handleFetchFiles({state:e,commit:t,dispatch:n},{messageId:r,importedKey:s,key:o}){let{data:{files:i,success:a}}=await d.get(`/getFiles/${r}`);if(0==a)return n("logOut");if(!i.length)return[];i=i.filter((t=>t.uuid!=e.currentFetchedFile)),t("setCurrentMessage",r);let c=[],u=[];return await new Promise((async n=>{e.socket.on("chunk",(async({iv:r,encrypted:a,percentage:l,messageId:d,finished:g,fileName:h,fileType:m,uuid:y})=>{const v=await crypto.subtle.decrypt({name:"AES-GCM",iv:r},s,a);if(u.push(v),e.socket.emit("done",y),!g)return c.includes(l)||(c.push(l),e.currentDownload.messageId!=d&&t("setCurrentDownloadMessage",d),t("setCurrentDownloadPercentage",l)),void(e.currentMultiple!=y&&t("setCurrentMultiple",y));c=[];const w=f(h,o),b=f(m,o),k=new File([p(u)],w,{type:b}),F=URL.createObjectURL(k);t("setTempDecryptedFiles",[...e.tempDecryptedFiles,{uuid:y,src:F,name:w,type:b,fileSize:k.size}]),u=[],e.tempDecryptedFiles.length==i.length&&(t("setCurrentDownloadPercentage",0),n())}));for(const{uuid:t}of i)await new Promise((r=>{e.socket.emit("getChunks",t,(e=>{if(404==e&&(i=i.filter((e=>e.uuid!=t))),i.length)return r();n(),r()}))}))})),e.socket.off("chunk"),e.tempDecryptedFiles},async handleFetchFile({state:e,commit:t},{messageId:n,uuid:r,importedKey:s,key:o}){t("setCurrentMessage",n),t("setCurrentFetchedFile",r);let i=[],a=[];return await new Promise((n=>{e.socket.on("chunk",(async({iv:r,encrypted:c,percentage:u,messageId:l,finished:d,fileName:g,fileType:h,uuid:m})=>{const y=await crypto.subtle.decrypt({name:"AES-GCM",iv:r},s,c);if(a.push(y),e.socket.emit("done",m),!d)return void(i.includes(u)||(i.push(u),e.currentDownload.messageId!=l&&t("setCurrentDownloadMessage",l),t("setCurrentDownloadPercentage",u)));const v=f(g,o),w=f(h,o),b=new File([p(a)],v,{type:w}),k=URL.createObjectURL(b);t("setTempDecryptedFiles",[...e.tempDecryptedFiles,{uuid:m,src:k,name:v,type:w,fileSize:b.size}]),t("setCurrentDownloadPercentage",0),i=[],a=[],n()})),e.socket.emit("getChunks",r,(e=>{if(404==e)return t("setCurrentMessage",null),t("setCurrentFetchedFile",null),n()}))})),e.socket.off("chunk"),e.tempDecryptedFiles},async handleSendMessage({state:e},{message:t,files:n,fileDescriptions:r}){const s=await new Promise((async s=>{e.socket.emit("newMessage",{message:t,files:n,fileDescriptions:r},(e=>s(e)))}));return s}},getters:{}});t["Z"]=g},1413:function(e,t,n){var r={"./Dashboard":[6864,481,995,11,353],"./Dashboard.vue":[6864,481,995,11,353],"./Files":[2090,481,90],"./Files.vue":[2090,481,90],"./Login":[1649,481,995,971,649],"./Login.vue":[1649,481,995,971,649],"./Message":[5011,481,11,349],"./Message.vue":[5011,481,11,349],"./Messages":[2488,481,11,218],"./Messages.vue":[2488,481,11,218],"./Register":[5757,481,995,971,757],"./Register.vue":[5757,481,995,971,757]};function s(e){if(!n.o(r,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=r[e],s=t[0];return Promise.all(t.slice(1).map(n.e)).then((function(){return n(s)}))}s.keys=function(){return Object.keys(r)},s.id=1413,e.exports=s},2480:function(){}},t={};function n(r){var s=t[r];if(void 0!==s)return s.exports;var o=t[r]={id:r,loaded:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.loaded=!0,o.exports}n.m=e,function(){var e=[];n.O=function(t,r,s,o){if(!r){var i=1/0;for(l=0;l<e.length;l++){r=e[l][0],s=e[l][1],o=e[l][2];for(var a=!0,c=0;c<r.length;c++)(!1&o||i>=o)&&Object.keys(n.O).every((function(e){return n.O[e](r[c])}))?r.splice(c--,1):(a=!1,o<i&&(i=o));if(a){e.splice(l--,1);var u=s();void 0!==u&&(t=u)}}return t}o=o||0;for(var l=e.length;l>0&&e[l-1][2]>o;l--)e[l]=e[l-1];e[l]=[r,s,o]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,r){return n.f[r](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+e+"."+{11:"ef6ac10d",90:"32daa44f",218:"ce6d9c90",349:"4c939938",353:"3fbf3967",481:"a97f97b1",649:"26adc591",757:"35b29aa9",971:"1a933e4a",995:"ddcbcf3b"}[e]+".js"}}(),function(){n.miniCssF=function(e){return"css/"+e+"."+{90:"abc9b748",218:"749f5173",349:"837931e1",353:"4f6986b5",481:"7d78d3dc",649:"6a348566",757:"7a8f0abe",995:"7813764e"}[e]+".css"}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="frontend:";n.l=function(r,s,o,i){if(e[r])e[r].push(s);else{var a,c;if(void 0!==o)for(var u=document.getElementsByTagName("script"),l=0;l<u.length;l++){var d=u[l];if(d.getAttribute("src")==r||d.getAttribute("data-webpack")==t+o){a=d;break}}a||(c=!0,a=document.createElement("script"),a.charset="utf-8",a.timeout=120,n.nc&&a.setAttribute("nonce",n.nc),a.setAttribute("data-webpack",t+o),a.src=r),e[r]=[s];var f=function(t,n){a.onerror=a.onload=null,clearTimeout(p);var s=e[r];if(delete e[r],a.parentNode&&a.parentNode.removeChild(a),s&&s.forEach((function(e){return e(n)})),t)return t(n)},p=setTimeout(f.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=f.bind(null,a.onerror),a.onload=f.bind(null,a.onload),c&&document.head.appendChild(a)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.nmd=function(e){return e.paths=[],e.children||(e.children=[]),e}}(),function(){n.p="/"}(),function(){var e=function(e,t,n,r){var s=document.createElement("link");s.rel="stylesheet",s.type="text/css";var o=function(o){if(s.onerror=s.onload=null,"load"===o.type)n();else{var i=o&&("load"===o.type?"missing":o.type),a=o&&o.target&&o.target.href||t,c=new Error("Loading CSS chunk "+e+" failed.\n("+a+")");c.code="CSS_CHUNK_LOAD_FAILED",c.type=i,c.request=a,s.parentNode.removeChild(s),r(c)}};return s.onerror=s.onload=o,s.href=t,document.head.appendChild(s),s},t=function(e,t){for(var n=document.getElementsByTagName("link"),r=0;r<n.length;r++){var s=n[r],o=s.getAttribute("data-href")||s.getAttribute("href");if("stylesheet"===s.rel&&(o===e||o===t))return s}var i=document.getElementsByTagName("style");for(r=0;r<i.length;r++){s=i[r],o=s.getAttribute("data-href");if(o===e||o===t)return s}},r=function(r){return new Promise((function(s,o){var i=n.miniCssF(r),a=n.p+i;if(t(i,a))return s();e(r,a,s,o)}))},s={143:0};n.f.miniCss=function(e,t){var n={90:1,218:1,349:1,353:1,481:1,649:1,757:1,995:1};s[e]?t.push(s[e]):0!==s[e]&&n[e]&&t.push(s[e]=r(e).then((function(){s[e]=0}),(function(t){throw delete s[e],t})))}}(),function(){var e={143:0};n.f.j=function(t,r){var s=n.o(e,t)?e[t]:void 0;if(0!==s)if(s)r.push(s[2]);else if(349!=t){var o=new Promise((function(n,r){s=e[t]=[n,r]}));r.push(s[2]=o);var i=n.p+n.u(t),a=new Error,c=function(r){if(n.o(e,t)&&(s=e[t],0!==s&&(e[t]=void 0),s)){var o=r&&("load"===r.type?"missing":r.type),i=r&&r.target&&r.target.src;a.message="Loading chunk "+t+" failed.\n("+o+": "+i+")",a.name="ChunkLoadError",a.type=o,a.request=i,s[1](a)}};n.l(i,c,"chunk-"+t,t)}else e[t]=0},n.O.j=function(t){return 0===e[t]};var t=function(t,r){var s,o,i=r[0],a=r[1],c=r[2],u=0;if(i.some((function(t){return 0!==e[t]}))){for(s in a)n.o(a,s)&&(n.m[s]=a[s]);if(c)var l=c(n)}for(t&&t(r);u<i.length;u++)o=i[u],n.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return n.O(l)},r=self["webpackChunkfrontend"]=self["webpackChunkfrontend"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=n.O(void 0,[998],(function(){return n(8836)}));r=n.O(r)})();