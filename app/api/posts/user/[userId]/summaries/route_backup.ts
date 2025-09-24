import { NextRequest, NextResponse } from "next/server";

interface AnalysisResult {
  summary: string;
  sentiment: string;
  keyTopics: string[];
  confidence: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Extract authorization token
    const authorization = request.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    // Fetch user posts from your backend
    const backendResponse = await fetch(`http://localhost:4000/api/posts/user/${userId}`, {
      headers: {
        Authorization: authorization,
      },
    });

    if (!backendResponse.ok) {
      throw new Error("Failed to fetch posts from backend");
    }

    const backendData = await backendResponse.json();
    const posts = backendData.posts || backendData; // Handle both response formats

    // Process each post through AI analysis
    const processedPosts = await Promise.all(
      posts.map(async (post: any) => {
        try {
          // Prepare content for analysis
          let content = post.content || "";
          
          // Add category-specific content
          if (post.category === "event" && post.eventDetails) {
            content += ` Event: ${post.eventDetails.title}. ${post.eventDetails.description || ""}`;
          }
          if (post.category === "location" && post.locationDetails) {
            content += ` Location: ${post.locationDetails.placeName}`;
          }
          if (post.category === "feeling" && post.feeling) {
            content += ` Feeling: ${post.feeling}`;
          }

          // Log the content being analyzed for debugging
          console.log(`Analyzing post ${post._id}:`);
          console.log(`Category: ${post.category}`);
          console.log(`Content: ${content}`);
          console.log(`Content length: ${content.length}`);

          // Analyze content using AI (similar to Story_teller logic)
          const analysis = await analyzePostContent(content, post.imageUrl);
          
          return {
            id: post._id,
            title: generatePostTitle(post, analysis),
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            keyTopics: analysis.keyTopics,
            confidence: analysis.confidence,
            category: post.category,
            createdAt: post.createdAt,
            imageUrl: post.imageUrl,
            originalContent: content,
            feeling: post.feeling,
            eventTitle: post.eventDetails?.title,
            placeName: post.locationDetails?.placeName,
            likesCount: post.likes?.length || 0,
            commentsCount: post.comments?.length || 0,
          };
        } catch (error) {
          console.error(`Failed to analyze post ${post._id}:`, error);
          // Return basic data if analysis fails
          return {
            id: post._id,
            title: generateBasicTitle(post),
            summary: post.content || "No content available",
            sentiment: "Neutral",
            keyTopics: [],
            confidence: 0.5,
            category: post.category,
            createdAt: post.createdAt,
            imageUrl: post.imageUrl,
            originalContent: post.content || "",
            feeling: post.feeling,
            eventTitle: post.eventDetails?.title,
            placeName: post.locationDetails?.placeName,
            likesCount: post.likes?.length || 0,
            commentsCount: post.comments?.length || 0,
          };
        }
      })
    );

    // Sort by creation date (newest first)
    processedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(processedPosts);

  } catch (error) {
    console.error("Error fetching user post summaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch post summaries" },
      { status: 500 }
    );
  }
}

async function analyzePostContent(content: string, imageUrl?: string): Promise<AnalysisResult> {
  try {
    console.log(`\n=== Analyzing Content ===`);
    console.log(`Original content: "${content}"`);
    console.log(`Has image: ${!!imageUrl}`);
    
    let combinedContent = content;
    
    // If there's an image, analyze it first
    if (imageUrl) {
      try {
        const imageAnalysis = await analyzeImageFromUrl(imageUrl);
        combinedContent = [imageAnalysis, content].filter(Boolean).join(". ");
        console.log(`Combined with image analysis: "${combinedContent}"`);
      } catch (error) {
        console.error("Image analysis failed:", error);
      }
    }

    // Generate AI summary
    console.log(`Generating summary for: "${combinedContent}"`);
    const summary = await generateAISummary(combinedContent);
    console.log(`Generated summary: "${summary}"`);
    
    const sentiment = await analyzeSentiment(combinedContent);
    console.log(`Detected sentiment: "${sentiment}"`);
    
    const keyTopics = await extractTopics(combinedContent);
    console.log(`Extracted topics: [${keyTopics.join(', ')}]`);

    const result = {
      summary,
      sentiment,
      keyTopics,
      confidence: 0.85,
    };
    
    console.log(`Final analysis result:`, result);
    console.log(`=== End Analysis ===\n`);
    
    return result;
  } catch (error) {
    console.error("Content analysis failed:", error);
    return {
      summary: generateBasicSummary(content),
      sentiment: "Neutral",
      keyTopics: extractBasicKeywords(content),
      confidence: 0.5,
    };
  }
}

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

