import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content } = body;
    
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type and content' },
        { status: 400 }
      );
    }
    
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log("Missing OpenAI API key, using mock data");
      return mockResponse(type, content);
    }
    
    // Generate a prompt based on the content type
    let prompt = '';
    if (type === 'idea') {
      prompt = `Below is a business or product idea. Roast this idea in the distinctive style of President Donald Trump. The roast should be humorous, exaggerated, and in Trump's unique speaking style with his common phrases, hyperbole, and mannerisms. Use CAPITAL LETTERS for emphasis, like Trump often does. Make it funny but not overly offensive.\n\nIdea: ${content}\n\nTrump's Roast:`;
    } else if (type === 'resume') {
      prompt = `Below is a brief summary of someone's resume or qualifications. Roast this resume in the distinctive style of President Donald Trump. The roast should be humorous, exaggerated, and in Trump's unique speaking style with his common phrases, hyperbole, and mannerisms. Use CAPITAL LETTERS for emphasis, like Trump often does. Make it funny but not overly offensive.\n\nResume: ${content}\n\nTrump's Roast:`;
    } else if (type === 'twitter') {
      prompt = `Below is a Twitter handle. Pretend you've looked at their Twitter account and roast them in the distinctive style of President Donald Trump. The roast should be humorous, exaggerated, and in Trump's unique speaking style with his common phrases, hyperbole, and mannerisms. Use CAPITAL LETTERS for emphasis, like Trump often does. Make it funny but not overly offensive.\n\nTwitter Handle: @${content}\n\nTrump's Roast:`;
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: idea, resume, twitter' },
        { status: 400 }
      );
    }
    
    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4', // Use gpt-3.5-turbo if needed for cost reasons
        messages: [
          {
            role: 'system',
            content: `You are President Donald Trump. You speak in his distinctive style with his common phrases, hyperbole, and mannerisms. You use CAPITAL LETTERS for emphasis. Your task is to roast whatever is presented to you in a humorous way, capturing Trump's essence without being overly offensive.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 1.0, // Higher temperature for more creative responses
      });
      
      // Extract the generated roast
      const roast = response.choices[0]?.message?.content?.trim() || '';
      
      // Generate a score (1-10) that correlates with the sentiment
      // For this demo, we'll use a formula based on the length and exclamation marks as a rough proxy
      const exclamationCount = (roast.match(/!/g) || []).length;
      const capsCount = (roast.match(/[A-Z]{3,}/g) || []).length;
      
      // Score formula: 1-10 scale weighted by exclamations, caps, and a bit of randomness
      let scoreBase = Math.min(10, Math.max(1, 
        3 + 
        (exclamationCount * 0.5) + 
        (capsCount * 0.7) + 
        (Math.random() * 3)
      ));
      
      // Round to nearest integer
      const score = Math.round(scoreBase);
      
      // Executive order if score >= 7
      const isExecutiveOrder = score >= 7;
      
      return NextResponse.json({
        roast,
        score,
        isExecutiveOrder,
      });
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      return mockResponse(type, content);
    }
    
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Failed to generate roast' },
      { status: 500 }
    );
  }
}

// Fallback function for mock response when API keys are not available
function mockResponse(type: string, content: string) {
  // Set of mock roasts for different types
  const mockRoasts = {
    idea: [
      {
        roast: "Look folks, this idea is a DISASTER. Believe me. Total failure waiting to happen. Everyone says so. SAD!",
        score: 3,
        isExecutiveOrder: false
      },
      {
        roast: "This idea? TREMENDOUS. The most BEAUTIFUL idea maybe EVER. People are saying it's the best they've seen. I love it!",
        score: 9,
        isExecutiveOrder: true
      }
    ],
    resume: [
      {
        roast: "This resume? Probably the worst resume in the history of resumes. And I've seen a lot of resumes, let me tell you. TERRIBLE education. No experience. Low energy candidate!",
        score: 2,
        isExecutiveOrder: false
      },
      {
        roast: "Look at this resume folks - VERY IMPRESSIVE. This person has a BIGLY career ahead of them. HUGE potential. I'd hire them in a second!",
        score: 8,
        isExecutiveOrder: true
      }
    ],
    twitter: [
      {
        roast: `The Twitter account @${content}? FAKE NEWS central! Terrible followers, all LOSERS and HATERS! SAD!`,
        score: 4,
        isExecutiveOrder: false
      },
      {
        roast: `Just checked out @${content}'s Twitter. TREMENDOUS tweets. The BEST tweets, maybe ever! Everyone is talking about how AMAZING this account is!`,
        score: 9,
        isExecutiveOrder: true
      }
    ]
  };
  
  // Pick a random mock roast based on the type
  const typeRoasts = mockRoasts[type as keyof typeof mockRoasts] || mockRoasts.idea;
  const randomIndex = Math.floor(Math.random() * typeRoasts.length);
  
  return NextResponse.json(typeRoasts[randomIndex]);
} 