import numpy as np
import pandas as pd 
import matplotlib.pyplot as plt 

class Plot:
    def plot_bike_count_over_time(self, data_location, df):
        plt.figure(figsize=(17, 8))
        plt.plot(df)
        plt.title(f"{data_location}")
        plt.ylabel("Bike count")
        plt.xlabel("Time (day)")
        plt.grid(False)
        plt.show()