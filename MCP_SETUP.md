# MCP Configuration for Context7

We have configured the **Context7 MCP Server** for your workspace.

## Configuration File
The configuration has been added to your Claude Desktop configuration file:
`~/Library/Application Support/Claude/claude_desktop_config.json`

## Setup Steps

1.  **Get your API Key**:
    *   Sign up/login at [Upstash Context7](https://upstash.com/docs/context7).
    *   Get your API Key from the dashboard.

2.  **Update Configuration**:
    *   Open `~/Library/Application Support/Claude/claude_desktop_config.json` in a text editor or VS Code.
    *   Replace `"YOUR_CONTEXT7_API_KEY_HERE"` with your actual API key.

3.  **Restart Claude Desktop**:
    *   Quit Claude Desktop completely.
    *   Reopen it. You should see the `context7` server connected (indicated by a green icon or checkmark in settings).

## Troubleshooting
If the server doesn't connect:
*   Check the path to `npx` (it might need full path if not in PATH).
*   Verify your API Key.
*   Ensure `@upstash/context7-mcp` is installed or accessible via `npx`.

## Other Notes
Since you are working on a `wineOrderApp`, you might also be interested in configuring a **Convex** backend or other tools. Let me know if you need help with that!
