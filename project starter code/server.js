import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";
import fetch from "node-fetch"; // Add this import

const app = express();

// Use process.env.PORT for Elastic Beanstalk to dynamically assign the port
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get("/filteredimage", async (req, res) => {
  const { image_url } = req.query;

  if (!image_url) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    console.log(`Validating image URL: ${image_url}`);

    // First validate if the URL is accessible
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Verify content type is an image
    const contentType = imageResponse.headers.get("content-type");
    if (!contentType.startsWith("image/")) {
      throw new Error("URL does not point to a valid image");
    }

    console.log(`Attempting to fetch image from URL: ${image_url}`);
    const filteredImagePath = await filterImageFromURL(image_url);

    console.log(`Filtered image will be saved to: ${filteredImagePath}`);

    res.status(200).sendFile(filteredImagePath, {}, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
      deleteLocalFiles([filteredImagePath]);
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(422).json({
      error: "Error processing the image",
      details: error.message,
    });
  }
});

app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Press CTRL+C to stop server");
});
