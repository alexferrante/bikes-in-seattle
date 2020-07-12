#!/usr/bin/env python3
"""
Module Docstring
"""
import numpy as np
import pandas as pd
import os
import folium
import csv
import datetime
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from folium.plugins import TimestampedGeoJson, HeatMapWithTime

__author__ = "Your Name"
__version__ = "0.1.0"
__license__ = "MIT"

seattle_coords = [47.6062, -122.3321]

bike_count_locations = {
    "fremont_br": {
        "coordinates": [47.647956, -122.349649],
        "file_name": "Fremont_Bridge_Bicycle_Counter",
        "excess_cols" ["Fremont Bridge East Sidewalk", "Fremont Bridge West Sidewalk"]
    },
    "spokane_br": {
        "coordinates": [47.571937, -122.349702],
        "file_name": "Spokane_St_Bridge_Bicycle_Counter",
        "excess_cols": ["West", "East"]
    },
    "oregon_26th": {
        "coordinates": [47.564988, -122.365739],
        "file_name": "26th_Ave_SW_Greenway_at_SW_Oregon_St_Bicycle_Counter",
        "excess_cols": ["North", "South"]
    },
    "marion_2nd": {
        "coordinates": [47.605026, -122.332660],
        "file_name": "2nd_Ave_Cycle_Track_North_of_Marion_St_Bicycle_Counter",
        "excess_cols": ["NB", "SB"]
    },
    "myrtle_ed_pk": { # Special handling: combine N. Bike + S. Bike
        "coordinates": [47.619657, -122.361754],
        "file_name": "Elliott_Bay_Trail_in_Myrtle_Edwards_Park_Bicycle_and_Pedestrian_Counter",
        "excess_cols": ["Total", "Ped North", "Ped South"]
    }
}

def prep_business_dataset():
    data_path = f"{os.getcwd()}/data"
    with open(f"{data_path}/Active_Business_License_Tax_Certificate.csv") as f:
        df = pd.read_csv(f, index_col=False)
        df = df.loc[df["City"] == "SEATTLE"]
        gelocator = Nominatim(user_agent="yrdy")
        for i,r in df.iterrows():
            addr = f"""{r["Street Address"]} {r["City"]} {r["State"]}"""
            try:
                print(f"Fetching coordinates for {addr}...")
                location = gelocator.geocode(addr, timeout=None)
            except:
                print(f"index {i} row {r} timed out")
                df.to_csv(f"{data_path}/Active_Business_Data_Modified.csv", sep="\t", index=False)
            if location is not None:
                df.loc[i, "Latitude"] = location.latitude
                df.loc[i, "Longitude"] = location.longitude
                print(f"Wrote coordinates {location.latitude}, {location.longitude}")
            else:
                print(f"Coordinates not found")
                df.drop(i, inplace=True)
        print("Finished populating coordinate lookup")
        df.to_csv(f"{data_path}/Active_Business_Data_Modified.csv", sep="\t", index=False)

def prep_bike_count_datasets():
    data_path = f"{os.getcwd()}/data"
    min_date = datetime.datetime(2015, 1, 1)
    list_of_data = []


def get_bike_data_frame(file, data_path, min_date, excess_columns):
    with open(f"{data_path}/{file}.csv") as f:
        df = pd.read_csv(f, parse_dates=["Date"], index_col=["Date"])
        for c in excess_columns:
            df.drop(c, axis=1, inplace=True)
        df = df.resample('D').sum()
        df = df[df.index > min_date]
        return df

def get_geojson_features(df):
    features = []
    min_date = datetime.datetime(2015, 1, 1)
    df["License Start Date"] = pd.to_datetime(df["License Start Date"])
    df = df[df["License Start Date"] > min_date]
    pairs_of_coords = list(zip(df["Longitude"], df["Latitude"]))
    dates = list(df["License Start Date"].dt.strftime("%m/%d/%Y"))
    for i in range(len(pairs_of_coords)):
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [pairs_of_coords[i][0], pairs_of_coords[i][1]]
            },
            "properties": {
                "time": dates[i],
                "radius": 3
            }
        }
        features.append(feature)
    return features

def main():
    """ Main entry point of the app """
    folium_map = folium.Map(location=seattle_coords, min_zoom=13, max_bounds=True)
    for i in counter_locations:
        marker = folium.CircleMarker(location=counter_locations[i])
        marker.add_to(folium_map)
    data_path = f"{os.getcwd()}/data"
    if not os.path.exists(f"{data_path}/Active_Business_Data_Modified.csv"):
        prep_business_dataset()
    df = pd.read_csv(f"{data_path}/Active_Business_Data_Modified.csv", sep="\t")
    prep_bike_count_datasets()
    features = get_geojson_features(df)
    TimestampedGeoJson(
        {'type': 'FeatureCollection',
        'features': features}
        , period='P1D'
        , add_last_point=True
        , auto_play=False
        , loop=False
        , loop_button=True
        , date_options='MM/DD/YYYY'
        , time_slider_drag_update=True
    ).add_to(folium_map)
    folium_map.save("test.html")

if __name__ == "__main__":
    """ This is executed when run from the command line """
    main()