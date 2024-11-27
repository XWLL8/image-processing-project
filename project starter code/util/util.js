import fs from "fs";
import Jimp from "jimp";
import path from "path";
import os from "os";
import fetch from "node-fetch";

/**
 * Filters an image from a given URL and saves it locally.
 * @param {string} inputURL - URL of the image to filter
 * @returns {Promise<string>} - Path to the filtered image file
 */
export async function filterImageFromURL(inputURL) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Attempting to fetch image from URL: ${inputURL}`);
      const response = await fetch(inputURL);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Use arrayBuffer instead of buffer to avoid deprecation warning
      const arrayBuffer = await response.arrayBuffer(); 
      const buffer = Buffer.from(arrayBuffer); // Convert arrayBuffer to buffer

      console.log("Image fetched successfully. Processing with Jimp...");

      const photo = await Jimp.read(buffer); // Pass buffer to Jimp
      const outpath = path.join(
        os.tmpdir(),
        `filtered.${Math.floor(Math.random() * 2000)}.jpg`
      );
      
      // Log the outpath to ensure it's valid
      console.log(`Filtered image will be saved to: ${outpath}`);

      // Check if the image is being saved correctly
      const saveSuccess = await photo.resize(256, 256).quality(60).greyscale().writeAsync(outpath);

      // Check if the file is actually created
      if (!fs.existsSync(outpath)) {
        console.error(`Failed to save file at path: ${outpath}`);
        reject(new Error('Filtered image was not saved.'));
      }

      console.log(`Filtered image saved to: ${outpath}`);
      resolve(outpath);
    } catch (error) {
      console.error("Error in filterImageFromURL:", error);
      reject(error);
    }
  });
}

/**
 * Deletes files from the local filesystem.
 * @param {string[]} files - Array of file paths to delete
 */
export async function deleteLocalFiles(files) {
  for (let file of files) {
    try {
      fs.unlinkSync(file);
      console.log(`Successfully deleted file: ${file}`);
    } catch (error) {
      console.error(`Error deleting file ${file}:`, error);
    }
  }
}

