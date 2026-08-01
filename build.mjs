import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, 'dist');
const client = join(output, 'client');
const server = join(output, 'server');

async function copyTree(source, destination) {
    await mkdir(destination, { recursive: true });
    const items = await readdir(source, { withFileTypes: true });
    for (const item of items) {
        const from = join(source, item.name);
        const to = join(destination, item.name);
        if (item.isDirectory()) await copyTree(from, to);
        if (item.isFile()) await copyFile(from, to);
    }
}

await rm(output, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
for (const entry of entries) {
    if (entry.isFile() && /\.(html|css|js|png|jpe?g)$/i.test(entry.name)) {
        await copyFile(join(root, entry.name), join(client, entry.name));
    }
}

await mkdir(join(client, 'templates'), { recursive: true });
for (const asset of ['logo.jpeg', 'jonathan.jpeg', 'capa_contos_vol1-site.jpg']) {
    await copyFile(join(root, 'templates', asset), join(client, 'templates', asset));
}
await copyFile(join(root, 'worker', 'index.js'), join(server, 'index.js'));
await copyTree(join(root, '.openai'), join(output, '.openai'));

process.stdout.write('Entrelinhas pronto para publicação.\n');
