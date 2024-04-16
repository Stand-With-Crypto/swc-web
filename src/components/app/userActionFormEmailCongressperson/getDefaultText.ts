const ORIGINAL_TEXT = `The House Financial Services Committee and the House Agriculture Committee in the U.S. House of Representatives passed historic, bipartisan legislation in July. I am asking you to support the bill when it comes to the floor for a full House vote.

The Financial Innovation and Technology for the 21st Century Act ("FIT21") addresses a pressing need for regulatory clarity in the United States for crypto. A vote for this bill is a vote to protect customers, promote job opportunities, and bolster national security.

As your constituent, I am asking you to vote for FIT21 to safeguard consumers and promote responsible innovation. Thank you.`

export function getDefaultText(dtsiPersonSlugs: string[]) {
  if (dtsiPersonSlugs.some(slug => HOUSE_LEADERSHIP_SLUGS.includes(slug))) {
    return ORIGINAL_TEXT // TODO replace once we have new text
  }
  if (dtsiPersonSlugs.some(slug => KEY_HOUSE_REP_SLUGS.includes(slug))) {
    return ORIGINAL_TEXT // TODO replace once we have new text
  }
  return ORIGINAL_TEXT
}

const KEY_HOUSE_REP_SLUGS = [
  'mary---peltola',
  'mike---thompson',
  'doris---matsui',
  'anna---eshoo',
  'ro---khanna',
  'jim---costa',
  'josh---harder',
  'eric---swalwell',
  'adam---schiff',
  'scott---peters',
  'brittany---pettersen',
  'yadira---caraveo',
  'james---himes',
  'lisa---bluntrochester',
  'darren---soto',
  'jared---moskowitz',
  'bishop---sanford',
  'henry---johnson',
  'nikema---williams',
  'lucy---mcbath',
  'david---scott',
  'ed---case',
  'jonathan---jackson',
  'mike---quigley',
  'janice---schakowsky',
  'bradley---schneider',
  'nikki---budzinski',
  'eric---sorensen',
  'sharice---davids',
  'morgan---mcgarvey',
  'troy---carter',
  'jared---golden',
  'jake---auchincloss',
  'seth---moulton',
  'richie---neal',
  'lori---trahan',
  'glenn---ivey',
  'hillary---scholten',
  'elissa---slotkin',
  'angie---craig',
  'dean---phillips',
  'steven---horsford',
  'dina---titus',
  'susie---lee',
  'ann---kuster',
  'josh---gottheimer',
  'mikie---sherrill',
  'gregory---meeks',
  'ritchie---torres',
  'donald---davis',
  'wiley---nickel',
  'jeff---jackson',
  'greg---landsman',
  'joyce---beatty',
  'emilia---sykes',
  'shontel---brown',
  'andrea---salinas',
  'chrissy---houlahan',
  'chris---deluzio',
  'seth---magaziner',
  'james---clyburn',
  'marc---veasey',
  'jasmine---crockett',
  'colin---allred',
  'vicente---gonzalez',
  'abigail---spanberger',
  'donald---beyer',
  'suzan---delbene',
  'marie---perez',
  'derek---kilmer',
  'gwen---moore',
  'bob---good',
  'andy---biggs',
  'chip---roy',
  'thomas---massie',
]

const HOUSE_LEADERSHIP_SLUGS = [
  'hakeem---jeffries',
  'katherine---clark',
  'pete---aguilar',
  'ted---lieu',
  'Joe---Neguse',
  'mike---johnson',
  'tom---emmer',
  'elise---stefanik',
  'gary---palmer',
  'john---duarte',
]
