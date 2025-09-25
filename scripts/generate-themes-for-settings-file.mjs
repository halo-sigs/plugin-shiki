import { readFileSync, writeFileSync } from "node:fs";
import yaml from "js-yaml";
import { bundledThemesInfo } from "shiki/bundle/full";

const settingsFilePath = new URL(
  "../src/main/resources/extensions/settings.yaml",
  import.meta.url,
);

const settingsFileContent = readFileSync(settingsFilePath, "utf8");
const settings = yaml.load(settingsFileContent);

const themeOptions = bundledThemesInfo.map((theme) => {
  return {
    label: `${theme.displayName}（${theme.type}）`,
    value: theme.id,
  };
});

settings.spec?.forms?.forEach((form) => {
  form.formSchema?.forEach((field) => {
    if (
      field.name === "lightTheme" ||
      field.name === "darkTheme" ||
      field.name === "theme"
    ) {
      field.options = themeOptions;
    }
  });
});

const updatedYaml = yaml.dump(settings, {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
  quotingType: '"',
  forceQuotes: false,
  flowLevel: -1,
  sortKeys: false,
});

writeFileSync(settingsFilePath, updatedYaml, "utf8");
