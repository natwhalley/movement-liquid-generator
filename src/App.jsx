import React, { useState } from 'react';
import { Copy, Check, Zap, Eye, Loader2 } from 'lucide-react';

const LiquidGenerator = () => {
  const [input, setInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('donor-active');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample member profiles for preview
  const memberProfiles = {
    'donor-active': {
      name: 'Active Regular Donor',
      data: {
        first_name: 'Sarah',
        last_name: 'Thompson',
        email: 'sarah@example.com',
        join_date: '2022-03-15',
        membership_status: 'active',
        organisations: { region: 'London' },
        donations: {
          count: 12,
          total: 450,
          average: 37.50,
          highest: 75,
          previous_amount: 40,
          previous_date: '2024-12-15',
          regular_donations: [{ status: 'active', amount: 25 }],
          history: [
            { date: '2024-12-15', amount: 40 },
            { date: '2024-11-10', amount: 35 },
            { date: '2024-10-05', amount: 30 }
          ]
        }
      }
    },
    'donor-lapsed': {
      name: 'Lapsed Regular Donor',
      data: {
        first_name: 'James',
        last_name: 'Wilson',
        email: 'james@example.com',
        join_date: '2021-06-20',
        membership_status: 'active',
        organisations: { region: 'Manchester' },
        donations: {
          count: 8,
          total: 200,
          average: 25,
          highest: 50,
          previous_amount: 25,
          previous_date: '2023-09-12',
          regular_donations: [{ status: 'cancelled', amount: 10 }],
          history: [
            { date: '2023-09-12', amount: 25 },
            { date: '2023-05-08', amount: 20 }
          ]
        }
      }
    },
    'donor-small': {
      name: 'Small Gift Donor',
      data: {
        first_name: 'Emma',
        last_name: 'Davies',
        email: 'emma@example.com',
        join_date: '2024-08-10',
        membership_status: 'active',
        organisations: { region: 'Birmingham' },
        donations: {
          count: 2,
          total: 3,
          average: 1.50,
          highest: 2,
          previous_amount: 1.50,
          previous_date: '2025-01-15',
          regular_donations: [],
          history: [
            { date: '2025-01-15', amount: 1.50 },
            { date: '2024-12-20', amount: 1.50 }
          ]
        }
      }
    },
    'non-donor': {
      name: 'Never Donated',
      data: {
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael@example.com',
        join_date: '2024-11-01',
        membership_status: 'active',
        organisations: { region: 'Bristol' },
        donations: {
          count: 0,
          total: 0,
          average: 0,
          highest: 0,
          previous_amount: 0,
          previous_date: '',
          regular_donations: [],
          history: []
        }
      }
    },
    'long-term': {
      name: 'Long-term Member',
      data: {
        first_name: 'Patricia',
        last_name: 'Collins',
        email: 'patricia@example.com',
        join_date: '2020-02-14',
        membership_status: 'active',
        organisations: { region: 'London' },
        donations: {
          count: 24,
          total: 860,
          average: 35.83,
          highest: 100,
          previous_amount: 50,
          previous_date: '2025-01-20',
          regular_donations: [{ status: 'active', amount: 30 }],
          history: [
            { date: '2025-01-20', amount: 50 },
            { date: '2024-12-10', amount: 40 }
          ]
        }
      }
    }
  };

  const examples = [
    {
      title: "Smart Donation Ask",
      description: "Show recent donation amount, but 2x for small gifts",
      prompt: "show people's most recent donation amount, but if it's under £2 show a 2x multiplier amount instead",
      impact: "Increases conversion by suggesting achievable next steps"
    },
    {
      title: "Re-engage Lapsed Donors",
      description: "Different messages for active, cancelled, and non-donors",
      prompt: "thank active regular donors, ask cancelled donors to restart, and ask non-donors to join",
      impact: "Personalized journeys increase reactivation rates"
    },
    {
      title: "Progressive Ask Ladder",
      description: "Suggest donation amounts based on giving history",
      prompt: "ask for £10 more than their highest donation, or £5 if they've never donated",
      impact: "Optimizes ask amounts for better conversion"
    },
    {
      title: "Location-Based Action",
      description: "Show region-specific events or actions",
      prompt: "show London event details to London members, Manchester event to Manchester members",
      impact: "Relevant local content drives higher engagement"
    },
    {
      title: "Tenure Recognition",
      description: "Acknowledge long-term supporters",
      prompt: "thank members who joined before 2023 for their long-term support",
      impact: "Recognition builds loyalty and retention"
    },
    {
      title: "Average Gift Upgrade",
      description: "Encourage upgrading based on past behavior",
      prompt: "ask donors to make their average donation amount regular monthly",
      impact: "Converts one-off donors to recurring revenue"
    }
  ];

  const autoFixLiquidCode = (code) => {
    let fixed = code;
    
    // Fix elseif to elsif
    fixed = fixed.replace(/\{%\s*elseif/g, '{% elsif');
    
    // Add spaces after {{ and before }}
    fixed = fixed.replace(/\{\{([^\s])/g, '{{ $1');
    fixed = fixed.replace(/([^\s])\}\}/g, '$1 }}');
    
    // Fix === to ==
    fixed = fixed.replace(/===/g, '==');
    
    // Ensure proper spacing in logic tags
    fixed = fixed.replace(/\{%([^\s])/g, '{% $1');
    fixed = fixed.replace(/([^\s])%\}/g, '$1 %}');
    
    return fixed;
  };

  const renderPreview = (code, profile) => {
    if (!code || code.includes('// Enter a description')) {
      return <div className="text-gray-400 italic">Generate code to see preview...</div>;
    }

    try {
      let output = code;
      const data = profile.data;

      output = output.replace(/\{\{\s*first_name\s*\}\}/g, data.first_name);
      output = output.replace(/\{\{\s*last_name\s*\}\}/g, data.last_name);
      output = output.replace(/\{\{\s*join_date\s*\}\}/g, data.join_date);
      output = output.replace(/\{\{\s*organisations\.region\s*\}\}/g, data.organisations?.region || '');
      
      output = output.replace(/\{\{\s*donations\.count\s*\}\}/g, data.donations.count);
      output = output.replace(/\{\{\s*donations\.total\s*\}\}/g, data.donations.total);
      output = output.replace(/\{\{\s*donations\.average\s*\}\}/g, data.donations.average);
      output = output.replace(/\{\{\s*donations\.highest\s*\}\}/g, data.donations.highest);
      output = output.replace(/\{\{\s*donations\.previous_amount\s*\}\}/g, data.donations.previous_amount);
      output = output.replace(/\{\{\s*donations\.previous_date\s*\}\}/g, data.donations.previous_date);

      const assignMatches = output.match(/\{%\s*assign\s+(\w+)\s*=\s*([^%]+)\s*%\}/g);
      const variables = {};
      
      if (assignMatches) {
        assignMatches.forEach(assign => {
          const match = assign.match(/\{%\s*assign\s+(\w+)\s*=\s*([^%]+)\s*%\}/);
          if (match) {
            const varName = match[1];
            const expression = match[2].trim();
            
            if (expression.includes('| times:')) {
              const parts = expression.split('| times:');
              const baseVar = parts[0].trim();
              const multiplier = parseFloat(parts[1]);
              const baseValue = baseVar.includes('donations.') ? 
                data.donations[baseVar.split('.')[1]] : 
                parseFloat(baseVar);
              variables[varName] = baseValue * multiplier;
            }
            else if (expression.includes('| plus:')) {
              const parts = expression.split('| plus:');
              const baseVar = parts[0].trim();
              const addend = parseFloat(parts[1]);
              const baseValue = baseVar.includes('donations.') ? 
                data.donations[baseVar.split('.')[1]] : 
                parseFloat(baseVar);
              variables[varName] = baseValue + addend;
            }
            else if (expression.includes('donations.regular_donations | has:')) {
              const hasActive = data.donations.regular_donations.some(d => d.status === 'active');
              const hasCancelled = data.donations.regular_donations.some(d => d.status === 'cancelled');
              if (expression.includes('"active"')) {
                variables[varName] = hasActive;
              } else if (expression.includes('"cancelled"')) {
                variables[varName] = hasCancelled;
              }
            }
          }
        });
      }

      const processConditional = (text) => {
        const ifPattern = /\{%\s*if\s+([^%]+)\s*%\}([\s\S]*?)(?:\{%\s*elsif\s+([^%]+)\s*%\}([\s\S]*?))*(?:\{%\s*else\s*%\}([\s\S]*?))?\{%\s*endif\s*%\}/g;
        
        return text.replace(ifPattern, (match, condition, ifContent, elsifCondition, elsifContent, elseContent) => {
          const evaluateCondition = (cond) => {
            cond = cond.trim();
            
            Object.keys(variables).forEach(varName => {
              const regex = new RegExp(`\\b${varName}\\b`, 'g');
              cond = cond.replace(regex, variables[varName]);
            });

            cond = cond.replace(/donations\.(\w+)/g, (m, prop) => data.donations[prop]);
            cond = cond.replace(/join_date/g, `"${data.join_date}"`);
            cond = cond.replace(/organisations\.region/g, `"${data.organisations?.region}"`);
            
            if (cond.includes('==')) {
              const [left, right] = cond.split('==').map(s => s.trim());
              const leftVal = left.replace(/['"]/g, '');
              const rightVal = right.replace(/['"]/g, '');
              return leftVal == rightVal;
            }
            if (cond.includes('>')) {
              const [left, right] = cond.split('>').map(s => s.trim());
              return parseFloat(left) > parseFloat(right);
            }
            if (cond.includes('<')) {
              const [left, right] = cond.split('<').map(s => s.trim());
              return parseFloat(left) < parseFloat(right);
            }
            if (cond.includes('and')) {
              const parts = cond.split('and');
              return parts.every(p => evaluateCondition(p));
            }
            
            return false;
          };

          if (evaluateCondition(condition)) {
            return ifContent;
          } else if (elsifCondition && evaluateCondition(elsifCondition)) {
            return elsifContent;
          } else if (elseContent) {
            return elseContent;
          }
          return '';
        });
      };

      output = processConditional(output);

      Object.keys(variables).forEach(varName => {
        const regex = new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g');
        output = output.replace(regex, variables[varName]);
      });

      output = output.replace(/\{%[^%]*%\}/g, '');
      
      return <div className="whitespace-pre-wrap">{output.trim()}</div>;
    } catch (error) {
      return <div className="text-red-500">Error rendering preview: {error.message}</div>;
    }
  };

  const generateWithAI = async (prompt) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
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
          ],
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        let code = data.content[0].text.trim();
        // Remove markdown code blocks if present
        code = code.replace(/```liquid\n?/g, '').replace(/```\n?/g, '');
        return code;
      }
      
      return '// Error: Could not generate code';
    } catch (error) {
      console.error('AI Generation Error:', error);
      return '// Error: ' + error.message;
    }
  };

  const handleGenerate = async (customPrompt = null) => {
    const promptToUse = customPrompt || input;
    
    if (!promptToUse.trim()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const rawCode = await generateWithAI(promptToUse);
      const fixedCode = autoFixLiquidCode(rawCode);
      setGeneratedCode(fixedCode);
      if (customPrompt) {
        setInput(customPrompt);
      }
      setShowPreview(true);
    } catch (error) {
      setGeneratedCode('// Error generating code: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Movement Liquid Code Generator
          </h1>
          <p className="text-gray-600">
            Describe what you want in plain English, AI generates personalized email code instantly
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Quick Start Examples
            </h2>
            <div className="space-y-3">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerate(example.prompt)}
                  disabled={isGenerating}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold text-gray-900 mb-1">
                    {example.title}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {example.description}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    💡 {example.impact}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Describe Your Goal
              </h2>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g., 'Show a thank you message to donors who gave in the last 30 days, and ask non-donors to make their first contribution'"
                className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                disabled={isGenerating}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !input.trim()}
                className="mt-4 w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Liquid Code with AI'
                )}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Generated Code</h2>
                {generatedCode && !generatedCode.includes('// Enter a description') && !generatedCode.includes('// Error') && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono h-64 overflow-y-auto">
                {generatedCode || '// Your generated code will appear here...'}
              </pre>
            </div>

            {showPreview && generatedCode && !generatedCode.includes('// Enter a description') && !generatedCode.includes('// Error') && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">Live Preview</h2>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test with supporter profile:
                  </label>
                  <select
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    {Object.entries(memberProfiles).map(([key, profile]) => (
                      <option key={key} value={key}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Profile:</strong> {memberProfiles[selectedProfile].name}
                  </div>
                  <div className="bg-white p-4 rounded border border-blue-300">
                    {renderPreview(generatedCode, memberProfiles[selectedProfile])}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">💡 Pro Tips for Movement Emails</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-900 mb-2">Always Test</div>
              <div className="text-sm text-blue-800">
                Use the Preview section to check different supporter profiles before sending
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-900 mb-2">Include Fallbacks</div>
              <div className="text-sm text-green-800">
                Always have an 'else' option for supporters who don't meet conditions
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-900 mb-2">AI Powered</div>
              <div className="text-sm text-purple-800">
                Describe what you need in plain English - AI handles the Liquid syntax
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidGenerator;
