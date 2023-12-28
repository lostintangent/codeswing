[![Test status](https://api.travis-ci.org/jsbin/loop-protect.svg?branch=master)](https://travis-ci.org/jsbin/loop-protect)

# loop-protect

JS Bin's loop protection implementation as a reusable library.

This code protects use cases where user code includes an infinite loop using a `while`, `for` or `do` loop.

Note that this does *not* solve the [halting problem](http://en.wikipedia.org/wiki/Halting_problem) but simply rewrites JavaScript (using Babel's AST) wrapping loops with a conditional break. This also *does not* protect against recursive loops.

## Example

With loop protection in place, it means that a user can enter the code as follows on JS Bin, and the final `console.log` will still work.

The code is transformed from this:

```js
while (true) {
  doSomething();
}

console.log('All finished');
```

…to this:

```js
let i = 0;
var _LP = Date.now();
while (true) {
  if (Date.now() - _LP > 100)
    break;

  doSomething();
}

console.log('All finished');
```

## Usage

The loop protection is a babel transform, so can be used on the server or in the client.

The previous implementation used an injected library to handle tracking loops - this version does not.

### Example (client) implementation

```js
import Babel from 'babel-standalone';
import protect from 'loop-protect';

const timeout = 100; // defaults to 100ms
Babel.registerPlugin('loopProtection', protect(timeout));

const transform = source => Babel.transform(source, {
  plugins: ['loopProtection'],
}).code;

// rewrite the user's JavaScript to protect loops
var processed = transform(getUserCode());

// run in an iframe, and expose the loopProtect variable under a new name
var iframe = getNewFrame();

// append the iframe to allow our code to run as soon as .close is called
document.body.appendChild(iframe);

// open the iframe and write the code to it
var win = iframe.contentWindow;
var doc = win.document;
doc.open();

doc.write('<script>' + processed + '<' + '/script>');
doc.close();

// code now runs, and if there's an infinite loop, it's cleanly exited
```

## Contributors

- Author: [Remy Sharp](https://github.com/remy)
- [All contributors](https://github.com/jsbin/loop-protect/graphs/contributors)

## License

MIT / [http://jsbin.mit-license.org](http://jsbin.mit-license.org)
