'use strict'
const merge = require('webpack-merge')
const devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  VUE_APP_API_KEY: '"AIzaSyCpGpFoqXPWS6V3yG1GLMLRbuvyf14vwWQ"',
  VUE_APP_AUTH_DOMAIN: '"startfirebase-35cbd.firebaseapp.com"',
  VUE_APP_BASE_URL: '"https://startfirebase-35cbd.firebaseio.com"',
  VUE_APP_PROJECT_ID: '"startfirebase-35cbd"',
  VUE_APP_STORAGE_BUCKET: '"startfirebase-35cbd.appspot.com"',
  VUE_APP_MESSAGING_SENDER_ID: '"57225796888"',
  VUE_APP_APP_ID: '"1:57225796888:web:0c53fe2f52b263116bd26d"',
  VUE_APP_MEASURMENT_ID: '"G-6G76HSQ6G2"'
})
