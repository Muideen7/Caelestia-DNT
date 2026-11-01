// quotes-collection.js - Curated database of iconic quotes across all walks of life:
// Philosophy, Science, Tech, Donghua (Soul Land, Perfect World, Battle Through the Heavens, Renegade Immortal, A Will Eternal),
// Anime (Frieren, Attack on Titan, Hunter x Hunter, Bleach, Naruto, Gurren Lagann, Vinland Saga), and World Literature.

(function(global) {
  'use strict';

  const QUOTES = [
    // --- Donghua & Cultivation Lore ---
    { quote: "Thirty years east of the river, thirty years west of the river. Never bully the young and poor!", author: "Xiao Yan", source: "Battle Through the Heavens" },
    { quote: "Even if I have to carry the Primordial City on my back and face the Heavenly Dao with one hand, I, An Lan, am invincible in this world!", author: "An Lan", source: "Perfect World" },
    { quote: "Who in this world dares say they are invincible? Which undefeated emperor has never wept?", author: "Shi Hao", source: "Perfect World" },
    { quote: "If the heavens want me to die, I shall defy the heavens; if fate wants me to submit, I shall slaughter fate!", author: "Wang Lin", source: "Renegade Immortal" },
    { quote: "A blade without hesitation cuts deepest. Walk your path though mountains crumble.", author: "Tang San", source: "Soul Land" },
    { quote: "I, Bai Xiaochun, snap my fingers and the ashes of evil disperse!", author: "Bai Xiaochun", source: "A Will Eternal" },
    { quote: "Cultivation is an act against heaven. Every breakthrough is forged in blood and conviction.", author: "Meng Hao", source: "I Shall Seal the Heavens" },
    { quote: "The sword is not just for killing; it is the brush with which you write your destiny.", author: "Lu Shu", source: "Spare Me, Great Lord!" },
    { quote: "To comprehend the Dao is to know stillness amidst the storm.", author: "Luo Feng", source: "Swallowed Star" },
    { quote: "In the river of time, heroes rise like stars and fade like dust. Only true will endures.", author: "Qin Yu", source: "Stellar Transformations" },
    { quote: "Do not fear the vastness of the cosmos; fear the narrowness of your own heart.", author: "Han Jue", source: "Top Tier Providence" },

    // --- Anime & Manga Classics ---
    { quote: "It is the small, accumulated moments that truly shape a life.", author: "Frieren", source: "Frieren: Beyond Journey's End" },
    { quote: "Believe in the me that believes in you!", author: "Kamina", source: "Tengen Toppa Gurren Lagann" },
    { quote: "If you don't take risks, you can't create a future.", author: "Monkey D. Luffy", source: "One Piece" },
    { quote: "You have no enemies. No one in this world is your enemy. There is no one you need to hurt.", author: "Thors", source: "Vinland Saga" },
    { quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win!", author: "Eren Yeager", source: "Attack on Titan" },
    { quote: "A person grows once he can overcome hardships. Protection is important, but there are some things a person must learn on their own.", author: "Jiraiya", source: "Naruto" },
    { quote: "There is no such thing as perfection in this world. It is an impossible concept. But striving for it is what makes us human.", author: "Mayuri Kurotsuchi", source: "Bleach" },
    { quote: "Fear is not evil. It tells you what your weakness is. Once you know your weakness, you can become stronger.", author: "Gildarts Clive", source: "Fairy Tail" },
    { quote: "The world isn't perfect. But it's there for us, doing the best it can... that's what makes it so damn beautiful.", author: "Roy Mustang", source: "Fullmetal Alchemist: Brotherhood" },
    { quote: "You should enjoy the little detours to the fullest. Because that's where you'll find the things more important than what you want.", author: "Ging Freecss", source: "Hunter x Hunter" },
    { quote: "Hard work is worthless for those that don't believe in themselves.", author: "Naruto Uzumaki", source: "Naruto" },
    { quote: "No matter how deep the night, dawn will always break.", author: "Brook", source: "One Piece" },
    { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", author: "Kenshin Himura", source: "Rurouni Kenshin" },
    { quote: "Human strength lies in the ability to change yourself.", author: "Saitama", source: "One Punch Man" },

    // --- Philosophy, Wisdom & Life ---
    { quote: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { quote: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { quote: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
    { quote: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
    { quote: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { quote: "The unexamined life is not worth living.", author: "Socrates" },
    { quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
    { quote: "In the midst of winter, I found there was, within me, an invincible summer.", author: "Albert Camus" },
    { quote: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },

    // --- Science, Tech & Craft ---
    { quote: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { quote: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
    { quote: "The only way to go fast, is to go well.", author: "Robert C. Martin" },
    { quote: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
    { quote: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan" },
    { quote: "Stay hungry, stay foolish.", author: "Stewart Brand" },
    { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { quote: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { quote: "The most dangerous phrase in the language is, 'We've always done it this way.'", author: "Grace Hopper" },
    { quote: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", author: "Albert Einstein" }
  ];

  // Online API sources with timeout & graceful fallback
  async function fetchOnlineQuote() {
    const apis = [
      // 1. Quotable API
      async () => {
        const res = await fetch('https://api.quotable.io/random?tags=technology|wisdom|philosophy|inspirational', { cache: 'no-cache', signal: AbortSignal.timeout(2500) });
        if (!res.ok) throw new Error('Quotable error');
        const data = await res.json();
        return { quote: data.content, author: data.author };
      },
      // 2. DummyJSON Quotes
      async () => {
        const res = await fetch('https://dummyjson.com/quotes/random', { cache: 'no-cache', signal: AbortSignal.timeout(2500) });
        if (!res.ok) throw new Error('DummyJSON error');
        const data = await res.json();
        return { quote: data.quote, author: data.author };
      }
    ];

    for (const apiFn of apis) {
      try {
        const result = await apiFn();
        if (result && result.quote) return result;
      } catch (e) {
        // Continue to next or fallback
      }
    }
    return null;
  }

  // Get a fresh quote on every tab open (weighted mixture of curated database + online)
  function getRandomLocalQuote() {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }

  function formatQuote(item) {
    if (!item) return '';
    let authorPart = item.author || 'Unknown';
    if (item.source) {
      authorPart += ` (${item.source})`;
    }
    return `"${item.quote.replace(/^"|"$/g, '')}" — ${authorPart}`;
  }

  global.CaelestiaQuotes = {
    QUOTES,
    getRandomLocalQuote,
    fetchOnlineQuote,
    formatQuote
  };
})(typeof window !== 'undefined' ? window : this);
