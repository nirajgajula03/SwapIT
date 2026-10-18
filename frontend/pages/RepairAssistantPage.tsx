import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { RepairGuidance, RepairStep } from '../types';
import {
  RepairAssistantIcon,
  WrenchIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CameraIcon,
  TagIcon,
  DollarSignIcon,
} from '../components/Icons';

const PRESET_ISSUES = [
  {
    title: 'Drifting Analog Stick on Game Controller',
    itemName: 'Xbox / PlayStation Controller',
    issue: 'The left joystick drifts upward without being touched.',
    imageUrl: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&auto=format&fit=crop&q=60',
  },
  {
    title: 'Bicycle Chain Slipped Off / Stiff Links',
    itemName: 'Road / Mountain Bicycle',
    issue: 'Chain came off the front cog and has squeaking stiff links.',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=60',
  },
  {
    title: 'Headphones Only Playing in One Ear',
    itemName: 'Over-ear Headphones',
    issue: 'Audio only comes out of the right ear cup; wire near 3.5mm plug seems loose.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
  },
];

const RepairAssistantPage: React.FC = () => {
  const [itemName, setItemName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<RepairGuidance | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  const handleApplyPreset = (preset: (typeof PRESET_ISSUES)[number]) => {
    setItemName(preset.itemName);
    setIssueDescription(preset.issue);
    setImageUrl(preset.imageUrl);
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !issueDescription.trim()) {
      setError('Please provide both the item name and a description of the damage or issue.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setGuidance(null);
    setRawOutput(null);

    try {
      const apiKey =
        (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
        (process as any)?.env?.API_KEY ||
        '';

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert repair technician and upcycling engineer.
A user needs help repairing this item:
Item Name: ${itemName}
Reported Issue / Damage: ${issueDescription}
${imageUrl ? `Item Image reference URL: ${imageUrl}` : ''}

Analyze the problem and generate a detailed, safe, step-by-step repair guide.
Respond strictly in JSON format (do not include markdown ticks \`\`\`json or explanation outside the JSON):
{
  "itemName": "${itemName}",
  "itemImageUrl": "${imageUrl || ''}",
  "detectedIssue": "Concise summary of the likely diagnosis",
  "estimatedCost": "e.g. $5 - $15 (or Free with household tools)",
  "isDIYFriendly": true,
  "requiredParts": ["Tool or part 1", "Tool or part 2", "Item 3"],
  "steps": [
    {
      "id": "step-1",
      "title": "Title of step",
      "description": "Clear, practical, actionable instructions with safety caveats.",
      "completed": false
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const responseText = response.text?.trim() || '';

      // Try parsing JSON out of response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as RepairGuidance;
          // Ensure steps have boolean completed
          if (Array.isArray(parsed.steps)) {
            parsed.steps = parsed.steps.map((st, idx) => ({
              id: st.id || `step-${idx + 1}`,
              title: st.title || `Step ${idx + 1}`,
              description: st.description || '',
              completed: false,
            }));
          }
          parsed.itemName = parsed.itemName || itemName;
          parsed.itemImageUrl = imageUrl || parsed.itemImageUrl;
          setGuidance(parsed);
        } else {
          setRawOutput(responseText);
        }
      } catch (parseError) {
        console.warn('Could not parse Gemini JSON response, showing raw text:', parseError);
        setRawOutput(responseText);
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      setError(
        err?.message ||
          'Failed to connect to the AI repair service. Please check your API key configuration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStepCompleted = (stepId: string) => {
    if (!guidance) return;
    setGuidance({
      ...guidance,
      steps: guidance.steps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ),
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-[#001845] text-white p-8 md:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-[#E9D8A6] mb-3 backdrop-blur-xs">
            <RepairAssistantIcon className="w-4 h-4" />
            <span>AI Diagnostic Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Fix It, Don't Pitch It! 🛠️
          </h1>
          <p className="mt-3 text-sm md:text-base text-teal-100/90 leading-relaxed">
            Powered by Gemini AI. Describe what’s broken or failing on your item, and get instant step-by-step diagnostics, tool requirements, and cost estimates to repair it yourself.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* Preset Inspirations */}
      <div className="bg-white dark:bg-[#001233] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">
          Try a sample repair case:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_ISSUES.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 text-left rounded-xl bg-gray-50 dark:bg-[#001845] hover:bg-gray-100 dark:hover:bg-[#001845]/70 border border-gray-200 dark:border-gray-700/60 transition group cursor-pointer"
            >
              <h4 className="font-bold text-xs text-[#001233] dark:text-[#EFEFDE] group-hover:text-[#2A67C9] transition truncate">
                {preset.title}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {preset.issue}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleDiagnose}
        className="bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="itemName"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Item Name *
            </label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Sony WH-1000XM4 Headphones"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            />
          </div>

          <div>
            <label
              htmlFor="imageUrl"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Item Image URL (Optional)
            </label>
            <div className="relative">
              <CameraIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/item.jpg"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="issueDescription"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Describe The Issue or Damage *
          </label>
          <textarea
            id="issueDescription"
            rows={3}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe what's broken, symptoms, error lights, physical cracks, or unusual noises..."
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-400 text-sm">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Consulting Gemini AI...</span>
              </>
            ) : (
              <>
                <WrenchIcon className="w-5 h-5" />
                <span>Diagnose & Guide Repair</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Diagnosis Results Section */}
      {guidance && (
        <div className="bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
          {/* Top Result Overview */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    guidance.isDIYFriendly
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {guidance.isDIYFriendly ? '✓ DIY Friendly' : '⚠️ Advanced Repair'}
                </span>
                <span className="text-xs text-gray-500">Gemini 2.0 Flash</span>
              </div>
              <h2 className="text-2xl font-black text-[#001233] dark:text-[#EFEFDE] mt-2">
                {guidance.itemName}
              </h2>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
                <strong className="text-[#001233] dark:text-[#EFEFDE]">Detected Issue:</strong>{' '}
                {guidance.detectedIssue}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#001845] p-4 rounded-2xl border border-gray-200 dark:border-gray-700/60">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#EE9B00]">
                <DollarSignIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Estimated Repair Cost
                </span>
                <p className="text-lg font-extrabold text-[#001233] dark:text-[#EFEFDE]">
                  {guidance.estimatedCost || 'Low / Free'}
                </p>
              </div>
            </div>
          </div>

          {/* Required Parts & Tools */}
          {guidance.requiredParts && guidance.requiredParts.length > 0 && (
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2A67C9] dark:text-[#E9D8A6] flex items-center gap-2">
                <WrenchIcon className="w-4 h-4" />
                <span>Required Tools & Materials</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {guidance.requiredParts.map((part, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#001845] border border-blue-200 dark:border-blue-800 text-xs font-semibold text-[#001233] dark:text-[#EFEFDE] shadow-2xs"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#001233] dark:text-[#EFEFDE]">
              Step-by-Step Repair Guide
            </h3>

            <div className="space-y-3">
              {guidance.steps?.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => toggleStepCompleted(step.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                    step.completed
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-gray-50 dark:bg-[#001845] border-gray-200 dark:border-gray-700/60 hover:border-[#2A67C9]'
                  }`}
                >
                  <button
                    type="button"
                    className={`mt-0.5 p-1 rounded-full transition flex-shrink-0 ${
                      step.completed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-300 dark:text-gray-600 hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircleIcon className="w-6 h-6" completed={step.completed} />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Step {index + 1}
                      </span>
                      <h4
                        className={`text-sm font-bold ${
                          step.completed
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-[#001233] dark:text-[#EFEFDE]'
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        step.completed
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Raw output fallback if Gemini gave unstructured text */}
      {rawOutput && !guidance && (
        <div className="bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-md space-y-4">
          <h3 className="text-lg font-bold text-[#001233] dark:text-[#EFEFDE]">
            AI Diagnosis & Guidance
          </h3>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#001845] text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {rawOutput}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairAssistantPage;
