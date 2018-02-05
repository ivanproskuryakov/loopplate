// see: https://github.com/shipitjs/shipit-deploy#workflow-tasks

let request = require('request');
let pack = require('./package.json');

const slackWebhookURL = 'https://hooks.slack.com/services/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';
const dir = '/var/www/';
const currentPath = dir + 'current';


module.exports = function (shipit) {
  require('shipit-deploy')(shipit);
  require('shipit-npm')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: dir,
      repositoryUrl: 'https://github.com/ivanproskuryakov/loopplate',
      ignores: ['.git'],
      keepReleases: 2,
      shallowClone: true
    },
    staging: {
      servers: 'root@staging.loopplate.com',
      branch: 'staging'
    },
    production: {
      servers: 'root@loopplate.com',
      branch: 'master'
    }
  });

  // On deployed event
  // ----------------------------------------------------------------
  shipit.on('deployed', function () {
    shipit.start('post-deployed');
  });

  shipit.task('post-deployed', [
    'fix-sass-error',
    'bower',
    'build',
    'pm2-stop',
    'pm2-start',
    'sitemap',
    'slack'
  ]);

  shipit.blTask('fix-sass-error', function () {
    // Error: Cannot find module 'node-sass'
    // http://stackoverflow.com/a/32593065/2235085

    return shipit.remote('cd ' + shipit.releasePath + ' && npm rebuild node-sass');
  });

  shipit.blTask('bower', function () {
    return shipit.remote('cd ' + currentPath + ' && bower install --allow-root');
  });

  shipit.blTask('build', function () {
    return shipit.remote('cd ' + currentPath + ' && ' + runNodeCommand('gulp app:build'));
  });

  shipit.blTask('pm2-stop', function () {
    return shipit.remote('cd ' + currentPath + ' && pm2 delete all');
  });

  shipit.blTask('pm2-start', function () {
    return shipit.remote('cd ' + currentPath + ' && ' + runNodeCommand('pm2 start pm2.json'));
  });

  // Slack
  // ----------------------------------------------------------------
  shipit.blTask('slack', function (cb) {
    request({
        method: 'POST',
        uri: slackWebhookURL,
        json: true,
        body: {
          username: 'Shipit',
          text: `${pack.name} v${pack.version} - Deployed to ${shipit.environment}`
        }
      },
      function (error, response, body) {
        if (error) {
          return console.error('upload failed:', error);
        }
        console.log('Upload successful!  Server responded with:', body);
        return cb();
      });
  });

  shipit.task('sitemap', function () {
    return shipit.remote('cd ' + currentPath + ' && ' + runNodeCommand('node build/command/sitemap.js'));
  });

  // Extras
  // ----------------------------------------------------------------
  shipit.task('test', function () {
    return shipit.remote('cd ' + currentPath + ' && npm test');
  });

  shipit.task('cleanup', function () {
    return shipit.remote('cd ' + currentPath + ' && ' + runNodeCommand('gulp deploy:cleanup'));
  });

  // Helpers
  // ----------------------------------------------------------------
  /**
   * rund's node command with NODE_ENV set from shipit's environment
   * @param {string} cmd command to run
   * @returns {string} command with NODE_ENV set
   */
  function runNodeCommand(cmd) {
    'use strict';
    return `NODE_ENV=${shipit.environment} ${cmd} `;
  }

};
