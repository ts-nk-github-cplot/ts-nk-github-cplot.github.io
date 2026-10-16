import{a as P,C as R,P as a,b as l}from"./page-chrome-CroeNQr8.js";import{i as T,a as y,L as I,S as h,E as b,A as O,C as w,b as N,t as S}from"./track-embed-Sr1mTArV.js";import{c as L}from"./code-editor-CM5zQwLc.js";P({title:"Custom and primary actions",subtitle:"Code-based custom actions by target and position"});T({thoughtSpotHost:R,...y});const C="Give me a sample visualization/answer of this data",M=`const liveboardEmbed = new LiveboardEmbed(container, {
  liveboardId: "${a}", // Parameters
  frameParams: { width: "100%", height: "100%" },
  customActions: [
    // LIVEBOARD target: PRIMARY + MENU
    { id: "lb-primary", name: "LB primary", position: CustomActionsPosition.PRIMARY, target: CustomActionTarget.LIVEBOARD },
    { id: "lb-menu", name: "LB menu", position: CustomActionsPosition.MENU, target: CustomActionTarget.LIVEBOARD },

    // VIZ target, scoped to this Liveboard: shows on every viz
    { id: "viz-primary", name: "Viz primary", position: CustomActionsPosition.PRIMARY, target: CustomActionTarget.VIZ,
      metadataIds: { liveboardIds: ["${a}"] } },
    { id: "viz-menu", name: "Viz menu", position: CustomActionsPosition.MENU, target: CustomActionTarget.VIZ,
      metadataIds: { liveboardIds: ["${a}"] } },
    { id: "viz-context", name: "Viz context", position: CustomActionsPosition.CONTEXTMENU, target: CustomActionTarget.VIZ,
      metadataIds: { liveboardIds: ["${a}"] } },

    // ANSWER target: applies when a viz is opened as an Answer (Explore)
    { id: "answer-primary", name: "Answer primary", position: CustomActionsPosition.PRIMARY, target: CustomActionTarget.ANSWER },
    { id: "answer-menu", name: "Answer menu", position: CustomActionsPosition.MENU, target: CustomActionTarget.ANSWER },
    { id: "answer-context", name: "Answer context", position: CustomActionsPosition.CONTEXTMENU, target: CustomActionTarget.ANSWER },
  ],
});
liveboardEmbed.on(EmbedEvent.CustomAction, (payload) => {
  console.log("Custom action clicked:", payload.data.id, payload.data);
});
liveboardEmbed.render();
return liveboardEmbed;
`,f=`const spotterEmbed = new SpotterEmbed(container, {
  worksheetId: "${l}", // Model from Parameters LB
  frameParams: { width: "100%", height: "100%" },
  searchOptions: { searchQuery: "${C}" },
  customActions: [
    // SPOTTER target: MENU + CONTEXTMENU
    { id: "spotter-menu", name: "Spotter menu", position: CustomActionsPosition.MENU, target: CustomActionTarget.SPOTTER },
    { id: "spotter-context", name: "Spotter context", position: CustomActionsPosition.CONTEXTMENU, target: CustomActionTarget.SPOTTER },

    // ANSWER target: the charts/tables Spotter returns
    { id: "answer-primary", name: "Answer primary", position: CustomActionsPosition.PRIMARY, target: CustomActionTarget.ANSWER },
    { id: "answer-menu", name: "Answer menu", position: CustomActionsPosition.MENU, target: CustomActionTarget.ANSWER },
    { id: "answer-context", name: "Answer context", position: CustomActionsPosition.CONTEXTMENU, target: CustomActionTarget.ANSWER },

    // Not documented for Spotter: kept to check what renders
    { id: "viz-primary", name: "Viz primary", position: CustomActionsPosition.PRIMARY, target: CustomActionTarget.VIZ },
    { id: "lb-primary", name: "LB primary", position: CustomActionsPosition.PRIMARY, target: CustomActionTarget.LIVEBOARD },
  ],
});
spotterEmbed.on(EmbedEvent.CustomAction, (payload) => {
  console.log("Custom action clicked:", payload.data.id, payload.data);
});
spotterEmbed.render();
return spotterEmbed;
`,D=`const liveboardEmbed = new LiveboardEmbed(container, {
  liveboardId: "${a}", // Parameters
  frameParams: { width: "100%", height: "100%" },
  primaryAction: Action.Download,
});
liveboardEmbed.render();
return liveboardEmbed;
`,V=`const spotterEmbed = new SpotterEmbed(container, {
  worksheetId: "${l}", // Model from Parameters LB
  frameParams: { width: "100%", height: "100%" },
  searchOptions: { searchQuery: "${C}" },
  primaryAction: Action.Download,
});
spotterEmbed.render();
return spotterEmbed;
`,B=`const liveboardEmbed = new LiveboardEmbed(container, {
  liveboardId: "${a}", // Parameters
  frameParams: { width: "100%", height: "100%" },
  primaryAction: Action.Download,
  customActions: [
    { id: "viz-primary", name: "Viz primary", position: CustomActionsPosition.PRIMARY, target: CustomActionTarget.VIZ,
      metadataIds: { liveboardIds: ["${a}"] } },
  ],
});
liveboardEmbed.on(EmbedEvent.CustomAction, (payload) => {
  console.log("Custom action clicked:", payload.data.id, payload.data);
});
liveboardEmbed.render();
return liveboardEmbed;
`,g={Liveboard:M,Spotter:f,"Liveboard primaryAction":D,"Spotter primaryAction":V,"Liveboard both":B},v=Object.keys(g),_=document.getElementById("app"),d=document.createElement("div");d.className="ca-layout";const c=document.createElement("div");c.className="ca-tabs";const m=document.createElement("div");m.className="ca-last";m.textContent="Click a custom action to see its payload here.";const s=document.createElement("div");s.className="ca-stage code-editor-offset";let n="Liveboard",r;const i=Object.fromEntries(v.map(t=>[t,U(t)]));function U(t){return L({storageKey:`custom-and-primary-action:${t}`,defaultCode:g[t],onApply:()=>E()})}function E(){const t=i[n];t.clearError();try{r?.destroy?.()}catch{}s.replaceChildren();const e=document.createElement("div");s.append(e);try{if(r=new Function("LiveboardEmbed","SpotterEmbed","EmbedEvent","Action","CustomActionsPosition","CustomActionTarget","container",t.getCode())(I,h,b,O,w,N,e),r){const o=r;S(o,n),o.on(b.CustomAction,A=>{m.textContent=`${n} → ${A?.data?.id}: ${JSON.stringify(A?.data)}`})}}catch(o){t.showError(o)}}const p=v.map(t=>{const e=document.createElement("button");return e.textContent=t,e.addEventListener("click",()=>$(t)),e});function $(t){const e=i[n].isOpen();i[n].setOpen(!1),n=t,p.forEach(o=>o.setAttribute("aria-pressed",String(o.textContent===t))),i[t].setOpen(e),E()}const u=document.createElement("button");u.textContent="</> Code";u.addEventListener("click",()=>i[n].toggle());c.append(...p,u,m);d.append(c,s);_.append(d);Object.values(i).forEach(t=>document.body.append(t.element));p[0].setAttribute("aria-pressed","true");i.Liveboard.setOpen(!0);E();
