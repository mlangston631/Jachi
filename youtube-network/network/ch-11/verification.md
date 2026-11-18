# Until Someone Talked: fact and legal review of stories.md (first five, series, top 10)

Reviewer: independent fact and legal check, 17 Nov 2026. Read with `stories.md` and `cases.md` in this folder; neither
was edited.

## How this was checked, and what could not be opened

- **CourtListener search pages could be read; CourtListener opinion pages could not.** `readpage.py` read the search
  result pages (with pauses, about one in four tries failing with HTTP 000 or 202). Every opinion page, and the
  citation redirects (`/c/Mass./339/487/`, `/c/F.2d/292/244/`, `/c/Mass./355/112/`), answered HTTP 202 on every try,
  after 20 to 30 second pauses. The API answered 401. So from CourtListener I have **case names, courts, dates,
  citations and the one-line snippets the search page shows** (quoted below as **[CL SNIPPET]**), never a full
  opinion. A snippet proves the words it contains; it does not prove anything else in the opinion.
- **justice.gov archive files could be downloaded** (`curl` on `/archive/usao/iln/chicago/<year>/`, then
  `pdftotext`). Opened in full **[OPENED]**:
  - U.S. Attorney, N.D. Ill., 25 Apr 2005, "14 Defendants Indicted ... 'Chicago Outfit' Named as RICO Enterprise ...
    18 Mob Murders and 1 Attempted Murder": https://www.justice.gov/archive/usao/iln/chicago/2005/pr0425_01.pdf
  - U.S. Attorney, N.D. Ill., 11 Jan 2007, "Deputy U.S. Marshal Charged with Illegally Disclosing Information about
    Protected Organized Crime Witness": https://www.justice.gov/archive/usao/iln/chicago/2007/pr0111_01.pdf
  - The 2007 verdict and 2009 sentencing releases were not in the archive under the obvious file names (404), and the
    archive index pages listed none, so they were **not read**.
- **Not reachable from this session (DNS refused by the session's network rules):** fbi.gov and www2.fbi.gov (the
  FBI's Brink's and Family Secrets history pages), vault.fbi.gov, ca5.uscourts.gov (the Fifth Circuit's own PDF of
  *Sharpe*), law.resource.org, law.justia.com, static.case.law, casetext, archive.org, wlox.com, the Exoneration
  Registry. Facts from those appear only through web-search result text: **[SEARCH ONLY]**.
- Wikipedia (via `readpage.py`) was used **only to find leads**. Anything resting on Wikipedia alone is marked
  **[LEAD]** and is unverified. Wikipedia's Featherstone page answered 429 and was not read.
- 11 of the 25 permitted web searches were used.

