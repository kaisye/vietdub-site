import { google, type sheets_v4 } from "googleapis";
import { sheetsConfig } from "./config";

let sheetsClient: sheets_v4.Sheets | null = null;

// Shared, lazily-created Google Sheets client (used by both lib/sheets.ts for
// orders and lib/settings.ts for editable config).
export function sheetsApi(): sheets_v4.Sheets {
  if (!sheetsClient) {
    const auth = new google.auth.JWT({
      email: sheetsConfig.clientEmail(),
      key: sheetsConfig.privateKey(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

// Create a tab if it does not exist yet (idempotent).
export async function ensureTab(title: string): Promise<void> {
  const api = sheetsApi();
  const spreadsheetId = sheetsConfig.sheetId();
  const meta = await api.spreadsheets.get({ spreadsheetId });
  const hasTab = meta.data.sheets?.some((s) => s.properties?.title === title);
  if (!hasTab) {
    await api.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
  }
}
