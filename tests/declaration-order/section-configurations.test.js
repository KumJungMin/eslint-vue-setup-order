import { ruleTester, rule, ERROR_MESSAGE } from "./shared.js";

const customSectionConfigurationsInvalidCode = `
<script setup>
const count = ref(0);
const feature = useFeature();
</script>
`;

const customSectionConfigurationsFixedCode = `
<script setup>
const feature = useFeature();

const count = ref(0);
</script>
`;

const customSectionWithoutOrderInvalidCode = `
<script setup>
const feature = useFeature();
const count = ref(0);
</script>
`;

const customSectionWithoutOrderFixedCode = `
<script setup>
const count = ref(0);

const feature = useFeature();
</script>
`;

const customSectionOrderInvalidCode = `
<script setup>
function onClick() {}
function helper() {}
</script>
`;

const customSectionOrderFixedCode = `
<script setup>
function helper() {}

function onClick() {}
</script>
`;

const composableAliasesCombinationInvalidCode = `
<script setup>
const count = ref(0);
const store = storeToRefs();
</script>
`;

const composableAliasesCombinationFixedCode = `
<script setup>
const store = storeToRefs();

const count = ref(0);
</script>
`;

const lifecycleOrderCombinationInvalidCode = `
<script setup>
onMounted(() => {});
onBeforeMount(() => {});
const feature = useFeature();
</script>
`;

const lifecycleOrderCombinationFixedCode = `
<script setup>
const feature = useFeature();

onBeforeMount(() => {});
onMounted(() => {});
</script>
`;

const spaceBetweenItemsCombinationInvalidCode = `
<script setup>
const other = useOther();
const count = ref(0);
const feature = useFeature();
</script>
`;

const spaceBetweenItemsCombinationFixedCode = `
<script setup>
const other = useOther();

const feature = useFeature();

const count = ref(0);
</script>
`;

ruleTester.run("declaration-order: sectionConfigurations", rule, {
  valid: [],
  invalid: [
    {
      code: customSectionConfigurationsInvalidCode,
      output: customSectionConfigurationsFixedCode,
      options: [
        {
          sectionConfigurations: [
            {
              sectionName: "dependencies",
              regex: "\\buse[A-Z]\\w*\\(",
            },
          ],
          sectionOrder: ["dependencies", "reactiveVars"],
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: customSectionWithoutOrderInvalidCode,
      output: customSectionWithoutOrderFixedCode,
      options: [
        {
          sectionConfigurations: [
            {
              sectionName: "dependencies",
              regex: "\\buse[A-Z]\\w*\\(",
            },
          ],
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: customSectionOrderInvalidCode,
      output: customSectionOrderFixedCode,
      options: [
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
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: composableAliasesCombinationInvalidCode,
      output: composableAliasesCombinationFixedCode,
      options: [
        {
          composableAliases: ["storeToRefs"],
          sectionConfigurations: [
            {
              sectionName: "stateStores",
              regex: "\\bstoreToRefs\\(",
            },
          ],
          sectionOrder: ["stateStores", "reactiveVars"],
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: lifecycleOrderCombinationInvalidCode,
      output: lifecycleOrderCombinationFixedCode,
      options: [
        {
          lifecycleOrder: {
            onBeforeMount: 0,
            onMounted: 1,
          },
          sectionConfigurations: [
            {
              sectionName: "dependencies",
              regex: "\\buse[A-Z]\\w*\\(",
            },
          ],
          sectionOrder: ["dependencies", "lifecycle"],
        },
      ],
      errors: [
        {
          message: ERROR_MESSAGE,
        },
      ],
    },
    {
      code: spaceBetweenItemsCombinationInvalidCode,
      output: spaceBetweenItemsCombinationFixedCode,
      options: [
        {
          sectionConfigurations: [
            {
              sectionName: "dependencies",
              regex: "\\buse[A-Z]\\w*\\(",
            },
          ],
          sectionOrder: ["dependencies", "reactiveVars"],
          spaceBetweenItems: true,
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
