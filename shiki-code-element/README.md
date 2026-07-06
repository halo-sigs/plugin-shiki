# @halo-dev/shiki-code-element

[![npm version](https://img.shields.io/npm/v/@halo-dev/shiki-code-element.svg?style=flat-square)](https://www.npmjs.com/package/@halo-dev/shiki-code-element)
[![npm downloads](https://img.shields.io/npm/dm/@halo-dev/shiki-code-element.svg?style=flat-square)](https://www.npmjs.com/package/@halo-dev/shiki-code-element)

A custom web component powered by [Lit](https://lit.dev/) and [Shiki](https://shiki.style/) for beautiful syntax highlighting in your web applications. This component provides an elegant code rendering experience with features like light/dark theme support and different visual variants.

## Features

- 📦 **Web Component**: Easy to integrate into any framework or vanilla JS project
- 🎨 **Theme Support**: Light and dark theme support with 60+ bundled themes
- 🌈 **Syntax Highlighting**: Support for 200+ programming languages
- 💅 **Visual Variants**: Choose between "simple" and "mac" UI styles
- 🔄 **Auto Dark/Light Mode**: Automatically switches between themes based on system preferences
- 🧩 **Customizable**: Set font size and other styling options

## Installation

```bash
# npm
npm install @halo-dev/shiki-code-element @shikijs/transformers shiki

# pnpm
pnpm add @halo-dev/shiki-code-element @shikijs/transformers shiki

# yarn
yarn add @halo-dev/shiki-code-element @shikijs/transformers shiki
```

## Usage

### Basic Usage

```html
<script type="module">
  import '@halo-dev/shiki-code-element';
</script>

<shiki-code>
  <pre><code class="language-javascript">
  const greeting = "Hello, world!";
  console.log(greeting);
  </code></pre>
</shiki-code>
```

### Customizing Themes

```html
<shiki-code 
  light-theme="github-light" 
  dark-theme="github-dark">
  <pre><code class="language-typescript">
  interface User {
    name: string;
    age: number;
  }
  
  const user: User = {
    name: "John",
    age: 30
  };
  </code></pre>
</shiki-code>
```

### Mac Window Style

```html
<shiki-code variant="mac">
  <pre><code class="language-python">
  def greet(name):
      return f"Hello, {name}!"
      
  print(greet("World"))
  </code></pre>
</shiki-code>
```

### Code Highlighting Features

This component integrates with [Shiki Transformers](https://shiki.style/packages/transformers) to provide advanced code highlighting features. The following transformers are supported:

- Line highlighting: `// [!code highlight]`
- Line focus: `// [!code focus]`
- Error/warning annotations: `// [!code error]`, `// [!code warning]`
- Code diff (additions/deletions): `// [!code ++]`, `// [!code --]`
- Code folding: `// [!code fold:start]`, `// [!code fold:end]`
- Tail folding: `// [!code fold:start]` without `fold:end` folds to the end of the code block

Fold notations must be written in comments for the current language. Paired
`fold:start` and `fold:end` markers collapse the lines between them:

```ts
console.log("Visible before folded lines");
// [!code fold:start]
function hidden() {
  return "Folded";
}
// [!code fold:end]
console.log("Visible after folded lines");
```

For tail folding, omit `fold:end` and the component will render a bottom control
to show the remaining lines:

```yaml
services:
  halo:
    image: halohub/halo:2
    # [!code fold:start]
    environment:
      - SPRING_R2DBC_USERNAME=halo
      - SPRING_R2DBC_PASSWORD=openpostgresql
```

For more details on how to use these features, please refer to the [Shiki Transformers documentation](https://shiki.style/packages/transformers).

## API

### Properties

| Property     | Attribute     | Type                | Default         | Description                                       |
|--------------|---------------|---------------------|-----------------|---------------------------------------------------|
| lightTheme   | light-theme   | string              | "github-light"  | Theme to use in light mode                        |
| darkTheme    | dark-theme    | string              | "github-dark"   | Theme to use in dark mode                         |
| variant      | variant       | "simple" \| "mac"   | "simple"        | Visual style variant                              |
| fontSize     | font-size     | string              | "0.875em"       | Font size for the code block                      |

## Browser Support

This component works in all modern browsers that support [Custom Elements v1](https://caniuse.com/custom-elementsv1) and [Shadow DOM v1](https://caniuse.com/shadowdomv1).

## License

[MIT License](https://github.com/halo-sigs/plugin-shiki/blob/main/LICENSE)
