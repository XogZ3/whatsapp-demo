interface SupabaseOptions {
  url: string;
  serviceKey: string;
}

export class SupabaseClient {
  private url: string;
  private headers: Record<string, string>;

  constructor(opts: SupabaseOptions) {
    this.url = opts.url;
    this.headers = {
      apikey: opts.serviceKey,
      Authorization: `Bearer ${opts.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
  }

  private async query<T>(
    table: string,
    params: string = "",
    options?: RequestInit
  ): Promise<T> {
    const res = await fetch(
      `${this.url}/rest/v1/${table}${params ? `?${params}` : ""}`,
      { headers: this.headers, ...options }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase error: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getClientByPhone(phone: string) {
    const rows = await this.query<Array<Record<string, unknown>>>(
      "clients",
      `phone=eq.${encodeURIComponent(phone)}&limit=1`
    );
    return rows[0] ?? null;
  }

  async upsertClient(data: {
    phone: string;
    name?: string;
    salon_id: string;
    state_snapshot?: unknown;
    locale?: string;
  }) {
    const rows = await this.query<Array<Record<string, unknown>>>(
      "clients",
      "on_conflict=phone",
      {
        method: "POST",
        headers: {
          ...this.headers,
          Prefer: "return=representation,resolution=merge-duplicates",
        },
        body: JSON.stringify({
          ...data,
          last_interaction: new Date().toISOString(),
        }),
      }
    );
    return rows[0];
  }

  async updateClientState(phone: string, stateSnapshot: unknown) {
    await this.query(
      "clients",
      `phone=eq.${encodeURIComponent(phone)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          state_snapshot: stateSnapshot,
          last_interaction: new Date().toISOString(),
        }),
      }
    );
  }

  async getServices(salonId: string) {
    return this.query<Array<Record<string, unknown>>>(
      "services",
      `salon_id=eq.${salonId}&active=eq.true&order=name.asc`
    );
  }

  async getStylists(salonId: string, serviceId?: string) {
    let params = `salon_id=eq.${salonId}&order=name.asc`;
    if (serviceId) {
      params += `&services=cs.{${serviceId}}`;
    }
    return this.query<Array<Record<string, unknown>>>("stylists", params);
  }

  async getSalon(salonId: string) {
    const rows = await this.query<Array<Record<string, unknown>>>(
      "salons",
      `id=eq.${salonId}&limit=1`
    );
    return rows[0] ?? null;
  }

  async getSalonByWhatsAppNumber(phone: string) {
    const rows = await this.query<Array<Record<string, unknown>>>(
      "salons",
      `whatsapp_number=eq.${encodeURIComponent(phone)}&limit=1`
    );
    return rows[0] ?? null;
  }

  async createBooking(data: {
    salon_id: string;
    client_id: string;
    stylist_id: string;
    service_id: string;
    starts_at: string;
    ends_at: string;
  }) {
    const rows = await this.query<Array<Record<string, unknown>>>("bookings", "", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return rows[0];
  }

  async getActiveBooking(clientId: string) {
    const rows = await this.query<Array<Record<string, unknown>>>(
      "bookings",
      `client_id=eq.${clientId}&status=eq.confirmed&order=starts_at.asc&limit=1`
    );
    return rows[0] ?? null;
  }

  async updateBooking(bookingId: string, data: Record<string, unknown>) {
    await this.query("bookings", `id=eq.${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getPendingReminders48h() {
    const now = new Date();
    const h48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const h47 = new Date(now.getTime() + 47 * 60 * 60 * 1000);
    return this.query<Array<Record<string, unknown>>>(
      "bookings",
      `status=eq.confirmed&reminder_48h_sent=eq.false&starts_at=gte.${h47.toISOString()}&starts_at=lte.${h48.toISOString()}&select=*,clients(*),services(*),salons(*)`
    );
  }

  async getPendingReminders2h() {
    const now = new Date();
    const h2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const h1 = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    return this.query<Array<Record<string, unknown>>>(
      "bookings",
      `status=eq.confirmed&reminder_2h_sent=eq.false&starts_at=gte.${h1.toISOString()}&starts_at=lte.${h2.toISOString()}&select=*,clients(*),services(*),salons(*)`
    );
  }

  async logMessage(data: {
    whatsapp_message_id: string;
    salon_id: string;
    client_id: string;
    direction: "inbound" | "outbound";
    message_type: "text" | "interactive" | "flow" | "template";
    content?: unknown;
  }) {
    await this.query("message_log", "on_conflict=whatsapp_message_id", {
      method: "POST",
      headers: {
        ...this.headers,
        Prefer: "return=minimal,resolution=ignore-duplicates",
      },
      body: JSON.stringify(data),
    });
  }
}
