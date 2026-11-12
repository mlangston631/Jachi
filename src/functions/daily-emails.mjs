// ---------- Daily member emails (src/functions/daily-emails.mjs) ----------
// Netlify runs this every day at 15:00 UTC (9 a.m. Central in winter, 10 a.m. in summer): one payment nudge for
// signups whose first invoice is still unpaid about a day later, and a heads-up two weeks before a yearly renewal.
export default async () => {
  try {
    return json(200, await JachiBilling.daily());
  } catch (err) {
    console.error('Daily member emails stopped early:', err.message);
    return json(500, { error: 'daily_failed' });
  }
};

export const config = {
  schedule: '0 15 * * *',
};
