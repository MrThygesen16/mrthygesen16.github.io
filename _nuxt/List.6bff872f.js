import{d as r,a6 as i,I as u,M as t,$ as p,a7 as _,l as d}from"./entry.fbbe5afd.js";import m from"./ContentSlot.9602af59.js";const f=r({props:{icon:{type:String,default:null},type:{type:String,default:"primary",validator:e=>["primary","secondary","info","success","warning","danger","neutral"].includes(e)}},setup(e){const n=i(),{flatUnwrap:a,unwrap:o}=_(),c=u(()=>e.icon||`list:${e.type}`);return()=>{const l=a((n.default&&n.default())??[],["ul"]).map(s=>o(s,["li"]));return t("ul",l.map(s=>t("li",[t("span",{class:`list-icon ${e.type}`},t(p,{name:c.value,class:"icon"})),t("span",t(m,{use:()=>s}))])))}}});const v=d(f,[["__scopeId","data-v-b7ed239c"]]);export{v as default};