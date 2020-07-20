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
import matplotlib.pyplot as plt 
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from folium.plugins import TimestampedGeoJson, HeatMapWithTime
from constants import bike_count_locations, seattle_coords, min_date, max_date
from analysis import Plot

__author__ = "Your Name"
__version__ = "0.1.0"
__license__ = "MIT"

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
                df.to_csv(f"{data_path}/Active_Business_Data_Modified.csv", sep="\t", index=False)
                print(f"Index {i}, Row {r} timed out. Wrote back-up file")
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
    list_of_all_loc_data = []
    for loc in bike_count_locations:
        list_of_loc_data = get_bike_data_frame(file=bike_count_locations[loc]["file_name"], data_path=data_path, coordinates=bike_count_locations[loc]["coordinates"], min_date=min_date, excess_columns=bike_count_locations[loc]["excess_cols"], comb_cols=bike_count_locations[loc]["comb_cols"])
        list_of_all_loc_data.append(list_of_loc_data)
    final_data = []
    for i, _ in enumerate(list_of_all_loc_data[0]):
        list_of_period_data = []
        for j, _ in enumerate(list_of_all_loc_data):
            list_of_period_data.append(list_of_all_loc_data[j][i])
        final_data.append(list_of_period_data)
    date_range = pd.date_range(min_date, max_date, freq="D")
    date_indices = [str(x) for x in date_range]
    return final_data, date_indices

def combine_loc_count_data_transf(r, coordinates, list_of_data_list):
    data_list = coordinates.copy()
    data_list.append(r["Total"])
    list_of_data_list.append(data_list)

def get_bike_data_frame(file, data_path, coordinates, min_date, excess_columns, comb_cols):
    list_of_data_list = []
    with open(f"{data_path}/{file}.csv") as f:
        df = pd.read_csv(f, parse_dates=["Date"], index_col=["Date"])
        if len(comb_cols) != 0:
            df["Total"] = df.loc[:,[comb_cols[0],comb_cols[1]]].sum(axis=1)
            excess_columns.extend(comb_cols)
        for c in excess_columns:
            df.drop(c, axis=1, inplace=True)
        df = df.resample("D").sum()
        df = df[df.index >= min_date]
        df.rename(columns={df.columns[0]: "Total"}, inplace=True)
        bike_data_plot = Plot()
        bike_data_plot.plot_bike_count_over_time(file, df)
        df.apply(combine_loc_count_data_transf, args=(coordinates, list_of_data_list), axis=1)
        return list_of_data_list

def get_geojson_features(df):
    features = []
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
    # for loc in bike_count_locations:
    #     marker = folium.CircleMarker(location=bike_count_locations[loc]["coordinates"])
    #     marker.add_to(folium_map)
    data_path = f"{os.getcwd()}/data"
    if not os.path.exists(f"{data_path}/Active_Business_Data_Modified.csv"):
        prep_business_dataset()
    df = pd.read_csv(f"{data_path}/Active_Business_Data_Modified.csv", sep="\t")
    bike_data_by_date, date_indices = prep_bike_count_datasets()
    
    folium_map.add_child(HeatMapWithTime(data=bike_data_by_date, 
                    index=date_indices,
                    radius=50, 
                    gradient={0.2: 'blue', 0.4: 'lime', 0.6: 'orange', 1: 'red'}, 
                    use_local_extrema=True,
                    min_opacity=0.5,
                    max_opacity=0.8
    ))

    folium_map_2 = folium.Map(location=seattle_coords, min_zoom=13, max_bounds=True)
    features = get_geojson_features(df)
    folium_map_2.add_child(TimestampedGeoJson(
        {'type': 'FeatureCollection',
        'features': features}
        , period='P1D'
        , add_last_point=True
        , auto_play=False
        , loop=False
        , loop_button=True
        , date_options='MM/DD/YYYY'
        , duration="P1M"
    ))
    folium_map.save("test.html")
    folium_map_2.save("test_2.html")

if __name__ == "__main__":
    """ This is executed when run from the command line """
    main()