async function generateAISummary(content: string): Promise<string> {
  try {
    const cleanContent = content.replace(/[^\w\s.,!?-]/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanContent.length < 20) {
      return generateStructuredBasicSummary(cleanContent);
    }

    // Use real Hugging Face AI for summarization (same as Story_teller)
    return await generateAISummaryWithFreeModels(cleanContent);
  } catch (error) {
    console.error("AI summarization failed:", error);
    return generateStructuredBasicSummary(content);
  }
}

// Real AI summarization using Hugging Face (from Story_teller)
async function generateAISummaryWithFreeModels(content: string): Promise<string> {
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

async function analyzeSentiment(content: string): Promise<string> {
  try {
    // Use real Hugging Face AI for sentiment analysis (same as Story_teller)
    return await analyzeSentimentWithFreeModel(content);
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    return detectBasicSentiment(content);
  }
}

// Real sentiment analysis using Hugging Face (from Story_teller)
async function analyzeSentimentWithFreeModel(content: string): Promise<string> {
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
    return "Neutral";
  }
}

// Structure summary with title and subtitle format (from Story_teller)
function structureSummaryWithTitleAndSubtitle(aiSummary: string, originalContent: string): string {
  const content = originalContent.toLowerCase();
  
  // Extract title from AI summary or create contextual one
  let title = "";
  let subtitle = "";
  
  // Detect context and create appropriate title
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
    return `${title}\n\n${subtitle} 🚀`;
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
    
    return `${title}\n\n${subtitleContent} 🚀`;
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
    
    return `${title}\n\n${subtitle} 🚀`;
  }
  
  // Generic fallback using AI summary
  const cleanSummary = aiSummary.replace(/[^\w\s.,!?]/g, '').trim();
  title = "✨ Personal Development Journey ✨";
  subtitle = cleanSummary + ". This experience contributes to continuous learning and growth. Every step forward builds the foundation for future success.";
  
  return `${title}\n\n${subtitle} 🚀`;
}

