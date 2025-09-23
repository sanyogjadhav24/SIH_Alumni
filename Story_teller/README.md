# Story Teller - AI Post Analyzer

A Next.js web application that analyzes post images and text to generate AI-powered summaries using **free** multimodal machine learning models from Hugging Face.

## ✨ Features

- **🖼️ Image Analysis**: Upload images to get AI-generated descriptions and insights
- **📝 Text Analysis**: Analyze text content for sentiment and key topics  
- **🤖 Structured Summarization**: Creates title (1 sentence) + subtitle (3 lines) format
- **🎯 Context-Aware**: Specially optimized for recruitment stories, academic achievements, coding competitions, and tech content
- **⚡ Real-time Processing**: Fast analysis with intelligent fallback systems
- **🎨 Beautiful UI**: Clean, responsive interface with structured summary display
- **🆓 No Setup Required**: Works immediately without API keys or configuration

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **AI Models**: Free Hugging Face Inference API
  - Image Captioning: `nlpconnect/vit-gpt2-image-captioning`
  - Text Summarization: `facebook/bart-large-cnn`
  - Sentiment Analysis: `cardiffnlp/twitter-roberta-base-sentiment-latest`
  - Topic Extraction: `facebook/bart-large-mnli` (zero-shot classification)
- **File Handling**: Built-in FormData with image processing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- **No API keys required!** The app uses free Hugging Face Inference API endpoints

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Story_teller
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Ready to use!** No environment setup required:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The app uses free Hugging Face Inference API endpoints that don't require authentication. For production use or higher rate limits, you can optionally add a Hugging Face API key to `.env.local`.

### Building for Production

```bash
npm run build
npm start
```

## 🎯 Structured Summary Examples

### **CODE-A-THON Competition:**
```
🌟 CODE-A-THON 2025 Coding Competition Journey 🌟

From among 500+ participants, cleared multiple competitive programming rounds.
Reached the final coding stage but encountered technical challenges during execution.
This experience highlighted the importance of thorough testing and mental preparation. 🚀
```

### **Recruitment Experience:**
```
💼 NICE Systems Recruitment Experience 2025 💼

Completed all 5 rounds including technical interviews, coding assessments, and HR discussions.
Received feedback about being overqualified for the 8 LPA position offered.
This recognition of advanced skills opens pathways to higher-level opportunities. 🚀
```

### **Academic Achievement:**
```
🎉 Academic Excellence Achievement 2025 🎉

Achieved outstanding academic performance with SGPA 8.96 and CGPA 8.73.
This semester involved mastering diverse technical subjects and practical applications.
Strong academic foundation supports future career opportunities and advanced learning goals. 🚀
```

## API Endpoints

### POST /api/analyze

Analyzes uploaded content (image and/or text) and returns:

**Request:**
- `image` (File, optional): Image file to analyze
- `text` (string, optional): Text content to analyze

**Response:**
```json
{
  "summary": "AI-generated summary of the content",
  "sentiment": "Positive/Negative/Neutral",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "confidence": 0.85
}
```

## Usage

1. **Upload an Image**: Click the upload area or drag and drop an image
2. **Add Text**: Enter any text content related to your post
3. **Analyze**: Click "Analyze Content" to process the input
4. **View Results**: See the generated summary, sentiment analysis, key topics, and confidence score

## Supported Image Formats

- PNG
- JPG/JPEG  
- GIF
- Maximum file size: 5MB

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HUGGINGFACE_API_KEY` | Hugging Face API key for higher rate limits | No |

**Note**: The application works completely without any API keys using free public inference endpoints.

### Model Configuration

The application uses several AI models that can be configured in `/src/app/api/analyze/route.ts`:

- **Image Captioning**: Change the model in the `imageToText` call
- **Sentiment Analysis**: Modify the sentiment classification model
- **Summarization**: Update the summarization model

## Customization

### Adding New AI Models

1. Install additional model libraries
2. Update the API route in `/src/app/api/analyze/route.ts`
3. Modify the response interface if needed

### Styling

The application uses Tailwind CSS. Customize the appearance by:
- Editing `/src/app/globals.css` for global styles
- Modifying component classes in `/src/components/PostAnalyzer.tsx`
- Updating the Tailwind config in `tailwind.config.ts`

## Performance Considerations

- Images are processed client-side before upload
- Large images are automatically resized
- API responses are cached where possible
- Consider implementing rate limiting for production use

## Troubleshooting

### Common Issues

1. **Slow Analysis**: The free Hugging Face Inference API may have longer response times during peak usage
2. **Rate Limiting**: Free endpoints have usage limits; add an API key for higher quotas
3. **Model Loading**: First requests to models may take longer as they "warm up"

### Debug Mode

The API returns debug information to help troubleshoot issues. Check the browser console for detailed information about model responses.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Hugging Face for providing excellent AI models
- Next.js team for the amazing framework
- Open source community for the various libraries used