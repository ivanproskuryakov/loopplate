import {Cleanup} from 'app/db/cleanup';

new Cleanup()
  .start()
  .then(() => {
    console.log('finished');
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit();
  });
