
# vue3-script-setup-custom-rules
- This package contains custom rules to enforce the order of declarations within `<script setup>` in Vue 3.

<br/>

## 🛠 Concept

### 📌 Order
The declarations in `<script setup>` are sorted in the following fixed order:
```
"type",
"defineProps",
"defineEmits",
"defineSlots",
"defineModel",
"defineOptions",
"class",
"plainVars",
"reactiveVars",
"composables",
"computed",
"watchers",
"lifecycle",
"unknowns",
"functions",
"defineExpose"
```

<br/>

### 📌 Separation Between Groups
A single blank line (which corresponds to two consecutive newline characters) is inserted between different groups.<br/> 
This means that if you have a group of define declarations followed by another group (such as "plainVars"),<br/> 
there will be one blank line between these groups in the final sorted output.<br/> 

Example: Consider the following two groups:<br/> 
_Group 1 (defineProps):_
```js
const aa = defineProps<{ msg: string }>();
```

<br/>

_Group 2 (plain variable declarations):_
```js
const hello = "Hello World!";
const count = 0
```

<br/>

The final sorted output will be:
```js
const aa = defineProps<{ msg: string }>();

const hello = "Hello World!";
const count = 0
```
<br/>

Notice the blank line between the two groups, which helps visually separate different types of declarations.

<br/>


<br/>

## 🛠 Section Order Customization
By default, the rule enforces the predefined order of declarations within `<script setup>`. <br/>
However, you can customize the declaration order by specifying the `sectionOrder` option in `eslint.config.js`.

### 📌 Default Order
By default, the rule follows this order:

```js
"type",
"defineProps",
"defineEmits",
"defineSlots",
"defineModel",
"defineOptions",
"class",
"plainVars",
"reactiveVars",
"composables",
"computed",
"watchers",
"lifecycle",
"unknowns",
"functions",
"defineExpose"
```

<br/>

### 📌 Customizing the Order
If you want to specify a custom order, you can do so in eslint.config.js by providing a sectionOrder array.<br/>

Example: Prioritizing defineProps and plainVars

```js
// eslint.config.js
export default [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "vue3-script-setup": {
        rules: {
          "declaration-order": eslintVueSetupOrderRule,
        },
      },
    },
    rules: {
      "vue3-script-setup/declaration-order": [
        "error",
        {
          sectionOrder: ["defineProps", "plainVars"], // this!!
        },
      ],
    },
  },
];
```


In this case:
- defineProps will always be placed before plainVars.
- Other declarations will follow their default order.

<br/>


### 📌 Invalid Section Order Handling
If an invalid section is provided in sectionOrder, an ESLint error will be thrown.

For example, this incorrect configuration:

```js
"vue3-script-setup/declaration-order": [
  "error",
  {
    sectionOrder: ["defineProps", "invalidSection"],
  },
],
```
will result in the following error:
```
Error: Invalid "sectionOrder" option: "invalidSection" is not a recognized section. Valid sections: defineProps, defineEmits, defineOthers, plainVars, reactiveVars, composables, computed, watchers, lifecycle, functions, unknowns.
This ensures that only valid sections are allowed, preventing misconfiguration.
```
With this customization, you can fine-tune the declaration order to suit your project’s coding style while still enforcing consistency. 🚀


<br/><br/>

## 🛠 lifecycle Order Customization
By default, the rule enforces the predefined order of declarations within `<script setup>`. <br/>
However, you can customize the declaration order by specifying the `lifecycleOrder` option in `eslint.config.js`.

### 📌 Default Order
By default, the rule follows this order:

```js
onBeforeMount: 0,
onMounted: 1,
onBeforeUpdate: 2,
onUpdated: 3,
onBeforeUnmount: 4,
onUnmounted: 5,
onErrorCaptured: 6,
onRenderTracked: 7,
onRenderTriggered: 8,
onActivated: 9,
onDeactivated: 10,
onServerPrefetch: 11,
```

<br/>

### 📌 Customizing the Order
If you want to specify a custom order, you can do so in eslint.config.js by providing a lifecycleOrder object.<br/>

