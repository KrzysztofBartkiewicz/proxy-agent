import { z } from 'zod'
import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Zod schemas for tool parameters
export const CheckPackageSchema = z.object({
  packageid: z.string().describe('Package ID')
})

export const RedirectPackageSchema = z.object({
  packageid: z.string().describe('Package ID'),
  destination: z.string().describe('Target destination code'),
  code: z.string().describe('Authorization code provided by the operator')
})

// Type inference from schemas
export type CheckPackageParams = z.infer<typeof CheckPackageSchema>
export type RedirectPackageParams = z.infer<typeof RedirectPackageSchema>

// Tool specifications
export const toolSpecs = {
  check_package: {
    name: 'check_package',
    description: 'Checks current package status and location',
    schema: CheckPackageSchema
  },
  redirect_package: {
    name: 'redirect_package',
    description: 'Redirects package using authorization code',
    schema: RedirectPackageSchema
  }
} as const

// Helper to convert Zod schema to JSON Schema
function toJsonSchema(schema: any) {
  return zodToJsonSchema(schema, { $refStrategy: 'none' })
}

// Convert to OpenRouter/OpenAI format
export function getOpenAIToolDefinitions() {
  return [
    {
      type: 'function' as const,
      function: {
        name: toolSpecs.check_package.name,
        description: toolSpecs.check_package.description,
        parameters: toJsonSchema(toolSpecs.check_package.schema)
      }
    },
    {
      type: 'function' as const,
      function: {
        name: toolSpecs.redirect_package.name,
        description: toolSpecs.redirect_package.description,
        parameters: toJsonSchema(toolSpecs.redirect_package.schema)
      }
    }
  ]
}

// Convert to MCP format
export function getMCPToolDefinitions(): Tool[] {
  return [
    {
      name: toolSpecs.check_package.name,
      description: toolSpecs.check_package.description,
      inputSchema: toJsonSchema(toolSpecs.check_package.schema) as any
    },
    {
      name: toolSpecs.redirect_package.name,
      description: toolSpecs.redirect_package.description,
      inputSchema: toJsonSchema(toolSpecs.redirect_package.schema) as any
    }
  ]
}

// Validate tool arguments with Zod
export function validateToolArgs(toolName: string, args: unknown) {
  const spec = toolSpecs[toolName as keyof typeof toolSpecs]
  if (!spec) {
    throw new Error(`Unknown tool: ${toolName}`)
  }
  return spec.schema.parse(args)
}