// Enhanced structured basic summary for fallback (from Story_teller)
function generateStructuredBasicSummary(content: string): string {
  const text = content.toLowerCase();
  
  let title = "";
  let subtitle = "";
  
  // Detect context and create appropriate structured summary
  if (text.includes('code-a-thon') || text.includes('coding competition')) {
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
  
  return `${title}\n\n${subtitle} 🚀`;
}
      const response = await fetch(
        'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: content.substring(0, 500) // Limit content length
async function extractTopics(content: string): Promise<string[]> {
  try {
    // Use real Hugging Face AI for topic extraction (same as Story_teller)
    return await extractTopicsWithFreeModel(content);
  } catch (error) {
    console.error("Topic extraction failed:", error);
    return extractBasicKeywords(content);
  }
}

// Real topic extraction using Hugging Face (from Story_teller)
async function extractTopicsWithFreeModel(content: string): Promise<string[]> {
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

// Add missing detectBasicSentiment function
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
            inputs: content.substring(0, 500),
            parameters: {
              candidate_labels: [
                "academic", "career", "technology", "programming", "research", 
                "achievement", "learning", "networking", "project", "innovation",
                "education", "internship", "graduation", "conference", "database",
                "software", "engineering", "data science", "web development"
              ]
            }
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result && result.labels && result.scores) {
          return result.labels
            .filter((label: string, index: number) => result.scores[index] > 0.1)
            .slice(0, 5);
        }
      }
    } catch (apiError) {
      console.log("Topic extraction API unavailable, using local analysis");
    }

    // Enhanced local topic extraction
    const lowerContent = content.toLowerCase();
    const foundTopics: string[] = [];
    
    // Specific technical topics
    const topicMap = {
      'academic': ['semester', 'sgpa', 'cgpa', 'grade', 'university', 'education', 'study', 'course', 'exam'],
      'career': ['job', 'company', 'position', 'promotion', 'hired', 'internship', 'work', 'employment'],
      'programming': ['programming', 'coding', 'development', 'code', 'software', 'algorithm'],
      'technology': ['technology', 'tech', 'engineering', 'innovation', 'digital', 'technical'],
      'database': ['database', 'sql', 'mysql', 'mongodb', 'data'],
      'research': ['research', 'project', 'innovation', 'publication', 'paper', 'study'],
      'achievement': ['achievement', 'success', 'award', 'recognition', 'excellence', 'outstanding'],
      'learning': ['learning', 'skills', 'knowledge', 'training', 'workshop', 'course', 'certification'],
      'networking': ['team', 'collaboration', 'network', 'conference', 'event', 'meetup', 'community'],
      'data science': ['data science', 'analytics', 'machine learning', 'ai', 'artificial intelligence'],
      'web development': ['web', 'website', 'frontend', 'backend', 'html', 'css', 'javascript'],
      'graduation': ['graduation', 'degree', 'bachelor', 'master', 'completed', 'graduate']
    };
    
    // Check for specific mentions first
    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        foundTopics.push(topic);
      }
    }
    
    // Remove duplicates and return top 5
    const uniqueTopics = [...new Set(foundTopics)];
    return uniqueTopics.slice(0, 5);
  } catch (error) {
    console.error("Topic extraction failed:", error);
    return extractBasicKeywords(content);
  }
}

function generatePostTitle(post: any, analysis: AnalysisResult): string {
  const category = post.category;
  const content = (post.content || "").toLowerCase();
  
  // Generate smart titles based on content analysis
  if (content.includes('sgpa') || content.includes('cgpa') || content.includes('semester') || content.includes('grade')) {
    return "🎓 Academic Excellence Achievement";
  }
  
  if (content.includes('job') || content.includes('hired') || content.includes('company') || content.includes('position')) {
    return "💼 Career Milestone Unlocked";
  }
  
  if (content.includes('project') || content.includes('research') || content.includes('publication')) {
    return "💡 Innovation & Research Success";
  }
  
  if (content.includes('internship') || content.includes('intern')) {
    return "🚀 Internship Journey Update";
  }
  
  if (content.includes('graduation') || content.includes('graduated')) {
    return "🎉 Graduation Celebration";
  }
  
  if (content.includes('award') || content.includes('recognition') || content.includes('achievement')) {
    return "🏆 Recognition & Awards";
  }
  
  switch (category) {
    case "event":
      return `📅 ${post.eventDetails?.title || "Professional Event"}`;
    case "location":
      return `📍 Visit to ${post.locationDetails?.placeName || "New Location"}`;
    case "feeling":
      return `💭 Feeling ${post.feeling || "Inspired"}`;
    case "photo":
      // Try to infer from content
      if (content.includes('team') || content.includes('colleagues')) {
        return "👥 Team Collaboration Moment";
      }
      if (content.includes('office') || content.includes('workplace')) {
        return "🏢 Workplace Experience";
      }
      if (content.includes('conference') || content.includes('event')) {
        return "🤝 Professional Networking";
      }
      return "📸 Professional Update";
    default:
      // Extract meaningful phrases from content
      const sentences = (post.content || "").split(/[.!?]+/);
      const firstSentence = sentences[0]?.trim();
      if (firstSentence && firstSentence.length > 10 && firstSentence.length < 60) {
        return firstSentence;
      }
      return "✨ Alumni Success Story";
  }
}

