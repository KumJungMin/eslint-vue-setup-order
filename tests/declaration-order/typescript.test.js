import { ruleTester, rule, ERROR_MESSAGE } from "./shared.js";

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

ruleTester.run("declaration-order: typescript", rule, {
  valid: [
    {
      code: enumValidCode,
    },
  ],
  invalid: [
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
