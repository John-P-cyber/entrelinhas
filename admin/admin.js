(function () {
    'use strict';

    const OWNER = 'John-P-cyber';
    const REPO = 'entrelinhas';
    const BRANCH = 'main';
    const CONTENT_PATH = 'content/site-content.json';
    const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;
    const PUBLIC_BASE = location.hostname.endsWith('github.io') ? '/entrelinhas/' : '/';
    const PUBLIC_CONTENT_URL = new URL(CONTENT_PATH, location.origin + PUBLIC_BASE).href;

    const loginPanel = document.querySelector('[data-login-panel]');
    const loginForm = document.querySelector('[data-login-form]');
    const tokenInput = document.querySelector('#github-token');
    const workspace = document.querySelector('[data-workspace]');
    const panels = document.querySelector('[data-panels]');
    const tabs = document.querySelector('[data-tabs]');
    const message = document.querySelector('[data-message]');
    const saveState = document.querySelector('[data-save-state]');
    const adminUser = document.querySelector('[data-admin-user]');
    const saveButton = document.querySelector('[data-save]');
    const logoutButton = document.querySelector('[data-logout]');

    let token = '';
    let contentSha = '';
    let content = null;
    let activeTab = 'geral';
    const pendingUploads = new Map();

    const fieldSets = {
        settings: [
            ['siteTitle', 'Nome do site', 'text'],
            ['siteTagline', 'Assinatura do site', 'text'],
            ['wattpadUrl', 'Endereço do Wattpad', 'url'],
            ['instagramUrl', 'Endereço do Instagram', 'url']
        ],
        home: [
            ['eyebrow', 'Identificação acima do título', 'text'],
            ['headlineBefore', 'Primeira parte do título', 'text'],
            ['headlineEmphasis', 'Palavra destacada', 'text'],
            ['headlineAfter', 'Final do título', 'text'],
            ['intro', 'Apresentação da página inicial', 'textarea']
        ],
        author: [
            ['pageTitle', 'Título da página Sobre', 'text'],
            ['lead', 'Apresentação curta', 'textarea'],
            ['homeSummary', 'Resumo exibido na página inicial', 'textarea'],
            ['manifestoStructure', 'Primeiro parágrafo do manifesto', 'textarea'],
            ['manifestoArchive', 'Segundo parágrafo do manifesto', 'textarea']
        ],
        works: [
            ['title', 'Título', 'text'],
            ['id', 'Identificador', 'slug'],
            ['status', 'Estado da obra', 'text'],
            ['summary', 'Sinopse ou apresentação', 'textarea'],
            ['featuredSummary', 'Resumo da obra em destaque', 'textarea'],
            ['genre', 'Gênero', 'text'],
            ['volume', 'Volume', 'text'],
            ['availabilityLabel', 'Disponibilidade', 'text'],
            ['cover', 'Capa', 'image'],
            ['featureImage', 'Imagem do destaque na página inicial', 'image'],
            ['coverAlt', 'Descrição acessível da capa', 'text'],
            ['readUrl', 'Link de leitura no site', 'text'],
            ['wattpadUrl', 'Link no Wattpad', 'url'],
            ['universeUrl', 'Link do universo', 'text'],
            ['available', 'Leitura disponível', 'boolean'],
            ['featured', 'Obra em destaque', 'boolean'],
            ['noticeTitle', 'Título do aviso', 'text'],
            ['noticeText', 'Texto do aviso', 'textarea']
        ],
        universes: [
            ['title', 'Nome do universo', 'text'],
            ['id', 'Identificador', 'slug'],
            ['kicker', 'Número ou categoria do arquivo', 'text'],
            ['status', 'Estado do universo', 'text'],
            ['summary', 'Apresentação', 'textarea'],
            ['genre', 'Gênero', 'text'],
            ['spoilers', 'Informação sobre spoilers', 'text'],
            ['cover', 'Capa', 'image'],
            ['coverAlt', 'Descrição acessível da capa', 'text'],
            ['available', 'Universo disponível', 'boolean'],
            ['readUrl', 'Link de leitura', 'text'],
            ['workUrl', 'Link da obra', 'text']
        ],
        characters: [
            ['name', 'Nome', 'text'],
            ['id', 'Identificador', 'slug'],
            ['group', 'Grupo', 'text'],
            ['role', 'Papel', 'text'],
            ['description', 'Descrição', 'textarea'],
            ['tags', 'Marcadores separados por vírgula', 'tags'],
            ['keywords', 'Palavras para a busca', 'text'],
            ['image', 'Retrato', 'image'],
            ['imageAlt', 'Descrição acessível do retrato', 'text'],
            ['initials', 'Iniciais quando não houver imagem', 'text']
        ],
        notes: [
            ['title', 'Título', 'text'],
            ['id', 'Identificador', 'slug'],
            ['category', 'Categoria', 'text'],
            ['summary', 'Resumo', 'textarea'],
            ['state', 'Estado ou identificação', 'text'],
            ['featured', 'Nota em destaque', 'boolean']
        ]
    };

    const emptyItems = {
        works: {
            id: 'nova-obra', title: 'Nova obra', status: 'Em desenvolvimento', summary: '',
            featuredSummary: '', genre: '', volume: '', availabilityLabel: 'Em breve',
            cover: '', featureImage: '', coverAlt: '',
            readUrl: '', wattpadUrl: '', universeUrl: '', available: false, featured: false,
            noticeTitle: '', noticeText: ''
        },
        universes: {
            id: 'novo-universo', title: 'Novo universo', kicker: 'Novo arquivo',
            status: 'Em desenvolvimento', summary: '', genre: '', spoilers: 'Sem spoilers',
            cover: '', coverAlt: '', available: false, readUrl: '', workUrl: ''
        },
        characters: {
            id: 'novo-personagem', name: 'Novo personagem', group: 'Outros',
            role: '', description: '', tags: [], keywords: '', image: '', imageAlt: '', initials: '?'
        },
        notes: {
            id: 'nova-nota', category: 'Caderno', title: 'Nova nota',
            summary: '', state: 'Em preparação', featured: false
        }
    };

    function setMessage(text, type) {
        message.textContent = text || '';
        message.className = 'admin-message' + (type ? ` is-${type}` : '');
    }

    function apiHeaders() {
        return {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    function decodeBase64(value) {
        const binary = atob(value.replace(/\n/g, ''));
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    function encodeBase64(value) {
        const bytes = new TextEncoder().encode(value);
        let binary = '';
        const chunkSize = 0x8000;
        for (let index = 0; index < bytes.length; index += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
        }
        return btoa(binary);
    }

    function slugify(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function renderField(target, definition, scope) {
        const [key, label, type] = definition;
        const wrapper = el('div', 'admin-field' + (type === 'textarea' ? ' admin-field-wide' : ''));
        const fieldId = `${scope}-${key}`;
        const labelNode = el('label', '', label);
        labelNode.htmlFor = fieldId;
        wrapper.appendChild(labelNode);

        let input;
        if (type === 'textarea') {
            input = document.createElement('textarea');
            input.value = target[key] || '';
        } else if (type === 'boolean') {
            input = document.createElement('select');
            [['true', 'Sim'], ['false', 'Não']].forEach(([value, title]) => {
                const option = new Option(title, value, false, Boolean(target[key]) === (value === 'true'));
                input.add(option);
            });
        } else {
            input = document.createElement('input');
            input.type = type === 'url' ? 'url' : 'text';
            input.value = type === 'tags' ? (target[key] || []).join(', ') : (target[key] || '');
            if (type === 'slug') input.placeholder = 'gerado-pelo-titulo';
        }
        input.id = fieldId;
        input.addEventListener('input', () => {
            if (type === 'boolean') target[key] = input.value === 'true';
            else if (type === 'tags') target[key] = input.value.split(',').map((tag) => tag.trim()).filter(Boolean);
            else if (type === 'slug') target[key] = slugify(input.value);
            else target[key] = input.value;
            saveState.textContent = 'Alterações ainda não publicadas';
        });

        if (type === 'image') {
            const controls = el('div', 'admin-file-control');
            controls.appendChild(input);
            const file = document.createElement('input');
            file.type = 'file';
            file.accept = 'image/png,image/jpeg,image/webp';
            file.setAttribute('aria-label', `Selecionar arquivo para ${label}`);
            file.addEventListener('change', () => {
                if (!file.files || !file.files[0]) return;
                pendingUploads.set(`${scope}-${key}`, { target, key, file: file.files[0] });
                saveState.textContent = 'Nova imagem aguardando publicação';
            });
            controls.appendChild(file);
            wrapper.appendChild(controls);
            wrapper.appendChild(el('small', '', 'Você pode informar um caminho existente ou escolher uma nova imagem.'));
        } else {
            wrapper.appendChild(input);
        }
        return wrapper;
    }

    function renderObjectFields(target, definitions, scope) {
        const fields = el('div', 'admin-fields');
        definitions.forEach((definition) => fields.appendChild(renderField(target, definition, scope)));
        return fields;
    }

    function renderCollection(name, title, description) {
        const section = el('section', 'admin-panel');
        section.dataset.panel = name;
        section.hidden = activeTab !== name;

        const heading = el('div', 'admin-section-heading');
        const headingText = el('div');
        headingText.appendChild(el('span', 'kicker', title));
        headingText.appendChild(el('h2', '', `Gerenciar ${title.toLowerCase()}.`));
        heading.appendChild(headingText);
        heading.appendChild(el('p', '', description));
        section.appendChild(heading);

        const list = el('div', 'admin-editor-list');
        (content[name] || []).forEach((item, index) => {
            const card = el('article', 'admin-editor-card');
            const cardHeader = el('div', 'admin-editor-card-header');
            cardHeader.appendChild(el('strong', '', item.title || item.name || `${title} ${index + 1}`));
            const remove = el('button', 'admin-remove', 'Remover');
            remove.type = 'button';
            remove.addEventListener('click', () => {
                if (!confirm(`Remover “${item.title || item.name || title}” do site?`)) return;
                content[name].splice(index, 1);
                for (const [key, upload] of pendingUploads) {
                    if (upload.target === item) pendingUploads.delete(key);
                }
                saveState.textContent = 'Alterações ainda não publicadas';
                renderPanels();
            });
            cardHeader.appendChild(remove);
            card.appendChild(cardHeader);
            card.appendChild(renderObjectFields(item, fieldSets[name], `${name}-${index}`));
            list.appendChild(card);
        });
        section.appendChild(list);

        const add = el('button', 'button button-secondary admin-add', `Adicionar ${title.replace(/s$/, '').toLowerCase()}`);
        add.type = 'button';
        add.addEventListener('click', () => {
            content[name].push(structuredClone(emptyItems[name]));
            saveState.textContent = 'Alterações ainda não publicadas';
            renderPanels();
        });
        section.appendChild(add);
        return section;
    }

    function renderSimplePanel(name, title, description, objects) {
        const section = el('section', 'admin-panel');
        section.dataset.panel = name;
        section.hidden = activeTab !== name;
        const heading = el('div', 'admin-section-heading');
        const headingText = el('div');
        headingText.appendChild(el('span', 'kicker', title));
        headingText.appendChild(el('h2', '', description));
        heading.appendChild(headingText);
        section.appendChild(heading);

        objects.forEach(({ key, title: objectTitle }) => {
            const card = el('article', 'admin-editor-card');
            const cardHeader = el('div', 'admin-editor-card-header');
            cardHeader.appendChild(el('strong', '', objectTitle));
            card.appendChild(cardHeader);
            card.appendChild(renderObjectFields(content[key], fieldSets[key], key));
            section.appendChild(card);
        });
        return section;
    }

    function renderPanels() {
        panels.replaceChildren();
        panels.appendChild(renderSimplePanel('geral', 'Informações gerais', 'Identidade e página inicial.', [
            { key: 'settings', title: 'Identidade e redes' },
            { key: 'home', title: 'Página inicial' }
        ]));
        panels.appendChild(renderCollection('works', 'Obras', 'Adicione projetos e atualize capas, estados, sinopses e links.'));
        panels.lastChild.dataset.panel = 'obras';
        panels.lastChild.hidden = activeTab !== 'obras';
        panels.appendChild(renderCollection('universes', 'Universos', 'Controle a apresentação e a disponibilidade de cada universo.'));
        panels.lastChild.dataset.panel = 'universos';
        panels.lastChild.hidden = activeTab !== 'universos';
        panels.appendChild(renderCollection('characters', 'Personagens', 'Cadastre personagens, grupos, descrições e marcadores.'));
        panels.lastChild.dataset.panel = 'personagens';
        panels.lastChild.hidden = activeTab !== 'personagens';
        panels.appendChild(renderCollection('notes', 'Caderno', 'Atualize as notas editoriais e seus estados de publicação.'));
        panels.lastChild.dataset.panel = 'caderno';
        panels.lastChild.hidden = activeTab !== 'caderno';
        panels.appendChild(renderSimplePanel('autor', 'Sobre o autor', 'Apresentação e manifesto.', [
            { key: 'author', title: 'Textos do autor' }
        ]));
    }

    async function loadPublicContent() {
        const response = await fetch(`${PUBLIC_CONTENT_URL}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Não foi possível carregar o conteúdo público.');
        return response.json();
    }

    async function loadRepositoryContent() {
        const response = await fetch(`${API_ROOT}/contents/${CONTENT_PATH}?ref=${BRANCH}`, {
            headers: apiHeaders(),
            cache: 'no-store'
        });
        if (!response.ok) throw new Error('Não foi possível ler o conteúdo do repositório.');
        const payload = await response.json();
        contentSha = payload.sha;
        return JSON.parse(decodeBase64(payload.content));
    }

    async function uploadImage(upload) {
        const extensionMatch = upload.file.name.toLowerCase().match(/\.(png|jpe?g|webp)$/);
        const extension = extensionMatch ? extensionMatch[0].replace('.jpeg', '.jpg') : '.jpg';
        const identity = slugify(upload.target.id || upload.target.title || upload.target.name || 'imagem');
        const path = `templates/uploads/${identity}-${Date.now()}${extension}`;
        const bytes = new Uint8Array(await upload.file.arrayBuffer());
        let binary = '';
        const chunkSize = 0x8000;
        for (let index = 0; index < bytes.length; index += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
        }
        const response = await fetch(`${API_ROOT}/contents/${path}`, {
            method: 'PUT',
            headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Adicionar imagem de ${upload.target.title || upload.target.name || 'conteúdo'}`,
                content: btoa(binary),
                branch: BRANCH
            })
        });
        if (!response.ok) throw new Error(`Não foi possível enviar a imagem “${upload.file.name}”.`);
        upload.target[upload.key] = path;
    }

    async function publishContent() {
        saveButton.disabled = true;
        setMessage('Publicando suas alterações…');
        saveState.textContent = 'Publicação em andamento';
        try {
            for (const upload of pendingUploads.values()) {
                await uploadImage(upload);
            }
            pendingUploads.clear();
            const response = await fetch(`${API_ROOT}/contents/${CONTENT_PATH}`, {
                method: 'PUT',
                headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Atualizar conteúdo pelo painel do autor',
                    content: encodeBase64(JSON.stringify(content, null, 2) + '\n'),
                    sha: contentSha,
                    branch: BRANCH
                })
            });
            if (!response.ok) {
                const details = await response.json().catch(() => ({}));
                throw new Error(details.message || 'O GitHub recusou a publicação.');
            }
            const payload = await response.json();
            contentSha = payload.content.sha;
            renderPanels();
            saveState.textContent = 'Conteúdo publicado';
            setMessage('Alterações publicadas. O site será atualizado pelo GitHub Pages em alguns instantes.', 'success');
        } catch (error) {
            saveState.textContent = 'Falha na publicação';
            setMessage(error.message || 'Não foi possível publicar as alterações.', 'error');
        } finally {
            saveButton.disabled = false;
        }
    }

    async function login(event) {
        event.preventDefault();
        token = tokenInput.value.trim();
        if (!token) return;
        setMessage('Conferindo sua conta do GitHub…');
        const submit = loginForm.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: apiHeaders(),
                cache: 'no-store'
            });
            if (!response.ok) throw new Error('Credencial inválida ou expirada.');
            const user = await response.json();
            if (String(user.login).toLowerCase() !== OWNER.toLowerCase()) {
                throw new Error('Esta credencial não pertence ao autor autorizado.');
            }
            content = await loadRepositoryContent();
            adminUser.textContent = `${user.name || user.login} · @${user.login}`;
            tokenInput.value = '';
            loginPanel.hidden = true;
            workspace.hidden = false;
            renderPanels();
            setMessage('Painel liberado. Você já pode editar o conteúdo.', 'success');
        } catch (error) {
            token = '';
            setMessage(error.message || 'Não foi possível entrar no painel.', 'error');
        } finally {
            submit.disabled = false;
        }
    }

    function logout() {
        token = '';
        contentSha = '';
        pendingUploads.clear();
        workspace.hidden = true;
        loginPanel.hidden = false;
        tokenInput.value = '';
        tokenInput.focus();
        setMessage('Sessão encerrada. A credencial foi removida desta aba.');
    }

    tabs.addEventListener('click', (event) => {
        const button = event.target.closest('[data-tab]');
        if (!button) return;
        activeTab = button.dataset.tab;
        tabs.querySelectorAll('[data-tab]').forEach((tab) => {
            tab.setAttribute('aria-selected', String(tab === button));
        });
        panels.querySelectorAll('[data-panel]').forEach((panel) => {
            panel.hidden = panel.dataset.panel !== activeTab;
        });
    });

    loginForm.addEventListener('submit', login);
    saveButton.addEventListener('click', publishContent);
    logoutButton.addEventListener('click', logout);
    window.addEventListener('pagehide', () => {
        token = '';
    });

    loadPublicContent()
        .then((data) => {
            content = data;
            setMessage('Conteúdo público carregado. Conecte sua conta para editar e publicar.');
        })
        .catch((error) => setMessage(error.message, 'error'));
})();
