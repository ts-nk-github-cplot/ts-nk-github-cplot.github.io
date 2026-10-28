import{a as i,C as m}from"./page-chrome-CroeNQr8.js";import{a as b}from"./auth-DsMFhm2s.js";import{i as l,L as s,E,t as u}from"./track-embed-ChIoFrvP.js";import{c as p}from"./code-editor-CM5zQwLc.js";i({title:"Configurable embed",subtitle:"Edit the embed code live"});l({thoughtSpotHost:m,...b});const v=`const liveboardEmbed = new LiveboardEmbed(container, {
  liveboardId: "c65f9297-57f2-44ff-ac0e-796792d36a65", // Parameters
  fullHeight: true,
  frameParams: { width: "100%" },
});
liveboardEmbed.on(EmbedEvent.Data, () => {
  console.log("Liveboard rendered");
});
liveboardEmbed.render();
return liveboardEmbed;
`,f=document.getElementById("app"),o=document.createElement("div");o.classList.add("full-liveboard");let t;const d=n=>{e.clearError();try{t?.destroy?.()}catch{}o.replaceChildren();try{t=new Function("LiveboardEmbed","EmbedEvent","container",n)(s,E,o),t&&u(t,"Liveboard")}catch(c){e.showError(c)}},e=p({storageKey:"configurable-embed:code",defaultCode:v,onApply:d}),r=document.createElement("div");r.className="page-bar";const a=document.createElement("button");a.textContent="</> Code";a.addEventListener("click",e.toggle);r.append(a);f.append(r,o);document.body.append(e.element);d(e.getCode());
