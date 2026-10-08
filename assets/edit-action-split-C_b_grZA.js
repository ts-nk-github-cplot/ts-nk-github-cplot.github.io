import{a as D,C as U}from"./page-chrome-B8v66vtc.js";import{i as $,A as o,L as W,E as p,a as G,S as Q,b as q,t as J,c as K,H as u}from"./track-embed-wv-_zrzM.js";const X=`import { mountPageChrome } from "../../shared/page-chrome";
import { authConfig } from "../../shared/auth";
import { CLUSTER_URL } from "../../shared/consts";
import { trackEmbed } from "../../shared/track-embed";
import {
  Action,
  AppEmbed,
  EmbedEvent,
  HostEvent,
  init,
  LiveboardEmbed,
  SearchEmbed,
  SpotterEmbed,
} from "tsembed.js";
import indexSource from "./main.ts?raw";

mountPageChrome({
  title: "Edit-action split",
  subtitle: "Action.Edit vs EditLiveboard / EditVisualization",
  links: [{ href: "../pv-scenarios/", label: "PV scenarios" }],
});

init({
  thoughtSpotHost: CLUSTER_URL,
  ...authConfig,
});

window.addEventListener("message", (e) => {
  if (e.data?.__tsEmbedConsoleForward)
    console.log(\`[embed:\${e.data.level}]\`, ...e.data.args);
});

// TODO(debug): remove — host-side listener for the
// __debug_hidden_action_config__ postMessage traced from the embedded iframe
// (separate devtools context, so it can't just console.log from in there).
window.addEventListener("message", (event) => {
  if (event.data?.type === "__debug_hidden_action_config__") {
    console.log("[debug] hidden action config", event.data.data);
  }

  if (event.data?.type === "__debug_menu_edit_visibility__") {
    console.log("[debug] menu EDIT visibility", event.data.data);
  }
});

const parametersLiveboardId = "9bd202f5-d431-44bf-9a07-b4f7be372125"; // Parameters
const systemLiveboardId = "9beaacbf-e65b-4416-b110-238d109c3531"; // System LB
let liveboardId = parametersLiveboardId;
const testVizId = "db0badd5-47c6-400a-842d-133a7b44d435"; // Viz from Parameters LB
const spotterWorksheetId = "3c020c5e-1c44-4ceb-a2d6-23ba1c53a3f4"; // Model from Parameters LB

const app = document.getElementById("app");

const div = document.createElement("div");
div.classList.add("full-liveboard");
app?.appendChild(div);

// TODO(debug): remove — the 9 combos of {hiddenActions, visibleActions,
// disabledActions} x {Action.Edit, Action.EditLiveboard,
// Action.EditVisualization} being validated for the Edit-action split. Each
// one destroys and recreates the embed so the dropdown covers all 9 without
// a rebuild/reload per combo.
const editActionConfigs: Record<
  string,
  Partial<
    Record<"hiddenActions" | "visibleActions" | "disabledActions", Action[]>
  > & {
    primaryAction?: Action;
  }
> = {
  None: {},
  "hiddenActions: [Action.Edit]": { hiddenActions: [Action.Edit] },
  "hiddenActions: [Action.EditVisualization]": {
    hiddenActions: [Action.EditVisualization],
  },
  "hiddenActions: [Action.EditLiveboard]": {
    hiddenActions: [Action.EditLiveboard],
  },
  "visibleActions: [Action.Edit]": { visibleActions: [Action.Edit] },
  "visibleActions: [Action.EditVisualization]": {
    visibleActions: [Action.EditVisualization],
  },
  "visibleActions: [Action.EditLiveboard]": {
    visibleActions: [Action.EditLiveboard],
  },
  "disabledActions: [Action.Edit]": { disabledActions: [Action.Edit] },
  "disabledActions: [Action.EditVisualization]": {
    disabledActions: [Action.EditVisualization],
  },
  "disabledActions: [Action.EditLiveboard]": {
    disabledActions: [Action.EditLiveboard],
  },
  "primaryAction: Action.Edit": { primaryAction: Action.Edit },
  "primaryAction: Action.EditVisualization": {
    primaryAction: Action.EditVisualization,
  },
};

const logEvent = (name: string, payload: unknown) => console.log(name, payload);

type EmbedType = "Liveboard" | "Search" | "Spotter" | "Full app";

let embedInstance:
  | LiveboardEmbed
  | SearchEmbed
  | SpotterEmbed
  | AppEmbed
  | undefined;
let embedType: EmbedType = "Liveboard";
let isLiveboardHeaderV2Enabled = true;
let showLiveboardTitle = false;
let isLiveboardMasterpiecesEnabled = false;
let isLiveboardCompactHeaderEnabled = false;

// Shared with all four embed types so the checkboxes take effect regardless of
// which one is on screen, even though the checkboxes themselves are only shown
// for the Liveboard embed type.
const liveboardToggleConfig = () => ({
  showLiveboardTitle,
  isLiveboardMasterpiecesEnabled,
  isLiveboardCompactHeaderEnabled,
  additionalFlags: {
    isLiveboardHeaderV2Enabled,
  },
});

// Shared across all embed types so the Edit-action split (Action.Edit vs.
// Action.EditLiveboard / Action.EditVisualization) can be exercised no matter
// which embed is on screen.
function attachEditEventLogging(
  embed: LiveboardEmbed | SearchEmbed | SpotterEmbed | AppEmbed,
) {
  trackEmbed(embed, embedType);
  embed.on(EmbedEvent.Edit, (payload) => {
    console.log("EmbedEvent.Edit", payload);
  });
  embed.on(EmbedEvent.EditLiveboard, (payload) => {
    console.log("EmbedEvent.EditLiveboard", payload);
  });
  embed.on(EmbedEvent.EditVisualization, (payload) => {
    console.log("EmbedEvent.EditVisualization", payload);
  });
}

// No vizId -> embeds the whole Liveboard, not a single tile.
function renderLiveboard(actionConfig: (typeof editActionConfigs)[string]) {
  embedInstance?.destroy();

  const liveboardEmbed = new LiveboardEmbed(div, {
    liveboardId,
    fullHeight: true,
    minimumHeight: 600,
    frameParams: { width: "100%" },
    showPreviewLoader: true,
    enableV2Shell_experimental: true,
    disabledActionReason: "ABCD",

    ...liveboardToggleConfig(),
    ...actionConfig,

    additionalFlags: {
      ...liveboardToggleConfig().additionalFlags,
      isReorderedEllipsisMenuEnabled: true,
    },
  });
  liveboardEmbed.on(EmbedEvent.Data, () => {
    console.log("Liveboard rendered");
  });
  attachEditEventLogging(liveboardEmbed);
  liveboardEmbed.render();
  embedInstance = liveboardEmbed;
}

function renderNonLiveboardEmbed(
  type: Exclude<EmbedType, "Liveboard">,
  actionConfig: (typeof editActionConfigs)[string],
) {
  embedInstance?.destroy();

  const EmbedClass = {
    Search: SearchEmbed,
    Spotter: SpotterEmbed,
    "Full app": AppEmbed,
  }[type];
  const embed = new EmbedClass(div, {
    frameParams: { width: "100%" },
    ...(type === "Spotter"
      ? {
          worksheetId: spotterWorksheetId,
          searchOptions: {
            searchQuery: "draw viz from current data as fast as possible",
          },
        }
      : {}),
    // Full app defaults to the homepage, which has no Liveboard/viz Edit
    // action to hide — point it at the same Liveboard so hiddenActions
    // etc. has something to act on.
    // ...(type === 'Full app' ? { path: \`pinboard/\${liveboardId}\` } : {}),
    ...liveboardToggleConfig(),
    ...actionConfig,
  });
  attachEditEventLogging(embed);
  embed.render();
  embedInstance = embed;
}

function renderSelectedEmbed() {
  const actionConfig = editActionConfigs[configSelect.value];
  if (embedType === "Liveboard") {
    renderLiveboard(actionConfig);
  } else {
    renderNonLiveboardEmbed(embedType, actionConfig);
  }
}

const typeBar = document.createElement("div");
typeBar.className = "page-bar";
document.body.insertBefore(typeBar, app);

const typeLabel = document.createElement("label");
typeLabel.textContent = "Embed type: ";
typeBar.appendChild(typeLabel);

const embedTypes: EmbedType[] = ["Liveboard", "Spotter", "Full app", "Search"];
embedTypes.forEach((type) => {
  const optionLabel = document.createElement("label");
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "embedType";
  radio.value = type;
  radio.checked = type === embedType;
  radio.onchange = () => {
    embedType = type;
    liveboardTogglesBar.style.display =
      embedType === "Liveboard" ? "flex" : "none";
    renderSelectedEmbed();
  };
  optionLabel.appendChild(radio);
  optionLabel.appendChild(document.createTextNode(\` \${type}\`));
  typeBar.appendChild(optionLabel);
});

const configBar = document.createElement("div");
configBar.className = "page-bar";
document.body.insertBefore(configBar, app);

const configLabel = document.createElement("label");
configLabel.textContent = "Action config: ";
configBar.appendChild(configLabel);

const configSelect = document.createElement("select");
Object.keys(editActionConfigs).forEach((name) => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  configSelect.appendChild(option);
});
configSelect.onchange = () => {
  renderSelectedEmbed();
};
configBar.appendChild(configSelect);

const liveboardTogglesBar = document.createElement("div");
liveboardTogglesBar.className = "page-bar";
document.body.insertBefore(liveboardTogglesBar, app);

const addToggle = (
  label: string,
  initial: boolean,
  onToggle: (checked: boolean) => void,
) => {
  const toggleLabel = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = initial;
  checkbox.onchange = () => {
    onToggle(checkbox.checked);
    renderSelectedEmbed();
  };
  toggleLabel.appendChild(checkbox);
  toggleLabel.appendChild(document.createTextNode(\` \${label}\`));
  liveboardTogglesBar.appendChild(toggleLabel);
};

addToggle(
  "isLiveboardHeaderV2Enabled",
  isLiveboardHeaderV2Enabled,
  (checked) => {
    isLiveboardHeaderV2Enabled = checked;
  },
);
addToggle("showLiveboardTitle", showLiveboardTitle, (checked) => {
  showLiveboardTitle = checked;
});
addToggle(
  "isLiveboardMasterpiecesEnabled",
  isLiveboardMasterpiecesEnabled,
  (checked) => {
    isLiveboardMasterpiecesEnabled = checked;
  },
);
addToggle(
  "isLiveboardCompactHeaderEnabled",
  isLiveboardCompactHeaderEnabled,
  (checked) => {
    isLiveboardCompactHeaderEnabled = checked;
  },
);
addToggle("System LB", false, (checked) => {
  liveboardId = checked ? systemLiveboardId : parametersLiveboardId;
});

// TODO(debug): remove — read-only viewer for this file's own source, so the
// deployed page can be read without going back to the repo.
const sourceOverlay = document.createElement("div");
Object.assign(sourceOverlay.style, {
  position: "fixed",
  inset: "0",
  background: "rgba(31, 35, 40, 0.5)",
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  zIndex: "10000",
});
document.body.appendChild(sourceOverlay);

const sourceModal = document.createElement("div");
Object.assign(sourceModal.style, {
  display: "flex",
  flexDirection: "column",
  width: "min(1000px, 90vw)",
  height: "85vh",
  background: "#ffffff",
  border: "1px solid #d0d7de",
  borderRadius: "6px",
  overflow: "hidden",
});
sourceOverlay.appendChild(sourceModal);

const sourceHeader = document.createElement("div");
Object.assign(sourceHeader.style, {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 10px",
  background: "#f6f8fa",
  borderBottom: "1px solid #d0d7de",
  font: "12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace",
});
sourceModal.appendChild(sourceHeader);

const sourceTitle = document.createElement("span");
sourceTitle.textContent = "edit-action-split/main.ts (read-only)";
sourceTitle.style.flex = "1";
sourceTitle.style.fontWeight = "bold";
sourceHeader.appendChild(sourceTitle);

const closeSourceButton = document.createElement("button");
closeSourceButton.textContent = "Close";
sourceHeader.appendChild(closeSourceButton);

const sourceBlock = document.createElement("pre");
Object.assign(sourceBlock.style, {
  margin: "0",
  padding: "12px",
  flex: "1",
  overflow: "auto",
  font: "12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
  color: "#1f2328",
  whiteSpace: "pre",
  tabSize: "4",
});
sourceBlock.textContent = indexSource;
sourceModal.appendChild(sourceBlock);

const setSourceVisible = (visible: boolean) => {
  sourceOverlay.style.display = visible ? "flex" : "none";
  if (visible) sourceBlock.scrollTop = 0;
};
closeSourceButton.onclick = () => setSourceVisible(false);
sourceOverlay.onclick = (event) => {
  if (event.target === sourceOverlay) setSourceVisible(false);
};
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setSourceVisible(false);
});

const viewSourceButton = document.createElement("button");
viewSourceButton.textContent = "View source";
viewSourceButton.onclick = () => setSourceVisible(true);
configBar.appendChild(viewSourceButton);

renderLiveboard(editActionConfigs[configSelect.value]);

// TODO(debug): remove — buttons to test HostEvent.Edit for the normal
// (Liveboard-level), explicit Liveboard-context, and viz-scoped variants.
// There's no HostEvent.EditLiveboard / HostEvent.EditVisualization — same
// HostEvent.Edit, differentiated by the payload/context args.

const buttonBar = document.createElement("div");
buttonBar.className = "page-bar";
document.body.insertBefore(buttonBar, app);

const addTriggerButton = (
  label: string,
  onClick: (liveboardEmbed: LiveboardEmbed) => void,
) => {
  const button = document.createElement("button");
  button.textContent = label;
  button.onclick = () => {
    if (!embedInstance) return;
    onClick(embedInstance as LiveboardEmbed);
  };
  buttonBar.appendChild(button);
};

addTriggerButton("Trigger Edit (.Edit)", (liveboardEmbed) => {
  logEvent("HostEvent.Edit", {});
  liveboardEmbed.trigger(HostEvent.Edit);
});

addTriggerButton("Trigger Edit Visualization (.Edit)", (liveboardEmbed) => {
  if (!testVizId) {
    console.warn("[debug] set testVizId to a viz GUID on this Liveboard first");
    logEvent("HostEvent.Edit (skipped)", { reason: "testVizId is not set" });
    return;
  }
  logEvent("HostEvent.Edit", { vizId: testVizId });
  liveboardEmbed.trigger(HostEvent.Edit, { vizId: testVizId });
});

addTriggerButton("Trigger .EditLiveboard HostEvent", (liveboardEmbed) => {
  logEvent("HostEvent.EditLiveboard", {});
  liveboardEmbed.trigger(HostEvent.EditLiveboard, {});
});

addTriggerButton("Trigger .EditVisualization HostEvent", (liveboardEmbed) => {
  if (!testVizId) {
    console.warn("[debug] set testVizId to a viz GUID on this Liveboard first");
    logEvent("HostEvent.EditVisualization (skipped)", {
      reason: "testVizId is not set",
    });
    return;
  }
  logEvent("HostEvent.EditVisualization", { vizId: testVizId });
  liveboardEmbed.trigger(HostEvent.EditVisualization, { vizId: testVizId });
});
`;D({title:"Edit-action split",subtitle:"Action.Edit vs EditLiveboard / EditVisualization",links:[{href:"../pv-scenarios/",label:"PV scenarios"}]});$({thoughtSpotHost:U,...K});window.addEventListener("message",e=>{e.data?.__tsEmbedConsoleForward&&console.log(`[embed:${e.data.level}]`,...e.data.args)});window.addEventListener("message",e=>{e.data?.type==="__debug_hidden_action_config__"&&console.log("[debug] hidden action config",e.data.data),e.data?.type==="__debug_menu_edit_visibility__"&&console.log("[debug] menu EDIT visibility",e.data.data)});const M="9bd202f5-d431-44bf-9a07-b4f7be372125",Y="9beaacbf-e65b-4416-b110-238d109c3531";let F=M;const E="db0badd5-47c6-400a-842d-133a7b44d435",Z="3c020c5e-1c44-4ceb-a2d6-23ba1c53a3f4",c=document.getElementById("app"),v=document.createElement("div");v.classList.add("full-liveboard");c?.appendChild(v);const B={None:{},"hiddenActions: [Action.Edit]":{hiddenActions:[o.Edit]},"hiddenActions: [Action.EditVisualization]":{hiddenActions:[o.EditVisualization]},"hiddenActions: [Action.EditLiveboard]":{hiddenActions:[o.EditLiveboard]},"visibleActions: [Action.Edit]":{visibleActions:[o.Edit]},"visibleActions: [Action.EditVisualization]":{visibleActions:[o.EditVisualization]},"visibleActions: [Action.EditLiveboard]":{visibleActions:[o.EditLiveboard]},"disabledActions: [Action.Edit]":{disabledActions:[o.Edit]},"disabledActions: [Action.EditVisualization]":{disabledActions:[o.EditVisualization]},"disabledActions: [Action.EditLiveboard]":{disabledActions:[o.EditLiveboard]},"primaryAction: Action.Edit":{primaryAction:o.Edit},"primaryAction: Action.EditVisualization":{primaryAction:o.EditVisualization}},g=(e,n)=>console.log(e,n);let a,d="Liveboard",S=!0,k=!1,w=!1,z=!1;const V=()=>({showLiveboardTitle:k,isLiveboardMasterpiecesEnabled:w,isLiveboardCompactHeaderEnabled:z,additionalFlags:{isLiveboardHeaderV2Enabled:S}});function N(e){J(e,d),e.on(p.Edit,n=>{console.log("EmbedEvent.Edit",n)}),e.on(p.EditLiveboard,n=>{console.log("EmbedEvent.EditLiveboard",n)}),e.on(p.EditVisualization,n=>{console.log("EmbedEvent.EditVisualization",n)})}function R(e){a?.destroy();const n=new W(v,{liveboardId:F,fullHeight:!0,minimumHeight:600,frameParams:{width:"100%"},showPreviewLoader:!0,enableV2Shell_experimental:!0,disabledActionReason:"ABCD",...V(),...e,additionalFlags:{...V().additionalFlags,isReorderedEllipsisMenuEnabled:!0}});n.on(p.Data,()=>{console.log("Liveboard rendered")}),N(n),n.render(),a=n}function ee(e,n){a?.destroy();const t={Search:q,Spotter:Q,"Full app":G}[e],i=new t(v,{frameParams:{width:"100%"},...e==="Spotter"?{worksheetId:Z,searchOptions:{searchQuery:"draw viz from current data as fast as possible"}}:{},...V(),...n});N(i),i.render(),a=i}function I(){const e=B[b.value];d==="Liveboard"?R(e):ee(d,e)}const h=document.createElement("div");h.className="page-bar";document.body.insertBefore(h,c);const P=document.createElement("label");P.textContent="Embed type: ";h.appendChild(P);const ne=["Liveboard","Spotter","Full app","Search"];ne.forEach(e=>{const n=document.createElement("label"),t=document.createElement("input");t.type="radio",t.name="embedType",t.value=e,t.checked=e===d,t.onchange=()=>{d=e,f.style.display=d==="Liveboard"?"flex":"none",I()},n.appendChild(t),n.appendChild(document.createTextNode(` ${e}`)),h.appendChild(n)});const l=document.createElement("div");l.className="page-bar";document.body.insertBefore(l,c);const j=document.createElement("label");j.textContent="Action config: ";l.appendChild(j);const b=document.createElement("select");Object.keys(B).forEach(e=>{const n=document.createElement("option");n.value=e,n.textContent=e,b.appendChild(n)});b.onchange=()=>{I()};l.appendChild(b);const f=document.createElement("div");f.className="page-bar";document.body.insertBefore(f,c);const m=(e,n,t)=>{const i=document.createElement("label"),r=document.createElement("input");r.type="checkbox",r.checked=n,r.onchange=()=>{t(r.checked),I()},i.appendChild(r),i.appendChild(document.createTextNode(` ${e}`)),f.appendChild(i)};m("isLiveboardHeaderV2Enabled",S,e=>{S=e});m("showLiveboardTitle",k,e=>{k=e});m("isLiveboardMasterpiecesEnabled",w,e=>{w=e});m("isLiveboardCompactHeaderEnabled",z,e=>{z=e});m("System LB",!1,e=>{F=e?Y:M});const s=document.createElement("div");Object.assign(s.style,{position:"fixed",inset:"0",background:"rgba(31, 35, 40, 0.5)",display:"none",alignItems:"center",justifyContent:"center",zIndex:"10000"});document.body.appendChild(s);const y=document.createElement("div");Object.assign(y.style,{display:"flex",flexDirection:"column",width:"min(1000px, 90vw)",height:"85vh",background:"#ffffff",border:"1px solid #d0d7de",borderRadius:"6px",overflow:"hidden"});s.appendChild(y);const L=document.createElement("div");Object.assign(L.style,{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",background:"#f6f8fa",borderBottom:"1px solid #d0d7de",font:"12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace"});y.appendChild(L);const A=document.createElement("span");A.textContent="edit-action-split/main.ts (read-only)";A.style.flex="1";A.style.fontWeight="bold";L.appendChild(A);const H=document.createElement("button");H.textContent="Close";L.appendChild(H);const C=document.createElement("pre");Object.assign(C.style,{margin:"0",padding:"12px",flex:"1",overflow:"auto",font:"12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",color:"#1f2328",whiteSpace:"pre",tabSize:"4"});C.textContent=X;y.appendChild(C);const x=e=>{s.style.display=e?"flex":"none",e&&(C.scrollTop=0)};H.onclick=()=>x(!1);s.onclick=e=>{e.target===s&&x(!1)};document.addEventListener("keydown",e=>{e.key==="Escape"&&x(!1)});const _=document.createElement("button");_.textContent="View source";_.onclick=()=>x(!0);l.appendChild(_);R(B[b.value]);const O=document.createElement("div");O.className="page-bar";document.body.insertBefore(O,c);const T=(e,n)=>{const t=document.createElement("button");t.textContent=e,t.onclick=()=>{a&&n(a)},O.appendChild(t)};T("Trigger Edit (.Edit)",e=>{g("HostEvent.Edit",{}),e.trigger(u.Edit)});T("Trigger Edit Visualization (.Edit)",e=>{g("HostEvent.Edit",{vizId:E}),e.trigger(u.Edit,{vizId:E})});T("Trigger .EditLiveboard HostEvent",e=>{g("HostEvent.EditLiveboard",{}),e.trigger(u.EditLiveboard,{})});T("Trigger .EditVisualization HostEvent",e=>{g("HostEvent.EditVisualization",{vizId:E}),e.trigger(u.EditVisualization,{vizId:E})});
