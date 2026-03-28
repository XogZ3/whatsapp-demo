import type { Env } from "../types";
import { sandboxScrapedContent } from "./security";
import { SCRAPE_CONTENT_MAX_CHARS } from "../config/constants";

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      ogTitle?: string;
    };
  };
  error?: string;
}

export interface ScrapeResult {
  success: boolean;
  content: string;
  title: string;
  error?: string;
}

/**
 * Scrape a URL using Firecrawl /v2/scrape API.
 * Returns sandboxed markdown content ready for Claude context injection.
 */
export async function scrapeWebsite(
  env: Env,
  url: string,
): Promise<ScrapeResult> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
      }),
    });

    if (res.status === 402) {
      return {
        success: false,
        content: "",
        title: "",
        error: "Firecrawl credits exhausted. Tell me about your business instead!",
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("Firecrawl error:", res.status, errText);
      return {
        success: false,
        content: "",
        title: "",
        error: "Couldn't scrape that website. Tell me about your business instead?",
      };
    }

    const data = (await res.json()) as FirecrawlResponse;

    if (!data.success || !data.data?.markdown) {
      return {
        success: false,
        content: "",
        title: "",
        error: "The website didn't return usable content. Can you describe your business?",
      };
    }

    const rawContent = data.data.markdown;
    // Truncate to prevent context stuffing
    const truncated =
      rawContent.length > SCRAPE_CONTENT_MAX_CHARS
        ? rawContent.slice(0, SCRAPE_CONTENT_MAX_CHARS) + "\n\n[Content truncated]"
        : rawContent;

    // Layer 5: Sandbox the scraped content
    const sandboxed = sandboxScrapedContent(truncated, url);

    const title =
      data.data.metadata?.title ??
      data.data.metadata?.ogTitle ??
      new URL(url).hostname;

    return {
      success: true,
      content: sandboxed,
      title,
    };
  } catch (err) {
    console.error("Scrape failed:", err);
    return {
      success: false,
      content: "",
      title: "",
      error: "Something went wrong scraping that URL. Can you describe your business instead?",
    };
  }
}
