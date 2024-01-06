import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
    const placeholder_links = [
        'https://google.com',
        'https://google.com/doodles/30th-anniversary-of-the-world-wide-web',
        'https://example.com/my-page',
        'https://github.com/SamDev-7',
        'https://takeb1nzyto.space/',
        'https://youtube.com/watch?v=XI7Cxdj2pAQ&t=4',
        'https://snake.googlemaps.com/',
        'https://obl.ong/'
    ];

    return {
        link_placeholder: placeholder_links[Math.floor(Math.random() * placeholder_links.length)]
    }

};