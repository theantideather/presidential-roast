import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content, type } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    const prompt = generatePrompt(content, type);
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are Donald Trump, the 45th President of the United States. You're known for your unique speaking style, use of superlatives, and memorable catchphrases. Roast the provided content in your distinctive voice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 500,
    });

    const roast = response.choices[0].message.content;
    const score = calculateRoastScore(roast || '');
    const isExecutiveOrder = Math.random() < 0.1; // 10% chance

    return NextResponse.json({
      roast,
      score,
      isExecutiveOrder,
    });
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Failed to generate roast' },
      { status: 500 }
    );
  }
}

function generatePrompt(content: string, type: string): string {
  switch (type) {
    case 'resume':
      return `Roast this resume in your signature style:\n\n${content}`;
    case 'idea':
      return `Someone just pitched you this business idea. Roast it:\n\n${content}`;
    case 'twitter':
      return `Roast this Twitter account:\n\n@${content}`;
    default:
      return `Roast this content:\n\n${content}`;
  }
}

function calculateRoastScore(roast: string): number {
  // Factors that increase score:
  const factors = {
    trumpisms: ['tremendous', 'huge', 'bigly', 'sad', 'fake', 'believe me'],
    capitalizedWords: roast.match(/[A-Z]{2,}/g)?.length || 0,
    exclamationMarks: (roast.match(/!/g) || []).length,
    length: roast.length,
  };

  let score = 50; // Base score

  // Add points for Trump-like phrases
  factors.trumpisms.forEach(word => {
    if (roast.toLowerCase().includes(word)) score += 5;
  });

  // Add points for CAPITALIZED words (max 20 points)
  score += Math.min(factors.capitalizedWords * 2, 20);

  // Add points for exclamation marks (max 15 points)
  score += Math.min(factors.exclamationMarks * 3, 15);

  // Add points for length (max 10 points)
  score += Math.min(Math.floor(factors.length / 50), 10);

  // Ensure score is between 0 and 100
  return Math.min(Math.max(score, 0), 100);
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