// Shared by every email (issues and the welcome email). Email apps only handle
// simple HTML, so emails are all tables and inline styles. {{...}} placeholders
// are filled in at send time by fillEmail in server/newsletter.js.
import { FIT_WIDTHS } from "./fitLabel.mjs";

export const ORIGIN = "{{origin}}";
export const C = {
  paper: "#f4f1eb", card: "#ffffff", text: "#1a1a1a", muted: "#555555", faint: "#8a8a8a",
  border: "#e6e3dc", blue: "#008cff", green: "#21954a", red: "#d45252",
};
export const FONT = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

// On phones: bubbles on two lines, links on their own line under a smaller
// logo, and the line breaks that keep bubbles as wide as their text
export const phoneRules = `
  @media (max-width: 480px) { .tag { display: table !important; } .header-cell { display: block !important; text-align: left !important; } .header-links { padding: 10px 0 0 !important; } }
  @media (max-width: 400px) { .logo { font-size: 42px !important; line-height: 32px !important; letter-spacing: -1.5px !important; } .logo-icon { width: 28px !important; height: 28px !important; margin-right: 6px !important; vertical-align: -2.5px !important; } .logo-name { margin-left: 7px !important; font-size: 12px !important; line-height: 13px !important; } }
  ${FIT_WIDTHS.map((w) => `@media (max-width: ${w}px) { .fit-${w} { display: inline !important; } }`).join("\n  ")}`;
