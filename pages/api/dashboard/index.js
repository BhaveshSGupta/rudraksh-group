import nextConnect from 'next-connect';
import middleware from '../../../middlewares/middleware';

const handler = nextConnect();
handler.use(middleware);

handler.get(async (req, res) => {
  if (!req.user) {
    req.status(401).end();
    return;
  }
  try {
    // const data = await req.db.collection('dailydata')
    //   .find({}, { sort: { createdAt: -1 }, limit: 10 })

    const data = await req.db.collection('dailydata').find({}).sort({ createdAt: -1 }).toArray();
    // console.log({ data })
    // console.log({ posts })
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send();
  }
});

export default handler;

// handler.get(async (req, res) => {

//   // Pagination: Fetch posts from before the input date or fetch from newest
//   const from = req.query.from ? new Date(req.query.from) : new Date();
//   const creatorId = req.query.by;
//   const posts = await req.db
//     .collection('posts')
//     .find({
//       createdAt: {
//         $lte: from,
//       },
//       ...(creatorId && { creatorId }),
//     })
//     .sort({ createdAt: -1 })
//     .limit(parseInt(req.query.limit, 10) || 10)
//     .toArray();
//   res.send({ posts });
// });

// handler.post(async (req, res) => {
//   if (!req.user) {
//     return res.status(401).send('unauthenticated');
//   }

//   const { content } = req.body;

//   if (!content) return res.status(400).send('You must write something');

//   const post = {
//     _id: nanoid(),
//     content,
//     createdAt: new Date(),
//     creatorId: req.user._id,
//   };

//   await req.db.collection('posts').insertOne(post);
//   return res.send(post);
// });
