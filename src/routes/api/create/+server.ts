import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validate_url } from '$lib/validation';
import BadWordsFilter from 'bad-words';
import { database } from '$lib/mongo';

import { TURNSTILE_INVISIBLE_SECRET, TURNSTILE_VISIBLE_SECRET } from '$env/static/private';

export type LinkData = {
    url: string,
    expiry: "10m" | "1h" | "1d" | "1M" | "1y" | "10y",
    turnstile_token: string,
    turnstile_type: "invisible" | "visible"
}

const expiry = {
    "10m": 10,
    "1h": 60,
    "1d": 60 * 24,
    "1M": 60 * 24 * 30,
    "1y": 60 * 24 * 365,
    "10y": 60 * 24 * 365 * 10
}

const path_length = {
    "10m": 2,
    "1h": 2,
    "1d": 2,
    "1M": 5,
    "1y": 5,
    "10y": 5
}

const allowed_chars = "abcdefghjkmnpqrstuvwxyABCDEFGHJKMNPQRSTUVWXY234578";
const max_attempts = 20;

const blacklisted_paths = ['api', 'noscript', 'terms', 'privacy', 'legal', 'dash', 'dashboard', 'admin', 'favicon', 'assets']

const collection = database.collection("redirects");

const filter = new BadWordsFilter();

async function generate_path(length: number, ip = 'NA', attempts = 0): Promise<string> {
    let path = "";
    for (let i = 0; i < length; i++) {
        path += allowed_chars[Math.floor(Math.random() * allowed_chars.length)];
    }

    console.log(`[${ip}] Generated path: ${path}`)

    if (blacklisted_paths.includes(path)) {
        console.log(`[${ip}] WARN: Path is blacklisted, regenerating path`)
        return await generate_path(length, ip, attempts);
    }

    if (filter.isProfane(path)) {
        console.log(`[${ip}] WARN: Profanity detected, regenerating path`)
        return await generate_path(length, ip, attempts);
    }

    const existingPath = await collection.findOne({ path });
    if (existingPath) {
        console.log(`[${ip}] WARN: Path already exists, regenerating path`)
        if (attempts >= max_attempts) {
            throw new Error(`[${ip}] Failed to generate unique path after ${max_attempts} attempts`);
        }
        return await generate_path(length, ip, attempts + 1);
    }

    return path
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validation(data: any, ip = "NA"): Promise<boolean> {
    if (!data.url || !data.expiry || !data.turnstile_token || !data.turnstile_type) {
        console.log(`[${ip}] ERROR: Missing fields`)
        return false;
    }

    if (Object.keys(data).length !== 4) {
        console.log(`[${ip}] ERROR: Extra fields`)
        return false;
    }

    if (typeof data.url !== "string" || typeof data.expiry !== "string" || typeof data.turnstile_token !== "string") {
        console.log(`[${ip}] ERROR: Invalid types`)
        return false;
    }

    const typed_data = data as LinkData;

    if (!expiry[typed_data.expiry]) {
        console.log(`[${ip}] ERROR: Invalid expiry`)
        return false;
    }

    if (!validate_url(typed_data.url)) {
        console.log(`[${ip}] ERROR: Invalid url`)
        return false;
    }

    if (!["invisible", "visible"].includes(typed_data.turnstile_type)) {
        console.log(`[${ip}] ERROR: Invalid turnstile type`)
        return false;
    }

    const turnstile_response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                response: data.turnstile_token,
                secret: data.turnstile_type === "invisible" ? TURNSTILE_INVISIBLE_SECRET : TURNSTILE_VISIBLE_SECRET
            }),
        },
    );
    const turnstile_data = await turnstile_response.json();
    if (!turnstile_data.success) {
        console.log(`[${ip}] ERROR: Invalid turnstile token`)
        return false;
    }

    return true;
}

export const POST: RequestHandler = async (event) => {
    const request = event.request;
    const ip = event.getClientAddress();

    console.log(`[${ip}] Received request`);

    const raw_data = await request.json();
    console.log(`[${ip}] Received data: ${JSON.stringify(raw_data)}`)

    if (!await validation(raw_data, ip)) {
        throw error(400);
    }
    console.log(`[${ip}] Data validated`)

    const data = raw_data as LinkData;

    const path = await generate_path(path_length[data.expiry], ip);
    console.log(`[${ip}] Path generated: ${path}`)

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + expiry[data.expiry]);

    const document = {
        path,
        url: data.url.startsWith("http://") || data.url.startsWith("https://") ? data.url : `https://${data.url}`,
        creation: new Date(),
        expiry: expires,
        created_by: event.getClientAddress()
    }
    console.log(`[${ip}] Inserting into database: ${JSON.stringify(document)}`)
    await collection.insertOne(document);

    const response = {
        path,
        expiry: expires
    }

    return json(response, { status: 200 })
};