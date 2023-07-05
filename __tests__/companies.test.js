process.env.NODE_ENV = "test";
const request = require('supertest');
const app = require('../app');
let db = require('../db');

