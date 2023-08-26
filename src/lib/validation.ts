import validator from 'validator';

export function validate_url(url: string): boolean {
    return validator.isURL(
        url,
        {
            protocols: ['http', 'https']
        }
    );
}


