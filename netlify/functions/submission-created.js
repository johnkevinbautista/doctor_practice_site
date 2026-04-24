/**
 * submission-created.js
 *
 * Netlify automatically calls this function every time the
 * "appointment-request" form is submitted. It sends a branded
 * confirmation email to the patient via the Resend API.
 *
 * Required environment variable (set in Netlify dashboard):
 *   RESEND_API_KEY  — your Resend API key
 *   RESEND_FROM     — verified sender address, e.g. appointments@yourpracticedomain.com
 */

exports.handler = async function (event) {
  try {
    const { payload } = JSON.parse(event.body);

    // Only handle the appointment form
    if (payload.form_name !== 'appointment-request') {
      return { statusCode: 200 };
    }

    const d = payload.data;
    const email     = (d.email       || '').trim();
    const firstName = (d.first_name  || '').trim();
    const lastName  = (d.last_name   || '').trim();

    // Nothing to do without an email address
    if (!email) return { statusCode: 200 };

    // ── Human-readable label maps ──────────────────────────────────────
    const visitLabels = {
      'new-patient': 'New Patient — Comprehensive Visit',
      'annual':      'Annual Physical / Wellness Exam',
      'sick':        'Sick / Acute Concern',
      'followup':    'Follow-Up Visit',
      'chronic':     'Chronic Disease Management',
      'telehealth':  'Telehealth Appointment',
      'womens':      "Women's Health Visit",
      'other':       'Other / Not Sure',
    };

    const providerLabels = {
      'chen': 'Dr. Sarah Chen, MD',
      'webb': 'Dr. Marcus Webb, MD',
      'nair': 'Dr. Priya Nair, MD',
    };

    const timeLabels = {
      'morning':   'Morning (8am – 12pm)',
      'afternoon': 'Afternoon (12pm – 4pm)',
      'evening':   'Evening (4pm – 7pm)',
      'saturday':  'Saturday morning',
    };

    const visitType = visitLabels[d.visit_type]   || d.visit_type   || 'Not specified';
    const provider  = providerLabels[d.provider]  || 'Next available provider';
    const time      = timeLabels[d.preferred_time] || 'No preference';
    const date      = d.preferred_date            || 'No preference';
    const insurance = d.insurance                 || 'Not provided';
    const message   = d.message                   || '—';

    // ── Email HTML ─────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Appointment Request Received</title>
</head>
<body style="margin:0;padding:0;background:#F7F9FD;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A202C;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FD;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A5FA8;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                  Meridian<span style="color:#5BB8FF;">Health</span>
                </span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#0F9B8A;">
                Appointment Request Received
              </p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;line-height:1.25;color:#1A202C;">
                Thanks, ${firstName}. We've got your request.
              </h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#4A5568;">
                We'll review your request and reach out to confirm your appointment
                within <strong>two business hours</strong>. If you need something sooner,
                call us directly at <a href="tel:+12125550180" style="color:#1A5FA8;font-weight:600;">(212) 555-0180</a>.
              </p>

              <!-- Summary card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#F7F9FD;border:1px solid #E2E8F0;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;
                               letter-spacing:0.08em;color:#718096;">Your Submission Summary</p>

                    ${row('Name',               `${firstName} ${lastName}`)}
                    ${row('Email',              email)}
                    ${d.phone ? row('Phone', d.phone) : ''}
                    ${row('Visit Type',         visitType)}
                    ${row('Preferred Provider', provider)}
                    ${row('Preferred Date',     date)}
                    ${row('Preferred Time',     time)}
                    ${row('Insurance',          insurance)}
                    ${message !== '—' ? row('Additional Notes', message) : ''}
                  </td>
                </tr>
              </table>

              <!-- What happens next -->
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1A202C;">What happens next</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                ${step('1', 'We review your request', 'A member of our team will look over your submission and find a time that works.')}
                ${step('2', 'We confirm your appointment', 'You\'ll receive a confirmation with your appointment time, location, and any prep instructions.')}
                ${step('3', 'You come in (or log on)', 'Arrive a few minutes early for your first visit, or click your telehealth link at the scheduled time.')}
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://www.meridianhealth.com"
                       style="display:inline-block;background:#1A5FA8;color:#ffffff;font-size:15px;
                              font-weight:700;text-decoration:none;padding:14px 32px;
                              border-radius:8px;letter-spacing:0.01em;">
                      Visit Our Website
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F7F9FD;border-top:1px solid #E2E8F0;border-radius:0 0 12px 12px;
                       padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#718096;">
                <strong style="color:#4A5568;">Meridian Health</strong> &nbsp;·&nbsp;
                450 Park Avenue, Suite 200, New York, NY 10022
              </p>
              <p style="margin:0;font-size:12px;color:#A0AEC0;">
                You're receiving this because you submitted an appointment request on our website.
                This is not a confirmed appointment — our team will follow up to finalise your booking.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    // ── Send via Resend ────────────────────────────────────────────────
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM,
        to:      [email],
        subject: 'We received your appointment request — Meridian Health',
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
    }

    return { statusCode: 200 };

  } catch (err) {
    console.error('submission-created error:', err);
    return { statusCode: 200 }; // always 200 so Netlify doesn't retry endlessly
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function row(label, value) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td width="38%" style="font-size:13px;font-weight:600;color:#718096;vertical-align:top;
                                padding-right:12px;">${label}</td>
        <td style="font-size:13px;color:#1A202C;vertical-align:top;">${value}</td>
      </tr>
    </table>`;
}

function step(num, title, desc) {
  return `
    <tr>
      <td style="padding:8px 0;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:14px;">
              <div style="width:28px;height:28px;background:#1A5FA8;border-radius:50%;
                          text-align:center;line-height:28px;font-size:13px;
                          font-weight:700;color:#ffffff;">${num}</div>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1A202C;">${title}</p>
              <p style="margin:0;font-size:13px;color:#718096;line-height:1.6;">${desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}
