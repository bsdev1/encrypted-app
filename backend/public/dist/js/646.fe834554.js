"use strict";(self["webpackChunkfrontend"]=self["webpackChunkfrontend"]||[]).push([[646],{1646:function(e,t,s){s.r(t),s.d(t,{default:function(){return y}});var r=s(1653),n=s(4562),a=s(3305),o=s(7394),l=s(7864),i=function(){var e=this,t=e._self._c;return t("div",[e.loading?t("div",{staticClass:"loader d-flex flex-column"},[t("h3",[e._v("Loading...")]),t(a.Z,{staticClass:"mt-8",attrs:{size:"70",width:"5",indeterminate:""}})],1):e.user?e._e():t("form",{staticClass:"mx-auto auth-form px-5",on:{submit:function(t){return t.preventDefault(),e.login.apply(null,arguments)}}},[t("h2",{staticClass:"mb-5 mt-8"},[e._v("Log In")]),t(o.cu,[e.error?t(r.Z,{staticClass:"alert_error mb-5",attrs:{type:"error",color:"red"}},[e._v(e._s(e.error))]):e._e()],1),t(o.cu,[e.newUser?t(r.Z,{staticClass:"mb-5",attrs:{type:"success"}},[e._v("Hello, "),t("b",[e._v(e._s(e.newUser))]),e._v("! You can log in now.")]):e._e()],1),t(l.Z,{attrs:{label:"Username",solo:"",placeholder:"Type In Your Username"},model:{value:e.username,callback:function(t){e.username=t},expression:"username"}}),t(l.Z,{attrs:{label:"Password",solo:"","hide-details":"",type:"password",placeholder:"Type In Your Password"},model:{value:e.password,callback:function(t){e.password=t},expression:"password"}}),t("hcaptcha",{staticClass:"mt-5 mb-3",attrs:{sitekey:e.sitekey},on:{verify:e.verifyCaptcha,reset:function(e){this.token=null}}}),t("div",{staticClass:"d-flex"},[t(n.Z,{attrs:{rounded:"",type:"submit",loading:e.loggingIn}},[e._v("Log In")]),t("router-link",{staticClass:"ml-auto text-decoration-none",attrs:{to:e.loggingIn?"":"/register"}},[t(n.Z,{attrs:{rounded:""}},[e._v("Register")])],1)],1)],1)])},u=[],c=s(629),d=s(6132),h=s(9669),p=s.n(h),g=s(2971),m=s.n(g);const f=p().create({baseURL:"https://e2ee-bs-app.cloud/api",withCredentials:!0});var v={name:"Login",components:{hcaptcha:m()},data:()=>({sitekey:"75ec369f-f564-4e97-b53a-6d54297c813f",username:null,password:null,error:null,token:null,loggingIn:!1}),async created(){if(this.user){const{data:{user:e}}=await f.get("/");if(e)return d.Z.push("/");this.setUser(null),this.setSocket(null)}this.setLoading(!1)},methods:{async login(){this.setNewUser(null);const{username:e,password:t,token:s,handleLogin:r}=this;if(!e?.trim()||!t?.trim())return this.error="Fill in all fields!";if(!s?.trim())return this.error="Captcha cannot be empty!";this.loggingIn=!0;const{errorMessage:n}=await r({username:e,password:t,token:s});this.loggingIn=!1,this.error=n},verifyCaptcha(e){this.token=e,this.error=null},...(0,c.nv)(["handleLogin"]),...(0,c.OI)(["setNewUser","setLoading","setUser","setSocket"])},computed:{...(0,c.rn)(["newUser","user","loading"])}},w=v,b=s(1001),k=(0,b.Z)(w,i,u,!1,null,null,null),y=k.exports}}]);