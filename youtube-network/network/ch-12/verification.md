# Crooked Arithmetic: fact and legal review of stories.md (first five, series, top 10)

Reviewer: independent fact and legal check, 17 Nov 2026. Read with `stories.md` and `cases.md` in this folder; neither
was edited.

## How this was checked, and what could not be opened

- **CourtListener could not be read at all.** Every request (search pages, the API and a direct opinion URL) came back
  HTTP 202 through `readpage.py` or as a CloudFront "Request blocked" 403 when inspected, including after pauses. No
  docket or opinion was read there. Court records below come from copies the parties or the court published on
  justice.gov instead.
- **justice.gov files could be downloaded** (`curl` to the PDF and archive HTML pages, then `pdftotext`), even though
  the newer `/opa/pr/` article pages show a bot check. That gave the primary documents marked **[OPENED]** below:
  the 7th Circuit opinion in *US v. Andreas*, the government's 7th Circuit brief, DOJ Antitrust Division releases
  from 1996, the D. Minn. Petters and Coleman sentencing releases, eight W.D. Pa. Le-Nature's releases and the DOJ
  list of the 12 Dec 2024 commutations.
- Blocked or not reachable from this session: law.justia.com, mprnews.org (WebFetch), govinfo.gov, law.cornell.edu,
  sechistorical.org, minnesota.publicradio.org (the Petters search-warrant affidavit) and sec.gov (rate-limit page).
  Facts from those are marked **[SEARCH ONLY]**: seen in search-result text, not read in the document itself.
- Wikipedia was used only to find leads. Where a fact rests on Wikipedia alone it is marked unverified.
- 22 of the 25 shared web searches were used.

Status key: **conviction**, **plea**, **court finding**, **settlement** (no admission unless stated), **official record**
(a government release or filing), **attributed allegation**, **contested**, **wrong**, **unverified**.

---

## Part 1. The first five uploads and the upload-one beat sheet

### Upload 1: Tom Petters, "The Billionaire Whose Warehouses Were Empty"

**Verdict: GO WITH CHANGES.** The core story is well documented: an official release describes the scheme,
Coleman's role, the recordings and the "fake" quote. What has to change: the title (not "billionaire", not
"warehouses"), the dollar figure (use one figure and name its source), the cold open, the son's death year and the
"10,000" thumbnail.

**Dollar figure (sources differ).** The documents I could open give these figures:
- DOJ D. Minn. sentencing release, 8 Apr 2010: "**$3.7 billion** Ponzi scheme" (headline and text). [OPENED]
- DOJ D. Minn. Coleman sentencing release, 2 Sept 2010: "that **$3.7 billion** fraud scheme". [OPENED]
- FBI Minneapolis verdict release, 3 Dec 2009, titled "Federal Jury Finds Tom Petters Guilty of Orchestrating
  **$3.65 Billion** Ponzi Scheme". [SEARCH ONLY: title seen; the DOJ PDF copy, econ0365.pdf, now returns 404]
- Fox/AP at the verdict: "$3.5 billion" (news, not a record).
- The 8th Circuit opinion (663 F.3d 375, 9 Dec 2011) and the indictment could not be opened, so their figures are
  **unverified**.
- **Recommendation:** use "$3.7 billion" with the on-screen source "U.S. Attorney, D. Minn., sentencing release,
  8 April 2010". That is the government's figure after judgment, and the later Coleman release repeats it. Call it
  the size of the Ponzi scheme, never "losses" or "TVs worth". Two other official figures are gross flows, not
  losses, and must not be mixed up with it: about $12 billion through the NIR account (and roughly as much through
  EFBC) from 2003 to 2008, and about $35 billion wired into the PCI account.