Status key: **conviction**, **plea**, **acquittal**, **court finding**, **official record** (government release or
filing), **attributed allegation**, **reported** (journalism or a participant's book), **contested**, **wrong**,
**unverified**.

---

## Part 1. The first five uploads and the upload-one beat sheet

### Upload 1: Brink's, Boston, 1950 ("The Brink's Gang Kept Quiet for Six Years. Then One of Them Was Shot.")

**Verdict: GO WITH CHANGES.** The core is solid and every principal is dead, so the defamation risk is low. What must
change: the title's chronology (he was shot in June 1954 and talked 19 months later, so the shot did not end six years
of silence); "hired gunman Burke shoots him" must be attributed (the FBI says Burke **allegedly** had been hired, and
he was never tried for it); the alt title "Solved by a Grudge"; and the beat sheet must state that the grand-jury
witnesses' appeals were about their **constitutional privilege against self-incrimination** until the outcomes are
read. A good, documented new detail: **O'Keefe himself was one of the witnesses who refused to answer the 1950s
federal grand jury** (*O'Keefe v. United States*, three cases).

| # | Claim as written | Status | What the sources say | Replacement wording |
|---|---|---|---|---|
| B1 | Title: "Kept Quiet for Six Years. Then One of Them Was Shot." | **misleading chronology** | Shot June 1954 [LEAD: 16 June]; talked January 1956 (FBI: "confessed in January 1956" [SEARCH ONLY]). The silence lasted 4.5 years before the shooting and 19 months after it. | "The Brink's Robbers Stayed Silent for Six Years. Then One of Them Talked." or "Six Years of Silence: The Brink's Robber Who Finally Talked" (the existing alt). |
| B2 | Alt: "America's Biggest Cash Robbery Was Solved by a Grudge" | **overstated / interpretive** | Leads call it the largest US robbery **at the time**. O'Keefe's motive is his own account (Considine, 1961); the FBI credits years of investigation plus his confession. | "The Biggest Robbery in America at the Time, and the Robber Who Talked". |
| B3 | 17 Jan 1950, 165 Prince Street, Boston | **court record** | *Commonwealth v. Geagan*, 339 Mass. 487 (1 July 1959): "robbery at 165 Prince Street, Boston, the premises of Brink's, Incorporated" [CL SNIPPET]. Date also in *Daly*, *Hooley*, *Carlson* (1st Cir. 1954) [CL SNIPPET]. | OK. |
| B4 | "about $1.2 million in cash and more in cheques and securities" | **court record** (cash); total **official record** | *Richardson v. Commonwealth*, 355 Mass. 112 (2 Jan 1969): "robbery on January 17, 1950, at the premises of Brink's, Incorporated, when $1,219,000 was stolen" [CL SNIPPET]. FBI: "more than $2.7 million in cash, checks, money orders, and other securities" [SEARCH ONLY]. Leads: $1,218,211.29 cash, $1,557,183.83 other. | "$1.2 million in cash, $2.7 million in all with cheques and securities". Put *Richardson* on screen for the cash figure. |
| B5 | Federal grand jury witnesses refused to answer; contempt cases to the 1st Cir. (*Maffie, Daly, Hooley, Carlson*, 1954) | **court record** (that the cases exist and what they arose from); **outcome unverified** | All decided 7 Jan 1954. Each "arising out of a federal grand jury investigation of the Brink's robbery in Boston on January 17, 1950" [CL SNIPPET]. Maffie appealed "a judgment imposing a sentence of imprisonment" (one year) for criminal contempt; Carlson eighteen months [CL SNIPPET]. **Also *O'Keefe v. United States* (three cases), 209 F.2d 223**, and a further *Hooley*, 209 F.2d 219. Whether the 1st Circuit affirmed or reversed (on the witnesses' Fifth Amendment privilege) could not be read. | Say "they refused to answer, were jailed for contempt and appealed". **Do not** frame the refusals as "the code" or call them guilty for refusing until the outcomes are read: if the court upheld their privilege, they were exercising a constitutional right. Add O'Keefe's own case: it is the strongest record of his silence. |
| B6 | "O'Keefe, in prison on another burglary, came to believe he had been cheated of his share; he was shot" | **partly wrong in order**; motive **claim** | He was jailed in Pennsylvania in 1950 (FBI says "on firearms charges" [SEARCH ONLY]; leads say burglary: **contested**). Leads put the shooting after his release, while out on bail on other charges. "Cheated of his share" is O'Keefe's own account. | "Jailed in Pennsylvania in 1950, O'Keefe later said his share had been kept from him. In June 1954, out of prison, he was shot and wounded." Check the Pennsylvania charge in the FBI file. |
| B7 | Shot "by a hired gunman, in an attempt reported as arranged by others in the crew"; beat sheet: "the hired gunman Elmer 'Trigger' Burke shoots him" | **attributed allegation** | FBI: Boston police arrested Burke 17 June 1954 on a machine-gun possession charge; Burke "allegedly had been hired by underworld associates of O'Keefe to assassinate him" [SEARCH ONLY]. Burke escaped the Suffolk County jail on 28 Aug 1954 [SEARCH ONLY]; he was never tried for the shooting (he was executed in New York in 1958 for another murder [LEAD]). | "Police arrested a professional killer, Elmer 'Trigger' Burke. According to the FBI, he had allegedly been hired by O'Keefe's underworld associates." Keep "attempts on his life" (plural) only from the FBI file or O'Keefe's book, attributed. |
| B8 | Shooting date "1954" / "June 1954 [confirm date]" | **official record** for the month; day **[LEAD]** | Burke's arrest the next day, 17 June 1954, is in FBI text [SEARCH ONLY]; 16 June from leads. | "June 1954". |
| B9 | "In January 1956 he talked, days before the deadline to charge them"; cold open "with days left" | **official record** (January 1956) + **court record** (charges) | FBI: O'Keefe "confessed in January 1956"; six arrested in January 1956 [SEARCH ONLY]. *Richardson* (court): the indictments "returned on January 13 and 16, 1956" [CL SNIPPET]. 6 Jan 1956 as the day he agreed to talk, and arrests on 12 Jan, are [LEAD]. | "In January 1956 he talked. The indictments came on 13 and 16 January, a day before the deadline." The deadline (17 Jan 1956, the six-year state limit) is still [LEAD]: name the statute only after reading *Geagan*. |
| B10 | Alt thumbnail "5 DAYS LEFT" | **[LEAD]**, usable with care | 12 Jan arrests to 17 Jan = 5 days (leads). The last indictment came with **one** day left (court). | "5 DAYS LEFT" only if the narration says it was the arrests; otherwise "1 DAY LEFT" (indictments, court record), which is also stronger. |
| B11 | "Eleven men knew" | **[LEAD]** | Leads list eleven: Pino, McGinnis, O'Keefe, Gusciora, Maffie, Baker, Geagan, Richardson, Faherty, Costa, Banfield. FBI text names ten of them [SEARCH ONLY]. | Use "eleven" after the FBI file confirms Banfield. |
| B12 | Eight men, life sentences, upheld on appeal (*Geagan*, 1959) | **conviction + court record** | FBI: in Aug 1956 Pino, McGinnis, Costa, Baker, Maffie, Geagan, Faherty and Richardson went to trial; "all eight were found guilty and sentenced to life in prison" [SEARCH ONLY]. *Geagan v. Gavin*, 292 F.2d 244 (1st Cir. 30 June 1961): the SJC "affirmed the judgments of sentence, *Commonwealth v. Geagan & Others*, 1959" [CL SNIPPET]. | OK; cite *Geagan v. Gavin* for "affirmed". |
| B13 | "Two named men can't be tried: one already dead, one dies before trial" | **official record** (Gusciora); [LEAD] (Banfield) | FBI: "Stanley Gusciora died of natural causes before the trial began" [SEARCH ONLY]. Banfield died 1955 [LEAD]. | OK. |
| B14 | O'Keefe's own sentence ("short") | **plea** (official record); term [LEAD] | FBI: O'Keefe "pled guilty to armed robbery" [SEARCH ONLY]. Four years, released 1960 [LEAD]. | "He pleaded guilty and served about four years" after confirming the term. |
| B15 | "paroles by about 1971" | **[LEAD]**, incomplete | Leads: Baker died in prison 1961, McGinnis in prison 1966; Geagan, Faherty, Maffie, Costa paroled 1969; all others by 1971. | "Two died in prison; the others were paroled between 1969 and 1971" after confirming. |
| B16 | "most of the money was never found" | **[LEAD]**; FBI likely | Leads: about $58,000 recovered. | Keep "most of the money was never found" (safe); give $58,000 only from the FBI file. |
| B17 | Beat sheet: planning from 1947; copied keys; ~7 pm; about 20 minutes; buzzer; coins left; alarm 7:37; truck found cut up near Stoughton; only evidence a cap, tape and rope | **[LEAD]** | All from Wikipedia, citing the FBI page and the Boston Globe of 18 Jan 1950. The FBI does display the robbers' cap as an artifact ("Brinks Robbery Cap", fbi.gov) [SEARCH ONLY]. | Confirm each in the FBI file before scripting. Show no lock-defeat or key-copying method in detail (advertiser rule on "how to gain unauthorized access"). |
| B18 | "One crew member is jailed for tax evasion" | **[LEAD]** | Leads: Maffie, nine months. | Confirm (D. Mass. 1950s) or cut. |
| B19 | Kidnapping of a crew member for ransom "by his own later account" | **claim** | Leads: O'Keefe kidnapped Costa. | Keep only as "O'Keefe later wrote that..." with the book on screen. |
| B20 | 1956 trial began August; O'Keefe testified | **official record** (August) ; testimony [LEAD/reported] | FBI: trial in August 1956 [SEARCH ONLY]. Press: "O'Keefe Says Brink's Holdup Gang Vowed To Kill Any Member Who Periled Others" (San Bernardino Sun, 18 Sept 1956) [LEAD]. | OK. Quote his testimony only from *Geagan* or a dated wire report. |
| B21 | Faherty and Richardson | **[LEAD]** | Leads: they fled and were caught on 16 May 1956 in Dorchester. So "arrests days before the deadline" covers six men, not eight. | "Six were arrested that week; two more were caught in May." |
| B22 | Closing line "no honour among the eleven; a grudge solved it" | **interpretive** | See B2. | "It was solved when one of them decided to talk." |

