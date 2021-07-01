const styles = `
*:focus {
  outline: var(--vscode-focusBorder) solid 1px;
}

::selection {
  background-color: var(--vscode-editor-selectionBackground);
}

body {
  width: auto;
  height: auto;
  background-color: var(--vscode-editor-background, white);
  color: var(--vscode-editor-foreground, revert);
  caret-color: var(--vscode-editorCursor-foreground);
  font-family: var(--vscode-font-family);
  font-weight: var(--vscode-font-weight);
  font-size: var(--vscode-font-size);
}

button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  outline-offset: 2px;
  padding: 4px 8px;
}

button:hover {
  background-color: var(--vscode-button-hoverBackground);
}

a:link {
  color: var(--vscode-textLink-foreground);
}

a:link:active {
  color: var(--vscode-textLink-activeForeground);
}

blockquote {
  background-color: var(--vscode-textBlockQuote-background);
  border-left: solid 2px var(--vscode-textBlockQuote-border);
  padding: 0.1px 1em;
}

hr {
  border-style: solid;
  border-width: 1px 0 0 0;
  border-color: var(--vscode-textSeparator-foreground);
}

pre {
  background-color: var(--vscode-textCodeBlock-background);
}

pre, code {
  font-family: var(--vscode-editor-font-family);
  font-weight: var(--vscode-editor-font-weight);
  font-size: var(--vscode-editor-font-size);
  color: var(--vscode-textPreformat-foreground);
}

pre {
  padding: 4px;
}

details summary {
  outline-offset: 2px;
}

details[open] summary {
  margin-bottom: 2px;
}

fieldset {
  border: solid 1px var(--vscode-textSeparator-foreground);
}

textarea, input, select {
  border: none;
  background-color: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  padding: 4px;
}

textarea::placeholder, input::placeholder {
  color: var(--vscode-input-placeholderForeground);
}

select {
  padding: 2px;
}

textarea:focus, input:focus, select:focus {
  color: var(--vscode-inputOption-activeForeground);
  outline: var(--vscode-focusBorder) solid 1px;
  outline-offset: -1px;
}

textarea:invalid, input:invalid, select:invalid {
  outline: var(--vscode-inputValidation-errorBorder) solid 1px;
  outline-offset: -1px;
}

input[type="checkbox"]:focus, input[type="radio"]:focus,
input[type="checkbox"]:invalid, input[type="radio"]:invalid {
  outline-offset: revert;
}
`

export default styles
