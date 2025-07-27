import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as Models from '../models/index.js';
import { authenticate, COOKIE_PASSWORD, sessionStore } from './config.js';
import { dark, light, noSidebar } from '@adminjs/themes';

// Register Mongoose adapter
AdminJS.registerAdapter(AdminJSMongoose);

// Create AdminJS instance
export const admin = new AdminJS({
  rootPath: '/admin',
  resources: [
    {
      resource: Models.Customer,
      options: {
        listProperties: ['phone', 'role', 'isActivated'],
        filterProperties: ['phone', 'role'],
      },
    },
    {
      resource: Models.DeliveryPartner,
      options: {
        listProperties: ['email', 'role', 'isActivated'],
        filterProperties: ['email', 'role'],
      },
    },
    {
      resource: Models.Admin,
      options: {
        listProperties: ['email', 'role', 'isActivated'],
        filterProperties: ['email', 'role'],
      },
    },
    { resource: Models.Branch },
    { resource: Models.Product },
    { resource: Models.Category },
    { resource: Models.Order },
    { resource: Models.Counter },
  ],
  branding: {
    companyName: 'Grocery Delivery App',
    withMadeWithLove: false,
  },
  defaultTheme: dark.id,
  availableThemes: [dark, light, noSidebar],
});

// Build authenticated AdminJS router
export const buildAdminRouter = async (app) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: 'adminjs',
    },
    app,
    {
      store: sessionStore,
      saveUninitialized: false,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 4, // 4 hours
      },
    }
  );
};
