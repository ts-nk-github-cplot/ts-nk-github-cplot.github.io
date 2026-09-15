import {
    Action,
    AuthType,
    ContextType,
    EmbedEvent,
    HostEvent,
    init,
    LiveboardEmbed,
} from '../dist/tsembed.es.js';

init({
    thoughtSpotHost: 'https://172.32.101.155:8443',
    // thoughtSpotHost: 'https://nebula-agentspotdev.thoughtspotdev.cloud',
    // thoughtSpotHost: 'http://localhost:5001/#/',
    // authType: AuthType.Basic,
    // username: 'tsadmin',
    // password: 'pwd',
    authType: AuthType.None,
    // authType: AuthType.Basic,
    // username: 'tsadmin',
    // password: 'pwd',
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

const liveboardId = '9bd202f5-d431-44bf-9a07-b4f7be372125';

const testVizId = 'db0badd5-47c6-400a-842d-133a7b44d435'; // fill in a viz GUID from this Liveboard to test viz-level edit

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
    width: '380px',
    background: '#1e1e1e',
    color: '#ddd',
    font: '11px/1.4 monospace',
    borderRadius: '6px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
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
    background: '#2d2d2d',
    cursor: 'pointer',
    userSelect: 'none',
});
debugConsole.appendChild(debugHeader);

const debugTitle = document.createElement('span');
debugTitle.textContent = 'Event console';
debugTitle.style.flex = '1';
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
collapseButton.textContent = '\u2013';
collapseButton.style.width = '22px';
debugHeader.appendChild(collapseButton);

const debugLog = document.createElement('div');
Object.assign(debugLog.style, {
    maxHeight: '40vh',
    overflowY: 'auto',
    padding: '4px 0',
});
debugConsole.appendChild(debugLog);

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
    const collapsed = debugLog.style.display === 'none';
    debugLog.style.display = collapsed ? '' : 'none';
    collapseButton.textContent = collapsed ? '\u2013' : '+';
};
collapseButton.onclick = toggleCollapsed;
debugHeader.onclick = toggleCollapsed;

const logEvent = (name: string, payload: unknown) => {
    const entry = document.createElement('div');
    Object.assign(entry.style, {
        padding: '4px 8px',
        borderBottom: '1px solid #333',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    });
    let body: string;
    try {
        body = JSON.stringify(payload, null, 2) ?? String(payload);
    } catch {
        body = '<unserializable payload — see devtools>';
    }
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${name}\n${body}`;
    debugLog.appendChild(entry);
    debugLog.scrollTop = debugLog.scrollHeight;
};

let liveboardEmbed: LiveboardEmbed;
let isLiveboardHeaderV2Enabled = true;
let showLiveboardTitle = false;
let isLiveboardMasterpiecesEnabled = false;
let isLiveboardCompactHeaderEnabled = false;

// No vizId -> embeds the whole Liveboard, not a single tile.
function renderLiveboard(actionConfig: (typeof editActionConfigs)[string]) {
    liveboardEmbed?.destroy();

    liveboardEmbed = new LiveboardEmbed(div, {
        liveboardId,
        fullHeight: true,
        minimumHeight: 600,
        frameParams: { width: '100%' },
        showPreviewLoader: true,
        enableV2Shell_experimental: true,
        showLiveboardTitle,
        isLiveboardMasterpiecesEnabled,
        isLiveboardCompactHeaderEnabled,

        ...actionConfig,

        additionalFlags: {
            isLiveboardHeaderV2Enabled,
            isReorderedEllipsisMenuEnabled: true,
        },
    });
    liveboardEmbed.on(EmbedEvent.Data, () => {
        console.log('Liveboard rendered');
    });
    // TODO(debug): remove — EmbedEvent.EditLiveboard / EditVisualization are
    // NOT real SDK enum members today (confirmed against the docs) — only
    // EmbedEvent.Edit exists, firing for both the Liveboard-level and
    // viz-level Edit action. These two listeners are registered anyway,
    // purely to mirror the Action.EditLiveboard / EditVisualization naming —
    // they're expected to be inert no-ops (`.on(undefined, ...)`) unless/until
    // those EmbedEvent members actually get added.
    liveboardEmbed.on(EmbedEvent.Edit, (payload) => {
        console.log('EmbedEvent.Edit', payload);
        logEvent('EmbedEvent.Edit', payload);
    });
    liveboardEmbed.on(EmbedEvent.EditLiveboard, (payload) => {
        console.log('EmbedEvent.EditLiveboard', payload);
        logEvent('EmbedEvent.EditLiveboard', payload);
    });
    liveboardEmbed.on(EmbedEvent.EditVisualization, (payload) => {
        console.log('EmbedEvent.EditVisualization', payload);
        logEvent('EmbedEvent.EditVisualization', payload);
    });
    liveboardEmbed.on(EmbedEvent.ALL, (payload: any) => {
        if (!allEventsCheckbox.checked) return;
        logEvent(`EmbedEvent.ALL \u2192 ${payload?.type ?? 'unknown'}`, payload);
    });
    liveboardEmbed.render();
}

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
    renderLiveboard(editActionConfigs[configSelect.value]);
};
configBar.appendChild(configSelect);

const addToggle = (label: string, initial: boolean, onToggle: (checked: boolean) => void) => {
    const toggleLabel = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initial;
    checkbox.onchange = () => {
        onToggle(checkbox.checked);
        renderLiveboard(editActionConfigs[configSelect.value]);
    };
    toggleLabel.appendChild(checkbox);
    toggleLabel.appendChild(document.createTextNode(` ${label}`));
    configBar.appendChild(toggleLabel);
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

const addTriggerButton = (label: string, onClick: () => void) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = onClick;
    buttonBar.appendChild(button);
};

addTriggerButton('Trigger Edit (normal)', () => {
    liveboardEmbed.trigger(HostEvent.Edit);
});

addTriggerButton('Trigger Edit Liveboard Action', () => {
    liveboardEmbed.trigger(HostEvent.EditLiveboard, {});
});

addTriggerButton('Trigger Edit Visualization', () => {
    if (!testVizId) {
        console.warn('[debug] set testVizId to a viz GUID on this Liveboard first');
        return;
    }
    liveboardEmbed.trigger(HostEvent.Edit, { vizId: testVizId });
});
