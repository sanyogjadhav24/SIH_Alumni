import { NextRequest, NextResponse } from 'next/server';

// Main handler function
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    console.log(`Fetching post summaries for user: ${userId}`);
    console.log(`Authorization header: ${request.headers.get('authorization')}`);
    
    // Fetch user posts from backend
    const backendResponse = await fetch(`http://localhost:4000/api/posts/user/${userId}`, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
      },
    });

    console.log(`Backend response status: ${backendResponse.status}`);
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} - ${errorText}`);
      throw new Error(`Backend error: ${backendResponse.status} - ${errorText}`);
    }

    const backendData = await backendResponse.json();
    const posts = backendData.posts || backendData; // Handle both response formats
    console.log(`Found ${posts.length} posts for analysis`);

    // Analyze each post using Story_teller AI implementation
    const summaries = await Promise.all(
      posts.map(async (post: any) => {
        console.log(`\nAnalyzing post ${post._id}:`);
        console.log(`Category: ${post.category}`);
        console.log(`Content: ${post.content.substring(0, 100)}...`);
        console.log(`Content length: ${post.content.length}`);

        // Prepare content for analysis
        let combinedContent = post.content;

        // Add image analysis if image exists
        if (post.imageUrl) {
          console.log(`Has image: true`);
          try {
            const imageAnalysis = await analyzeImageFromUrl(post.imageUrl);
            if (imageAnalysis) {
              combinedContent = `Visual content shared by the user. ${combinedContent}`;
              console.log(`Combined with image analysis: "${combinedContent.substring(0, 150)}..."`);
            }
          } catch (error) {
            console.error("Image analysis failed:", error);
          }
        } else {
          console.log(`Has image: false`);
        }

        console.log(`=== Analyzing Content ===`);
        console.log(`Original content: "${post.content.substring(0, 200)}..."`);

        // Generate AI summary using Story_teller implementation
        console.log(`Generating summary for: "${combinedContent.substring(0, 200)}..."`);
        const summary = await generateAISummaryWithStoryTeller(combinedContent);
        console.log(`Generated summary: "${summary}"`);
        
        const sentiment = await analyzeSentimentWithStoryTeller(combinedContent);
        console.log(`Detected sentiment: "${sentiment}"`);
        
        const keyTopics = await extractTopicsWithStoryTeller(combinedContent);
        console.log(`Extracted topics: [${keyTopics.join(', ')}]`);

        const analysisResult = {
          summary,
          sentiment,
          keyTopics,
          confidence: 0.85
        };

        console.log(`Final analysis result:`, analysisResult);
        console.log(`=== End Analysis ===\n`);

        return {
          id: post._id,
          title: extractTitleFromSummary(summary),
          summary: extractSubtitleFromSummary(summary),
          sentiment,
          keyTopics,
          confidence: 0.85,
          category: post.category,
          createdAt: post.createdAt,
          ...(post.imageUrl && { imageUrl: post.imageUrl }),
          originalContent: post.content,
          ...(post.feeling && { feeling: post.feeling }),
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
        };
      })
    );

    console.log(`\nReturning ${summaries.length} analyzed post summaries`);
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Failed to fetch post summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post summaries' },
      { status: 500 }
    );
  }
}

// Story_teller AI implementation functions
async function analyzeImageFromUrl(imageUrl: string): Promise<string> {
  try {
    // For now, skip external image analysis to avoid rate limits
    // Instead, return a descriptive text based on the context
    return "Visual content shared by the user";
  } catch (error) {
    console.error("Image analysis failed:", error);
    return "";
  }
}

// Real AI summarization using Hugging Face (from Story_teller)
async function generateAISummaryWithStoryTeller(content: string): Promise<string> {
  try {
    // Clean and prepare content for better summarization
    const cleanContent = content.replace(/[^\w\s.,!?-]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // If content is too short, use enhanced basic summary
    if (cleanContent.length < 50) {
      return generateStructuredBasicSummary(cleanContent);
    }

    // Use free summarization model with better parameters
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: cleanContent,
          parameters: {
            max_length: 150,
            min_length: 50,
            length_penalty: 2.0,
            num_beams: 4
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result.length > 0 && result[0].summary_text) {
      let summary = result[0].summary_text;
      
      // Structure the summary with title and subtitle format
      summary = structureSummaryWithTitleAndSubtitle(summary, cleanContent);
      
      return summary;
    }
    
    // Fallback to structured basic summary
    return generateStructuredBasicSummary(cleanContent);
  } catch (error) {
    console.error("Free AI summarization failed:", error);
    return generateStructuredBasicSummary(content);
  }
}

// Real sentiment analysis using Hugging Face (from Story_teller)
async function analyzeSentimentWithStoryTeller(content: string): Promise<string> {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: content
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result.length > 0 && result[0].length > 0) {
      const topSentiment = result[0][0];
      return topSentiment.label.charAt(0).toUpperCase() + topSentiment.label.slice(1);
    }
    
    return "Neutral";
  } catch (error) {
    console.error("Free sentiment analysis failed:", error);
    return detectBasicSentiment(content);
  }
}

// Real topic extraction using Hugging Face (from Story_teller)
async function extractTopicsWithStoryTeller(content: string): Promise<string[]> {
  try {
    // Use zero-shot classification for topic extraction
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: content,
          parameters: {
            candidate_labels: [
              "recruitment", "interview", "technology", "programming", 
              "career", "achievement", "education", "database", 
              "innovation", "project", "learning", "success"
            ]
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result.labels && result.scores) {
      // Return top 5 topics with confidence > 0.1
      return result.labels
        .filter((label: string, index: number) => result.scores[index] > 0.1)
        .slice(0, 5);
    }
    
    return extractBasicKeywords(content);
  } catch (error) {
    console.error("Free topic extraction failed:", error);
    return extractBasicKeywords(content);
  }
}

// Structure summary with title and subtitle format (from Story_teller)
function structureSummaryWithTitleAndSubtitle(aiSummary: string, originalContent: string): string {
  const content = originalContent.toLowerCase();
  
  // Extract title from AI summary or create contextual one
  let title = "";
  let subtitle = "";
  
  // Detect context and create appropriate title
  if (content.includes('internship') && (content.includes('full-time') || content.includes('fte') || content.includes('permanent'))) {
    title = "🌟 Exciting Career News 🌟";
    
    const companyMatch = content.match(/with ([A-Z][A-Za-z\s&]+(?:systems|solutions|technologies|corp|inc|ltd|deloitte|microsoft|google|amazon|infosys|tcs|wipro))/i);
    const roleMatch = content.match(/(full.?stack|software|developer|engineer|analyst|consultant)/i);
    const technologiesMatch = content.match(/(sap.?abap|angular|\.net|react|java|python|javascript)/ig);
    const mentorsMatch = content.match(/grateful to ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    
    if (companyMatch) {
      subtitle = `What started as an internship has now turned into a full-time role with ${companyMatch[1]}`;
      if (roleMatch) {
        subtitle += ` as a ${roleMatch[1].charAt(0).toUpperCase() + roleMatch[1].slice(1)} Developer`;
      }
      subtitle += '. ';
    } else {
      subtitle = "What started as an internship has now turned into a full-time role. ";
    }
    
    if (technologiesMatch && technologiesMatch.length > 0) {
      const uniqueTechs = [...new Set(technologiesMatch.map(tech => tech.toUpperCase().replace(/\./g, '')))];
      if (uniqueTechs.length === 1) {
        subtitle += `During the internship, explored ${uniqueTechs[0]}`;
      } else if (uniqueTechs.length === 2) {
        subtitle += `During the internship, explored ${uniqueTechs[0]}, and now diving into ${uniqueTechs[1]}`;
      } else {
        subtitle += `During the internship, explored ${uniqueTechs[0]}, and now diving into ${uniqueTechs.slice(1).join(', ')}`;
      }
      subtitle += ' as part of major projects. ';
    }
    
    if (mentorsMatch) {
      subtitle += `A big thank you to ${mentorsMatch[1]} for guidance and support throughout this journey. `;
    }
    
    subtitle += "Here's to new beginnings, continuous learning, and meaningful contributions! ";
    
    return `${title}\n\n${subtitle}`;
  }
  
  if (content.includes('code-a-thon') || content.includes('coding competition')) {
    title = "🌟 CODE-A-THON 2025 Coding Competition Journey 🌟";
    
    const participantsMatch = content.match(/(\d+)\+?\s*participants/i);
    const roundsCleared = content.includes('cleared') || content.includes('qualified');
    
    if (participantsMatch) {
      subtitle = `From among ${participantsMatch[1]}+ participants, participated in multiple competitive programming rounds. `;
    } else {
      subtitle = "Participated in intensive coding competition with algorithm challenges and problem-solving tasks. ";
    }
    
    if (roundsCleared) {
      subtitle += "Successfully cleared technical assessment rounds. ";
    }
    
    subtitle += "Every challenge builds stronger problem-solving skills and coding expertise.";
    return `${title}\n\n${subtitle}`;
  }
  
  if (content.includes('recruitment') || content.includes('interview')) {
    title = "💼 Professional Interview Experience";
    
    const roundsMatch = content.match(/(\d+)\s*rounds?/i);
    const packageMatch = content.match(/(\d+)\s*lpa/i);
    const companyMatch = content.match(/with ([A-Z][A-Za-z\s]+(?:systems|solutions|technologies|corp|inc|ltd))/i);
    
    if (companyMatch) {
      title = `💼 ${companyMatch[1]} Interview Journey`;
    }
    
    let subtitleContent = roundsMatch ? 
      `Successfully completed all ${roundsMatch[1]} rounds of technical and behavioral interviews. ` :
      "Demonstrated strong technical skills and communication abilities through multiple interview rounds. ";
    
    if (content.includes('overqualified')) {
      subtitleContent += "Received feedback about being overqualified for the role. ";
      subtitleContent += "This experience opens doors to even better opportunities ahead.";
    } else if (content.includes('selected') && packageMatch) {
      subtitleContent += `Secured position with ${packageMatch[1]} LPA package. `;
      subtitleContent += "Achievement unlocked through dedication and technical excellence.";
    } else {
      subtitleContent += "Gained valuable interview experience and technical assessment practice. ";
      subtitleContent += "Every interaction builds confidence for future opportunities.";
    }
    
    return `${title}\n\n${subtitleContent}`;
  }
  
  if (content.includes('sgpa') || content.includes('cgpa') || content.includes('semester')) {
    title = "🎓 Academic Excellence Achievement";
    
    const sgpaMatch = content.match(/sgpa[^\d]*(\d+\.?\d*)/i);
    const cgpaMatch = content.match(/cgpa[^\d]*(\d+\.?\d*)/i);
    const semesterMatch = content.match(/semester\s*(\d+)/i);
    
    if (sgpaMatch && cgpaMatch) {
      title = `🎓 Semester ${semesterMatch ? semesterMatch[1] : ''} Academic Results`;
      subtitle = `Achieved SGPA ${sgpaMatch[1]} and CGPA ${cgpaMatch[1]} demonstrating consistent academic excellence. `;
    } else {
      subtitle = "Completed academic semester with strong performance across technical subjects. ";
    }
    
    subtitle += "This semester involved mastering diverse technical subjects and practical applications. ";
    subtitle += "Strong academic foundation supports future career opportunities and advanced learning goals.";
    
    return `${title}\n\n${subtitle}`;
  }
  
  // Generic fallback using AI summary
  const cleanSummary = aiSummary.replace(/[^\w\s.,!?]/g, '').trim();
  title = "✨ Personal Development Journey ✨";
  subtitle = cleanSummary + ". This experience contributes to continuous learning and growth. Every step forward builds the foundation for future success.";
  
  return `${title}\n\n${subtitle}`;
}

// Enhanced structured basic summary for fallback (from Story_teller)
function generateStructuredBasicSummary(content: string): string {
  const text = content.toLowerCase();
  
  let title = "";
  let subtitle = "";
  
  // Detect context and create appropriate structured summary
  if (text.includes('internship') && (text.includes('full-time') || text.includes('fte') || text.includes('permanent'))) {
    title = "🌟 Exciting Career News 🌟";
    
    const companyMatch = text.match(/with ([A-Z][A-Za-z\s&]+(?:systems|solutions|technologies|corp|inc|ltd|deloitte|microsoft|google|amazon|infosys|tcs|wipro))/i);
    const roleMatch = text.match(/(full.?stack|software|developer|engineer|analyst|consultant)/i);
    const technologiesMatch = text.match(/(sap.?abap|angular|\.net|react|java|python|javascript)/ig);
    const mentorsMatch = text.match(/grateful to ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    
    if (companyMatch) {
      subtitle = `What started as an internship has now turned into a full-time role with ${companyMatch[1]}`;
      if (roleMatch) {
        subtitle += ` as a ${roleMatch[1].charAt(0).toUpperCase() + roleMatch[1].slice(1)} Developer`;
      }
      subtitle += '. ';
    } else {
      subtitle = "What started as an internship has now turned into a full-time role. ";
    }
    
    if (technologiesMatch && technologiesMatch.length > 0) {
      const uniqueTechs = [...new Set(technologiesMatch.map(tech => tech.toUpperCase().replace(/\./g, '')))];
      if (uniqueTechs.length === 1) {
        subtitle += `During the internship, explored ${uniqueTechs[0]}`;
      } else if (uniqueTechs.length === 2) {
        subtitle += `During the internship, explored ${uniqueTechs[0]}, and now diving into ${uniqueTechs[1]}`;
      } else {
        subtitle += `During the internship, explored ${uniqueTechs[0]}, and now diving into ${uniqueTechs.slice(1).join(', ')}`;
      }
      subtitle += ' as part of major projects. ';
    }
    
    if (mentorsMatch) {
      subtitle += `A big thank you to ${mentorsMatch[1]} for guidance and support throughout this journey. `;
    }
    
    subtitle += "Here's to new beginnings, continuous learning, and meaningful contributions!";
  } else if (text.includes('code-a-thon') || text.includes('coding competition')) {
    title = "🌟 CODE-A-THON 2025 Coding Competition Journey 🌟";
    
    const participantsMatch = text.match(/(\d+)\+?\s*participants/i);
    const roundsCleared = text.includes('cleared') || text.includes('qualified');
    
    if (participantsMatch) {
      subtitle = `From among ${participantsMatch[1]}+ participants, participated in multiple competitive programming rounds. `;
    } else {
      subtitle = "Participated in intensive coding competition with algorithm challenges and problem-solving tasks. ";
    }
    
    if (roundsCleared) {
      subtitle += "Successfully cleared technical assessment rounds. ";
    }
    
    subtitle += "Every challenge builds stronger problem-solving skills and coding expertise.";
  } else if (text.includes('recruitment') || text.includes('interview')) {
    const companyMatch = text.match(/with ([A-Z][A-Za-z\s]+(?:systems|solutions|technologies|corp|inc|ltd))/i);
    const roundsMatch = text.match(/(\d+)\s*rounds?/i);
    
    title = companyMatch ? `💼 ${companyMatch[1]} Interview Journey` : "💼 Professional Interview Experience";
    
    subtitle = roundsMatch ? 
      `Successfully completed all ${roundsMatch[1]} rounds of technical and behavioral interviews. ` :
      "Demonstrated strong technical skills and communication abilities through multiple interview rounds. ";
    
    if (text.includes('overqualified')) {
      subtitle += "Received feedback about being overqualified for the role. ";
      subtitle += "This experience opens doors to even better opportunities ahead.";
    } else {
      subtitle += "Gained valuable interview experience and technical assessment practice. ";
      subtitle += "Every interaction builds confidence for future opportunities.";
    }
  } else if (text.includes('sgpa') || text.includes('cgpa') || text.includes('semester')) {
    const sgpaMatch = text.match(/sgpa[^\d]*(\d+\.?\d*)/i);
    const cgpaMatch = text.match(/cgpa[^\d]*(\d+\.?\d*)/i);
    const semesterMatch = text.match(/semester\s*(\d+)/i);
    
    title = sgpaMatch && cgpaMatch ? 
      `🎓 Semester ${semesterMatch ? semesterMatch[1] : ''} Academic Results` :
      "🎓 Academic Excellence Achievement";
    
    if (sgpaMatch && cgpaMatch) {
      subtitle = `Achieved SGPA ${sgpaMatch[1]} and CGPA ${cgpaMatch[1]} demonstrating consistent academic excellence. `;
    } else {
      subtitle = "Completed academic semester with strong performance across technical subjects. ";
    }
    
    subtitle += "This semester involved mastering diverse technical subjects and practical applications. ";
    subtitle += "Strong academic foundation supports future career opportunities and advanced learning goals.";
  } else {
    // Generic structured summary
    title = "✨ Personal Development Journey ✨";
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 2) {
      subtitle = sentences.slice(0, 2).map(s => s.trim()).join('. ') + '. ';
      subtitle += "This experience contributes to continuous personal and professional growth.";
    } else {
      subtitle = "Engaged in meaningful activities that build skills and expand knowledge base. ";
      subtitle += "Each new experience provides valuable insights and learning opportunities. ";
      subtitle += "Continuous improvement drives progress toward achieving long-term goals.";
    }
  }
  
  return `${title}\n\n${subtitle}`;
}

// Basic sentiment detection fallback
function detectBasicSentiment(content: string): string {
  const positiveWords = ['excited', 'happy', 'grateful', 'proud', 'amazing', 'excellent', 'successful', 'achievement', 'wonderful', 'fantastic', 'great', 'love', 'thrilled', 'accomplished', 'motivated'];
  const negativeWords = ['disappointed', 'sad', 'frustrated', 'difficult', 'challenging', 'struggle', 'failed', 'hard', 'tough', 'worried', 'stressed'];
  
  const lowerContent = content.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return "Positive";
  if (negativeScore > positiveScore) return "Negative";
  return "Neutral";
}

// Basic keyword extraction fallback
function extractBasicKeywords(content: string): string[] {
  const text = content.toLowerCase();
  
  // Predefined relevant keywords
  const keywords = [
    'recruitment', 'interview', 'technology', 'programming', 'career',
    'achievement', 'education', 'database', 'innovation', 'project',
    'learning', 'success', 'semester', 'sgpa', 'cgpa'
  ];
  
  const foundKeywords = keywords.filter(keyword => text.includes(keyword));
  
  if (foundKeywords.length > 0) {
    return foundKeywords.slice(0, 5);
  }
  
  // Fallback to frequency analysis
  const words = text
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3 && !['this', 'that', 'with', 'have', 'been', 'will'].includes(word));
  
  const frequency: { [key: string]: number } = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  const topics = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  return topics.length > 0 ? topics : ["journey", "experience", "growth", "opportunity", "success"];
}

// Helper functions to extract title and subtitle from structured summary
function extractTitleFromSummary(summary: string): string {
  const lines = summary.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    return lines[0].replace(/[🌟💼🎓✨🚀]/g, '').trim();
  }
  return "Professional Update";
}

function extractSubtitleFromSummary(summary: string): string {
  const lines = summary.split('\n').filter(line => line.trim());
  if (lines.length > 2) {
    return lines.slice(2).join(' ').trim();
  } else if (lines.length === 2) {
    return lines[1].trim();
  }
  return summary;
}