**Legal notes (Brink's).** All principals are dead (last, Maffie, 1988 [LEAD]). The Brink's employees are living
people's relatives at most: name them only as *Geagan* does. Ads: good; no guns at camera. Avoid detailed lock, key and
alarm methods. FBI photos are public domain; newspaper photos need a licence.

### Upload 2: Biloxi, the Sherry murders ("A Prison Con Paid for a Judge's Murder. His Law Partner Was Convicted.")

**Verdict: GO WITH CHANGES (title must change).** Peter Halat is **living** (born 1942 [LEAD]), was **not convicted of
murder**, and has always denied any part in the killings. He was convicted in 1997 of racketeering conspiracy,
obstruction of justice, conspiracy to obstruct justice and conspiracy to commit wire fraud [LEAD; cross-checked in
search results]. The title and the cold open ("convicts ... over the killings") imply a murder conviction. Also wrong:
the 1991 trial was not just "fraud".

| # | Claim | Status | What the sources say | Replacement |
|---|---|---|---|---|
| S1 | Title "A Prison Con Paid for a Judge's Murder. His Law Partner Was Convicted." | **misleading about a living person** | Halat: convicted of RICO conspiracy, obstruction and wire-fraud conspiracy (1997, 18 years); served about 15 years, released 2013 [LEAD; SEARCH ONLY]. He denies planning the murders. "Paid for" is not what the court describes: the motive in the 5th Circuit's account is money **missing** from a trust account. | "A Judge, His Wife and the Money Missing from a Prison Scam" or "The Biloxi Murders: How a Scam Run from a Louisiana Prison Ended in a Double Killing" (the existing alt, with "Louisiana prison" for "Angola" if Angola is not shown in a record). |
| S2 | Alt "The Dixie Mafia's Last Job" | **wrong + glamorising** | No source calls it that; "last job" romanticises a double murder. | Drop. |
| S3 | Thumbnail "WHO PAID?" | **insinuating** | Invites viewers to guess at uncharged people. | "THE MISSING MONEY" with the family-released portrait (no crime-scene images). |
| S4 | From Angola, Nix ran a fraud on men answering personal ads; money passed through Biloxi | **court record** (via lead quote) | *United States v. Sharpe*, 193 F.3d 852 (5th Cir. 20 Oct 1999) [CL SNIPPET: "the sordid tale of Kirksey McCord Nix's prison-based criminal empire and the related murders of Vincent and Margaret Sherry"]. The fuller passage ("lonely hearts scam designed to defraud homosexual men"; ads in national magazines; "hundreds of thousands of dollars") is quoted on Wikipedia as the 5th Circuit's words [LEAD]. | OK, after reading *Sharpe*. Tell the scam without mockery of its victims. |
| S5 | Money missing from Halat's trust account; Halat pointed at Judge Sherry | **court record** (via lead quote) | Quoted as the 5th Cir.: "In December 1986, Halat told Nix and Gillich that approximately $100,000 of Nix's money was missing from the office trust account. Halat indicated that he suspected Vincent Sherry" [LEAD]. | "Halat told Nix about $100,000 was missing, and said he suspected Sherry." Add, from a dated report or the record, that **Judge Sherry was never shown to have taken it** (leads say Halat did): protect the victim's name. |
| S6 | Margaret Sherry "a reform candidate" | **court record** in other words | Quoted as the 5th Cir.: "a Biloxi mayoral candidate critical of Gillich's operations" [LEAD]; leads also call her a city councilwoman. | Use the court's words. |
| S7 | Murdered at home, September 1987 | **reported** | 14 Sept 1987 (WLBT, WLOX, Sun Herald) [SEARCH ONLY]. | "September 1987" or "14 September 1987". Non-graphic, past tense, no scene photos. |
| S8 | "A 1991 federal trial convicted Nix and others of fraud" | **wrong (incomplete)** | Quoted as the 5th Cir.: in 1991 a jury convicted Nix, Gillich, Sheri LaRa Sharpe and John Ransom of wire fraud and conspiracy, "and it found Nix and Gillich guilty of travel in aid of murder-for-hire" [LEAD]. The appeal: *United States v. Sharpe, Gillich, Nix, Ransom*, 995 F.2d 49 (5th Cir. 1993) [CL SNIPPET; outcome not read]. | "In 1991 a federal jury convicted Nix and Gillich of travelling to further a murder for hire, and four people of wire fraud." Confirm the 1993 appeal's outcome before saying the convictions stood. |
| S9 | Gillich became a witness in 1994 | **reported** | Search results and leads agree on 1994; sentence reduced from 20 years; released July 2000 [SEARCH ONLY]. Gillich died 2012 [LEAD]. | OK as reported. |
| S10 | 1997: Nix, Halat and "the gunman Holcomb" convicted | **conviction** (reported); "gunman" **reported** | Leads and search: 1997 convictions of Nix (RICO and others), Halat (above) and Thomas Holcomb, described as the hired killer and given life; he died in prison in 2005 [LEAD]. Clarion-Ledger, 19 June 1997: "Holcomb admitted killings, say ex-cellmates" [LEAD]. Sharpe re-sentenced to five years for obstruction (reported). | "Thomas Holcomb, whom prosecutors called the hired killer, was convicted and sentenced to life." Confirm in *Sharpe* (1999). |
| S11 | Halat "by then a former mayor of Biloxi" | **court record** | *Sharpe* (5th Cir. 1993): "Peter Halat, mayor of Biloxi and an attorney" [CL SNIPPET]. Mayor 1989-93 [LEAD]. | "elected mayor two years after the murders". |
| S12 | "Halat denied planning the murders [court record of his appeal]" | **reported** (court source not seen) | Leads: "Halat still maintains he had no part in the murder plot." | State his denial in his words from a dated interview or his appeal brief. |
| S13 | Cold open: "a jury convicts the judge's former law partner ... over the killings" | **misleading** | See S1. | "Ten years later a jury convicted the judge's former law partner, by then a former mayor of Biloxi, of racketeering conspiracy in the case built around the murders. He has always denied any part in them." |
| S14 | Turning point "appeals" / WLOX 2001 "Defendants ... Allowed New Trials" | **headline misleading** | Search text: the 5th Cir. only let Nix and Ransom pursue appeals of rulings that had **denied** their new-trial motions; it did not order new trials [SEARCH ONLY]. *United States v. Nix*, 98 F. Supp. 2d 769 (S.D. Miss. 30 May 2000) exists [CL SNIPPET]; not read. | Don't use the WLOX headline. |
| S15 | "a daughter who pushed for justice" | **reported** | Lynne Sherry spoke publicly (Sun Herald). | Use her own published words; no private details. |

**Legal notes (Biloxi).** Living or possibly living: Halat (released 2013), Nix (life, federal prison [LEAD]), Sharpe,
Ransom (released 2003 [LEAD]). Describe each only by conviction and the court's account; never call Halat a murderer
or "the man who ordered" the killings. Gillich (dead) is "the alleged underworld boss" in the court's own words. Ads:
1987 homicide, not recent; no description of injuries.

### Upload 3 and 4: The Westies (two parts)

**Verdict: Part 1 GO WITH CHANGES; Part 2 GO WITH CHANGES.** The frame-up story is real: the National Registry of
Exonerations lists Featherstone, a judge vacated his 1986 conviction after his wife's recordings, and a court opinion
records Billy Bokun on tape acknowledging the shooting. Changes: the month and sentence of the 1986 conviction; Part
2's ending is **out of date** (the 2023 motion was denied and the Second Circuit affirmed on 9 July 2025); the
"framed" titles must be attributed; the 1977 and 1979 claims are unverified, and the 1979 trial ended in an
**acquittal** that must not be narrated as a collapse of a guilty case.

| # | Claim | Status | What the sources say | Replacement |
|---|---|---|---|---|
| W1 | Featherstone "convicted in 1986 of a 1985 murder"; Part 1 ends "March 1986 ... long sentence" | **wrong month** | Exoneration Registry (case 4389): convicted of Michael Holly's murder in **April 1986**, sentenced to **25 years to life**; a judge overturned the conviction in **September 1986** [SEARCH ONLY]. The year of the killing (1985) is [LEAD]. | "April 1986: convicted of Michael Holly's murder, 25 years to life." |
| W2 | "he concluded he had been set up by his own side"; titles "His Own Crew Framed Him", "Framed by His Own Crew", thumbnail "FRAMED" | **attributed** (registry) + **court record** of the tape | Registry: Featherstone concluded that Westies members and another man had colluded to set him up; his wife Sissy recorded Billy Bokun describing the shooting [SEARCH ONLY]. *Shannon v. Artuz*, 984 F. Supp. 807 (S.D.N.Y. 1997): Kenneth Shannon was convicted "for assisting one Billie Bokun in the shooting and killing one Michael Holly"; tapes in which Bokun acknowledged shooting Holly [CL SNIPPET + SEARCH ONLY]. *People v. Bokun* (N.Y. Sup. Ct. 1989): Bokun "was indicted in 1987 for the murder of Michael Holly" [CL SNIPPET]. **Bokun's own outcome on the Holly charge was not found.** | "Convicted of a Murder Another Westie Was Taped Admitting" or "He Said His Own Crew Set Him Up. His Wife Got It on Tape." Thumbnail "FRAMED?" or "THE TAPE". Name Bokun as the man on the tape and as charged; say "convicted" only once his outcome is confirmed. |
| W3 | Title "...So He Took Them All Down" | **overstated** | Coonan and co-defendants were convicted in 1988 (below); not "all". | "...So He Testified Against Them." |
| W4 | Coonan's crew "worked with the Gambino family [court: *Coonan*, 2d Cir. 1991]" | **unverified in the opinion** | Snippets of *Coonan*, 938 F.2d 1553 (2d Cir. 16 July 1991), confirm "the 'Westies' (also known as 'Coonan's Crew,' the 'Westside ...')" but no snippet showed "Gambino". Note there are **two** opinions under that citation (Coonan et al.; Kevin Kelly). | Keep "worked with the Gambino family" only after reading the opinion; part 1's title depends on it. |
| W5 | Featherstone "second in command" (alt title) | **court record** | *People v. Gotti* (N.Y. Sup. Ct. 3 Jan 1990): "Francis 'Mickey' Featherstone, the then second in command of the Westies organization" [CL SNIPPET]. | OK. |
| W6 | "the conviction was set aside" | **court record** (via registry) | Vacated September 1986 [SEARCH ONLY]. | Add the month. |
| W7 | 1987-88 federal racketeering trial; Coonan 75 years | **conviction + court record** | 2d Cir., *United States v. Coonan*, 143 F.4th 119 (9 July 2025): Coonan "was sentenced in 1988 to 75 years' imprisonment" (as summarised in search results) [SEARCH ONLY]. NYT 12 May 1988, "7 Westies Given Sentences Of Up to 75 Years in Prison" [LEAD]. | "In 1988 Coonan was sentenced to 75 years." |
| W8 | Featherstone's "four weeks of testimony" (cases.md) | **unverified** | Not found. | Cut, or source to AP trial coverage. |
| W9 | 1977 killing of the old boss, "Featherstone tried and acquitted [lead]" | **[LEAD]** (acquittal) | Leads: Mickey Spillane shot 1977; "Featherstone was arrested and acquitted". | If used: "Featherstone was charged and acquitted". **Never** imply he did it. |
| W10 | "the 1979 murder trial that collapsed after one witness died and another refused to testify" | **unverified; likely wrong framing** | Leads: in 1979 Coonan was **tried and acquitted** of the murder of Harold Whitehead and convicted on weapons charges. *Coonan v. Roberts*, 71 A.D.2d 563 (App. Div. 10 July 1979): "Defendant and one Featherstone were indicted by the Fourth March 1979 Grand Jury" [CL SNIPPET]. | "In 1979 Coonan was tried for murder and acquitted" (after confirming), with no suggestion the jury got it wrong. Cut the witness story unless a court or dated report gives it. |
| W11 | "his wife recorded crew members" | **reported** (registry) | See W2. | "his wife, Sissy, recorded Billy Bokun". |
| W12 | Bokun's case [court: *Bokun*] | **court record exists; content unverified** | *United States v. William Bokun*, 73 F.3d 8 (2d Cir. 27 Dec 1995): an appeal from an order "granting William Bokun's petition, pursuant to 28 U.S.C. § 2255, to vacate ..." [CL SNIPPET]. What was vacated and how the appeal ended were not read. | Read before scripting; describe only what it holds. |
| W13 | Part 2 ending: "2023, Coonan, by then in his late seventies, asks to be released; his mandatory release date is 2030. Unresolved: whether he will die in prison." | **out of date + age wrong** | Motion filed 18 Aug 2023 (First Step Act / home confinement) [LEAD]. The district court denied it; the **Second Circuit affirmed on 9 July 2025** (No. 24-2119, 143 F.4th 119), holding that compassionate release under 18 U.S.C. § 3582(c)(1) is not available for offences before 1 Nov 1987 [CL: case exists; holding SEARCH ONLY, Bloomberg Law and case summaries]. Born 21 Dec 1946 [LEAD]: 76 in 2023. Release date 1 June 2030 [LEAD: BOP locator not checked]. | "In 2023 Coonan, then 76, asked to go home. In July 2025 the appeals court ruled the law he relied on doesn't reach crimes as old as his. His listed release date is 2030 [check BOP]." Unresolved stays true. |
| W14 | Featherstone status ("alive, witness protection") | **reported** | Leads: pleaded guilty to racketeering, probation, freed Dec 1988, witness protection [SEARCH ONLY]. | Don't speculate about where he is. |