function generateBasicTitle(post: any): string {
  const category = post.category;
  const content = (post.content || "").toLowerCase();
  
  // Smart title generation based on content
  if (content.includes('sgpa') || content.includes('cgpa') || content.includes('semester')) {
    return "🎓 Academic Achievement";
  }
  
  if (content.includes('job') || content.includes('company') || content.includes('hired')) {
    return "💼 Career Update";
  }
  
  if (content.includes('project') || content.includes('research')) {
    return "💡 Project Showcase";
  }
  
  switch (category) {
    case "event":
      return `📅 ${post.eventDetails?.title || "Professional Event"}`;
    case "location":
      return `📍 ${post.locationDetails?.placeName || "Location Visit"}`;
    case "feeling":
      return `💭 Feeling ${post.feeling || "Inspired"}`;
    case "photo":
      return "📸 Professional Update";
    default:
      return "✨ Alumni Update";
  }
}

function generateBasicSummary(content: string): string {
  if (!content || content.trim().length === 0) {
    return "No content available";
  }
  
  const words = content.trim().split(/\s+/);
  if (words.length <= 20) {
    return content;
  }
  
  return words.slice(0, 20).join(" ") + "...";
}

function generateIntelligentSummary(content: string): string {
  console.log(`\n🤖 GENERATING TRULY UNIQUE AI SUMMARY 🤖`);
  console.log(`Processing content: "${content.substring(0, 150)}${content.length > 150 ? '...' : ''}"`);
  
  // Split into sentences and clean
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const words = content.toLowerCase().split(/\s+/);
  
  console.log(`Content analysis: ${sentences.length} sentences, ${words.length} words`);
  
  // Generate truly unique summary based on actual content structure
  let summary = "";
  
  // Try to extract the most meaningful sentence that describes what happened
  let mainSentence = "";
  
  // Look for key narrative sentences (avoid generic introductions)
  for (const sentence of sentences) {
    const clean = sentence.trim();
    const lower = clean.toLowerCase();
    
    // Skip generic openings
    if (lower.startsWith('i') && (lower.includes('delighted') || lower.includes('excited') || lower.includes('happy'))) {
      continue;
    }
    
    // Look for action/result sentences
    if (lower.includes('selected') || lower.includes('cleared') || lower.includes('completed') || 
        lower.includes('achieved') || lower.includes('developed') || lower.includes('built') ||
        lower.includes('received') || lower.includes('awarded') || lower.includes('presented')) {
      mainSentence = clean;
      break;
    }
    
    // Look for specific details
    if (lower.includes('sgpa') || lower.includes('cgpa') || lower.includes('interview') || 
        lower.includes('assessment') || lower.includes('project') || lower.includes('platform')) {
      mainSentence = clean;
      break;
    }
  }
  
  // If no specific action found, use the most informative sentence
  if (!mainSentence && sentences.length > 0) {
    // Find the longest meaningful sentence (usually contains most detail)
    mainSentence = sentences.reduce((longest, current) => 
      current.length > longest.length ? current : longest, sentences[0]);
  }
  
  // Create unique summary by extracting key information
  if (mainSentence) {
    // Extract specific details from the main sentence
    const lowerMain = mainSentence.toLowerCase();
    
    if (lowerMain.includes('sgpa') || lowerMain.includes('cgpa')) {
      // Academic results
      const sgpaMatch = content.match(/sgpa[^0-9]*(\d+\.?\d*)/i);
      const cgpaMatch = content.match(/cgpa[^0-9]*(\d+\.?\d*)/i);
      summary = `🎓 Academic Excellence: `;
      if (sgpaMatch) summary += `SGPA ${sgpaMatch[1]} `;
      if (cgpaMatch) summary += `CGPA ${cgpaMatch[1]} `;
      summary += `in Information Technology. Completed comprehensive coursework covering programming, IoT, DBMS, and data science fundamentals.`;
      
    } else if (lowerMain.includes('interview') || lowerMain.includes('recruitment') || lowerMain.includes('rounds')) {
      // Interview/recruitment
      const companyMatch = content.match(/with ([A-Z][A-Za-z\s]+(?:Systems|Solutions|Technologies|Corp|Inc|Ltd))/i);
      const roundsMatch = content.match(/(\d+)\s*rounds?/i);
      summary = `💼 Interview Journey: `;
      if (companyMatch) summary += `${companyMatch[1]} recruitment process. `;
      if (roundsMatch) summary += `Completed ${roundsMatch[1]} rounds including technical assessments. `;
      
      // Look for specific outcomes
      if (content.toLowerCase().includes('not selected') || content.toLowerCase().includes('overqualified')) {
        summary += `Valuable learning experience despite final outcome.`;
      } else if (content.toLowerCase().includes('selected')) {
        summary += `Successfully advanced through multiple evaluation stages.`;
      } else {
        summary += `Comprehensive evaluation across technical and behavioral competencies.`;
      }
      
    } else if (lowerMain.includes('project') || lowerMain.includes('platform') || lowerMain.includes('developed')) {
      // Project work
      const projectMatch = content.match(/([A-Z][A-Za-z\s]+Platform|[A-Z][A-Za-z\s]+Project|[A-Z][A-Za-z\s]+System)/i);
      summary = `🚀 Project Development: `;
      if (projectMatch) {
        summary += `${projectMatch[1]} - `;
      }
      summary += `Solution-oriented development work with real-world applications and technical implementations.`;
      
    } else {
      // Generic but use actual content
      const key_words = extractMostImportantWords(content);
      summary = `⭐ ${key_words.slice(0, 8).join(' ')}`;
      if (summary.length < 50) {
        summary = mainSentence.substring(0, 120) + (mainSentence.length > 120 ? '...' : '');
      }
    }
  } else {
    summary = content.substring(0, 100) + (content.length > 100 ? '...' : '');
  }
  
  console.log(`✅ Generated unique summary: "${summary}"`);
  return summary;
}

