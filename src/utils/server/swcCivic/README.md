# SWC Civic API

The SWC Civic API allows you to determine the electoral zone corresponding to a given address.

The solution is powered by a PostgreSQL database with the [PostGIS](https://postgis.net/) extension, which adds support for spatial queries on geographic data.

The database is populated with geospatial data where each row represents an electoral zone and contains the coordinates that define its boundaries. Using PostGIS, we can check if a geographic point (latitude and longitude) falls within a given zone.

The main query logic is implemented in [`queryElectoralZoneFromLatLong.ts`](../src/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong.ts).

## Database Setup

### For Core Contributors

If you're a core contributor and need to make changes to the database, go to the [Neon platform](https://console.neon.tech/) and create a branch from `development`.

### For Local Development

If you're not a core contributor or want to run the database locally, follow these steps:

1. Download the [geographic data](https://drive.google.com/drive/folders/16MaPdsQojd9_dioiQBK4cMuMHqy16cG3?usp=drive_link) for each country. If you don't have access to the folder, refer to the [Useful Links](#useful-links) section

2. Save the files into a `data` folder at the root of the project.  
   If you save them elsewhere, make sure the path is correctly set in [`seedSWCCivicDB.ts`](../src/bin/swcCivic/seedSWCCivicDB.ts).

3. Generate the Prisma schema:

   ```bash
   npm run db:generate
   ```

4. Start the Docker containers:

   ```bash
   npm run db:start-dev
   ```

5. Seed the database:
   ```bash
   npm run db:seed-swc-civic
   ```

## Validating the Data

We provide a script called [compareElectoralZonesWithDTSI.ts](../src/bin/swcCivic/compareElectoralZonesWithDTSI.ts), which compares the electoral zones in our database with those from DTSI, and saves the results in a spreadsheet.

It’s important to ensure that all DTSI electoral zones that have associated politicians also exist in our database. If we have extra zones in our database not found in DTSI, that is not a concern.

If discrepancies are found, investigate further—especially checking whether the zone is still active or has been renamed.

## Updating the Database [WIP]

Currently, the only way to update the database is by running:

```bash
npm run db:seed-swc-civic
```

This must be done in a local environment. Use the `SWC_CIVIC_DATABASE_URL` environment variable to specify which database should be updated.

## Useful links

### AU

```
https://www.aec.gov.au/Electorates/gis/gis_datadownload.htm
```

### CA

```
https://open.canada.ca/data/en/dataset/18bf3ea7-1940-46ec-af52-9ba3f77ed708
```

### GB

```
https://geoportal.statistics.gov.uk/datasets/0d698c9712de4afcac9377367d831c1a_0/explore?location=54.959083%2C-3.316939%2C6.04
```

### US

```
https://data-usdot.opendata.arcgis.com/datasets/usdot::congressional-districts/explore
```