**Legal notes (Westies).** Living: Coonan (convicted), Featherstone (pleaded guilty, cooperator, admitted killings
only as reported), possibly Bokun, Shannon, Edna Coonan and other co-defendants. State only convictions and court
findings. Acquittals (1977, 1979) must be told as acquittals. Ads: a dismemberment is in the trial record: describe in
one factual line, no detail. Don't use MGM+ footage or posters.

### Upload 5: Operation Family Secrets, part 1 ("Dear FBI: The Son Who Wired His Father")

**Verdict: GO WITH CHANGES.** The two key documents are now **[OPENED]**: the 2005 indictment release and the 2007
Ambrose release, which says Nick Calabrese **agreed to cooperate in 2002** and could testify about **16 murders in
which he participated**. Changes: Frank Sr.'s "1995 conviction" (the dates are contested); the "Letter That Broke
the Chicago Outfit" alt (the FBI itself said it was not the end); the DNA detail must stay attributed; and the series
must reflect that **Nick Calabrese died in 2023** (reported) and that the government said **no protected witness was
ever in danger** from the leak.

| # | Claim | Status | What the sources say | Replacement |
|---|---|---|---|---|
| F1 | July 1998: a letter leaves a federal prison in Michigan; writer's father in the same prison | **reported** | Leads: letter of 27 July 1998 from FCI Milan, Michigan, where both were held; quote "This is no game. I feel I have to help keep this sick man locked up forever." Search results agree on the date [SEARCH ONLY]. DOJ 2007 confirms Milan as a federal prison used for Outfit inmates (James Marcello). | OK as reported. Read the quote only from Coen's book, the FBI story or Frank Jr.'s book, credited. |
| F2 | Frank Jr. recorded his father; recorder in headphones | **reported** | Leads only (headphones with a hidden microphone). | Attribute: "according to the FBI and Frank Jr.'s book". Thumbnail headphones fine, labelled illustration. |
| F3 | "Frank Sr.'s 1995 conviction with family members" | **contested** | Leads: incarcerated since 1995, "sentenced" for juice loans; another source: Frank Sr. and his sons pleaded guilty on 21 Mar 1997 [SEARCH ONLY]. | "In the late 1990s Frank Sr., his brother and his son were serving federal sentences for loansharking" until the N.D. Ill. docket gives the date. |
| F4 | Nick Calabrese became a cooperating witness [court: *Ambrose*] | **official record** (upgrade) | DOJ 11 Jan 2007: "In 2002, he agreed to cooperate ... including his brother Frank Calabrese, Sr., and brothers James and Michael Marcello"; admitted to WITSEC Aug 2002; able "to testify about 16 murders in which he participated and 22 other murders about which he had some secondary information" [OPENED]. | Use the DOJ wording and year. Note: press later said he admitted 14 murders (Tribune headline [LEAD]); use DOJ's figure and attribute it. |
| F5 | Part 1 ending: Nick, "linked by evidence (reported as DNA)" to the 1986 Fecarotta murder, decides to cooperate | **reported** (DNA) + **official record** (Fecarotta) | 2005 release lists "John Fecarotta, on or about September 14, 1986, in Chicago" and alleges it "was committed by Frank Calabrese, Sr., Nicholas Calabrese and others" [OPENED; allegation]. DNA: newspapers, per leads; the Mob Museum says Frank Jr. told the FBI about the glove left at the scene [SEARCH ONLY]. | "Newspapers later reported that he was confronted with DNA evidence." Ends on 2002, the year DOJ gives. |
| F6 | "The 2005 indictment charged the Outfit as an enterprise" | **official record** | 25 Apr 2005: 14 defendants; "Chicago Outfit" named as the RICO enterprise; 18 murders and 1 attempted murder, 1970-86; 11 charged with racketeering conspiracy [OPENED]. | OK. |
| F7 | "the 2007 trial convicted five; Frank Sr. got life" | **conviction** (reported) | Five (Calabrese Sr., James Marcello, Lombardo, Schiro, Doyle) convicted 10 Sept 2007 [LEAD]; Frank Sr. life, 28 Jan 2009; Marcello life, 5 Feb 2009 [SEARCH ONLY: news]. Appeal: *United States v. Schiro*, 679 F.3d 521 (7th Cir. 1 May 2012) [CL SNIPPET: case exists; earlier appeal *United States v. Calabrese*, 490 F.3d 575 (7th Cir. 2007)]. | OK. The "main appeal (to locate)" is *Schiro*. |
| F8 | Thumbnail "DEAR FBI" letter texture | fine | | Plain envelope, labelled illustration, unless the real letter is published. |
| F9 | Alt title "The Letter That Broke the Chicago Outfit" | **overstated** | FBI SAC Grant, 2005: the arrests "do[] not signal the end of their reign in Chicago" [OPENED]. | "The Letter That Started Operation Family Secrets". |
| F10 | Alt "A Mob Family That Testified Against Itself" | **supported (reported)** | Frank Jr. and Nick testified (reported). | OK. |
| F11 | Central mystery "could the government keep them alive?" | **overstated** | DOJ 2007, on the leak: "the investigation, so far, has not uncovered any evidence that either this witness or any other was ever in danger, and there is no evidence that any attempt was made to harm any protected witness" [OPENED]. | "...and could the government keep his cooperation secret?" |

