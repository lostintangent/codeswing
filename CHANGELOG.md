# v0.0.25 (09/07/24)

- Fixed some bugs with the latest version of VS Code

# v0.0.24 (05/14/24)

- Added support for reflecting changes to `window.title` in the title of the CodeSwing preview tab
- Updated the default AI model to `gpt-4o` (which is much cheaper than Turbo)
- Removed the logic that auto-adds `react` and `react-dom` to the `scripts` arrow in your `codeswing.json` file.

# v0.0.23 (03/03/24)

- Introduced the ability to generate and refine swings using an AI prompt (after configuring an OpenAI key)
- Fixed a bug in searching/adding modules to a JavaScript file
- Fixed a bug that prevented exporting swings to CodePen if they included an `&nbsp;` in a file
- Fixed some bugs with importing CSS files, and using React

# v0.0.22 (03/05/22)

- Markup files can now be named `main.*` in addition to `App.*` and `index.*`
- Added experimental support for Go swings, which include a `main.go` file
- Added a new `Go` template gallery, that is disabled by default

# v0.0.21 (09/19/21)

- Introduced a new `CodeSwing: Launch Behavior` setting, that allows customizing how CodeSwing should behave when you open a swing workspace.
- Introduced a new `CodeSwing: Root Directory` setting, that allows specifying the workspace directory that new swings should be created in
- Introduced a new `CodeSwing: Initialize Workspace as Swing` command, that allows you to open a folder and turn it into a swing
- Added support for calling `window.open()` on HTTP(S) URLs
- The swing library selector now properly filters out CommonJS/ESM modules and source maps when adding a JavaScript library
- The preview window is now automatically re-run when you upload a file to the active swing

# v0.0.20 (07/08/21)

- You can now use HTML in `index.md` files, when using Markdown as your markup format
- Swings can now be open even when you don't have a workspace open
- Fixed a bug with using CodeSwing in Safari

# v0.0.19 (07/02/21)

- Fixed formatting of the tutorial navigation header
- Removed the timeout from tutorial step navigation
- Removed the `CodeSwing: Temp Directory` setting

# v0.0.18 (07/01/21)

- You can now `import` `*.json` and `*.css` files from a JavaScript module

# v0.0.17 (07/01/21)

- You can now `import` `*.jsx` and `*.tsx` files from a JavaScript module
- Enabling "run on edit" for all file types
- Introduced the new `CodeSwing: Theme Preview` setting, which allows you to theme the swing preview window, to match your VS Code color theme

# v0.0.16 (03/02/2021)

- Added support for React Native web 🚀
- Markup files/components can now be named `App.<extension>` in addition to `index.<extension>`

# v0.0.15 (02/27/2021)

- Introduced an MRU for templates, so that the last three templates you used show up at the top of the list
- Introduced a new `CodeSwing: New Swing from Last Template` command, that creates a swing from your last used template
- Renamed the `CodeSwing: New Scratch Swing...` command to `CodeSwing: New Swing...`, and `CodeSwing: New Swing..` to `CodeSwing: New Swing in Directory...`
- Introduced a new `CodeSwing: Save Current Swing As...` command, that lets you save the current swing in a specific location
- Added the `CodeSwing: Open Swing in New Window...` command

# v0.0.14 (02/21/2021)

- File extensions can now be renamed and immediately edited (e.g. `.js` -> `.ts`, `.css` -> `.scss`)
- Fixed an issue with explicitly importing `react` from within a React component swing

# v0.0.13 (02/19/2021)

- Supporting NPM imports in import'd files
- Being able to import Svelte/Vue components

# v0.0.12 (02/19/2021)

- You can now use the `@import` and `@use` statements in Sass files (file-based swings only)
- Added the ability to upload local files to a swing
- Your `style.css` and `script.js` files can now be explicitly linked from your `index.html` file, without breaking the run-on-type behavior.

# v0.0.11 (02/16/2021)

- You can now add/rename/delete files from the CodeSwing tree (including files within sub-directories)
- NPM modules can now be `import`'d into React/Svelte/Vue components or script modules
- Added support for using TypeScript and Scss/Sass within Svelte components

# v0.0.10 (02/14/2021)

- Introduced support for React/Svelte/Vue component-based swings

# v0.0.9 (02/12/2021)

- Added a keybinding for running a swing via `cmd+shift+b` (macOS/Linux) and `ctrl+shift+b` (Windows)
- Fixed a bug with creating swings from a user-defined template

# v0.0.8 (01/26/2021)

- Fixed a bug with tutorial navigation
- Optimized the extension to only activate when needed

# v0.0.7 (01/02/2021)

- Added support for the `fetch` API, in addition to the existing support for `XMLHttpRequest`
- Introduced the `CodeSwing: Clear Console on Run` setting (defaults to `true`)

# v0.0.6 (12/30/2020)

- Fixed a couple of bugs that impacted the swing experience on Windows
- The extension is now bundled with Webpack in order to improve peformance and reduce file size

# v0.0.5 (12/28/2020)

- Added initial Live Share support for workspace swings
- Added support for exporting swings to CodePen via the new `CodeSwing: Export to CodePen` command
- Added support for adding JavaScript module imports from Skypack
- Temporary swings were renamed to "scratch swings", and are now stored in the temp directory instead of in-memory, and you can configure the location to write them to

# v0.0.4 (12/19/2020)

- Added the `CodeSwing: Open Workspace Swing` command, for re-opening the current workspace's swing after closing it.

# v0.0.3 (12/18/2020)

- Changed the default value of the `CodeSwing: Readme Behavior` setting to `none`
- Added support for auto-closing the side-bar when the opened workspace is a swing

# v0.0.2 (12/18/2020)

- The panel area is now automatically closed when opening a new swing

# v0.0.1 (12/18/2020)

Initial release 🚀