| # | Claim as written | Status | What the sources say | Replacement wording |
|---|---|---|---|---|
| P1 | Title "The **Billionaire** Whose **Warehouses** Were Empty" | **wrong / unverified** | No record calls Petters a billionaire, and no rich-list entry was found. In the scheme DOJ describes, "no such purchases were made": no goods were bought, so no warehouse was "empty". His real businesses (Petters Warehouse Direct, Fingerhut, Polaroid) were real. | "The $3.7 Billion Empire Built on Fake Purchase Orders" or "The Electronics That Never Existed". |
| P2 | Alt title "$3,650,000,000 of TVs That Never Existed" | **wrong** (figure and goods) | $3.7B is the size of the scheme, not the value of goods. The goods were "electronic goods" (DOJ), not only TVs. | "$3.7 Billion in Electronics Deals That Never Happened". |
| P3 | Alt title "She Walked Into the FBI and Wore a Wire on Her Boss" | official record, but "the FBI" overstates | 8 Sept 2008: "Coleman and her attorney reported to authorities"; she "wore a recording device to tape conversations with Petters and others" (DOJ, 8 Apr 2010). | "She Went to the Authorities, Then Wore a Wire on Her Boss". |
| P4 | Thumbnail "$3.65B OF NOTHING"; empty warehouse image | figure: see above; image misleading | | Text "$3.7B" with an image of a purchase order stamped "FAKE": Petters's own word on the tapes, per DOJ. A warehouse image only if labelled as an illustration. |
| P5 | Alt thumbnail "10,000 FORGERIES (the number White testified to)" | **attributed testimony, reported** | MPR, 5 Nov 2009, headline "Witness says he forged 10,000 documents for Tom Petters" [SEARCH ONLY]. The transcript was not seen. | Only as "a co-conspirator testified he forged about 10,000 documents", with the date of the testimony, after checking MPR or the transcript. Not as a bare fact. |
| P6 | Petters Co. raised money from lenders and hedge funds to finance electronics for resale to warehouse clubs; purchase orders forged; goods did not exist | **conviction + official record** | DOJ: investors funded PCI "to purchase merchandise that was to be resold to retailers... no such purchases were made"; documents showed sales to "big-box retailers, such as Costco and Sam's Club". | OK as written. Say "big-box retailers such as Costco and Sam's Club", as DOJ does. |
| P7 | Proceeds bought Fingerhut, Polaroid, Sun Country **[reported]** | **official record** (upgrade) | DOJ, 8 Apr 2010: "The companies he bought were purchased with proceeds of the PCI fraud, and they included Fingerhut, Polaroid, and Sun Country Airlines... Petters Group Worldwide." | Cite the DOJ release. |
| P8 | 8 Sept 2008, Coleman went to the government, then recorded Petters | **official record** | Both DOJ releases give 8 Sept 2008. | OK. |
| P9 | Coleman, "vice president" | official record, slightly different | DOJ: hired in 1993 as office manager, "later became an officer of PCI". Press calls her vice president of operations. | "a Petters Company officer who had started as office manager". |
| P10 | FBI raid 24 Sept 2008 | **official record** | Search warrants executed by the FBI, IRS-CI and Postal Inspection Service at headquarters, home and other locations. | Say "federal agents (FBI, IRS, Postal Inspection Service)". |
| P11 | Convicted on all 20 counts, Dec 2009 | **conviction** | 2 Dec 2009: 10 wire fraud, 3 mail fraud, 1 conspiracy to commit mail and wire fraud, 1 conspiracy to commit money laundering, 5 money laundering (DOJ). | Add the date, 2 Dec 2009. |
| P12 | 50 years, April 2010 | **conviction / sentence** | 8 Apr 2010, Judge Richard H. Kyle: "the longest term of imprisonment ever ordered in a financial fraud case in Minnesota history" (DOJ). | OK. |
| P13 | Coleman pleaded to one count of conspiracy, sentenced Sept 2010 ("reported one year in prison" in the beat sheet) | **plea + sentence**; "one year" is **wrong** in detail | Charged 6 Oct 2008, pleaded guilty 8 Oct 2008 to one count of conspiracy to commit mail fraud; sentenced 2 Sept 2010 to **a year and a day** (DOJ, 2 Sept 2010). | "a year and a day in prison". |
| P14 | Cold open: Sept 2008, agents take the purchase orders to "the two warehouse retailers named on them", who answer at once that the orders aren't theirs **[FBI release]** | **unverified as written** | Neither DOJ release I opened says this. The Star Tribune, reporting the search-warrant affidavit (26 Sept 2008), says agents approached Wal-Mart (Sam's Club's parent) and were told the orders were "fictitious" [SEARCH ONLY]. No Costco contact in 2008 was found. Trial coverage says Costco and GE Capital witnesses testified that they spotted false Petters documents **in 2000** (Star Tribune, "witnesses saw signs of fraud in 2000") [SEARCH ONLY]. | Either "Agents showed the purchase orders to Wal-Mart, owner of Sam's Club. According to the FBI's affidavit, the answer was that they were fictitious" (after reading the affidavit), or open on the documented quote: Petters, recorded by Coleman, "admitting that purchase orders were 'fake'" (DOJ). Drop "two retailers" and "immediate". |
| P15 | Petters heard calling the orders "fake" | **official record** | DOJ, 8 Apr 2010: "Within the first few hours of Coleman's recorded conversations, Petters was heard admitting that purchase orders were 'fake' and claiming 'divine intervention' was the only explanation for how he and his co-conspirators 'could of got away with this for so long.'" | Usable as a quotation of the DOJ release (credit it on screen). The audio or transcript is still needed before any waveform caption. |
| P16 | "2008: credit tightens, investors want money back [verify]" | **official record**, different detail | DOJ: by the end of 2007 the conspirators were struggling to find new investors and slow to pay Lancelot's notes. From Feb 2008, Petters and Greg Bell made more than 80 "round trip" transactions to make it look as if PCI was paying. | Use the DOJ account. Bell pleaded guilty (DOJ). |
| P17 | "Bob White and the brokers named in the trial" | official record (roles differ) | White: Petters's friend, recruited in 1999 to fake bank statements, then given the title of chief financial officer (DOJ). Larry Reynolds (NIR) and Michael Catain (EFBC, a sham company "above Catain's car wash") were the purported vendors, not brokers. Coleman, White, Reynolds, Catain and Bell had pleaded guilty by April 2010. | Name each only with their plea. Frank Vennes: 15 years (FBI, 18 Oct 2013, per a Wikipedia citation; **unverified**). |
| P18 | Petters testified he planned to tell the government himself | **attributed testimony** | MPR headline, 20 Nov 2009 [SEARCH ONLY]. The judge at sentencing, on his testimony: "It just didn't pass the smell test" (DOJ). | Present it as his testimony and pair it with the judge's remark. |
| P19 | 8th Circuit affirmed (2011) | **court finding** | No. 10-1843, decided 9 Dec 2011, 663 F.3d 375 [SEARCH ONLY; opinion not read]. | Add the date. |
| P20 | Raid on "Minnetonka HQ" | official record | Headquarters in Minnetonka (DOJ: "Petters's headquarters"; town from press). | OK. |
| P21 | "for more than a decade" | **official record** | PCI formed in 1994 and "used for fraudulent purposes from the start". Coleman said she had helped "over the previous ten years". | OK. |
| P22 | Production note: "the 2007 death of his son, John" | **wrong year** | Leads point to 2003: a 2004 report of a donation "to his late son's college" and a 2005 manslaughter conviction for the killing (Wikipedia citations to the Business Journal and WCCO; **unverified**). | Leave it out of the film, as the note already says. Correct the year in the notes or delete it. |
| P23 | Petters "alive and in federal custody" | official record (2010); later status reported | In custody since 3 Oct 2008 (DOJ). Wikipedia says FCI Milan as of 2026 (**unverified**). | Say "serving his sentence"; check the BOP locator before release. |
| P24 | Arrested 3 Oct 2008 after discussing fleeing; indicted Dec 2008 | **official record** | DOJ. On 1 Oct 2008 he suggested to White and Reynolds that they flee (DOJ). | Usable. Strong, documented material for the 17:00 section. |

