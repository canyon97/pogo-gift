/* Editable gift config. Duplicate this file (or this object) for later gifts. */
window.GIFT = {
  redemption: {
    trainerName: "beaniebabyjen",
    level: 79,
    team: "Valor",
    pokeCoins: "∞",
    code: "CONGRATS-JEN",
    brand: "POGO Gifts",
    title: "Code Redemption",
    codeLabel: "Enter code",
    applyLabel: "APPLY",
    note: [
      "Note that this is just a fun fan project to share whimsy with friends. It is not an official Pokémon GO offer, gift card, or store redemption, even if the APPLY button is doing its best impression.",
      "Mr. Pikachu / Scopely, please don't come after me.",
      "If you have any questions, don't think too much about it and tap APPLY to continue"
    ]
  },
  postcard: {
    photo: "assets/domain_pogo.jpg",
    greetings: "Greetings from",
    place: "Ambassador Acres",
    location: "Austin, TX, United States",
    senderLabel: "Canyon, Justin, Kevin, Cristian, Alejandro, Chris, Ben, and Jasmine",
    senders: [
    ],
    sticker: "assets/sticker_flair_wooper.png",
    gift: "assets/GiftBox.png"
  },
  pinFileName: "postcard-ambassador-acres.png",
  prizes: [
    {
      id: "wooper",
      image: "assets/pm194_shiny.png",
      label: "Special Surprise",
      qty: "×1",
      card: {
        kicker: "",
        title: "Special Surprise",
        hero: "assets/pm194_shiny.png",
        extraImage: "assets/cursor_wooper.png",
        body: [
          "Jen - thanks for everything you do for the Domain POGO Group! ",
          "We are all excited to see you ~splash~ into your new role as a community ambassador!",
          "This is a Wooper-themed cursor set for your PC so your best buddy can always be by your side.",
          "Tap LEARN MORE to download the files!"
        ],
        ctaLabel: "LEARN MORE",
        ctaHref: "https://drive.google.com/file/d/171siOQC6KjH0JWfuYb8I6KrOWEaFgU6i/view?usp=drive_link"
      }
    },
    {
      id: "buddy",
      image: "assets/buddy_crown_icon.png",
      label: "Awesome Ambassador",
      qty: "×1",
      note: "You make the Domain POGO community special!"
    },
    {
      id: "luck",
      image: "assets/luckyegg.png",
      label: "Shiny Luck",
      qty: "∞",
      note: "Unofficial shiny boosted odds. 0% science, 100% vibes."
    }
  ],
  prizeHint: "Tap a gift",
  sounds: {
    open: "assets/se_go_friend_gift_open.wav",
    select: "assets/se_go_friend_gift_select.wav"
  }
};
