document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('header');
    const heroHeight = document.querySelector('.hero').offsetHeight;

    const stickHeader = () => {
        header.classList.toggle('sticky', window.scrollY > heroHeight);
    };
    stickHeader();
    window.addEventListener('scroll', stickHeader);


    const openPopup = (popup) => {
        popup.classList.remove('fade-out');
        popup.classList.add('show');
    };

    const closePopup = (popup) => {
        popup.classList.add('fade-out');

        const onEnd = () => {
            popup.classList.remove('show', 'fade-out');
            popup.removeEventListener('transitionend', onEnd);
        };
        popup.addEventListener('transitionend', onEnd);
    };

    const thumbs = [...document.querySelectorAll('.thumbnails img')];
    const gPopup = document.getElementById('gallery-popup');
    const gImg = document.getElementById('popup-img');
    const gCap = document.getElementById('popup-caption');
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    const closeG = document.getElementById('close-gallery');
    let current = 0;

    const updateArrows = () => {
        prev.style.display = current ? 'block' : 'none';
        next.style.display = current === thumbs.length - 1 ? 'none' : 'block';
    };

    const showSlide = (i) => {
        if (i < 0 || i >= thumbs.length) return;
        current = i;
        gImg.src = thumbs[i].getAttribute('src');
        gCap.textContent = thumbs[i].dataset.caption || '';
        openPopup(gPopup);
        updateArrows();
    };

    thumbs.forEach((img, i) => img.addEventListener('click', () => showSlide(i)));
    prev.addEventListener('click', () => showSlide(current - 1));
    next.addEventListener('click', () => showSlide(current + 1));
    closeG.addEventListener('click', () => closePopup(gPopup));
    gPopup.addEventListener('click',
        (e) => e.target === gPopup && closePopup(gPopup));

    document.addEventListener('keyup', (e) => {
        if (!gPopup.classList.contains('show')) return;
        if (e.key === 'Escape') closePopup(gPopup);
        else if (e.key === 'ArrowLeft') showSlide(current - 1);
        else if (e.key === 'ArrowRight') showSlide(current + 1);
    });

    const formPopup = document.getElementById('form-popup');
    const openForm = document.getElementById('open-form-btn');
    const closeForm = document.getElementById('close-form');
    const form = document.getElementById('contact-form');
    const sendBtn = document.getElementById('submit-btn');

    openForm.addEventListener('click', () => openPopup(formPopup));
    closeForm.addEventListener('click', () => closePopup(formPopup));
    formPopup.addEventListener('click',
        (e) => e.target === formPopup && closePopup(formPopup));

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^\+?\d{10,15}$/;
    const textRe = /^[A-Za-zА-Яа-яЁё0-9\s.,!?\-]+$/u;
    const fieldChecks = [
        { el: form.querySelector('input[name="name"]'),    check: v => textRe.test(v) },
        { el: form.querySelector('input[name="email"]'),   check: v => emailRe.test(v) },
        { el: form.querySelector('input[name="phone"]'),   check: v => phoneRe.test(v) },
        { el: form.querySelector('textarea[name="message"]'), check: v => textRe.test(v) },
    ];

    fieldChecks.forEach(({el, check}) => {
        const indicator = el.closest('.form-group').querySelector('.indicator');
        el.addEventListener('input', () => {
            if (!el.value) {
                indicator.textContent = '';
                indicator.classList.remove('valid', 'invalid');
            } else if (check(el.value)) {
                indicator.textContent = '😊';
                indicator.classList.add('valid');
                indicator.classList.remove('invalid');
            } else {
                indicator.textContent = '😡';
                indicator.classList.add('invalid');
                indicator.classList.remove('valid');
            }
        });
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const values = {};
        new FormData(form).forEach((val, key) => {
            values[key] = String(val);
        });

        const valid = emailRe.test(values.email) &&
            phoneRe.test(values.phone) &&
            textRe.test(values.name) &&
            textRe.test(values.message);

        if (!valid) {
            alert('Проверьте корректность введённых данных.');
            return;
        }

        sendBtn.textContent = 'Отправляем…';
        sendBtn.classList.add('sending');
        sendBtn.disabled = true;

        try {
            const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(values)
            });
            if (res.ok) {
                sendBtn.textContent = 'Успешно отправлено';
                sendBtn.classList.remove('sending');
                sendBtn.classList.add('success');
            } else {
                return Promise.reject(new Error(`HTTP ${res.status}`));
            }

        } catch (err) {
            console.error(err);
            alert('Не удалось отправить сообщение. Попробуйте позже.');
            sendBtn.textContent = 'Отправить';
            sendBtn.classList.remove('sending');
            sendBtn.disabled = false;
        }
    });

    const tPopup = document.getElementById('timed-popup');
    const closeT = document.getElementById('close-timed');

    if (!localStorage.getItem('timedClosed')) {
        setTimeout(() => openPopup(tPopup), 30_000);
    }
    const hideTimed = () => {
        closePopup(tPopup);
        localStorage.setItem('timedClosed', '1');
    };
    closeT.addEventListener('click', hideTimed);
    tPopup.addEventListener('click', (e) => e.target === tPopup && hideTimed());

    const goalDate = new Date(2025, 8, 1, 0, 0, 0);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    const updateTimer = () => {
        const diff = goalDate.getTime() - Date.now();
        if (diff <= 0) {
            dEl.textContent = hEl.textContent =
                mEl.textContent = sEl.textContent = '0';
            clearInterval(int);
            return;
        }
        const days = Math.floor(diff / 86_400_000);
        const hours = Math.floor(diff % 86_400_000 / 3_600_000);
        const minutes = Math.floor(diff % 3_600_000 / 60_000);
        const seconds = Math.floor(diff % 60_000 / 1_000);

        dEl.textContent = String(days);
        hEl.textContent = String(hours).padStart(2, '0');
        mEl.textContent = String(minutes).padStart(2, '0');
        sEl.textContent = String(seconds).padStart(2, '0');
    };
    updateTimer();
    const int = setInterval(updateTimer, 1_000);

    const circle = document.getElementById('svg-circle');
    if (circle) {
        const baseCX = Number(circle.getAttribute('cx'));
        const baseCY = Number(circle.getAttribute('cy'));

        window.addEventListener('scroll', () => {
            const progress = window.scrollY /
                (document.documentElement.scrollHeight - window.innerHeight);
            circle.setAttribute('r', String(40 + progress * 20)); // строка
        });
        window.addEventListener('mousemove', (e) => {
            const cx = baseCX + (e.clientX - window.innerWidth / 2) / 30;
            const cy = baseCY + (e.clientY - window.innerHeight / 2) / 30;
            circle.setAttribute('cx', String(cx));
            circle.setAttribute('cy', String(cy));
        });
    }
});
