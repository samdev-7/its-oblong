import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { database } from '$lib/mongo';

const collection = database.collection("redirects");

export const GET: RequestHandler = async ({ getClientAddress, params }) => {
    const ip = getClientAddress();
    const slug = params.slug;

    const document = await collection.findOne({ path: slug });
    if (!document) {
        console.log(`[${ip}] ERROR: No document found with path [${slug}]`)
        throw error(404, 'Not found');
    }

    if (document.expiry < Date.now()) {
        console.log(`[${ip}] ERROR: Document with path [${slug}] has expired`)
        throw error(404, 'Not found');
    }

    console.log(`[${ip}] Redirecting to [${document.url}]`)
    throw redirect(302, document.url);
};