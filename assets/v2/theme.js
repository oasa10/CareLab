import * as Store from "./store.js";
const modes = ["system", "light", "dark"];
const labels = { system: "Sistema", light: "Claro", dark: "Oscuro" };
const paths = {
  system: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  dark: '<path d="M20.9 13.2A9 9 0 0 1 10.8 3.1a9 9 0 1 0 10.1 10.1Z"/>',
};
const preference = window.matchMedia("(prefers-color-scheme: dark)");
const trigger = document.querySelector("#theme-toggle");
const menu = document.querySelector("#theme-menu");
const control = document.querySelector(".theme-control");
const menuItems = () => [...(menu?.querySelectorAll("[data-theme-mode]") || [])];
const currentChoice = () => modes.includes(Store.get().settings.theme)
  ? Store.get().settings.theme : "system";

export function applyTheme() {
  const choice = currentChoice();
  const dark = choice === "dark" || (choice === "system" && preference.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#15241f" : "#f8f7f3");
  document.querySelectorAll("[data-theme-choice]").forEach((select) => {
    select.value = choice;
  });
  if (trigger) {
    trigger.setAttribute("aria-label", `Cambiar aspecto. Actual: ${labels[choice]}`);
    trigger.title = `Aspecto: ${labels[choice]}`;
    trigger.querySelector("svg").innerHTML = paths[choice];
  }
  menuItems().forEach((item) => {
    item.setAttribute("aria-checked", String(item.dataset.themeMode === choice));
  });
}

function closeMenu(restoreFocus = false) {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  trigger?.setAttribute("aria-expanded", "false");
  if (restoreFocus) trigger?.focus();
}
function openMenu() {
  if (!menu || !trigger) return;
  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  menu.querySelector('[aria-checked="true"]')?.focus();
}
function chooseTheme(choice) {
  if (!modes.includes(choice)) return;
  Store.get().settings.theme = choice;
  Store.save();
  applyTheme();
  document.dispatchEvent(new CustomEvent("carelab:preference-change"));
}

trigger?.addEventListener("click", () => {
  if (menu?.hidden) openMenu();
  else closeMenu();
});
trigger?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    openMenu();
  }
});
menu?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-theme-mode]");
  if (!item) return;
  chooseTheme(item.dataset.themeMode);
  closeMenu(true);
});
menu?.addEventListener("keydown", (event) => {
  const items = menuItems();
  const index = items.indexOf(document.activeElement);
  let next;
  if (event.key === "ArrowDown") next = (index + 1) % items.length;
  if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = items.length - 1;
  if (next !== undefined) {
    event.preventDefault();
    items[next]?.focus();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu(true);
  }
  // Let Tab keep its native direction before hiding the focused menu item.
  if (event.key === "Tab") setTimeout(() => closeMenu(), 0);
});
document.addEventListener("pointerdown", (event) => {
  if (!control?.contains(event.target)) closeMenu();
});
document.addEventListener("focusin", (event) => {
  if (!control?.contains(event.target)) closeMenu();
});
window.addEventListener("hashchange", () => closeMenu());
preference.addEventListener("change", applyTheme);
document.addEventListener("change", (event) => {
  if (!event.target.matches("[data-theme-choice]")) return;
  chooseTheme(event.target.value);
});
applyTheme();
