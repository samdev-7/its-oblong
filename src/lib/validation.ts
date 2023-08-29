import validator from 'validator';

const blocked_hosts = [
    'its.obl.ong',
    'its-oblong.vercel.app',
    'its-oblong.netlify.app'
]

export function validate_url(url: string): boolean {
    const validURL = validator.isURL(
        url,
        {
            protocols: ['http', 'https']
        }
    );

    if (!validURL) {
        return false;
    }

    if (blocked_hosts.includes(new URL((url.startsWith('http://') || url.startsWith('https://')) ? url : 'https://' + url).host)) {
        return false;
    }

    return true
}


