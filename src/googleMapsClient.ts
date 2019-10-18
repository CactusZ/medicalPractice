import { config } from "dotenv";
import { createClient, GoogleMapsClient } from "@google/maps";

// Load configuration from .env file
config();

// Initialize the Google Maps Client
const googleMapsClient: GoogleMapsClient = createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

export default googleMapsClient;
