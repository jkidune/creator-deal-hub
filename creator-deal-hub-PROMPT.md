# Creator Deal Hub — AI Build Prompt
## Use this prompt with Claude, ChatGPT, or Google Gemini to build your own version

---

### OPTION A: Start from scratch with any AI

Copy and paste this entire prompt into Claude, ChatGPT, or Google Gemini:

---

**PROMPT — COPY EVERYTHING BELOW THIS LINE:**

```
Build me a personal brand deal tracking dashboard as a single self-contained HTML file I can open locally in my browser and bookmark. 

It should look and feel like Notion — dark mode, clean sidebar navigation, minimal design — but branded for me as a content creator. Use the Fredoka font (import from Google Fonts) for all headings, section labels, and badges. Use DM Sans for body text and DM Mono for dates, amounts, and codes.

The dashboard needs these pages accessible from a sidebar:

1. DEAL PIPELINE — the main view, with:
   - A "Quick Look" section at the top showing Today / Tomorrow / On the Radar in three columns with color-coded dot indicators (red = urgent, amber = medium, gray = low, green = good)
   - 4 metric cards: Confirmed Revenue, Hot Pipeline, Awaiting Reply count, No Response count
   - Deal rows organized into 4 sections: Active Deals, Hot Negotiations, Inbound Pipeline, Closed/Passed
   - Each deal row in "Active" and "Hot" sections must show these columns: Brand name, Value, Status badge, Post date, Concept/Script (yes/no pill), Deposit paid (dot), Content made (dot), Posted (dot), Paid in full (dot), Next action
   - Click any row to expand it and show: status dropdown, post date input, next action input, 5 toggles (concept/deposit/content/posted/paid), invoice notes (pre-filled), posting requirements (hashtags, tags, bio link duration, etc.), and a private notes textarea
   - All edits save to localStorage so they persist between sessions
   - Filter sidebar links: All, Needs Action, Awaiting Reply, No Response, Closed

2. PARTNERSHIPS — for long-term brand relationships that go beyond single paid posts:
   - Sections for each major partner brand (ambassador deals, speaking engagements, product co-development, etc.)
   - Speaking engagement slots with date, time, and deadline tracker
   - Product co-development tracker with status chips
   - Invoice notes for speaking fees (deposit + final)

3. ALERTS & MONEY — invoice and payment flags:
   - Color-coded alert cards (red = overdue, amber = warning, green = confirmed, blue = info)
   - Pre-fill with your current invoicing issues

4. PROJECTS — long-term builds separate from brand deals:
   - 2-column card grid
   - Each card has a title, description, and checklist-style items

Design requirements:
- Dark background (#0f0f0f), dark surface cards (#161616, #1e1e1e)
- Accent color: warm gold (#e8d5a3)
- Status badge colors: blue=filming, amber=post-now, green=signed, purple=negotiating, teal=brief-received, red=stalled, gray=passed
- Sidebar fixed on left, 240px wide
- Sticky topbar with page title and Export CSV button
- Small floating mascot/logo images at random positions (very low opacity, decorative)
- All edits persist in localStorage — no backend needed
- CSV export button that downloads all deal data
- The whole thing is one .html file with no external dependencies except Google Fonts

Populate it with MY brand deals and info:
[REPLACE THIS SECTION WITH YOUR ACTUAL DEALS, BRANDS, CONTACT NAMES, AMOUNTS, DEADLINES, POSTING REQUIREMENTS, ETC.]

Example format for deals:
- Brand: [Brand Name], Contact: [Name], Value: $[X], Status: [filming/signed/negotiating/waiting/etc.], Post date: [date or TBD], Deposit paid: [yes/no], Requirements: [hashtags, tags, bio link duration, etc.], Notes: [anything relevant]
```

---

### OPTION B: Customize the included demo file

The `creator-deal-hub-DEMO.html` file is a fully working template with mock data.

Open it in any text editor (VS Code, Notepad, TextEdit) and find the `SECTIONS` array near the bottom of the file. Replace the mock brand names, contact names, amounts, and deal details with your own.

**What to replace:**
- `name:` — Your brand name
- `source:` — How it came in (direct / agency name / referral)
- `detail:` — Brief description of the deal
- `amount:` — Dollar value or range
- `postDate:` — When it needs to go live
- `requirements:` — Hashtags, tagging requirements, bio link duration, ad codes, etc.
- `invoiceNotes:` — When to send deposit vs. final invoice
- `action:` — What needs to happen next

**For the sidebar branding:**
Find `.sb-wordmark` and replace `your<span>brand</span>™` with your handle or name.

**For your logo:**
Convert your logo PNG to base64 (use a free tool like base64.guru/converter/encode/image), then replace the `sb-wordmark` div with an `<img>` tag using your base64 data.

---

### OPTION C: Let AI customize the demo file for you

Upload `creator-deal-hub-DEMO.html` to Claude, ChatGPT, or Gemini and say:

```
I'm attaching an HTML dashboard template. Please customize it with my brand deals:

[List your deals here]

Also update the branding — my name/handle is [YOUR HANDLE]. 
Replace all mock data (TechFlow AI, NovaBike, GearCraft, etc.) with my actual brand names, contact names, amounts, deadlines, and posting requirements.
Keep all the styling, layout, and functionality exactly the same — just swap the data.
```

---

### Tips for the best results

**Any AI will work.** Claude, ChatGPT (GPT-4o), and Google Gemini can all customize this. Claude tends to handle large HTML files most reliably, but all three can do it.

**Be specific with your data.** The more detail you give about each deal (contact name, amount, post date, requirements, invoice terms), the more useful the dashboard will be from day one.

**The localStorage trick.** Your edits (status toggles, notes, post dates) are saved in your browser's localStorage. This means:
- Your changes persist when you close and reopen the file ✓
- If you replace the file with an updated version, your edits carry over as long as the deal IDs stay the same ✓
- If you open the file in a different browser, you start fresh (that browser has its own localStorage)

**Keeping it updated.** The best workflow is to use AI to re-scan your emails periodically and regenerate the dashboard with fresh data — then download and replace the file at your bookmark location. Your local edits merge automatically.

**To add your own logo:**
1. Go to base64.guru/converter/encode/image
2. Upload your logo PNG
3. Copy the output
4. In the HTML file, find `class="sb-wordmark"` and replace it with:
   `<img src="data:image/png;base64,[PASTE YOUR BASE64 HERE]" style="width:120px;opacity:0.9">`

---

*Template built with Claude · landonbtw.com*
