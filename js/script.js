const header = document.querySelector('header');
const burger = document.querySelector('.burger');
const nav = document.getElementById('menu');

function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', onScroll);
onScroll();

burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
});

nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        nav.classList.remove('open'); burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
    });
});

const slides = document.getElementById('slides');
const total = slides.children.length;
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const dotsWrap = document.getElementById('dots');
let index = 0, timer;

for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Ir para slide ' + (i + 1));
    d.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(d);
}
const dots = [...dotsWrap.children];

function goTo(i, user = false) {
    index = (i + total) % total;
    slides.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('active', k === index));
    if (user) { resetAuto() }
}

function nextSlide() { goTo(index + 1) }
function prevSlide() { goTo(index - 1) }

next.addEventListener('click', () => nextSlide());
prev.addEventListener('click', () => prevSlide());

function resetAuto() {
    clearInterval(timer);
    timer = setInterval(nextSlide, 4500);
}
resetAuto();
slides.addEventListener('mouseenter', () => clearInterval(timer));
slides.addEventListener('mouseleave', resetAuto);

document.getElementById('year').textContent = new Date().getFullYear();

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { nav.classList.remove('open'); burger.classList.remove('active'); burger.setAttribute('aria-expanded', 'false'); }
});