# AI Devs MCP Server

This MCP server exposes the AI Devs packages tools for use with Claude Desktop and other MCP clients.

## Tools

### check_package
Check the status of a package by its ID.

**Parameters:**
- `packageid` (string, required): The package ID to check

### redirect_package
Redirect a package to a destination with a code.

**Parameters:**
- `packageid` (string, required): The package ID to redirect
- `destination` (string, required): The destination address for the package
- `code` (string, required): The authorization code for the redirect operation

## Setup

### Prerequisites
- Node.js installed
- `AI_DEVS_API_KEY` environment variable set in `.env` file

### Running the MCP Server

You can run the MCP server using:

```bash
npm run mcp
```

### Claude Desktop Configuration

To use this MCP server with Claude Desktop, add the following to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-devs-packages": {
      "command": "node",
      "args": [
        "/absolute/path/to/ai-devs/node_modules/.bin/tsx",
        "/absolute/path/to/ai-devs/src/mcp-server.ts"
      ],
      "env": {
        "AI_DEVS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `/absolute/path/to/ai-devs` with the actual absolute path to this project directory, and set your API key.

Alternatively, if you have a `.env` file in the project root:

```json
{
  "mcpServers": {
    "ai-devs-packages": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/absolute/path/to/ai-devs"
    }
  }
}
```

### Testing

You can test the MCP server is working by running:

```bash
npm run mcp
```

The server will output: `AI Devs Packages MCP Server running on stdio`

Then you can send MCP protocol messages via stdin to test the tools.

## Usage in Claude Desktop

Once configured, you can use the tools in Claude Desktop by asking Claude to:
- Check a package status: "Can you check the status of package ID 12345?"
- Redirect a package: "Please redirect package 12345 to 'New Location' with code 'ABC123'"

Claude will automatically use the MCP tools to fulfill your requests.
