// Runtime dark <-> light swap for inline-styled pages.
const PAIRS = [
  // ambient glow — must stay almost invisible on white
  ["rgba(56,140,48,0.42)", "rgba(124,240,107,0.30)"],
  ["rgba(56,140,48,0.38)", "rgba(124,240,107,0.26)"],
  ["rgba(56,140,48,", "rgba(124,240,107,"],
  ["rgba(247,247,235,", "rgba(11,51,42,"],
  ["rgba(124,240,107,", "rgba(124,240,107,"],
  ["rgba(4,22,19,", "rgba(255,255,255,"],
  ["#072A24", "#FFFFFF"],
  ["#052220", "#F4F6F2"],
  ["#08211E", "#F7F8F5"],
  ["#0B352E", "#F7F8F5"],
  ["#0C2A25", "#FBFBF9"],
  ["#104036", "#F1F4EF"],
  ["#0A2E28", "#F2F4F0"],
  ["#F7F7EB", "#0B332A"],
  ["#D8DCCE", "#1E4A3E"],
  ["#AFB8AC", "#3A6154"],
  ["#9AA79F", "#4A6E62"],
  ["#8CA39C", "#517367"],
  ["#95AAA3", "#5A7A6E"],
  ["#7D8B85", "#5F8175"],
  ["#66807A", "#6E8C81"],
  ["#98A39C", "#517367"],
  ["background: #7CF06B", "background: __FILL__"],
  ["background:#7CF06B", "background:__FILL__"],
  ["background: rgb(124,240,107)", "background: __FILL__"],
  ["box-shadow: 0 0 18px rgba(124,240,107", "box-shadow: 0 0 18px rgba(__GLOW__"],
  ["#7CF06B", "#163300"],
  ["#04231D", "#04231D"],
  ["#A8FA9C", "#0D2400"],
];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return "rgb(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + ")";
}

// React normalizes inline styles to spaced rgb()/rgba() — compact them so the
// literal map matches, and match rgb() equivalents of every hex in the palette.
const RGB_PAIRS = PAIRS.filter(([d]) => d.startsWith("#")).map(([d, l]) => [hexToRgb(d), hexToRgb(l)]);

function compact(css) {
  return css.replace(/rgba?\([^)]*\)/g, (m) => m.replace(/\s+/g, ""));
}

function toLight(css) {
  let out = compact(css);
  for (const [dark, light] of PAIRS.concat(RGB_PAIRS)) out = out.split(dark).join(light);
  // sentinels keep the ONE lime green on fills/glows while accent text goes forest
  return out.split("__FILL__").join("#7CF06B").split("__GLOW__").join("124,240,107");
}

let overrideEl = null;

function setOverrides(light) {
  if (!overrideEl) {
    overrideEl = document.createElement("style");
    overrideEl.id = "theme-swap-overrides";
    document.head.appendChild(overrideEl);
  }
  overrideEl.textContent = light
    ? `html, body { background: #FFFFFF !important; color: #0B332A !important; }
       a { color: #163300; }
       a:hover { color: #0D2400; }
       ::selection { background: #7CF06B; color: #163300; }
       img:hover { box-shadow: 0 20px 50px -28px rgba(11,51,42,0.30) !important; }`
    : "";
}

export function applyTheme(theme) {
  const light = theme === "light";
  const nodes = document.querySelectorAll("[style]");
  nodes.forEach((el) => {
    if (el.__origStyle === undefined) el.__origStyle = compact(el.getAttribute("style") || "");
    const next = light ? toLight(el.__origStyle) : el.__origStyle;
    if (el.getAttribute("style") !== next) el.setAttribute("style", next);
  });
  setOverrides(light);
  document.documentElement.setAttribute("data-theme", theme);
}

export function readTheme(key) {
  try {
    return localStorage.getItem(key) === "light" ? "light" : "dark";
  } catch (e) {
    return "dark";
  }
}

export function saveTheme(key, theme) {
  try {
    localStorage.setItem(key, theme);
  } catch (e) {}
}
