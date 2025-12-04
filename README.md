# CLIPS Tree-sitter Parser for VS Code

This repository provides a **Tree-sitter grammar and parser for CLIPS** for use in **Neovim** or **VS Code** with the [tree-sitter-vscode](https://marketplace.visualstudio.com/items?itemName=AlecGhost.tree-sitter-vscode) extension.

It enables **syntax highlighting** and semantic token highlighting for `.clp` files using the power of Tree-sitter.

## Usage

### Option 1: Use with VS Code

1. Install the [Tree-sitter VS Code extension](https://marketplace.visualstudio.com/items?itemName=AlecGhost.tree-sitter-vscode).

2. Add the following to your **VS Code `settings.json`** (adjust paths to point to this repository, needs to be an absolute path).
The settings can be opened via `<ctrl>+<shift>+p > Preferences: Open User Settings (JSON)`.

```json
"tree-sitter-vscode.languageConfigs": [
  {
    "lang": "clips",
    "parser": "<path-to-this-repo>/tree-sitter-CLIPS/tree-sitter-clips.wasm",
    "highlights": "<path-to-this-repo>/tree-sitter-CLIPS/queries/highlights.scm",
    "semanticTokenTypeMappings": {
      "constant": {
        "targetTokenModifiers": ["declaration", "readonly"],
        "targetTokenType": "variable"
      },
      "module": {
        "targetTokenType": "namespace"
      }
    }
  }
],
```

3. Make sure .clp files are recognized as the clips language:

You can hack an existing VS Code extension’s `package.json` (located at `~/.vscode/extensions`) and add the following snippet to the `contributes` section:

```json
"languages": [
  {
    "id": "clips",
    "extensions": [".clp"]
  }
],
```

Make sure vs code is loaded again via `<ctrl>+<shift>+p > Developer: Reload Window`.

Open a .clp file. Syntax highlighting should now work.
