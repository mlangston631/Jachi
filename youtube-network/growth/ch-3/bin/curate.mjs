// node curate.mjs out.json period in1.json in2.json ...
// Merges scout files, drops brand / news / celebrity / off-niche channels, keeps each video once.
import fs from 'node:fs';
const [out, period, ...ins] = process.argv.slice(2);
const EXCLUDE = new Set([
 // brands and official product channels (reach bought or from the brand)
 'Grok','Claude','OpenAI','Google Antigravity','LockedIn AI','monday.com','Applied Digital','Bell Business','NVIDIA','Google','Google Help',
 'Apple Support','Proton','IBM Technology','Higgsfield AI','OpenArt','Spectrum','Qt Group','Future Electronics','Stanford Online',
 'Manning Publications','Alliance for Responsible AI','Simplilearn','AI Engineer',
 // news, TV, institutions
 'CNN','CBC News','CNBC','MS NOW','ABC News','NBC News','BBC World Service','News18 Odia','Channel 4 News','60 Minutes','60 Minutes Australia',
 'Bloomberg Originals','Yahoo Finance','Insider','The Daily Show','New Scientist','The Deshbhakt','More Perfect Union',
 // celebrity / podcast / fame-driven
 'StarTalk','The Diary Of A CEO','The Diary Of A CEO Clips','Narendra Modi','Jay Shetty Podcast','Lex Fridman','Dwarkesh Patel','Lenny\'s Podcast',
 'TED','Dr Brian Keating','Mark Tilbury','Iman Gadzhi','Hank Green','Hannah Fry','Dan Martell','Nathan Doan Comedy','Vikas Kush Sharma',
 'Sahil Bloom','Joshua Weissman','Ali Abdaal','Tommy G','The Big Bang Theory','Meet Kevin',
 // off-niche (not tech explainers)
 'Disasters Explained','Stickman 616','The Escalist','PlayGameWithZubby','EverythingProfessor','Jason Graystone','Work With Paul','Nox Finance',
 'youSeeWhy','Continue Anyway','Popden','Fault Lines Official','Yorp','Talkin\' Bout','The Net Explainer','Filmy Nest','Kelevin','Book Tuber Hindi',
 'Peekaboo Kidz','Dither AI','Digital with Sreeresh','MrDalekJD','MACMACS','Nanou ASMR','Bluntly Explained','Data with Baraa','Satish Dhawale',
 'Jack Hartmann Kids Music','DIYAroundTheHome','Simple Tasks','Cyber Pathshala','Bang Rozak','Srikant Tech Official','Outdoor Prepper',
 'Technical Attachment','जोश Talks आशा','Mr. Ranks','Patrick Dang','Jordan Welch','Umar Punjabi','ExpHub - Prashant Kirad','DIGITAL INCOME PROJECT',
 'Skills Maker TV','Crayon Capital','Dr.Kun Dániel','Meanwhile in the USSR','САМ','Speak English with David','Raj Photo Editing and Music',
 'tavieenfilm','Victoria Morse','slayyyter','Lullorin','Anduril Industries','mixtechnical dk','Awara Biker','Naveen Nehra Edits','Melvin Wont Die',
 'Spring Rose Drama','CloverSHORT','Weel777','Rock City TV','Rank On Top','TechRx 360','Ramtech ENG','TechPP','Karakulya Explains','SkyDiscover',
 'Spidy Raj','pinnkpawz','War Machine Anatomy','Kartenovis','Firewall Breaker','Olivia Unplugged','Filmy Nest','Asad Ali TV','Quick Tutorials',
 'Saumya Singh','Sheryians AI School','The iScale','Ayushman Pandita','Mission JEET','Dither AI','Floris Knol','Sandeep Swadia','Metics Media',
]);
const seen = new Set(), vids = [];
for (const f of ins) for (const q of JSON.parse(fs.readFileSync(f, 'utf8'))) for (const v of q.videos || []) {
  if (seen.has(v.id)) continue; seen.add(v.id);
  if ([...EXCLUDE].some(x => v.channel === x || v.channel.startsWith(x.slice(0, 24)))) continue;
  vids.push({ ...v, query: q.query });
}
vids.sort((a, b) => (b.outlier ?? -1) - (a.outlier ?? -1));
fs.writeFileSync(out, JSON.stringify([{ query: 'curated', period, videos: vids }], null, 1));
console.log(vids.filter(v => v.outlier).length, 'curated videos with ratio ->', out);