**Legal notes for upload 1.** Petters is convicted, so everything in the DOJ release can be said as fact. Coleman,
White, Reynolds, Catain and Bell: describe them only through their pleas and the DOJ account. Feeder funds and
lenders (Lancelot, Vennes's Metro Gem, others) may be named only for what a plea, conviction or court ruling says. Do
not suggest that any lender, auditor or retailer knew of the fraud. "First Regional Bank" appears only in leads:
leave it out.

### Upload 2: Equity Funding, "The Insurance Company That Invented 64,000 People"

**Verdict: GO WITH CHANGES.** The facts are mostly sound, but one alternative title is **wrong** (Dirks was never
prosecuted), the "64,000" in the title has no primary source yet, and several dates need the trustee's report or the
Supreme Court opinion.

| # | Claim | Status | What the sources say | Replacement |
|---|---|---|---|---|
| E1 | Title: "Invented 64,000 People"; thumbnail "64,000 FAKE" | **unverified** | Leads say "more than 60,000 bogus life insurance policies" (Wikipedia). No primary source for 64,000 was found. The trustee's report (Robert Loeffler, 1974) is the document to use, and it could not be reached. It counts policies, not "people". | Until the trustee's report is read: "The Insurance Company That Invented Its Customers". Use "64,000 fake policies" only with the report on screen. |
| E2 | Alt title: "The Whistleblower They **Prosecuted** Instead" | **wrong** | Dirks faced an SEC administrative proceeding, not a criminal prosecution. The SEC found he aided and abetted violations and **censured** him; the Supreme Court reversed (Dirks v. SEC, 463 U.S. 646, decided 1 July 1983). [SEARCH ONLY: opinion text in search results] | "The Whistleblower the SEC Punished". |
| E3 | Central mystery: "why was the man who exposed it the one **put on trial**?" | **wrong** | As above. | "...the one the regulators came after?" |
| E4 | March 1973: Secrist "told" Dirks; cold open "a phone call from a **stranger**" | court record (date); "phone call from a stranger" **unverified** | The opinion: on 6 March 1973 Dirks "received information from Ronald Secrist, a former officer of Equity Funding" [SEARCH ONLY]. It doesn't say how or whether they knew each other. | "On 6 March 1973, a former Equity Funding officer, Ronald Secrist, told a New York analyst..." |
| E5 | Dirks investigated, told clients, some sold; pressed the WSJ and regulators | **court record** (WSJ, clients); "regulators" **unverified** | The opinion: Dirks urged WSJ Los Angeles bureau chief William Blundell to write a story; Blundell declined, doubting that so big a fraud could go undetected and fearing libel. Clients and investors liquidated holdings of more than $16 million (snippet, cut off). Dirks did not own or trade the stock himself (opinion; **verify** wording). | Name Blundell only as the opinion describes him. Say "Dirks didn't trade; some of the people he told did." |
| E6 | Trading halted; bankruptcy 5 April 1973 | trading halt **official record**; bankruptcy date **reported** | NYSE halted trading in late March 1973 (Wikipedia: after 26 March; the opinion gives the date). Bankruptcy 5 April 1973 (Wikipedia; **unverified** in a record). | Check both dates in the opinion and the 9th Cir. Loeffler case before scripting. |
| E7 | Goldblum pleaded guilty, eight years | **plea**, sentence **reported** | Leads: pleaded guilty, eight years, $20,000 fine, served about four. NYT headline "Goldblum Enters Equity Guilt Plea", 9 Oct **1974** [SEARCH ONLY]. | "pleaded guilty in 1974; sentenced to eight years". Confirm whether Goldblum is living before any characterisation beyond the plea. |
| E8 | "22 people pleaded guilty or were convicted" | **unverified** (indicted vs convicted) | Leads: 22 indicted in Nov 1973 and "in all, 22... either pled guilty or were convicted" (Wikipedia only). Wikipedia also says "numerous other employees... were never charged". | "Twenty-two people were charged", or confirm convictions from the court record. **Never** suggest guilt of uncharged employees, and name none. |
| E9 | SEC censure of Dirks "[verify: SEC administrative finding]"; "SEC ALJ decision 1978" | court record confirms the censure; date **unverified** | The Supreme Court records that the SEC censured him. The SEC opinion is usually dated 1981, with the D.C. Circuit affirming in 1982; neither was seen. | "The SEC censured him, the appeals court agreed, and in 1983 the Supreme Court threw it out." Add years only after reading the opinion. |
| E10 | Supreme Court reversal, 1983 | **court finding** | Decided 1 July 1983; reversed [SEARCH ONLY]. The 6-3 vote and Justice Powell's authorship are from memory: **verify**. | OK with the date. |
| E11 | Alt "The First Computer Fraud Was an Insurance Company" | **contested** | A popular claim with no authority behind it. | Drop it, or "one of the first frauds run on a computer". |
| E12 | Secrist "a **fired** executive" | **unverified** | The opinion calls him "a former officer". | "a former officer". |

**Legal notes.** Dirks may be living (born 1934, **unverified**). He was vindicated by the Supreme Court, so never
suggest he did wrong. Secrist and other employees: describe them only from the court record. Thumbnail "HE TOLD THE
TRUTH" is fine.

### Uploads 3 and 4: ADM and Mark Whitacre ("The FBI's Star Witness Was Stealing Millions", Parts 1 and 2)

**Verdict: GO WITH CHANGES** for both parts. The 7th Circuit opinion [OPENED] supports the core story strongly,
including the embezzlement during cooperation. Must change: Part 1's ending (not "days after the raid"), the "three
years" wording, the story file's omission that **Whitacre was himself convicted of the price-fixing conspiracy**,
the fine (it covered **two** cartels), and "almost daily".

Primary documents: *US v. Andreas*, 216 F.3d 645 (7th Cir. 26 June 2000), justice.gov copy [OPENED]; government's
7th Circuit brief (Nos. 99-3097 etc.) [OPENED]; DOJ Antitrust releases of 15 Oct 1996 and 3 Dec 1996 [OPENED].

| # | Claim | Status | What the sources say | Replacement |
|---|---|---|---|---|
| A1 | In 1992 Whitacre became an FBI cooperator; on **5 Nov 1992** he told agent Brian Shepard about the price-fixing | **official record** | Government brief: "On November 5, 1992... Whitacre became a cooperating witness for the United States". The 7th Cir. names Special Agent Brian Shepard. The first tape was a 9 Nov 1992 call. | OK; cite the brief. |
| A2 | The extortion claim: an Ajinomoto employee demanding money over a "mole" sabotaging the plant; "described as non-existent"; "why he invented it is still debated" | **court account**; "still debated" **contested** | 7th Cir.: Whitacre told Mick Andreas that an Ajinomoto engineer, "Fujiwara", offered to sell **the name of the saboteur** for $10 million. "The story was a lie." Dwayne Andreas called the CIA, which passed it to the FBI. The court says Whitacre made it up "to cover up the embezzlement". | State the court's account and credit it ("the appeals court found..."). Present other explanations only as attributed views (Eichenwald's book), not as an open question the record leaves blank. |
| A3 | Records "for three years" (alt title "...for Three Years") | **wrong** | 7th Cir.: "For the next two-and-a-half years". The cartel ran June 1992 to 27 June 1995 (DOJ). | "...for Two and a Half Years", or drop the number. |
| A4 | Central mystery: agents "spoke to him almost daily" | **wrong** | 7th Cir.: FBI agents met him "more than 150 times"; he made 120 to 130 tapes. | "met him more than 150 times". |
| A5 | June 1995 FBI raid | **official record** | 27 June 1995: search warrant at ADM (Decatur) and Heartland Lysine (Chicago); "These raids ended the cartel." | Add the date. |
| A6 | ADM pleaded guilty, $100M criminal fine, Oct 1996 | **plea** (official record), wording incomplete | DOJ, 15 Oct 1996: $100 million fine, "the largest criminal antitrust fine ever", for "two international conspiracies" in **lysine and citric acid**. The 3 Dec 1996 release says ADM had pleaded and been sentenced in October. A $70M / $30M split is in search results only. | "ADM pleaded guilty to fixing lysine and citric acid prices and paid $100 million, then the largest criminal antitrust fine ever." |
| A7 | Andreas and Wilson convicted (1998), imprisoned (1999) | **conviction** | One-count Sherman Act indictment, 3 Dec 1996, of Andreas, Whitacre, Wilson and Kazutoshi Yamada (Ajinomoto). Jury conviction after a 2-month trial; new trial motions denied 30 Dec 1998. Sentenced 9 July 1999 to **two years and a $350,000 fine** each. The 7th Cir. affirmed and **remanded for longer sentences** for leadership roles. The final terms after resentencing are **unverified**. Yamada was never tried ("remains a fugitive", 1999 brief). | Use these facts. Say "their sentences were later increased on appeal" only after confirming the new terms. Don't call Yamada guilty: say "charged; never tried". |
| A8 | Whitacre "pleaded guilty to fraud and tax charges"; prison 4 March 1998; nine years; "longer than the executives he helped convict" | sentence **court record**; plea details and date **reported** | 7th Cir.: "serving a 108-month sentence for embezzlement". **The 1999 brief adds: "Whitacre was also convicted" of the lysine conspiracy** (tried in absentia at his own insistence; he dropped his appeal). The 4 March 1998 date and the plea's counts come from Wikipedia only. | "Whitacre was serving nine years for fraud when a jury also convicted him of the price-fixing he had helped expose." The comparison to Andreas and Wilson is accurate (108 months vs 24, before the remand). |
| A9 | Embezzlement "about $9 million to $9.5 million" | **court finding**: "at least $9 million" | 7th Cir.: "eventually stole at least $9 million... phony invoices... offshore and Swiss bank accounts", and "continued to embezzle after he began working for the government". $9.5M appears in leads only. | "at least $9 million, according to the appeals court". |
| A10 | "ADM tells prosecutors that Whitacre embezzled [verify]"; Part 1 ends "days after the raid" | **unverified**; "days after" likely **wrong** | Leads: ADM fired Whitacre on **9 Aug 1995**, about six weeks after the raid (Wikipedia; **unverified**). Leads also say Whitacre first told his FBI handlers or lawyers. Who disclosed what, and when, is **contested** in the sources. | Part 1 ending: "Weeks after the raid, ADM fired its president of BioProducts and accused him of stealing from the company." Date it only from a contemporaneous news report or the C.D. Ill. record. |
| A11 | Suicide attempt (CBS) | **reported** | Reported in Eichenwald and press; date August 1995 per leads. | One non-graphic line, no method. Under YouTube's advertiser guidelines, fleeting, non-graphic mentions are acceptable; keep it out of titles and thumbnails. |
| A12 | "FBI and DOJ officials later questioned that length" | **attributed opinion** | Leads: retired FBI supervisor Dean Paisley and two agents spoke publicly in 2008 ("Had it not been for the fraud conviction, he would be a national hero"). A former prosecutor supported clemency. Sources are news and a 2009 documentary, not records. | Quote only from a named, dated news report, attributed: "Retired FBI supervisor Dean Paisley later said..." Not "the FBI said". |
| A13 | Part 2 ending: the debate over whether his sentence was just | **attributed opinion** | Eichenwald called it "excessive" (This American Life, 15 Sept 2000, per leads). Real and ongoing in public commentary. | Fine, with both sides attributed. |
| A14 | Mental health ("delusional", bipolar diagnosis) | **reported** (health information about a living person) | In Eichenwald and the press. | Leave out, or attribute in one line to the published book. No diagnosis stated as fact. |
| A15 | Thumbnail "HE WORE THE WIRE"; alt "BOTH CRIMES" | supported | The court describes a body recorder and the embezzlement. | OK. Don't show AI faces of Whitacre or the Andreases. |
| A16 | "Supermarket to the world" | official record | The 7th Cir. calls it ADM's "self-professed" slogan. | OK. |
| A17 | Other good, documented detail | court record | Whitacre "lied to the FBI during the probe, failed polygraph tests, bragged to his gardener"; claimed Shepard told him to destroy tapes, "later recanted it in a sworn affidavit"; the FBI also videotaped cartel meetings. | Usable, credited to the 7th Circuit. |

