import { convertedData as volumneStaticData } from '../../../lib/convertedData';
import nextConnect from 'next-connect';
import middleware from '../../../middlewares/middleware';

const handler = nextConnect();
handler.use(middleware);

// const parser = require("convert-excel-to-json");

// const path = require("path");

// const result = parser({
//   sourceFile: path.join(__dirname, "../data/data.xlsx"),
//   header: {
//     rows: 1
//   },
//   columnToKey: {
//     "*": "{{columnHeader}}"
//   }
// });

const calVolofPetrol = number => {
  const intNumber = parseInt(number);
  // console.log(intNumber)
  if (intNumber < number) {
    return (
      (number - intNumber) * 10 * volumneStaticData.MS[intNumber - 1].DIFFERENCE +
      volumneStaticData.MS[intNumber - 1].VOLUME
    );
  }
  return volumneStaticData.MS[intNumber - 1].VOLUME;
};

const calVolofDiesel = number => {
  const intNumber = parseInt(number);
  if (intNumber < number) {
    return (
      (number - intNumber) * 10 * volumneStaticData.HSD[intNumber - 1].DIFFERENCE +
      volumneStaticData.HSD[intNumber - 1].VOLUME
    );
  }
  return volumneStaticData.HSD[intNumber - 1].VOLUME;
};

handler.get(async (req, res) => {
  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    const data = await req.db
      .collection('dailydata')
      .find({})
      .limit(parseInt(req.query.limit, 10) || 10)
      .sort({ Date: 'desc' });
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send();
  }
});

handler.post(async (req, res) => {
  let allPreviousData = await req.db
    .collection('dailydata')
    .findOne({}, { sort: { createdAt: -1 } });

  // console.log({ allPreviousData })
  const datatopush = { ...calculationsfordb(req.body, allPreviousData), creatorId: req.user._id };

  try {
    let todaysEntry = await req.db.collection('dailydata').insertOne(datatopush);
    todaysEntry = todaysEntry.ops[0];

    if (allPreviousData && allPreviousData._id !== '') {
      await req.db.collection('dailydata').findOneAndUpdate(
        { _id: allPreviousData._id },
        {
          $set: {
            next: todaysEntry._id,
            updatedAt: new Date(),
          },
        },
      );
    }
    res.status(201).send(todaysEntry);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// app.put('/api/daily', async (request, response) => {
//   connect('Daily')
//   let allPreviousData = []
//   await Promise.all(result.Sheet1.forEach(async element => {
//     if (!allPreviousData) {
//       allPreviousData = await dailyData.find().sort({ Date: 'desc' }).limit(1).lean()
//       allPreviousData = allPreviousData[0]
//     }
//     const datatopush = { ...calculationsfordb(element, allPreviousData) }
//     const dailydata = new dailyData({
//       ...datatopush
//     })
//     try {
//       const idCurrent = await dailydata.save()

//       if (!!allPreviousData && allPreviousData._id !== '') {
//         await dailyData.findByIdAndUpdate(allPreviousData._id, {
//           "next": idCurrent.id
//         })
//       }
//       allPreviousData = idCurrent
//       console.log("added")
//     } catch (e) {
//       console.log("error")
//     }
//   }))

//   disconnect('Daily')
//   response.send('dataAdded')

// })
const calculationsfordb = (inputData, previousdata = false) => {
  let calculations = {};

  // eslint-disable-next-line no-extra-boolean-cast
  if (previousdata) {
    // console.log({ previousdata })
    calculations = {
      total_petrol: (
        parseFloat(inputData.Closing_Reading_MS_Dispenser_1_Nozle_1) -
        parseFloat(previousdata.Closing_Reading_MS_Dispenser_1_Nozle_1) +
        (parseFloat(inputData.Closing_Reading_MS_Dispenser_1_Nozle_2) -
          parseFloat(previousdata.Closing_Reading_MS_Dispenser_1_Nozle_2)) -
        (parseFloat(inputData.Testing_MS_Dispenser_1_Nozle_1) +
          parseFloat(inputData.Testing_MS_Dispenser_1_Nozle_2))
      ).toFixed(4),
      total_deisel: (
        parseFloat(inputData.Closing_Reading_HSD_Dispenser_1_Nozle_1) -
        parseFloat(previousdata.Closing_Reading_HSD_Dispenser_1_Nozle_1) +
        (parseFloat(inputData.Closing_Reading_HSD_Dispenser_1_Nozle_2) -
          parseFloat(previousdata.Closing_Reading_HSD_Dispenser_1_Nozle_2)) +
        (parseFloat(inputData.Closing_Reading_HSD_Dispenser_2_Nozle_1) -
          parseFloat(previousdata.Closing_Reading_HSD_Dispenser_2_Nozle_1)) +
        (parseFloat(inputData.Closing_Reading_HSD_Dispenser_2_Nozle_2) -
          parseFloat(previousdata.Closing_Reading_HSD_Dispenser_2_Nozle_2)) +
        (parseFloat(inputData.Closing_Reading_HSD_Dispenser_3_Nozle_1) -
          parseFloat(previousdata.Closing_Reading_HSD_Dispenser_3_Nozle_1)) +
        (parseFloat(inputData.Closing_Reading_HSD_Dispenser_3_Nozle_2) -
          parseFloat(previousdata.Closing_Reading_HSD_Dispenser_3_Nozle_2)) -
        (parseFloat(inputData.Testing_HSD_Dispenser_1_Nozle_1) +
          parseFloat(inputData.Testing_HSD_Dispenser_1_Nozle_2) +
          parseFloat(inputData.Testing_HSD_Dispenser_2_Nozle_1) +
          parseFloat(inputData.Testing_HSD_Dispenser_2_Nozle_2) +
          parseFloat(inputData.Testing_HSD_Dispenser_3_Nozle_1) +
          parseFloat(inputData.Testing_HSD_Dispenser_2_Nozle_2))
      ).toFixed(4),
      previous: previousdata._id,
    };
  }
  // coS
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    ...inputData,
    Date: new Date(inputData.Date),
    ...calculations,
    next: '',
    Volume_in_MS: calVolofPetrol(inputData.MS_DIP).toFixed(0),
    Volume_in_HSD_DIP1: calVolofDiesel(inputData.HSD_DIP1).toFixed(0),
    Volume_in_HSD_DIP2: calVolofDiesel(inputData.HSD_DIP2).toFixed(0),
    ABS_Volume_in_MS: calVolofPetrol(inputData.MS_DIP),
    ABS_Volume_in_HSD_DIP1: calVolofDiesel(inputData.HSD_DIP1),
    ABS_Volume_in_HSD_DIP2: calVolofDiesel(inputData.HSD_DIP2),
  };
};
export default handler;
