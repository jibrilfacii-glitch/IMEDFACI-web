(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            const open = menuButton.getAttribute('aria-expanded') !== 'true';
            menuButton.setAttribute('aria-expanded', String(open));
            menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
            nav.classList.toggle('is-open', open);
        });
        nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
            nav.classList.remove('is-open');
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.setAttribute('aria-label', 'Ouvrir le menu');
        }));
    }

    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    const role = document.getElementById('typing-role');
    if (role && !reducedMotion) {
        const phrase = role.textContent.trim();
        role.textContent = '';
        let index = 0;
        const typeNext = () => {
            if (index < phrase.length) {
                role.textContent += phrase[index++];
                window.setTimeout(typeNext, 38);
            }
        };
        window.setTimeout(typeNext, 450);
    }

    const sections = [...document.querySelectorAll('main section[id]')];
    const navLinks = [...document.querySelectorAll('.site-nav a')];
    if ('IntersectionObserver' in window && sections.length && navLinks.length) {
        const activeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    const active = link.getAttribute('href') === `#${entry.target.id}`;
                    link.classList.toggle('active', active);
                    if (active) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
        sections.forEach((section) => activeObserver.observe(section));
    }

    const canvas = document.getElementById('starfield');
    const context = canvas?.getContext('2d');
    if (!canvas || !context || reducedMotion) return;

    const points = [];
    const pointer = { x: -1000, y: -1000 };
    let frame = 0;
    let width = 0;
    let height = 0;
    const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.min(70, Math.max(28, Math.floor((width * height) / 18000)));
        points.length = 0;
        for (let i = 0; i < count; i += 1) {
            points.push({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.3 + .35, phase: Math.random() * Math.PI * 2, drift: (Math.random() - .5) * .09 });
        }
    };
    const draw = () => {
        context.clearRect(0, 0, width, height);
        const time = performance.now() * .0007;
        points.forEach((point, index) => {
            point.y += point.drift;
            if (point.y > height + 4) point.y = -4;
            if (point.y < -4) point.y = height + 4;
            const alpha = .2 + (Math.sin(time + point.phase) + 1) * .23;
            context.beginPath();
            context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
            context.fillStyle = `rgba(67, 224, 235, ${alpha})`;
            context.fill();
            for (let next = index + 1; next < points.length; next += 1) {
                const other = points[next];
                const dx = point.x - other.x;
                const dy = point.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 92) {
                    context.beginPath();
                    context.moveTo(point.x, point.y);
                    context.lineTo(other.x, other.y);
                    context.strokeStyle = `rgba(0, 203, 220, ${(1 - distance / 92) * .085})`;
                    context.lineWidth = 1;
                    context.stroke();
                }
            }
            const dx = pointer.x - point.x;
            const dy = pointer.y - point.y;
            if (dx * dx + dy * dy < 115 * 115) {
                context.beginPath();
                context.moveTo(point.x, point.y);
                context.lineTo(pointer.x, pointer.y);
                context.strokeStyle = 'rgba(0, 229, 229, .11)';
                context.stroke();
            }
        });
        frame = window.requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (event) => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) window.cancelAnimationFrame(frame);
        else draw();
    });
})();
