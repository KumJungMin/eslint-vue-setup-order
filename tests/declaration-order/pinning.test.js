import { ruleTester, rule, ERROR_MESSAGE } from "./shared.js";

const pinnedValidCode = `
<script setup>
// eslint-vue-setup-order:keep
const count = ref(0);

const emits = defineEmits();

const hello = "Hello World!";
</script>
`;

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

ruleTester.run("declaration-order: pinning", rule, {
  valid: [
    {
      code: pinnedValidCode,
    },
    {
      code: inlinePinnedValidCode,
    },
  ],
  invalid: [
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
  ],
});