**Legal notes.** Whitacre, Mick Andreas and Wilson should be treated as living (deaths not checked). All three are
convicted, so the convictions and the court's findings can be stated. Do **not** suggest that Dwayne Andreas or other
ADM executives knew of or approved the embezzlement. That is one author's speculation (Lieber, via Wikipedia), so
leave it out or attribute it clearly as one writer's theory. Don't name Asian executives other than as charged or
convicted in DOJ releases.

### Upload 5: Le-Nature's, "The Bottled Water Fortune That Was 88% Fiction"

**Verdict: GO WITH CHANGES.** The DOJ releases [OPENED] support the story strongly and give **different headline
numbers** from the story file. Replace the $275M / $32M "custodian" figures (unverified) with the court-record
figures.

| # | Claim | Status | What the sources say | Replacement |
|---|---|---|---|---|
| L1 | Title "88% Fiction"; alt title and thumbnail "$275M? $32M."; cold open "$275 million claimed, $32 million real" (custodian) | **unverified** (no custodian report seen); the official numbers differ | DOJ W.D. Pa., 3 Jan 2012 (Tammy Andreycak sentencing): "its reported gross sales for 2005 in the amount of approximately **$287 million** included a total of nearly **$247 million** of fabricated sales documented by both false invoices and false deposit records." That makes about 86% fabricated. | Title "The Bottled Water Company That Faked $247 Million in Sales"; thumbnail "$287M REPORTED. $247M FAKE."; cold open on those two numbers, credited "U.S. Attorney, W.D. Pa., 3 Jan 2012". Keep the custodian's figures only if the bankruptcy record is read. |
| L2 | Podlucky pleaded guilty; 20 years, Oct 2011; fraud, money laundering, tax evasion | **plea + sentence** | Sentenced 20 Oct 2011 by Senior Judge Alan N. Bloch to 20 years plus 5 years' supervised release (DOJ). He was among the five who "pleaded guilty earlier" (DOJ, 28 July 2011). | OK. |
| L3 | "loss put at $685 million by DOJ" | **court finding** (upgrade) | "Judge Bloch found that the evidence showed the loss caused by Podlucky's scheme was $685 million." The indictment says $806 million was advanced to the company in all. | "A federal judge found the loss was $685 million." Don't use $806M as a loss. |
| L4 | "restitution about $661 million [reported]" | official record, but for **other defendants** | $661M was the loss and restitution ordered for Robert Lynn, Jonathan Podlucky and Donald Pollinger (DOJ, Jan 2012). Gregory Podlucky's own restitution figure was not in his release. | Use $685M (loss) for Gregory, or confirm his restitution from the judgment. |
| L5 | Wife and son imprisoned; "the son for laundering money through jewels later auctioned" | **conviction**; detail wrong | Jury verdict, 29 Nov 2011: **both** Karla and G. Jesse Podlucky guilty of money laundering charges (conspiracy to commit money laundering) for selling three diamonds and seven sapphires bought with scheme money, through Sotheby's in Oct 2009 and Apr 2010, for about $2.9M. Sentenced 26 Apr 2012: Karla 51 months, Jesse 108 months (DOJ). | "His wife and son were convicted by a jury of laundering money by auctioning gems bought with the company's money; she got 51 months, he got nine years." |
| L6 | Commuted by President Biden "after about 13 years [verify date and terms]" | **official record**; "13 years" **unverified** | DOJ Pardon Attorney list: "Gregory J Podlucky, Western District of Pennsylvania, October 20, 2011, 20 Years", among the **1,499** people granted commutation on **12 Dec 2024**. News reports say that grant covered people already on COVID-era home confinement (TribLive, AP) [SEARCH ONLY]. The warrant's terms were not read. | "On 12 December 2024, President Biden commuted his sentence, one of 1,499 commutations that day." Don't say how long he spent in prison or whether he was at home unless a source states it. |
| L7 | Gems and watches; mansion | **official record** | "$30 million of precious gems and jewelry" and "$10 million constructing a mansion, which was never finished" (DOJ, 20 Oct 2011). The 29 Nov 2011 release says $33 million on gems and jewelry. | Use "about $30 million (DOJ)". Don't mention watches unless a source does. |
| L8 | Accounting director's guilty plea | **plea** | Tammy Andreycak, Director of Accounting, kept "a second set of books at the direction of" Podlucky. Pleaded guilty; 5 years (3 Jan 2012). | Usable. |
| L9 | Others convicted | **plea / conviction** | Robert Lynn (chief sales officer): jury convicted on 10 counts, 15 years. Andrew Murin (consultant): 10 years, $258M loss. Jonathan Podlucky (production manager) and Donald Pollinger (equipment vendor who signed false audit confirmations): 5 years each. | Name each only with their outcome. |
| L10 | Bankruptcy "late 2006" | official record | November 2006 (DOJ). | "November 2006". |
| L11 | Central mystery: convinced "banks, **Wachovia's investment bankers** and **two audit firms**", sales "**eight times** bigger" | lenders: **official record**; auditors and Wachovia bankers' role: **civil allegations only**; "eight times" **wrong** | DOJ names lenders "including Wachovia Bank, NA and AIG Capital Equipment Finance" as the defrauded parties, and says "forged documents were presented to auditors to pass audits". On DOJ numbers, reported sales were about 7 times real sales ($287M vs about $40M). | "How did a mid-sized bottler fool its lenders and auditors into believing sales about seven times what they were?" Treat Wachovia and the auditors as **deceived** parties. Their civil suits (Kirschner v. K&L Gates, Harbinger v. Wachovia) were claims; describe outcomes only from the rulings. |
| L12 | Index line "5 indicted in $806 million Le-Nature's Ponzi case" (TribLive) | official record | The 2 Mar 2011 superseding indictment named five; $806M is the amount alleged to have been taken from lenders and investors in all. | OK as a description of the indictment. |

