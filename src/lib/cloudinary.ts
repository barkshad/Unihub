export const CLOUDINARY_CLOUD_NAME = "ds2mbrzcn";
export const CLOUDINARY_UPLOAD_PRESET = "real_unsigned";

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  format: string;
}

export async function uploadToCloudinary(file: File, folder: string): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload to Cloudinary");
  }

  const data = await response.json();
  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    resource_type: data.resource_type,
    format: data.format,
  };
}
