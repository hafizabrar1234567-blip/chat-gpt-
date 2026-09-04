import { toPng, toBlob } from "html-to-image";

/**
 * Downloads a DOM element as a high-resolution PNG image.
 * Uses html-to-image which renders through the browser's native SVG rendering engine,
 * fully supporting modern Tailwind CSS v4 color formats (oklab, oklch, color-mix, CSS variables).
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  filename: string,
  scale: number = 2.5
): Promise<boolean> {
  if (!element) return false;

  try {
    // 1. First attempt: html-to-image (supports oklab/oklch natively in browser SVG engine)
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: scale,
      cacheBust: true,
      skipAutoScale: false,
    });

    const link = document.createElement("a");
    link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.warn("Primary html-to-image export failed, attempting fallback:", err);

    try {
      // 2. Second attempt: toBlob
      const blob = await toBlob(element, {
        pixelRatio: scale,
        cacheBust: true,
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return true;
      }
    } catch (fallbackErr) {
      console.error("Image export fallback failed:", fallbackErr);
    }

    return false;
  }
}
