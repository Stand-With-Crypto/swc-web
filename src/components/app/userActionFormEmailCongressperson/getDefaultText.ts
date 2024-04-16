export function getDefaultText(dtsiPersonSlugs: string[]) {
  if (dtsiPersonSlugs.some(slug => HOUSE_LEADERSHIP_SLUGS.includes(slug))) {
    return `Dear Congressperson,

I am your constituent and recently learned that the Financial Innovation and Technology for the 21st Century Act Bill [FIT 21 H.R. 4763] is being considered for a floor vote in the House.

FIT21 sets foundational rules for crypto that are pro-consumer and pro-job creation. It will protect 52 million Americans who own crypto and create millions of jobs in a critical technology sector that impacts our national security.

We have been waiting patiently for years for our lawmakers to protect us and strengthen America’s role in building the future of money and the internet.

I am excited to hear that the House has introduced FIT21. As part of the House leadership, your voice has a greater impact and I am asking you to support the Bill so it can be brought to a floor vote this session.`
  }
  if (dtsiPersonSlugs.some(slug => KEY_HOUSE_REP_SLUGS.includes(slug))) {
    return `Dear Congressperson,

I am your constituent and recently learned that the Financial Innovation and Technology for the 21st Century Act Bill [FIT 21 H.R. 4763] is being considered for a floor vote in the House.

FIT21 sets foundational rules for crypto that are pro-consumer and pro-job creation. It will protect 52 million Americans who own crypto and create millions of jobs in a critical technology sector that impacts our national security.

We have been waiting patiently for years for our lawmakers to protect us and strengthen America’s role in building the future of money and the internet.

I am excited to hear that the House has introduced FIT21 and I am asking you to co-sponsor the Bill so it can be brought to a floor vote this session.`
  }
  return `Dear Congressperson,

I am your constituent and recently learned that the Financial Innovation and Technology for the 21st Century Act Bill [FIT 21 H.R. 4763] is being considered for a floor vote in the House.

FIT21 sets foundational rules for crypto that are pro-consumer and pro-job creation. It will protect 52 million Americans who own crypto and create millions of jobs in a critical technology sector that impacts our national security.

We have been waiting patiently for years for our lawmakers to protect us and strengthen America’s role in building the future of money and the internet.

I am excited to hear that the House has introduced FIT21 and I am asking you to support the Bill so it can be brought to a floor vote this session.`
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
