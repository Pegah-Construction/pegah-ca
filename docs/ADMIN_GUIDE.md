# Pegah Construction — Website Admin Guide

A practical walkthrough of the Pegah Construction website and its admin dashboard.
Use this to learn the system yourself and to show others how to keep the site up to date.

> 📸 **Adding screenshots:** wherever you see a `> 📸 _Add screenshot: …_` line, drop
> an image in `docs/images/` and replace the line with `![description](images/your-file.png)`.
> Keep this file in the repo so everyone edits the same copy.

---

## 1. The two halves of the system

| | What it is | Who sees it |
|---|---|---|
| **Public website** | The marketing site visitors browse (Home, About, Services, Projects, Tenders, Health & Safety, Careers, Blog, Contact). | Everyone |
| **Admin dashboard** | The private control panel where staff edit content. | Logged-in staff only |

Most day-to-day content (projects, blog posts, job postings, team members) is edited in the
**admin dashboard**. A handful of fixed marketing pages (About, Services, Health & Safety, the
home page) are part of the site's code and are changed by a developer — see [§13](#13-what-lives-in-code).

---

## 2. Signing in

1. Go to **`/admin`** (e.g. `https://pegah.ca/admin`).
2. Enter your email and password.

> 📸 _Add screenshot: the login screen._

**Forgot your password?** Click **Forgot password** on the login screen, enter your email, and a
reset link is emailed to you.

**Changing your password** while logged in: open the account menu in the sidebar and choose
**Change password**.

---

## 3. Roles & what each can do

Every user has one role. Roles decide which buttons and modules are visible.

| Role | Can do |
|---|---|
| **Administrator** | Everything — all content, plus **Users & Roles** and **Settings**. |
| **Project Manager** | Projects, News & Blog, Tenders, Inquiries, About/Team. Cannot manage users, careers, or settings. |
| **Site Foreman** | View access only — no editing. |

If a button described in this guide is missing for you, your role probably doesn't have permission
for it. An Administrator can adjust roles under **Users & Roles**.

---

## 4. Dashboard home

The landing page after login. It shows a quick overview of projects and recent activity. Use the
**left sidebar** to move between modules: Dashboard, Projects, Tenders, News & Blog, Careers,
Inquiries, About / Team, Users & Roles, Settings.

> 📸 _Add screenshot: dashboard home with the sidebar._

---

## 5. Projects

**Where:** sidebar → **Projects**. This is the portfolio shown on the public **Projects** page.

### Add a project
1. Click **+ New project**.
2. Fill in the fields: name, location, category (Commercial / Residential), purpose type,
   construction type, owner, architect, contract type, value, gross floor area, year completed,
   and a description.
3. Add photos (you can select several at once).
4. Click **Create project**.

> 📸 _Add screenshot: the New project form._

### Edit a project
Click **Edit** on any row. You can change any field, and **add or remove photos** — photo changes
save immediately (the ✕ on a photo deletes it).

### Find and organise projects
Above the table you have:
- **Search** — matches name, location, type, or contract.
- **Category** and **Year** filters.
- **Sort by** — Completion date (newest/oldest), Value (high/low), or Name.
- **Pagination** — 10 projects per page, with Prev / Next at the bottom.

> 📸 _Add screenshot: the filter + sort bar above the projects table._

