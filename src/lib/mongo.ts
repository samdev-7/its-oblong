import { MongoClient } from 'mongodb';

import { MONGODB_URI, DATABASE } from '$env/static/private';

export const client = new MongoClient(MONGODB_URI);
export const database = client.db(DATABASE);