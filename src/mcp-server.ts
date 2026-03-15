#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { config } from 'dotenv'
import { check_package, redirect_package } from './packagesApi.js'
import {
  CheckPackageSchema,
  RedirectPackageSchema,
  toolSpecs
} from './toolDefinitions.js'

config()

const server = new McpServer(
  {
    name: 'ai-devs-packages',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

server.registerTool(
  toolSpecs.check_package.name,
  {
    description: toolSpecs.check_package.description,
    inputSchema: CheckPackageSchema
  },
  async ({ packageid }) => {
    const result = await check_package(packageid)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    }
  }
)

server.registerTool(
  toolSpecs.redirect_package.name,
  {
    description: toolSpecs.redirect_package.description,
    inputSchema: RedirectPackageSchema
  },
  async ({ packageid, destination, code }) => {
    const result = await redirect_package(packageid, destination, code)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('AI Devs Packages MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
