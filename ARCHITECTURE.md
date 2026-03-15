# Architecture Overview

## Before Refactoring ❌

```
┌─────────────────────────────────────────────────────┐
│                Express Server (Render.com)          │
│                                                     │
│  server.ts → agent.ts → llm.ts                     │
│                           │                         │
│                           ├─ toolDefinitions [1]   │
│                           └─ calls OpenRouter      │
│                                                     │
│  tools.ts ← packagesApi.ts                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              MCP Server (Local)                     │
│                                                     │
│  mcp-server.ts                                     │
│    │                                                │
│    ├─ toolDefinitions [2] ← DUPLICATE!             │
│    └─ packagesApi.ts                               │
└─────────────────────────────────────────────────────┘

Problem: Tool definitions duplicated in [1] and [2]
```

---

## After Refactoring ✅

```
┌──────────────────────────────────────────────┐
│         toolDefinitions.ts                   │
│         (Single Source of Truth)             │
│                                              │
│  • toolSpecs                                 │
│  • getOpenAIToolDefinitions()               │
│  • getMCPToolDefinitions()                  │
└────────────┬──────────────┬──────────────────┘
             │              │
             ▼              ▼
┌────────────────────┐  ┌──────────────────────┐
│  Express Server    │  │    MCP Server        │
│  (Render.com)      │  │    (Local)           │
│                    │  │                      │
│  server.ts         │  │  mcp-server.ts      │
│    ↓               │  │    ↓                 │
│  agent.ts          │  │  Uses MCP tools     │
│    ↓               │  │    ↓                 │
│  llm.ts            │  │  packagesApi.ts     │
│    ↓               │  │                      │
│  Uses OpenAI tools │  │                      │
│    ↓               │  │                      │
│  tools.ts          │  │                      │
│    ↓               │  │                      │
│  packagesApi.ts    │  │                      │
└────────────────────┘  └──────────────────────┘

✅ No duplication!
✅ Same API implementations (packagesApi.ts)
✅ Same tool specs, different formats
```

---

## System Flow

### Express Server Flow (Render.com)
```
User HTTP Request
  → server.ts (Express)
    → agent.ts (Agentic loop)
      → llm.ts (Calls OpenRouter)
        ← toolDefinitions.ts (getOpenAIToolDefinitions)
      → tools.ts (Executes tool)
        → packagesApi.ts (API calls)
          → hub.ag3nts.org API
      ← Returns result
    ← Returns reply
  ← HTTP Response
```

### MCP Server Flow (Claude Desktop)
```
Claude Desktop Tool Call
  → mcp-server.ts (MCP protocol)
    ← toolDefinitions.ts (getMCPToolDefinitions)
    → packagesApi.ts (API calls)
      → hub.ag3nts.org API
    ← Returns result
  ← MCP Tool Response
```

---

## Key Components

### Core Files

| File | Purpose | Used By |
|------|---------|---------|
| `toolDefinitions.ts` | Single source for tool specs | Both |
| `packagesApi.ts` | API implementation | Both |
| `tools.ts` | Tool execution wrapper | Express |
| `agent.ts` | Agentic loop | Express |
| `llm.ts` | LLM calls | Express |
| `server.ts` | Express HTTP server | Render.com |
| `mcp-server.ts` | MCP stdio server | Local |

### Deployment

| Component | Deployment | Access |
|-----------|-----------|---------|
| Express Server | Render.com | Public HTTP API |
| MCP Server | Local machine | Claude Desktop only |

---

## Adding New Tools

When you need to add a new tool:

```
1. Define tool spec
   └─ toolDefinitions.ts
       └─ Add to toolSpecs

2. Implement API logic
   └─ packagesApi.ts (if needed)
       └─ Add new function

3. Expose to Express agent
   └─ tools.ts
       └─ Add tool wrapper

4. Done! Both servers get it automatically
   ├─ Express server (via llm.ts)
   └─ MCP server (via mcp-server.ts)
```

---

## Benefits of This Architecture

✅ **DRY (Don't Repeat Yourself)**
- Tool definitions in one place
- API logic in one place

✅ **Flexibility**
- Same tools, two interfaces
- Add more interfaces easily (HTTP REST, GraphQL, etc.)

✅ **Type Safety**
- TypeScript ensures consistency
- Compile-time checks

✅ **Maintainability**
- Change once, update everywhere
- Clear separation of concerns

✅ **Scalability**
- Easy to add new tools
- Easy to add new servers/interfaces
