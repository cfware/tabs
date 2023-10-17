import path from 'node:path';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import t from 'libtap';
import {testBrowser, grabImage} from '@cfware/tap-selenium-manager';
import {FastifyTestHelper, globToCustomGetters} from '@cfware/fastify-test-helper';

const cwd = fileURLToPath(new URL('.', import.meta.url));

const imageFile = fullname => path.join(
    cwd,
    'tap-snapshots',
    fullname.replaceAll(/[^\w.-]+/gu, '-')
);

const processImage = async (t, element, imageID) => {
    const image64 = await grabImage(element);
    t.matchSnapshot(image64, imageID);
    await writeFile(imageFile(`${t.fullname}-${imageID}.png`), image64);
};

async function testFunction(t, selenium) {
    const element = await selenium.findElement({id: 'test'});

    await processImage(t, element, 'initial');
    const actions = selenium.actions();

    await actions.move({origin: await selenium.findElement({id: 'tab3'})}).perform();
    await processImage(t, element, 'hover3');

    await actions.click().perform();
    await processImage(t, element, 'hover3-clicked');

    await actions.move({origin: await selenium.findElement({id: 'tab2'})}).perform();
    await processImage(t, element, 'hover2');

    await actions.click().perform();
    await processImage(t, element, 'hover2-clicked');
}

const pages = {
    'tabs.html': testFunction,
    'tabs-preset.html': testFunction
};

const daemon = new FastifyTestHelper({
    customGetters: globToCustomGetters('tabs.js', {cwd})
});

t.test('browsers', async t => {
    await testBrowser(t, 'firefox', daemon, pages);
    await testBrowser(t, 'chrome', daemon, pages);
});
