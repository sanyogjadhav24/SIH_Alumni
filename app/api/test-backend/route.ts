import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing backend connection...');
    
    // Test basic backend connectivity
    const testResponse = await fetch('http://localhost:4000/api/posts/user/test123', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    console.log(`Backend test response: ${testResponse.status}`);
    const testData = await testResponse.text();
    console.log(`Backend test data: ${testData}`);

    return NextResponse.json({
      status: 'Backend connectivity test',
      backendStatus: testResponse.status,
      backendResponse: testData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Backend test failed:', error);
    return NextResponse.json(
      { 
        error: 'Backend test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}