**Note:** the DOJ release of 29 Nov 2011 misdates Gregory Podlucky's sentence as "Oct. 20, 2010". It was 2011, per
the release of 20 Oct 2011.

**Legal notes.** All the named family members were convicted, but they are living private individuals: no comment on
their lives beyond the record. The Ligonier mansion is fine in archival or aerial shots only if the footage is
licensed. Don't show the current owners or occupants.

---

## Part 2. The three series and their endings

### Series A, ADM (above)
- **Part 1 ending, as written ("days after the raid, ADM tells prosecutors its informant has been stealing"):
  NOT CONFIRMED and probably wrong on timing.** The documented ending is that weeks after the 27 June 1995 raid
  (August 1995, per leads), ADM fired Whitacre and accused him of embezzlement. **Get the date from a contemporaneous
  news report** (AP, NYT, Chicago Tribune) or the C.D. Ill. record before release.
- **Part 2 ending (the sentencing debate): real.** Attribute both sides. Add the documented closing fact the story
  file left out: **he was convicted alongside the men he taped.**

### Series B, Allen Stanford
| # | Claim | Status | Sources | Fix |
|---|---|---|---|---|
| S1 | Convicted 13 of 14 counts, 6 March 2012, after a six-week trial; 110 years on 14 June 2012 | **conviction** (multiple reports of the DOJ release) | DOJ release "Allen Stanford Sentenced to 110 Years in Prison for Orchestrating $7 Billion Investment Fraud Scheme" (bot check; title from search); AP, Al Jazeera. Judge David Hittner; prosecutors had asked for 230 years. | OK. |
| S2 | "about $7 billion" CDs | official record (DOJ title) | As above. | OK. |
| S3 | Part 1 ending: SEC sued and froze the bank in Feb 2009; not yet criminally charged; indicted June 2009 **[verify]** | **reported** | Search results put the indictment in June 2009; the indictment itself was not seen. | "Months would pass before any criminal charge." Date it from the DOJ indictment release. Ending is **real**. |
| S4 | Jail injury, claimed memory loss | **reported** | His lawyers claimed amnesia after a 2009 jail beating; he was found fit after evaluation, and trial began in January 2012 (AP). The competency rulings were not read. | Attribute the amnesia claim to his lawyers. Credit the finding of fitness to the court once the ruling is read. |
| S5 | CFO James Davis pleaded guilty and testified | **plea**, reported | Search results call Davis "the government's key witness" and say he pleaded guilty. His sentence (often reported as five years) is **unverified**. | OK without the sentence. |
| S6 | Receiver's 2023 bank settlements "over $1.6 billion in 2023 (TD $1.205B, Trustmark $100M; banks denied liability)" | **settlement**; total **wrong as worded** | Feb 2023: deals with the three remaining defendants totalling **$1.345 billion**, bringing the total from five banks to about **$1.6 billion** (Baker Botts; Law.com, 27 Feb 2023) [SEARCH ONLY]. The TD and Trustmark amounts and the denials of liability are **unverified** here. | "In 2023, days before trial, the last bank defendants settled for $1.345 billion, taking bank settlements to about $1.6 billion. The banks admitted no wrongdoing [confirm wording]." |
| S7 | Total recoveries "above $2.7 billion" | **unverified** | Baker Botts (receiver's counsel), July 2024: "more than $2.5 billion". A change.org petition claims $2.82B; it is not a usable source. | "more than $2.5 billion by mid-2024 (receiver's counsel)". |
| S8 | Part 2 ending: distributions and what's still open in 2026 | **real**, needs the receiver's current report | An SEC litigation release (LR-26255, Feb 2025) reportedly says the final judgments against the Stanford entities are deemed satisfied [SEARCH ONLY]. Victim groups dispute remaining Swiss funds (non-official). | Read the receiver's latest court report (N.D. Tex.) before scripting. Without it, end on the documented 2023 settlements and the share recovered. |
| S9 | SEC Inspector General (Kotz) report, March 2010 | **reported** | Not read. | Get the years of the earlier SEC examinations from the report itself. The alt title "SEC's 12-Year Miss" depends on it. |
| S10 | Title "The Billionaire Knight..." | supported historically; **verify** | Knighted by Antigua and Barbuda (reported); reportedly later stripped. | Fine with "former". Avoid AI likenesses. |

