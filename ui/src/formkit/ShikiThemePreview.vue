<script lang="ts" setup>
import { VTabbar } from "@halo-dev/components";
import { useScriptTag } from "@vueuse/core";
import { computed, onUnmounted, ref, watch } from "vue";

type ColorScheme = "light" | "dark";

const demoCode = `/**
 * Halo main class.
 *
 * @author ryanwang
 * @author JohnNiang
 * @author guqing
 * @date 2017-11-14
 */
@EnableScheduling
@SpringBootApplication(scanBasePackages = "run.halo.app", exclude =
    IntegrationAutoConfiguration.class)
@ConfigurationPropertiesScan(basePackages = "run.halo.app.infra.properties")
public class Application {

    public static void main(String[] args) {
        new SpringApplicationBuilder(Application.class)
            .applicationStartup(new BufferingApplicationStartup(1024))
            .run(args);
    }

}`;

const { variant, lightTheme, darkTheme } = defineProps<{
  variant?: string;
  lightTheme?: string;
  darkTheme?: string;
}>();

const { unload } = useScriptTag(
  `/plugins/shiki/assets/static/shiki-code.js?version=${Date.now()}`,
  () => {},
  {
    type: "module",
  },
);

onUnmounted(() => {
  unload();
});

const key = computed(() => {
  return `${variant}-${lightTheme}-${darkTheme}`;
});

const colorSchemes: Array<{ label: string; id: ColorScheme }> = [
  {
    label: "亮色",
    id: "light",
  },
  {
    label: "暗色",
    id: "dark",
  },
];

const activeColorScheme = ref<ColorScheme>("light");

watch(
  () => activeColorScheme.value,
  (value) => {
    document.documentElement.classList.toggle("dark", value === "dark");
  },
);

watch(
  () => lightTheme,
  () => {
    activeColorScheme.value = "light";
  },
);

watch(
  () => darkTheme,
  () => {
    activeColorScheme.value = "dark";
  },
);
</script>

<template>
  <div class="shiki-preview">
    <label class="formkit-label block text-sm font-medium text-gray-700"> 预览 </label>
    <VTabbar :items="colorSchemes" type="pills" v-model:active-id="activeColorScheme"></VTabbar>
    <shiki-code :key="key" :variant="variant" :light-theme="lightTheme" :dark-theme="darkTheme">
      <pre style="display: none">
      <code class="language-java">{{ demoCode }}</code>
    </pre>
    </shiki-code>
  </div>
</template>

<style lang="css" scoped>
.shiki-preview {
  padding-top: 1rem;
}
.shiki-preview label {
  margin-bottom: 1rem;
}
@media (min-width: 640px) {
  .shiki-preview {
    max-width: 42rem;
  }
}
</style>
