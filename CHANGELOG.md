# v0.0.9 (02/12/2021)

- Introduced support for React component-based swings
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
