(() => {
  const gift = window.GIFT;
  if (!gift) {
    document.body.textContent = "Missing gift.js config.";
    return;
  }

  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const noteEl = document.getElementById("prize-note");
  const crewPop = document.getElementById("crew-pop");
  const pinBtn = document.getElementById("btn-pin");
  const openBtn = document.getElementById("btn-open");
  const closeBtn = document.getElementById("btn-close");
  const offerOverlay = document.getElementById("offer-overlay");

  const audio = {
    open: new Audio(gift.sounds.open),
    select: new Audio(gift.sounds.select)
  };
  audio.open.preload = "auto";
  audio.select.preload = "auto";

  const redeem = gift.redemption;
  document.title = (redeem && redeem.brand) || "POGO Gifts";
  let scene = redeem ? "redeem" : "postcard";
  let toastTimer = 0;
  let openingTimers = [];
  let ignoreGiftOpenUntil = 0;

  function showToast(message, ms = 2200) {
    toastEl.hidden = false;
    toastEl.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, ms);
  }

  function play(name) {
    if (name === "open" && Date.now() < ignoreGiftOpenUntil) return;
    Object.keys(audio).forEach((key) => {
      if (key === name) return;
      audio[key].pause();
      audio[key].currentTime = 0;
    });
    const clip = audio[name];
    if (!clip) return;
    clip.currentTime = 0;
    clip.play().catch(() => {});
  }

  function clearOpeningTimers() {
    openingTimers.forEach((id) => clearTimeout(id));
    openingTimers = [];
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    openingTimers.push(id);
    return id;
  }

  function formatShopCoins(value) {
    if (
      value === "∞" ||
      value === Infinity ||
      String(value).toLowerCase() === "unlimited"
    ) {
      return "∞";
    }
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString("en-US") : "∞";
  }

  function fillRedeem() {
    if (!redeem) return;
    document.getElementById("shop-brand").textContent = redeem.brand || "GO Gifts";
    document.getElementById("shop-title").textContent = redeem.title || "Code Redemption";
    document.getElementById("shop-trainer").textContent = redeem.trainerName || "Trainer";
    const coins = formatShopCoins(redeem.pokeCoins ?? "∞");
    const coinsEl = document.getElementById("shop-coins-top");
    coinsEl.textContent = coins;
    coinsEl.classList.toggle("is-inf", coins === "∞");
    const meta = document.getElementById("shop-meta");
    meta.replaceChildren();
    const bits = [
      { text: `Level ${redeem.level ?? 1}` },
      { text: `Team ${redeem.team || "Mystic"}`, team: redeem.team }
    ];
    bits.forEach((bit, i) => {
      if (i) {
        const sep = document.createElement("span");
        sep.className = "shop-meta-sep";
        sep.textContent = "|";
        meta.append(sep);
      }
      const span = document.createElement("span");
      if (bit.team) span.dataset.team = String(bit.team).toLowerCase();
      span.textContent = bit.text;
      meta.append(span);
    });
    document.querySelector(".shop-code-label").textContent = redeem.codeLabel || "Enter code";
    document.getElementById("shop-apply").textContent = redeem.applyLabel || "APPLY";
    document.getElementById("shop-code").value = redeem.code || "";
    const note = document.getElementById("shop-note");
    note.replaceChildren();
    const paragraphs = Array.isArray(redeem.note) ? redeem.note : [redeem.note].filter(Boolean);
    paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      note.appendChild(p);
    });
  }

  function postcardSenders() {
    const list = gift.postcard && gift.postcard.senders;
    if (!Array.isArray(list)) return [];
    return list.map((name) => String(name).trim()).filter(Boolean);
  }

  function fillPostcard() {
    const card = gift.postcard;
    document.getElementById("gift-art").src = card.gift;
    document.getElementById("open-gift-art").src = card.gift;
    document.getElementById("postcard-photo").src = card.photo;
    document.getElementById("postcard-photo").alt = card.place;
    document.getElementById("postcard-greetings").textContent = card.greetings;
    document.getElementById("postcard-place").textContent = card.place;
    document.getElementById("postcard-location").textContent = card.location;
    document.getElementById("postcard-sender").textContent = card.senderLabel;
    const sticker = document.getElementById("postcard-sticker");
    if (card.sticker) {
      sticker.hidden = false;
      sticker.src = card.sticker;
      sticker.alt = "Gift sticker";
    } else {
      sticker.hidden = true;
    }
    crewPop.textContent = postcardSenders().join(" · ");
    crewPop.hidden = true;
    const hint = document.getElementById("prize-hint");
    hint.textContent = gift.prizeHint || "Tap a gift";
  }

  function prizePositions(count) {
    if (count <= 1) return [{ x: 50, y: 46 }];
    if (count === 2) return [
      { x: 32, y: 24 },
      { x: 68, y: 52 }
    ];
    if (count === 3) return [
      { x: 32, y: 18 },
      { x: 68, y: 42 },
      { x: 32, y: 66 }
    ];
    if (count === 4) return [
      { x: 32, y: 14 },
      { x: 68, y: 30 },
      { x: 32, y: 48 },
      { x: 68, y: 66 }
    ];
    return [
      { x: 50, y: 12 },
      { x: 28, y: 36 },
      { x: 72, y: 36 },
      { x: 28, y: 62 },
      { x: 72, y: 62 }
    ];
  }

  function renderPrizes() {
    const stage = document.getElementById("prize-stage");
    stage.innerHTML = "";
    stage.dataset.count = String(gift.prizes.length);
    const spots = prizePositions(gift.prizes.length);
    gift.prizes.forEach((prize, i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "prize";
      el.style.left = `${spots[i].x}%`;
      el.style.top = `${spots[i].y}%`;
      el.style.animationDelay = `${i * 120}ms`;
      el.dataset.id = prize.id;
      el.setAttribute("aria-label", `${prize.qty} ${prize.label}`);

      const goldClass = prize.gold ? " gold" : "";
      const frame = prize.frame
        ? `<img class="medal-frame" src="${prize.frame}" alt="" />`
        : "";
      const isInf = prize.qty === "∞";
      const qtyInner = isInf
        ? `<svg class="inf-icon" viewBox="0 0 28 12" aria-hidden="true"><path d="M7.2 6c0-1.85 1.55-3.35 3.4-3.35 1.15 0 2.2.7 5.4 3.35-3.2 2.65-4.25 3.35-5.4 3.35C8.75 9.35 7.2 7.85 7.2 6zm13.6 0c0 1.85-1.55 3.35-3.4 3.35-1.15 0-2.2-.7-5.4-3.35 3.2-2.65 4.25-3.35 5.4-3.35C20.05 2.65 21.6 4.15 21.6 6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : prize.qty;
      el.innerHTML = `
        <span class="prize-circle${goldClass}">
          ${frame}
          <img class="item" src="${prize.image}" alt="${prize.label}" />
        </span>
        <span class="qty${isInf ? " qty-inf" : ""}">${qtyInner}</span>
        <span class="prize-label">${prize.label}</span>
      `;
      el.addEventListener("click", () => onPrizeTap(prize, el));
      stage.appendChild(el);
      requestAnimationFrame(() => el.classList.add("is-in"));
    });
  }

  function onPrizeTap(prize, el) {
    play("select");
    el.classList.add("is-tapped");
    setTimeout(() => el.classList.remove("is-tapped"), 180);
    if (prize.card) {
      openOffer(prize.card, prize);
      return;
    }
    if (prize.note) {
      noteEl.hidden = false;
      noteEl.textContent = prize.note;
    }
    if (prize.href) {
      window.open(prize.href, "_blank", "noopener,noreferrer");
    }
  }

  function openOffer(card, prize) {
    const kicker = document.getElementById("offer-kicker");
    if (card.kicker) {
      kicker.hidden = false;
      kicker.textContent = card.kicker;
    } else {
      kicker.hidden = true;
      kicker.textContent = "";
    }
    document.getElementById("offer-title").textContent = card.title || prize.label;
    const hero = document.getElementById("offer-hero");
    const heroSrc = card.hero || prize.image;
    if (heroSrc) {
      hero.hidden = false;
      hero.src = heroSrc;
      hero.alt = card.title || prize.label;
    } else {
      hero.hidden = true;
    }
    const extra = document.getElementById("offer-extra");
    const extraSrc = card.extraImage || card.image2;
    if (extraSrc) {
      extra.hidden = false;
      extra.src = extraSrc;
      extra.alt = card.extraAlt || card.title || prize.label;
    } else {
      extra.hidden = true;
      extra.removeAttribute("src");
    }
    const body = document.getElementById("offer-body");
    const paragraphs = Array.isArray(card.body) ? card.body : [card.body].filter(Boolean);
    body.replaceChildren();
    paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
    });
    const cta = document.getElementById("offer-cta");
    if (card.ctaHref) {
      cta.hidden = false;
      cta.href = card.ctaHref;
      cta.textContent = card.ctaLabel || "LEARN MORE";
    } else {
      cta.hidden = true;
    }
    offerOverlay.hidden = false;
    app.classList.add("is-offer");
  }

  function closeOffer() {
    offerOverlay.hidden = true;
    app.classList.remove("is-offer");
  }

  function setScene(next) {
    scene = next;
    app.dataset.scene = next;
    app.classList.remove("is-splitting");
    document.getElementById("scene-redeem").hidden = next !== "redeem";
    document.getElementById("scene-postcard").hidden = next !== "postcard";
    document.getElementById("scene-opening").hidden = next !== "opening";
    document.getElementById("scene-prizes").hidden = next !== "prizes";
    crewPop.hidden = true;
    closeOffer();
    if (next !== "prizes") noteEl.hidden = true;
  }

  function goPostcard() {
    clearOpeningTimers();
    pinBtn.classList.remove("is-pinned");
    app.classList.remove("is-redeeming");
    setScene("postcard");
  }

  function goPostcardFromRedeem() {
    if (app.classList.contains("is-redeeming")) return;
    ignoreGiftOpenUntil = Date.now() + 1800;
    audio.open.pause();
    audio.open.currentTime = 0;
    play("select");
    app.classList.add("is-redeeming");
    document.getElementById("scene-postcard").hidden = false;
    later(() => {
      app.classList.remove("is-redeeming");
      setScene("postcard");
    }, 920);
  }

  function goOpening() {
    if (scene !== "postcard" || Date.now() < ignoreGiftOpenUntil) return;
    clearOpeningTimers();
    play("open");
    openBtn.classList.add("is-pressed");
    setScene("opening");
    later(() => {
      openBtn.classList.remove("is-pressed");
      app.classList.add("is-splitting");
    }, 520);
    later(() => goPrizes(), 2100);
  }

  function goPrizes() {
    clearOpeningTimers();
    setScene("prizes");
    renderPrizes();
  }

  async function savePostcard() {
    play("select");
    pinBtn.classList.add("is-pinned");
    const target = document.getElementById("gift-stack");
    try {
      if (typeof html2canvas !== "function") {
        throw new Error("html2canvas missing");
      }
      const canvas = await html2canvas(target, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });
      const link = document.createElement("a");
      link.download = gift.pinFileName || "postcard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Postcard pinned. Your book is going to love this.");
    } catch (err) {
      showToast("Could not save the postcard in this browser. Screenshot it instead.");
    }
  }

  openBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (scene !== "postcard" || Date.now() < ignoreGiftOpenUntil) return;
    goOpening();
  });

  pinBtn.addEventListener("click", () => {
    if (scene !== "postcard") return;
    savePostcard();
  });

  document.getElementById("postcard-sender").addEventListener("click", () => {
    if (!postcardSenders().length) return;
    crewPop.hidden = !crewPop.hidden;
  });

  closeBtn.addEventListener("click", () => {
    if (Date.now() < ignoreGiftOpenUntil) return;
    play("select");
    if (scene === "redeem") {
      showToast("Redeem the code first. It is not going to type itself.");
      return;
    }
    if (scene === "postcard") {
      if (redeem) {
        setScene("redeem");
        return;
      }
      showToast("The gift isn't going to open itself, Trainer.");
      return;
    }
    if (scene === "opening") {
      goPrizes();
      return;
    }
    if (app.classList.contains("is-offer")) {
      closeOffer();
      return;
    }
    goPostcard();
  });

  document.getElementById("shop-apply").addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (scene !== "redeem") return;
    goPostcardFromRedeem();
  });

  document.getElementById("shop-code").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("shop-apply").click();
    }
  });

  document.getElementById("shop-menu").addEventListener("click", () => {
    play("select");
    showToast("Settings unavailable");
  });

  fillRedeem();
  fillPostcard();
  setScene(redeem ? "redeem" : "postcard");
})();