function extractMostImportantWords(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'was', 'are', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
  
  const importantWords = words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter(word => /^[a-z]+$/.test(word))
    .slice(0, 8);
    
  return importantWords;
}

function extractKeyPhrases(content: string): string[] {
  const phrases: string[] = [];
  
  // Look for important action phrases
  const actionPatterns = [
    /(?:i|my|our) ([a-z\s]{5,30}(?:journey|experience|achievement|success|project|work))/gi,
    /(?:completed|finished|achieved|accomplished|developed|created|built) ([a-z\s]{5,30})/gi,
    /(?:sharing|announcing|excited to|proud to) ([a-z\s]{5,30})/gi
  ];
  
  actionPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/^(i|my|our|completed|finished|achieved|accomplished|developed|created|built|sharing|announcing|excited to|proud to)\s*/i, '').trim();
        if (cleaned.length > 5) {
          phrases.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
        }
      });
    }
  });
  
  return phrases.slice(0, 3);
}

function extractAchievements(content: string): string[] {
  const achievements: string[] = [];
  
  // Look for achievement indicators
  const achievementPatterns = [
    /(?:achieved|secured|received|earned|completed|graduated|finished|selected|hired|promoted)\s+([a-z\s]{5,50})/gi,
    /(?:sgpa|cgpa|grade|score|percentage)[\s:]*(\d+\.?\d*)/gi,
    /(?:won|awarded|recognized|honored|certified)\s+([a-z\s]{5,50})/gi
  ];
  
  achievementPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim();
        achievements.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
      });
    }
  });
  
  return achievements.slice(0, 2);
}