Stanford is living and in prison: stick to the conviction and court findings. Bank defendants: never imply guilt;
"settled without admitting wrongdoing" if that is in the settlement papers.

### Series C, Crazy Eddie
| # | Claim | Status | Sources | Fix |
|---|---|---|---|---|
| C1 | Title "Crazy Eddie: **The Family** That Skimmed..." | **legal risk / partly wrong** | At the July 1993 trial Eddie and Mitchell Antar were convicted and **Allen Antar was acquitted of all charges** (several reports, incl. the SEC litigation release via search). | "Crazy Eddie: The Skim, the Stock and the Fugitive". Never say "the family" did it. Name each relative only with their own outcome. |
| C2 | Eddie Antar convicted 1993, reversed 1995 | **conviction, then court finding** | July 1993 jury verdict (17 counts, reported). The 3d Circuit reversed in April 1995 because the trial judge's sentencing remarks created an appearance of bias (SEC release via search). Citation "US v. Antar (3d Cir. 1995)" is **unverified** (53 F.3d 568 from memory). | OK; confirm the citation. |
| C3 | Later pleaded guilty and served time | **plea**; year and sentence **unverified** | Plea 1996 (reports). Sentence given as eight years (Wikipedia) vs "less than seven years served" (other); 82 months unconfirmed. Died Sept 2016 (NPR). | "pleaded guilty in 1996 rather than face a new trial"; give the sentence only from a record. |
| C4 | Fled; arrested in Israel 1992; extradited Jan 1993 | **reported** | UPI and JTA leads. | OK as reported. |
| C5 | Sam E. Antar pleaded guilty and testified about skimming before the IPO | **plea + his testimony** | His own account (also on his own website, which is not independent). | Attribute every detail: "Sam E. Antar later testified, and has said since..." He is living and outspoken: quote only his published words. |
| C6 | Part 1 ending: new owners count inventory and find it short | **real event**; figure **unverified** | The commonly cited $65 million shortfall was not found in any search result. | End on "the count came up short by tens of millions", or verify the figure in the E.D.N.Y. securities litigation or the SEC complaint. |
| C7 | Part 2 ending: how much money was recovered | **unverified** | SEC release LR-15251 (sec.gov blocked). | Ending is real only if the SEC and civil judgments are read. Otherwise say on screen that the total recovered isn't clear in the public record. |
| C8 | Swiss bank transfers (UPI 1993) | **reported** | | Attribute. |

