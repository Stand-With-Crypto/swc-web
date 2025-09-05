# SWC Civic API

The SWC Civic API enables you to determine the electoral zone corresponding to a given address using geospatial data (GIS data).

This solution is powered by a PostgreSQL database with the [PostGIS](https://postgis.net/) extension, which adds support for spatial queries on geographic data. The database is populated with geospatial data, where each row represents an electoral zone and contains the coordinates that define its boundaries. Using PostGIS, we can efficiently check if a geographic point (latitude and longitude) falls within a given zone.

The main query logic is implemented in [`queryElectoralZoneFromLatLong.ts`](../src/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong.ts).

## Setup

### Configuration File

The GIS data configuration file is located at: [`electoralZonesDataConfigs.ts`](../src/bin/swcCivic/electoralZonesDataConfigs.ts)

This file is responsible for:

1. Specifying the path to the GIS data file
2. Indicating the keys in the GIS data that represent the electoral zone and state
3. Defining which normalization function should be used
4. Setting a flag to control whether data should be persisted (affecting both seeding and updating processes)

### For Core Contributors

If you are a core contributor and need to make changes to the database, use the [Neon platform](https://console.neon.tech/) and create a branch from `development`.

### For Local Development

If you are not a core contributor or want to run the database locally, follow these steps:

1. Generate the Prisma schema:
   ```bash
   npm run db:generate
   ```
2. Start the Docker containers:
   ```bash
   npm run db:start-dev
   ```
3. Seed the database:
   ```bash
   npm run db:seed-swc-civic
   ```

## Data Validation

A script called [`compareGISDataWithDTSI.ts`](../src/bin/swcCivic/validations/compareGISDataWithDTSI.ts) is provided to compare the electoral zones in the GIS data file with those from DTSI, saving the results in a spreadsheet.

When analyzing the results, you may encounter the following scenarios:

1. **Districts only in the GIS data file:**
   - This is not a concern; it simply means the district has not been associated with any politician in DTSI.
2. **Districts only in DTSI:**
   - In this case, check if:
     1. **The district was discontinued:** If so, just confirm that the new district is present in the database.
     2. **The district has a different name:** If so, adjust the normalization function to match the datasets.
   - If neither applies, seek another data source (older or newer) that matches the districts in DTSI.

To run this validation, use:

```bash
npm run ts src/bin/swcCivic/validations/compareGISDataWithDTSI.ts
```

## Updating the Database

To update the database, set the `persist` flag to `true` for the relevant country in the [configuration file](#configuration-file). Always validate the data before performing an update.

Update your test branch first, then update the development branch, and finally production.

To update the data, run:

```bash
npm run ts src/bin/swcCivic/updateCountryElectoralZones.ts
```

This must be done in a local environment. Use the `SWC_CIVIC_DATABASE_URL` environment variable to specify which database should be updated.

## Useful Links

### Australia (AU)

https://www.aec.gov.au/Electorates/gis/gis_datadownload.htm

### Canada (CA)

https://open.canada.ca/data/en/dataset/18bf3ea7-1940-46ec-af52-9ba3f77ed708

### Great Britain (GB)

https://geoportal.statistics.gov.uk/datasets/0d698c9712de4afcac9377367d831c1a_0/explore?location=54.959083%2C-3.316939%2C6.04

### United States (US)

https://data-usdot.opendata.arcgis.com/datasets/usdot::congressional-districts/explore
