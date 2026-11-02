import{C as G,a as H}from"./page-chrome-CroeNQr8.js";import{r as v,j as n,c as B}from"./client-Bt4lNSbZ.js";import{g as V}from"./auth-CbGchQ1-.js";import"./tsembed.es-lWOjXXGr.js";const D={EQ:"=",NE:"!=",GT:">",GE:">=",LT:"<",LE:"<=",CONTAINS:"contains",BEGINS_WITH:"begins with",ENDS_WITH:"ends with"},T=e=>`[${e.replace(/[[\]]/g,"\\$&")}]`,O=(e,t)=>t&&/^-?\d+(\.\d+)?$/.test(e)?e:`'${e.replace(/'/g,"\\'")}'`,J=({column:e,op:t,values:a,measure:o=!1})=>t==="IN"?`${T(e)} = ${a.map(l=>`${T(e)}.${O(l,!1)}`).join(" ")}`:`${T(e)} ${D[t]} ${O(a[0]??"",o)}`,I=(e,t=[])=>[...e.map(T),...t.map(J)].join(" ");function Q({dataSource:e,columns:t,filters:a,parameters:o,formulas:l}){return{answer:{name:"TML to SQL demo",tables:[{id:e.name,name:e.name,fqn:e.id}],formulas:l.map(({name:c,expr:s})=>({id:c,name:c,expr:s})),search_query:I([...t,...l.map(c=>c.name)],a),parameter_values:o.map(({name:c,value:s})=>({key:c,value:s}))}}}function W({filters:e,parameters:t}){const a={};e.forEach(({column:l,op:c,values:s},d)=>{a[`col${d+1}`]=l,a[`op${d+1}`]=c,a[`val${d+1}`]=s});const o={};return t.forEach(({name:l,value:c},s)=>{o[`param${s+1}`]=l,o[`paramVal${s+1}`]=c}),{runtime_filter:a,runtime_param_override:o}}class M extends Error{constructor(t,a){super(`HTTP ${t}`),this.status=t,this.body=a}}let A;const U=()=>A??=V().catch(e=>{throw A=void 0,e});async function E(e,t,a=!0){const o=await fetch(`${G}/api/rest/2.0${e}`,{method:"POST",headers:{Authorization:`Bearer ${await U()}`,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(t)});if(o.status===401&&a)return A=void 0,E(e,t,!1);const l=await o.text();let c=l;try{c=l?JSON.parse(l):null}catch{}if(!o.ok)throw new M(o.status,c);return c}async function z(){return(await E("/metadata/search",{metadata:[{type:"LOGICAL_TABLE"}],record_size:500,sort_options:{field_name:"NAME",order:"ASC"}})).map(t=>({id:t.metadata_id,name:t.metadata_name,type:t.metadata_header?.type??""}))}const K=["columns","worksheet_columns","view_columns","sql_view_columns"];async function Y(e){const[{edoc:t}]=await E("/metadata/tml/export",{metadata:[{identifier:e}],edoc_format:"JSON"}),a=JSON.parse(t),o=Object.values(a).find(u=>u&&typeof u=="object"),l=K.find(u=>Array.isArray(o?.[u])),c=(o?.parameters??[]).map(u=>({name:u.name,defaultValue:String(u.default_value??""),choices:(u.list_config?.list_choice??[]).map(m=>String(m.value))})),s=o?.formulas??[];return{columns:(l?o[l]:[]).map(u=>{const m=s.find(h=>h.id===u.formula_id)?.expr??"";return{name:u.name,measure:u.properties?.column_type==="MEASURE",usesParameters:c.filter(h=>m.includes(`[${h.name}]`)).map(h=>h.name)}}),parameters:c}}async function X(e,t){return((await E("/searchdata",{query_string:I([t]),logical_table_identifier:e,record_size:200})).contents?.[0]?.data_rows??[]).map(o=>String(o[0]))}const F=`// Everything needed to turn the dropdown selection into Answer TML (for /metadata/sql/tml)
// or into runtime overrides (for /metadata/sql/model and /searchdata).

export type FilterOp =
  | "EQ"
  | "NE"
  | "IN"
  | "GT"
  | "GE"
  | "LT"
  | "LE"
  | "CONTAINS"
  | "BEGINS_WITH"
  | "ENDS_WITH";

export interface Filter {
  column: string;
  op: FilterOp;
  values: string[];
  measure?: boolean;
}

export interface Selection {
  dataSource: { id: string; name: string };
  columns: string[];
  filters: Filter[];
  parameters: { name: string; value: string }[];
  formulas: { name: string; expr: string }[];
}

const SEARCH_OP: Record<Exclude<FilterOp, "IN">, string> = {
  EQ: "=",
  NE: "!=",
  GT: ">",
  GE: ">=",
  LT: "<",
  LE: "<=",
  CONTAINS: "contains",
  BEGINS_WITH: "begins with",
  ENDS_WITH: "ends with",
};

const col = (name: string) => \`[\${name.replace(/[[\\]]/g, "\\\\$&")}]\`;

const literal = (value: string, bare: boolean) =>
  bare && /^-?\\d+(\\.\\d+)?$/.test(value) ? value : \`'\${value.replace(/'/g, "\\\\'")}'\`;

const filterToSearch = ({ column, op, values, measure = false }: Filter) =>
  op === "IN"
    ? \`\${col(column)} = \${values.map((v) => \`\${col(column)}.\${literal(v, false)}\`).join(" ")}\`
    : \`\${col(column)} \${SEARCH_OP[op]} \${literal(values[0] ?? "", measure)}\`;

export const toSearchQuery = (columns: string[], filters: Filter[] = []) =>
  [...columns.map(col), ...filters.map(filterToSearch)].join(" ");

// Ad-hoc formulas exist only in Answer TML; a query_string cannot define them.
export function toAnswerTml({ dataSource, columns, filters, parameters, formulas }: Selection) {
  return {
    answer: {
      name: "TML to SQL demo",
      tables: [{ id: dataSource.name, name: dataSource.name, fqn: dataSource.id }],
      formulas: formulas.map(({ name, expr }) => ({ id: name, name, expr })),
      search_query: toSearchQuery([...columns, ...formulas.map((f) => f.name)], filters),
      parameter_values: parameters.map(({ name, value }) => ({ key: name, value })),
    },
  };
}

export function toRuntimeOverrides({ filters, parameters }: Selection) {
  const runtime_filter: Record<string, unknown> = {};
  filters.forEach(({ column, op, values }, i) => {
    runtime_filter[\`col\${i + 1}\`] = column;
    runtime_filter[\`op\${i + 1}\`] = op;
    runtime_filter[\`val\${i + 1}\`] = values;
  });
  const runtime_param_override: Record<string, string> = {};
  parameters.forEach(({ name, value }, i) => {
    runtime_param_override[\`param\${i + 1}\`] = name;
    runtime_param_override[\`paramVal\${i + 1}\`] = value;
  });
  return { runtime_filter, runtime_param_override };
}
`,Z=["EQ","NE","IN","GT","GE","LT","LE","CONTAINS","BEGINS_WITH","ENDS_WITH"],P={columns:[],parameters:[]};let C=0;function ee(e,t){if(e==="tml")return["/metadata/sql/tml",{answer_tml:JSON.stringify(Q(t))}];const a={query_string:I(t.columns),logical_table_identifier:t.dataSource.id,...W(t)};return e==="model"?["/metadata/sql/model",a]:["/searchdata",{...a,include_sql:!0,record_size:20}]}const L=e=>e instanceof M?`${e.message}
${JSON.stringify(e.body,null,2)}`:String(e);function ne(){const[e,t]=v.useState([]),[a,o]=v.useState(),[l,c]=v.useState(P),[s,d]=v.useState(!1),[u,m]=v.useState([]),[h,S]=v.useState([]),[r,x]=v.useState([]),[g,w]=v.useState([]),[R,_]=v.useState();v.useEffect(()=>{z().then(t).catch(i=>_({path:"/metadata/search",error:L(i)}))},[]),v.useEffect(()=>{if(m([]),S([]),x([]),w([]),c(P),!a)return;let i=!1;return d(!0),Y(a.id).then(p=>!i&&c(p)).catch(p=>!i&&_({path:"/metadata/tml/export",error:L(p)})).finally(()=>!i&&d(!1)),()=>{i=!0}},[a]);const y=v.useMemo(()=>a&&{dataSource:{id:a.id,name:a.name},columns:u,filters:h.filter(i=>i.column&&i.values.some(Boolean)),parameters:r.filter(i=>i.name),formulas:g.filter(i=>i.name&&i.expr)},[a,u,h,r,g]),q=y?JSON.stringify(Q(y),null,2):"";async function $(i){if(!y||!(y.columns.length+y.formulas.length)){_({path:"",error:"Pick a data source and at least one column."});return}const[p,j]=ee(i,y),f=i!=="tml"&&y.formulas.length?"Ad-hoc formulas are ignored here: query_string cannot define them. Use Get SQL from TML.":void 0;_({path:p,body:j,note:f,loading:!0});try{const N=await E(p,j);if(i==="searchdata"){const b=N.contents?.[0]??{};_({path:p,body:j,note:f,sql:b.sql_query,table:{columns:b.column_names??[],rows:b.data_rows??[]}})}else _({path:p,body:j,note:f,sql:(N.sql_queries??[]).map(b=>b.sql_query).join(`

`)})}catch(N){_({path:p,body:j,note:f,error:L(N)})}}return n.jsxs("div",{className:"t2s",children:[n.jsxs("div",{className:"card",children:[n.jsxs("section",{children:[n.jsx("h4",{children:"1. Data source"}),n.jsxs("select",{value:a?.id??"",onChange:i=>o(e.find(p=>p.id===i.target.value)),children:[n.jsx("option",{value:"",children:"Select a data source"}),e.map(i=>n.jsxs("option",{value:i.id,children:[i.name," (",i.type,")"]},i.id))]})]}),n.jsxs("section",{children:[n.jsx("h4",{children:"2. Columns"}),s?n.jsx("span",{className:"muted",children:"Loading…"}):n.jsx(te,{schema:l,selected:u,onChange:m})]}),n.jsxs("section",{children:[n.jsx("h4",{children:"3. Filters → runtime filters"}),h.map((i,p)=>n.jsx(se,{filter:i,schema:l,dataSourceId:a?.id,onChange:j=>S(h.map((f,N)=>N===p?{...j,key:f.key}:f)),onRemove:()=>S(h.filter((j,f)=>f!==p))},i.key)),n.jsx("button",{className:"btn-text",onClick:()=>S([...h,{key:C++,column:"",op:"EQ",values:[]}]),children:"+ Add filter"})]}),l.parameters.length>0&&n.jsxs("section",{children:[n.jsx("h4",{children:"4. Parameters → runtime parameters"}),r.map((i,p)=>n.jsx(re,{param:i,schema:l,columns:u,formulas:g,onChange:j=>x(r.map((f,N)=>N===p?{...j,key:f.key}:f)),onRemove:()=>x(r.filter((j,f)=>f!==p))},i.key)),n.jsx("button",{className:"btn-text",onClick:()=>x([...r,{key:C++,name:"",value:""}]),children:"+ Add parameter"})]}),n.jsxs("section",{children:[n.jsx("h4",{children:"5. Ad-hoc formulas (TML only)"}),g.map((i,p)=>n.jsx(oe,{formula:i,schema:l,onChange:j=>w(g.map((f,N)=>N===p?{...j,key:f.key}:f)),onRemove:()=>w(g.filter((j,f)=>f!==p))},i.key)),n.jsx("button",{className:"btn-text",onClick:()=>w([...g,{key:C++,name:`Formula ${g.length+1}`,expr:""}]),children:"+ Add formula"})]})]}),n.jsxs("div",{children:[n.jsxs("div",{className:"card",children:[n.jsxs("div",{className:"result-head",children:[n.jsx("h4",{children:"Answer TML (sent to /metadata/sql/tml)"}),n.jsx("button",{className:"btn-text",onClick:()=>navigator.clipboard.writeText(q),children:"Copy"})]}),n.jsx("pre",{className:"tml",children:q}),n.jsxs("details",{children:[n.jsxs("summary",{children:["All the TML code: tml.ts, ",F.trim().split(`
`).length," lines"]}),n.jsx("pre",{className:"source",children:F})]})]}),n.jsxs("div",{className:"actions",children:[n.jsx("button",{className:"btn-filled",onClick:()=>$("tml"),children:"Get SQL from TML"}),n.jsx("button",{onClick:()=>$("model"),children:"Get SQL from model + runtime overrides"}),n.jsx("button",{onClick:()=>$("searchdata"),children:"Run searchdata + include_sql"})]}),R&&n.jsx(le,{result:R})]})]})}function te({schema:e,selected:t,onChange:a}){const[o,l]=v.useState(""),c=e.columns.filter(s=>s.name.toLowerCase().includes(o.toLowerCase()));return n.jsxs(n.Fragment,{children:[n.jsx("input",{type:"search",placeholder:"Find column",value:o,onChange:s=>l(s.target.value)}),n.jsx("div",{className:"col-list",children:c.map(s=>n.jsxs("label",{children:[n.jsx("input",{type:"checkbox",checked:t.includes(s.name),onChange:d=>a(d.target.checked?[...t,s.name]:t.filter(u=>u!==s.name))}),s.name,s.usesParameters.map(d=>n.jsxs("span",{className:"chip param",children:["uses ",d]},d)),n.jsx("span",{className:"chip",children:s.measure?"measure":"attribute"})]},s.name))})]})}const k=new Map;function ae(e,t,a){const[o,l]=v.useState([]);return v.useEffect(()=>{if(l([]),!e||!t||!a)return;const c=`${e}::${t}`;k.has(c)||k.set(c,X(e,t).catch(()=>[]));let s=!1;return k.get(c).then(d=>!s&&l(d)),()=>{s=!0}},[e,t,a]),o}function se({filter:e,schema:t,dataSourceId:a,onChange:o,onRemove:l}){const[c,s]=v.useState(e.values.join(", ")),d=ae(a,e.column,!e.measure),u=`filter-values-${e.key}`,m=(r,x)=>x==="IN"?r.split(",").map(g=>g.trim()):[r],h=d.length>0&&["EQ","NE","IN"].includes(e.op),S=r=>{s(r.join(", ")),o({...e,values:r})};return n.jsxs(n.Fragment,{children:[n.jsxs("div",{className:"row",children:[n.jsxs("select",{value:e.column,onChange:r=>{s(""),o({...e,column:r.target.value,measure:t.columns.find(x=>x.name===r.target.value)?.measure,values:[]})},children:[n.jsx("option",{value:"",children:"Column"}),t.columns.map(r=>n.jsx("option",{children:r.name},r.name))]}),n.jsx("select",{className:"op",value:e.op,onChange:r=>{const x=r.target.value,g=m(c,x).filter(Boolean);o({...e,op:x,values:x==="IN"?g:g.slice(0,1)})},children:Z.map(r=>n.jsx("option",{children:r},r))}),h?n.jsxs("select",{value:e.op==="IN"?"":e.values[0]??"",onChange:r=>{const x=r.target.value;e.op!=="IN"?S([x]):x&&!e.values.includes(x)&&S([...e.values.filter(Boolean),x])},children:[n.jsx("option",{value:"",children:e.op==="IN"?"Add value…":"Value"}),d.map(r=>n.jsx("option",{children:r},r))]}):n.jsxs(n.Fragment,{children:[n.jsx("input",{list:u,placeholder:e.op==="IN"?"a, b, c":"value",value:c,onChange:r=>{s(r.target.value),o({...e,values:m(r.target.value,e.op)})}}),n.jsx("datalist",{id:u,children:d.map(r=>n.jsx("option",{value:r},r))})]}),n.jsx("button",{className:"icon-btn",title:"Remove",onClick:l,children:"✕"})]}),h&&e.op==="IN"&&e.values.some(Boolean)&&n.jsx("div",{className:"value-chips",children:e.values.filter(Boolean).map(r=>n.jsxs("button",{className:"chip",title:"Remove value",onClick:()=>S(e.values.filter(x=>x!==r)),children:[r," ✕"]},r))})]})}function re({param:e,schema:t,columns:a,formulas:o,onChange:l,onRemove:c}){const s=t.parameters.find(m=>m.name===e.name),d=t.columns.filter(m=>m.usesParameters.includes(e.name)).map(m=>m.name),u=d.some(m=>a.includes(m))||o.some(m=>m.expr.includes(`[${e.name}]`));return n.jsxs(n.Fragment,{children:[n.jsxs("div",{className:"row",children:[n.jsxs("select",{value:e.name,onChange:m=>{const h=t.parameters.find(r=>r.name===m.target.value),S=!h?.choices.length||h.choices.includes(h.defaultValue)?h?.defaultValue??"":h.choices[0];l({name:m.target.value,value:S})},children:[n.jsx("option",{value:"",children:"Parameter"}),t.parameters.map(m=>n.jsx("option",{children:m.name},m.name))]}),s?.choices.length?n.jsx("select",{value:e.value,onChange:m=>l({...e,value:m.target.value}),children:s.choices.map(m=>n.jsx("option",{children:m},m))}):n.jsx("input",{placeholder:"value",value:e.value,onChange:m=>l({...e,value:m.target.value})}),n.jsx("button",{className:"icon-btn",title:"Remove",onClick:c,children:"✕"})]}),e.name&&!u&&n.jsxs("p",{className:"hint",children:["Not in the SQL yet: no selected column uses [",e.name,"]."," ",d.length?`Select ${d.join(", ")}, or add`:"Add"," a formula that uses it."]})]})}function oe({formula:e,schema:t,onChange:a,onRemove:o}){const l=t.columns.find(s=>!s.measure)?.name??"Column",c=t.parameters[0]?.name??"Param";return n.jsxs("div",{className:"formula",children:[n.jsxs("div",{className:"row",children:[n.jsx("input",{placeholder:"Name",value:e.name,onChange:s=>a({...e,name:s.target.value})}),n.jsx("button",{className:"icon-btn",title:"Remove",onClick:o,children:"✕"})]}),n.jsx("textarea",{rows:2,placeholder:`if ( [${l}] = [${c}] ) then 1 else 0`,value:e.expr,onChange:s=>a({...e,expr:s.target.value})})]})}function le({result:e}){return n.jsxs("div",{className:"card result",children:[e.path&&n.jsxs("h4",{children:["POST /api/rest/2.0",e.path]}),e.body!==void 0&&n.jsxs("details",{children:[n.jsx("summary",{children:"Request body"}),n.jsx("pre",{children:JSON.stringify(e.body,null,2)})]}),e.note&&n.jsx("p",{className:"note",children:e.note}),e.loading&&n.jsx("span",{className:"muted",children:"Running…"}),e.error&&n.jsx("pre",{className:"error",children:e.error}),!e.loading&&!e.error&&n.jsxs(n.Fragment,{children:[n.jsx("h4",{children:"SQL"}),n.jsx("pre",{children:e.sql||"(no SQL returned)"})]}),e.table&&n.jsxs(n.Fragment,{children:[n.jsxs("h4",{children:["Rows (",e.table.rows.length,")"]}),n.jsx("div",{className:"data-table",children:n.jsxs("table",{children:[n.jsx("thead",{children:n.jsx("tr",{children:e.table.columns.map(t=>n.jsx("th",{children:t},t))})}),n.jsx("tbody",{children:e.table.rows.map((t,a)=>n.jsx("tr",{children:t.map((o,l)=>n.jsx("td",{children:String(o??"")},l))},a))})]})})]})]})}H({title:"TML to SQL",subtitle:"Dropdowns → Answer TML → SQL, with public REST APIs"});B(document.getElementById("app")).render(v.createElement(ne));
