export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are a Liquid code generator for Movement's email platform. Generate ONLY the Liquid code (no explanations, no markdown formatting, no backticks) for this request:

"${prompt}"

Available merge tags:
- Supporter: {{ first_name }}, {{ last_name }}, {{ email }}, {{ join_date }}, {{ membership_status }}
- Donations: {{ donations.count }}, {{ donations.total }}, {{ donations.average }}, {{ donations.highest }}, {{ donations.previous_amount }}, {{ donations.previous_date }}
- Organizations: {{ organisations.region }}
- Regular donations check: {% assign regular_donor = donations.regular_donations | has: "status", "active" %}

Rules:
1. Use {% if %}, {% elsif %}, {% else %}, {% endif %} for conditions
2. Always include {% else %} fallbacks
3. Use proper spacing: {{ variable }} not {{variable}}
4. Use elsif not elseif
5. Return ONLY the Liquid code, nothing else`
          }
        ]
      })
    });

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      let code = data.content[0].text.trim();
      code = code.replace(/```liquid\n?/g, '').replace(/```\n?/g, '');
      return res.status(200).json({ code });
    }

    return res.status(500).json({ error: 'Failed to generate code' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
