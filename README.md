# Gateway Compare & Contrast — Instructor Recovery Edition

## What this release does
- Students enter **their name only**, then type in the workshop. The app automatically backs up answers online about 1 second after edits. No student sign-in, no download required.
- The student sees **Saved online** only after the server confirms storage. If offline, the student must download the JSON backup.
- Instructor opens `teacher.html`, enters the instructor PIN, reviews student sessions and answers, downloads **resumable JSON**, and prints/saves the response view as PDF using the browser print dialog.
- Instructor gives the JSON to the student for import using **Read Uploaded File** in the original workshop. This creates a new backup session on the new computer.
- Word essay export, original worksheet sections, PDF progress export, and JSON import/export remain available.

## Required server setup (not active until completed)
1. Use an institution-approved Supabase project. Run `database.sql` in its SQL Editor.
2. Install Supabase CLI, log in, and link the project: `supabase login` and `supabase link --project-ref YOUR_PROJECT_REF`.
3. Set server-only secrets: `supabase secrets set INSTRUCTOR_PIN=4611 SESSION_SECRET=REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS`. Use a strong unique random secret; **do not commit it**. The PIN is not included in published JavaScript.
4. Deploy the function from this folder: `supabase functions deploy classroom-api --no-verify-jwt`.
5. Edit `config.js`: set `endpoint` to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/classroom-api`. Do not put a service-role key or instructor PIN in config.js.
6. Upload `index.html`, `teacher.html`, `config.js`, `cloud-sync.js`, `teacher.js`, `teacher.css`, `workshop3-master.js`, `workshop3-master.css`, `jszip.min.js` to the same GitHub Pages folder. The `supabase/` and `database.sql` files are deployment materials, not browser requirements.
7. Test with a fake student name: fill two fields, wait for **Saved online**, open instructor dashboard, unlock with PIN, download JSON, sign out of lab computer, and import JSON on a second computer. Confirm restored answers. Test PDF print and Word essay.

## Important limitations / safeguards
- **The ZIP is not a running cloud service.** You must deploy the backend and set the endpoint before online saving or instructor recovery can work.
- A four-digit PIN has limited entropy. The server limits PIN attempts per apparent IP (five per 15 minutes), issues a short-lived signed session, and never exposes the PIN in public files. A shared school NAT/IP may cause several teachers to share the attempt limit. For higher security, use institutional sign-in and MFA.
- A student's browser receives a random edit token for that *lab session only*. The token is not a student password. Only the instructor can retrieve work from the database after logout.
- Name-only records can be ambiguous; instructor should verify student identity before sharing recovered answers. A student can type another name, so name alone is not proof of authorship.
- Automatic saving requires a network connection. Wait for **Saved online** before logging off. If it fails, download the JSON file immediately.
- The system records first save, last save and last activity. It does **not** capture historical logins or access dates from before deployment, nor can it reliably record page views before a student types their name.
- Instructors should review school privacy policy: named student coursework may still be an education record. Use an institution-approved data processor, retention period, and access controls. Never commit student progress data to GitHub.
- Current PDF recovery is **browser Print → Save as PDF**; it is not an automatically generated PDF download.
- This is a starter implementation; perform security review and live integration tests before classroom deployment.
