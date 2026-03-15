# Zod Schema Refactoring

## What Changed

Replaced plain TypeScript types with **Zod schemas** for runtime validation and type inference.

---

## Benefits

### ✅ 1. Runtime Validation
**Before:** Only compile-time type checking
```typescript
// Could pass invalid data at runtime
const args = { packageid: 123 } // Wrong type but passes at runtime
```

**After:** Runtime validation with Zod
```typescript
// Automatically validates at runtime
const validatedArgs = validateToolArgs('check_package', args)
// Throws error if packageid is not a string
```

### ✅ 2. Type Inference
**Before:** Manual type definitions
```typescript
// Had to define types manually
async (args: { packageid: string; destination: string; code: string })
```

**After:** Automatic type inference
```typescript
// Types inferred from Zod schema
async (args: RedirectPackageParams) // ← Inferred from schema!
```

### ✅ 3. Single Source of Truth
- Schema defines both validation AND types
- No duplication between runtime and compile-time
- Change schema once, types update everywhere

### ✅ 4. Better Error Messages
**Before:**
```
Error: Invalid arguments for redirect_package
```

**After:**
```
Error: Invalid arguments for redirect_package:
  Expected string at packageid, received number
```

---

## New Structure

### `src/toolDefinitions.ts`

```typescript
// Define Zod schemas
export const CheckPackageSchema = z.object({
  packageid: z.string().describe('Package ID')
})

// Automatically infer types
export type CheckPackageParams = z.infer<typeof CheckPackageSchema>

// Convert schemas to different formats
export function getOpenAIToolDefinitions()  // For OpenRouter
export function getMCPToolDefinitions()     // For MCP
export function validateToolArgs()          // Runtime validation
```

### How It Works

```
┌──────────────────────────────────────────┐
│     Zod Schema (Single Source)          │
│                                          │
│  const Schema = z.object({              │
│    packageid: z.string()                │
│  })                                      │
└──────────┬───────────────┬───────────────┘
           │               │
           ▼               ▼
    ┌──────────────┐  ┌──────────────┐
    │ TypeScript   │  │   Runtime    │
    │    Types     │  │  Validation  │
    │              │  │              │
    │ type Params  │  │ .parse()     │
    │   = z.infer  │  │ .safeParse() │
    └──────────────┘  └──────────────┘
           │               │
           ▼               ▼
    ┌──────────────────────────────┐
    │     JSON Schema Export       │
    │  (for OpenAI & MCP APIs)     │
    └──────────────────────────────┘
```

---

## File Changes

### `src/toolDefinitions.ts` ⭐ NEW
- Zod schemas: `CheckPackageSchema`, `RedirectPackageSchema`
- Type exports: `CheckPackageParams`, `RedirectPackageParams`
- Converters: `getOpenAIToolDefinitions()`, `getMCPToolDefinitions()`
- Validator: `validateToolArgs()`

### `src/tools.ts`
**Before:**
```typescript
check_package: async (args: { packageid: string })
```

**After:**
```typescript
check_package: async (args: CheckPackageParams)
```

### `src/agent.ts`
**Before:**
```typescript
if (!args || typeof args !== 'object') {
  throw new Error(`Invalid arguments for ${name}`)
}
```

**After:**
```typescript
const validatedArgs = validateToolArgs(name, args)
// Automatic validation with descriptive errors
```

### `src/mcp-server.ts`
**Before:**
```typescript
if (!args || typeof args.packageid !== 'string') {
  throw new Error('Invalid arguments: packageid must be a string')
}
```

**After:**
```typescript
const validatedArgs: any = validateToolArgs(name, args)
// Zod handles all validation
```

---

## Adding New Tools

### Old Way (Without Zod)
```typescript
// 1. Define tool definition
const toolDef = {
  name: 'new_tool',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string' }
    }
  }
}

// 2. Define TypeScript type manually
type NewToolParams = {
  param1: string
}

// 3. Add validation logic
if (typeof args.param1 !== 'string') {
  throw new Error('Invalid param1')
}
```

### New Way (With Zod) ✨
```typescript
// 1. Define Zod schema (that's it!)
export const NewToolSchema = z.object({
  param1: z.string().describe('Description')
})

// 2. Type automatically inferred
export type NewToolParams = z.infer<typeof NewToolSchema>

// 3. Validation automatic
const validatedArgs = validateToolArgs('new_tool', args)
```

---

## Example: Validation in Action

### Valid Input
```typescript
const args = { packageid: 'PKG123' }
const validated = validateToolArgs('check_package', args)
// ✅ Returns: { packageid: 'PKG123' }
```

### Invalid Input
```typescript
const args = { packageid: 123 }
const validated = validateToolArgs('check_package', args)
// ❌ Throws: ZodError with detailed message:
// [
//   {
//     "code": "invalid_type",
//     "expected": "string",
//     "received": "number",
//     "path": ["packageid"],
//     "message": "Expected string, received number"
//   }
// ]
```

### Missing Required Field
```typescript
const args = {}
const validated = validateToolArgs('check_package', args)
// ❌ Throws: ZodError:
// Required field 'packageid' is missing
```

---

## Testing

All tests pass:
- ✅ TypeScript compilation
- ✅ MCP server starts
- ✅ Express server works
- ✅ Runtime validation working

---

## Dependencies

**Added:**
- `zod` (^4.3.6) - Already installed
- `zod-to-json-schema` (^3.25.1) - Converts Zod to JSON Schema

---

## Migration Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Validation** | Manual type checks | Automatic Zod validation |
| **Type Safety** | Compile-time only | Compile + runtime |
| **Error Messages** | Generic | Detailed and specific |
| **Type Definitions** | Manual duplication | Automatic inference |
| **Maintainability** | Update in 3+ places | Update schema once |
| **Code Lines** | More boilerplate | Less boilerplate |

---

## Best Practices

### ✅ DO
- Use `.describe()` to add descriptions to fields
- Use `validateToolArgs()` before executing tools
- Infer types with `z.infer<typeof Schema>`
- Add constraints: `.min()`, `.max()`, `.email()`, etc.

### ❌ DON'T
- Don't manually define types when Zod can infer them
- Don't skip validation - always use `validateToolArgs()`
- Don't catch Zod errors silently - they're helpful!

---

## Future Enhancements

Zod enables many powerful features:

1. **Data Transformation**
   ```typescript
   z.string().transform((val) => val.toUpperCase())
   ```

2. **Custom Validation**
   ```typescript
   z.string().refine((val) => val.startsWith('PKG'), {
     message: 'Package ID must start with PKG'
   })
   ```

3. **Optional Fields**
   ```typescript
   z.object({
     packageid: z.string(),
     priority: z.number().optional()
   })
   ```

4. **Default Values**
   ```typescript
   z.object({
     packageid: z.string(),
     retries: z.number().default(3)
   })
   ```

5. **Unions & Discriminated Unions**
   ```typescript
   z.union([CheckPackageSchema, RedirectPackageSchema])
   ```