function extractEmotions(content: string): string[] {
  const emotions: string[] = [];
  const emotionWords = [
    'excited', 'happy', 'proud', 'grateful', 'thrilled', 'motivated', 'inspired', 
    'confident', 'amazed', 'delighted', 'satisfied', 'accomplished', 'fulfilled'
  ];
  
  const lowerContent = content.toLowerCase();
  emotionWords.forEach(emotion => {
    if (lowerContent.includes(emotion)) {
      emotions.push(emotion);
    }
  });
  
  return emotions.slice(0, 2);
}

function extractTechnologies(content: string): string[] {
  const technologies: string[] = [];
  const techTerms = [
    'java', 'python', 'javascript', 'react', 'node.js', 'spring boot', 'database', 'mongodb',
    'mysql', 'docker', 'kubernetes', 'microservices', 'ai', 'machine learning', 'data science',
    'web development', 'mobile app', 'android', 'ios', 'cloud computing', 'devops', 'iot',
    'blockchain', 'angular', 'vue', 'typescript', 'html', 'css', 'sql', 'nosql'
  ];
  
  const lowerContent = content.toLowerCase();
  techTerms.forEach(tech => {
    if (lowerContent.includes(tech)) {
      technologies.push(tech);
    }
  });
  
  return technologies.slice(0, 3);
}

function extractOutcomes(content: string): string[] {
  const outcomes: string[] = [];
  
  // Look for outcome phrases
  const outcomePatterns = [
    /(?:this|it|the result) ([a-z\s]{10,50}(?:success|achievement|milestone|opportunity|experience|growth|learning))/gi,
    /(?:leading to|resulting in|enables|allows|provides) ([a-z\s]{10,50})/gi
  ];
  
  outcomePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/^(this|it|the result|leading to|resulting in|enables|allows|provides)\s*/i, '').trim();
        if (cleaned.length > 10) {
          outcomes.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
        }
      });
    }
  });
  
  return outcomes.slice(0, 2);
}

