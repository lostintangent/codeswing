# CodeSwing

### Toolbar

When you open a playground, this activates the "playground toolbar", which is a collection of helpful utilities that are displayed in the editor's title bar. The following describes the available actions:

- **Run Playground** - Re-runs the HTML, JavaScript and CSS of your playground. This can be useful when wanting to reset a playground's state and/or if you've disabled the auto-run behavior for playgrounds.
- **Open Console** - Opens the `GistPad Playground` console, which allows you to view the output of any `console.log` calls that your playground makes ([details](#console-output)).
- **Change Layout** - Allows you to change the layout configuration of the playground editors ([details](#layout)).
- **Add Library** - Allows you to add an external library to your playground (e.g. React.js, Font-Awesome) ([details](#external-libraries))
- **Open Playground Developer Tools** - Opens the Chrome Dev Tools for your playground preview, which lets you use the DOM exlporer, evaluate JavaScript expressions in the console, etc.

<img width="464" src="https://user-images.githubusercontent.com/116461/71629353-eafee300-2bb1-11ea-88f0-0996ab6149c4.png" />

### Uploading Images

You can reference HTTP-based images within any of your playground files, and they'll be downloaded/rendered automatically. However, if you need to add local images to your playground, you can upload them in one of two ways:

1. Right-click the gist in the `Gists` view and select `Upload Files(s)`. This supports any file type, and therefore is the most general-purpose solution. Once the image is uploaded, you can then reference it from your playground using only its filename (e.g. `<img src="myImage.png" />`), since the playground preview understands the context of the "surrounding gist".

2. Copy/paste an image into your clipboard, open up an HTML or Pug file, right-click the editor and select `Paste Image`. This will transparently upload the image to the gist, and then insert a reference to it for you (e.g. adding an `<img />` tag). This solution works best when you want to paste a "transient" image into your playground, such as a captured screenshot, or an image that you copied from a webpage.

### Additional Language Support

By default, new playgrounds create an HTML, CSS and JavaScript file. However, if you're more productive using a different markup, stylesheet or scripting language, then simply rename the respective files to use the right extension, and the code will be automatically compiled for you on the fly! Specifically, GistPad supports the following languages:

- **SCSS/Sass** - Rename the `style.css` file to `style.scss` or `style.sass`. \*Note: While VS Code ships with language support for SCSS out-of-the-box, it doesn't ship support for Sass (the "indentended" syntax). So if you plan to author playgrounds with that syntax, it's recommended that you install [this extension](https://marketplace.visualstudio.com/items?itemName=Syler.sass-indented) along with GistPad.
- **Less** - Rename the `style.css` file to `style.less`
- **Markdown** - Rename the `index.html` file to `index.md`
- **Pug** - Rename the `index.html` file to `index.pug`
- **TypeScript** - Rename the `script.js` file to `script.ts` (or `script.tsx`, in order to use JSX in your code)
- **JSX** - Rename the `script.js` file to `script.jsx` in order to enable JSX to be written in "vanilla" JavaScript files. Additionally, if you add the [`react` library](#external-libraries) to your gist's `playground.json` file, then `*.js` files can also include JSX.

If you'd like to always use one of these languages, then set one or more of the following settings, and all new playgrounds will include the right files by default: `GistPad > Playgrounds: Markup Language`, `GistPad > Playgrounds: Script Language`, `GistPad > Playgrounds: Stylesheet Language`. View the [settings documentation](#configuration-settings) below for more detials.

Additionally, if you want to use other languages (e.g. Haml, AsciiDoc), check out the [GistPad Contrib](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gistpad-contrib) extension, which provides support for even more playground languages.

### External Libraries

If you need to add any external JavaScript libraries (e.g. `react`) or stylesheets (e.g. `font-awesome`) to your playground, simply click the `Add Playground Library` commmand in the playground "action bar" (or run `GistPad: Add Playground Library` from the command palette). This will allow you to search for a library from CDNJS or paste a custom library URL. When you select a library, it will be automatically added to your playground.

![Add Library](https://user-images.githubusercontent.com/116461/71629251-4ed4dc00-2bb1-11ea-9488-78c3d71dbacd.gif)

Behind the scenes, this command update the playground's manifest file (`playground.json`), which you can also open/edit yourself manually if you'd prefer. Additionally, since Gist files provide an internet-accessible URL, you can use Gists as re-usable snippets for playgrounds, and add references to them by right-clicking a gist file in the `Gists` tree, select `Copy GitHub URL`, and then adding it as a library reference to the appropriate playground.

### Layout

By default, when you create a playground, it will open in a "Split Left" layout, which vertically stacks the code editors on the left, and allows the preview window to occupy the fully IDE height on the right. However, if you want to change the layout, you can run the `GistPad: Change Playout Layout` command and select `Grid`, `Preview`, `Split Bottom`, `Split Right`, or `Split Top`.

![Layout](https://user-images.githubusercontent.com/116461/71560396-5152fc80-2a1e-11ea-9cff-a9590e1ea779.gif)

Additionally, if you create a playground, that looks best in a specific layout, you can set the `layout` property in the playground's `playground.json` file to either: `grid`, `preview`, `splitLeft`, `splitLeftTabbed`, `splitRight`, `splitRightTabbed` or `splitTop`. Then, when you or someone else opens this playground, it will be opened with the specified layout, as opposed to the user's configured default layout.

### Console Output

The playground also provides an output window in order to view any logs written via the `console.log` API. You can bring up the output window, as well as run the playground or open the Chrome Developer Tools, by clicking the respective command icon in the editor toolbar. If you'd like to always open the console when creating/opening playgrounds, you can set the `GistPad > Playgrounds: Show Console` setting to `true`.

<img width="503" src="https://user-images.githubusercontent.com/116461/71384593-0a38b780-2597-11ea-8bba-73f784f6ec76.png" />

Additionally, if you create a playground that depends on the console, you can set the `showConsole` property in the playground's `playground.json` file to `true`. Then, when you or someone else opens this playground, the console will be automatically opened, regardless whether the end-user has configured it to show by default.

### Readme

If you'd like to give your playground an introduction, you can create a file in the playground called `README.md` (or `README.markdown`), and by default, it's contents will be rendered above the playground code in the preview window. When a playground is opened, the `README.md` file isn't opened, which allows the playground to be focused on the core code assets (e.g. `index.html`, `script.js`), and allow the preview window to include embedded documentation.

Your playground can customize how the readme is rendered by setting the `readmeBehavior` property in your `playground.json` file to either `previewFooter` (which renders the content beneath the preview content), `inputComment` (which renders the content beneath an [input file](#playground-input)), or `none` (which doesn't render the contents at all).

### Modules

By default, playground's assume you're using "standard" JavaScript code (`<script type="text/javascript" />`), and allows you to add 3rd-party [libraries](#external-libraries), which are added via new `<script>` elements in the preview page. However, if you'd like to write JavaScript code using `import`/`export`, you can set the `scriptType` property to `module` in the playground's `playground.json` file, and then begin to `import` modules. To simplify the process of importing 3rd-party modules, we'd recommend using either [Unkpkg](https://unpkg.com) (adding the [`?module` parameter](https://unpkg.com/#query-params) to any URLs), or the [Pika CDN](https://www.pika.dev/cdn).

### Temporary Playgrounds

If you'd like to create a playground, without persisting it as a gist, you can create a "temporary playground" by selecting the `Don't create gist` button on the playground creation form (as opposed to giving it a description). You'll be able to edit, add, delete, and rename files just like a normal gist, but the changes are only kept in memory, and therefore, represent a great solution for exploring ideas quickly, and then moving on.

<img width="600px" src="https://user-images.githubusercontent.com/116461/74090056-40a19780-4a5c-11ea-896b-dfbb03e7f7d6.png" />

Note that temporary gists don't appear in the main `Gists` explorer tree, and therefore, to manage files within a temporary gist, you need to use the `Active Gist` tree on the `GistPad` tab.

### Gist Links

If you'd like to add a link in your gist/readme, which references a file and/or line/column within a file in the gist, simply add a hyperlink, whose `href` value uses the `gist:` scheme (kind of like a `mailto:`), and specifies the file name you'd like to open (e.g. `gist:index.html`). Optionally, you can specify a line and column number as well (e.g. `gist:index.html@23:5`), which allows you to highlight a specific line/span of code when the end-user clicks on it.

#### Playground Config

If you need to customize the appearance/behavior of a playground and/or each step within your tutorial, you can create a `config.json` file with your playground to indicate the playground's configuration settings. This file will be automatically loaded/parsed, and exposed to your code via the `widow.config` global variable. This makes it really easy to customize your playground, without needing to write the code to load the step config manually.

#### Playground Input

If your playground needs to accept user input (e.g. to allow a user to take a challenge, play a game), then you can set the `input` property of your `playground.json` file to an object that includes two properties:

- `fileName` - Indicates the "file name" of the virtual input file that will be created and displayed to the end-user. Note that this is mostly valuable for two reasons: setting the context to the end-user of what input the file expects (e.g. `CSS Selector`), and triggering colorization/language support by setting a file extension.

- `prompt` - Indicates an optional prompt (e.g. `Specify the name of the CSS selector`) that is rendered to the right of the input.

As the user types into the input file, the playground will look for a global function called `checkInput`, and if present, it will call that function, passing it the current value of the input file. This function should return a `boolean` which indicates whether or not the user completed the challenge.

Once completed, a modal dialog will appear, indicating to the user that they finished the challenge, and asking if they want to continue or exit the playground. If you'd like to customize the message that appears upon completion, simply set the `input.completionMessage` property to the desired string.

> Note: If you want to provide additionally help information for your input, you can create a `README.md` file in your playground/tutorial and set the `readmeBehavior` property in your `playground.json` manifest to `inputComment`. This will render the contents of the readme as a inline code comment, directly beneath the input file.

#### Custom Playground Canvas

If your playground requires a custom/interactive experience, but you don't want to place that HTML/JavaScript/CSS code in the `index.html` file (because it would open up for your end-users to see it), you can define a `canvas.html` file in your playground, which will be used as the main markup content for the playground.

For example, you could create a playground with a `canvas.html` file that contains your playground's HTML content, and a `style.css` file that's intended to include user-entered CSS. Because you define the HTML via `canvas.html` instead of `index.html`, then the HTML file wouldn't automatically open up, and therefore, the user could focus entirely on the CSS.

### Tutorials

By default, a playground represents a single interactive sample. However, they can also represent multi-step tutorials/presentations, by making two simple changes:

1. Specifying a tutorial title, by setting the `tutorial` property in the playground's `playground.json` file

1. Defining a series of steps as gist [directories](#files-and-directories), whose name starts with the step number and includes an optional description (e.g. `1`, `1 - Discussion of text`, `#1 - Intro`). The contents of the directory match that of a standard playground (e.g. an `index.html`, `script.js` file, etc.), and it's encouraged that each step have a [readme](#readme) that includes instructions. The number of steps in the tutorial is determined by the number of directories in the gist that follow the aforementioned pattern.

When a user opens up a tutorial playground, they'll only see the contents of the current step, and the preview window will include a navigation header that allows moving forward and backwards in the tutorial. Additionally, the user's current step will be persisted so that they can take a tutorial and pick up where they left off when they re-open the tutorial. To try an example, view the [Learning MobX Tutorial](https://gist.github.com/lostintangent/c3bcd4bff4a13b2e1b3fc4a26332e2b6).

![MobX](https://user-images.githubusercontent.com/116461/74594741-8d521900-4fee-11ea-97ac-1fdfac132724.gif)

### CodeTour

GistPad includes integration with [CodeTour](https://aka.ms/codetour), which allows you to author interactive walkthroughs of a codebase. This can be helpful for annotating relevant "markers" within a playground, and encouraging users/yourself where to focus. In order to create a code tour for a playground, simply open the playground, and click the `...` menu in the editor window of any of the playground's document or the preview window. Select `Record CodeTour` and then start adding step annotations to your playground's code. Then, anytime you or someone else opens your playground, the tour will be automatically started.

> For more information on CodeTour, and how to navigate/author tours, refer to the [CodeTour](https://aka.ms/codetour) documentation.

### Template Galleries

When you create a new playground, you'll see a list of templates, which let you create playgrounds using a pre-defined set of files and external libraries (e.g. React.js, Vue). This makes it really easy to get started quickly, and reduce repetitive tasks/boilerplate. By default, GistPad includes a standard set of templates, which come from two built-in galleries: `web:languages` and `web:libraries`. If you don't intend to use one or both of these, you can disable them by clicking the gear icon when running the `New Playground` (or `New Secret Playground`) command, and de-selecting the galleries you don't want. Additionally, you can modify the `GistPad > Playgrounds: Template Galleries` setting.

Behind the scenes, a template gallery is simply a JSON file, which is hosted somewhere (e.g. a gist, a git repo, your own web server), and defines a set of templates. A template is simply a gist, which includes the neccessary files (e.g. HTML, JavaScript, CSS, etc.), and then defines a name and description. To see an example of how to define a template gallery, see the built-in [`web:libraries` gallery](https://gist.githubusercontent.com/lostintangent/ece303a6b8c7cbf0293b850b600e3cb6/raw/gallery.json). Additionally, to see an example of a template, see the [React.js template](https://gist.github.com/lostintangent/f15a2e498523f364e36075691542af4c).

When defining the template, you can use the `playground.json` file to indicate not only the JavaScript and CSS libraries that the playgroud needs, but also, the [layout](#layout) it should use by default, and whether or not the console should be automatically opened (e.g. because the playground relies on writing console logs). See [the docs](#playground-metadata) for more details on this file.

### User Templates

In addition to using/creating template galleries, you can also mark your own local playgrounds gists as being templates, by simply setting `"template": true` in the playground's `playground.json` file. Then, when you create a new playground, you'll see your template in the list. This option is good for defining your own templates, that you don't intend to share with others.

Additionally, if you star a gist that is marked as a playground template, that will show up in the list of templates as well. That way, you can easily share templates with others, without needing to create a template gallery.

### Playground Metadata

Whenever you create a playground, it includes a `playground.json` file, which defines the metadata for the playground, including it's behavior, requirements and intended presentation.

- `scripts` - An array of URLs that indicate the JavaScript libraries which should be added to the playground when run. This property can be managed via the `Add Library` command in the [playground toolbar](#toolbar), and therefore, it isn't neccesary to manually edit it. Defaults to `[]`.

- `styles` - An array of URLs that indicate the CSS libraries which should be added to the playground when run. This property can be managed via the `Add Library` command in the [playground toolbar](#toolbar), and therefore, it isn't neccesary to manually edit it. Defaults to `[]`.

- `showConsole` - Specifies whether to automatically open the [console](#console-output) when someone opens this playground. Note that this will take precendence over the user's configure console setting, and therefore, is useful when a playground relies on console output, and can ensure the playground is setup correctly without requiring the end-user to explicitly open the console.

- `layout` - Specifies the [layout](#layout) to use when someone opens this playground. Note that this will take precedence over the user's configured default layout, and therefore, is useful when a playground is optimized for a specific layout, and therefore, can ensure the end-user has the best experience by default.

- `scriptType` - Indicates the value of `<script>` element's `type` attribute, when injected into the playground preview page. Can either be `text/javascript` or `module`. Defaults to `text/javascript`.

- `template` - Indicates that this playground is intended to be used as a [template for new playgrounds](#user-templates), and therefore, will appear in the list when creating a new playground. Defaults to `false`.

- `readmeBehavior` - Indicates how the playground's [readme](#readme) (if it has one) will be rendered to the end-user. Defaults to `previewHeader`.
-
- `tutorial` - Indicates that this playground is intended to be used as a [multi-step tutorial](#tutorials). When set, this property indicates the title of the tutorial.

- `input` - Indicates that this playground requires [user input](#playground-input), and also specifies an optional input file name, prompt message and completion message.

### CodePen

If you export a pen to a [GitHub Gist](https://blog.codepen.io/documentation/features/exporting-pens/#save-as-github-gist-2), and then refresh the `Gists` tree in VS Code, you'll be able to see the pen and then can open/edit it like any other playground. This allows you to easily fork someone's pen and work on it within VS Code.

![CodePen](https://user-images.githubusercontent.com/116461/71393589-171ed080-25c2-11ea-8138-ba075daf7d37.gif)

Additionally, if you develop a playground locally, and want to export it to CodePen (e.g. in order to share it with the community), you can right-click the gist and select `Export to CodePen`. This allows you to develop within VS Code, and then share it when you're done. When a playground is exported to CodePen, it's tagged with `gistpad` so that the community can [see](https://aka.ms/gistpad-codepen) the pens being created with it.

![Export](https://user-images.githubusercontent.com/116461/71533903-39f60100-28b0-11ea-9e16-891a110c7074.gif)

### Blocks

[Bl.ocks](https://bl.ocks.org) is community for sharing interactive code samples/data visualizations, which are based on GitHub Gists. As a result, you can copy the URL for any Block, use it to open a gist within GistPad, and immediately have an interactive environment for viewing/exploring the Block.

Additionally, you can create new blocks with GistPad by adding the optional `Blocks` gallery, and then creating a new playground using one of the block templates. From there you can edit HTML, use the included D3 library, upload data files (e.g. JSON, CSV, TSV) and watch the preview update in real-time. If you'd like to view/share the playground, you can right-click the gist and select `View Gist in Bl.ocks`.

![blocks](https://user-images.githubusercontent.com/116461/73127896-28217f80-3f7c-11ea-99a6-e7ab0be0aabf.gif)
