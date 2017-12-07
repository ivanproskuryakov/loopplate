import * as chalk from 'chalk';
import * as App from 'app/server/server';

App.models.Cache.destroyAll({})
  .then(res => console.log(chalk.green(`finished cleaning Cache: ${res.count}`)))
  .catch(err => console.log(chalk.red('Error: ' + err.message)))
  .then(() => process.exit());
