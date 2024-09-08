import express from "express";
import dotenv from 'dotenv';
import axios from "axios";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "https://calendarific.com/api/v2";
const API_KEY = process.env.API_KEY;

app.use(express.static("public"));

let cachedCountries = [];

const getCountries = async () => {
    if (cachedCountries.length === 0) {
        const response = await axios.get(API_URL + "/countries" + API_KEY);
        cachedCountries = response.data.response.countries;
    }
    return cachedCountries;
};

app.get("/", async (req, res) => {
    try {
        const countries = await getCountries();
        res.render("index.ejs", { countries: countries });
    } catch (error) {
        console.error("Error fetching countries:", error.message);
        res.status(500).send("An error occurred while fetching the countries.");
    }
});

app.get("/holidays", async (req, res) => {
    const countryIso = req.query.country;
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    try {
        const holidaysResponse = await axios.get(`${API_URL}/holidays${API_KEY}&country=${countryIso}&day=${day}&month=${month}&year=${year}`);
        const holidays = holidaysResponse.data.response.holidays;

        const countries = await getCountries();
        const selectedCountry = countries.find(country => country['iso-3166'] === countryIso);

        res.render("index.ejs", {
            countries: countries,
            holidays: holidays,
            selectedCountry: selectedCountry ? selectedCountry.country_name : "Unknown Country"
        });
    } catch (error) {
        console.error("Error fetching holidays:", error.message);
        res.status(500).send("An error occurred while fetching the holidays.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});