export const BREAK_QUOTES = [
  { text: "Take rest; a field that has rested gives a bountiful crop.", author: "Ovid" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "How we spend our days is, of course, how we spend our lives.", author: "Annie Dillard" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
  { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Little by little, one travels far.", author: "Spanish proverb" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "Lack of direction, not lack of time, is the problem. We all have twenty-four hour days.", author: "Zig Ziglar" },
  { text: "Rest is not idleness, and to lie sometimes on the grass on a summer day is by no means a waste of time.", author: "John Lubbock" },
];

export function randomQuote() {
  return BREAK_QUOTES[(Math.random() * BREAK_QUOTES.length) | 0];
}
