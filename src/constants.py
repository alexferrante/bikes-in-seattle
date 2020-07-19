import datetime

bike_count_locations = {
    "fremont_br": {
        "coordinates": [47.647956, -122.349649],
        "file_name": "Fremont_Bridge_Bicycle_Counter",
        "excess_cols": ["Fremont Bridge East Sidewalk", "Fremont Bridge West Sidewalk"],
        "comb_cols": []
    },
    "spokane_br": {
        "coordinates": [47.571937, -122.349702],
        "file_name": "Spokane_St_Bridge_Bicycle_Counter",
        "excess_cols": ["West", "East"],
        "comb_cols": []
    },
    "oregon_26th": {
        "coordinates": [47.564988, -122.365739],
        "file_name": "26th_Ave_SW_Greenway_at_SW_Oregon_St_Bicycle_Counter",
        "excess_cols": ["North", "South"],
        "comb_cols": []
    },
    "marion_2nd": {
        "coordinates": [47.605026, -122.332660],
        "file_name": "2nd_Ave_Cycle_Track_North_of_Marion_St_Bicycle_Counter",
        "excess_cols": ["NB", "SB"],
        "comb_cols": []
    },
     "myrtle_ed_pk": { 
        "coordinates": [47.619657, -122.361754],
        "file_name": "Elliott_Bay_Trail_in_Myrtle_Edwards_Park_Bicycle_and_Pedestrian_Counter",
        "excess_cols": ["Elliott Bay Trail in Myrtle Edwards Park Total", "Ped North", "Ped South"],
        "comb_cols": ["Bike North", "Bike South"]
    }
}

seattle_coords = [47.6062, -122.3321]

min_date = datetime.datetime(2015, 1, 1)
max_date = datetime.datetime(2020, 6, 30)