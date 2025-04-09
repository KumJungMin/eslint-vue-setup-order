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
  ],
});
