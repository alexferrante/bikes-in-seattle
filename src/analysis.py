import numpy as np
import pandas as pd 
import matplotlib.pyplot as plt 


class Plot:
    def plot_bike_count_over_time(self, axes, data_location, df):
        axes.plot(df)
        axes.set_title(f"{data_location}")
        axes.set_ylabel("Bike count")
        axes.set_xlabel("Time (day)")
        axes.grid(False)
    

def plot_businesses_over_time(df):
    fig = plt.figure()
    plt.plot(df)
    plt.show()


def plot_all_bike_count_data_over_time(df_dict_list):
        bike_plot = Plot()
        fig, axes = plt.subplots(nrows=5, ncols=1)
        axn = axes.flatten()
        for i in range(len(df_dict_list)):
            loc_title = None
            df = None
            for k in df_dict_list[i]:
                loc_title = k
                df = df_dict_list[i][k]
            bike_plot.plot_bike_count_over_time(axn[i], loc_title, df)
        plt.show()