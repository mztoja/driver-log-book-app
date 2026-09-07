// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // eslint-config-expo 57 podbił eslint-plugin-react-hooks do v6, który dodał
    // reguły (React Compiler) raportujące wzorce obecne w całym repo:
    // synchroniczny setState w useEffect oraz użycie funkcji przed deklaracją
    // w callbackach efektów. Zostawione jako ostrzeżenia do stopniowego czyszczenia.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    // getText() woła useGlobalState(), gdy nie podano `lang` – świadomy skrót
    // stosowany w setkach miejsc; docelowo `lang` powinien być wymagany.
    files: ["utils/getText.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "warn",
    },
  },
]);
