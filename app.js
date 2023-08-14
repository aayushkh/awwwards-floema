// import 'dotenv/config.js';
require('dotenv').config();

const fetch = require('node-fetch');
const path = require('path');
const express = require('express');
const errorHandler = require('errorhandler');

const app = express();
const port = process.env.PORT || 8005;

app.use(errorHandler());

const prismic = require('@prismicio/client');
// const prismicHelpers = require('@prismicio/helpers');
const UAParser = require('ua-parser-js');

const prismicEndpoint = process.env.PRISMIC_ENDPOINT;
const accessToken = process.env.PRISMIC_ACCESS_TOKEN;

// Set pug as templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// The `routes` property is your route resolver. It defines how you will
// structure URLs in your project. Update the types to match the Custom
// Types in your project, and edit the paths to match the routing in your
// project.
// const routes = [
//   {
//     type: 'page',
//     path: '/',
//   },
// ];

// Initialize the prismic.io api
const initAPI = req => {
  return prismic.createClient(prismicEndpoint, {
    accessToken,
    req,
    fetch,
  });
};

// Prismic Link Resolver
// https://prismic.io/docs/route-resolver#link-resolver
const handleLinkResolver = doc => {
  // if (doc.type === 'product') {
  //   return `/detail/${doc.uid}`
  // }
  // if (doc.type === 'collections') {
  //   return '/collections'
  // }
  // if (doc.type === 'about') {
  //   return '/about'
  // }
  // Default to homepage
  return '/';
};

// Add a middleware function that runs on every route. It will inject
// the prismic context to the locals so that we can access these in
// our templates
app.use((req, res, next) => {
  const ua = UAParser(req.headers['user-agent']);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === 'mobile';
  res.locals.isTablet = ua.device.type === 'tablet';

  res.locals.ctx = {
    prismic,
    endpoint: prismicEndpoint,
    linkResolver: handleLinkResolver,
  };
  // res.locals.PrismicHelpers = prismicHelpers;

  next();
});

const handleRequest = async api => {
  // const navigation = await api.getSingle('navigation');
  const preloader = await api.getSingle('preloader');

  return {
    // navigation,
    preloader,
  };
}

app.get('/', async (req, res) => {
  res.render('pages/home');
});

app.get('/about', async (req, res) => {
  const api = await initAPI(req);
  const defaults = await handleRequest(api);
  const about = await api.getSingle('about');
  res.render('pages/about', {
    ...defaults,
    about,
  });
});

app.get('/collection', (req, res) => {
  res.render('pages/collection');
});

app.get('/detail/:uid', async (req, res) => {
  const api = await initAPI(req);
  const defaults = await handleRequest(api);
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title',
  });
  console.log('product', req.params.uid, product);
  res.render('pages/detail', {
    ...defaults,
    product,
  });
});

// Listen to application port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
