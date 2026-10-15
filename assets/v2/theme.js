import * as Store from "./store.js";
const modes = ["light", "system", "dark"];
const preference = window.matchMedia("(prefers-color-scheme: dark)");
export function applyTheme() {
  const choice = modes.includes(Store.get().settings.theme)
    ? Store.get().settings.theme
    : "system";
  const dark = choice === "dark" || (choice === "system" && preference.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#15241f" : "#f8f7f3");
  document.querySelectorAll("[data-theme-choice]").forEach((select) => {
    select.value = choice;
  });
}
preference.addEventListener("change", applyTheme);
document.addEventListener("change", (event) => {
  if (
    !event.target.matches("[data-theme-choice]") ||
    !modes.includes(event.target.value)
  )
    return;
  Store.get().settings.theme = event.target.value;
  Store.save();
  applyTheme();
  document.dispatchEvent(new CustomEvent("carelab:preference-change"));
});
applyTheme();