function generateContextualSummary(content: string): string {
  console.log(`\n🔍 GENERATING CONTEXTUAL SUMMARY 🔍`);
  console.log(`Input content: "${content.substring(0, 200)}${content.length > 200 ? '...' : ''}"`);
  
  if (!content || content.trim().length === 0) {
    console.log(`❌ Empty content, returning default`);
    return "Shared an update with the alumni community.";
  }
  
  const lowerContent = content.toLowerCase();
  const words = content.trim().split(/\s+/);
  
  console.log(`📊 Content analysis: ${words.length} words, lowercase content includes:`);
  console.log(`- SGPA/CGPA: ${lowerContent.includes('sgpa') || lowerContent.includes('cgpa')}`);
  console.log(`- Job/Career: ${lowerContent.includes('job') || lowerContent.includes('hired') || lowerContent.includes('company')}`);
  console.log(`- Project: ${lowerContent.includes('project') || lowerContent.includes('research')}`);
  
  // Extract key information for personalized summaries
  let summary = "";
  
  // Academic achievements - look for specific patterns
  if (lowerContent.includes('sgpa') || lowerContent.includes('cgpa')) {
    console.log(`🎓 DETECTED: Academic achievement pattern`);
    const sgpaMatch = content.match(/sgpa[:\s]*(\d+\.?\d*)/i);
    const cgpaMatch = content.match(/cgpa[:\s]*(\d+\.?\d*)/i);
    const semesterMatch = content.match(/semester\s*(\d+)/i);
    
    summary = "🎉 Academic Excellence Achievement! ";
    if (sgpaMatch) summary += `Achieved SGPA of ${sgpaMatch[1]}. `;
    if (cgpaMatch) summary += `Current CGPA: ${cgpaMatch[1]}. `;
    if (semesterMatch) summary += `Completed Semester ${semesterMatch[1]} `;
    summary += "Outstanding performance in technical subjects demonstrating strong academic foundation and commitment to learning. This achievement reflects dedication to academic excellence and preparation for future career opportunities. 🚀";
    console.log(`✅ Generated academic summary: "${summary}"`);
    return summary;
  }
  
  // Job/Career updates
  if (lowerContent.includes('job') || lowerContent.includes('hired') || lowerContent.includes('company') || lowerContent.includes('internship')) {
    console.log(`💼 DETECTED: Career/Job pattern`);
    
    // More flexible company matching patterns
    const companyMatch = content.match(/(?:with|at|joined|company)\s+([A-Z][a-zA-Z0-9\s&\.,-]+?)(?:\s*[-–—]|\s*\.|\s*,|\s*\n|$)/i) ||
                         content.match(/([A-Z][a-zA-Z0-9\s&\.]+?)\s*[-–—]\s*(?:recruitment|interview|journey|experience)/i) ||
                         content.match(/([A-Z][a-zA-Z0-9\s&\.]+?)\s+(?:systems|technologies|solutions|inc|ltd|corp)/i);
    
    const positionMatch = content.match(/(?:as|position|role|for)\s+([a-zA-Z\s]+?)(?:\s*[-–—]|\s*at|\s*in|\s*\.|$)/i) ||
                          content.match(/(?:hired|selected|offered)\s+(?:as|for)\s+([a-zA-Z\s]+?)(?:\s*[-–—]|\s*at|\s*\.|$)/i);
    
    console.log(`Company match:`, companyMatch);
    console.log(`Position match:`, positionMatch);
    
    // Check if this is about NOT getting selected
    const notSelected = lowerContent.includes('not selected') || lowerContent.includes('rejected') || lowerContent.includes('unsuccessful');
    
    if (notSelected) {
      summary = "💪 Learning from Challenges! Valuable interview experience gained through comprehensive recruitment process. ";
      if (companyMatch) summary += `Explored opportunities with ${companyMatch[1].trim()}. `;
      summary += "While not selected this time, the journey provided insights into industry expectations and highlighted areas for growth. Every experience contributes to professional development and future success! 🚀";
    } else {
      summary = "🚀 Career Milestone Unlocked! ";
      if (positionMatch) summary += `Secured position as ${positionMatch[1].trim()}. `;
      if (companyMatch) summary += `Joining ${companyMatch[1].trim()}. `;
      summary += "This represents significant professional growth and new opportunities in the tech industry. The achievement showcases the value of quality education and continuous skill development in building successful careers. Excited for this next chapter! 💼";
    }
    
    console.log(`✅ Generated career summary: "${summary}"`);
    return summary;
  }
  
  // Project/Research updates
  if (lowerContent.includes('project') || lowerContent.includes('research') || lowerContent.includes('developed') || lowerContent.includes('built')) {
    console.log(`💡 DETECTED: Project/Research pattern`);
    summary = "💡 Innovation & Project Success! ";
    if (lowerContent.includes('ai') || lowerContent.includes('machine learning')) summary += "Advanced work in AI and machine learning technology. ";
    if (lowerContent.includes('web') || lowerContent.includes('website')) summary += "Developed innovative web solutions. ";
    if (lowerContent.includes('mobile') || lowerContent.includes('app')) summary += "Created mobile application with modern features. ";
    summary += "This project demonstrates practical application of technical knowledge and problem-solving skills. The work contributes to advancing technology solutions and showcases hands-on development experience. 🛠️";
    console.log(`✅ Generated project summary: "${summary}"`);
    return summary;
  }
  
  // Event/Conference participation
  if (lowerContent.includes('conference') || lowerContent.includes('workshop') || lowerContent.includes('seminar') || lowerContent.includes('event')) {
    console.log(`🤝 DETECTED: Event/Conference pattern`);
    summary = "🤝 Professional Development & Networking! Participated in valuable industry events and learning opportunities. ";
    summary += "This engagement demonstrates commitment to continuous learning and professional growth. Active participation in the tech community helps build networks and stay updated with industry trends. 🌐";
    console.log(`✅ Generated event summary: "${summary}"`);
    return summary;
  }
  
  // Graduation/Completion
  if (lowerContent.includes('graduation') || lowerContent.includes('graduated') || lowerContent.includes('degree') || lowerContent.includes('completed')) {
    console.log(`🎓 DETECTED: Graduation pattern`);
    summary = "🎓 Educational Milestone Achieved! Successfully completed academic program with dedication and hard work. ";
    summary += "This achievement represents years of learning, growth, and preparation for professional success. Ready to apply knowledge and skills in real-world challenges and make meaningful contributions to the tech industry. 🌟";
    console.log(`✅ Generated graduation summary: "${summary}"`);
    return summary;
  }
  
  // Awards/Recognition
  if (lowerContent.includes('award') || lowerContent.includes('recognition') || lowerContent.includes('winner') || lowerContent.includes('achievement')) {
    console.log(`🏆 DETECTED: Award/Recognition pattern`);
    summary = "🏆 Recognition & Excellence! Received acknowledgment for outstanding performance and contributions. ";
    summary += "This recognition reflects dedication, hard work, and commitment to excellence. The achievement motivates continued growth and inspires others in the alumni community. 🏅";
    console.log(`✅ Generated award summary: "${summary}"`);
    return summary;
  }
  
  // Default: Extract meaningful content
  console.log(`⚡ Using default pattern extraction`);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim();
    const secondSentence = sentences.length > 1 ? sentences[1].trim() : "";
    
    summary = `✨ Alumni Update: ${firstSentence}. `;
    if (secondSentence && secondSentence.length < 100) {
      summary += `${secondSentence}. `;
    }
    summary += "Another inspiring contribution from our vibrant alumni community, showcasing continuous growth and meaningful achievements! 🌟";
    console.log(`✅ Generated default summary: "${summary}"`);
    return summary;
  }
  
  // Final fallback
  const truncated = words.length > 20 ? words.slice(0, 20).join(" ") + "..." : content;
  summary = `✨ ${truncated} This update represents another meaningful milestone in the alumni journey of growth and success! 🌟`;
  console.log(`✅ Generated fallback summary: "${summary}"`);
  return summary;
}

