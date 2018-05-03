'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: process.env.NODE_ENV_DEV,

  FIREBASE_APIKEY: `'${process.env.FIREBASE_APIKEY}'`,
  FIREBASE_AUTHDOMAIN: `'${process.env.FIREBASE_AUTHDOMAIN}'`,
  FIREBASE_DATABASEURL: `'${process.env.FIREBASE_DATABASEURL}'`,
  FIREBASE_PROJECTID: `'${process.env.FIREBASE_PROJECTID}'`,
  FIREBASE_STORAGEBUCKET: `'${process.env.FIREBASE_STORAGEBUCKET}'`,
  FIREBASE_MESSAGINGSENDERID: `'${process.env.FIREBASE_MESSAGINGSENDERID}'`,
  FIREBASE_FUNCTIONSURL: `'${process.env.FIREBASE_FUNCTIONSURL}'`,
  GOOGLE_ANALYTICS_UA: `'${process.env.GOOGLE_ANALYTICS_UA}'`
})
