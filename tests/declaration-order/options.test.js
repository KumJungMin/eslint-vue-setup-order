import { ruleTester, rule, ERROR_MESSAGE } from "./shared.js";

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

const spaceBetweenItemsNeverValidCode = `
<script setup>
const count = ref(0);
const msg = ref("");
</script>
`;

const preserveNewlinesBetweenItemsValidCode = `
<script setup>
function first() {
  return 1;
}


function second() {
  return 2;
}
</script>
`;

const preserveNewlinesBetweenItemsInvalidCode = `
<script setup>
const msg = ref("");

const count = ref(0);
const emits = defineEmits();
</script>
`;

const preserveNewlinesBetweenItemsFixedCode = `
<script setup>
const emits = defineEmits();

const msg = ref("");

const count = ref(0);
</script>
`;

ruleTester.run("declaration-order: options", rule, {
  valid: [
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
      code: spaceBetweenItemsValidCode,
      options: [
        {
          spaceBetweenItems: "always",
        },
      ],
    },
    {
      code: spaceBetweenItemsNeverValidCode,
      options: [
        {
          spaceBetweenItems: "never",
        },
      ],
    },
    {
      code: preserveNewlinesBetweenItemsValidCode,
      options: [
        {
          spaceBetweenItems: "preserve",
        },
      ],
    },
  ],
  invalid: [
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
          message: ERROR_MESSAGE,
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
      code: spaceBetweenItemsInvalidCode,
      output: spaceBetweenItemsFixedCode,
      options: [
        {
          spaceBetweenItems: "always",
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: preserveNewlinesBetweenItemsInvalidCode,
      output: preserveNewlinesBetweenItemsFixedCode,
      options: [
        {
          spaceBetweenItems: "preserve",
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
  ],
});
