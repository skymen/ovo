const RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
}

const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

const TAGS = {
  HISTORY: 'history',
  PREHISTORY : 'prehistory',
  SCIENCE: 'science',
  TECHNOLOGY: 'technology',
  SPACE: 'space',
  ART: 'art',
  MUSIC: 'music',
  MOVIE : 'movie',
  GAME : 'game',
  CIVILISATION : 'civilisation',
  RELIGION : 'religion',
  LITTERATURE : 'litterature',
  PEOPLE : 'people',
  FASHION : 'fashion',

}

let tokens = [
  {
    name: "First time in space",
    year: "1957",
    tags: [
      TAGS.HISTORY,
      TAGS.SCIENCE,
      TAGS.TECHNOLOGY,
      TAGS.SPACE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Abbey Road Album",
    year: "1969",
    tags: [
      TAGS.ART,
      TAGS.MUSIC,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Age of Bronze",
    year: "-2200",
    tags: [
      TAGS.HISTORY,
      TAGS.PREHISTORY,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Agriculture",
    year: "-8000",
    tags: [
      TAGS.HISTORY,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Air Balloon",
    year: "1783",
    tags: [
      TAGS.HISTORY,
      TAGS.SCIENCE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Avengers Movie",
    year: "2012",
    tags: [
      TAGS.ART,
      TAGS.MOVIE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Baby (J.Bieber)",
    year: "2010",
    tags: [
      TAGS.ART,
      TAGS.MUSIC
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Battery",
    year: "1800",
    tags: [
      TAGS.HISTORY,
      TAGS.SCIENCE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Wall of Berlin",
    year: "1989",
    tags: [
      TAGS.HISTORY,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Bra",
    year: "1859",
    tags: [
      TAGS.FASHION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Buddha's death",
    year: "-400",
    tags: [
      TAGS.HISTORY,
      TAGS.RELIGION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Cannon",
    year: "1313",
    tags: [
      TAGS.SCIENCE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Car",
    year: "1886",
    tags: [
      TAGS.SCIENCE,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Video Cassette",
    year: "1962",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Cave paintings",
    year: "-30000",
    tags: [
      TAGS.HISTORY,
      TAGS.CIVILISATION,
      TAGS.PREHISTORY
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Compact Disc",
    year: "1979",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Ceramic",
    year: "-9000",
    tags: [
      TAGS.PREHISTORY,
      TAGS.SCIENCE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Cinema",
    year: "1885",
    tags: [
      TAGS.HISTORY,
      TAGS.CIVILISATION,
      TAGS.ART,
      TAGS.MOVIE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Color TV",
    year: "1938",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Dinosaur Extinction",
    year: "-65000000",
    tags: [
      TAGS.PREHISTORY,
      TAGS.HISTORY
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Disneyland",
    year: "1955",
    tags: [
      TAGS.CIVILISATION,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "DNA structure",
    year: "1953",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Dynamite",
    year: "1867",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Earth Globe",
    year: "1492",
    tags: [
      TAGS.HISTORY,
      TAGS.SCIENCE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Pyramids of Gizeh",
    year: "-2700",
    tags: [
      TAGS.HISTORY,
      TAGS.PREHISTORY,
      TAGS.CIVILISATION,
      TAGS.ART
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Electric Guitar",
    year: "1932",
    tags: [
      TAGS.ART,
      TAGS.SCIENCE,
      TAGS.MUSIC
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Euro",
    year: "1999",
    tags: [
      TAGS.HISTORY,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Fall of the Inca",
    year: "1572",
    tags: [
      TAGS.HISTORY,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Control of Fire",
    year: "-450000",
    tags: [
      TAGS.HISTORY,
      TAGS.PREHISTORY,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Fortnite",
    year: "2017",
    tags: [
      TAGS.GAME,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "French Revolution",
    year: "1789",
    tags: [
      TAGS.HISTORY,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "A song of ice and fire (book)",
    year: "1996",
    tags: [
      TAGS.ART,
      TAGS.LITTERATURE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Glasses",
    year: "1299",
    tags: [
      TAGS.SCIENCE,
      TAGS.FASHION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Harp",
    year: "-3000",
    tags: [
      TAGS.ART,
      TAGS.MUSIC
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Hiroshima Bombing",
    year: "1945",
    tags: [
      TAGS.HISTORY,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Hourglass",
    year: "900",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Instagram",
    year: "2010",
    tags: [
      TAGS.CIVILISATION,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Jaws Movie",
    year: "1975",
    tags: [
      TAGS.ART,
      TAGS.MOVIE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Birth of Jesus",
    year: "0",
    tags: [
      TAGS.HISTORY,
      TAGS.RELIGION,
      TAGS.PEOPLE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Death of J.Lennon",
    year: "1980",
    tags: [
      TAGS.ART,
      TAGS.PEOPLE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Death of Julius Caesar",
    year: "-44",
    tags: [
      TAGS.HISTORY,
      TAGS.PREHISTORY,
      TAGS.PEOPLE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Jurrassic Park",
    year: "1933",
    tags: [
      TAGS.ART,
      TAGS.MOVIE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "JFK's election",
    year: "1961",
    tags: [
      TAGS.HISTORY,
      TAGS.PEOPLE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Laptop",
    year: "1981",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Levi's Jeans",
    year: "1853",
    tags: [
      TAGS.FASHION,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Statue of Liberty",
    year: "1886",
    tags: [
      TAGS.CIVILISATION,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Lightbulb",
    year: "1879",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Lightning rod",
    year: "1752",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Lord of the rings (book)",
    year: "1954",
    tags: [
      TAGS.ART,
      TAGS.LITTERATURE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Lucy",
    year: "-320000",
    tags: [
      TAGS.HISTORY,
      TAGS.PREHISTORY,
      TAGS.CIVILISATION,
      TAGS.PEOPLE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Marilyn Monroe's death",
    year: "1962",
    tags: [
      TAGS.PEOPLE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Match",
    year: "1827",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Microprocessor",
    year: "1991",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Microscope",
    year: "1590",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Milk Brick",
    year: "1915",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Minecraft",
    year: "2009",
    tags: [
      TAGS.GAME,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Mini Skirt",
    year: "1962",
    tags: [
      TAGS.FASHION,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Mona Lisa",
    year: "1503",
    tags: [
      TAGS.ART,
      TAGS.PEOPLE,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Morse code",
    year: "1838",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Napoleon's birth",
    year: "1759",
    tags: [
      TAGS.PEOPLE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Nyan Cat",
    year: "2011",
    tags: [
      TAGS.ART,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Pangea",
    year: "-335000000",
    tags: [
      TAGS.HISTORY,
      TAGS.PREHISTORY
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Phone",
    year: "1876",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Piano",
    year: "1700",
    tags: [
      TAGS.ART,
      TAGS.MUSIC,
      TAGS.SCIENCE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Picasso's death",
    year: "1971",
    tags: [
      TAGS.PEOPLE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Printing Press",
    year: "1437",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Ramsses II death",
    year: "-1213",
    tags: [
      TAGS.PREHISTORY,
      TAGS.PEOPLE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Mozart's Requiem",
    year: "1791",
    tags: [
      TAGS.ART,
      TAGS.MUSIC
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Rosetta Stone's creation",
    year: "-196",
    tags: [
      TAGS.PREHISTORY,
      TAGS.ART,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Sign Language",
    year: "1593",
    tags: [
      TAGS.CIVILISATION,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Smartphone",
    year: "1992",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Snow White (movie)",
    year: "1937",
    tags: [
      TAGS.ART,
      TAGS.MOVIE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Spartacus' revolt",
    year: "-73",
    tags: [
      TAGS.HISTORY,
      TAGS.PREHISTORY,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Star Wars",
    year: "1977",
    tags: [
      TAGS.ART,
      TAGS.MOVIE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Adhesive tape",
    year: "1923",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Taylor Swift's birth",
    year: "1989",
    tags: [
      TAGS.PEOPLE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Telescope",
    year: "1609",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Thriller (M.Jackson)",
    year: "1982",
    tags: [
      TAGS.ART,
      TAGS.MUSIC
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Titanic (movie)",
    year: "1996",
    tags: [
      TAGS.ART,
      TAGS.MOVIE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Titanic's sinking",
    year: "1912",
    tags: [
      TAGS.HISTORY,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Toothbrush",
    year: "1498",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "TV",
    year: "1925",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "US independance",
    year: "1776",
    tags: [
      TAGS.HISTORY,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Venus de Milo",
    year: "-101",
    tags: [
      TAGS.ART,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Venus figurines",
    year: "-25000",
    tags: [
      TAGS.ART,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Wheel",
    year: "-3500",
    tags: [
      TAGS.CIVILISATION,
      TAGS.SCIENCE
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Windmill",
    year: "825",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "US Women vote",
    year: "1920",
    tags: [
      TAGS.HISTORY,
      TAGS.CIVILISATION
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Yoyo",
    year: "1959",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  },
  {
    name: "Zepplin",
    year: "1900",
    tags: [
      TAGS.SCIENCE,
    ],
    difficulty: DIFFICULTY.EASY,
    value: 100,
    rarity: RARITY.COMMON,
  }

]


let powerUps = {
  "fifty-fifty": {
    name: "fifty-fifty-name",
    description: "fifty-fifty-description",
    image: "fifty-fifty-image",
    price: 50,
    onActivate(board) {
      board.fiftyFifty();
    }
  },
  "bomb": {
    name: "bomb-name",
    description: "bomb-description",
    image: "bomb-image",
    price: 50,
    onActivate(board) {
      board.bomb();
    }
  },
  "reroll": {
    name: "reroll-name",
    description: "reroll-description",
    image: "reroll-image",
    price: 50,
    onActivate(board) {
      board.reroll();
    }
  },
  "lastdigits": {
    name: "lastdigits-name",
    description: "lastdigits-description",
    image: "lastdigits-image",
    price: 50,
    onActivate(board) {
      board.lastdigits();
    }
  },
  "oneup": {
    name: "oneup-name",
    description: "oneup-description",
    image: "oneup-image",
    price: 50,
    onActivate(board) {
      board.oneup();
    }
  },
  "shield": {
    name: "shield-name",
    description: "shield-description",
    image: "shield-image",
    price: 50,
    onActivate(board) {
      board.shield();
    }
  },
  "coinplus": {
    name: "coinplus-name",
    description: "coinplus-description",
    image: "coinplus-image",
    price: 50,
    onActivate(board) {
      board.coinplus();
    }
  },
  "coinx": {
    name: "coinx-name",
    description: "coinx-description",
    image: "coinx-image",
    price: 50,
    onActivate(board) {
      board.coinx();
    }
  },
  "change": {
    name: "change-name",
    description: "change-description",
    image: "change-image",
    price: 50,
    onActivate(board) {
      board.change();
    }
  }

}

let modifier = {
  "double-or-nothing": { // c'est github copilot qui a fait ça, et j'aime bien
    name: "double-or-nothing-name",
    description: "double-or-nothing-description",
    image: "double-or-nothing-image",
    onActivate() {
    },
  },
}

function FilterTags(filter, data){
    let newData = [];
    data.forEach(card => {
        filter.forEach(tag => {
            if (card[tag] != undefined)
                newData.push(card);
        })
    });
}

function FilterRarity(rarity, data){
    let newData = [];
    data.forEach(card => {
            if (card[rarity] == rarity)
                newData.push(card);
    });
}

/*

Power-ups :
 - 50/50 : Destroys half of the backcards
 - Bomb : Destroys 3 consecutive backcards
 - Reroll : rerolls current card
 - 20XX : Gives the last two digits of the year
 - 1UP : Have an extra life
 - Shield : cancels current modifier
 - Coin+ : gains +50 coins
 - Coinx : Gains coinsx1.5
 - Change of pace : Change the current modifier

Modifiers :
 - theme mania (x4): All cards are themed
 - time mania (x4): All cards are timed
 - NoZone : Nothing happens
 - Nopowers : You can't use powerups
 - Forgetful : Some cards are glitched and you can't see the year
 - Timebomb : you have 15s to place a card
 - Refill : Refills your power-ups
 - Goldrush : Gain coinsx5
 - Hint : Gives you the First two digits for cards

*/