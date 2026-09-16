import{i as ie,A as ae,a as i,L as le,E as v,b as se,S as re,c as ce,H as k}from"./tsembed.es-B7KT1hvS.js";const pe=`import {
    Action,
    AppEmbed,
    AuthType,
    EmbedEvent,
    HostEvent,
    init,
    LiveboardEmbed,
    SearchEmbed,
    SpotterEmbed,
} from '../dist/tsembed.es.js';
// @ts-ignore — vite \`?raw\` import, inlines this file's own source at build time
import indexSource from './index.ts?raw';

// DO NOT ADD ANY PASSWORDS HERE
init({
    thoughtSpotHost: 'https://172.32.12.115:8443',
    authType: AuthType.None,
});

// TODO(debug): remove — host-side listener for the
// __debug_hidden_action_config__ postMessage traced from the embedded iframe
// (separate devtools context, so it can't just console.log from in there).
window.addEventListener('message', (event) => {
    if (event.data?.type === '__debug_hidden_action_config__') {
        console.log('[debug] hidden action config', event.data.data);
    }

    if (event.data?.type === '__debug_menu_edit_visibility__') {
        console.log('[debug] menu EDIT visibility', event.data.data);
    }
});

const liveboardId = '9bd202f5-d431-44bf-9a07-b4f7be372125'; // Parameters
const testVizId = 'db0badd5-47c6-400a-842d-133a7b44d435'; // Viz from Parameters LB
const spotterWorksheetId = '3c020c5e-1c44-4ceb-a2d6-23ba1c53a3f4'; // Model from Parameters LB

// const liveboardId = '9beaacbf-e65b-4416-b110-238d109c3531'; // System LB

const app = document.getElementById('app');

const div = document.createElement('div');
div.classList.add('full-liveboard');
app?.appendChild(div);

// TODO(debug): remove — the 9 combos of {hiddenActions, visibleActions,
// disabledActions} x {Action.Edit, Action.EditLiveboard,
// Action.EditVisualization} being validated for the Edit-action split. Each
// one destroys and recreates the embed so the dropdown covers all 9 without
// a rebuild/reload per combo.
const editActionConfigs: Record<
    string,
    Partial<Record<'hiddenActions' | 'visibleActions' | 'disabledActions', Action[]>>
> = {
    None: {},
    'hiddenActions: [Action.Edit]': { hiddenActions: [Action.Edit] },
    'hiddenActions: [Action.EditVisualization]': { hiddenActions: [Action.EditVisualization] },
    'hiddenActions: [Action.EditLiveboard]': { hiddenActions: [Action.EditLiveboard] },
    'visibleActions: [Action.Edit]': { visibleActions: [Action.Edit] },
    'visibleActions: [Action.EditVisualization]': { visibleActions: [Action.EditVisualization] },
    'visibleActions: [Action.EditLiveboard]': { visibleActions: [Action.EditLiveboard] },
    'disabledActions: [Action.Edit]': { disabledActions: [Action.Edit] },
    'disabledActions: [Action.EditVisualization]': { disabledActions: [Action.EditVisualization] },
    'disabledActions: [Action.EditLiveboard]': { disabledActions: [Action.EditLiveboard] },
};

// TODO(debug): remove — floating event console. Replaces the alert() calls so a
// burst of events doesn't need one dismissal each.
const debugConsole = document.createElement('div');
Object.assign(debugConsole.style, {
    position: 'fixed',
    bottom: '12px',
    right: '12px',
    width: '560px',
    maxWidth: 'calc(100vw - 24px)',
    background: '#ffffff',
    color: '#1f2328',
    font: '11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    boxShadow: '0 4px 16px rgba(31, 35, 40, 0.16)',
    zIndex: '9999',
    overflow: 'hidden',
});
document.body.appendChild(debugConsole);

const debugHeader = document.createElement('div');
Object.assign(debugHeader.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    background: '#f6f8fa',
    borderBottom: '1px solid #d0d7de',
    cursor: 'pointer',
    userSelect: 'none',
});
debugConsole.appendChild(debugHeader);

const debugTitle = document.createElement('span');
debugTitle.textContent = 'Event console';
debugTitle.style.flex = '1';
debugTitle.style.fontWeight = 'bold';
debugHeader.appendChild(debugTitle);

const allEventsLabel = document.createElement('label');
allEventsLabel.style.display = 'flex';
allEventsLabel.style.alignItems = 'center';
allEventsLabel.style.gap = '4px';
allEventsLabel.title = 'Log EmbedEvent.ALL';
const allEventsCheckbox = document.createElement('input');
allEventsCheckbox.type = 'checkbox';
allEventsCheckbox.checked = true;
allEventsLabel.appendChild(allEventsCheckbox);
allEventsLabel.appendChild(document.createTextNode('ALL'));
debugHeader.appendChild(allEventsLabel);

const clearButton = document.createElement('button');
clearButton.textContent = 'Clear';
debugHeader.appendChild(clearButton);

const collapseButton = document.createElement('button');
collapseButton.textContent = '\\u2013';
collapseButton.style.width = '22px';
debugHeader.appendChild(collapseButton);

const debugBody = document.createElement('div');
debugConsole.appendChild(debugBody);

const searchBar = document.createElement('div');
Object.assign(searchBar.style, {
    padding: '6px 8px',
    borderBottom: '1px solid #eaeef2',
});
debugBody.appendChild(searchBar);

const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.placeholder = 'Filter by event name or payload\\u2026';
Object.assign(searchInput.style, {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    font: 'inherit',
    border: '1px solid #d0d7de',
    borderRadius: '4px',
});
searchBar.appendChild(searchInput);

const debugLog = document.createElement('div');
Object.assign(debugLog.style, {
    maxHeight: '40vh',
    overflowY: 'auto',
});
debugBody.appendChild(debugLog);

// Header clicks toggle, so the controls inside it must not bubble up.
[allEventsLabel, clearButton].forEach((el) => {
    el.onclick = (event) => event.stopPropagation();
});
allEventsCheckbox.onchange = (event) => event.stopPropagation();
clearButton.onclick = (event) => {
    event.stopPropagation();
    debugLog.replaceChildren();
};

const toggleCollapsed = () => {
    const collapsed = debugBody.style.display === 'none';
    debugBody.style.display = collapsed ? '' : 'none';
    collapseButton.textContent = collapsed ? '\\u2013' : '+';
};
collapseButton.onclick = (event) => {
    event.stopPropagation();
    toggleCollapsed();
};
debugHeader.onclick = toggleCollapsed;

const applyFilter = (entry: HTMLElement) => {
    const term = searchInput.value.trim().toLowerCase();
    const matches = !term || (entry.dataset.search ?? '').includes(term);
    entry.style.display = matches ? '' : 'none';
};
searchInput.oninput = () => {
    Array.from(debugLog.children).forEach((child) => applyFilter(child as HTMLElement));
};

const eventColor = (name: string) => {
    if (name.startsWith('HostEvent')) return '#8250df';
    if (name.startsWith('EmbedEvent.ALL')) return '#6e7781';
    return '#0550ae';
};

const logEvent = (name: string, payload: unknown) => {
    let body: string;
    try {
        body = JSON.stringify(payload, null, 2) ?? String(payload);
    } catch {
        body = '<unserializable payload \\u2014 see devtools>';
    }

    const entry = document.createElement('div');
    Object.assign(entry.style, {
        padding: '5px 8px',
        borderBottom: '1px solid #eaeef2',
    });
    entry.dataset.search = \`\${name} \${body}\`.toLowerCase();

    const timestamp = document.createElement('span');
    timestamp.textContent = \`\${new Date().toLocaleTimeString()} \`;
    timestamp.style.color = '#6e7781';

    const label = document.createElement('span');
    label.textContent = name;
    label.style.color = eventColor(name);
    label.style.fontWeight = 'bold';

    const payloadBlock = document.createElement('pre');
    Object.assign(payloadBlock.style, {
        margin: '2px 0 0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: '#57606a',
        font: 'inherit',
    });
    payloadBlock.textContent = body;

    const titleRow = document.createElement('div');
    titleRow.append(timestamp, label);
    entry.append(titleRow, payloadBlock);

    applyFilter(entry);
    debugLog.appendChild(entry);
    debugLog.scrollTop = debugLog.scrollHeight;
};

type EmbedType = 'Liveboard' | 'Search' | 'Spotter' | 'Full app';

let embedInstance: LiveboardEmbed | SearchEmbed | SpotterEmbed | AppEmbed | undefined;
let embedType: EmbedType = 'Liveboard';
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
function attachEditEventLogging(embed: LiveboardEmbed | SearchEmbed | SpotterEmbed | AppEmbed) {
    embed.on(EmbedEvent.Edit, (payload) => {
        console.log('EmbedEvent.Edit', payload);
        logEvent('EmbedEvent.Edit', payload);
    });
    embed.on(EmbedEvent.EditLiveboard, (payload) => {
        console.log('EmbedEvent.EditLiveboard', payload);
        logEvent('EmbedEvent.EditLiveboard', payload);
    });
    embed.on(EmbedEvent.EditVisualization, (payload) => {
        console.log('EmbedEvent.EditVisualization', payload);
        logEvent('EmbedEvent.EditVisualization', payload);
    });
    embed.on(EmbedEvent.ALL, (payload: any) => {
        if (!allEventsCheckbox.checked) return;
        logEvent(\`EmbedEvent.ALL → \${payload?.type ?? 'unknown'}\`, payload);
    });
}

// No vizId -> embeds the whole Liveboard, not a single tile.
function renderLiveboard(actionConfig: (typeof editActionConfigs)[string]) {
    embedInstance?.destroy();

    const liveboardEmbed = new LiveboardEmbed(div, {
        liveboardId,
        fullHeight: true,
        minimumHeight: 600,
        frameParams: { width: '100%' },
        showPreviewLoader: true,
        enableV2Shell_experimental: true,

        ...liveboardToggleConfig(),
        ...actionConfig,

        additionalFlags: {
            ...liveboardToggleConfig().additionalFlags,
            isReorderedEllipsisMenuEnabled: true,
        },
    });
    liveboardEmbed.on(EmbedEvent.Data, () => {
        console.log('Liveboard rendered');
    });
    attachEditEventLogging(liveboardEmbed);
    liveboardEmbed.render();
    embedInstance = liveboardEmbed;
}

function renderNonLiveboardEmbed(
    type: Exclude<EmbedType, 'Liveboard'>,
    actionConfig: (typeof editActionConfigs)[string],
) {
    embedInstance?.destroy();

    const EmbedClass = { Search: SearchEmbed, Spotter: SpotterEmbed, 'Full app': AppEmbed }[type];
    const embed = new EmbedClass(div, {
        frameParams: { width: '100%' },
        ...(type === 'Spotter'
            ? {
                  worksheetId: spotterWorksheetId,
                  searchOptions: { searchQuery: 'draw viz from current data as fast as possible' },
              }
            : {}),
        // Full app defaults to the homepage, which has no Liveboard/viz Edit
        // action to hide — point it at the same Liveboard so hiddenActions
        // etc. has something to act on.
        ...(type === 'Full app' ? { path: \`pinboard/\${liveboardId}\` } : {}),
        ...liveboardToggleConfig(),
        ...actionConfig,
    });
    attachEditEventLogging(embed);
    embed.render();
    embedInstance = embed;
}

function renderSelectedEmbed() {
    const actionConfig = editActionConfigs[configSelect.value];
    if (embedType === 'Liveboard') {
        renderLiveboard(actionConfig);
    } else {
        renderNonLiveboardEmbed(embedType, actionConfig);
    }
}

const nav = document.createElement('div');
nav.style.padding = '8px';
const prerenderLink = document.createElement('a');
prerenderLink.href = 'prerender.html';
prerenderLink.textContent = 'HostEvent.UpdateEmbedParams pre-render debug page →';
nav.appendChild(prerenderLink);
document.body.insertBefore(nav, app);

const typeBar = document.createElement('div');
typeBar.style.display = 'flex';
typeBar.style.gap = '12px';
typeBar.style.alignItems = 'center';
typeBar.style.padding = '8px';
document.body.insertBefore(typeBar, app);

const typeLabel = document.createElement('label');
typeLabel.textContent = 'Embed type: ';
typeBar.appendChild(typeLabel);

const embedTypes: EmbedType[] = ['Liveboard', 'Spotter', 'Full app', 'Search'];
embedTypes.forEach((type) => {
    const optionLabel = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'embedType';
    radio.value = type;
    radio.checked = type === embedType;
    radio.onchange = () => {
        embedType = type;
        liveboardTogglesBar.style.display = embedType === 'Liveboard' ? 'flex' : 'none';
        debugLog.replaceChildren();
        renderSelectedEmbed();
    };
    optionLabel.appendChild(radio);
    optionLabel.appendChild(document.createTextNode(\` \${type}\`));
    typeBar.appendChild(optionLabel);
});

const configBar = document.createElement('div');
configBar.style.display = 'flex';
configBar.style.gap = '8px';
configBar.style.alignItems = 'center';
configBar.style.padding = '8px';
document.body.insertBefore(configBar, app);

const configLabel = document.createElement('label');
configLabel.textContent = 'Action config: ';
configBar.appendChild(configLabel);

const configSelect = document.createElement('select');
Object.keys(editActionConfigs).forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    configSelect.appendChild(option);
});
configSelect.onchange = () => {
    renderSelectedEmbed();
};
configBar.appendChild(configSelect);

const liveboardTogglesBar = document.createElement('div');
liveboardTogglesBar.style.display = 'flex';
liveboardTogglesBar.style.gap = '8px';
liveboardTogglesBar.style.alignItems = 'center';
liveboardTogglesBar.style.padding = '8px';
document.body.insertBefore(liveboardTogglesBar, app);

const addToggle = (label: string, initial: boolean, onToggle: (checked: boolean) => void) => {
    const toggleLabel = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initial;
    checkbox.onchange = () => {
        onToggle(checkbox.checked);
        renderSelectedEmbed();
    };
    toggleLabel.appendChild(checkbox);
    toggleLabel.appendChild(document.createTextNode(\` \${label}\`));
    liveboardTogglesBar.appendChild(toggleLabel);
};

addToggle('isLiveboardHeaderV2Enabled', isLiveboardHeaderV2Enabled, (checked) => {
    isLiveboardHeaderV2Enabled = checked;
});
addToggle('showLiveboardTitle', showLiveboardTitle, (checked) => {
    showLiveboardTitle = checked;
});
addToggle('isLiveboardMasterpiecesEnabled', isLiveboardMasterpiecesEnabled, (checked) => {
    isLiveboardMasterpiecesEnabled = checked;
});
addToggle('isLiveboardCompactHeaderEnabled', isLiveboardCompactHeaderEnabled, (checked) => {
    isLiveboardCompactHeaderEnabled = checked;
});

// TODO(debug): remove — read-only viewer for this file's own source, so the
// deployed page can be read without going back to the repo.
const sourceOverlay = document.createElement('div');
Object.assign(sourceOverlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(31, 35, 40, 0.5)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '10000',
});
document.body.appendChild(sourceOverlay);

const sourceModal = document.createElement('div');
Object.assign(sourceModal.style, {
    display: 'flex',
    flexDirection: 'column',
    width: 'min(1000px, 90vw)',
    height: '85vh',
    background: '#ffffff',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    overflow: 'hidden',
});
sourceOverlay.appendChild(sourceModal);

const sourceHeader = document.createElement('div');
Object.assign(sourceHeader.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: '#f6f8fa',
    borderBottom: '1px solid #d0d7de',
    font: '12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace',
});
sourceModal.appendChild(sourceHeader);

const sourceTitle = document.createElement('span');
sourceTitle.textContent = 'local/index.ts (read-only)';
sourceTitle.style.flex = '1';
sourceTitle.style.fontWeight = 'bold';
sourceHeader.appendChild(sourceTitle);

const closeSourceButton = document.createElement('button');
closeSourceButton.textContent = 'Close';
sourceHeader.appendChild(closeSourceButton);

const sourceBlock = document.createElement('pre');
Object.assign(sourceBlock.style, {
    margin: '0',
    padding: '12px',
    flex: '1',
    overflow: 'auto',
    font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#1f2328',
    whiteSpace: 'pre',
    tabSize: '4',
});
sourceBlock.textContent = indexSource;
sourceModal.appendChild(sourceBlock);

const setSourceVisible = (visible: boolean) => {
    sourceOverlay.style.display = visible ? 'flex' : 'none';
    if (visible) sourceBlock.scrollTop = 0;
};
closeSourceButton.onclick = () => setSourceVisible(false);
sourceOverlay.onclick = (event) => {
    if (event.target === sourceOverlay) setSourceVisible(false);
};
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setSourceVisible(false);
});

const viewSourceButton = document.createElement('button');
viewSourceButton.textContent = 'View source';
viewSourceButton.onclick = () => setSourceVisible(true);
configBar.appendChild(viewSourceButton);

renderLiveboard(editActionConfigs[configSelect.value]);

// TODO(debug): remove — buttons to test HostEvent.Edit for the normal
// (Liveboard-level), explicit Liveboard-context, and viz-scoped variants.
// There's no HostEvent.EditLiveboard / HostEvent.EditVisualization — same
// HostEvent.Edit, differentiated by the payload/context args.

const buttonBar = document.createElement('div');
buttonBar.style.display = 'flex';
buttonBar.style.gap = '8px';
buttonBar.style.padding = '8px';
document.body.insertBefore(buttonBar, app);

const addTriggerButton = (label: string, onClick: (liveboardEmbed: LiveboardEmbed) => void) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = () => {
        if (!embedInstance) return;
        onClick(embedInstance as LiveboardEmbed);
    };
    buttonBar.appendChild(button);
};

addTriggerButton('Trigger Edit (.Edit)', (liveboardEmbed) => {
    logEvent('HostEvent.Edit', {});
    liveboardEmbed.trigger(HostEvent.Edit);
});

addTriggerButton('Trigger Edit Visualization (.Edit)', (liveboardEmbed) => {
    if (!testVizId) {
        console.warn('[debug] set testVizId to a viz GUID on this Liveboard first');
        logEvent('HostEvent.Edit (skipped)', { reason: 'testVizId is not set' });
        return;
    }
    logEvent('HostEvent.Edit', { vizId: testVizId });
    liveboardEmbed.trigger(HostEvent.Edit, { vizId: testVizId });
});

addTriggerButton('Trigger .EditLiveboard HostEvent', (liveboardEmbed) => {
    logEvent('HostEvent.EditLiveboard', {});
    liveboardEmbed.trigger(HostEvent.EditLiveboard, {});
});

addTriggerButton('Trigger .EditVisualization HostEvent', (liveboardEmbed) => {
    if (!testVizId) {
        console.warn('[debug] set testVizId to a viz GUID on this Liveboard first');
        logEvent('HostEvent.EditVisualization (skipped)', { reason: 'testVizId is not set' });
        return;
    }
    logEvent('HostEvent.EditVisualization', { vizId: testVizId });
    liveboardEmbed.trigger(HostEvent.EditVisualization, { vizId: testVizId });
});
`;ie({thoughtSpotHost:"https://172.32.12.115:8443",authType:ae.None});window.addEventListener("message",e=>{e.data?.type==="__debug_hidden_action_config__"&&console.log("[debug] hidden action config",e.data.data),e.data?.type==="__debug_menu_edit_visibility__"&&console.log("[debug] menu EDIT visibility",e.data.data)});const X="9bd202f5-d431-44bf-9a07-b4f7be372125",B="db0badd5-47c6-400a-842d-133a7b44d435",be="3c020c5e-1c44-4ceb-a2d6-23ba1c53a3f4",g=document.getElementById("app"),T=document.createElement("div");T.classList.add("full-liveboard");g?.appendChild(T);const $={None:{},"hiddenActions: [Action.Edit]":{hiddenActions:[i.Edit]},"hiddenActions: [Action.EditVisualization]":{hiddenActions:[i.EditVisualization]},"hiddenActions: [Action.EditLiveboard]":{hiddenActions:[i.EditLiveboard]},"visibleActions: [Action.Edit]":{visibleActions:[i.Edit]},"visibleActions: [Action.EditVisualization]":{visibleActions:[i.EditVisualization]},"visibleActions: [Action.EditLiveboard]":{visibleActions:[i.EditLiveboard]},"disabledActions: [Action.Edit]":{disabledActions:[i.Edit]},"disabledActions: [Action.EditVisualization]":{disabledActions:[i.EditVisualization]},"disabledActions: [Action.EditLiveboard]":{disabledActions:[i.EditLiveboard]}},w=document.createElement("div");Object.assign(w.style,{position:"fixed",bottom:"12px",right:"12px",width:"560px",maxWidth:"calc(100vw - 24px)",background:"#ffffff",color:"#1f2328",font:"11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",border:"1px solid #d0d7de",borderRadius:"6px",boxShadow:"0 4px 16px rgba(31, 35, 40, 0.16)",zIndex:"9999",overflow:"hidden"});document.body.appendChild(w);const c=document.createElement("div");Object.assign(c.style,{display:"flex",alignItems:"center",gap:"8px",padding:"6px 8px",background:"#f6f8fa",borderBottom:"1px solid #d0d7de",cursor:"pointer",userSelect:"none"});w.appendChild(c);const S=document.createElement("span");S.textContent="Event console";S.style.flex="1";S.style.fontWeight="bold";c.appendChild(S);const s=document.createElement("label");s.style.display="flex";s.style.alignItems="center";s.style.gap="4px";s.title="Log EmbedEvent.ALL";const f=document.createElement("input");f.type="checkbox";f.checked=!0;s.appendChild(f);s.appendChild(document.createTextNode("ALL"));c.appendChild(s);const H=document.createElement("button");H.textContent="Clear";c.appendChild(H);const x=document.createElement("button");x.textContent="–";x.style.width="22px";c.appendChild(x);const y=document.createElement("div");w.appendChild(y);const U=document.createElement("div");Object.assign(U.style,{padding:"6px 8px",borderBottom:"1px solid #eaeef2"});y.appendChild(U);const E=document.createElement("input");E.type="search";E.placeholder="Filter by event name or payload…";Object.assign(E.style,{width:"100%",boxSizing:"border-box",padding:"4px 6px",font:"inherit",border:"1px solid #d0d7de",borderRadius:"4px"});U.appendChild(E);const l=document.createElement("div");Object.assign(l.style,{maxHeight:"40vh",overflowY:"auto"});y.appendChild(l);[s,H].forEach(e=>{e.onclick=n=>n.stopPropagation()});f.onchange=e=>e.stopPropagation();H.onclick=e=>{e.stopPropagation(),l.replaceChildren()};const Z=()=>{const e=y.style.display==="none";y.style.display=e?"":"none",x.textContent=e?"–":"+"};x.onclick=e=>{e.stopPropagation(),Z()};c.onclick=Z;const ee=e=>{const n=E.value.trim().toLowerCase(),t=!n||(e.dataset.search??"").includes(n);e.style.display=t?"":"none"};E.oninput=()=>{Array.from(l.children).forEach(e=>ee(e))};const ue=e=>e.startsWith("HostEvent")?"#8250df":e.startsWith("EmbedEvent.ALL")?"#6e7781":"#0550ae",a=(e,n)=>{let t;try{t=JSON.stringify(n,null,2)??String(n)}catch{t="<unserializable payload — see devtools>"}const o=document.createElement("div");Object.assign(o.style,{padding:"5px 8px",borderBottom:"1px solid #eaeef2"}),o.dataset.search=`${e} ${t}`.toLowerCase();const d=document.createElement("span");d.textContent=`${new Date().toLocaleTimeString()} `,d.style.color="#6e7781";const A=document.createElement("span");A.textContent=e,A.style.color=ue(e),A.style.fontWeight="bold";const F=document.createElement("pre");Object.assign(F.style,{margin:"2px 0 0",whiteSpace:"pre-wrap",wordBreak:"break-word",color:"#57606a",font:"inherit"}),F.textContent=t;const K=document.createElement("div");K.append(d,A),o.append(K,F),ee(o),l.appendChild(o),l.scrollTop=l.scrollHeight};let u,h="Liveboard",R=!0,P=!1,D=!1,N=!1;const W=()=>({showLiveboardTitle:P,isLiveboardMasterpiecesEnabled:D,isLiveboardCompactHeaderEnabled:N,additionalFlags:{isLiveboardHeaderV2Enabled:R}});function ne(e){e.on(v.Edit,n=>{console.log("EmbedEvent.Edit",n),a("EmbedEvent.Edit",n)}),e.on(v.EditLiveboard,n=>{console.log("EmbedEvent.EditLiveboard",n),a("EmbedEvent.EditLiveboard",n)}),e.on(v.EditVisualization,n=>{console.log("EmbedEvent.EditVisualization",n),a("EmbedEvent.EditVisualization",n)}),e.on(v.ALL,n=>{f.checked&&a(`EmbedEvent.ALL → ${n?.type??"unknown"}`,n)})}function te(e){u?.destroy();const n=new le(T,{liveboardId:X,fullHeight:!0,minimumHeight:600,frameParams:{width:"100%"},showPreviewLoader:!0,enableV2Shell_experimental:!0,...W(),...e,additionalFlags:{...W().additionalFlags,isReorderedEllipsisMenuEnabled:!0}});n.on(v.Data,()=>{console.log("Liveboard rendered")}),ne(n),n.render(),u=n}function me(e,n){u?.destroy();const t={Search:ce,Spotter:re,"Full app":se}[e],o=new t(T,{frameParams:{width:"100%"},...e==="Spotter"?{worksheetId:be,searchOptions:{searchQuery:"draw viz from current data as fast as possible"}}:{},...e==="Full app"?{path:`pinboard/${X}`}:{},...W(),...n});ne(o),o.render(),u=o}function Y(){const e=$[L.value];h==="Liveboard"?te(e):me(h,e)}const G=document.createElement("div");G.style.padding="8px";const J=document.createElement("a");J.href="prerender.html";J.textContent="HostEvent.UpdateEmbedParams pre-render debug page →";G.appendChild(J);document.body.insertBefore(G,g);const p=document.createElement("div");p.style.display="flex";p.style.gap="12px";p.style.alignItems="center";p.style.padding="8px";document.body.insertBefore(p,g);const oe=document.createElement("label");oe.textContent="Embed type: ";p.appendChild(oe);const ge=["Liveboard","Spotter","Full app","Search"];ge.forEach(e=>{const n=document.createElement("label"),t=document.createElement("input");t.type="radio",t.name="embedType",t.value=e,t.checked=e===h,t.onchange=()=>{h=e,b.style.display=h==="Liveboard"?"flex":"none",l.replaceChildren(),Y()},n.appendChild(t),n.appendChild(document.createTextNode(` ${e}`)),p.appendChild(n)});const r=document.createElement("div");r.style.display="flex";r.style.gap="8px";r.style.alignItems="center";r.style.padding="8px";document.body.insertBefore(r,g);const de=document.createElement("label");de.textContent="Action config: ";r.appendChild(de);const L=document.createElement("select");Object.keys($).forEach(e=>{const n=document.createElement("option");n.value=e,n.textContent=e,L.appendChild(n)});L.onchange=()=>{Y()};r.appendChild(L);const b=document.createElement("div");b.style.display="flex";b.style.gap="8px";b.style.alignItems="center";b.style.padding="8px";document.body.insertBefore(b,g);const I=(e,n,t)=>{const o=document.createElement("label"),d=document.createElement("input");d.type="checkbox",d.checked=n,d.onchange=()=>{t(d.checked),Y()},o.appendChild(d),o.appendChild(document.createTextNode(` ${e}`)),b.appendChild(o)};I("isLiveboardHeaderV2Enabled",R,e=>{R=e});I("showLiveboardTitle",P,e=>{P=e});I("isLiveboardMasterpiecesEnabled",D,e=>{D=e});I("isLiveboardCompactHeaderEnabled",N,e=>{N=e});const m=document.createElement("div");Object.assign(m.style,{position:"fixed",inset:"0",background:"rgba(31, 35, 40, 0.5)",display:"none",alignItems:"center",justifyContent:"center",zIndex:"10000"});document.body.appendChild(m);const z=document.createElement("div");Object.assign(z.style,{display:"flex",flexDirection:"column",width:"min(1000px, 90vw)",height:"85vh",background:"#ffffff",border:"1px solid #d0d7de",borderRadius:"6px",overflow:"hidden"});m.appendChild(z);const V=document.createElement("div");Object.assign(V.style,{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",background:"#f6f8fa",borderBottom:"1px solid #d0d7de",font:"12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace"});z.appendChild(V);const O=document.createElement("span");O.textContent="local/index.ts (read-only)";O.style.flex="1";O.style.fontWeight="bold";V.appendChild(O);const Q=document.createElement("button");Q.textContent="Close";V.appendChild(Q);const _=document.createElement("pre");Object.assign(_.style,{margin:"0",padding:"12px",flex:"1",overflow:"auto",font:"12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",color:"#1f2328",whiteSpace:"pre",tabSize:"4"});_.textContent=pe;z.appendChild(_);const M=e=>{m.style.display=e?"flex":"none",e&&(_.scrollTop=0)};Q.onclick=()=>M(!1);m.onclick=e=>{e.target===m&&M(!1)};document.addEventListener("keydown",e=>{e.key==="Escape"&&M(!1)});const q=document.createElement("button");q.textContent="View source";q.onclick=()=>M(!0);r.appendChild(q);te($[L.value]);const C=document.createElement("div");C.style.display="flex";C.style.gap="8px";C.style.padding="8px";document.body.insertBefore(C,g);const j=(e,n)=>{const t=document.createElement("button");t.textContent=e,t.onclick=()=>{u&&n(u)},C.appendChild(t)};j("Trigger Edit (.Edit)",e=>{a("HostEvent.Edit",{}),e.trigger(k.Edit)});j("Trigger Edit Visualization (.Edit)",e=>{a("HostEvent.Edit",{vizId:B}),e.trigger(k.Edit,{vizId:B})});j("Trigger .EditLiveboard HostEvent",e=>{a("HostEvent.EditLiveboard",{}),e.trigger(k.EditLiveboard,{})});j("Trigger .EditVisualization HostEvent",e=>{a("HostEvent.EditVisualization",{vizId:B}),e.trigger(k.EditVisualization,{vizId:B})});
