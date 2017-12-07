import {DataSources} from 'app/db/dataSources';

new DataSources()
  .update()
  .then(() => {
    console.log('finished');
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit();
  });
