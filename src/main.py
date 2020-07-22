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
from analysis import plot_all_bike_count_data_over_time, plot_businesses_over_time

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
    list_of_bike_data_frames = []
    for loc in bike_count_locations:
        list_of_loc_data, loc_df = get_bike_data_frame(file=bike_count_locations[loc]["file_name"], data_path=data_path, coordinates=bike_count_locations[loc]["coordinates"], min_date=min_date, excess_columns=bike_count_locations[loc]["excess_cols"], comb_cols=bike_count_locations[loc]["comb_cols"])
        list_of_all_loc_data.append(list_of_loc_data)
        list_of_bike_data_frames.append({bike_count_locations[loc]["file_name"]: loc_df})
    final_data = []
    for i, _ in enumerate(list_of_all_loc_data[0]):
        list_of_period_data = []
        for j, _ in enumerate(list_of_all_loc_data):
            list_of_period_data.append(list_of_all_loc_data[j][i])
        final_data.append(list_of_period_data)
    date_range = pd.date_range(min_date, max_date, freq="D")
    date_indices = [str(x) for x in date_range]
    return final_data, date_indices, list_of_bike_data_frames


def prep_business_data_frame(df):
    df["License Start Date"] = pd.to_datetime(df["License Start Date"])
    df = df[df["License Start Date"] > min_date]
    return df


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
        df.apply(combine_loc_count_data_transf, args=(coordinates, list_of_data_list), axis=1)
        return list_of_data_list, df


def setup_bike_count_heat_map(bike_data):
    bike_count_heat_map = folium.Map(location=seattle_coords, min_zoom=13, max_bounds=True)
    bike_count_heat_map.add_child(HeatMapWithTime(data=bike_data, 
                    index=date_indices,
                    radius=50, 
                    gradient={0.2: 'blue', 0.4: 'lime', 0.6: 'orange', 1: 'red'}, 
                    use_local_extrema=True,
                    min_opacity=0.5,
                    max_opacity=0.8
    ))
    bike_count_heat_map.save("bike_count_heat_map.html")


def business_time_series_map_features_util(df):
    features = []
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


def setup_business_time_series_map(business_data):
    features = business_time_series_map_features_util(business_data)
    business_time_series_map = folium.Map(location=seattle_coords, min_zoom=13, max_bounds=True)
    business_time_series_map.add_child(TimestampedGeoJson(
        {'type': 'FeatureCollection',
        'features': features}
        , period='P1D'
        , add_last_point=True
        , auto_play=False
        , loop=False
        , loop_button=True
        , date_options='MM/DD/YYYY'
        , duration="P1D"
    ))
    business_time_series_map.save("business_time_series_map.html")


def setup_folium_maps(business_data, bike_data):
    setup_bike_count_heat_map(bike_data)
    setup_business_time_series_map(business_data)


def main():
    data_path = f"{os.getcwd()}/data"
    if not os.path.exists(f"{data_path}/Active_Business_Data_Modified.csv"):
        prep_business_dataset()
    business_data_frame = pd.read_csv(f"{data_path}/Active_Business_Data_Modified.csv", sep="\t")
    business_data_by_date = prep_business_data_frame(business_data_frame)
    bike_data_by_date, date_indices, bike_data_frames_list = prep_bike_count_datasets()
    #setup_folium_maps(business_data_by_date, bike_data_by_date)
    #plot_all_bike_count_data_over_time(bike_data_frames_list)
    df2 = business_data_by_date.groupby(["License Start Date"]).count()
    plot_businesses_over_time(df2)


if __name__ == "__main__":
    """ This is executed when run from the command line """
    main()