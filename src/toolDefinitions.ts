import { z } from 'zod'
import { Tool } from '@modelcontextprotocol/sdk/types.js'

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

// Convert to OpenRouter/OpenAI format
export function getOpenAIToolDefinitions() {
  return [
    {
      type: 'function' as const,
      function: {
        name: 'check_package',
        description: 'Checks current package status and location',
        parameters: {
          type: 'object' as const,
          properties: {
            packageid: {
              type: 'string' as const,
              description: 'Package ID'
            }
          },
          required: ['packageid']
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'redirect_package',
        description: 'Redirects package using authorization code',
        parameters: {
          type: 'object' as const,
          properties: {
            packageid: {
              type: 'string' as const,
              description: 'Package ID'
            },
            destination: {
              type: 'string' as const,
              description: 'Target destination code'
            },
            code: {
              type: 'string' as const,
              description: 'Authorization code provided by the operator'
            }
          },
          required: ['packageid', 'destination', 'code']
        }
      }
    }
  ]
}

// Convert to MCP format (MCP can use Zod schemas directly)
export function getMCPToolDefinitions(): Tool[] {
  return [
    {
      name: 'check_package',
      description: 'Checks current package status and location',
      inputSchema: {
        type: 'object',
        properties: {
          packageid: {
            type: 'string',
            description: 'Package ID'
          }
        },
        required: ['packageid']
      } as any
    },
    {
      name: 'redirect_package',
      description: 'Redirects package using authorization code',
      inputSchema: {
        type: 'object',
        properties: {
          packageid: {
            type: 'string',
            description: 'Package ID'
          },
          destination: {
            type: 'string',
            description: 'Target destination code'
          },
          code: {
            type: 'string',
            description: 'Authorization code provided by the operator'
          }
        },
        required: ['packageid', 'destination', 'code']
      } as any
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
