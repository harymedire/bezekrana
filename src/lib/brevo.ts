// Thin wrapper around the Brevo (Sendinblue) v3 API. Centralizes the list IDs
// and error handling so callers (signup form, payment webhooks, admin actions)
// don't each have to talk HTTP.
//
// Required env: BREVO_API_KEY  (Brevo → Settings → SMTP & API → API Keys)

const BREVO_BASE = "https://api.brevo.com/v3";

// List IDs from the Brevo dashboard (Brevo → Contacts → Lists). Update here
// if the lists are renumbered — callers only reference these constants.
export const BREVO_LISTS = {
  freeSignup: 29, // "bezekrana" — registered, not paid
  paid: 30,       // "bezekrana paid" — has an active recurring subscription
} as const;

function apiKey(): string | null {
  return process.env.BREVO_API_KEY ?? null;
}

async function brevoFetch(path: string, init: RequestInit) {
  const key = apiKey();
  if (!key) {
    console.warn("[brevo] BREVO_API_KEY missing — skipping", path);
    return { ok: false as const, status: 0 };
  }
  const res = await fetch(`${BREVO_BASE}${path}`, {
    ...init,
    headers: {
      "api-key": key,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[brevo] ${path} failed`, res.status, text);
  }
  return { ok: res.ok, status: res.status };
}

// Upsert a contact and place them on the given list. Idempotent —
// re-running with the same email refreshes attributes and re-adds to list.
export async function addContactToList(input: {
  email: string;
  listId: number;
  firstName?: string;
  lastName?: string;
  locale?: string;
  extraAttributes?: Record<string, string | number | boolean>;
}) {
  const email = input.email.trim().toLowerCase();
  return brevoFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({
      email,
      attributes: {
        FIRSTNAME: input.firstName ?? "",
        LASTNAME: input.lastName ?? "",
        LOCALE: input.locale ?? "bs",
        ...(input.extraAttributes ?? {}),
      },
      listIds: [input.listId],
      updateEnabled: true,
    }),
  });
}

// Remove a contact from a specific list (does NOT delete the contact).
// Brevo's "remove from list" endpoint takes the list id in the URL and
// the emails in the body.
export async function removeContactFromList(input: {
  email: string;
  listId: number;
}) {
  const email = input.email.trim().toLowerCase();
  return brevoFetch(`/contacts/lists/${input.listId}/contacts/remove`, {
    method: "POST",
    body: JSON.stringify({ emails: [email] }),
  });
}

// Convenience: new signup → free list.
export async function subscribeNewUser(input: {
  email: string;
  fullName?: string;
  locale?: string;
}) {
  const [firstName = "", ...rest] = (input.fullName ?? "").trim().split(/\s+/);
  return addContactToList({
    email: input.email,
    listId: BREVO_LISTS.freeSignup,
    firstName,
    lastName: rest.join(" "),
    locale: input.locale,
  });
}

// Convenience: paid event → move from free list to paid list. Both calls
// fire in parallel; failures are logged but not thrown so the calling
// payment flow never breaks because of marketing-list problems.
export async function promoteToPaid(input: {
  email: string;
  fullName?: string;
  locale?: string;
}) {
  const [firstName = "", ...rest] = (input.fullName ?? "").trim().split(/\s+/);
  const email = input.email;
  await Promise.allSettled([
    addContactToList({
      email,
      listId: BREVO_LISTS.paid,
      firstName,
      lastName: rest.join(" "),
      locale: input.locale,
    }),
    removeContactFromList({ email, listId: BREVO_LISTS.freeSignup }),
  ]);
}

// Convenience: revoke paid status (refund, manual unmark) → back to free list.
export async function demoteToFree(input: { email: string; locale?: string }) {
  await Promise.allSettled([
    addContactToList({
      email: input.email,
      listId: BREVO_LISTS.freeSignup,
      locale: input.locale,
    }),
    removeContactFromList({ email: input.email, listId: BREVO_LISTS.paid }),
  ]);
}
