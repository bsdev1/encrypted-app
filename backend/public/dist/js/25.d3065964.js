(self["webpackChunkfrontend"]=self["webpackChunkfrontend"]||[]).push([[25],{3025:function(e,t,i){"use strict";i.r(t),i.d(t,{default:function(){return L}});var s=i(4562),n=i(7394),o=i(4324),a=i(4712),r=i(6878),l=i(7678),d=i(5352);const h=(0,l.Z)(r.Z,(0,a.f)("treeview")),c={activatable:Boolean,activeClass:{type:String,default:"v-treeview-node--active"},color:{type:String,default:"primary"},disablePerNode:Boolean,expandIcon:{type:String,default:"$subgroup"},indeterminateIcon:{type:String,default:"$checkboxIndeterminate"},itemChildren:{type:String,default:"children"},itemDisabled:{type:String,default:"disabled"},itemKey:{type:String,default:"id"},itemText:{type:String,default:"name"},loadChildren:Function,loadingIcon:{type:String,default:"$loading"},offIcon:{type:String,default:"$checkboxOff"},onIcon:{type:String,default:"$checkboxOn"},openOnClick:Boolean,rounded:Boolean,selectable:Boolean,selectedColor:{type:String,default:"accent"},shaped:Boolean,transition:Boolean,selectionType:{type:String,default:"leaf",validator:e=>["leaf","independent"].includes(e)}},p=h.extend().extend({name:"v-treeview-node",inject:{treeview:{default:null}},props:{level:Number,item:{type:Object,default:()=>null},parentIsDisabled:Boolean,...c},data:()=>({hasLoaded:!1,isActive:!1,isIndeterminate:!1,isLoading:!1,isOpen:!1,isSelected:!1}),computed:{disabled(){return(0,d.vO)(this.item,this.itemDisabled)||!this.disablePerNode&&this.parentIsDisabled&&"leaf"===this.selectionType},key(){return(0,d.vO)(this.item,this.itemKey)},children(){const e=(0,d.vO)(this.item,this.itemChildren);return e&&e.filter((e=>!this.treeview.isExcluded((0,d.vO)(e,this.itemKey))))},text(){return(0,d.vO)(this.item,this.itemText)},scopedProps(){return{item:this.item,leaf:!this.children,selected:this.isSelected,indeterminate:this.isIndeterminate,active:this.isActive,open:this.isOpen}},computedIcon(){return this.isIndeterminate?this.indeterminateIcon:this.isSelected?this.onIcon:this.offIcon},hasChildren(){return!!this.children&&(!!this.children.length||!!this.loadChildren)}},created(){this.treeview.register(this)},beforeDestroy(){this.treeview.unregister(this)},methods:{checkChildren(){return new Promise((e=>{if(!this.children||this.children.length||!this.loadChildren||this.hasLoaded)return e();this.isLoading=!0,e(this.loadChildren(this.item))})).then((()=>{this.isLoading=!1,this.hasLoaded=!0}))},open(){this.isOpen=!this.isOpen,this.treeview.updateOpen(this.key,this.isOpen),this.treeview.emitOpen()},genLabel(){const e=[];return this.$scopedSlots.label?e.push(this.$scopedSlots.label(this.scopedProps)):e.push(this.text),this.$createElement("div",{slot:"label",staticClass:"v-treeview-node__label"},e)},genPrependSlot(){return this.$scopedSlots.prepend?this.$createElement("div",{staticClass:"v-treeview-node__prepend"},this.$scopedSlots.prepend(this.scopedProps)):null},genAppendSlot(){return this.$scopedSlots.append?this.$createElement("div",{staticClass:"v-treeview-node__append"},this.$scopedSlots.append(this.scopedProps)):null},genContent(){const e=[this.genPrependSlot(),this.genLabel(),this.genAppendSlot()];return this.$createElement("div",{staticClass:"v-treeview-node__content"},e)},genToggle(){return this.$createElement(o.Z,{staticClass:"v-treeview-node__toggle",class:{"v-treeview-node__toggle--open":this.isOpen,"v-treeview-node__toggle--loading":this.isLoading},slot:"prepend",on:{click:e=>{e.stopPropagation(),this.isLoading||this.checkChildren().then((()=>this.open()))}}},[this.isLoading?this.loadingIcon:this.expandIcon])},genCheckbox(){return this.$createElement(o.Z,{staticClass:"v-treeview-node__checkbox",props:{color:this.isSelected||this.isIndeterminate?this.selectedColor:void 0,disabled:this.disabled},on:{click:e=>{e.stopPropagation(),this.isLoading||this.checkChildren().then((()=>{this.$nextTick((()=>{this.isSelected=!this.isSelected,this.isIndeterminate=!1,this.treeview.updateSelected(this.key,this.isSelected),this.treeview.emitSelected()}))}))}}},[this.computedIcon])},genLevel(e){return(0,d.MT)(e).map((()=>this.$createElement("div",{staticClass:"v-treeview-node__level"})))},genNode(){const e=[this.genContent()];return this.selectable&&e.unshift(this.genCheckbox()),this.hasChildren?e.unshift(this.genToggle()):e.unshift(...this.genLevel(1)),e.unshift(...this.genLevel(this.level)),this.$createElement("div",this.setTextColor(this.isActive&&this.color,{staticClass:"v-treeview-node__root",class:{[this.activeClass]:this.isActive},on:{click:()=>{this.openOnClick&&this.hasChildren?this.checkChildren().then(this.open):this.activatable&&!this.disabled&&(this.isActive=!this.isActive,this.treeview.updateActive(this.key,this.isActive),this.treeview.emitActive())}}}),e)},genChild(e,t){return this.$createElement(p,{key:(0,d.vO)(e,this.itemKey),props:{activatable:this.activatable,activeClass:this.activeClass,item:e,selectable:this.selectable,selectedColor:this.selectedColor,color:this.color,disablePerNode:this.disablePerNode,expandIcon:this.expandIcon,indeterminateIcon:this.indeterminateIcon,offIcon:this.offIcon,onIcon:this.onIcon,loadingIcon:this.loadingIcon,itemKey:this.itemKey,itemText:this.itemText,itemDisabled:this.itemDisabled,itemChildren:this.itemChildren,loadChildren:this.loadChildren,transition:this.transition,openOnClick:this.openOnClick,rounded:this.rounded,shaped:this.shaped,level:this.level+1,selectionType:this.selectionType,parentIsDisabled:t},scopedSlots:this.$scopedSlots})},genChildrenWrapper(){if(!this.isOpen||!this.children)return null;const e=[this.children.map((e=>this.genChild(e,this.disabled)))];return this.$createElement("div",{staticClass:"v-treeview-node__children"},e)},genTransition(){return this.$createElement(n.Fx,[this.genChildrenWrapper()])}},render(e){const t=[this.genNode()];return this.transition?t.push(this.genTransition()):t.push(this.genChildrenWrapper()),e("div",{staticClass:"v-treeview-node",class:{"v-treeview-node--leaf":!this.hasChildren,"v-treeview-node--click":this.openOnClick,"v-treeview-node--disabled":this.disabled,"v-treeview-node--rounded":this.rounded,"v-treeview-node--shaped":this.shaped,"v-treeview-node--selected":this.isSelected},attrs:{"aria-expanded":String(this.isOpen)}},t)}});var u=p,v=i(6669),m=i(1909);function f(e,t,i){const s=(0,d.vO)(e,i);return s.toLocaleLowerCase().indexOf(t.toLocaleLowerCase())>-1}function g(e,t,i,s,n,o,a){if(e(t,i,n))return!0;const r=(0,d.vO)(t,o);if(r){let t=!1;for(let l=0;l<r.length;l++)g(e,r[l],i,s,n,o,a)&&(t=!0);if(t)return!0}return a.add((0,d.vO)(t,s)),!1}var y=(0,l.Z)((0,a.J)("treeview"),v.Z).extend({name:"v-treeview",provide(){return{treeview:this}},props:{active:{type:Array,default:()=>[]},dense:Boolean,disabled:Boolean,filter:Function,hoverable:Boolean,items:{type:Array,default:()=>[]},multipleActive:Boolean,open:{type:Array,default:()=>[]},openAll:Boolean,returnObject:{type:Boolean,default:!1},search:String,value:{type:Array,default:()=>[]},...c},data:()=>({level:-1,activeCache:new Set,nodes:{},openCache:new Set,selectedCache:new Set}),computed:{excludedItems(){const e=new Set;if(!this.search)return e;for(let t=0;t<this.items.length;t++)g(this.filter||f,this.items[t],this.search,this.itemKey,this.itemText,this.itemChildren,e);return e}},watch:{items:{handler(){const e=Object.keys(this.nodes).map((e=>(0,d.vO)(this.nodes[e].item,this.itemKey))),t=this.getKeys(this.items),i=(0,d.tX)(t,e);if(!i.length&&t.length<e.length)return;i.forEach((e=>delete this.nodes[e]));const s=[...this.selectedCache];this.selectedCache=new Set,this.activeCache=new Set,this.openCache=new Set,this.buildTree(this.items),(0,d.vZ)(s,[...this.selectedCache])||this.emitSelected()},deep:!0},active(e){this.handleNodeCacheWatcher(e,this.activeCache,this.updateActive,this.emitActive)},value(e){this.handleNodeCacheWatcher(e,this.selectedCache,this.updateSelected,this.emitSelected)},open(e){this.handleNodeCacheWatcher(e,this.openCache,this.updateOpen,this.emitOpen)}},created(){const e=e=>this.returnObject?(0,d.vO)(e,this.itemKey):e;this.buildTree(this.items);for(const t of this.value.map(e))this.updateSelected(t,!0,!0);for(const t of this.active.map(e))this.updateActive(t,!0)},mounted(){(this.$slots.prepend||this.$slots.append)&&(0,m.Kd)("The prepend and append slots require a slot-scope attribute",this),this.openAll?this.updateAll(!0):(this.open.forEach((e=>this.updateOpen(this.returnObject?(0,d.vO)(e,this.itemKey):e,!0))),this.emitOpen())},methods:{updateAll(e){Object.keys(this.nodes).forEach((t=>this.updateOpen((0,d.vO)(this.nodes[t].item,this.itemKey),e))),this.emitOpen()},getKeys(e,t=[]){for(let i=0;i<e.length;i++){const s=(0,d.vO)(e[i],this.itemKey);t.push(s);const n=(0,d.vO)(e[i],this.itemChildren);n&&t.push(...this.getKeys(n))}return t},buildTree(e,t=null){var i;for(let s=0;s<e.length;s++){const n=e[s],o=(0,d.vO)(n,this.itemKey),a=null!==(i=(0,d.vO)(n,this.itemChildren))&&void 0!==i?i:[],r=this.nodes.hasOwnProperty(o)?this.nodes[o]:{isSelected:!1,isIndeterminate:!1,isActive:!1,isOpen:!1,vnode:null},l={vnode:r.vnode,parent:t,children:a.map((e=>(0,d.vO)(e,this.itemKey))),item:n};if(this.buildTree(a,o),"independent"!==this.selectionType&&null!==t&&!this.nodes.hasOwnProperty(o)&&this.nodes.hasOwnProperty(t)?l.isSelected=this.nodes[t].isSelected:(l.isSelected=r.isSelected,l.isIndeterminate=r.isIndeterminate),l.isActive=r.isActive,l.isOpen=r.isOpen,this.nodes[o]=l,a.length&&"independent"!==this.selectionType){const{isSelected:e,isIndeterminate:t}=this.calculateState(o,this.nodes);l.isSelected=e,l.isIndeterminate=t}!this.nodes[o].isSelected||"independent"!==this.selectionType&&0!==l.children.length||this.selectedCache.add(o),this.nodes[o].isActive&&this.activeCache.add(o),this.nodes[o].isOpen&&this.openCache.add(o),this.updateVnodeState(o)}},calculateState(e,t){const i=t[e].children,s=i.reduce(((e,i)=>(e[0]+=+Boolean(t[i].isSelected),e[1]+=+Boolean(t[i].isIndeterminate),e)),[0,0]),n=!!i.length&&s[0]===i.length,o=!n&&(s[0]>0||s[1]>0);return{isSelected:n,isIndeterminate:o}},emitOpen(){this.emitNodeCache("update:open",this.openCache)},emitSelected(){this.emitNodeCache("input",this.selectedCache)},emitActive(){this.emitNodeCache("update:active",this.activeCache)},emitNodeCache(e,t){this.$emit(e,this.returnObject?[...t].map((e=>this.nodes[e].item)):[...t])},handleNodeCacheWatcher(e,t,i,s){e=this.returnObject?e.map((e=>(0,d.vO)(e,this.itemKey))):e;const n=[...t];(0,d.vZ)(n,e)||(n.forEach((e=>i(e,!1))),e.forEach((e=>i(e,!0))),s())},getDescendants(e,t=[]){const i=this.nodes[e].children;t.push(...i);for(let s=0;s<i.length;s++)t=this.getDescendants(i[s],t);return t},getParents(e){let t=this.nodes[e].parent;const i=[];while(null!==t)i.push(t),t=this.nodes[t].parent;return i},register(e){const t=(0,d.vO)(e.item,this.itemKey);this.nodes[t].vnode=e,this.updateVnodeState(t)},unregister(e){const t=(0,d.vO)(e.item,this.itemKey);this.nodes[t]&&(this.nodes[t].vnode=null)},isParent(e){return this.nodes[e].children&&this.nodes[e].children.length},updateActive(e,t){if(!this.nodes.hasOwnProperty(e))return;this.multipleActive||this.activeCache.forEach((e=>{this.nodes[e].isActive=!1,this.updateVnodeState(e),this.activeCache.delete(e)}));const i=this.nodes[e];i&&(t?this.activeCache.add(e):this.activeCache.delete(e),i.isActive=t,this.updateVnodeState(e))},updateSelected(e,t,i=!1){if(!this.nodes.hasOwnProperty(e))return;const s=new Map;if("independent"!==this.selectionType){for(const o of this.getDescendants(e))(0,d.vO)(this.nodes[o].item,this.itemDisabled)&&!i||(this.nodes[o].isSelected=t,this.nodes[o].isIndeterminate=!1,s.set(o,t));const n=this.calculateState(e,this.nodes);this.nodes[e].isSelected=t,this.nodes[e].isIndeterminate=n.isIndeterminate,s.set(e,t);for(const t of this.getParents(e)){const e=this.calculateState(t,this.nodes);this.nodes[t].isSelected=e.isSelected,this.nodes[t].isIndeterminate=e.isIndeterminate,s.set(t,e.isSelected)}}else this.nodes[e].isSelected=t,this.nodes[e].isIndeterminate=!1,s.set(e,t);for(const[n,o]of s.entries())this.updateVnodeState(n),"leaf"===this.selectionType&&this.isParent(n)||(!0===o?this.selectedCache.add(n):this.selectedCache.delete(n))},updateOpen(e,t){if(!this.nodes.hasOwnProperty(e))return;const i=this.nodes[e],s=(0,d.vO)(i.item,this.itemChildren);s&&!s.length&&i.vnode&&!i.vnode.hasLoaded?i.vnode.checkChildren().then((()=>this.updateOpen(e,t))):s&&s.length&&(i.isOpen=t,i.isOpen?this.openCache.add(e):this.openCache.delete(e),this.updateVnodeState(e))},updateVnodeState(e){const t=this.nodes[e];t&&t.vnode&&(t.vnode.isSelected=t.isSelected,t.vnode.isIndeterminate=t.isIndeterminate,t.vnode.isActive=t.isActive,t.vnode.isOpen=t.isOpen)},isExcluded(e){return!!this.search&&this.excludedItems.has(e)}},render(e){const t=this.items.length?this.items.filter((e=>!this.isExcluded((0,d.vO)(e,this.itemKey)))).map((e=>{const t=u.options.methods.genChild.bind(this);return t(e,this.disabled||(0,d.vO)(e,this.itemDisabled))})):this.$slots.default;return e("div",{staticClass:"v-treeview",class:{"v-treeview--hoverable":this.hoverable,"v-treeview--dense":this.dense,...this.themeClasses}},t)}}),b=function(){var e=this,t=e._self._c;return t("div",{staticClass:"message pr-4 py-2"},[t("div",[e._v("by "),t("b",[e._v(e._s(e.author.username))]),e._v(" - "+e._s(e.ago(e.createdAt)))]),e._v(" "+e._s(e.content)),t("br"),t("div",{staticClass:"mt-2"},[e.tempDecryptedFiles.length&&e.currentMessage==e.id&&e.percentage<100?t("div",[e._v(e._s(e.percentage)+"%")]):e._e(),t(y,{attrs:{items:e.fileDescriptions,"open-on-click":"",rounded:""},scopedSlots:e._u([{key:"label",fn:function({item:{size:i,name:s,type:n,uuid:o}}){return[t("div",s&&o?[t("div",{class:e.showable(n)&&e.fileSrc(o)?"pt-3":"pa-3"},[e._v(" "+e._s(s)+" ("+e._s(n||"No Type")+", "+e._s(e.filesize(i))+") "+e._s(e.tempDecryptedFiles.find((e=>e.uuid==o)))+" "),e.fileSrc(o)?t("span",[t("div",[e.file(o)||e.isFetchedFiles?t("a",{staticClass:"font-weight-bold",attrs:{target:"_blank",href:e.fileSrc(o).src}},[e._v(" Download ")]):e._e()]),e.showable(n)?t("div",[n.startsWith("image")?t("img",{staticClass:"pa-4 ml-5",staticStyle:{"max-width":"100%"},attrs:{src:e.fileSrc(o).src,height:"150"}}):e._e(),n.startsWith("video")?t("video",{staticClass:"pa-4 ml-5",staticStyle:{"max-width":"100%"},attrs:{height:"300",controls:""}},[t("source",{attrs:{src:e.fileSrc(o).src}})]):e._e(),n.startsWith("audio")?t("audio",{staticClass:"ma-4 ml-5",staticStyle:{"max-width":"100%"},attrs:{controls:""}},[t("source",{attrs:{src:e.fileSrc(o).src,type:n}})]):e._e()]):e._e()]):t("div",{staticClass:"font-weight-bold",on:{click:function(t){return e.fetchFile(o,e.id)}}},[e._v("Fetch File")])])]:[e._v(" "+e._s(s)+" ")])]}},{key:"prepend",fn:function({item:{type:i,uuid:s},open:n}){return[t("mdicon",i||s?{attrs:{name:i.startsWith("image")?"file-image":i.startsWith("audio")?"file-music":i.startsWith("video")?"file-video":i?e.filesTypes[i]:"file-question"}}:{attrs:{name:n?"folder-open":"folder"}})]}}])}),e.currentMessageFiles(e.id)<e.filesCount&&e.filesCount&&!e.isFetchedFiles?t(s.Z,{staticClass:"my-2",attrs:{disabled:e.fetchingFiles},on:{click:function(t){return e.fetchFiles(e.id)}}},[e._v("Fetch File(s), "+e._s(e.filesize(e.totalSize)))]):e._e()],1)])},C=[],S=["second","minute","hour","day","week","month","year"];function w(e,t){if(0===t)return["just now","right now"];var i=S[Math.floor(t/2)];return e>1&&(i+="s"),[e+" "+i+" ago","in "+e+" "+i]}var O=["秒","分钟","小时","天","周","个月","年"];function I(e,t){if(0===t)return["刚刚","片刻后"];var i=O[~~(t/2)];return[e+" "+i+"前",e+" "+i+"后"]}var _={},k=function(e,t){_[e]=t},x=function(e){return _[e]||_["en_US"]},F=[60,60,24,7,365/7/12,12];function T(e){return e instanceof Date?e:!isNaN(e)||/^\d+$/.test(e)?new Date(parseInt(e)):(e=(e||"").trim().replace(/\.\d+/,"").replace(/-/,"/").replace(/-/,"/").replace(/(\d)T(\d)/,"$1 $2").replace(/Z/," UTC").replace(/([+-]\d\d):?(\d\d)/," $1$2"),new Date(e))}function A(e,t){var i=e<0?1:0;e=Math.abs(e);for(var s=e,n=0;e>=F[n]&&n<F.length;n++)e/=F[n];return e=Math.floor(e),n*=2,e>(0===n?9:1)&&(n+=1),t(e,n,s)[i].replace("%s",e.toString())}function B(e,t){var i=t?T(t):new Date;return(+i-+T(e))/1e3}var $=function(e,t,i){var s=B(e,i&&i.relativeDate);return A(s,x(t))};k("en_US",w),k("zh_CN",I);var E=i(629),D=i(6755),K=i.n(D),P={name:"Message",props:{message:Object},data(){return{...this.message,filesTypes:{"text/html":"language-html5","text/javascript":"nodejs","application/json":"code-json","application/pdf":"file-pdf","text/plain":"file-document-outline","application/x-msdownload":"file-download","application/vnd.ms-excel":"file-excel","application/x-zip-compressed":"folder-zip"},allowedShowTypes:["image","video","audio"]}},methods:{filesize:K(),ago:e=>$(e),async fetchFiles(e){this.setFetchingFiles(!0);const t=localStorage.getItem("key"),i=await crypto.subtle.importKey("jwk",{kty:"oct",k:t,alg:"A256GCM",ext:!0},{name:"AES-GCM"},!1,["encrypt","decrypt"]);let s=await this.handleFetchFiles({messageId:e,importedKey:i,key:t});this.setFetchingFiles(!1),s=s.map((t=>({...t,messageId:e}))),this.files=[...this.files,...s],this.setTempDecryptedFiles([])},async fetchFile(e,t){const i=localStorage.getItem("key"),s=await crypto.subtle.importKey("jwk",{kty:"oct",k:i,alg:"A256GCM",ext:!0},{name:"AES-GCM"},!1,["encrypt","decrypt"]),[n]=await this.handleFetchFile({messageId:t,uuid:e,importedKey:s,key:i});n&&this.files.push({...n,messageId:t}),this.setTempDecryptedFiles([])},isAllowedType(e){return this.allowedShowTypes.filter((t=>e.startsWith(t))).length},showable(e){const{isAllowedType:t}=this;return t(e)},file(e){return(this.files.length?this.files:this.tempDecryptedFiles).find((t=>t.uuid==e))},...(0,E.OI)(["setTempDecryptedFiles","setFetchingFiles","setMessages"]),...(0,E.nv)(["handleFetchFiles","handleFetchFile"])},computed:{...(0,E.rn)(["tempDecryptedFiles","currentMessage","fetchingFiles","currentFetchedFile","messages"]),totalSize(){let e=0;return this.fileDescriptions.forEach((({children:t})=>t.forEach((t=>e+=t.size)))),e},percentage(){return(this.tempDecryptedFiles.length/this.filesCount*100).toFixed(0)},fileSrc(){return function(e){return this.isFetchedFiles?this.files.find((t=>t.uuid==e)):(this.files.length?this.files:this.tempDecryptedFiles).find((t=>t.uuid==e))}},currentMessageFiles(){return function(e){return this.files.filter((({messageId:t})=>t==e)).length}},isFetchedFiles(){return this.files.length&&this.files.map((({notFetched:e})=>e)).includes(!0)}}},M=P,N=i(1001),j=(0,N.Z)(M,b,C,!1,null,null,null),L=j.exports},6755:function(e){
/*!
 2022 Jason Mulligan <jason.mulligan@avoidwork.com>
 @version 9.0.11
*/
!function(t,i){e.exports=i()}(0,(function(){"use strict";function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}var t="array",i="bits",s="byte",n="bytes",o="",a="exponent",r="function",l="iec",d="Invalid number",h="Invalid rounding method",c="jedec",p="object",u=".",v="round",m="kbit",f="string",g={symbol:{iec:{bits:["bit","Kibit","Mibit","Gibit","Tibit","Pibit","Eibit","Zibit","Yibit"],bytes:["B","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"]},jedec:{bits:["bit","Kbit","Mbit","Gbit","Tbit","Pbit","Ebit","Zbit","Ybit"],bytes:["B","KB","MB","GB","TB","PB","EB","ZB","YB"]}},fullform:{iec:["","kibi","mebi","gibi","tebi","pebi","exbi","zebi","yobi"],jedec:["","kilo","mega","giga","tera","peta","exa","zetta","yotta"]}};function y(y){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},C=b.bits,S=void 0!==C&&C,w=b.pad,O=void 0!==w&&w,I=b.base,_=void 0===I?-1:I,k=b.round,x=void 0===k?2:k,F=b.locale,T=void 0===F?o:F,A=b.localeOptions,B=void 0===A?{}:A,$=b.separator,E=void 0===$?o:$,D=b.spacer,K=void 0===D?" ":D,P=b.symbols,M=void 0===P?{}:P,N=b.standard,j=void 0===N?o:N,L=b.output,Z=void 0===L?f:L,W=b.fullform,z=void 0!==W&&W,G=b.fullforms,V=void 0===G?[]:G,Y=b.exponent,U=void 0===Y?-1:Y,q=b.roundingMethod,J=void 0===q?v:q,X=b.precision,H=void 0===X?0:X,Q=U,R=Number(y),ee=[],te=0,ie=o;-1===_&&0===j.length?(_=10,j=c):-1===_&&j.length>0?_=(j=j===l?l:c)===l?2:10:j=10===(_=2===_?2:10)||j===c?c:l;var se=10===_?1e3:1024,ne=!0===z,oe=R<0,ae=Math[J];if(isNaN(y))throw new TypeError(d);if(e(ae)!==r)throw new TypeError(h);if(oe&&(R=-R),(-1===Q||isNaN(Q))&&(Q=Math.floor(Math.log(R)/Math.log(se)))<0&&(Q=0),Q>8&&(H>0&&(H+=8-Q),Q=8),Z===a)return Q;if(0===R)ee[0]=0,ie=ee[1]=g.symbol[j][S?i:n][Q];else{te=R/(2===_?Math.pow(2,10*Q):Math.pow(1e3,Q)),S&&(te*=8)>=se&&Q<8&&(te/=se,Q++);var re=Math.pow(10,Q>0?x:0);ee[0]=ae(te*re)/re,ee[0]===se&&Q<8&&-1===U&&(ee[0]=1,Q++),ie=ee[1]=10===_&&1===Q?S?m:"kB":g.symbol[j][S?i:n][Q]}if(oe&&(ee[0]=-ee[0]),H>0&&(ee[0]=ee[0].toPrecision(H)),ee[1]=M[ee[1]]||ee[1],!0===T?ee[0]=ee[0].toLocaleString():T.length>0?ee[0]=ee[0].toLocaleString(T,B):E.length>0&&(ee[0]=ee[0].toString().replace(u,E)),O&&!1===Number.isInteger(ee[0])&&x>0){var le=E||u,de=ee[0].toString().split(le),he=de[1]||o,ce=he.length,pe=x-ce;ee[0]="".concat(de[0]).concat(le).concat(he.padEnd(ce+pe,"0"))}return ne&&(ee[1]=V[Q]?V[Q]:g.fullform[j][Q]+(S?"bit":s)+(1===ee[0]?o:"s")),Z===t?ee:Z===p?{value:ee[0],symbol:ee[1],exponent:Q,unit:ie}:ee.join(K)}return y.partial=function(e){return function(t){return y(t,e)}},y}))}}]);