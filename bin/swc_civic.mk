include .env

DC_FLAGS = -f dev.docker-compose.yml
SWC_CIVIC_DATABASE_URL ?= $(SWC_CIVIC_DATABASE_URL)

dc_postgres:
	docker compose $(DC_FLAGS) exec -ti postgis psql -U postgres --dbname=swc_civic

import_us_geojson:
	ogr2ogr -f "PostgreSQL" "PG:$(SWC_CIVIC_DATABASE_URL)" "./data/us_congressional_districts.geojson" -nln us_congressional_district -overwrite

import_ca_kmz:
	ogr2ogr -f "PostgreSQL" "PG:$(SWC_CIVIC_DATABASE_URL)" "./data/FED_CA_2021_EN.kmz" -nlt PROMOTE_TO_MULTI -lco precision=NO -nln ca_electoral_districts -overwrite

import_gb_geojson:
	ogr2ogr -f "PostgreSQL" "PG:$(SWC_CIVIC_DATABASE_URL)" "./data/uk_parliamentary_constituencies.geojson" -nln uk_parliamentary_constituency -overwrite

import_au_shp:
	ogr2ogr -f "PostgreSQL" "PG:$(SWC_CIVIC_DATABASE_URL)" "./data/au/AUS_ELB_region.shp" -nln au_federal_electoral_district -nlt MULTIPOLYGON -overwrite

import_swc_civic_data:
	make import_us_geojson
	make import_ca_kmz
	make import_gb_geojson
	make import_au_shp