Example: Prioritizing defineProps and plainVars

```js
// eslint.config.js
export default [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "vue3-script-setup": {
        rules: {
          "declaration-order": eslintVueSetupOrderRule,
        },
      },
    },
    rules: {
      "vue3-script-setup/declaration-order": [
        "error",
        {
          lifecycleOrder: { // this!!
            onMounted: 0,
            onBeforeMount: 1,
          }
        },
      ],
    },
  },
];
```


In this case:
- onMounted will always be placed before onBeforeMount.


<br/>

## 🛠 Pinning a Declaration in Place

You can prevent the rule from moving a specific declaration by adding a `// eslint-vue-setup-order:keep` comment **directly before** or **inline at the end of** the declaration line.

### 📌 How It Works
When the rule encounters a node with this marker it is treated as **pinned**: it stays at its original position in the source, and the remaining (non-pinned) declarations are sorted into the free slots around it.

The comment must be **directly adjacent** to the declaration (no blank lines in between). If there is a blank line between the comment and the declaration, the comment will not pin the declaration.

### 📌 Examples

#### Leading comment (on the line before):
```vue
<script setup>
// eslint-vue-setup-order:keep
const count = ref(0);

const emits = defineEmits();

const hello = "Hello World!";
</script>
```

#### Inline comment (at the end of the line):
```vue
<script setup>
const emits = defineEmits();

const count = ref(0); // eslint-vue-setup-order:keep

const hello = "Hello World!";
</script>
```

#### Pinned in the middle:
```vue
<script setup>
const hello = "Hello World!";
// eslint-vue-setup-order:keep
const count = ref(0);
const emits = defineEmits();
</script>
```

In all these examples, `count` (a `reactiveVars` declaration) stays in its original position while the other declarations are sorted into the remaining free slots around it.

> **Note:** The `// eslint-vue-setup-order:keep` comment must be **directly adjacent** to the declaration it pins (either on the line immediately before or at the end of the same line). A blank line between the comment and the declaration breaks the adjacency and prevents pinning. The comment itself is preserved as-is when the rule applies its auto-fix.

## 🛠 composableAliases Option
By default, the rule treats function calls whose names start with `use` as composables. <br/>
However, some utilities such as `storeToRefs` or `mapState` are composable in nature even though they do not follow the `use*` naming convention. <br/>
You can classify those functions as composables by using the `composableAliases` option in `eslint.config.js`.

### 📌 How It Works
If a function name is included in `composableAliases`, declarations initialized from that call will be sorted in the `composables` section.

Example:
```js
const store = storeToRefs();
const state = mapState();
```

With the following configuration, both declarations above are treated as `composables`.

### 📌 Configuration Example
```js
// eslint.config.js
export default [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "vue3-script-setup": {
        rules: {
          "declaration-order": eslintVueSetupOrderRule,
        },
      },
    },
    rules: {
      "vue3-script-setup/declaration-order": [
        "error",
        {
          composableAliases: ["storeToRefs", "mapState"], // this!!
        },
      ],
    },
  },
];
```

### 📌 Result
In this case:
- `storeToRefs` will be treated as a composable.
- `mapState` will be treated as a composable.
- They will be sorted in the `composables` section even though their names do not start with `use`.

<br/>

## 🛠 sectionConfigurations Option
You can define custom section matching rules with the `sectionConfigurations` option.
Each configuration is tested in the order it appears, before the built-in section detection runs.

### 📌 How It Works
Each configuration requires:
- `sectionName`: the section assigned when the regex matches.
- `regex`: a string pattern tested against the full declaration text.
- `flags`: optional regular expression flags.

The order of `sectionConfigurations` controls only matching precedence.
It does **not** override `sectionOrder`.
If you want a custom section to appear in a specific position, add that section name to `sectionOrder`.
If the section is not present in `sectionOrder`, it is placed after configured sections.

