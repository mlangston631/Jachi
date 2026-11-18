// Ten channel kits. mark = SVG drawn in a 100x100 box, using currentColor (fg) and var(--ac) (accent).
export const channels = [
  {
    n: 1, slug: 'stick-ledger', name: 'Stick Ledger', handle: '@StickLedger',
    alts: ['@StickLedgerMoney', '@TheStickLedger'],
    niche: 'Stick-figure money and economics explainers',
    tagline: 'Money, explained with stick figures.',
    bg: '#FFF8E7', fg: '#1B1B1B', ac: '#E4572E', font: 'Inter',
    mark: `<circle cx="50" cy="24" r="11" fill="none" stroke="currentColor" stroke-width="6"/><path d="M50 35V66M50 46L30 56M50 46L72 38M50 66L36 88M50 66L64 88" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="32" r="9" fill="var(--ac)"/>`,
    description: `Money and economics, explained with stick figures and plain words.

Each video takes one idea (interest, inflation, taxes, debt, how banks work) and draws it out step by step, with the maths shown so you can check it yourself.

This channel is for education only. Nothing here is financial advice, and no video tells you what to buy or sell.`,
    keywords: 'money explained, economics explained, personal finance basics, compound interest, inflation explained, how banks work, stick figure explainer, finance for beginners',
    titles: [
      'Compound Interest, Drawn So You Can Actually See It',
      'Where Does Money Come From? (It Isn\'t the Printer)',
      'Inflation Explained With One Loaf of Bread',
      'What a Bank Really Does With Your Deposit',
      'Why a 30-Year Loan Costs So Much More Than the Price Tag',
      'Stocks vs Bonds, Explained With Two Stick Figures',
      'What Is a Recession, and Who Decides We\'re in One?',
      'How Credit Scores Work, Step by Step',
      'Tax Brackets: The Mistake Almost Everyone Makes',
      'The Rule of 72: Doubling Time in Ten Seconds',
    ],
    scriptTitle: 'Compound Interest, Drawn So You Can Actually See It',
    script: `[Stick figure holding one coin]
This is Sam. Sam has two hundred dollars a month to put away, and a question: does starting early really matter that much?

[Draw a second, identical stick figure]
This is also Sam, in another timeline. Same job. Same two hundred dollars. One difference: this Sam waits ten years to start.

[Timeline: 40 years vs 30 years]
Let's give both of them the same made-up return, seven percent a year, every year. Real life is bumpier. This is only to show the maths.

[Early Sam's pile grows slowly, then fast]
Early Sam saves for forty years. Total paid in: ninety-six thousand dollars. Total at the end: about five hundred and twenty-five thousand.

[Late Sam's pile]
Late Sam saves for thirty years. Total paid in: seventy-two thousand. Total at the end: about two hundred and forty-four thousand.

[Put the piles side by side]
Look at that. Early Sam paid in only twenty-four thousand dollars more, and finished with more than double.

[Zoom into the curve]
Here's why. Interest is paid on your money. Then next year, interest is paid on your money and on last year's interest. The pile earns, and then the earnings earn.

[Rule of 72 on a chalkboard]
A shortcut: divide seventy-two by the yearly rate. At seven percent, that's about ten years to double. So ten extra years isn't ten years of saving. It's one whole extra doubling.

[Both Sams wave]
That's compound interest. It isn't a trick, and it isn't a promise about any investment. It's just what happens when growth is left alone for a long time.

Next time: where money actually comes from. It isn't the printer.`,
  },
  {
    n: 2, slug: 'rise-and-ruin-files', name: 'Rise & Ruin Files', handle: '@RiseAndRuinFiles',
    alts: ['@RiseAndRuin_Files', '@TheRiseAndRuinFiles'],
    niche: 'Business and company story documentaries',
    tagline: 'How companies are built. How they fall.',
    bg: '#12161C', fg: '#F2EFE8', ac: '#D9A441', font: 'Bitstream Charter',
    mark: `<path d="M10 80L34 48L50 62L74 22" fill="none" stroke="var(--ac)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M74 22L90 78" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="74" cy="22" r="6" fill="currentColor"/>`,
    description: `Documentaries about how companies are built, and how they come apart.

Each film follows one business from its best decision to its worst: what the people inside knew, what they chose, and what it cost. Every date and figure comes from public records, filings and reporting, listed under each video.

These are stories, not advice. Nothing here is a recommendation to invest in anything.`,
    keywords: 'business documentary, company history, rise and fall, why companies fail, business case study, corporate history, startup stories, bankruptcy explained',
    titles: [
      'Kodak Invented the Digital Camera. Then Hid It.',
      'The Meeting Where Blockbuster Laughed at Netflix',
      'How Nokia Lost the Phone in Five Years',
      'Sears Had Everything Amazon Needed',
      'The Rise and Fall of BlackBerry',
      'Why Toys "R" Us Really Closed',
      'Pan Am: The Airline That Owned the Sky',
      'How LEGO Nearly Went Broke, and Came Back',
      'The Day Lehman Brothers Ran Out of Time',
      'Polaroid: Instant Success, Slow Collapse',
    ],
    scriptTitle: 'Kodak Invented the Digital Camera. Then Hid It.',
    script: `[Black screen. One line of text: "Rochester, New York. 1975."]
In 1975, a young engineer at Kodak named Steven Sasson built a strange machine out of spare parts. It was the size of a toaster. It took twenty-three seconds to record one black-and-white picture onto a cassette tape.

[Archive-style still of the prototype]
The picture was tiny, about a hundredth of a megapixel. But there was no film in it. It was the first digital camera.

[Boardroom illustration]
Sasson showed it to the people who ran the company. Their reaction, as he later told it, was polite, and worried. Kodak made its money from film, paper and chemicals. Every photograph taken in America was, in some way, a small payment to Kodak. A camera with no film was a camera with no payment.

[Text: "Keep it quiet."]
So the invention stayed in the lab.

[Graph: film sales rising through the 1980s and 1990s]
For a long time, that looked like the right call. Film kept selling. Kodak stayed one of the most recognised names in the world.

[Graph bends]
Then digital cameras got good enough. Then they got cheap. Then they moved into phones, and people stopped buying cameras at all.

[Text: "January 2012."]
In January 2012, Kodak filed for bankruptcy protection.

[Slow push in on the prototype]
Kodak didn't miss the future. It built the future, in its own lab, thirty-seven years early. What it couldn't do was choose the new thing over the thing that was already paying the bills.

[Title card]
This is Rise and Ruin Files. In the rest of this film: the patents Kodak held, the money it made from them, and the moment it was already too late.`,
  },
  {
    n: 3, slug: 'plain-circuit', name: 'Plain Circuit', handle: '@PlainCircuit',
    alts: ['@PlainCircuitAI', '@ThePlainCircuit'],
    niche: 'AI and tech explainers',
    tagline: 'AI and tech, in plain words.',
    bg: '#0B1020', fg: '#EAF2FF', ac: '#4FD1C5', font: 'Inter',
    mark: `<path d="M18 50H40M60 50H82M50 18V40M50 60V82" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><rect x="38" y="38" width="24" height="24" rx="5" fill="var(--ac)"/><circle cx="18" cy="50" r="6" fill="currentColor"/><circle cx="82" cy="50" r="6" fill="currentColor"/><circle cx="50" cy="18" r="6" fill="currentColor"/><circle cx="50" cy="82" r="6" fill="currentColor"/>`,
    description: `How AI and everyday technology actually work, in plain words.

No hype and no jargon. Each video takes one question (how a chatbot picks its next word, what a chip does, why your phone slows down) and answers it with simple pictures.

Where something is uncertain or still argued over, the video says so.`,
    keywords: 'AI explained, how AI works, artificial intelligence for beginners, tech explained, how chatbots work, large language models explained, how computers work, technology explainer',
    titles: [
      'How a Chatbot Picks Its Next Word',
      'What Is a "Token"? AI\'s Smallest Piece, Explained',
      'Why AI Makes Things Up',
      'What a Computer Chip Actually Does',
      'How Your Phone Knows Where You Are',
      'Training vs Using an AI: The Difference in Plain Words',
      'What Happens When You Press Enter on a Search',
      'How Image Generators Turn Noise Into Pictures',
      'Why Batteries Wear Out',
      'What "The Cloud" Really Is (It\'s a Building)',
    ],
    scriptTitle: 'How a Chatbot Picks Its Next Word',
    script: `[A sentence on screen with a blank at the end: "The cat sat on the ___"]
Finish this sentence. You probably said "mat". Maybe "sofa". Almost certainly not "volcano".

[Words appear with bars beside them: mat, sofa, floor, volcano]
You just did, in your head, the one thing a chatbot does. It looks at the words so far and asks: what's likely to come next?

[The sentence breaks into small chunks]
First, it chops the text into small pieces called tokens. A token can be a whole word, or part of one.

[Chunks flow into a box labelled "model"]
Those pieces go into the model: a very large pile of numbers that were adjusted, during training, by reading an enormous amount of text.

[Out comes a list with percentages]
Out comes a list. Every possible next piece, each with a chance. "Mat", high. "Sofa", lower. "Volcano", nearly zero.

[A dice icon picks one]
Then it picks one. Usually a likely one, but not always the top one, which is why the same question can get a different answer twice.

[The picked word joins the sentence; the loop repeats]
That word is added to the sentence. And the whole thing runs again, for the next word. And the next. A long answer is this one small step, repeated hundreds of times.

[A confident-looking but wrong sentence appears]
This also explains its strangest habit. It is built to produce text that sounds likely. Likely and true usually overlap. Not always. When they don't, you get a confident sentence that's simply wrong.

[Title card]
So: no thinking ahead in sentences, no looking things up unless it's given a tool to do so. One piece at a time.

Next: why it makes things up, and what actually reduces it.`,
  },
  {
    n: 4, slug: 'farther-light', name: 'Farther Light', handle: '@FartherLight',
    alts: ['@FartherLightSpace', '@TheFartherLight'],
    niche: 'Science and space',
    tagline: 'Space and science, one question at a time.',
    bg: '#0A0A1A', fg: '#F4F1FF', ac: '#9B8CFF', font: 'Inter',
    mark: `<circle cx="38" cy="58" r="22" fill="var(--ac)"/><ellipse cx="38" cy="58" rx="36" ry="10" fill="none" stroke="currentColor" stroke-width="4" transform="rotate(-20 38 58)"/><path d="M78 14L81 24L91 27L81 30L78 40L75 30L65 27L75 24Z" fill="currentColor"/>`,
    description: `Space and science, one question at a time.

How far is a light-year? Why is the sky dark at night? What is inside a neutron star? Each video answers a single question with real numbers and clear pictures, and links the sources underneath.

When scientists don't know yet, the video says that too.`,
    keywords: 'space explained, science explained, astronomy for beginners, how big is the universe, light year explained, solar system, physics explained, space documentary',
    titles: [
      'How Far Is a Light-Year, Really?',
      'Why Is the Night Sky Dark?',
      'What Would Happen If the Sun Vanished for a Day?',
      'How Big Is the Biggest Star We Know?',
      'Where Does Space Begin?',
      'Why the Moon Always Shows the Same Face',
      'What Is Actually Inside a Black Hole? (What We Know and Don\'t)',
      'How We Measured the Speed of Light',
      'Voyager 1: The Farthest Thing We\'ve Ever Sent',
      'Why Is Mars Red?',
    ],
    scriptTitle: 'How Far Is a Light-Year, Really?',
    script: `[A torch switches on in the dark]
Switch on a torch. The light leaves at about three hundred thousand kilometres every second. In one second it could circle the Earth more than seven times.

[Earth, a line racing to the Moon]
At that speed, the Moon is a little over one second away.

[Line continues to the Sun]
The Sun is about eight minutes and twenty seconds away. So the sunlight on your window right now left the Sun before you started this video.

[Counter spinning: one year]
Now let that light keep going for a whole year. The distance it covers is one light-year: about nine and a half trillion kilometres.

[Text: "A light-year is a distance, not a time."]
That's the part people mix up. A light-year isn't a length of time. It's how far light gets in one.

[Zoom out to a single nearby star]
So how far is the nearest star beyond the Sun? Proxima Centauri is about four and a quarter light-years away. Light, the fastest thing there is, needs more than four years to get there.

[A small probe drifting]
And us? Voyager 1 is the farthest spacecraft we've sent. It travels at roughly seventeen kilometres every second. At that speed, covering the distance to Proxima Centauri would take around seventy-five thousand years. And Voyager isn't even pointed that way.

[Night sky]
One more thing. Because light takes time to arrive, looking far away is looking back in time. You see that star as it was more than four years ago.

[Title card]
That's a light-year. Next time: if there are that many stars, why is the night sky dark?`,
  },
  {
    n: 5, slug: 'moving-border', name: 'The Moving Border', handle: '@MovingBorder',
    alts: ['@TheMovingBorder', '@MovingBorderHistory'],
    niche: 'History documentaries with maps',
    tagline: 'History, told by the map.',
    bg: '#F1E7D0', fg: '#2B2118', ac: '#A63D2F', font: 'Bitstream Charter',
    mark: `<path d="M14 26L38 16L62 26L86 16V74L62 84L38 74L14 84Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M38 16V74M62 26V84" stroke="currentColor" stroke-width="3" opacity=".45"/><path d="M22 60C34 50 44 62 52 48S72 40 80 34" fill="none" stroke="var(--ac)" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 9"/>`,
    description: `History, told by the map.

Empires grow, split and vanish, and the borders show it. Each documentary follows one line on the map and explains why it moved: the wars, the money, the rivers and the people.

Dates and sources are listed under every video. Where historians disagree, both sides are shown.`,
    keywords: 'history documentary, animated history, history maps, rise and fall of empires, roman empire, world history explained, ancient history, medieval history',
    titles: [
      'Why the Roman Empire Split in Two',
      'How Mongolia Conquered Half the World in One Lifetime',
      'The Border That Moved 1,000 Years: Poland',
      'Why Egypt Is Shaped Like a River',
      'How Britain Ended Up With a Quarter of the Map',
      'The Empire You\'ve Never Heard Of: Khwarazm',
      'Why Africa\'s Borders Are So Straight',
      'The Rise and Fall of the Ottoman Empire, Mapped',
      'How Russia Got So Big',
      'Constantinople: The City Everyone Wanted',
    ],
    scriptTitle: 'Why the Roman Empire Split in Two',
    script: `[Map: the Roman Empire at full size, one colour]
By the third century, Rome ruled from Britain to Egypt. One empire, one emperor. And one very large problem: it was too big to run.

[Messenger line crawling across the map]
A message from the Rhine frontier to the Euphrates could take weeks. An emperor fighting on one border couldn't be on the other. And generals who won battles far from Rome kept deciding they should be emperor instead.

[Text: "Diocletian"]
In the 280s, a soldier-emperor named Diocletian tried a new answer. Don't hold it all yourself. Share it.

[Map splits into two shades, then four]
He took a co-emperor to rule the West while he held the East. In 293 he went further: two senior emperors and two juniors. Four men, four courts, one empire.

[The four pieces flicker and merge]
It worked while he was there to hold it together. After he retired, the four fought each other, and one man came out on top: Constantine.

[A new city appears on the Bosporus]
Constantine did something that mattered more than any battle. In 330 he opened a new capital in the East, on the site of Byzantium. Constantinople. The richest half of the empire now had a Rome of its own.

[Text: "395"]
The empire was joined and divided several more times. Then, in 395, the emperor Theodosius died and left it to his two sons: one took the East, one the West. It was meant to be one empire with two courts. It was never ruled by one man again.

[West fades; East stays]
The western half fell in 476. The eastern half lasted until 1453: almost a thousand years longer.

[Title card]
Rome didn't split because of one decision. It split because one line on the map kept turning out to be useful. Next: the city everyone wanted.`,
  },
  {
    n: 6, slug: 'candlelit-chronicle', name: 'Candlelit Chronicle', handle: '@CandlelitChronicle',
    alts: ['@TheCandlelitChronicle', '@CandlelitChronicleSleep'],
    niche: 'Sleep history (long, calm narration)',
    tagline: 'Quiet history for falling asleep.',
    bg: '#1A1420', fg: '#F3E9D8', ac: '#F2B45A', font: 'Bitstream Charter',
    mark: `<path d="M50 12C60 26 62 34 50 44C38 34 40 26 50 12Z" fill="var(--ac)"/><rect x="40" y="48" width="20" height="34" rx="3" fill="currentColor"/><path d="M26 86H74" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`,
    description: `Quiet history for falling asleep.

Long, slow, softly told stories about ordinary life in the past: a night in a monastery, a day in a Roman bakery, a winter on a medieval farm. No sudden sounds, no music changes, no adverts in the middle of the story where we can avoid them.

Put one on, turn the screen down, and let it go on without you.`,
    keywords: 'sleep history, history for sleep, boring history for sleep, bedtime stories for adults, calm narration, fall asleep to history, medieval life, relaxing documentary',
    titles: [
      'A Quiet Night in a Medieval Monastery (2 Hours)',
      'A Slow Day in a Roman Bakery',
      'Winter on a Medieval Farm',
      'The Long Walk of a Silk Road Caravan',
      'A Night Watch on Hadrian\'s Wall',
      'How a Medieval Book Was Made, Page by Page',
      'A Day at a Viking Harbour',
      'The Lighthouse Keeper\'s Year',
      'An Evening in an Ancient Egyptian Village',
      'How a Cathedral Was Built, Very Slowly',
    ],
    scriptTitle: 'A Quiet Night in a Medieval Monastery (opening)',
    script: `[Slow fade in: a stone corridor, one candle. Voice low and unhurried. Pause where the lines break.]

Good evening. There is nothing you need to remember tonight, and nothing you need to follow. If you drift off partway through, that is exactly what this is for.

Tonight we are going to spend one night in a monastery, somewhere in Europe, a little under a thousand years ago.

The day here follows a rule written in the sixth century by a man named Benedict. It divides the day, and the night, into work, reading and prayer. It has been followed, more or less, ever since.

It is evening. The last meal has been eaten in silence, while one brother read aloud. The bowls have been wiped and put away.

The brothers walk to the church for the last prayers of the day. The light is going. Nobody hurries.

After this, nobody speaks until morning. It is called the great silence. Doors are closed gently. Sandals are set down side by side.

In the dormitory there is a long row of narrow beds. A straw mattress. A wool blanket. One small lamp is left burning through the night, as the rule asks.

Outside, it is cold, and very dark, in a way that is hard to picture now. There are no lights on the hills. Only stars, and a great many of them.

The brothers sleep in their habits, so that they are ready.

Because in a few hours, in the middle of the night, a bell will ring. Softly. And they will get up, in the dark, and walk back down the cold stairs to sing.

But that is not yet.

For now, the lamp burns low. The stone holds the last of the day's warmth. And one by one, along the row, breathing slows.

[Continue at the same pace: the night office, the bakehouse before dawn, the scriptorium at first light.]`,
  },
  {
    n: 7, slug: 'paper-trail-cases', name: 'Paper Trail Cases', handle: '@PaperTrailCases',
    alts: ['@ThePaperTrailCases', '@PaperTrailCaseFiles'],
    niche: 'True crime (historic, well-documented cases)',
    tagline: 'Real cases. Told from the record.',
    bg: '#16181B', fg: '#EDEDED', ac: '#C8372D', font: 'Inter',
    mark: `<path d="M26 12H62L78 28V88H26Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M62 12V28H78" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M36 46H68M36 58H68M36 70H54" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".55"/><circle cx="66" cy="72" r="9" fill="var(--ac)"/>`,
    description: `Real cases, told from the record.

Thefts, frauds, disappearances and investigations, reconstructed from court files, police reports and newspapers of the time. Sources are listed under every video.

No guessing about guilt, no graphic detail for its own sake, and respect for the real people involved.`,
    keywords: 'true crime, true crime documentary, historic crimes, famous heists, unsolved cases, art theft, fraud cases, crime history',
    titles: [
      'The Day the Mona Lisa Walked Out of the Louvre',
      'The Man Who Sold the Eiffel Tower. Twice.',
      'D. B. Cooper: What the Files Actually Say',
      'The Great Train Robbery of 1963',
      'The Gardner Museum Heist: 81 Minutes',
      'Charles Ponzi and the Scheme That Took His Name',
      'The Hatton Garden Vault Job',
      'The Forger Who Fooled the Nazis',
      'The Antwerp Diamond Heist',
      'The Piltdown Man: Science\'s Longest Hoax',
    ],
    scriptTitle: 'The Day the Mona Lisa Walked Out of the Louvre',
    script: `[Text on black: "Paris. Monday 21 August 1911."]
On a Monday morning in August 1911, the Louvre was closed to the public. Cleaners and workmen had the building to themselves.

[Illustration: an empty wall with four iron hooks]
By the time anyone looked properly, there was a gap on the wall of the Salon Carré. Four iron hooks, and nothing hanging on them.

[Text: "It took more than a day for anyone to raise the alarm."]
At first, nobody panicked. Paintings were often taken away to be photographed. It was only the next day, when a visiting artist asked where she had gone, that the museum understood. The Mona Lisa had been stolen.

[Newspaper front pages]
The Louvre shut for a week. The borders were watched. The story ran on front pages around the world.

[Two silhouettes]
The police needed suspects, and found famous ones. The poet Guillaume Apollinaire was arrested and held for several days. His friend, a young painter named Pablo Picasso, was brought in for questioning. Both were let go. Neither had anything to do with it.

[A plain trunk in a small room]
For more than two years, the painting was simply gone. In fact it had barely moved. It was in Paris, in the lodgings of an Italian workman named Vincenzo Peruggia, who had once worked at the Louvre.

[Text: "Florence. December 1913."]
In December 1913, Peruggia took it to Florence and offered it to an art dealer. The dealer called in the director of the Uffizi gallery. Then they called the police.

[The painting back on a wall, crowds in front]
Peruggia said he had done it to bring her home to Italy. He served a short sentence. The painting went back to Paris in early 1914.

[Title card]
Before the theft, she was a masterpiece. After it, she was the most famous painting in the world. Next: how he got it out of the building.`,
  },
  {
    n: 8, slug: 'fine-print-plainly', name: 'Fine Print, Plainly', handle: '@FinePrintPlainly',
    alts: ['@FinePrint_Plainly', '@TheFinePrintPlainly'],
    niche: 'Legal, insurance and real-estate explainers',
    tagline: 'Contracts, cover and closings, in plain English.',
    bg: '#F7F7F4', fg: '#14213D', ac: '#2A9D8F', font: 'Inter',
    mark: `<circle cx="42" cy="42" r="26" fill="none" stroke="currentColor" stroke-width="6"/><path d="M61 61L86 86" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M30 36H54M30 46H54M30 56H44" stroke="var(--ac)" stroke-width="4" stroke-linecap="round"/>`,
    description: `The fine print, in plain English.

What a deductible is. What "escrow" means. What you are actually agreeing to in a lease. Each video explains one term or one document with a simple worked example.

This channel is general education only. It is not legal, insurance or financial advice, rules differ from place to place, and it can't tell you what to do in your own situation. For that, talk to a licensed professional.`,
    keywords: 'insurance explained, deductible explained, legal terms explained, real estate terms, escrow explained, how insurance works, lease explained, plain english law',
    titles: [
      'What a Deductible Actually Is',
      'Premium, Deductible, Copay: Three Words, One Picture',
      'What Is Escrow? A Plain-English Walkthrough',
      'How to Read a Lease: The Six Parts',
      'What "Liability" Means on a Car Policy',
      'Title Insurance: What It Covers and Why It Exists',
      'What Is a Lien?',
      'Term vs Whole Life Insurance: How Each One Works',
      'What Happens at a House Closing, Step by Step',
      'What "As Is" Means in a Contract',
    ],
    scriptTitle: 'What a Deductible Actually Is',
    script: `[A bill appears: $3,000]
Here's a repair bill for three thousand dollars. You have insurance. So who pays?

[The bill splits into two bars]
The answer is usually "both of you", and the word that decides the split is the deductible.

[First bar labelled "You: $500"]
A deductible is the part of a covered loss that you pay yourself before the insurance pays anything. Say yours is five hundred dollars.

[Second bar labelled "Insurer: $2,500"]
On this three-thousand-dollar bill, you pay the first five hundred. The insurer pays the remaining two thousand five hundred. This is a made-up example: real policies have limits and exclusions, and they differ.

[A smaller bill: $400]
Now a smaller bill. Four hundred dollars. That's under your deductible, so the insurer pays nothing, and there's usually no point in claiming.

[Seesaw: deductible on one side, premium on the other]
So why would anyone choose a bigger deductible? Because of the seesaw. The premium is what you pay to have the policy. In general, the more of each loss you agree to carry yourself, the lower the premium. A higher deductible usually means a lower premium, and the other way round.

[Calendar]
One more thing to check on your own policy: when the deductible applies. On many car and home policies, it applies each time you claim. On many health plans, it adds up across a year. The policy itself says which.

[Checklist]
So, three questions to ask of any policy: How much is the deductible? Does it apply per claim or per year? And could I actually pay it tomorrow if I had to?

[Title card]
This is general education, not advice about your policy. Next: premium, deductible and copay, in one picture.`,
  },
  {
    n: 9, slug: 'rain-on-slate', name: 'Rain on Slate', handle: '@RainOnSlate',
    alts: ['@RainOnSlateAudio', '@RainOnSlateSounds'],
    niche: 'Ambient, lofi and sleep sound',
    tagline: 'Long, quiet sound for sleep and focus.',
    bg: '#1F2A30', fg: '#E6EEF0', ac: '#7FB7BE', font: 'Inter',
    mark: `<path d="M10 40L50 14L90 40" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 54V66M42 60V78M56 54V70M70 60V82" stroke="var(--ac)" stroke-width="6" stroke-linecap="round"/>`,
    description: `Long, quiet sound for sleep, study and focus.

Rain, wind, distant thunder, a fire, a slow piano. Every recording runs for hours with no sudden noises, no voice and no change of scene, so nothing pulls you back.

All sound here is recorded or made for this channel.`,
    keywords: 'rain sounds for sleep, sleep sounds, ambient sounds, study music, focus sounds, relaxing rain, white noise, lofi ambient, thunderstorm sounds',
    titles: [
      'Rain on a Slate Roof, 8 Hours, Black Screen',
      'Steady Rain and a Fire, 3 Hours',
      'Distant Thunder Over the Sea, 8 Hours',
      'Night Train in the Rain, 3 Hours',
      'Wind in Tall Pines, 8 Hours',
      'Library at Closing Time, With Rain on the Windows',
      'Slow Piano and Light Rain for Studying, 2 Hours',
      'Tent in a Downpour, 8 Hours',
      'A Stream After Rain, 3 Hours',
      'Brown Noise With Soft Rain, 10 Hours',
    ],
    scriptTitle: 'How to make the first recording (no script needed)',
    script: `This channel has no narration, so here is the recipe instead.

1. Sound. Use rain you record yourself, or sound with a licence that allows commercial use on YouTube. Keep the licence. Sound copied from another channel is what gets these channels demonetized.

2. Loop. Build a section of at least 10 to 15 minutes before it repeats, with crossfades so the join can't be heard. A short loop is easy to notice and reads as low effort.

3. Level. Keep the volume even from start to end. No thunderclap louder than the rest. No fade-in that starts silent.

4. Picture. One still image or a black screen. Say "black screen" in the title when it is one: people search for it.

5. Length. Publish one 3-hour and one 8-hour version of each sound.

6. Make each video its own thing. A different place, different layers, a different picture. Ten uploads of the same rain with new titles is exactly what the inauthentic-content rule is aimed at.

7. Description. Say what the sounds are and how long the loop is. Don't claim it treats insomnia, anxiety or any condition.`,
  },
  {
    n: 10, slug: 'tiny-brave-things', name: 'Tiny Brave Things', handle: '@TinyBraveThings',
    alts: ['@TheTinyBraveThings', '@TinyBraveThingsShorts'],
    niche: '3D animated story Shorts',
    tagline: 'Very small heroes. Very short stories.',
    bg: '#FFE9D6', fg: '#2D1E2F', ac: '#F25F5C', font: 'Inter',
    mark: `<circle cx="50" cy="56" r="26" fill="var(--ac)"/><circle cx="41" cy="52" r="5" fill="currentColor"/><circle cx="59" cy="52" r="5" fill="currentColor"/><path d="M42 66Q50 73 58 66" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M50 30V16M50 16L62 20L50 25" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    description: `Very small heroes. Very short stories.

Animated shorts about tiny characters doing difficult things: a snail crossing a road, a pebble climbing a hill, a raindrop trying to get home. No words, so anyone can watch.

All characters and stories are original to this channel.`,
    keywords: 'animated shorts, 3d animation, short stories, cute animation, animated short film, wholesome shorts, no dialogue animation, family friendly shorts',
    titles: [
      'The Snail Who Crossed the Road',
      'A Pebble Climbs a Hill',
      'The Raindrop Trying to Get Home',
      'The Last Leaf Refuses to Fall',
      'An Ant and One Very Large Crumb',
      'The Candle Who Was Afraid of the Dark',
      'A Paper Boat Meets the Sea',
      'The Button That Rolled Away',
      'A Seed Under the Pavement',
      'The Little Cloud That Couldn\'t Rain',
    ],
    scriptTitle: 'The Snail Who Crossed the Road (30-second storyboard)',
    script: `No dialogue. Music: one soft marimba line that grows.

0-2s  HOOK. Ground level. A tiny snail with a small red flag on its shell looks across a huge grey road. On the far side: one green leaf.

2-6s  It takes a breath and sets off. A wide shot shows how far it is. Almost nothing has changed.

6-11s  A bicycle wheel rolls past, enormous. The snail ducks into its shell. A pause. One eye comes back out.

11-16s  Rain starts. The snail brightens: the road is wet, so it glides faster. Its first small smile.

16-21s  A puddle blocks the way. It looks left, then right, then climbs onto a floating leaf and paddles with its flag.

21-26s  The far kerb: a wall, from down here. It tries. Slides back. Tries again. Slides back. Plants the flag in a crack and pulls itself up.

26-29s  It reaches the green leaf, and stops. Another, smaller snail is already there, waiting. They share the leaf.

29-30s  END CARD. The red flag, planted beside the leaf. Loop point: the camera tilts up to the road, matching the first frame.

Notes: keep this snail and its flag in every episode so the channel has one character people recognise. Design it yourself; don't base it on an existing character.`,
  },
];
