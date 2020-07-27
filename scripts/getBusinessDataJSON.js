const path = `${__dirname}/../data/`;
const {DataFrame }= require('dataframe-js')
const moment = require('moment')

const bike_count_locations = [
  fremont_br = {
      coordinates: [-122.349649, 47.647956 ],
      file_name: "Fremont_Bridge_Bicycle_Counter",
      excess_cols: ["Fremont Bridge East Sidewalk", "Fremont Bridge West Sidewalk"],
      comb_cols: []
  },
  // spokane_br = {
  //     coordinates: [-122.349702, 47.571937],
  //     file_name: "Spokane_St_Bridge_Bicycle_Counter",
  //     excess_cols: ["West", "East"],
  //     comb_cols: []
  // },
  // oregon_26th = {
  //     coordinates: [-122.365739, 47.564988],
  //     file_name: "26th_Ave_SW_Greenway_at_SW_Oregon_St_Bicycle_Counter",
  //     excess_cols: ["North", "South"],
  //     comb_cols: []
  // },
  // marion_2nd = {
  //     coordinates: [-122.332660, 47.605026],
  //     file_name: "2nd_Ave_Cycle_Track_North_of_Marion_St_Bicycle_Counter",
  //     excess_cols: ["NB", "SB"],
  //     comb_cols: []
  // },
   myrtle_ed_pk = { 
      coordinates: [-122.361754, 47.619657],
      file_name: "Elliott_Bay_Trail_in_Myrtle_Edwards_Park_Bicycle_and_Pedestrian_Counter",
      excess_cols: ["Elliott Bay Trail in Myrtle Edwards Park Total", "Ped North", "Ped South"],
      comb_cols: ["Bike North", "Bike South"]
  }
]

const min_date = moment([2015, 1, 1])
const max_date = moment([2020, 6, 30])

const load_from_csv = async (path, location_data, dates) => {
  DataFrame.fromCSV(path).then(df => {
    if (location_data.comb_cols.length != 0) {
      df = df.withColumn(comb_cols[0], (row) => String(parseInt(row.get(comb_cols[0])) + parseInt(row.get(comb_cols[1]))))
      df = df.drop(comb_cols[1])
      df = df.rename(comb_cols[0], "Total")
    }
    for (var col in location_data.excess_cols) {
      df = df.drop(location_data.excess_cols[col])
    }
    df = df.rename(df.listColumns()[1], "Total")
    df = df.cast(df.listColumns()[0], (val) => moment(val).format("MM/DD/Y"))
    var final_df = new DataFrame([], ["Date", `Total ${location_data.file_name}`])
    for (var date in dates) {
      day_rows = df.filter(row => row.get(df.listColumns()[0]) == dates[date])
      var sum = 0
      var i = 0
      while (i < day_rows.count()) {
        val = parseInt(day_rows.getRow(i).select("Total").toArray()[0])
        sum += val
        i++
      }
      final_df = final_df.push([dates[date], sum])
    }
    return df
  })
};

(async () => {
  const byDays = {};
  const byWeeks = {};
  const byMonths = {};
  let dates = []
  let date = min_date
  while (date <= max_date) {
    dates.push(date.format("MM/DD/Y"))
    date = date.add(1, 'd')
  }
  
  let bike_data_frames = []
  for (var location in bike_count_locations) {
    await DataFrame.fromCSV(`${path}${bike_count_locations[location].file_name}.csv`).then(df => {
      if (bike_count_locations[location].comb_cols && bike_count_locations[location].comb_cols.length) {
        df = df.withColumn(bike_count_locations[location].comb_cols[0], (row) => String(parseInt(row.get(bike_count_locations[location].comb_cols[0])) + parseInt(row.get(bike_count_locations[location].comb_cols[1]))))
        df = df.drop(bike_count_locations[location].comb_cols[1])
        df = df.rename(bike_count_locations[location].comb_cols[0], "Total")
      }
      for (var col in bike_count_locations[location].excess_cols) {
        df = df.drop(bike_count_locations[location].excess_cols[col])
      }
      df = df.rename(df.listColumns()[1], "Total")
      df = df.cast(df.listColumns()[0], (val) => moment(val).format("MM/DD/Y"))
      let final_df = new DataFrame([], ["Date", `Total ${bike_count_locations[location].file_name}`])
      for (var date in dates) {
        day_rows = df.filter(row => row.get(df.listColumns()[0]) == dates[date])
        let sum = 0
        let i = 0
        while (i < day_rows.count()) {
          val = parseInt(day_rows.getRow(i).select("Total").toArray()[0])
          sum += val
          i++
        }
        final_df = final_df.push([dates[date], sum])
      }  
      bike_data_frames.push(final_df)
    })
  }
  let final_data_frame = bike_data_frames[0]
  for (var i = 1; i < bike_data_frames.length; i++) {
    final_data_frame = final_data_frame.innerJoin(bike_data_frames[i], "Date")
  }
  console.log(final_data_frame.getRow(1))
})();