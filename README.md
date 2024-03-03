# CodeSwing 🎢

CodeSwing is an interactive coding playground for VS Code, that allows you to build/explore/learn rich web applications ("swings"). It's like having the magic of a traditional web playground (e.g. CodePen, JSFiddle), but available directly from your highly-personalized editor: themes, keybindings, and extensions...oh my! When you create swings, you can use your favorite web languages (HTML/Pug, CSS/SCSS/Less, JS/TS) and libraries (React, Vue, Angular, etc.) and have a live preview <ins>as you type</ins>, without needing to worry about compiling or bundling anything. It's like a visual REPL for managing runnable code snippets.

<img width="800px" src="https://user-images.githubusercontent.com/116461/103024429-ae37a480-4504-11eb-85ea-37ba9b9a4d9a.gif" />

CodeSwing supports [template galleries](#template-galleries), which allows you to create re-usable swing templates. When you're happy with a swing, you can also [export it to CodePen](#codepen) in order to share it with the world! Finally, since CodeSwing is a VS Code extension, it can integrate with other VS Code extensions, to enable compelling scenarios such as [managing your swings as GitHub Gists](#gistpad), [recording guided walkthroughs of your swings](#codetour), and [collaborating on a swing in real-time](#live-share). If that doesn't sound fun, then I don't know what is!

<!--prettier-ignore-->
> _**What's the meaning of the name "swing"?** As the extension's logo implies, it's referring to a [swing](<https://en.wikipedia.org/wiki/Swing_(seat)>) on playground, to elicit the idea of having fun. That said, if you interpret "swing" as the dance style, that's totally cool too! 💃_

---

[Getting Started](#getting-started)

- [Creating Swings](#creating-swings)
- [Template Galleries](#template-galleries)
- [Swing Tutorials](#swing-tutorials)<br />

Reference

- [Swing Manifest](#swing-manifest)
- [Contributed Commands](#contributed-commands)
- [Configuration Settings](#configuration-settings)
- [Extensibility](#extensibility)
- [Known Limitations](#known-limitations)

## Getting Started

1. Install the CodeSwing extension and then reload VS Code

1. Run the `CodeSwing: New Swing...` command, and select the desired template

1. Edit any of the opened files and see the `CodeSwing` preview update automatically as you type 🚀

1. _(Optional)_ If you'd like to save this sample to a permanent location, run the `CodeSwing: Save Current Swing As...` command and select a directory

From here, you can try [additional languages](#language-support), [change the swing layout](#layout), view [console output](#console-output), and include [external libraries](#external-libraries). We want to make it easy to build/explore web ideas, and so if you have any feedback, please don't hesitate to reach out!

Furthermore, if you'd like to try out a fun sample, clone the [Rock Paper Scissors](https://github.com/codespaces-contrib/rock-paper-scissors) repo, and open it up in VS Code. CodeSwing will detect that it's a swing and automatically layout your editor.

## Creating Swings

After you install the CodeSwing extension, you can create new swings at any time, using the following commands:

- `CodeSwing: New Swing...` - Creates a temporary swing that allows you to quickly try something out (like a visual REPL!). These swings are stored in your system temp directory in a folder called `codeswing`, and are named based on the current date/time.

- `CodeSwing: New Swing from Last Template` - Creates a swing using the last template that you used. This can be useful when you tend to use the same template over and over again.

- `CodeSwing: New Swing in Directory...` - Creates a swing in a local directory, which allows you to re-open it later, and easily share it with others (e.g. store it in a GitHub repo).

After creating a swing, your editor layout will be automatically setup to accomodate the needs of the selected template. Furthermore, if you open a directory that represents a swing, or you run the `CodeSwing: Open Swing...` command, then the selected swing will be automatically launched.

### Language Support

CodeSwing comes with support for all major web languages, and allows you to create new swings without worrying about building or bundling anything. When you create a swing, the templates list provides options for getting started quickly

| Asset Type | Supported Languages    |
| ---------- | ---------------------- |
| Markup     | HTML, Pug, Markdown    |
| Stylesheet | CSS, SCSS/Sass, Less   |
| Script     | JavaScript, TypeScript |

Additionally, if your script file ends in `.jsx` or `.tsx`, you can use JSX syntax. CodeSwing also recognizes a script file that ends in `.babel` and treats it like TypeScript. Finally, if your script file ends in ".mjs", then it will be treated as a [JavaScript module](#modules).

### Components

In addition to the aforementioned languages, CodeSwing also allows you to create component-based swings, using either React, React Native, Vue (single-file components) or Svelte. A component-based swing is unique in that it's a single file that lets you focus on just your component, and have all initialization and rendering logic handled automatically.

#### React

When creating a React component swing, you can define either a function-based or class-based component. You can name the component whatever you'd like, but you need to export it as the default export (e.g. `export default function Foo`). The `react` and `react-dom` libraries will be automatically included, and your exported component will be rendered into the page. If you need to access the React API (e.g. to use a hook), you can access `React` from within your component code. Additionally, if you need to include any other libraries, you can simply [import them](#javascript-modules).

#### Vue

Using a Vue component swing, you can define your template, script and styles within a single-file component. Furthermore, you can add the `lang` attribute to the `template`, `script` or `style` elements, in order to use any of the [supported languages](#language-support).

> Note: VS Code doesn't ship with support for `.vue` files out of the box, so if you want to create Vue swings, it's recommended that you install the [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) extension.

#### Svelte

When creating a Svelte component swing, you can define your template, script and styles within a single `.svelte` component. If you need to access APIs from Svelte itself, simply add an `import` statement from `svelte` and use the API you need (e.g. `import { tweened } from 'svelte/motion')

> Note: VS Code doesn't ship with support for `.svelte` files out of the box, so if you want to create Svelte swings, it's recommended that you install the [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) extension.

### Swing Layout

By default, when you create a swing, it will open in a "Split Left" layout, which vertically stacks the code editors on the left, and allows the preview window to fully occupy the IDE height on the right. However, if you want to change the layout, you can run the `CodeSwing: Change Layout` command and select `Grid`, `Preview`, `Split Bottom`, `Split Left Tabbed`, `Split Right`, `Split Right Tabbed` or `Split Top`.

![Layout](https://user-images.githubusercontent.com/116461/71560396-5152fc80-2a1e-11ea-9cff-a9590e1ea779.gif)

Additionally, if you create a swing, that looks best in a specific layout, you can set the `layout` property in the swing's `codeswing.json` file to either: `grid`, `preview`, `splitBottom`, `splitLeft`, `splitLeftTabbed`, `splitRight`, `splitRightTabbed` or `splitTop`. Then, when you or someone else opens this swing, it will be opened with the specified layout, as opposed to the user's configured default layout.

### Console Output

The swing also provides an output window in order to view any logs written via the `console.log` API. You can bring up the output window, as well as run the swing or open the Chrome Developer Tools, by clicking the respective command icon in the editor toolbar. If you'd like to always open the console when creating/opening swings, you can set the `CodeSwing: Show Console` setting to `true`.

<img width="503" src="https://user-images.githubusercontent.com/116461/71384593-0a38b780-2597-11ea-8bba-73f784f6ec76.png" />

Additionally, if you create a swing that depends on the console, you can set the `showConsole` property in the swing's `codeswing.json` file to `true`. Then, when you or someone else opens this swing, the console will be automatically opened, regardless whether the end-user has configured it to show by default.

### External Libraries

If you need to add any external JavaScript libraries (e.g. `react`) or stylesheets (e.g. `font-awesome`) to your swing, simply click the `Add swing Library` command in the swing "action bar" (or run `CodeSwing: Add Library` from the command palette). This will allow you to search for a library or paste a custom library URL. When you select a library, it will be automatically added to your swing.

![Add Library](https://user-images.githubusercontent.com/116461/71629251-4ed4dc00-2bb1-11ea-9488-78c3d71dbacd.gif)

Behind the scenes, this command updates the swing's manifest file (`codeswing.json`), which you can also open/edit yourself manually if you'd prefer. For more details about the `Script module` option, see [JavaScript modules](#javascript-modules).

### Toolbar

When you create/open a swing, this activates the "swing toolbar", which is a collection of helpful utilities that are displayed in the editor's title bar. The following describes the available actions:

- **Run Swing** - Re-runs the HTML, JavaScript and CSS of your swing. This can be useful when wanting to reset a swing's state and/or if you've disabled the auto-run behavior for swings.
- **Open Console** - Opens the `CodeSwing` console, which allows you to view the output of any `console.log` calls that your swing makes ([details](#console-output)).
- **Change Layout** - Allows you to change the layout configuration of the swing editors ([details](#layout)).
- **Add Library** - Allows you to add an external library to your swing (e.g. React.js, Font-Awesome) ([details](#external-libraries))
- **Open Developer Tools** - Opens the Chrome Dev Tools for your swing preview, which lets you use the DOM explorer, evaluate JavaScript expressions in the console, etc.

<img width="464" src="https://user-images.githubusercontent.com/116461/71629353-eafee300-2bb1-11ea-88f0-0996ab6149c4.png" />

### Workspace swings

If you open a directory in VS Code, and that directory represents a swing, then the swing environment will be automatically launched. If you accidentally close the CodeSwing preview, then you can re-open it by either reloading VS Code, or running the "CodeSwing: Re-Open Workspace Swing" command.

### CodeSwing tree view

When you create or open a swing, a new tree view called "CodeSwing" will appear on the "Explorer" tab (though you can move it to anywhere you want!). It will display the list of files in the active swing, and allow you to edit them.

If you open a swing directory as a workspace, then the "CodeSwing" tree won't appear, since it would be duplicative of the "Explorer" tree itself. Therefore, the "CodeSwing" tree is meant to accommodate temporary swings, swings you open from directories other than the active VS Code workspace, or swings you load from [gists](#gistpad).

### Readme

If you'd like to give your swing an introduction, you can create a file in the swing called `README.md` (or `README.markdown`), and by default, it's contents will be rendered above the swing code in the preview window. When a swing is opened, the `README.md` file isn't opened, which allows the swing to be focused on the core code assets (e.g. `index.html`, `script.js`), and allow the preview window to include embedded documentation.

Your swing can customize how the readme is rendered by setting the `readmeBehavior` property in your `codeswing.json` file to either `previewFooter` (which renders the content beneath the preview content), `inputComment` (which renders the content beneath an [input file](#swing-input)), or `none` (which doesn't render the contents at all).

### JavaScript Modules

By default, swings assume you're using "standard" JavaScript code (`<script type="text/javascript" />`), and allows you to add 3rd-party [libraries](#external-libraries), which are added via new `<script>` elements in the preview page. However, if you'd like to write JavaScript code using `import`/`export`, you can simply perform one of the following steps:

1. Add an `import` statement to your script file
1. Rename your script file to `script.mjs`
1. Set the `scriptType` property to `module` in the swing's `codeswing.json` file

Once you're using modules, we'd recommend you use [Skypack](https://skypack.dev) to load your desired libraries. To make this simpler, you can run the `CodeSwing: Add Library` command, select `Script module` and then specify the module you'd like to add.

<img width="500px" src="https://user-images.githubusercontent.com/116461/103246626-09a8ce80-4919-11eb-9b01-b3a7a02a5634.gif" />

Additionally, you can import CSS and JSON files into a module. When you import a CSS file, CodeSwing will inject the contents of that file into the DOM. When you import a JSON file, the default `export` of the module will be the parsed version of the JSON file.

### Code Links

If you'd like to add a link in your swing/readme, which references a file and/or line/column within a file in the swing, simply add a hyperlink, whose `href` value uses the `swing:` scheme (kind of like a `mailto:`), and specifies the file name you'd like to open (e.g. `swing:index.html`). Optionally, you can specify a line and column number as well (e.g. `swing:index.html@23:5`), which allows you to highlight a specific line/span of code when the end-user clicks on it.

### GistPad

Since swings are effectively runnable code snippets, they're great candidates for being saved as GitHub Gists. If you install the [GistPad](https://aka.ms/gistpad) extension, and sign in with your GitHub identity, then you can run the "GistPad: New CodeSwing" (or "GistPad: New Secret CodeSwing") command, in order to create a swing that is stored in a gist, as opposed to a local directory.

The GistPad extension will recognize gists that are swings, and when you open them, the swing environment will be automatically launched. Furthermore, since GistPad lets you star gists and follow users, you can easily collaborate on swings, using gists as your developer-oriented cloud storage.

### CodeTour

CodeSwing includes integration with [CodeTour](https://aka.ms/codetour), which allows you to author interactive walkthroughs of a codebase. This can be helpful for annotating relevant "markers" within a swing, and encouraging users/yourself where to focus. In order to create a code tour for a swing, simply open the swing, and click the `...` menu in the editor window of any of the swing's document or the preview window. Select `Record CodeTour` and then start adding step annotations to your swing's code. Then, anytime you or someone else opens your swing, the tour will be automatically started.

> For more information on CodeTour, and how to navigate/author tours, refer to the [CodeTour](https://aka.ms/codetour) documentation.

### Live Share

If you'd like to collaborate with someone on a swing (e.g. doing a technical interview or remote tutoring session), then you can install the [Live Share](https://aka.ms/vsls) extension, start a session, and then co-edit your swing in real-time. Note that Live Share support is currently limited to [workspace swings](#workspace-swings). Temporary swings, and swings opened from GistPad (i.e. stored in a gist) aren't currently supported.

<img width="700px" src="https://user-images.githubusercontent.com/116461/103246112-2d6b1500-4917-11eb-98af-cfbda51b1ace.gif" />

### CodePen

Once you've created an awesome swing, you should share it with the world! In order to make this simple, you can export a swing to CodePen using the `CodeSwing: Export to CodePen` command. This will take the currently running swing and create a new pen using the same files, pre-processor settings and libraries.

<img width="500px" src="https://user-images.githubusercontent.com/116461/103309031-cd34ab80-49c8-11eb-9326-7a00577151ff.gif" />

## Template Galleries

When you create a new swing, you'll see a list of templates, which let you create swings using a pre-defined set of files and external libraries (e.g. React.js, Vue). This makes it really easy to get started quickly, and reduce repetitive tasks/boilerplate. By default, CodeSwing includes a standard set of templates, which come from two built-in galleries: `web:languages` and `web:basic`. If you don't intend to use one or both of these, you can disable them by clicking the gear icon when running the `New swing` command, and de-selecting the galleries you don't want. Additionally, you can modify the `CodeSwing: Template Galleries` setting.

Behind the scenes, a template gallery is simply a JSON file, which is hosted somewhere (e.g. a gist, a git repo, your own web server), and defines a set of templates. A template is simply a collection of files (e.g. HTML, JavaScript, CSS, etc.), along with a title and optional description. To see an example of how to define a template gallery, see the built-in [`web:languages` gallery](https://github.com/codespaces-contrib/codeswing/blob/main/templates/languages.json)

When defining the template, you can use the `codeswing.json` file to indicate not only the JavaScript and CSS libraries that the playground needs, but also, the [layout](#layout) it should use by default, and whether or not the console should be automatically opened (e.g. because the swing relies on writing console logs). See [the docs](#swing-metadata) for more details on this file.

### Gist Gallery

In addition to using/creating template galleries, you can also create user-defined templates using GitHub Gists. Simply install the [GistPad](https://aka.ms/gistpad) extension, create a swing by running the "GistPad: New Swing" command, and then add the `"template": true` property in the swing's `codeswing.json` file. Then, when you create a new swing, you'll see your template in the list. This option is good for defining your own templates that you don't intend to share with others.

Additionally, if you star a gist that is marked as a swing template, that will show up in the list of templates as well. That way, you can easily share templates with others, without needing to create a template gallery.

## Swing Tutorials

By default, a swing represents a single interactive sample. However, they can also represent multi-step tutorials/presentations, by making two simple changes:

1. Specifying a tutorial title, by setting the `tutorial` property in the swing's `codeswing.json` file

1. Defining a series of steps as child directories, whose name starts with the step number and includes an optional description (e.g. `1`, `1 - Discussion of text`, `#1 - Intro`). The contents of the directory match that of a standard swing (e.g. an `index.html`, `script.js` file, etc.), and it's encouraged that each step has a [readme](#readme) that includes instructions. The number of steps in the tutorial is determined by the number of child directories in the swing that follow the aforementioned pattern.

When a user opens up a tutorial swing, they'll only see the contents of the current step, and the preview window will include a navigation header that allows moving forward and backwards in the tutorial. Additionally, the user's current step will be persisted so that they can take a tutorial and pick up where they left off when they re-open the tutorial. To try an example, clone the [CSS Diner](https://github.com/codespaces-contrib/css-diner) repo and open it up in VS Code.

### Swing Config

If you need to customize the appearance/behavior of a swing and/or each step within your tutorial, you can create a `config.json` file with your swing to indicate the swing's configuration settings. This file will be automatically loaded/parsed, and exposed to your code via the `widow.config` global variable. This makes it really easy to customize your swing, without needing to write the code to load the step config manually.

### Swing Input

If your swing needs to accept user input (e.g. to allow a user to take a challenge, play a game), then you can set the `input` property of your `codeswing.json` file to an object that includes two properties:

- `fileName` - Indicates the "file name" of the virtual input file that will be created and displayed to the end-user. Note that this is mostly valuable for two reasons: setting the context to the end-user of what input the file expects (e.g. `CSS Selector`), and triggering colorization/language support by setting a file extension.

- `prompt` - Indicates an optional prompt (e.g. `Specify the name of the CSS selector`) that is rendered to the right of the input.

As the user types into the input file, the swing will look for a global function called `checkInput`, and if present, it will call that function, passing it the current value of the input file. This function should return a `boolean` which indicates whether or not the user completed the challenge.

Once completed, a modal dialog will appear, indicating to the user that they finished the challenge, and asking if they want to continue or exit the swing. If you'd like to customize the message that appears upon completion, simply set the `input.completionMessage` property to the desired string.

> Note: If you want to provide additional help information for your input, you can create a `README.md` file in your swing/tutorial and set the `readmeBehavior` property in your `codeswing.json` manifest to `inputComment`. This will render the contents of the readme as an inline code comment, directly beneath the input file.

### Custom Canvas

If your swing requires a custom/interactive experience, but you don't want to place that HTML/JavaScript/CSS code in the `index.html` file (because it would open up for your end-users to see it), you can define a `canvas.html` file in your swing, which will be used as the main markup content for the swing.

For example, you could create a swing with a `canvas.html` file that contains your swing's HTML content, and a `style.css` file that's intended to include user-entered CSS. Because you define the HTML via `canvas.html` instead of `index.html`, then the HTML file wouldn't automatically open up, and therefore, the user could focus entirely on the CSS.

## Swing Manifest

Whenever you create a swing, it includes a `codeswing.json` file, which defines the metadata for the swing, including it's behavior, requirements and intended presentation.

- `scripts` - An array of URLs that indicate the JavaScript libraries which should be added to the swing when run. This property can be managed via the `Add Library` command in the [swing toolbar](#toolbar), and therefore, it isn't necessary to manually edit it. Defaults to `[]`.

- `styles` - An array of URLs that indicate the CSS libraries which should be added to the swing when run. This property can be managed via the `Add Library` command in the [swing toolbar](#toolbar), and therefore, it isn't necessary to manually edit it. Defaults to `[]`.

- `showConsole` - Specifies whether to automatically open the [console](#console-output) when someone opens this swing. Note that this will take precedence over the user's configured console setting, and therefore, is useful when a swing relies on console output, and can ensure the swing is setup correctly without requiring the end-user to explicitly open the console.

- `layout` - Specifies the [layout](#layout) to use when someone opens this swing. Note that this will take precedence over the user's configured default layout, and therefore, is useful when a swing is optimized for a specific layout, and therefore, can ensure the end-user has the best experience by default.

- `scriptType` - Indicates the value of `<script>` element's `type` attribute, when injected into the swing preview page. Can either be `text/javascript` or `module`. Defaults to `text/javascript`.

- `template` - Indicates that this swing is intended to be used as a [template for new swings](#user-templates), and therefore, will appear in the list when creating a new swing. Defaults to `false`.

- `readmeBehavior` - Indicates how the swing's [readme](#readme) (if it has one) will be rendered to the end-user. Defaults to `previewHeader`.

- `tutorial` - Indicates that this swing is intended to be used as a [multi-step tutorial](#tutorials). When set, this property indicates the title of the tutorial.

- `input` - Indicates that this swing requires [user input](#swing-input), and also specifies an optional input file name, prompt message and completion message.

- `themePreview` - Indicates that this swing is better viewed with Visual Studio Code theme applied to the preview. Note that this will take precedence over the user's configured default layout.

## Contributed Commands

When you install CodeSwing, the following commands are available from the command palette:

- `CodeSwing: Initialize Workspace as Swing` - Creates a new swing and stores its files in the root of the active workspace.

- `CodeSwing: New Swing...` - Creates a new temporary code swing, which can be useful for doing quick/ad-hoc explorations.

- `CodeSwing: New Swing in Directory...` - Creates a new code swing, whose files are saved to a specified directory.

- `CodeSwing: New Swing from Last Template` - Creates a new temporary swing using the most recently used template.

- `CodeSwing: Open Swing...` - Opens a swing, based on the contents of a specified directory.

- `CodeSwing: Open Swing in New Windows...` - Opens a swing in a new VS Code window.

- `CodeSwing: Set OpenAI API Key` - Configures the OpenAI API key that is used to support generating AI swings.

Additionally, when you have a swing currently open, the following commands are available:

- `CodeSwing: Add Library` - Allows you to insert a new JavaScript (e.g. React) or CSS (e.g. Tailwind) library into your swing.

- `CodeSwing: Change Layout` - Allows you to select a pre-defined layout for the active swing.

- `CodeSwing: Export to CodePen` - Exports the active swing to a new CodePen.

- `CodeSwing: Open Console` - Opens the `CodeSwing` output window, which lets you view calls to `console.log` in your swing script.

- `CodeSwing: Open Dev Tools` - Launches the Chrome DevTools, connected to the swing preview. This is useful for diagnosing the DOM/JavaScript errors of your swing.

- `CodeSwing: Run Swing` - Re-executes the code of the active swing.

## Configuration Settings

- `Codeswing: Auto Run` - Specifies when to automatically run the code for a swing. Can be set to one of the following values:

  - `onEdit` _(default)_: Will re-run the swing automatically as you type.
  - `onSave`: Will re-run the swing when you save a file.
  - `never`: Don't automatically re-run the swing, and instead, only run it when the `CodeSwing: Run Swing` command is executed.

- `Codeswing: Auto Save` - Specifies whether to automatically save your swing files (every 30s). If you've already set the `Files: Auto Save` setting to `afterDelay`, then that setting will be respected. Defaults to `false`.

- `Codeswing: Clear Console on Run` - Specifies whether to automatically clear the console when the active swing is run.

- `Codeswing: Layout` - Specifies how to layout the editor windows when opening a swing. Can be set to one of the following values:

  - `grid`: Opens a 2x2 grid of editors, with the editors and preview window occupying an equal amount of space.
  - `preview`: Simply opens the full-screen preview window. This is useful for interacting with complex swings or viewing other's swings.
  - `splitBottom`: Opens a split-level layout, with the editors horizontally stacked on the bottom, and the preview occupying the full IDE width on the top.
  - `splitLeft` _(default)_: Opens a split-level layout, with the editors vertically stacked on the left, and the preview occupying the full IDE height on the right.
  - `splitLeftTabbed`: Opens a split-level layout, with the editors grouped into a single tab on the left, and the preview occupying the full IDE height on the right.
  - `splitRight`: Opens a split-level layout, with the editors vertically stacked on the right, and the preview occupying the full IDE height on the left.
  - `splitRightTabbed`: Opens a split-level layout, with the editors grouped into a single tab on the right, and the preview occupying the full IDE height on the right.
  - `splitTop`: Opens a split-level layout, with the editors horizontally stacked on the top, and the preview occupying the full IDE width on the bottom.

- `Codeswing: Launch Behavior` - Specifies how CodeSwing should behave when you open a swing workspace. Can be set to one of the following values:

  - `newSwing`: The end-user will be prompted to create a new swing whenever they open this workspace.
  - `none`: No swings or prompts are automatically displayed.
  - `openSwing` _(default)_: If the current workspace is a swing, it will be automatically opened. Otherwise, you'll be prompted to create a new swing.

- `Codeswing: Readme Behavior` - Specifies how to display the contents of a swing's readme, if it has one. Can be set to one of the following values:

  - `none`: If a swing has a readme, then it won't be displayed automatically when someone opens it.
  - `previewFooter`: If a swing has a readme, then its contents will be rendered as the footer of the preview window.
  - `previewHeader` _(default)_: If a swing has a readme, then its contents will be rendered as the header of the preview window.

- `Codeswing: Root Directory` - Specifies the directory to create swings in within the open workspace. Defaults to `null`.

- `Codeswing: Show Console` - Specifies whether to always show the console when opening a swing. Defaults to `false`.

- `Codeswing: Template Galleries` - Specifies the list of template galleries to use, when displaying the available templates when creating a new swing. Defaults to `["web:basic", "web:languages"]`.

- `Codeswing: Theme Preview` - Specifies whether to apply Visual Studio Code theme to the preview window. Defaults to `false`.

- `Codeswing > AI: Endpoint URL` - Specifies the Azure OpenAI endpoint to use for AI generation. Defaults to `null` _(use OpenAI)_.

- `Codeswing > AI: Model` - Specifies the OpenAI model to use for AI generation. Defaults to `gpt-4-0125-preview`.

## Keybindings

When you install this extension, it contributes the following keybindings while you're actively working on a swing:

- `cmd+shift+b` (macOS/Linux), `ctrl+shift+b` (Windows) - Run the currently active swing. This uses the same keybinding as the `Tasks: Run Build Task` command, in order to enable folks to treat swings like they would with their existing apps.

## Extensibility

In order to allow other extensions to extend the default behavior and/or settings of CodeSwing, the following extensibility points are provided:

### Template Galleries

By default, CodeSwing ships with a set of template galleries, however, extensions can contribute new ones by adding a `codeswing.templateGalleries` contribution to their `package.json` file. This contribution is simply an array of objects with the following properties:

- `id` - A unique ID that will be used to persist the enabled/disabled state of the gallery. Note that the display name of the gallery comes from the gallery definition itself.
- `url` - A URL that points at the actual template gallery. This URL must refer to a JSON file that conforms to the [CodeSwing template gallery schema](https://gist.githubusercontent.com/lostintangent/091c0eec1f6443b526566d1cd3a85294/raw/3c1413b49052a677b1f5d192c5c37d6b2c2b9fae/schema.json).

### Custom Languages

By default, CodeSwing ships with support for a handful of [languages](#additional-language-support) you can use in. However, extensions can introduce support for new languages by adding a `codeswing.languages` contribution to their `package.json` file. This contribution point is simply an array of objects with the following properties:

- `type` - The "type" of language that your extension is supporting. Only `markup` is supported right now.
- `extensions` - An array of file extensions that your extension supports, including the leading period (e.g `.haml`).

When your extension contributes a custom language, CodeSwing expects that your extension returns an API, that includes the following members:

- `codeSwingCompile(extension: string, code: string): string` - Takes in the code and associated file extension (e.g. `.haml`) and returns the compiled version of the code. For example, if your extension contributes support for Haml, then when the end-user opens a swing using a `.haml` file, this method would be passed the raw Haml code, and the `.haml` extension, and you'd need to return the compiled HTML string.

## Known Limitations

- **Playing audio and video** - [VS Code doesn't ship with ffmpeg](https://stackoverflow.com/questions/48321919/show-html5-video-on-previewhtml-command-in-vscode-extension), and therefore, it isn't capable of playing most common audio (e.g. WAV, MP3, MIDI) and video (e.g. MP4) formats ([example](https://gist.github.com/lostintangent/5e286fa15f739b029ae2bedcf323db5e)). As a result, if you try to use an `<audio>`/`<video>` tag and/or, the WebAudio API, you won't be able to decode most media. You can, however, use the web audio API to dynamically create audio ([sample](https://gist.github.com/lostintangent/baf485f08c6e471d7e145e058cb16cd8)).

- **Using Sass @import or @use statements in a non file-based swing**

- **SCSS/Sass, Less, Pug and Vue (web)** HTML/Markdown, CSS, JS/TS, and Svelte/React work
