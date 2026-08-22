(function () {
    'use strict';

    const normalize = (value) => (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const slugify = (value) => normalize(value)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const create = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const valueAt = (object, path) => path
        .split('.')
        .reduce((value, key) => value && value[key], object);

    function createLink(label, className, href, external) {
        const link = create('a', className, label);
        link.href = href;
        if (external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        return link;
    }

    function createFactList(values) {
        const facts = create('div', 'work-facts');
        values.filter(Boolean).forEach((value) => facts.appendChild(create('span', '', value)));
        return facts;
    }

    function createTags(values) {
        const tags = create('div', 'tag-list');
        (values || []).filter(Boolean).forEach((value) => tags.appendChild(create('span', 'tag', value)));
        return tags;
    }

    function bindGeneralContent(data) {
        document.querySelectorAll('[data-content]').forEach((node) => {
            const value = valueAt(data, node.dataset.content);
            if (value !== undefined && value !== null) node.textContent = value;
        });
        document.querySelectorAll('.brand-copy strong').forEach((node) => {
            node.textContent = data.settings.siteTitle;
        });
        document.querySelectorAll('.brand-copy small').forEach((node) => {
            node.textContent = data.settings.siteTagline;
        });
        document.querySelectorAll('a[href*="wattpad.com"]').forEach((link) => {
            link.href = data.settings.wattpadUrl;
        });
        document.querySelectorAll('a[href*="instagram.com"]').forEach((link) => {
            link.href = data.settings.instagramUrl;
        });
    }

    function renderHome(data) {
        const headline = document.querySelector('[data-home-headline]');
        if (headline) {
            headline.replaceChildren();
            headline.append(
                document.createTextNode(data.home.headlineBefore + ' '),
                create('em', '', data.home.headlineEmphasis),
                document.createTextNode(' ' + data.home.headlineAfter)
            );
        }

        const work = data.works.find((item) => item.featured) || data.works[0];
        if (!work) return;

        const heroObject = document.querySelector('[data-home-cover]');
        if (heroObject) {
            heroObject.setAttribute('aria-label', `Obra em destaque: ${work.title}`);
            const availability = heroObject.querySelector('.availability');
            const link = heroObject.querySelector('.feature-volume');
            const image = heroObject.querySelector('img');
            if (availability) availability.textContent = work.status;
            if (link) {
                link.href = work.readUrl || work.wattpadUrl || 'livro.html';
                link.setAttribute('aria-label', `Abrir ${work.title} — ${work.volume}`);
            }
            if (image) {
                image.src = work.cover;
                image.alt = work.coverAlt;
            }
        }

        const feature = document.querySelector('[data-feature-work]');
        if (feature) {
            const art = feature.querySelector('.feature-art img');
            if (art) {
                art.src = work.featureImage || work.cover;
                art.alt = `Imagem de destaque de ${work.title}`;
            }
            const copy = feature.querySelector('.feature-copy');
            if (copy) {
                copy.replaceChildren();
                copy.appendChild(create('span', 'kicker', work.availabilityLabel || work.status));
                copy.appendChild(create('h2', '', work.title));
                copy.appendChild(create('p', '', work.featuredSummary || work.summary));
                const facts = createFactList([work.genre, work.volume, work.status]);
                facts.setAttribute('aria-label', 'Informações da obra');
                copy.appendChild(facts);
                const buttons = create('div', 'button-row');
                if (work.readUrl) buttons.appendChild(createLink('Começar a ler →', 'button button-primary', work.readUrl, false));
                if (work.wattpadUrl) buttons.appendChild(createLink('Volume completo ↗', 'button button-secondary', work.wattpadUrl, true));
                if (work.universeUrl) buttons.appendChild(createLink('Explorar o universo', 'button button-secondary', work.universeUrl, false));
                copy.appendChild(buttons);
            }
        }
    }

    function renderWorks(data) {
        const container = document.querySelector('[data-render-works]');
        if (!container) return;
        const fragment = document.createDocumentFragment();

        data.works.forEach((work) => {
            const article = create('article', 'work-entry' + (work.available ? '' : ' work-entry-secret'));
            const cover = create('div', 'work-cover work-cover-art');
            const image = create('img');
            image.src = work.cover;
            image.alt = work.coverAlt || `Capa de ${work.title}`;
            image.loading = 'lazy';
            image.decoding = 'async';
            cover.appendChild(image);
            article.appendChild(cover);

            const details = create('div', 'work-details');
            details.appendChild(create('span', 'kicker', work.status));
            details.appendChild(create('h2', '', work.title));
            details.appendChild(create('p', '', work.summary));
            details.appendChild(createFactList([work.genre, work.volume, work.availabilityLabel]));
            if (work.noticeTitle || work.noticeText) {
                const notice = create('aside', 'work-universe-update');
                notice.setAttribute('aria-label', `Novidades sobre ${work.title}`);
                notice.appendChild(create('span', 'meta-label', work.noticeTitle || 'Novidades'));
                notice.appendChild(create('p', '', work.noticeText));
                if (data.settings.instagramUrl) notice.appendChild(createLink('Acompanhar no Instagram ↗', '', data.settings.instagramUrl, true));
                details.appendChild(notice);
            }
            article.appendChild(details);

            const actions = create('div', 'work-actions');
            if (work.available && work.readUrl) actions.appendChild(createLink('Ler no site →', 'button button-primary', work.readUrl, false));
            if (work.wattpadUrl) actions.appendChild(createLink('Ler no Wattpad ↗', 'button button-secondary', work.wattpadUrl, true));
            if (work.universeUrl) actions.appendChild(createLink('Ver universo', 'button button-secondary', work.universeUrl, false));
            if (!actions.childElementCount) {
                const disabled = create('span', 'button button-disabled', 'Leitura indisponível');
                disabled.setAttribute('aria-disabled', 'true');
                actions.appendChild(disabled);
            }
            article.appendChild(actions);
            fragment.appendChild(article);
        });

        const emptyShelf = create('div', 'empty-shelf');
        emptyShelf.appendChild(create('h3', '', 'Esta estante vai crescer.'));
        emptyShelf.appendChild(create('p', '', 'Novos contos, livros e experimentos narrativos poderão entrar aqui sem disputar espaço com o universo que começou tudo.'));
        fragment.appendChild(emptyShelf);
        container.replaceChildren(fragment);

        const meta = document.querySelectorAll('.page-hero .page-meta span');
        const complete = data.works.filter((work) => /completo/i.test(work.status)).length;
        const developing = data.works.length - complete;
        if (meta[0]) {
            meta[0].replaceChildren();
            const dot = create('i', 'status-dot');
            dot.setAttribute('aria-hidden', 'true');
            meta[0].append(dot, document.createTextNode(` ${data.works.length} obras no catálogo`));
        }
        if (meta[1]) meta[1].textContent = `${complete} ${complete === 1 ? 'volume completo' : 'volumes completos'}`;
        if (meta[2]) meta[2].textContent = `${developing} ${developing === 1 ? 'projeto em desenvolvimento' : 'projetos em desenvolvimento'}`;
    }

    function renderUniverseHero(data) {
        const universe = data.universes.find((item) => item.available) || data.universes[0];
        const hero = document.querySelector('[data-universe-hero]');
        if (!hero || !universe) return;
        const kicker = hero.querySelector('.kicker');
        const title = hero.querySelector('h1');
        const lead = hero.querySelector('.lead');
        const meta = hero.querySelectorAll('.page-meta span');
        const buttons = hero.querySelector('.button-row');
        if (kicker) kicker.textContent = universe.kicker;
        if (title) title.textContent = universe.title + '.';
        if (lead) lead.textContent = universe.summary;
        if (meta[0]) {
            meta[0].replaceChildren();
            const dot = create('i', 'status-dot');
            dot.setAttribute('aria-hidden', 'true');
            meta[0].append(dot, document.createTextNode(' ' + universe.status));
        }
        if (meta[1]) meta[1].textContent = universe.genre;
        if (meta[2]) meta[2].textContent = universe.spoilers;
        if (buttons) {
            buttons.replaceChildren();
            if (universe.readUrl) buttons.appendChild(createLink('Ler a história →', 'button button-primary', universe.readUrl, false));
            if (universe.workUrl) buttons.appendChild(createLink('Ver a obra', 'button button-secondary', universe.workUrl, false));
        }
    }

    function renderCharacters(data) {
        const container = document.querySelector('[data-render-characters]');
        if (!container) return;
        const groups = new Map();
        data.characters.forEach((character) => {
            if (!groups.has(character.group)) groups.set(character.group, []);
            groups.get(character.group).push(character);
        });

        const fragment = document.createDocumentFragment();
        groups.forEach((characters, groupName) => {
            const groupId = slugify(groupName);
            const section = create('section', 'character-group');
            section.setAttribute('aria-labelledby', groupId);
            const heading = create('div', 'group-heading');
            const h2 = create('h2', '', groupName);
            h2.id = groupId;
            heading.appendChild(h2);
            section.appendChild(heading);
            const grid = create('div', 'character-grid');
            characters.forEach((character) => {
                const card = create('article', 'character-card-new');
                card.dataset.searchItem = '';
                card.dataset.keywords = character.keywords || '';
                if (character.image) {
                    const portrait = create('div', 'portrait');
                    const image = create('img');
                    image.src = character.image;
                    image.alt = character.imageAlt || `Retrato de ${character.name}`;
                    image.loading = 'lazy';
                    portrait.appendChild(image);
                    card.appendChild(portrait);
                } else {
                    const placeholder = create('div', 'portrait-placeholder', character.initials || '?');
                    placeholder.setAttribute('aria-label', 'Retrato ainda não catalogado');
                    card.appendChild(placeholder);
                }
                const body = create('div', 'character-body');
                body.appendChild(create('span', 'character-role', character.role));
                body.appendChild(create('h3', '', character.name));
                body.appendChild(create('p', '', character.description));
                body.appendChild(createTags(character.tags));
                card.appendChild(body);
                grid.appendChild(card);
            });
            section.appendChild(grid);
            fragment.appendChild(section);
        });
        container.replaceChildren(fragment);
    }

    function renderUniversePreviews(data) {
        const section = document.querySelector('[data-render-universe-previews]');
        if (!section) return;
        const secondary = data.universes.filter((universe, index) => index > 0 || !universe.available);
        if (!secondary.length) {
            section.hidden = true;
            return;
        }
        section.hidden = false;
        const shell = create('div', 'shell');
        const heading = create('div', 'section-heading');
        const titleWrap = create('div');
        titleWrap.appendChild(create('span', 'kicker', 'Outros arquivos'));
        const h2 = create('h2', '', 'Próximos universos.');
        h2.id = 'proximo-universo';
        titleWrap.appendChild(h2);
        heading.appendChild(titleWrap);
        heading.appendChild(create('p', '', 'Novos mundos entram no arquivo conforme suas histórias ganham forma.'));
        shell.appendChild(heading);
        secondary.forEach((universe) => {
            const card = create('article', 'universe-locked-card');
            const cover = create('div', 'universe-locked-cover');
            const image = create('img');
            image.src = universe.cover;
            image.alt = universe.coverAlt || `Capa de ${universe.title}`;
            image.loading = 'lazy';
            cover.appendChild(image);
            cover.appendChild(create('span', '', universe.available ? 'Arquivo disponível' : 'Arquivo confidencial'));
            card.appendChild(cover);
            const copy = create('div', 'universe-locked-copy');
            copy.appendChild(create('span', 'meta-label', universe.status));
            copy.appendChild(create('h3', '', universe.title));
            copy.appendChild(create('p', '', universe.summary));
            copy.appendChild(createTags([universe.genre, universe.status, universe.spoilers]));
            if (universe.available && universe.workUrl) {
                copy.appendChild(createLink('Explorar universo →', 'button button-primary universe-locked-action', universe.workUrl, false));
            } else {
                const disabled = create('span', 'button button-disabled universe-locked-action', 'Universo indisponível');
                disabled.setAttribute('aria-disabled', 'true');
                copy.appendChild(disabled);
            }
            card.appendChild(copy);
            shell.appendChild(card);
        });
        section.replaceChildren(shell);
    }

    function renderNotes(data) {
        const container = document.querySelector('[data-render-notes]');
        if (!container) return;
        const fragment = document.createDocumentFragment();
        data.notes.forEach((note) => {
            const card = create('article', 'note-card' + (note.featured ? ' featured-note' : ''));
            card.appendChild(create('span', 'kicker', note.category));
            card.appendChild(create('h2', '', note.title));
            card.appendChild(create('p', '', note.summary));
            card.appendChild(create('span', 'meta-label', note.state));
            fragment.appendChild(card);
        });
        container.replaceChildren(fragment);
    }

    function initSearch() {
        const search = document.querySelector('[data-archive-search]');
        if (!search || search.dataset.ready === 'true') return;
        search.dataset.ready = 'true';
        const empty = document.querySelector('[data-no-results]');
        search.addEventListener('input', () => {
            const items = Array.from(document.querySelectorAll('[data-search-item]'));
            const query = normalize(search.value.trim());
            let visible = 0;
            items.forEach((item) => {
                const matches = !query || normalize(item.textContent + ' ' + (item.dataset.keywords || '')).includes(query);
                item.hidden = !matches;
                if (matches) visible += 1;
            });
            if (empty) empty.classList.toggle('is-visible', visible === 0);
        });
    }

    async function loadManagedContent() {
        const url = new URL('content/site-content.json', document.baseURI);
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) throw new Error('Conteúdo gerenciado indisponível.');
        const data = await response.json();
        bindGeneralContent(data);
        const page = document.body.dataset.page;
        if (page === 'home') renderHome(data);
        if (page === 'works') renderWorks(data);
        if (page === 'universes') {
            renderUniverseHero(data);
            renderCharacters(data);
            renderUniversePreviews(data);
        }
        if (page === 'notes') renderNotes(data);
        initSearch();
    }

    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.textContent = open ? '×' : '☰';
        });
        nav.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    document.querySelectorAll('[data-year]').forEach((node) => {
        node.textContent = new Date().getFullYear();
    });

    if (document.body.classList.contains('reader-page')) {
        const updateProgress = () => {
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = height > 0 ? Math.min(100, Math.max(0, (window.scrollY / height) * 100)) : 0;
            document.body.style.setProperty('--reading-progress', progress + '%');
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();

        const tools = create('div', 'reader-tools');
        tools.setAttribute('aria-label', 'Ajustes de leitura');
        const smaller = create('button', '', 'A−');
        smaller.type = 'button';
        smaller.dataset.font = 'down';
        smaller.setAttribute('aria-label', 'Diminuir o texto');
        const larger = create('button', '', 'A+');
        larger.type = 'button';
        larger.dataset.font = 'up';
        larger.setAttribute('aria-label', 'Aumentar o texto');
        tools.append(smaller, larger);
        document.body.appendChild(tools);
        let size = Number(localStorage.getItem('reader-size')) || 20;
        const applySize = () => {
            size = Math.min(24, Math.max(17, size));
            document.body.style.setProperty('--reader-size', size + 'px');
            localStorage.setItem('reader-size', String(size));
        };
        applySize();
        tools.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            size += button.dataset.font === 'up' ? 1 : -1;
            applySize();
        });
    }

    loadManagedContent().catch((error) => {
        console.warn('[Entrelinhas] ' + error.message);
        initSearch();
    });
})();
