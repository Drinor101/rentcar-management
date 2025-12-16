import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'car-images';

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, carId?: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = carId 
        ? `${carId}-${Date.now()}.${fileExt}`
        : `car-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete image from Supabase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts[urlParts.length - 1].split('?')[0];

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw - it's okay if deletion fails (might be external URL)
    }
  }
};

