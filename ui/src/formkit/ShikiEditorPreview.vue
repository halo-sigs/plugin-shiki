<script lang="ts" setup>
import { VLoading } from "@halo-dev/components";
import { ref, watchEffect } from "vue";

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

const { theme } = defineProps<{
  theme?: string;
}>();

const html = ref("");

const loading = ref(false);

watchEffect(async () => {
  if (theme) {
    const timer = setTimeout(() => {
      loading.value = true;
    }, 200);
    const { codeToHtml } = await import("shiki/bundle/full");
    const value = await codeToHtml(demoCode, {
      lang: "java",
      theme,
    });
    html.value = value;
    clearTimeout(timer);
    loading.value = false;
  }
});
</script>

<template>
  <div class="shiki-preview">
    <label class="formkit-label block text-sm font-medium text-gray-700"> 预览 </label>
    <div class="shiki-preview-content">
      <VLoading v-if="loading" />
      <main v-else v-html="html"></main>
    </div>
  </div>
</template>

<style lang="css">
.shiki-preview {
  padding-top: 1rem;
}
.shiki-preview label {
  margin-bottom: 1rem;
}
.shiki-preview-content {
  border-radius: 4px;
  border: 1px solid #dee1e6;
  overflow: hidden;
}
.shiki-preview-content main .shiki {
  overflow-x: auto;
  padding: 0.875rem;
  width: 100%;
}
@media (min-width: 640px) {
  .shiki-preview {
    max-width: 42rem;
  }
}
</style>
