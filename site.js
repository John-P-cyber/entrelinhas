(function () {
    const normalize = (value) => (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

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

    const search = document.querySelector('[data-archive-search]');
    if (search) {
        const items = Array.from(document.querySelectorAll('[data-search-item]'));
        const empty = document.querySelector('[data-no-results]');

        search.addEventListener('input', () => {
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

    if (document.body.classList.contains('reader-page')) {
        const updateProgress = () => {
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = height > 0 ? Math.min(100, Math.max(0, (window.scrollY / height) * 100)) : 0;
            document.body.style.setProperty('--reading-progress', progress + '%');
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();

        const tools = document.createElement('div');
        tools.className = 'reader-tools';
        tools.setAttribute('aria-label', 'Ajustes de leitura');
        tools.innerHTML = '<button type="button" data-font="down" aria-label="Diminuir o texto">A−</button><button type="button" data-font="up" aria-label="Aumentar o texto">A+</button>';
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
})();
