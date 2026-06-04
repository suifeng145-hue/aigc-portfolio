const content = window.PORTFOLIO_CONTENT;

const setText = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
};

setText("[data-site-name]", content.siteName);
setText("[data-person-name]", content.personName);
setText("[data-role]", content.role);
setText("[data-years]", content.years);
setText("[data-hero-line]", content.heroLine);
setText("[data-contact-text]", content.contactText);

const isLocalVideo = (src) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(src || "");

const renderMedia = (work, index) => {
  const mediaClass = `project-media media-${(index % 3) + 1}`;
  const imageStyle = work.image ? `style="background-image:url('${work.image}')"` : "";
  const poster = work.image ? ` poster="${work.image}"` : "";

  if (isLocalVideo(work.video)) {
    return `
      <div class="${mediaClass} project-video">
        <video controls preload="metadata" playsinline${poster}>
          <source src="${work.video}" type="video/mp4" />
          你的浏览器暂不支持视频播放。
        </video>
      </div>
    `;
  }

  if (work.video) {
    return `
      <a class="${mediaClass}" href="${work.video}" target="_blank" rel="noreferrer" ${imageStyle}>
        <span class="media-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="media-play">查看视频</span>
      </a>
    `;
  }

  return `
    <div class="${mediaClass}" ${imageStyle}>
      <span class="media-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="media-play">${work.isAiCategory ? "能力方向" : "等待添加视频"}</span>
    </div>
  `;
};

const renderProjects = (items) =>
  items
    .map(
      (work, index) =>
        work.isAiCategory
          ? `
            <article class="project-row ai-work-row is-visible">
              <h3 class="ai-work-heading">${work.title}</h3>
              ${renderMedia(work, index)}
              <div class="project-info ai-work-info">
                <p>${work.desc}</p>
              </div>
            </article>
          `
          : `
            <article class="project-row is-visible">
              ${renderMedia(work, index)}
              <div class="project-info">
                <div class="project-tags">
                  <span>${work.year}</span>
                  <span>${work.tag || work.type}</span>
                </div>
                <h3>${work.title}</h3>
                ${work.subtitle ? `<p class="project-subtitle">${work.subtitle}</p>` : ""}
                ${work.role ? `<strong class="role-line"><span>角色：</span>${work.role}</strong>` : ""}
                ${work.tools ? `<p class="tool-line"><span>工具：</span>${work.tools}</p>` : ""}
                <p>${work.desc}</p>
              </div>
            </article>
          `
    )
    .join("");

const renderArchive = (items) => `
  <div class="archive-grid">
    ${items
      .map(
        (work, index) => `
          <button class="archive-card" type="button" data-work-id="${work.id}">
            <img src="${work.cover || work.image || "assets/images/hero-ai-portfolio.png"}" alt="${work.title}" loading="lazy" />
            <span class="archive-card-overlay"></span>
            <span class="archive-hint">点击查看详情</span>
          </button>
        `
      )
      .join("")}
  </div>
`;

const renderDetailImage = (item, index) => `
  <figure class="detail-figure">
    <img src="${item.src}" alt="${item.caption || `作品图片 ${index + 1}`}" loading="lazy" />
    ${item.caption ? `<figcaption>${item.caption}</figcaption>` : ""}
  </figure>
`;

const renderDetailIntro = (intro, fallback) => {
  const source = intro || fallback || "";
  const paragraphs = Array.isArray(source) ? source : String(source).split(/\n+/);

  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
};

const renderWorkDetail = (work) => `
  <div class="detail-topbar">
    <button type="button" data-detail-return>返回主页</button>
  </div>
  <article class="detail-shell">
    <header class="detail-head">
      <div>
        <h1>${work.title}</h1>
        <div class="detail-intro">${renderDetailIntro(work.detailIntro, work.desc)}</div>
      </div>
      <span>${work.year || "2025-2026"}</span>
    </header>
    ${
      work.detailVideo
        ? `<div class="detail-video"><video controls preload="metadata" playsinline poster="${work.cover || ""}"><source src="${work.detailVideo}" type="video/mp4" />你的浏览器暂不支持视频播放。</video></div>`
        : ""
    }
    <div class="detail-gallery">
      ${(work.detailImages || []).map(renderDetailImage).join("")}
    </div>
  </article>
`;

document.querySelector("[data-commercial-grid]").innerHTML = renderProjects(content.commercialProjects);
const representativeWorks = content.mainWorks || [];
const otherWorks = content.otherWorks || [];
const allArchiveWorks = [...representativeWorks, ...otherWorks];

document.querySelector("[data-representative-works-grid]").innerHTML =
  renderArchive(representativeWorks);
document.querySelector("[data-other-works-grid]").innerHTML = renderArchive(otherWorks);

