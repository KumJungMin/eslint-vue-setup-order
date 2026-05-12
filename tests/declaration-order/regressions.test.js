import { ruleTester, rule, ERROR_MESSAGE } from "./shared.js";

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

ruleTester.run("declaration-order: regressions", rule, {
  valid: [
    {
      code: functionBodySpacingValidCode,
    },
    {
      code: multilineComposableSpacingValidCode,
    },
  ],
  invalid: [
    {
      code: functionBodySpacingInvalidCode,
      output: functionBodySpacingFixedCode,
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
  ],
});
