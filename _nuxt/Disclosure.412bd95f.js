import{d as w,I as t,r as x,Z as N,b as i,c as S,e as a,W as D,U as c,f as I,g as l,a4 as W,a5 as z,n as E,$ as P,l as O}from"./entry.fbbe5afd.js";import R from"./ContentSlot.9602af59.js";const U=["aria-expanded"],Y={class:"summary-content"},Z={class:"chevron-wrapper"},j={class:"content"},q=w({__name:"Disclosure",props:{open:{type:Boolean,default:!1},type:{type:String,default:"primary",validator(s){return["info","success","warning","danger","neutral","primary","secondary"].includes(s)}},icon:{type:[String,Boolean],default:!1}},emits:["update:open"],setup(s,{emit:_}){const n=s,d=t(()=>((e=o)=>`{elements.state.${e.type}.borderColor.primary}`)()),m=t(()=>((e=o)=>`{elements.state.${e.type}.backgroundColor.primary}`)()),y=t(()=>((e=o)=>`{elements.state.${e.type}.color.primary}`)()),f=t(()=>((e=o)=>`{elements.state.${e.type}.color.tertiary}`)()),C=t(()=>((e=o)=>`{elements.state.${e.type}.backgroundColor.tertiary}`)()),b=t(()=>((e=o)=>`{elements.state.${e.type}.backgroundColor.secondary}`)()),g=t(()=>((e=o)=>`{elements.state.${e.type}.backgroundColor.secondary}`)()),$=t(()=>((e=o)=>`{elements.state.${e.type}.borderColor.primary}`)()),k=t(()=>((e=o)=>`{elements.state.${e.type}.backgroundColor.primary}`)()),v=t(()=>((e=o)=>`{elements.state.${e.type}.color.tertiary}`)()),r=x(n.open),h=()=>{r.value=!r.value,_("update:open",r.value)},V=t(()=>n.icon===!1?"":n.icon===!0?`type:${n.type}`:n.icon),o=n,{$pinceau:B}=N(o,void 0,{_yV0_borderColor:d,_m5N_backgroundColor:m,_Y56_color:y,_Nt6_color:f,_ViE_backgroundColor:C,_6mW_backgroundColor:b,_x5W_backgroundColor:g,_SyV_borderColor:$,_B7z_backgroundColor:k,_sVV_color:v});return(e,A)=>{const u=P,p=R;return i(),S("div",{class:E(["disclosure",[s.type,c(B)]])},[a("button",{"aria-expanded":c(r),type:"button",class:"summary",onClick:h},[s.icon?(i(),D(u,{key:0,name:c(V),class:"disclosure-icon"},null,8,["name"])):I("",!0),a("span",Y,[l(p,{use:e.$slots.summary,unwrap:"p"},null,8,["use"])]),a("span",Z,[l(u,{name:"tabler:chevron-down"})])],8,U),W(a("div",j,[l(p,{use:e.$slots.content},null,8,["use"])],512),[[z,c(r)]])],2)}}});const H=O(q,[["__scopeId","data-v-6741f561"]]);export{H as default};