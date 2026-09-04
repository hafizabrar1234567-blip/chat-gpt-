import { ConnectedSocialAccounts } from "../types";

const CONNECTED_ACCOUNTS_KEY = "postly_connected_social_accounts";

export function getSavedConnectedAccounts(): ConnectedSocialAccounts {
  try {
    const raw = localStorage.getItem(CONNECTED_ACCOUNTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading connected accounts:", e);
  }
  return {
    youtube: { connected: false, handle: "@MyChannel" },
    facebook: { connected: false, pageName: "My Page" },
    instagram: { connected: false, username: "@my_profile" },
    whatsapp: { connected: true, phone: "" },
  };
}

export function saveConnectedAccounts(accounts: ConnectedSocialAccounts): void {
  try {
    localStorage.setItem(CONNECTED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Error saving connected accounts:", e);
  }
}

/**
 * Converts a base64 data URL into an actual File object for native sharing
 */
export function dataUrlToFile(dataUrl: string, defaultFilename: string = "post_media"): File | null {
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    let extension = "png";
    if (mime.includes("jpeg") || mime.includes("jpg")) extension = "jpg";
    else if (mime.includes("mp4")) extension = "mp4";
    else if (mime.includes("webm")) extension = "webm";
    else if (mime.includes("quicktime") || mime.includes("mov")) extension = "mov";

    const fileName = `${defaultFilename}.${extension}`;
    return new File([u8arr], fileName, { type: mime });
  } catch (e) {
    console.error("Failed to convert dataURL to File:", e);
    return null;
  }
}

/**
 * Publish via Web Share API with attached File + Formatted Text
 */
export async function shareNativelyWithFile(
  mediaBase64: string | null | undefined,
  title: string,
  fullText: string
): Promise<{ success: boolean; fallbackUsed?: boolean }> {
  if (navigator.share) {
    try {
      let file: File | null = null;
      if (mediaBase64) {
        file = dataUrlToFile(mediaBase64, "postly_content");
      }

      const shareData: ShareData = {
        title: title || "Postly AI Content",
        text: fullText,
      };

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }

      await navigator.share(shareData);
      return { success: true };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return { success: true }; // User dismissed share sheet
      }
      console.warn("Native share error, using clipboard fallback:", err);
    }
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(fullText);
    return { success: true, fallbackUsed: true };
  } catch {
    return { success: false };
  }
}

/**
 * Direct WhatsApp Share
 */
export function openWhatsAppShare(text: string, phone?: string): void {
  const encodedText = encodeURIComponent(text);
  let url = `https://api.whatsapp.com/send?text=${encodedText}`;
  if (phone && phone.trim()) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  window.open(url, "_blank");
}

/**
 * Direct Facebook Share & Composer
 */
export function openFacebookShare(text: string): void {
  // Pre-copy text to clipboard so user can instantly paste into FB composer
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {
    console.error(e);
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const url = isMobile
    ? `https://m.facebook.com/composer/`
    : `https://www.facebook.com/`;
  window.open(url, "_blank");
}

/**
 * Direct YouTube Upload Studio
 */
export function openYouTubeUpload(text: string): void {
  // Pre-copy metadata to clipboard
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {
    console.error(e);
  }

  window.open("https://studio.youtube.com/channel/UC/videos/upload", "_blank");
}

/**
 * Direct Instagram Launch
 */
export function openInstagramShare(text: string): void {
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {
    console.error(e);
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = "instagram://camera";
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank");
    }, 800);
  } else {
    window.open("https://www.instagram.com/", "_blank");
  }
}
