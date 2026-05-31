# AI Agent + Accessory Sub-Node Architecture — SHARED CONTRACT

> **Status:** Authoritative cross-stream contract. Identical copy lives in
> `bot-constructor-panel/docs/AI_AGENT_ARCHITECTURE.md` and
> `engine-golang/docs/AI_AGENT_ARCHITECTURE.md`.
>
> **Rule:** Parallel implementation agents (Go engine + React frontend) build against
> THIS document. Cross-stream interface strings (node `type`s, handle ids, `data`
> keys, context keys) are FROZEN here. Do not rename them in one stream without a
> contract change. When in doubt, the string in this doc wins.

This doc covers three product requirements:

1. **Accessory sub-nodes** — n8n-style non-flow input ports. A parent node exposes a
   special port; you attach a helper sub-node to it (e.g. an Agent's `ai_model` port
   gets an OpenAI provider sub-node).
2. **AI Agent node** — an agent node with attached provider + tool sub-nodes that runs
   a tool-calling loop in the Go engine.
3. **Finish the manifest-driven node system** — all node appearance from the manifest
   dict, one generic renderer, no per-node component files. Incremental, backward
   compatible.

---

## 0. Glossary & invariants

- **Flow node** — an ordinary node that participates in BFS traversal (triggers,
  actions, message ops, flow control). Existing behavior. Unchanged.
- **Accessory node (sub-node)** — a node that is NEVER traversed as a flow step. It
  only exists to configure a parent flow node. It has NO outgoing flow edges and its
  single edge connects its `source` to a parent's *accessory target handle*.
- **Accessory edge** — an edge whose `targetHandle` begins with the reserved prefix
  `acc:` (see §1). The engine resolves these to find a parent's attached accessories;
  it must NEVER follow them during traversal.
- **Parent node** — a flow node that exposes one or more accessory ports (e.g. the
  Agent node).

**Hard invariants (both streams depend on these):**

- I1. Accessory nodes have exactly ONE connection: their `source` handle → a parent
  accessory `targetHandle`. They have no flow `target` edges in and no flow `source`
  edges out.
- I2. The exported flow JSON keeps the existing `Node{id,type,data,position}` and
  `Edge{id,source,target,sourceHandle,targetHandle}` shape. No new top-level fields.
  Accessory wiring is expressed ENTIRELY through `targetHandle` naming.
- I3. Existing flows (no accessory edges, no agent nodes) must load and execute byte-for-byte
  identically. All new logic is gated behind the `acc:` prefix and new node types.

---

## 1. Accessory-edge CONTRACT (the keystone)

### 1.1 Handle-naming convention

An accessory port on a parent node is identified by a `targetHandle` of the form:

```
acc:<portType>
```

Reserved, FROZEN port types for v1:

| `targetHandle` value | Meaning | Accepts node types |
|---|---|---|
| `acc:ai_model`  | LLM provider port (exactly one) | the 4 provider nodes (§2.2) |
| `acc:ai_tool`   | Tool port (zero or more)        | the tool nodes (§2.3)      |

