import { RuleTester } from "eslint";
import rule from "../lib/rules/declaration-order.js";
import config from "./config.js";
import {ERROR_MESSAGE} from "../lib/constants.js";

const ruleTester = new RuleTester(config);

const validCode = `
<script setup>
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
`;

const invalidCode = `
<script setup>
const hello = "Hello World!";
const changeMsg = () => {};
const emits = defineEmits();
onBeforeMount(() => {
  console.log("onBeforeMount");
});
function handleClick() {
  emits("click");
}
const count = ref(0);
const msg = ref("");
</script>
`;

const ignoreNormalScript = `
<script>
const blah = () => {}
const doNotReorderMe = true;
</script>
<script setup>
const emits = defineEmits();

const hello = "Hello World!";

const changeMsg = () => {};
</script>
`;

const fixedCode = `
<script setup>
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
`;

const customValidCode = `
<script setup>
const props = defineProps();

const hello = "Hello World!";
</script>
`;

const customInvalidCode = `
<script setup>
const hello = "Hello World!";
const props = defineProps();
</script>
`;

const customFixedCode = `
<script setup>
const props = defineProps();

const hello = "Hello World!";
</script>
`;

const customLifecycleValidCode = `
<script setup>
onMounted(() => {
  console.log("onMounted");
});
onBeforeMount(() => {
  console.log("onBeforeMount");
});
</script>
`;

const customLifecycleInvalidCode = `
<script setup>
onBeforeMount(() => {
  console.log("onBeforeMount");
});
onMounted(() => {
  console.log("onMounted");
});
</script>
`;

const customLifecycleFixedCode = `
<script setup>
onMounted(() => {
  console.log("onMounted");
});
onBeforeMount(() => {
  console.log("onBeforeMount");
});
</script>
`;

// A node marked with eslint-vue-setup-order:keep is pinned at its original position.
// When the non-pinned nodes are already correctly ordered around it, the file is valid.
const pinnedValidCode = `
<script setup>
// eslint-vue-setup-order:keep
const count = ref(0);

const emits = defineEmits();

const hello = "Hello World!";
</script>
`;

// The pinned node stays at index 0; the remaining non-pinned nodes (hello, emits) are
// out of section order and must be sorted into the free positions around it.
const pinnedInvalidCode = `
<script setup>
// eslint-vue-setup-order:keep
const count = ref(0);
const hello = "Hello World!";
const emits = defineEmits();
</script>
`;

const pinnedFixedCode = `
<script setup>
// eslint-vue-setup-order:keep
const count = ref(0);

const emits = defineEmits();

const hello = "Hello World!";
</script>
`;

const composableAliasesValidCode = `
<script setup>
const emits = defineEmits();

const count = ref(0);

const store = storeToRefs();
</script>
`;

const composableAliasesInvalidCode = `
<script setup>
const store = storeToRefs();
const count = ref(0);
const emits = defineEmits();
</script>
`;

const composableAliasesFixedCode = `
<script setup>
const emits = defineEmits();

const count = ref(0);

const store = storeToRefs();
</script>
`;

// blank line between marker and declaration → NOT treated as pinned.
const pinnedBlankLineInvalidCode = `
<script setup>
const hello = "Hello World!";
// eslint-vue-setup-order:keep

const count = ref(0);
const emits = defineEmits();
</script>
`;

const pinnedBlankLineFixedCode = `
<script setup>
const emits = defineEmits();

const hello = "Hello World!";

// eslint-vue-setup-order:keep

const count = ref(0);
</script>
`;

// inline trailing comment also pins the declaration it sits on.
const inlinePinnedValidCode = `
<script setup>
const emits = defineEmits();

const count = ref(0); // eslint-vue-setup-order:keep

const hello = "Hello World!";
</script>
`;

const inlinePinnedInvalidCode = `
<script setup>
const hello = "Hello World!";
const count = ref(0); // eslint-vue-setup-order:keep
const emits = defineEmits();
</script>
`;

const inlinePinnedFixedCode = `
<script setup>
const emits = defineEmits();

const count = ref(0); // eslint-vue-setup-order:keep

const hello = "Hello World!";
</script>
`;

// a declaration in the middle of the file is pinnable.
const middlePinnedInvalidCode = `
<script setup>
const hello = "Hello World!";
// eslint-vue-setup-order:keep
const count = ref(0);
const emits = defineEmits();
</script>
`;

const middlePinnedFixedCode = `
<script setup>
const emits = defineEmits();

// eslint-vue-setup-order:keep
const count = ref(0);

const hello = "Hello World!";
</script>
`;

