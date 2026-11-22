import { api } from "@/lib/api";

/**
 * Downscales before upload so a 6MB phone photo does not become a 6MB
 * ImgBB request, then returns the hosted URL the server hands back.
 */
export async function uploadImage(file: File, maxEdge = 640): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Images must be 8MB or smaller");
  }

  const dataUri = await shrink(file, maxEdge);
  const result = await api<{ url: string }>("/api/upload", {
    method: "POST",
    body: { image: dataUri },
  });
  return result.url;
}

function shrink(file: File, maxEdge: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That file is not a valid image"));
      image.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not process that image"));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