**Legal notes (Family Secrets).** Frank Sr. died 25 Dec 2012 [LEAD]; Nick Calabrese died in 2023 (Chicago Sun-Times,
14 Mar 2023; CBS) [SEARCH ONLY], so cases.md's "whereabouts protected" is out of date. Frank Jr. is living and a
public author: use his book, attributed; leave out his drug use and family-abuse claims unless quoted from his own
book. Doyle and Schiro: state only their racketeering-conspiracy convictions; the 2005 release's murder allegations
against Schiro and others are **allegations**, and the jury did not resolve every murder (below). Ambrose: see series B.

---

## Part 2. The three series: each part's ending

### Series A: The Westies
- **Part 1 ends** on the 1986 conviction: real and documented, but **April 1986, 25 to life** (W1). The "unresolved:
  who did" is fair as a cliffhanger; Part 2 must answer it with the tape and *Shannon*, not with a verdict against
  Bokun that hasn't been confirmed.
- **Part 2 ends** on the 2023 bid: **must be updated** to the 9 July 2025 Second Circuit ruling (W13). The unresolved
  question (will he die in prison) remains true.

### Series B: Operation Family Secrets
- **Part 1 ends** on Nick's decision: real (DOJ: 2002). Keep the DNA as "reported".
- **Part 2**: the deputy marshal's case is **official record**: John Thomas Ambrose, charged 11 Jan 2007 with theft of
  government property for disclosing Nick's status, cooperation and travel while in WITSEC; Michael Marcello's prison
  visits to James Marcello at Milan were recorded (five conversations, Jan-June 2003) describing an inside source,
  "the Babysitter" [OPENED]. Conviction and the 7th Cir. affirmance (*United States v. Ambrose*, 668 F.3d 943, 2012)
  are as stories.md says but **not read**; *United States v. Ambrose*, 792 F. Supp. 2d 968 (N.D. Ill. 3 Feb 2010)
  exists [CL SNIPPET]. **Must add** DOJ's statement that no witness was shown to be in danger (F11). Ambrose is living:
  say only what the conviction and the DOJ release say. Do not use his father's case except as the DOJ release states it.