### 📌 Configuration Example
```js
// eslint.config.js
export default [
  {
    files: ["**/*.vue"],
    rules: {
      "vue3-script-setup/declaration-order": [
        "error",
        {
          sectionConfigurations: [
            {
              sectionName: "eventHandlers",
              regex: "^function on",
            },
            {
              sectionName: "functions",
              regex: "^function ",
            },
          ],
          sectionOrder: ["functions", "eventHandlers"],
        },
      ],
    },
  },
];
```

### 📌 Result
In this case:
- `function onClick() {}` is treated as `eventHandlers`.
- Other function declarations are treated as `functions`.
- `functions` still appear before `eventHandlers` because `sectionOrder` controls output order.

<br/>

## 🛠 spaceBetweenItems Option
By default, declarations within the same section are placed consecutively with no blank line between them. <br/>
You can enable the `spaceBetweenItems` option to insert a blank line between every declaration inside a section, improving readability.

### 📌 How It Works
When `spaceBetweenItems` is set to `true`, each individual declaration within a section is separated by a blank line.
Blank lines between different sections are always present regardless of this option.

### 📌 Configuration Example
```js
// eslint.config.js
export default [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "vue3-script-setup": {
        rules: {
          "declaration-order": eslintVueSetupOrderRule,
        },
      },
    },
    rules: {
      "vue3-script-setup/declaration-order": [
        "error",
        {
          spaceBetweenItems: true, // <= like this
        },
      ],
    },
  },
];
```

### 📌 Result

Without `spaceBetweenItems` (default):
```js
const count = ref(0);
const msg = ref("");
```

With `spaceBetweenItems: true`:
```js
const count = ref(0);

const msg = ref("");
```

<br/>

## 🛠 How to Apply
### 📌 Method 1: Install via npm
```
pnpm install eslint-vue-setup-rules

OR

yarn add eslint-vue-setup-rules

OR 

pnpm install https://github.com/KumJungMin/eslint-vue-setup-order
```

<br/>

Then, add the ESLint plugin to your `eslint.config.js` (for ESLint v9 using the flat config pattern):
```js
// eslint.config.js
import vueSetupRules from "eslint-vue-setup-rules";

export default [
  {
    // Add the plugin object here:
    plugins: { "vue3-script-setup": vueSetupRules },
    rules: { "vue3-script-setup/declaration-order": "error" },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
  },
  // ... other settings
];
```

<br/>

### 📌 Method 2: Include the Rules File in Your Project
Alternatively, you can add the rule file directly to your project:

1. Add the file `rules/declaration-order.js` to your project directory:
```js
your-project/
├── src/
│   └── eslint-rules/
│       └── declaration-order.js
├── eslint.config.js
└── ...
```

2. Then, update your `eslint.config.js` to include the custom rule:
```js
import eslintVueSetupOrderRule from "./src/eslint-rules/declaration-order.js";
 
export default [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "vue3-script-setup": {
        rules: {
          "declaration-order": eslintVueSetupOrderRule, // this!
        },
      },
    },
    rules: {
      "vue3-script-setup/declaration-order": "error",
    },
  },
  // ... other settings
];
```

<br/>

## 🛠 Testing
When you run the command:
```
npx eslint .
```

<br/>

If the declaration order is incorrect, the rule will automatically fix it. For example:<br/>
**Before:**
```js
<script setup lang="ts">
import { onBeforeMount, ref } from "vue";

const count = ref(0);
const msg = ref("");
const aa = defineProps<{ msg: string }>();
const emits = defineEmits();
const hello = "Hello World!";

const changeMsg = () => {};
function handleClick() {
  emits("click");
}

onBeforeMount(() => {
  console.log("onBeforeMount");
});
</script>

<template>
</template>
```

<br/>

**After (fixed):**
```js
<script setup lang="ts">
import { onBeforeMount, ref } from "vue";

const aa = defineProps<{ msg: string }>();
const emits = defineEmits();

const hello = "Hello World!";

const count = ref(0);
const msg = ref("");

onBeforeMount(() => {
  console.log("onBeforeMount");
});

const changeMsg = () => {};
function handleClick() {
  emits("click");
}
</script>
```