const pauseAllVideos = (exceptVideo) => {
  document.querySelectorAll("video").forEach((video) => {
    if (video !== exceptVideo && !video.paused) {
      video.pause();
    }
  });
};

document.addEventListener(
  "play",
  (event) => {
    const activeVideo = event.target;
    if (!activeVideo || activeVideo.tagName !== "VIDEO") return;

    pauseAllVideos(activeVideo);
  },
  true
);

const mainContent = document.querySelector("main");
const siteHeader = document.querySelector(".site-header");
const detailPage = document.querySelector("[data-work-detail]");
const archiveGrids = document.querySelectorAll("[data-archive-grid]");
let savedPortfolioScroll = 0;
let savedPortfolioSection = "#representative-works";

const openWorkDetail = (workId, options = {}) => {
  const work = allArchiveWorks.find((item) => item.id === workId);
  if (!work || !detailPage) return;

  savedPortfolioSection = otherWorks.some((item) => item.id === workId)
    ? "#other-works"
    : "#representative-works";
  savedPortfolioScroll =
    window.scrollY || document.querySelector(savedPortfolioSection).offsetTop;
  pauseAllVideos();
  detailPage.innerHTML = renderWorkDetail(work);
  detailPage.hidden = false;
  mainContent.hidden = true;
  siteHeader.hidden = true;
  document.body.classList.add("detail-open");
  window.scrollTo(0, 0);

  if (options.push !== false) {
    history.pushState({ view: "work", workId }, "", `#work-${workId}`);
  }
};

const closeWorkDetail = (options = {}) => {
  pauseAllVideos();
  detailPage.hidden = true;
  detailPage.innerHTML = "";
  mainContent.hidden = false;
  siteHeader.hidden = false;
  document.body.classList.remove("detail-open");

  if (options.push !== false) {
    history.pushState({ view: "main" }, "", savedPortfolioSection);
  }

  requestAnimationFrame(() => {
    const fallbackTop = document.querySelector(savedPortfolioSection).offsetTop;
    window.scrollTo({
      top: savedPortfolioScroll || fallbackTop,
      behavior: "auto"
    });
  });
};

archiveGrids.forEach((grid) => {
  grid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-work-id]");
    if (!card) return;
    openWorkDetail(card.dataset.workId);
  });
});

detailPage.addEventListener("click", (event) => {
  if (event.target.closest("[data-detail-return]")) {
    closeWorkDetail();
  }
});

window.addEventListener("popstate", () => {
  const match = location.hash.match(/^#work-(.+)$/);
  if (match) {
    openWorkDetail(match[1], { push: false });
    return;
  }

  if (document.body.classList.contains("detail-open")) {
    closeWorkDetail({ push: false });
  }
});

const initialWorkMatch = location.hash.match(/^#work-(.+)$/);
if (initialWorkMatch) {
  openWorkDetail(initialWorkMatch[1], { push: false });
}

const observeReveals = () => {
  const reveals = document.querySelectorAll(".reveal:not(.is-visible)");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((el) => observer.observe(el));

  window.setTimeout(() => {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.4) {
        el.classList.add("is-visible");
      }
    });
  }, 220);

  window.setTimeout(() => {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
      el.classList.add("is-visible");
    });
  }, 650);
};

const contactLinks = document.querySelector("[data-contact-links]");
contactLinks.innerHTML = content.contacts
  .map(
    (item) => `
      <button type="button" data-copy-value="${item.copy || item.value}" data-copy-label="${item.label}">
        <span>${item.label}</span>
        ${item.value}
      </button>
    `
  )
  .join("");

contactLinks.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-value]");
  if (!button) return;

  const value = button.dataset.copyValue;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("input");
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  button.classList.add("copied");
  button.querySelector("span").textContent = "已复制";

  window.setTimeout(() => {
    button.classList.remove("copied");
    button.querySelector("span").textContent = button.dataset.copyLabel;
  }, 1300);
});

const hero = document.querySelector(".hero");
const heroBg = document.querySelector(".hero-bg");
const heroCopy = document.querySelector("[data-hero-copy]");
const fluids = document.querySelectorAll(".hero-fluid");
const particleCanvas = document.querySelector("[data-hero-particles]");
const heroPointer = { x: -1000, y: -1000, active: false };

hero.addEventListener("pointermove", (event) => {
  const rect = hero.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  heroPointer.x = event.clientX - rect.left;
  heroPointer.y = event.clientY - rect.top;
  heroPointer.active = true;

  heroBg.style.transform = `scale(1.035) translate(${x * 10}px, ${y * 8}px)`;
  fluids.forEach((fluid, index) => {
    const depth = index === 0 ? 22 : -16;
    fluid.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
  });
});

hero.addEventListener("pointerleave", () => {
  heroPointer.active = false;
  heroBg.style.transform = "";
  fluids.forEach((fluid) => {
    fluid.style.transform = "";
  });
});

