const csv = require('csvtojson');
const fs = require('fs');
const moment = require('moment');

const path = `${__dirname}/../data/`
const fileRegex = /^clean_bike_data.csv$/

const toJSON = (obj) => {
  return {
    count: Number(obj.count),
  };
}

(async () => {
  const byDays = {};
  const byWeeks = {};
  const byMonths = {};

  await Promise.all(fs.readdirSync(path).filter((filename) => {
    return fileRegex.test(filename);
  }).map((filename) => {
    const filePath = path + filename;
    return csv().fromFile(filePath).subscribe(
      (obj) => {
        const convertedObj = toJSON(obj);
        const month = moment(obj.date).format('YYYY-MM') + '-01';
        const week = moment(obj.date).endOf('week').subtract(1, 'day').format('YYYY-MM-DD');
        let dateObj = byDays[obj.date];
        let weekObj = byWeeks[week];
        let monthObj = byMonths[month];

        if (!dateObj) {
          byDays[obj.date] = {};
          dateObj = byDays[obj.date];
        }

        if (!weekObj) {
          byWeeks[week] = {};
          weekObj = byWeeks[week];
        }

        if (!monthObj) {
          byMonths[month] = {};
          monthObj = byMonths[month];
        }

      },
      () => console.log('error'),
      () => console.log('success')
    );
  }));

//   const overallJson = JSON.stringify(overall);

//   fs.writeFile(`${__dirname}/../src/data/overall.json`, overallJson, 'utf8', (err) => {
//     if (err) throw err;
//   });

//   Object.keys(byDays).forEach((date) => {
//     const dateJson = JSON.stringify(byDays[date]);
//     fs.writeFile(`${__dirname}/../src/data/days/${date}.json`, dateJson, 'utf8', (err) => {
//       if (err) throw err;
//     });
//   });

//   Object.keys(byWeeks).forEach((week) => {
//     const weekJson = JSON.stringify(byWeeks[week]);
//     fs.writeFile(`${__dirname}/../src/data/weeks/${week}.json`, weekJson, 'utf8', (err) => {
//       if (err) throw err;
//     });
//   });

//   Object.keys(byMonths).forEach((month) => {
//     const monthJson = JSON.stringify(byMonths[month]);
//     fs.writeFile(`${__dirname}/../src/data/months/${month}.json`, monthJson, 'utf8', (err) => {
//       if (err) throw err;
//     });
//   });


//   const timestampJson = JSON.stringify(new Date());

//   fs.writeFile(`${__dirname}/../src/data/timestamp.json`, timestampJson, 'utf8', (err) => {
//     if (err) throw err;
//   });
})();