### Generate a blog post from a project
On a project's detail page, **Generate blog post** drafts an article from the project's details
(and attached documents) using AI. It's saved as a **Draft** in News & Blog for you to review and
publish. *(Requires the AI key to be configured — see [§14](#14-ai-features).)*

### Delete a project
Click **Delete** on a row and confirm. This also removes its photos and related data.

---

## 6. News & Blog

**Where:** sidebar → **News & Blog**. These are the articles on the public **Blog**.

### Write or edit an article
1. Click **+ New article** (or **Edit** an existing one).
2. Set the **title**, **cover image**, **tags**, and write the body in the **rich text editor**
   (headings, bold, lists, links, section labels, images, dividers).
3. Set the **status**: **Draft** (hidden from the public) or **Published** (live).
4. Optionally mark it **Featured** to highlight it on the blog.
5. Save.

> 📸 _Add screenshot: the article editor._

### Generate a LinkedIn post
Inside the article editor, use **Generate LinkedIn post** to create a LinkedIn-ready caption based
on that article's content. You can edit it and copy it to paste into LinkedIn. *(Requires the AI
key — see [§14](#14-ai-features).)*

---

## 7. Tenders

**Where:** sidebar → **Tenders**. This lists bid opportunities shown on the public **Tenders** page.

Tenders are **synced from SmartBid** — SmartBid is the source of truth, so this screen is
**read-only**. You do not create or edit tenders here.

- Click **Sync from SmartBid** to pull the latest opportunities. The screen reports how many were
  added / updated.
- Use the **search** and **status** filter to find a tender.
- A tender's **title links out to its SmartBid bid room**, where invitations and bids are managed.

> 📸 _Add screenshot: the Tenders list with the Sync button._

---

## 8. Careers

**Where:** sidebar → **Careers** *(Administrators only)*. Manage the job openings listed on the
public **Careers** page — add, edit, or close postings.

> 📸 _Add screenshot: the Careers manager._

---

## 9. Inquiries

**Where:** sidebar → **Inquiries**. Messages submitted through the public **Contact** form land
here. You can read each message and mark it **read / unread** to track what still needs a reply.

> 📸 _Add screenshot: the Inquiries list._

---

## 10. About / Team

**Where:** sidebar → **About / Team**. Manage the **Leadership** and **team members** shown on the
public **About** page — names, titles, bios, and photos.

> 📸 _Add screenshot: the Team manager._

---

## 11. Users & Roles

**Where:** sidebar → **Users & Roles** *(Administrators only)*.

- **Add a user:** enter their name, email, title, and role. A temporary password is generated and
  shown **once** — copy it and share it with them; they can change it after logging in.
- **Edit or deactivate** existing users.
- Roles are explained in [§3](#3-roles--what-each-can-do).

> 📸 _Add screenshot: the Add user dialog showing the one-time password._

---

## 12. Settings

**Where:** sidebar → **Settings** *(Administrators only)*. Company-level details (company name,
main phone, email, address).

---

## 13. What lives in code

Some fixed marketing content isn't edited in the dashboard — it's part of the website's code and is
updated by a developer:

- The **Home**, **About**, **Services**, and **Health & Safety** page copy.
- The **navigation menu**, **footer**, company contact details and partner logos.
- Site-wide wording and styling.

If you need one of these changed, note exactly what should change (and provide any new images) and
pass it to whoever maintains the code.

---

## 14. AI features

Two buttons use AI: **Generate blog post** (Projects) and **Generate LinkedIn post** (News & Blog).
They only work when an **AI key** is configured in the site's environment. If it isn't set, the
buttons show a "not configured" message instead of failing. Ask your developer to set the
`ANTHROPIC_API_KEY` to enable them.

---

## 15. Quick reference — "How do I…?"

| I want to… | Go to |
|---|---|
| Add a completed project to the portfolio | **Projects → + New project** |
| Swap a project's photos | **Projects → Edit → Photos** |
| Publish a blog post | **News & Blog → New/Edit → set status to Published** |
| Turn a project into a blog draft | **Projects → open project → Generate blog post** |
| Get a LinkedIn caption for a post | **News & Blog → Edit → Generate LinkedIn post** |
| Refresh the tenders list | **Tenders → Sync from SmartBid** |
| Reply-track a contact message | **Inquiries → mark read/unread** |
| Post a job opening | **Careers → add posting** |
| Update a leader's bio/photo | **About / Team** |
| Add a staff login | **Users & Roles → add user** |
| Change my own password | **Sidebar account menu → Change password** |

---

*Keep this guide in the repository so the whole team edits one shared copy. Replace the 📸
placeholders with real screenshots as you go.*