if (heroCopy) {
  heroCopy.addEventListener("pointerdown", () => heroCopy.classList.add("is-pressed"));
  heroCopy.addEventListener("pointerup", () => heroCopy.classList.remove("is-pressed"));
  heroCopy.addEventListener("pointerleave", () => heroCopy.classList.remove("is-pressed"));
}

const setupHeroParticles = () => {
  if (!particleCanvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = particleCanvas.getContext("2d");
  const shapeCanvas = document.createElement("canvas");
  const shapeCtx = shapeCanvas.getContext("2d");
  let particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let lastTime = 0;
  let running = true;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const targetFrameMs = 1000 / (isCoarsePointer ? 28 : 40);

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(420, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    particleCanvas.width = Math.floor(width * dpr);
    particleCanvas.height = Math.floor(height * dpr);
    particleCanvas.style.width = `${width}px`;
    particleCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    shapeCanvas.width = Math.floor(width);
    shapeCanvas.height = Math.floor(height);
    shapeCtx.clearRect(0, 0, width, height);
    shapeCtx.fillStyle = "#fff";
    shapeCtx.textAlign = "center";
    shapeCtx.textBaseline = "middle";

    let fontSize = clamp(width * 0.16, 92, 232);
    const maxWidth = width * 0.72;
    do {
      shapeCtx.font = `800 ${fontSize}px "Noto Serif SC", "Source Han Sans SC", serif`;
      fontSize -= 4;
    } while (shapeCtx.measureText("AI作品集").width > maxWidth && fontSize > 76);

    shapeCtx.font = `800 ${fontSize}px "Noto Serif SC", "Source Han Sans SC", serif`;
    shapeCtx.fillText("AI作品集", width * 0.58, height * 0.43);

    const imageData = shapeCtx.getImageData(0, 0, width, height).data;
    const gap = isCoarsePointer || width < 760 ? 18 : 12;
    const nextParticles = [];

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const alpha = imageData[(Math.floor(y) * Math.floor(width) + Math.floor(x)) * 4 + 3];
        if (alpha > 40 && Math.random() > 0.2) {
          const existing = particles[nextParticles.length];
          nextParticles.push({
            ox: x + (Math.random() - 0.5) * gap,
            oy: y + (Math.random() - 0.5) * gap,
            x: existing?.x ?? x,
            y: existing?.y ?? y,
            vx: existing?.vx ?? 0,
            vy: existing?.vy ?? 0,
            seed: Math.random() * 1000,
            size: Math.random() * 1.4 + 0.7,
            alpha: Math.random() * 0.32 + 0.22
          });
        }
      }
    }

    particles = nextParticles.slice(0, isCoarsePointer || width < 760 ? 360 : 980);
  };

  const animate = (time = 0) => {
    if (!running) {
      requestAnimationFrame(animate);
      return;
    }

    if (time - lastTime < targetFrameMs) {
      requestAnimationFrame(animate);
      return;
    }

    lastTime = time;
    frame += 0.012;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 0;

    for (const particle of particles) {
      const wave = Math.sin(frame * 2.1 + particle.seed) * 10;
      const slowWave = Math.cos(frame * 0.82 + particle.seed * 0.7) * 7;
      let targetX = particle.ox + wave;
      let targetY = particle.oy + slowWave + Math.sin(frame + particle.ox * 0.018) * 5;

      if (heroPointer.active) {
        const dx = particle.x - heroPointer.x;
        const dy = particle.y - heroPointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const influence = Math.max(0, 1 - distance / 190);
        const swirl = Math.atan2(dy, dx) + Math.PI / 2;
        targetX += Math.cos(swirl) * influence * 62 + (dx / distance) * influence * 40;
        targetY += Math.sin(swirl) * influence * 62 + (dy / distance) * influence * 40;
      }

      particle.vx += (targetX - particle.x) * 0.018;
      particle.vy += (targetY - particle.y) * 0.018;
      particle.vx *= 0.88;
      particle.vy *= 0.88;
      particle.x += particle.vx;
      particle.y += particle.vy;

      const shimmer = 0.7 + Math.sin(frame * 4 + particle.seed) * 0.3;
      ctx.fillStyle = `rgba(147, 255, 22, ${particle.alpha * shimmer})`;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }

    ctx.globalCompositeOperation = "source-over";
    const glow = ctx.createRadialGradient(width * 0.56, height * 0.42, 0, width * 0.56, height * 0.42, width * 0.33);
    glow.addColorStop(0, "rgba(140, 255, 22, 0.08)");
    glow.addColorStop(1, "rgba(140, 255, 22, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(animate);
  };

  resize();
  animate();
  window.addEventListener("resize", resize);

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      running = entry.isIntersecting;
    },
    { threshold: 0.08 }
  );

  heroObserver.observe(hero);
};

observeReveals();
setupHeroParticles();
