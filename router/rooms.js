const Router = require('koa-router');
const RoomDB = require('../mongodb/room')

const router = new Router({ prefix: "/rooms" });

const roomdb = new RoomDB();

router.get('/getRooms', async (ctx, next) => {
  const result = await roomdb.getRooms();

  ctx.body = {
    success: true,
    data: result
  }
});


module.exports = router;
