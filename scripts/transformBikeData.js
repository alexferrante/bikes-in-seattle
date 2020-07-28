const csv = require('csvtojson');
const fs = require('fs');
const moment = require('moment');

const path = `${__dirname}/../data/`
const fileRegex = /^clean_bike_data.csv$/

const toJSON = (obj) => {
  return {
    count: Number(obj),
  };
}

const getId = (name) => {
    if (name == 'Total Fremont_Bridge_Bicycle_Counter') {
        return 0;
    } else if (name == 'Total Spokane_St_Bridge_Bicycle_Counter') {
        return 1;
    } else if (name == 'Total 26th_Ave_SW_Greenway_at_SW_Oregon_St_Bicycle_Counter') {
        return 2;
    } else if (name == 'Total 2nd_Ave_Cycle_Track_North_of_Marion_St_Bicycle_Counter') {
        return 3;
    } else if (name == 'Total Elliott_Bay_Trail_in_Myrtle_Edwards_Park_Bicycle_and_Pedestrian_Counter') {
        return 4;
    } else {
    }
}

(async () => {
  const byDays = {};
  const byWeeks = {};
  const byMonths = {};
  const byComplexId = {
    days: {},
    weeks: {},
    months: {},
  };
  await Promise.all(fs.readdirSync(path).filter((filename) => {
    return fileRegex.test(filename);
  }).map((filename) => {
    const filePath = path + filename;
    return csv().fromFile(filePath).subscribe(
      (obj) => {
        Object.keys(obj).forEach(function(key) {
          const month = moment(obj.Date).format('YYYY-MM') + '-01';
          const week = moment(obj.Date).endOf('week').subtract(1, 'day').format('YYYY-MM-DD');
          let dateObj = byDays[obj.Date];
          let weekObj = byWeeks[week];
          let monthObj = byMonths[month];
          if (!dateObj) {
              byDays[obj.Date] = {};
              dateObj = byDays[obj.Date];
          }
          if (!weekObj) {
              byWeeks[week] = {};
              weekObj = byWeeks[week];
          }
          if (!monthObj) {
              byMonths[month] = {};
              monthObj = byMonths[month];
          }
            if (key != "Date") {
                const convertedObj = toJSON(obj[key]);
                let complexObj = byComplexId[getId(key)];
                let weekObjForComplex = weekObj[getId(key)];
                let monthObjForComplex = monthObj[getId(key)];

                if (!weekObjForComplex) {
                    weekObj[getId(key)] = {"count": 0};
                    weekObjForComplex = weekObj[getId(key)];
                }

                if (!monthObjForComplex) {
                    monthObj[getId(key)] = {"count": 0};
                    monthObjForComplex = monthObj[getId(key)];
                }

                if (!complexObj) {
                    byComplexId[getId(key)] = {
                        days: {},
                        weeks: {},
                        months: {},
                    }
                    complexObj = byComplexId[getId(key)];
                }
                // console.log(byComplexId)
                let complexByWeek = complexObj.weeks[week];
                let complexByMonth = complexObj.months[month];
                if (!complexByWeek) {
                    complexObj.weeks[week] = {"count": 0};
                    complexByWeek = complexObj.weeks[week];
                }
                if (!complexByMonth) {
                    complexObj.months[month] = {"count": 0};
                    complexByMonth = complexObj.months[month];
                }
                dateObj[getId(key)] = convertedObj;
                weekObjForComplex["count"] = weekObjForComplex["count"] + convertedObj.count;
                monthObjForComplex["count"] = monthObjForComplex["count"] + convertedObj.count;
                complexObj.days[obj.Date] = convertedObj;
                complexObj.weeks[week]["count"] = complexObj.weeks[week]["count"] + convertedObj.count;
                complexObj.months[month]["count"] = complexObj.months[month]["count"] + convertedObj.count;
            }
        });
      },
      () => console.log('error'),
      () => console.log('Wrote JSON')
    );
  }));
  let daysJSON = JSON.stringify(Object.keys(byDays));
  fs.writeFile(`${__dirname}/../src/data/days.json`, daysJSON, 'utf-8', (err) => {
    if (err) throw err;
  });

  let weeksJSON = JSON.stringify(Object.keys(byWeeks));
  fs.writeFile(`${__dirname}/../src/data/weeks.json`, weeksJSON, 'utf-8', (err) => {
    if (err) throw err;
  });

  let monthsJSON = JSON.stringify(Object.keys(byMonths));
  fs.writeFile(`${__dirname}/../src/data/months.json`, monthsJSON, 'utf-8', (err) => {
    if (err) throw err;
  });

  Object.keys(byDays).forEach((date) => {
    const dateJson = JSON.stringify(byDays[date]);
    fs.writeFile(`${__dirname}/../src/data/days/${date}.json`, dateJson, 'utf8', (err) => {
      if (err) throw err;
    });
  });

  Object.keys(byWeeks).forEach((week) => {
    const weekJson = JSON.stringify(byWeeks[week]);
    fs.writeFile(`${__dirname}/../src/data/weeks/${week}.json`, weekJson, 'utf8', (err) => {
      if (err) throw err;
    });
  });

  Object.keys(byMonths).forEach((month) => {
    const monthJson = JSON.stringify(byMonths[month]);
    fs.writeFile(`${__dirname}/../src/data/months/${month}.json`, monthJson, 'utf8', (err) => {
      if (err) throw err;
    });
  });
  Object.keys(byComplexId).forEach((complexId) => {
    const complexJson = JSON.stringify(byComplexId[complexId]);
    fs.writeFile(`${__dirname}/../src/data/complexId/${complexId}.json`, complexJson, 'utf8', (err) => {
      if (err) throw err;
      console.log(`${complexId} has been saved!`);
    });
  });


//   const timestampJson = JSON.stringify(new Date());

//   fs.writeFile(`${__dirname}/../src/data/timestamp.json`, timestampJson, 'utf8', (err) => {
//     if (err) throw err;
//   });
})();