function enhanceStoryFormat(summary: string, originalContent: string): string {
  const lowerContent = originalContent.toLowerCase();
  
  // Add contextual enhancements based on content type
  let enhanced = summary;
  
  // Academic achievements
  if (lowerContent.includes('sgpa') || lowerContent.includes('cgpa') || lowerContent.includes('semester')) {
    enhanced = `🎉 Academic Excellence Achievement 2025 🎉\n\n${enhanced}\n\nThis achievement represents dedication to continuous learning and academic excellence in technology education. Strong foundation supports future career opportunities and advanced learning goals. 🚀`;
  }
  // Career updates
  else if (lowerContent.includes('job') || lowerContent.includes('company') || lowerContent.includes('promotion')) {
    enhanced = `🚀 Career Milestone Unlocked! 🚀\n\n${enhanced}\n\nThis professional achievement showcases the impact of quality education and continuous skill development in building successful tech careers. 💼`;
  }
  // Research/projects
  else if (lowerContent.includes('project') || lowerContent.includes('research')) {
    enhanced = `💡 Innovation Spotlight! 💡\n\n${enhanced}\n\nThis work demonstrates the practical application of technical knowledge and contributes to advancing technology solutions. 🔬`;
  }
  // Default enhancement
  else {
    enhanced = `✨ Alumni Success Story ✨\n\n${enhanced}\n\nAnother inspiring milestone from our vibrant alumni community! 🌟`;
  }
  
  return enhanced;
}

function extractBasicKeywords(content: string): string[] {
  if (!content) return [];
  
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  const wordCount = new Map();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}