---

## Part 3. The rest of the top 10 (as far as time allowed)

**Salad oil (De Angelis).** Sentence is **contested**: Time ("The Man Who Fooled Everybody") describes a ten-year
term with custody to the Attorney General, while others say 20 years after a guilty plea. Bankruptcy date 19 Nov 1963
**unverified**. "About $175 million across 51 banks" in one source vs the story's "$150-180 million across about 51
lenders": **unverified**. The title "Nearly Broke American Express" overstates; say "shook American Express" unless a
record shows insolvency risk. The Buffett angle is **unverified**; keep it out until sourced. De Angelis died in 2009
(not checked here): lower defamation risk, but the court cases must still carry the method.

**Phar-Mor (Monus).** Hung jury on all 126 counts, June 1994 (Deseret News); convicted on 109 counts, 26 May 1995
(Deseret/AP); 19 years 7 months (235 months) and a $1M fine, later reduced on appeal (Vindicator 2002/2003, release
Dec 2005); acquitted of jury tampering in 1998 (reported). All **reported**, not checked against records. The juror's
contempt plea is **unverified** (no source found). **Title problems:** "Faked $1 Billion of Inventory" is
**unverified** (the scheme is usually put at about $500M of overstatement), and "The $500 Million Fraud Paid for a
Basketball League" is **wrong framing**: the WBL took a small part of the money diverted. Monus may be living: stick
to the 109 convictions and the acquittal.

**Bayou (Israel).** 20 years, 14 Apr 2008 (Bloomberg, reported); failed to report 9 June 2008, SUV found on the Bear
Mountain Bridge 10 June with "Suicide is Painless" in the dust (ABC/AP, reported); surrendered 2 July 2008; two more
years for bail-jumping (CBS, reported); Marino 20 years (Courthouse News). The fake auditor's details are
**unverified**. **Ad suitability:** drop the alt title "'Suicide Is Painless'" and keep any mention of suicide out of
titles and thumbnails. "NOT DEAD" is acceptable.

**Rothstein.** 50 years in June 2010, 10 years more than prosecutors recommended (reported; the exact date 9 June
**unverified**). The government withdrew its Rule 35 reduction motion after alleging Rothstein gave false
information; Judge Cohn allowed the withdrawal in April 2018 (AP), and the 11th Circuit upheld that in 2019 (Law.com).
The story's "dropped (2018)" is correct; add the reason as the government's allegation. **Legal:** the "FBI sting
against alleged organised-crime figures": name only people convicted. "$1.2 billion" in the title is **unverified**.

Not reached: the alternates (Horwitz, HealthSouth, Refco, MiniScribe).

---

## Corrections the story file needs

1. **Petters title:** drop "Billionaire" and "Warehouses Were Empty". Use "The $3.7 Billion Empire Built on Fake
   Purchase Orders" or "The Electronics That Never Existed".
2. **Petters figure:** use $3.7 billion everywhere, sourced to the DOJ D. Minn. sentencing release of 8 Apr 2010
   (repeated 2 Sept 2010). Change "$3.65B" in the title, alt title and thumbnail.
3. **Petters cold open:** rewrite. "Two retailers... immediate answer" is not in any record seen. Use either the
   Wal-Mart/"fictitious" passage from the search-warrant affidavit (after reading it) or the DOJ-quoted "fake" and
   "divine intervention" lines from the recordings.
4. **Coleman's sentence:** "a year and a day", not "one year". Her plea was to conspiracy to commit **mail fraud**.
5. **Petters's son:** the death was in 2003 (per leads), not 2007. Keep it out of the film.
6. **"10,000 forgeries":** attribute it as White's testimony (MPR, 5 Nov 2009) or drop it from the thumbnail.
7. **Equity Funding:** delete "The Whistleblower They Prosecuted Instead" and "put on trial". Dirks was censured by
   the SEC, never prosecuted. Hold "64,000" until the trustee's report is read; "22 convicted" may be "22 charged".
8. **ADM:** "two and a half years", not three; "met more than 150 times", not "almost daily"; the $100M fine covered
   **lysine and citric acid**; add that **Whitacre was also convicted** of the lysine conspiracy; embezzlement "at
   least $9 million" (7th Cir.); 5 Nov 1992 is confirmed (government brief); the extortion story's purpose is the
   court's account, not an open question.
9. **ADM Part 1 ending:** not "days after the raid". He was fired in August 1995 (to be dated from a contemporaneous
   source).
10. **Le-Nature's numbers:** replace $275M / $32M and "88%" with the DOJ figures: $287M reported 2005 sales, of which
    about $247M fabricated (about 86%). The loss of $685M is a court finding. $661M is other defendants' restitution.
    "Eight times" becomes "about seven times".
11. **Le-Nature's family:** wife **and** son were convicted by a jury of money laundering (gems sold at Sotheby's);
    51 and 108 months.
12. **Le-Nature's commutation:** 12 Dec 2024, one of 1,499 (DOJ list). Drop "after about 13 years".
13. **Le-Nature's lenders and auditors:** describe Wachovia and the auditors as deceived parties; never imply
    complicity.
14. **Stanford:** 2023 settlements were $1.345B, bringing bank settlements to about $1.6B; total recoveries
    "more than $2.5B" (July 2024); read the receiver's current report for the ending.
15. **Crazy Eddie:** retitle to remove "The Family". Allen Antar was acquitted. Verify the $65M shortfall and the
    sentence before use.
16. **Phar-Mor and Bayou titles:** remove "$1 Billion" and "$500 Million... Paid for a Basketball League"; remove
    "Suicide Is Painless" from titles and thumbnails.