- **Part 2 ends** on Judge Zagel's warning: the quote ("The organization whose existence you testified to will not
  forgive or relent in their pursuit of you") is [LEAD] from the Tribune, Nick's sentencing 26 Mar 2009 (12 years 4
  months, [SEARCH ONLY]). Read it from the Tribune or the transcript. The jury deadlocked on at least one murder (the
  D'Andrea count against Marcello, which the judge then found at sentencing) [LEAD]; the "murders the jury could not
  resolve" ending is real but confirm the count. Add the documented epilogue: Nick Calabrese died in 2023 (reported),
  without any suggestion about the cause unless a record gives it.

### Series C: El Rukn
- **Part 1 ends**: "1986, FBI agents listening to calls from a federal prison about Libya [court: *McAnderson*]".
  *United States v. McAnderson, Hawkins, Fort, Knox and Cranshaw*, 914 F.2d 934 (7th Cir. 28 Sept 1990) exists
  [CL SNIPPET]; its facts were not read. *United States v. Cranshaw*, 817 F. Supp. 723 (N.D. Ill. 1993): El Rukn
  "went to trial with Jeff Fort, its leader, and three other 'emirs' or generals" [CL SNIPPET]. The calls being from
  prison is consistent with Fort's 1983 drug conviction (13 years) [SEARCH ONLY]. **Usable after reading McAnderson.**
- **Part 2**: verdict 24 Nov 1987 [SEARCH ONLY]; $2.5 million [SEARCH ONLY]; Fort 80 years for this case, other terms
  bringing the total higher (168 years per Chicago magazine) [SEARCH ONLY, **contested**]. "The weapons purchase that
  the FBI arranged" is [LEAD]. **"First American street gang convicted of a terrorism conspiracy" is unverified:
  drop "first".** Ending (insiders begin cooperating) is real per *Boyd*.
- **Part 3**: *United States v. Boyd*, 833 F. Supp. 1277 (N.D. Ill. 20 Sept 1993) granted new trials; affirmed,
  55 F.3d 239 (7th Cir. 10 May 1995) [CL SNIPPET: "a motion for a new trial by criminal defendants. 833 F.Supp. 1277"].
  **Correction to "Unresolved: whether retried defendants were reconvicted":** at least five were reconvicted and the
  7th Circuit affirmed: *United States v. Jeff Boyd, Charles Green, Sammy Knox, Noah R. Robinson and Melvin Mays*,
  208 F.3d 638 (7th Cir. 3 Apr 2000), with a dissent saying a new trial would be ordered in any other circuit
  [CL SNIPPET]. End on that: the retrials, the reconvictions and the dissent are a documented, still-argued ending.
  Nathson Fields: never imply guilt (acquitted on retrial; certificate of innocence [LEAD]); describe *Fields v. City
  of Chicago* (7th Cir. 2020) only from the opinion. Title "The Witnesses Who Wrecked Their Own Case" **misplaces
  blame**: the courts faulted the **prosecution's failure to disclose**. Use "The Secret That Overturned the El Rukn
  Verdicts". Name individual prosecutors only as the opinions do.
- **1968 Senate hearings and Fort's first federal conviction**: still [LEAD]; not checked (no reachable source).
- Ads: El Rukn is the series most at risk (gang profile, terrorism). Frame each part as the case (the investigation and
  the trials); no gang symbols, no "kingpin" framing, no glamour shots of the building.

---

## Part 3. The rest of the top 10 (titles and the claims most likely to be wrong)

Only light checks were possible; nothing here was read in a primary document.

| Story | Problem | Status | Fix |
|---|---|---|---|
| 6 Edmond: "D.C.'s Biggest Cocaine Boss Ended Up Informing on Everyone" | "biggest" and "everyone" overstated; "boss" framing (advertiser guidance: no boss framing). Death in Dec 2024 and 2021 reduction are leads. | unverified | "The D.C. Cocaine Trafficker Who Became a Government Witness". Confirm the 2021 order and his death before scripting. |
| 7 Massino: "First New York Mafia Boss to Testify for the Government" | Widely reported, not checked. "Facing death penalty charges" not checked. | unverified | Keep only with a dated DOJ or court source (*United States v. Basciano*). |
| 8 Barnes: alt "Mr. Untouchable Talked" | Glamorising nickname in a title; "Harlem Kingpin" framing. | legal/ads | "The Harlem Heroin Trafficker Who Testified Against His Partners". |
| 9 GTTF alt: "Eight Officers, One Squad, and the Two Who Testified" | Reporting says four former GTTF officers testified at the 2018 trial (Gondo, Rayam, Ward, Hendrix) [memory; not checked]. | likely **wrong** | Drop the number until the trial record is read. Name only convicted officers. |
| 10 Pizza Connection: "The Case Built by a Mafia Witness" | The case rested largely on wiretaps and surveillance; Buscetta was one witness. *United States v. Salamone* (3d Cir. 1989) looks like a different case. | overstated / unverified | "Heroin Through Pizzerias: The Pizza Connection Trial". Check *Salamone* belongs here. |

---

## Corrections the story file needs

1. **Brink's title**: replace with "The Brink's Robbers Stayed Silent for Six Years. Then One of Them Talked." Drop
   "Solved by a Grudge"; if a superlative is used, "the biggest robbery in America at the time".
2. **Brink's, Burke**: "Police arrested Elmer 'Trigger' Burke, who according to the FBI allegedly had been hired by
   O'Keefe's underworld associates." Not "the hired gunman Burke shoots him".
3. **Brink's, order of events**: O'Keefe was shot in June 1954 after his release, not while in prison; the Pennsylvania
   charge is contested (FBI: firearms; leads: burglary).
4. **Brink's, deadline**: indictments 13 and 16 Jan 1956 (*Richardson*); arrests of six men that week, two more in May.
   Prefer "1 DAY LEFT" (court record) to "5 DAYS LEFT".
5. **Brink's, grand jury**: add *O'Keefe v. United States* (three cases) and *Hooley*, 209 F.2d 219; don't present the
   refusals as "the code" until the 1st Circuit outcomes (privilege against self-incrimination) are read.
6. **Brink's, aftermath**: "Two died in prison; the rest were paroled 1969-71"; O'Keefe pleaded guilty (FBI).
7. **Biloxi title and cold open**: Halat was convicted of racketeering conspiracy, obstruction and wire-fraud
   conspiracy, not murder, and denies any part in the killings. New title: "A Judge, His Wife and the Money Missing from
   a Prison Scam". Drop "The Dixie Mafia's Last Job" and "WHO PAID?".
8. **Biloxi, 1991 trial**: wire fraud for four defendants, and travel in aid of murder-for-hire for Nix and Gillich.
9. **Biloxi**: "Holcomb, whom prosecutors called the hired killer"; Margaret Sherry "a mayoral candidate critical of
   Gillich's operations" (court); say Judge Sherry was never shown to have taken the money.
10. **Westies**: Featherstone convicted **April 1986**, 25 years to life; vacated **September 1986**. Titles: attribute
    the frame ("He Said His Own Crew Set Him Up"); drop "Took Them All Down". 1979: Coonan was **acquitted** (confirm);
    cut the "witness died / refused" story. 1977: Featherstone acquitted (lead). Gambino link: confirm in *Coonan*.
11. **Westies Part 2 ending**: replace with the **9 July 2025 Second Circuit ruling** against Coonan's release bid
    (143 F.4th 119); his age then 76, now 79; 2030 release date to be checked on the BOP locator.
12. **Family Secrets**: Nick agreed to cooperate **in 2002** (DOJ); "16 murders in which he participated" is DOJ's
    figure; DNA stays "reported". Frank Sr.'s plea date is contested (1995 vs 1997). Drop "The Letter That Broke the
    Chicago Outfit". Replace "could the government keep them alive" with the DOJ finding that no protected witness was
    shown to be in danger. Add that Nick Calabrese died in 2023 (reported). The main appeal is *United States v.
    Schiro*, 679 F.3d 521 (7th Cir. 2012).
13. **El Rukn**: drop "first ... gang convicted of terrorism"; Part 3 title should blame the non-disclosure, not the
    witnesses; add the 2000 reconvictions (*Boyd*, 208 F.3d 638) to the ending.
14. **Top 10**: Edmond and Barnes titles (boss/kingpin/nickname framing); GTTF "two who testified" likely wrong; Pizza
    Connection "built by a Mafia witness" overstated.
15. **cases.md (for the architect)**: Nick Calabrese is dead (2023), not "whereabouts protected"; Coonan's 2023 bid is
    decided.

## Still unverified (must be read before recording)

- The full text of every court opinion named above (CourtListener opinion pages blocked; Justia, law.resource.org,
  ca5.uscourts.gov unreachable). In particular: *Geagan* (statute and date of the limitation, O'Keefe's testimony),
  the 1954 contempt outcomes, *Sharpe* (1999) and *Sharpe* (1993), *Coonan* (Gambino link), *Bokun* (1995),
  *McAnderson*, *Boyd* (1993, 1995), *Schiro*, *Ambrose* (2012), *Fields* (2020).
- The FBI's Brink's and Family Secrets history pages and the FBI Vault file (fbi.gov blocked). Facts from them here
  are search-result text only.
- Brink's: the shooting's day (16 June 1954), 6 Jan 1956, 12 Jan arrests, the Pennsylvania charge, Maffie's tax case,
  the $58,000, paroles, the robbery-night details.
- Biloxi: Halat's verdict date and counts in a record; Holcomb's role in the record; the 1993 appeal outcome; Ransom's
  and Sharpe's current status.
- Westies: Bokun's outcome on the Holly murder; the 1977 and 1979 trials; Coonan's BOP release date; Featherstone's
  plea.
- Family Secrets: Frank Sr.'s plea date; the jury's murder findings (10 Sept and 27 Sept 2007); Zagel's quote; Nick's
  death (news only); Ambrose's conviction and sentence.
- El Rukn: the 1968 Senate hearings; Fort's first federal conviction; the FBI weapons sting; Fort's total sentence.
- Top 10 entries 6-10: nothing read in a primary document.

## Sources consulted

- CourtListener search pages (snippets): https://www.courtlistener.com/?q=Brink+O%27Keefe+Geagan ;
  https://www.courtlistener.com/?q=Maffie+%22grand+jury%22+Brink%27s ; https://www.courtlistener.com/?q=Sherry+Halat+%22mayor%22 ;
  https://www.courtlistener.com/?q=Coonan+Featherstone ; https://www.courtlistener.com/?q=Bokun+Holly+Featherstone ;
  https://www.courtlistener.com/?q=Featherstone+Westies+testified ; https://www.courtlistener.com/?q=Schiro+Lombardo+Calabrese+Outfit ;
  https://www.courtlistener.com/?q=McAnderson+Fort+Libya ; https://www.courtlistener.com/?q=Boyd+%22El+Rukn%22+%22new+trial%22
- DOJ [OPENED]: https://www.justice.gov/archive/usao/iln/chicago/2005/pr0425_01.pdf ;
  https://www.justice.gov/archive/usao/iln/chicago/2007/pr0111_01.pdf
- Search-result text only: https://www.fbi.gov/history/cases-and-criminals/brinks-robbery ;
  https://www.fbi.gov/news/stories/2007/february/brinks_020907 ; https://exonerationregistry.org/cases/4389 ;
  https://news.bloomberglaw.com/litigation/no-compassionate-release-for-westies-leader-appeals-court-says ;
  https://law.counselstack.com/opinion/united-states-v-coonan-ca2-2025 ;
  https://www.ca5.uscourts.gov/opinions/pub/97/97-60263.CR0.wpd.pdf ;
  https://www.wlox.com/story/242756/defendants-in-1987-sherry-murder-case-allowed-new-trials/ ;
  https://www.wlox.com/2023/03/20/remembering-sherry-murders-lonely-hearts-scam-those-involved/ ;
  https://themobmuseum.org/blog/epic-family-secrets-trial-crippled-chicago-outfit/ ;
  https://chicago.suntimes.com/obituaries/2023/3/14/23639765/chicago-mob-hitman-nicholas-calabrese-dead-family-secrets-trial ;
  https://www.washingtontimes.com/news/2009/mar/26/star-witness-at-chicago-mob-trial-gets-12-years-1/ ;
  https://www.hstoday.us/featured/trafficking-terrorism-how-a-street-gang-connected-with-libyan-terrorists/
- Leads only (Wikipedia): Great Brink's Robbery; Pete Halat; Kirksey Nix; James Coonan; Operation Family Secrets.
- Rules: plan/production-tools.md section 5 (YouTube advertiser-friendly guidelines, answer/6162278).
