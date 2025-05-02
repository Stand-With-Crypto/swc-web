DC_FLAGS = -f dev.docker-compose.yml
POSTGRES_CONNECTION_STRING = "PG:host=127.0.0.1 user=postgres dbname=swc_district_geo_data password=postgres"

dc_postgres:
	docker compose $(DC_FLAGS) exec -ti postgis psql -U postgres --dbname=swc_district_geo_data

dc_up:
	docker compose $(DC_FLAGS) up -d

dc_down:
	docker compose $(DC_FLAGS) down

import_us_geojson:
	ogr2ogr -f "PostgreSQL" $(POSTGRES_CONNECTION_STRING) "./data/us_congressional_districts.geojson" -nln us_congressional_district -overwrite

import_ca_kmz:
	ogr2ogr -f "PostgreSQL" $(POSTGRES_CONNECTION_STRING) "./data/FED_CA_2021_EN.kmz" -nlt PROMOTE_TO_MULTI -lco precision=NO -nln ca_electoral_districts -overwrite

import_gb_geojson:
	ogr2ogr -f "PostgreSQL" $(POSTGRES_CONNECTION_STRING) "./data/uk_parliamentary_constituencies.geojson" -nln uk_parliamentary_constituency -overwrite

import_au_shp:
	ogr2ogr -f "PostgreSQL" $(POSTGRES_CONNECTION_STRING) "./data/au/AUS_ELB_region.shp" -nln au_federal_electoral_district -nlt MULTIPOLYGON -overwrite

import_all_data:
	make import_us_geojson
	make import_ca_kmz
	make import_gb_geojson
	make import_au_shp