17. **Index of sources:** add the documents below to each episode's source list.

## Sources opened or relied on

Opened (primary):
- DOJ D. Minn., Petters sentencing, 8 Apr 2010: https://www.justice.gov/sites/default/files/usao-mn/legacy/2010/12/21/econ0413.pdf
- DOJ D. Minn., Coleman sentencing, 2 Sept 2010: https://www.justice.gov/sites/default/files/usao-mn/legacy/2010/12/21/econ0460.pdf
- US v. Andreas, 7th Cir., 26 June 2000: https://www.justice.gov/atr/case-document/file/486266/dl
- Government's 7th Cir. brief (1999): https://www.justice.gov/atr/cases/f3700/3757.pdf ; case page https://www.justice.gov/atr/cases/michae0.htm
- DOJ Antitrust, ADM plea, 15 Oct 1996: https://www.justice.gov/archive/atr/public/press_releases/1996/0988.pdf
- DOJ Antitrust, indictment of Andreas, Whitacre, Wilson, Yamada, 3 Dec 1996: https://www.justice.gov/archive/atr/public/press_releases/1996/1030.pdf
- DOJ W.D. Pa. Le-Nature's releases (archive): https://www.justice.gov/archive/usao/paw/news/2011/2011_october/2011_10_20_03.html ; .../2011/2011_november/2011_11_29_13.html ; .../2012/2012_april/2012_04_26_01.html ; .../2011/2011_march/2011_03_03_02.html ; .../2011/2011_october/2011_10_27_02.html ; .../2011/2011_july/2011_07_28_02.html ; .../2012/2012_january/2012_01_10_02.html ; .../2012/2012_january/2012_01_03_05.html ; .../2012/2012_january/2012_01_03_04.html (prefix https://www.justice.gov/archive/usao/paw/news/)
- DOJ Pardon Attorney, 12 Dec 2024 commutation recipients: https://www.justice.gov/pardon/december-12-2024-commutation-recipients

Seen in search results only (to be read before scripting):
- FBI verdict release, 3 Dec 2009: https://www.fbi.gov/minneapolis/press-releases/2009/mp120309.htm
- 8th Cir. Petters opinion: https://ecf.ca8.uscourts.gov/opndir/11/12/101843P.pdf
- MPR, 5 Nov 2009 (10,000 documents): https://www.mprnews.org/story/2009/11/05/petters-trial ; 20 Nov 2009: https://www.mprnews.org/story/2009/11/20/petters-defenserests
- Star Tribune, affidavit story 26 Sept 2008: https://www.startribune.com/sept-26-federal-officials-petters-tied-to-multi-billion-dollar-fraud-scheme/29817604 ; "witnesses saw signs of fraud in 2000": https://www.startribune.com/petters-trial-witnesses-saw-signs-of-fraud-in-2000/67235592/
- Petters search-warrant affidavit (MPR copy, blocked): https://minnesota.publicradio.org/features/2008/09/26_petters_warrant/Petters.PDF
- Dirks v. SEC, 463 U.S. 646: https://www.law.cornell.edu/supremecourt/text/463/646 ; https://www.govinfo.gov/content/pkg/USREPORTS-463/pdf/USREPORTS-463-646.pdf
- Fortune, "Those daring young con men of Equity Funding": https://fortune.com/article/those-daring-young-con-men-of-equity-funding
- TribLive on the Podlucky commutation: https://development.triblive.com/local/westmoreland/biden-commutes-20-year-sentence-of-former-latrobe-beverage-company-ceo-who-pleaded-guilty-to-fraud
- DOJ Stanford sentencing release (bot check): https://www.justice.gov/archives/opa/pr/allen-stanford-sentenced-110-years-prison-orchestrating-7-billion-investment-fraud-scheme ; Al Jazeera: https://www.aljazeera.com/amp/economy/2012/6/14/cricket-mogul-sentenced-to-110-years
- Baker Botts, July 2024: https://www.bakerbotts.com/news/2024/07/baker-botts-client-stanford-receiver-collects-$1-point-3-billion-from-bank-litigation-settlements ; Law.com, Feb 2023: https://law.com/texaslawyer/2023/02/27/stanford-ponzi-receiver-reaches-1-6b-in-settlements-with-five-banks ; SEC LR-26255: https://www.sec.gov/enforcement-litigation/litigation-releases/lr-26255
- Crazy Eddie: SEC LR-15251 https://www.sec.gov/files/litigation/litreleases/lr15251.txt ; NPR obituary https://www.npr.org/sections/thetwo-way/2016/09/12/493568772/eddie-antar-dies-at-68-started-crazy-eddie-chain-served-time-for-fraud
- Rothstein: AP via Washington Times, 16 Apr 2018 https://m.washingtontimes.com/news/2018/apr/16/judge-refuses-to-reduce-ponzi-schemers-50-year-sen/ ; Law.com 2019 https://law.com/dailybusinessreview/2019/10/01/no-reduced-sentence-for-disbarred-lawyer-scott-rothstein-11th-circuit-rules
- Phar-Mor: Deseret News https://www.deseret.com/1995/5/26/19214567/former-president-of-phar-mor-convicted-on-109-fraud-charges/ ; https://www.deseret.com/1994/6/24/19116585/jury-disagrees-on-all-126-counts-against-fired-phar-mor-president
- Bayou: Bloomberg https://www.bloomberg.com/news/articles/2008-04-14/bayou-s-israel-gets-20-years-for-hedge-fund-fraud ; CBS https://www.cbsnews.com/news/bail-jump-nets-hedge-scammer-2-more-years ; ABC11 https://abc11.com/archive/6240810/
- Salad oil: Time https://content.time.com/time/subscriber/article/0,33009,898315,00.html

Leads only (never cite): Wikipedia, "Tom Petters", "Mark Whitacre", "Equity Funding Corporation of America".

YouTube advertiser-friendly guidelines (local copy `sources-local/p6162278.txt`): fleeting, non-graphic, journalistic
references to suicide are allowed; keep them out of titles and thumbnails.
