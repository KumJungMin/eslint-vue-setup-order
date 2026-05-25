import { ruleTester, rule, ERROR_MESSAGE } from "./shared.js";

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

const dependencyInjectionInvalidCode = `
<script setup>
provide("count", count);
const count = ref(0);
const service = inject("service");
</script>
`;

const dependencyInjectionFixedCode = `
<script setup>
const service = inject("service");

const count = ref(0);

provide("count", count);
</script>
`;

ruleTester.run("declaration-order: core", rule, {
  valid: [
    {
      code: validCode,
    },
    {
      code: ignoreNormalScript,
    },
  ],
  invalid: [
    {
      code: invalidCode,
      output: fixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: dependencyInjectionInvalidCode,
      output: dependencyInjectionFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
  ],
});