const enumValidCode = `
<script setup>
enum Direction {
  Up,
  Down,
}

const emits = defineEmits();

const hello = "Hello World!";
</script>
`;

const enumInvalidCode = `
<script setup>
const hello = "Hello World!";
enum Direction {
  Up,
  Down,
}
const emits = defineEmits();
</script>
`;

const enumFixedCode = `
<script setup>
enum Direction {
  Up,
  Down,
}

const emits = defineEmits();

const hello = "Hello World!";
</script>
`;

const spaceBetweenItemsValidCode = `
<script setup>
const emits = defineEmits();

const hello = "Hello World!";

const count = ref(0);

const msg = ref("");

const changeMsg = () => {};

function handleClick() {
  emits("click");
}
</script>
`;

const spaceBetweenItemsInvalidCode = `
<script setup>
const hello = "Hello World!";
const changeMsg = () => {};
const emits = defineEmits();
const count = ref(0);
const msg = ref("");
function handleClick() {
  emits("click");
}
</script>
`;

const spaceBetweenItemsFixedCode = `
<script setup>
const emits = defineEmits();

const hello = "Hello World!";

const count = ref(0);

const msg = ref("");

const changeMsg = () => {};

function handleClick() {
  emits("click");
}
</script>
`;

const functionBodySpacingValidCode = `
<script setup>
const emits = defineEmits();

function handleClick() {
  if (true) {

    emits("click");
  }
}
</script>
`;

const functionBodySpacingInvalidCode = `
<script setup>
function handleClick() {
  if (true) {

    emits("click");
  }
}

const emits = defineEmits();
</script>
`;

const functionBodySpacingFixedCode = `
<script setup>
const emits = defineEmits();

function handleClick() {
  if (true) {

    emits("click");
  }
}
</script>
`;

const multilineComposableSpacingValidCode = `
<script setup>
const state = useFeature({
  top: true,

  bottom: false,
});
</script>
`;

ruleTester.run("declaration-order", rule, {
  valid: [
    {
      code: validCode,
    },
    {
      code: ignoreNormalScript,
    },
    {
      code: customValidCode,
      options: [
        {
          sectionOrder: ["defineProps", "plainVars"],
        },
      ],
    },
    {
      code: customLifecycleValidCode,
      options: [
        {
          sectionOrder: ["lifecycle"],
          lifecycleOrder: {
            onMounted: 0,
            onBeforeMount: 1,
          },
        },
      ],
    },
    {
      code: pinnedValidCode,
    },
    {
      code: inlinePinnedValidCode,
    },
    {
      code: composableAliasesValidCode,
      options: [
        {
          composableAliases: ["storeToRefs"],
        },
      ],
    },
    {
      code: spaceBetweenItemsValidCode,
      options: [
        {
          spaceBetweenItems: true,
        },
      ],
    },
    {
      code: functionBodySpacingValidCode,
    },
    {
      code: multilineComposableSpacingValidCode,
    },
    {
      code: enumValidCode,
    },
  ],
  invalid: [
    {
      code: invalidCode,
      output: fixedCode,
      errors: [
        {
          message:
           ERROR_MESSAGE,
        },
      ],
    },
    {
      code: customInvalidCode,
      output: customFixedCode,
      options: [
        {
          sectionOrder: ["defineProps", "plainVars"],
        },
      ],
      errors: [
        {
          message:
           ERROR_MESSAGE,
        },
      ],
    },
    {
      code: customLifecycleInvalidCode,
      output: customLifecycleFixedCode,
      options: [
        {
          sectionOrder: ["lifecycle"],
          lifecycleOrder: {
            onMounted: 0,
            onBeforeMount: 1,
          },
        },
      ],
      errors: [
        {
          message:
           ERROR_MESSAGE,
        },
      ],
    },
    {
      code: pinnedInvalidCode,
      output: pinnedFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: composableAliasesInvalidCode,
      output: composableAliasesFixedCode,
      options: [
        {
          composableAliases: ["storeToRefs"],
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: pinnedBlankLineInvalidCode,
      output: pinnedBlankLineFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: middlePinnedInvalidCode,
      output: middlePinnedFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: inlinePinnedInvalidCode,
      output: inlinePinnedFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: spaceBetweenItemsInvalidCode,
      output: spaceBetweenItemsFixedCode,
      options: [
        {
          spaceBetweenItems: true,
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: functionBodySpacingInvalidCode,
      output: functionBodySpacingFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: enumInvalidCode,
      output: enumFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
  ],
});