- The **edge** goes: `source = <accessory node id>`, `sourceHandle = "source-default"`
  (the accessory node's normal bottom/right source handle), `target = <parent node id>`,
  `targetHandle = "acc:ai_model"` (or `acc:ai_tool`).
- Multiplicity is a *parent-port* property declared in the parent's manifest
  (`maxConnections`, §3). `acc:ai_model` = 1. `acc:ai_tool` = unbounded.
- The `acc:` prefix is the ONLY thing the engine keys on. Any future port (`acc:memory`,
  `acc:embedding`, `acc:output_parser`) is automatically non-traversed with zero engine
  changes — only a manifest port entry + a node type are needed.

> **Why a prefix and not a hardcoded list:** the loader/controller skip logic is a single
> `strings.HasPrefix(edge.TargetHandle, "acc:")` test. New accessory categories never
> touch the engine traversal code.

### 1.2 How the engine identifies & skips accessories (loader.go)

Two changes in `internal/engine/loader/loader.go`, both additive:

**(a) `GetNextNodes` must skip accessory edges.** Add, alongside the existing
`selected-message-target` / `target-handler-` skips (loader.go ~line 138):

```go
// Accessory edges (acc:*) wire helper sub-nodes to a parent; never a flow step.
if strings.HasPrefix(edge.TargetHandle, "acc:") {
    continue
}
```

**(b) Accessory nodes must not become root triggers / entry nodes.** They never will via
`isTriggerNode` (their types aren't triggers), but `GetEntryNodes` (used by sub-flows)
treats any node without incoming edges as an entry. An accessory node HAS an outgoing
edge and no incoming edge, so it WOULD be misdetected. Fix: a node that is the `source`
of an `acc:` edge is an accessory and is excluded from entry detection. Add a helper:

```go
// IsAccessoryNode reports whether nodeID is the source of any acc:* edge,
// i.e. it is a helper sub-node and must never be traversed as a flow node.
func (sl *SchemaLoader) IsAccessoryNode(nodeID string) bool {
    for _, edge := range sl.schema.EdgesMap[nodeID] {
        if strings.HasPrefix(edge.TargetHandle, "acc:") {
            return true
        }
    }
    return false
}
```

Then in `GetEntryNodes` (and `buildMaps` root-trigger detection if ever broadened),
skip nodes where `IsAccessoryNode(node.ID)` is true. (Root triggers today are gated on
`isTriggerNode`, so they are already safe; the entry-node path is the one that needs it.)

> Defense in depth: even if an accessory node somehow entered the BFS queue, the
> traverse loop only executes types matching `Contains(type,"Node") && !Contains(type,"Trigger")`.
> Provider/tool node types DO contain "Node", so we rely on (a)+(b) to keep them out of
> the queue. There is no accessory handler registered in the executor, so a stray visit
> would no-op with a warning — acceptable but not relied upon.

### 1.3 How a parent resolves its attached accessories

The parent looks at the *incoming* accessory edges. `EdgesMap` is keyed by `source`, so
to find a parent's accessories you scan for edges whose `target == parentID` and
`targetHandle == "acc:<port>"`. Add ONE resolver to the loader, used by the engine:

```go
// AccessoriesFor returns the accessory nodes attached to parentID on the given
// port (e.g. "ai_model", "ai_tool"). Order follows edge declaration order.
func (sl *SchemaLoader) AccessoriesFor(parentID, port string) []*loader.Node {
    want := "acc:" + port
    var out []*loader.Node
    for i := range sl.schema.Edges {            // scan all edges (small N) by target
        e := sl.schema.Edges[i]
        if e.Target == parentID && e.TargetHandle == want {
            if n := sl.schema.NodesMap[e.Source]; n != nil {
                out = append(out, n)
            }
        }
    }
    return out
}
```

> A `parentID → []accessoryEdge` reverse index MAY be precomputed in `buildMaps`
> (`AccessoryMap map[string][]Edge`) for O(1) lookup; it is an internal optimization and
> not part of the cross-stream contract.

### 1.4 Frontend accessory-edge production (store)

When the user drags a connection from an accessory node's source handle onto a parent's
accessory port, the frontend MUST emit an edge with:

- `source` = accessory node id, `sourceHandle` = `"source-default"`
- `target` = parent node id, `targetHandle` = `"acc:ai_model"` (or `acc:ai_tool`)
- `type` = the existing default edge type (no new edge component required; an optional
  `AccessoryEdge` visual is cosmetic only — see §3.4).

Connection validation (frontend, in `onConnect` / `isValidConnection`):
- A handle whose id starts with `acc:` only accepts a `source` whose node `type` is in
  the port's `accepts` list (declared in the parent manifest, §3.2).
- `acc:ai_model` rejects a second connection (respect `maxConnections: 1`).
- Accessory source handles reject connections to non-`acc:` targets (an accessory node
  cannot be wired into the normal flow).

---

## 2. Node type catalog (FROZEN strings + data schemas)

These `type` strings and `data` keys are the cross-stream contract. The engine switches
on `type`; the frontend manifest is keyed by `type`; exported JSON uses these verbatim.

### 2.1 AI Agent node (flow node, parent)

- **type:** `AIAgentNode`
- **category:** `integrations`  (sidebar group `integrations`)
- It is a normal flow node: one `target-default` (top, incoming flow), one
  `source-default` (bottom, outgoing flow), PLUS two accessory ports rendered on the
  BOTTOM (see §3.3): `acc:ai_model` and `acc:ai_tool`.

`data` schema:

| key | type | default | notes |
|---|---|---|---|
| `systemPrompt` | string | `""` | supports `{{var}}`/`$var` substitution before send |
| `userInputSource` | string | `"message.text"` | context path read for the user turn (§5) |
| `userInputText` | string | `""` | optional literal/templated override; if non-empty, used instead of `userInputSource` |
| `outputKey` | string | `"agent_output"` | context key the final text is written to (§5) |
| `maxIterations` | number | `5` | max tool-call loop iterations (hard cap 10, §5) |
| `temperature` | number | `null` | optional per-agent override of the provider temperature |
| `maxTokens` | number | `null` | optional per-agent response cap |
| `returnMode` | string | `"text"` | `"text"` \| `"json"` — see §5.4 |
| `historyKey` | string | `""` | optional context key holding prior `messages[]` to seed the conversation |
| `errorOutputKey` | string | `"agent_error"` | context key for error string on failure (§5.5) |

> The Agent reads its provider + tools at runtime from accessory edges (§4.2). They are
> NOT in `data`.

### 2.2 Provider sub-nodes (accessory, port `ai_model`)

All four share the same shape; only `type`, default `model`, and provider-specific keys
differ. Common `data` keys (FROZEN):

| key | type | default | notes |
|---|---|---|---|
| `provider` | string | (fixed per type, see below) | dynamic registry key the engine resolves on |
| `apiKey` | string | `""` | secret; NEVER logged. May be `{{env.OPENAI_KEY}}` templated |
| `model` | string | (per type) | model id |
| `baseURL` | string | (per type, may be `""`) | override endpoint |
| `temperature` | number | `0.7` | |
| `maxTokens` | number | `null` | |
| `extraHeaders` | object | `{}` | optional raw header map |
| `extraParams` | object | `{}` | provider-specific passthrough (e.g. `top_p`) |

| type string | `provider` value | default `model` | default `baseURL` |
|---|---|---|---|
| `AIOpenAIProviderNode`    | `openai`    | `gpt-4o-mini`         | `https://api.openai.com/v1` |
| `AIOllamaProviderNode`    | `ollama`    | `llama3.1`            | `http://localhost:11434` |
| `AIGeminiProviderNode`    | `gemini`    | `gemini-1.5-flash`    | `https://generativelanguage.googleapis.com/v1beta` |
| `AIAnthropicProviderNode` | `anthropic` | `claude-3-5-haiku-latest` | `https://api.anthropic.com/v1` |

- **category:** `ai` (new sidebar group, §3.5). All four are `accessory: true` (§3.1).
- Each renders ONE source handle (`source-default`) and NO target handle (§3.3).
- The `provider` field is fixed by node type but kept in `data` so the engine resolves
  the registry purely from data (provider can also be made dynamic later by allowing the
  field to be user-editable in the manifest, without engine changes).

### 2.3 Tool sub-nodes (accessory, port `ai_tool`)

Each tool node carries a `toolName` (the function name exposed to the LLM), a
`description` (shown to the LLM), and a `parametersSchema` (JSON-Schema object the LLM
fills). Common `data` keys (FROZEN):

| key | type | default | notes |
|---|---|---|---|
| `tool` | string | (fixed per type) | dynamic tool-registry key |
| `toolName` | string | (per type) | function name given to the LLM (must match `^[a-zA-Z0-9_]+$`) |
| `description` | string | (per type) | natural-language tool description for the LLM |
| `parametersSchema` | object | (per type) | JSON-Schema `{type:"object",properties,required}` |

Initial tools:

**`AIHTTPToolNode`** — `tool: "http_request"`
| key | type | default |
|---|---|---|
| `toolName` | string | `"http_request"` |
| `method` | string | `"GET"` (or `"{{from_args}}"` to let the LLM choose) |
| `urlTemplate` | string | `""` (templated with tool args, e.g. `https://api.x/{{id}}`) |
| `headers` | object | `{}` |
| `bodyTemplate` | string | `""` |
| `timeout` | number | `30` |
| `parametersSchema` | object | `{type:"object",properties:{},required:[]}` |

**`AIMongoToolNode`** — `tool: "mongo_query"`
| key | type | default |
|---|---|---|
| `toolName` | string | `"mongo_query"` |
| `collection` | string | `""` |
| `operation` | string | `"find"` (`find`\|`find_one`\|`count`) — read-only in v1 |
| `filterTemplate` | object | `{}` (values may reference tool args via `{{arg}}`) |
| `limit` | number | `10` |
| `parametersSchema` | object | `{type:"object",properties:{},required:[]}` |

**`AICustomCodeToolNode`** — `tool: "custom_code"`
| key | type | default |
|---|---|---|
| `toolName` | string | `"custom_code"` |
| `jsCode` | string | `"// return value becomes the tool result"` |
| `parametersSchema` | object | `{type:"object",properties:{},required:[]}` |
| Runs in the SAME Goja sandbox as `CustomCodeNode` with the tool-call args exposed as `args` and all flow context available. The script's `return` (or `exit(value)`) value is the tool result. |

- **category:** `ai`. All `accessory: true`. One `source-default`, no target handle.

---

## 3. Manifest schema extension (`registry/types.ts`)

All additions are OPTIONAL fields → existing manifest entries remain valid (I3). New
nodes set the new fields.

### 3.1 `NodeManifest` additions

```ts
export interface NodeManifest {
  // ...existing fields unchanged...

  /** True = this node is a helper sub-node, never traversed as a flow step.
   *  Drives: no flow target handle, sidebar "ai" styling, drag-validation. */
  accessory?: boolean;

  /** Accessory ports this node EXPOSES (only on parent flow nodes, e.g. AIAgentNode). */
  accessoryPorts?: NodeAccessoryPortManifest[];

  /** For accessory nodes: which parent port type(s) this node may attach to.
   *  e.g. provider nodes => ["ai_model"], tool nodes => ["ai_tool"]. */
  accessoryAttachesTo?: string[];

  /** Dynamic field groups for provider/tool config rendered in the side panel.
   *  Reuses NodeFieldManifest; see §3.6. Optional — most nodes use `content`. */
  configFields?: NodeFieldManifest[];
}
```

### 3.2 New `NodeAccessoryPortManifest`

```ts
export interface NodeAccessoryPortManifest {
  /** Port type; the engine targetHandle is `acc:${portType}`. FROZEN values: "ai_model" | "ai_tool". */
  portType: string;
  /** i18n + fallback for the port label rendered under the node. */
  labelKey?: string;
  labelFallback: string;
  /** Node `type` strings this port accepts (drag validation). */
  accepts: string[];
  /** 1 = single (ai_model), undefined/0 = unbounded (ai_tool). */
  maxConnections?: number;
  /** Pill tone, reuse existing styleVariant vocabulary. */
  styleVariant?: "default" | "success" | "warning" | "danger" | "accent";
}
```

### 3.3 New handle preset + rendering (`handlePresetRegistry.tsx`)

Add a preset that renders the bottom accessory ports from `manifest.accessoryPorts`:

- Extend `NodeHandleManifest.preset` union with `"accessory-ports"`.
- `AIAgentNode` manifest `handles`:
  `[{preset:"target-default"},{preset:"source-default"},{preset:"accessory-ports"}]`.
- In `handlePresetRegistry.tsx`, handle the new preset by reading the parent manifest's
  `accessoryPorts` and rendering, for each port, a **target** `PillHandle` positioned on
  the BOTTOM edge with `id = "acc:" + port.portType`. Multiple ports are spread along the
  bottom (e.g. `left: 30% / 70%`). Each shows its `labelFallback` underneath.
- Accessory NODES (`accessory: true`) render exactly ONE source handle (`source-default`)
  and NO `target-default`. Their manifest `handles` = `[{preset:"source-default"}]`.

> The handle id MUST be exactly `acc:<portType>` (e.g. `acc:ai_model`). React Flow stores
> this verbatim as the edge `targetHandle`, which is precisely what the engine keys on
> (§1.1). This is the single point where the two streams meet — get the prefix right and
> everything else follows.

### 3.4 Edge validation + optional visual

- Validation lives in the store `onConnect`/`isValidConnection` (frontend-owned, §1.4),
  driven by `accessoryPorts[].accepts` and `maxConnections`. No engine involvement.
- An optional `AccessoryEdge` React Flow edge component (dashed, muted) MAY be registered
  for edges whose `targetHandle` starts with `acc:`, purely cosmetic. The serialized edge
  still uses the default `type`; visual selection is by `targetHandle` prefix at render
  time, so it does not change the JSON.

### 3.5 Sidebar group

Add `"ai"` to `NodeSidebarGroupId`. Provider + tool + agent nodes use `groupId: "ai"`.
Agent is `accessory:false` (a normal draggable flow node); providers/tools are
`accessory:true` and SHOULD still be draggable from the sidebar (user drops them on the
canvas, then wires them to a parent port).

### 3.6 Dynamic provider/tool config = data, not code

The whole point: adding a provider later is mostly manifest data. A provider's editable
fields (apiKey, model, baseURL, temperature, extraParams…) are expressed as
`configFields: NodeFieldManifest[]` (or plain `content` field entries) in the manifest.
The side-panel form renderer already iterates `NodeFieldManifest`; no new widget types are
required for v1 beyond what exists (`text`, `number`, `textarea`, `select`, `switch`).
A new provider = a new manifest object + (engine) a registry registration of its request
mapping. The frontend needs ZERO new component code for a new provider.

---

## 4. Engine design (`engine-golang`)

### 4.1 New package `internal/llm`

```
internal/llm/
  provider.go     // Provider interface, Registry, ChatRequest/ChatResponse, Message, ToolDef, ToolCall
  registry.go     // RegisterProvider(name, factory) + Get(name)
  openai.go       // openai + ollama (ollama is OpenAI-compatible /v1/chat/completions)
  gemini.go       // gemini mapping
  anthropic.go    // anthropic /v1/messages mapping
  agent.go        // AgentRunner: the tool-calling loop
  tool.go         // Tool interface, ToolRegistry, ToolSpec
```

**Provider interface (FROZEN):**

```go
type Message struct {
    Role       string     `json:"role"`        // "system" | "user" | "assistant" | "tool"
    Content    string     `json:"content"`
    ToolCalls  []ToolCall `json:"tool_calls,omitempty"`
    ToolCallID string     `json:"tool_call_id,omitempty"` // for role="tool"
    Name       string     `json:"name,omitempty"`         // tool name for role="tool"
}

type ToolDef struct {
    Name        string                 `json:"name"`
    Description string                 `json:"description"`
    Parameters  map[string]interface{} `json:"parameters"` // JSON-Schema object
}

type ToolCall struct {
    ID        string                 `json:"id"`
    Name      string                 `json:"name"`
    Arguments map[string]interface{} `json:"arguments"`
}

type ChatRequest struct {
    Model       string
    Messages    []Message
    Tools       []ToolDef
    Temperature *float64
    MaxTokens   *int
    Extra       map[string]interface{} // extraParams passthrough
}

type ChatResponse struct {
    Content   string     // assistant text (may be empty when tool calls present)
    ToolCalls []ToolCall // requested tool invocations (empty => final answer)
    Raw       map[string]interface{}
}

type Provider interface {
    Name() string
    Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error)
}

// ProviderConfig is built from an accessory provider node's `data`.
type ProviderConfig struct {
    APIKey       string
    Model        string
    BaseURL      string
    Temperature  *float64
    MaxTokens    *int
    ExtraHeaders map[string]string
    ExtraParams  map[string]interface{}
}

type ProviderFactory func(cfg ProviderConfig) (Provider, error)
```

**Dynamic registry (FROZEN):**

```go
// registry.go
var providerFactories = map[string]ProviderFactory{}

func RegisterProvider(name string, f ProviderFactory) { providerFactories[name] = f }

func NewProvider(name string, cfg ProviderConfig) (Provider, error) {
    f, ok := providerFactories[name]
    if !ok { return nil, fmt.Errorf("unknown llm provider %q", name) }
    return f(cfg)
}
```

Each impl file registers itself in `init()`: `RegisterProvider("openai", newOpenAI)` etc.
**Adding a provider later = one new file with an `init()` registration + a frontend
manifest entry.** No edits to agent.go, executor.go, or the registry.

**Per-provider request/response mapping (summary):**
- **openai / ollama:** POST `{baseURL}/chat/completions`. `tools` as
  `[{type:"function",function:{name,description,parameters}}]`. Response tool calls from
  `choices[0].message.tool_calls`; arguments are a JSON string → unmarshal into
  `ToolCall.Arguments`. `tool` results sent back as `{role:"tool",tool_call_id,content}`.
  Auth: `Authorization: Bearer {apiKey}` (ollama: omit if empty).
- **gemini:** POST `{baseURL}/models/{model}:generateContent?key={apiKey}`. Map roles
  (`assistant`→`model`, `tool`→`function`). Tools as `functionDeclarations`. Tool calls
  from `candidates[0].content.parts[].functionCall`; results as `functionResponse` parts.
- **anthropic:** POST `{baseURL}/messages`. Header `x-api-key:{apiKey}`,
  `anthropic-version: 2023-06-01`. System prompt is a top-level `system` field (not a
  message). Tools as `[{name,description,input_schema}]`. Tool calls from
  `content[].type=="tool_use"`; results as a user message with
  `content:[{type:"tool_result",tool_use_id,content}]`.

All four normalize INTO the common `ChatResponse{Content,ToolCalls}` so `agent.go` is
provider-agnostic.

> **Security:** `apiKey`, `extraHeaders`, and full request bodies MUST be redacted in
> logs. Log model name, provider name, token counts, latency, iteration count, and tool
> names only. Mask `Authorization`/`x-api-key`/`?key=` before any debug log.

### 4.2 Tool interface + initial tools (`tool.go`)

```go
type Tool interface {
    Spec() ToolDef                       // name, description, JSON-Schema params (LLM-facing)
    Invoke(ctx context.Context, args map[string]interface{}) (string, error) // returns tool result text
}

type ToolFactory func(data map[string]interface{}, deps ToolDeps) (Tool, error)

// ToolDeps carries engine handles a tool may need.
type ToolDeps struct {
    Repository *repository.Repository  // mongo tool
    Bot        *tgbotapi.BotAPI        // custom_code tool (telegram globals)
    ChatID     int64
    Context    map[string]interface{}  // flow context (read access for templating)
}

var toolFactories = map[string]ToolFactory{}
func RegisterTool(name string, f ToolFactory) { toolFactories[name] = f }
func NewTool(name string, data map[string]interface{}, deps ToolDeps) (Tool, error) { ... }
```

Initial registrations (in `init()`): `http_request`, `mongo_query`, `custom_code`.
- **http_request:** templates `urlTemplate`/`bodyTemplate`/`headers` with the tool `args`
  (and flow context), performs the request, returns the response body (truncated to a cap,
  e.g. 8 KB) as the tool result.
- **mongo_query:** read-only `find`/`find_one`/`count` against `deps.Repository`;
  `filterTemplate` values resolved from `args`. Returns JSON-encoded result.
- **custom_code:** runs `jsCode` in a fresh Goja VM that mirrors `CustomCodeHandler`'s
  globals, with `args` injected; the script return value (or `exit(v)`) is the result.
  Reuse the export helpers from `internal/engine/handlers/custom.go` /
  `internal/engine/code` rather than duplicating.

A tool's `tool` key selects the factory; its other `data` keys configure the instance;
its `toolName`/`description`/`parametersSchema` become the `ToolDef` shown to the LLM
(`parametersSchema` overrides any tool-intrinsic schema when present).

### 4.3 `AgentRunner` (`agent.go`)

```go
type AgentRunner struct {
    Provider Provider
    Tools    map[string]Tool // keyed by ToolDef.Name
}

type AgentConfig struct {
    SystemPrompt  string
    UserInput     string
    MaxIterations int
    Temperature   *float64
    MaxTokens     *int
    History       []Message // optional seed
}

type AgentResult struct {
    Output     string
    Iterations int
    ToolCalls  []ToolCall // audit trail
    Messages   []Message  // full transcript (for historyKey writeback)
}

func (a *AgentRunner) Run(ctx context.Context, cfg AgentConfig) (*AgentResult, error)
```

Loop:
1. `messages = [system?] + history + [user]`.
2. Build `tools = [t.Spec() for t in a.Tools]`.
3. Call `Provider.Chat`. If `ToolCalls` empty → done, `Output = resp.Content`.
4. Else append the assistant message, run each tool via `a.Tools[name].Invoke`, append a
   `role:"tool"` message per result, increment iteration, loop.
5. Stop at `MaxIterations` (hard cap 10) — return last assistant text or a
   `"max iterations reached"` note. Unknown tool name → tool message with an error string
   (let the model recover) rather than aborting.

### 4.4 `AIAgentHandler` (`internal/engine/handlers/agent.go`)

A normal `ActionHandler`, registered in executor.go:
`executor.handlers["AIAgentNode"] = handlers.NewAIAgentHandler(bot, repo, schema)`.

> **It needs the schema** to resolve accessories. The handler is constructed with the
> `*loader.SchemaLoader` and stores the node id via `SetNodeID` (the executor already
> calls `SetNodeID` for several handlers; add `AIAgentHandler` to that block, OR pass the
> node id through — see §6 batch notes). `Handle(data, chatID, context)`:

1. `providers := schema.AccessoriesFor(nodeID, "ai_model")`; require exactly one. Build
   `ProviderConfig` from its `data`; `llm.NewProvider(data["provider"], cfg)`.
2. `toolNodes := schema.AccessoriesFor(nodeID, "ai_tool")`; for each, `llm.NewTool(...)`,
   collect into `map[name]Tool`.
3. Resolve `systemPrompt` and user input via `BaseHandler.ReplaceContextVariables`
   (systemPrompt) and `userInputText` (if set) else `getNestedValue(context, userInputSource)`.
4. `runner := &AgentRunner{Provider, Tools}`; `res, err := runner.Run(ctx, cfg)`.
5. On success: `context[data["outputKey"]] = res.Output` (default key `agent_output`).
   If `returnMode=="json"`, also attempt to parse and store `context[outputKey+"_json"]`.
   If `historyKey` set: `context[historyKey] = res.Messages`.
6. On error: log (redacted), set `context[errorOutputKey] = err.Error()` (default
   `agent_error`), and return `nil` (do NOT crash the flow — let downstream If-nodes
   branch on `agent_error`). Returning `nil` keeps traversal going; this matches how
   other handlers degrade gracefully.

### 4.5 Goja globals: `llm_complete` + `agent_run` (`custom.go` / `code/`)

Expose two new globals in the Custom Code VM so custom-code nodes (and the custom_code
tool) can call the LLM stack directly. Register in `custom.go` next to the other
`vm.Set(...)` calls (add an `exportLLMFunctions(vm, chatID, context)` step):

```
llm_complete(opts) -> string | {content, tool_calls, raw}
  opts = {
    provider: "openai"|"ollama"|"gemini"|"anthropic",   // required
    apiKey, model, baseURL, temperature, maxTokens, extraHeaders, extraParams,
    system: string,                                     // optional
    messages: [{role, content}, ...] | prompt: string,  // one required
    tools: [{name, description, parameters}],           // optional (no auto-loop)
  }
  // Single-shot completion. Returns assistant text by default, or the full object
  // when opts.raw === true. Does NOT run the tool loop (use agent_run for that).

agent_run(opts) -> {output, iterations, tool_calls}
  opts = {
    provider+config (as above),
    system, input,                                      // input = user turn
    tools: [ { tool:"http_request"|"mongo_query"|"custom_code", ...toolData } ],
    maxIterations: number,
  }
  // Runs the full AgentRunner loop in-process and returns the result object.
```

Both are thin wrappers over `internal/llm`. They MUST reuse `llm.NewProvider`,
`llm.NewTool`, and `AgentRunner` — no duplicate HTTP logic. Errors surface as thrown JS
exceptions (panic with a `*goja.Object` Error), consistent with existing globals.

> This satisfies the constraint that the agent runtime is callable from custom-code nodes
> AND that the Agent node and custom code share ONE implementation.

---

## 5. Agent execution semantics (FROZEN behavior)

1. **System prompt:** `data.systemPrompt`, after `{{var}}`/`$var` substitution. For
   anthropic it maps to the top-level `system` field; for others it is the first
   `role:"system"` message.
2. **User input source:** if `data.userInputText` is non-empty → use it (after
   substitution). Else read `getNestedValue(context, data.userInputSource)`; default path
   `message.text`. If both empty → empty user turn (still valid; system-only prompt).
3. **Max tool iterations:** `data.maxIterations` (default 5), hard-capped at 10 in
   `AgentRunner.Run` regardless of data.
4. **Output context key:** final assistant text → `context[data.outputKey]`
   (default `agent_output`). Downstream nodes read it as `{{agent_output}}` /
   `$agent_output`. `returnMode:"json"` additionally tries to JSON-parse into
   `context[outputKey+"_json"]`.
5. **Error handling:** provider/tool errors are caught; `context[errorOutputKey]`
   (default `agent_error`) is set; handler returns `nil` so the flow continues. A
   downstream `IfConditionNode` can branch on whether `agent_error` is set. Per-tool
   errors during the loop become `role:"tool"` error messages so the model can self-correct;
   they do not abort the run.
6. **History:** if `data.historyKey` set, the full transcript `[]Message` is written back
   to `context[historyKey]`; a subsequent Agent node with the same `historyKey` (seeded
   via its own `historyKey`) continues the conversation.

---

## 6. Incremental migration plan for requirement #3 (manifest-only nodes)

**Current reality (verified):** the node system is ALREADY manifest-driven. All 40+ node
types render through `GenericNodeRenderer` via `runtime-node-registry.json`. There are NO
remaining per-node renderer files in the flow graph — the leftover bespoke folders are
*reusable widgets and helpers*, not node components:

- `nodes/actions/TextMessageNode/` — used as the `textMessage` widget + sub-components
  (dynamic message constructor). KEEP as a widget; not a node renderer.
- `nodes/custom/CustomCodeNode/`, `nodes/custom/FormNode/`, `nodes/custom/StateNode/` —
  provide the `customCode`, `formNode`, `stateNode` widgets and dialogs referenced by
  `widgets/widgetRegistry.tsx`. KEEP as widgets.
- `nodes/triggers/MessageTrigger/`, `nodes/*/shared/` — shared sub-widgets
  (FilterSelector, ParameterInput, StateConfigUI, NodeHeader, HandlersList, ReactFlowHandles).
  KEEP as reusable building blocks; the generic renderer imports them.

**So requirement #3 is about consolidation + the AI nodes, not a rewrite. Concrete plan:**

1. **Add the 8 new AI node manifests** (`AIAgentNode`, 4 providers, 3 tools) to
   `runtime-node-registry.json`. They render through `GenericNodeRenderer` with zero new
   node-component files — proving the generic system covers a brand-new node family.
   Provider/tool side-panel forms use `configFields`/`content` (existing field widgets).
2. **Reusable-widget boundary (what stays):** anything referenced by
   `widgets/widgetRegistry.tsx` or imported by `GenericNodeRenderer` (NodeHeader,
   HandlersList, ActionPanel, ReactFlowHandles, field widgets) is a KEPT reusable widget.
   Document this boundary in `nodes/README` so future nodes never create a per-node renderer.
3. **What gets deleted:** any *node-component* file that still exists only to render a node
   already covered by a manifest entry (search for files exporting a React Flow node that
   is in `runtimeNodeComponents`). At the time of writing the graph nodes are fully
   generic, so deletions are limited to dead re-export shims, if any. Each deletion must be
   paired with: (a) confirm the type exists in the manifest, (b) confirm
   `validateNodeRegistryCoverage()` still passes.
4. **Manifest backward compatibility:** all new `NodeManifest` fields are optional (§3.1),
   so existing entries are untouched. `validateNodeRegistryCoverage()` (registry/index.ts)
   continues to guard 1:1 type↔component coverage.
5. **Flow-JSON backward compatibility proof (BOTH streams):**
   - Engine: an existing exported `flow.json` (no `acc:` edges, no AI nodes) must produce
     identical `NodesMap/EdgesMap/RootTriggers/GlobalTriggers` and identical traversal.
     Add a golden test in `internal/engine/loader` that loads a fixture with and without
     accessory edges and asserts `GetNextNodes` returns the SAME flow targets in both
     cases (accessory edges are invisible to flow traversal).
   - Frontend: round-trip test — import an old flow JSON, re-export, assert no spurious
     `acc:`/`accessory` keys are injected into nodes that don't use them.
   - Cross-stream: a single shared fixture `assets/flow.agent.example.json` (an Agent +
     OpenAI provider + HTTP tool) is committed to BOTH repos and used as the integration
     contract test (frontend can produce it; engine can execute it).

---

## 7. Cross-stream conflict map (where the two streams could collide)

| Risk | Prevented by |
|---|---|
| Frontend emits a different `targetHandle` than the engine expects | §1.1: handle id is LITERALLY `acc:<portType>`; §3.3 ids the React Flow handle `acc:ai_model`/`acc:ai_tool`. One string, defined once. |
| Node `type` mismatch (e.g. `AgentNode` vs `AIAgentNode`) | §2 freezes every `type` string. Engine switch + manifest key + JSON all use these. |
| `data` key drift (e.g. `apiKey` vs `api_key`) | §2.1–2.3 freeze every key + type + default. |
| Output context key drift (`agent_output` vs `output`) | §5.4 freezes `outputKey` default `agent_output`. |
| Engine traverses an accessory node as a flow step | §1.2 (a)+(b): `acc:` skip in `GetNextNodes` + `IsAccessoryNode` in entry detection. |
| Provider added in one stream only | §3.6 + §4.1: a provider is a manifest entry (FE) + an `init()` registration (engine); both are additive and independently shippable; the agent works once both land. |
| Accessory node misdetected as sub-flow entry | §1.2 (b) `IsAccessoryNode`. |

---

## 8. Quick reference — the strings both streams must match exactly

- Accessory target handles: `acc:ai_model`, `acc:ai_tool`
- Accessory source handle: `source-default`
- Node types: `AIAgentNode`, `AIOpenAIProviderNode`, `AIOllamaProviderNode`,
  `AIGeminiProviderNode`, `AIAnthropicProviderNode`, `AIHTTPToolNode`, `AIMongoToolNode`,
  `AICustomCodeToolNode`
- Provider registry keys: `openai`, `ollama`, `gemini`, `anthropic`
- Tool registry keys: `http_request`, `mongo_query`, `custom_code`
- Agent default context keys: `agent_output` (success), `agent_error` (failure)
- Goja globals: `llm_complete`, `agent_run`
- New sidebar group id: `ai`
